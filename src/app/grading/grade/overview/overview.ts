import { Component, computed, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { GradingService } from '../../services/grading.service';
import { Store } from '../../store/store';
import { DrawingStoreEvent } from '../canvas/sevices/event.service';

@Component({
  selector: 'app-overview',
  imports: [],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  private _configService = inject(ConfigService)
  private _gradingService = inject(GradingService)
  private _drawingStoreEvent = inject(DrawingStoreEvent)
  private _store = inject(Store)

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


  toggleQuestionSidebar() {
    this._configService.questionSidebarOpen.set(!this._configService.questionSidebarOpen())
    this._drawingStoreEvent._layoutSub$.next()
  }
}
