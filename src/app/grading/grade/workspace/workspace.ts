import { Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '../../store/store';
import { GradingService } from '../../services/grading.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { AnnotationToApply } from '../../store/model/types';
import { QuestionAnnotation, SchemeMarkCategory } from '../../model/types';
import { DrawingAndWritingStore } from '../canvas/sevices/canvas-store';

@Component({
  selector: 'app-workspace',
  imports: [],
  templateUrl: './workspace.html',
  styleUrl: './workspace.css',
})
export class Workspace {
  private _store = inject(Store)
  private _gradingService = inject(GradingService)
  private _toast = inject(HotToastService)
  private _drawingStore = inject(DrawingAndWritingStore)

  currentQuestion = computed(() => this.store().currentQuestion)
  currentPageAnnotations = signal<QuestionAnnotation[]>([])
  markTypes = signal(SchemeMarkCategory)
  currentPage = computed(() => this._drawingStore.store().currentPage)
  highlightedAnnotation = computed(() => this._gradingService.highlightedAnnotation())

  store = computed(() => this._store.store())
  annotationToApply = computed(() => this._gradingService.annotationToApply())
  currentPageIsBlank = computed(() => this._gradingService.currentPageIsBlank())


  constructor() {
    effect(() => {
      if (this.store()) {
        const questionAnnotations = this.store().questions[this.store().currentQuestionIndex].annotations;

        if (!questionAnnotations?.length) {
          this.currentPageAnnotations.set([])
          return
        }

        const pageAnnotations = questionAnnotations.filter(ann => ann.page == this.currentPage())
        this.currentPageAnnotations.set(pageAnnotations)
      }
    })
  }


  onPageClick(event: Event) {
    if (this.currentPageIsBlank()) {
      return
    }

    this._gradingService.unHighlightCurrentQuestionnnotations()

    if (this.store().canvas.selectedMeasuringToolsSet.size > 0) {
      return
    }

    if (this.highlightedAnnotation()) {
      return
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (event as MouseEvent).clientX - rect.left;
    const y = (event as MouseEvent).clientY - rect.top;

    this.applySectionScore([x.toString(), y.toString()])
  }

  applySectionScore(position: string[]) {
    if (!position[0] || !position[1]) {
      return
    }

    if (!this.annotationToApply()?.score) {
      this._toast.error("Please select a score to apply", { position: 'bottom-center' })
      return
    }

    if (!this.annotationToApply()?.section) {
      this._toast.error("Please select a section to apply", { position: 'bottom-center' })
      return
    }

    this._gradingService.annotationToApply.update(ann => ({
      ...ann,
      position
    } as AnnotationToApply))
  }

  selectAnnotation(item: QuestionAnnotation, event: MouseEvent) {
    event.stopPropagation();
    this._gradingService.highlightAnnotation(item)
  }
}
