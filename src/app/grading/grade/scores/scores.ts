import { Component, computed, inject } from '@angular/core';
import { Store } from '../../store/store';
import { GradingService } from '../../services/grading.service';
import { SchemeQuestionSectionScoreScoreDB } from '../../model/types';
import { AnnotationToApply } from '../../store/model/types';
import { PopoverModule } from 'primeng/popover';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-scores',
  imports: [PopoverModule],
  templateUrl: './scores.html',
  styleUrl: './scores.css',
})
export class Scores {
  private _store = inject(Store)
  private _gradingService = inject(GradingService)
  private _toast = inject(HotToastService)

  store = computed(() => this._store.store())
  currentQuestion = computed(() => this.store().currentQuestion)
  correctScores = computed(() => this.currentQuestion()?.sectionCorrectScores)
  penaltyScores = computed(() => this.currentQuestion()?.sectionPenaltyScores)
  violationScores = computed(() => this.currentQuestion()?.sectionViolationScores)

  totalViolationMaxOccurrences = computed(() => this.violationScores()?.reduce((sum, item) => sum + item.max_occurrence, 0) ?? 0)
  totalViolationUsedScores = computed(() => this.violationScores()?.reduce((sum, item) => sum + item.usage, 0) ?? 0)

  totalPenaltyMaxOccurrences = computed(() => this.penaltyScores()?.reduce((sum, item) => sum + item.max_occurrence, 0) ?? 0)
  totalPenaltyUsedScores = computed(() => this.penaltyScores()?.reduce((sum, item) => sum + item.usage, 0) ?? 0)

  totalCorrectMaxOccurrences = computed(() => this.correctScores()?.reduce((sum, item) => sum + item.max_occurrence, 0) ?? 0)
  totalCorrectUsedScores = computed(() => this.correctScores()?.reduce((sum, item) => sum + item.usage, 0) ?? 0)

  currentPageIsBlank = computed(() => this._gradingService.currentPageIsBlank())

  applySectionScore(gradeScore: number, score: SchemeQuestionSectionScoreScoreDB) {
    if (this.currentPageIsBlank()) {
      this._toast.error('You cannot apply score to a blank page', { position: 'bottom-center' })
      return
    }

    if (this.store().canvas.selectedMeasuringToolsSet.size > 0) {
      this._toast.error('Please remove all measuring tools before applying a score', { position: 'bottom-center' })
      return
    }


    this._gradingService.annotationToApply.update(ann => ({
      ...ann,
      gradeScore,
      score
    }) as AnnotationToApply)

    this._toast.success('Score selected for grading', { position: 'bottom-center' })
  }
}
