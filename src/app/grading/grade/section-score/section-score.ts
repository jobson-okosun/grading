import { Component, computed, inject } from '@angular/core';
import { Store } from '../../store/store';
import { GradingService } from '../../services/grading.service';

@Component({
  selector: 'app-section-score',
  imports: [],
  templateUrl: './section-score.html',
  styleUrl: './section-score.css',
})
export class SectionScore {
  private _store = inject(Store)
  private _gradingService = inject(GradingService)

  store = computed(() => this._store.store())
  currentQuestion = computed(() => this.store().currentQuestion)
  gradeSummary = computed(() => this._gradingService.gradeSummary())
  currentQuestionSummary = computed(() => this.gradeSummary().find(x => x.id == this.currentQuestion()?.question.item.id))
}
