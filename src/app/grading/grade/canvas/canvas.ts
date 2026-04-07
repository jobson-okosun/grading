import { Component, computed, effect, inject, signal } from '@angular/core';
import { CanvasService } from './sevices/canvas.service';
import { Store } from '../../store/store';
import { DrawingStoreEvent } from './sevices/event.service';
import { DrawingAndWritingStore } from './sevices/canvas-store';
import { Store as DrawingStore } from './model/store.mode'
import { QuestionAnnotation } from '../../model/types';
import { AnnotationIdentity } from '../../store/model/types';
import { GradingService } from '../../services/grading.service';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
})
export class Canvas {
  private _store = inject(Store)
  private _canvasService = inject(CanvasService)
  private _drawingStoreEvent = inject(DrawingStoreEvent)
  private _drawingStore = inject(DrawingAndWritingStore)
  private _gradingService = inject(GradingService)

  store = computed(() => this._store.store())
  currentQuestionIndex = computed(() => this.store().currentQuestionIndex)
  currentQuestion = computed(() => this.store().currentQuestion)
  currentQuestionId = signal<string | null>(null)
  hasResponse = computed(() => this.currentQuestion()?.question.item_score.un_graded_response.length)

  questionChanged = effect(() => {
    if (this.currentQuestion()?.question.item.id !== this.currentQuestionId()) {
      this.currentQuestionId.set(this.currentQuestion()?.question.item.id!)

      this._drawingStoreEvent._questionChanged$.next(true)
      setTimeout(() => { this.prepareCanvasAndStoreDataOnLoad() })
    }
  })

  currentPageIsBlank = computed(() => this._gradingService.currentPageIsBlank())

  prepareCanvasAndStoreDataOnLoad() {
    const currentQuestion = this.store().currentQuestion

    if (this.hasResponse()) {
      const jsonResponse = JSON.parse(currentQuestion!.question.item_score.un_graded_response[0]) as DrawingStore
      const annotationsTosave: QuestionAnnotation[] = []

      jsonResponse.pages.forEach((page, index) => {
        (currentQuestion?.question.item_score?.annotations ?? [])
          .map(ann => {
            let annotation = new QuestionAnnotation()
            const annotationIdentity = new AnnotationIdentity()
            const localIdentity = JSON.parse(ann.comment) as AnnotationIdentity

            annotation = {
              ...annotation,
              ...ann,
              identity: {
                ...annotationIdentity,
                ...localIdentity
              }
            }

            annotationsTosave.push(annotation)
          })
      })

      if (annotationsTosave.length) {
        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]
        question.annotations = annotationsTosave

        this._store.updateStore({ questions })
      }

      const storeData = { ...jsonResponse, currentPage: 0 }
      this._drawingStore.updateStore(storeData)
    }


    const backgroundType = this.store().currentQuestion?.question.item.backgroundType as any
    this._canvasService.backgroundType.set(backgroundType)
    this._drawingStoreEvent._backgroundChange$.next(backgroundType)
    this._canvasService.initializeCanvas()
  }
}
