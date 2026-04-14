import { Component, computed, inject, input, signal } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { Overview } from './overview/overview';
import { Scores } from "./scores/scores";
import { Paginator } from './paginator/paginator';
import { Navigation } from './navigation/navigation';
import { Tools } from './tools/tools';
import { Workspace } from "./workspace/workspace";
import { Status } from "./status/status";
import { SectionScore } from './section-score/section-score';
import { CandidateProfile } from './candidate-profile/candidate-profile';
import { DataService } from '../services/data.service';
import { Canvas } from './canvas/canvas';
import { GradingService } from '../services/grading.service';
import { CurrentQuestion } from './current-question/current-question';
import { Question } from './question/question';
import { Store } from '../store/store';
import { CanvasService } from './canvas/sevices/canvas.service';
import { ConfirmationService } from 'primeng/api';
import { DrawingAndWritingStore } from './canvas/sevices/canvas-store';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-grade',
  imports: [Overview, Scores, Paginator, Navigation, Tools, Workspace, Status, SectionScore, CandidateProfile, Canvas, CurrentQuestion, Question],
  templateUrl: './grade.html',
  styleUrl: './grade.css',
})
export default class Grade {
  private _configService = inject(ConfigService)
  private _dataService = inject(DataService)
  private _gradingService = inject(GradingService)
  private _store = inject(Store)
  private _canvasService = inject(CanvasService)
  private _confirmationService = inject(ConfirmationService)
  private _drawingStore = inject(DrawingAndWritingStore)
  private _toast = inject(HotToastService)

  hasUnsavedChanges = signal(true)
  isLoadingPage = computed(() => this._dataService.isLoadingGuide() || this._dataService.isLoadingQuestions())
  questionSidebarOpen = computed(() => this._configService.questionSidebarOpen())
  store = computed(() => this._store.store())
  questions = computed(() => this.store()?.questions)

  assessmentId = input<string>()
  sectionId = input<string>()
  participantId = input<string>()
  schemeId = input<string>()

  currentQuestion = computed(() => this._gradingService.currentQuestion())
  currentQuestionMarkingGuide = computed(() => this._gradingService.currentQuestionMarkingGuide())

  correctScores = computed(() => this._gradingService.currentQuestionSectionCorrectScores())
  penaltyScores = computed(() => this._gradingService.currentQuestionSectionPenaltyScores())
  violationScores = computed(() => this._gradingService.currentQuestionSectionViolationScores())

  generalCorrectScores = computed(() => this._gradingService.generalCorrectScores())
  generalPenaltyScores = computed(() => this._gradingService.generalPenaltyScores())
  generalViolationScores = computed(() => this._gradingService.generalViolationScores())
  currentQuestionHasResponse = computed(() => this._gradingService.currentQuestionHasResponse())
  currrentQuestionCurrentSection = computed(() => this.currentQuestionMarkingGuide()?.sections?.[this.store().questionCurrentSectionIndex])

  canvasWidth = computed(() => this._canvasService.canvasWidth())
  canvasHeight = computed(() => this._canvasService.canvasHeight())

  currentPageIsBlank = computed(() => this._gradingService.currentPageIsBlank())
  currentPage = computed(() => this._drawingStore.store().currentPage)

  useConstraints = computed(() => this._gradingService.useConstraints())
  gradingStarted = computed(() => this._gradingService.gradingStarted())

  currentQuestionSectionsAnnotations = computed(() => this._gradingService.currentQuestionSectionsAnnotations())
  currentQuestionCurrentSection = computed(() => this.currentQuestionMarkingGuide()?.sections?.[this.store().questionCurrentSectionIndex])

  hasAnyScore = computed(() => {
    if (!this.correctScores() || !this.penaltyScores() || !this.violationScores()) {
      return false
    }

    return this.correctScores()!.length > 0 || this.penaltyScores()!.length > 0 || this.violationScores()!.length > 0
  })

  hasAnyGeneralScore = computed(() => {
    if (!this.generalCorrectScores() || !this.generalPenaltyScores() || !this.generalViolationScores()) {
      return false
    }

    return this.generalCorrectScores()!.length > 0 || this.generalPenaltyScores()!.length > 0 || this.generalViolationScores()!.length > 0
  })

  ngOnInit() {
    this._dataService.fetchAllGradingData()
    this.getPossibleCanvasSize()
  }

  prevSection() {
    if (this.store().questionCurrentSectionIndex > 0) {
      this._store.updateStore({ questionCurrentSectionIndex: this.store().questionCurrentSectionIndex - 1 })
    }
  }

  nextSection() {
    if (this.store().questionCurrentSectionIndex < (this._gradingService.currentQuestionMarkingGuide()?.sections?.length ?? 0) - 1) {

      const nextQuestionPageAnnotations = this.store().questions[this.store().currentQuestionIndex + 1].annotations.filter(ann => ann.page == this.currentPage())
      if (nextQuestionPageAnnotations.length) {
        this._store.updateStore({ questionCurrentSectionIndex: this.store().questionCurrentSectionIndex + 1 })
        return
      }

      if (!this.useConstraints()) {
        this._store.updateStore({ questionCurrentSectionIndex: this.store().questionCurrentSectionIndex + 1 })
        return
      }

      if (!this.gradingStarted()) {
        this._toast.error('Please start grading before moving to the next section', { position: 'bottom-center' })
        return
      }

      if (this.currentQuestionSectionsAnnotations()[this.store().questionCurrentSectionIndex + 1]?.annotations?.length) {
        this._store.updateStore({ questionCurrentSectionIndex: this.store().questionCurrentSectionIndex + 1 })
        return
      }

      const nextSectionName = this.currentQuestionMarkingGuide()?.sections?.[this.store().questionCurrentSectionIndex + 1]?.name

      this._confirmationService.confirm({
        header: 'Grade Section',
        message: `Are you sure you want to grade section ${nextSectionName}?`,
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
        accept: () => {
          this._store.updateStore({ questionCurrentSectionIndex: this.store().questionCurrentSectionIndex + 1 })
        }
      })
    }
  }

  getPossibleCanvasSize() {
    const workspaceContainer = document.querySelector('.workspace-container') as HTMLElement;
    if (!workspaceContainer) {
      return
    }

    this._store.updateStore({
      canvas: {
        ...this.store().canvas,
        onLoadWidth: workspaceContainer.offsetWidth,
        onLoadHeight: workspaceContainer.offsetHeight
      }
    })
  }
}
