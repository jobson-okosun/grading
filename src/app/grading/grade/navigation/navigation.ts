import { Component, computed, inject } from '@angular/core';
import { Store } from '../../store/store';
import { DrawingAndWritingStore } from '../canvas/sevices/canvas-store';

@Component({
  selector: 'app-navigation',
  imports: [],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  private _store = inject(Store)
  private _drawingStore = inject(DrawingAndWritingStore)

  store = computed(() => this._store.store())
  currentQuestionPagesNavigationResolved = computed(() => this.store().currentQuestion?.question.pages.every(p => p.allowNavigation))

  nextQuestion() {
    if (this.store().currentQuestionIndex < this.store().questions.length - 1) {
      this._store.updateStore({ currentQuestionIndex: this.store().currentQuestionIndex + 1 })
    }
  }

  previousQuestion() {
    if (this.store().currentQuestionIndex > 0) {
      this._store.updateStore({ currentQuestionIndex: this.store().currentQuestionIndex - 1 })
    }
  }
}
