import { Component, computed, inject, input } from '@angular/core';
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

  questionSidebarOpen = computed(() => this._configService.questionSidebarOpen())
  store = computed(() => this._store.store())
  questions = computed(() => this.store()?.questions)

  assessmentId = input<string>()
  sectionId = input<string>()
  participantId = input<string>()
  schemeId = input<string>()

  currentQuestion = computed(() => this.store().currentQuestion)
  correctScores = computed(() => this.currentQuestion()?.sectionCorrectScores)
  penaltyScores = computed(() => this.currentQuestion()?.sectionPenaltyScores)
  violationScores = computed(() => this.currentQuestion()?.sectionViolationScores)
  currrentQuestionCurrentSection = computed(() => this.currentQuestion()?.gradingGuide?.sections?.[this.store().questionCurrentSectionIndex])

  hasAnyScore = computed(() => {
    if (!this.correctScores() || !this.penaltyScores() || !this.violationScores()) {
      return false
    }

    return this.correctScores()!.length > 0 || this.penaltyScores()!.length > 0 || this.violationScores()!.length > 0
  })

  ngOnInit() {
    this._dataService.assessmentId.set(this.assessmentId()!)
    this._dataService.sectionId.set(this.sectionId()!)
    this._dataService.schemeId.set(this.schemeId()!)
    this.fetchPageData()
    this.getPossibleCanvasSize()
  }

  fetchPageData() {
    this._dataService.fetchMarkingGuide().subscribe()
    this._dataService.fetchQuestions().subscribe()
    this._dataService.fetchCandidateResult().subscribe()
  }

  prevSection() {
    if (this.store().questionCurrentSectionIndex > 0) {
      this._store.updateStore({ questionCurrentSectionIndex: this.store().questionCurrentSectionIndex - 1 })
    }
  }

  nextSection() {
    if (this.store().questionCurrentSectionIndex < (this.store().currentQuestion?.gradingGuide?.sections?.length ?? 0) - 1) {
      this._store.updateStore({ questionCurrentSectionIndex: this.store().questionCurrentSectionIndex + 1 })
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
