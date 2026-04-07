import { Component, computed, inject } from '@angular/core';
import { GradingService } from '../../services/grading.service';
import { DrawingAndWritingStore } from '../canvas/sevices/canvas-store';
import { Store } from '../../store/store';

@Component({
  selector: 'app-status',
  imports: [],
  templateUrl: './status.html',
  styleUrl: './status.css',
})
export class Status {
  private _gradingService = inject(GradingService)
  private _drawingStore = inject(DrawingAndWritingStore)
  private _store = inject(Store)

  annotationToApply = computed(() => this._gradingService.annotationToApply())
  currentPage = computed(() => this._drawingStore.store().currentPage)
  totalPages = computed(() => this._drawingStore.store().pages.length)
  currentQuestionIndex = computed(() => this._store.store().currentQuestionIndex)
  totalQuestions = computed(() => this._store.store().questions.length)
}
