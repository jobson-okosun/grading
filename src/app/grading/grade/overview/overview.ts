import { Component, computed, inject, model, signal, OnInit, OnDestroy, effect, viewChild, TemplateRef } from '@angular/core';
import { GradingService } from '../../services/grading.service';
import { Store } from '../../store/store';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { DataService } from '../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  imports: [DialogModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnDestroy {
  private _gradingService = inject(GradingService)
  private _store = inject(Store)
  private _confirmationService = inject(ConfirmationService)
  private _dataService = inject(DataService)
  private _toast = inject(HotToastService)
  router = inject(Router)

  private timerInterval: any;
  timeSpentSeconds = signal(0);

  showGradingSummary = model(false)
  isSubmitting = signal(false)

  gradeSummary = computed(() => this._gradingService.gradeSummary())
  totalScore = computed(() => this.gradeSummary().reduce((acc, item) => acc + item.summary.score, 0))
  totalPenalty = computed(() => this.gradeSummary().reduce((acc, item) => acc + item.summary.penalty, 0))
  totalViolation = computed(() => this.gradeSummary().reduce((acc, item) => acc + item.summary.violation, 0))
  totalCorrect = computed(() => this.gradeSummary().reduce((acc, item) => acc + item.summary.correct, 0))

  store = computed(() => this._store.store())
  totalQuestions = computed(() => this.store().questions.length)

  totalVisited = computed(() => this.store().questions.filter(question => question.gradingStatus.visited).length)
  totalNotVisited = computed(() => this.store().questions.filter(question => question.gradingStatus.notVisited).length)
  totalBlanks = computed(() => this.store().questions.reduce((acc, question) => acc + question.gradingStatus.blanks, 0))
  markTypes = computed(() => this._gradingService.markTypes())

  gradingStarted = computed(() => this._gradingService.gradingStarted())

  allQuestionsUngradedSections = viewChild<TemplateRef<any>>('allQuestionsUngradedSections')
  allQuestionsSectionsGraded = computed(() => this._gradingService.allQuestionsSectionsGraded())
  questionsGradedStatus = computed(() => this._gradingService.questionsGradedStatus())
  totalQuestionBySectionsUngraded = computed(() => this.questionsGradedStatus().filter(q => !q.status)?.length)

  allQuestionsUngradedPages = viewChild<TemplateRef<any>>('allQuestionsUngradedPages')
  allQuestionsPagesGraded = computed(() => this._gradingService.allQuestionsPagesGraded())
  questionsPagesStatus = computed(() => this._gradingService.questionsPagesStatus())
  totalQuestionByPagesUngraded = computed(() => this.questionsPagesStatus().filter(q => !q.status)?.length)


  isGradingSeed = computed(() => this._gradingService.isGradingSeed())

  constructor() {
    effect(() => {
      if (this.gradingStarted()) {
        this.startTimer()
      }
    })
  }

  formattedTime = computed(() => {
    const totalSeconds = this.timeSpentSeconds();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  });


  openFinishConfirmation() {
    if (!this.allQuestionsSectionsGraded()) {
      this._toast.show(this.allQuestionsUngradedSections(), {
        position: 'bottom-center',
        data: { questionsGradedStatus: this.questionsGradedStatus(), totalQuestionUngraded: this.totalQuestionBySectionsUngraded() },
        style: { width: '500px', maxWidth: '100%' },
        id: 'allQuestionsUngradedSections'
      })
      return
    }

    if (!this.allQuestionsPagesGraded()) {
      this._toast.show(this.allQuestionsUngradedPages(), {
        position: 'bottom-center',
        data: { questionsGradedStatus: this.questionsPagesStatus(), totalQuestionUngraded: this.totalQuestionByPagesUngraded() },
        style: { width: '500px', maxWidth: '100%' },
        id: 'allQuestionsUngradedPages'
      })
      return
    }

    this._confirmationService.confirm({
      header: 'Finish Grading',
      message: `Are you sure you want to finish grading?`,
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.showGradingSummary.set(true)
      }
    })
  }

  finishGrading() {
    const payload = this._gradingService.formatGradingPayload()
    this.isSubmitting.set(true)
    this._dataService.finishGrading(payload).subscribe({
      next: () => {
        this._toast.success('Grading finished successfully')
        this.showGradingSummary.set(false)
        this.isSubmitting.set(false)
        this.router.navigate(['/grading/overview'])
      },
      error: (error) => {
        this._toast.error(error.error.message ?? 'Sorry! Could not finish grading. Please try again.')
        this.isSubmitting.set(false)
      }
    })
  }

  getSectionScores(questionIndex: number, sectionIndex: number): { correct: number, penalty: number, violation: number, total: number } {
    const questionAnnotations = this.store().questions[questionIndex].annotations;
    const markingGuide = this.store().markingGuide.questions[questionIndex];

    if (!questionAnnotations.length) {
      return {
        correct: 0,
        penalty: 0,
        violation: 0,
        total: 0
      }
    }

    const sectionsAnnotations = markingGuide?.sections.map(section => {
      const sectionAnnotations = questionAnnotations.filter(ann => ann.question_section_id == section.id)
      return {
        section: section.id,
        annotations: sectionAnnotations
      }
    })

    const sectionScores = sectionsAnnotations.map(sectionAnnotation => {

      const sectionAnnotations = sectionAnnotation.annotations.filter(ann => !ann.identity.versioned)
      const correct = sectionAnnotations.filter(ann => ann.mark_category == this.markTypes().SCORE).reduce((acc, ann) => acc + ann.score, 0)
      const penalty = sectionAnnotations.filter(ann => ann.mark_category == this.markTypes().PENALTY).reduce((acc, ann) => acc + ann.score, 0)
      const violation = sectionAnnotations.filter(ann => ann.mark_category == this.markTypes().VIOLATION).reduce((acc, ann) => acc + ann.score, 0)
      const total = correct + penalty + violation

      return {
        correct,
        penalty,
        violation,
        total
      }

    })

    return sectionScores[sectionIndex]
  }

  startGrading() {
    this._store.updateStore({ currentQuestionIndex: 0, questionCurrentSectionIndex: 0 })
    this._gradingService.gradingStarted.set(true)
    this._toast.success('Grading started successfully')
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeSpentSeconds.update(s => s + 1);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

}
