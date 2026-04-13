import { Component, computed, inject } from '@angular/core';
import { DrawingAndWritingStore } from '../canvas/sevices/canvas-store';
import { DrawingStoreEvent } from '../canvas/sevices/event.service';
import { GradingService } from '../../services/grading.service';
import { Store } from '../../store/store';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
})
export class Paginator {
  private _drawingStore = inject(DrawingAndWritingStore)
  private _drawingStoreEvent = inject(DrawingStoreEvent)
  private _gradingService = inject(GradingService)
  private _store = inject(Store)

  store = computed(() => this._store.store())
  pages = computed(() => this._gradingService.currentQuestion()?.pages)
  currentPage = computed(() => this._drawingStore.store().currentPage)

  onPageChange(pageIndex: number) {
    this._drawingStore.selectPage(pageIndex)
    this._drawingStoreEvent._pageSelectEvent$.next()
    this._gradingService.updateQuestionGradingStatus()
  }
}
