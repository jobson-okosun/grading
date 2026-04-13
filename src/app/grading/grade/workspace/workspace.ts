import { Component, computed, inject, signal } from '@angular/core';
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

  markTypes = signal(SchemeMarkCategory)
  currentPage = computed(() => this._drawingStore.store().currentPage)
  highlightedAnnotation = computed(() => this._gradingService.highlightedAnnotation())
  annotationShapes = computed(() => this._gradingService.annotationShapes())

  store = computed(() => this._store.store())
  annotationToApply = computed(() => this._gradingService.annotationToApply())
  currentPageIsBlank = computed(() => this._gradingService.currentPageIsBlank())

  useConstraints = computed(() => this._gradingService.useConstraints())
  currentQuestionSectionsAnnotations = computed(() => this._gradingService.currentQuestionSectionsAnnotations())

  currentPageAnnotations = computed(() => {
    if (!this.currentQuestionSectionsAnnotations()) {
      return []
    }

    return this.currentQuestionSectionsAnnotations()?.map(section => section.annotations).flat().filter(ann => ann.page == this.currentPage())
  })

  getAnnotationOffsetX(annotation: QuestionAnnotation): number {
    switch (annotation.identity.shape) {
      case this.annotationShapes().RING:
        return 35
      case this.annotationShapes().UNDERLINE:
        return 40
      case this.annotationShapes().X:
        return 42
      case this.annotationShapes().NONE:
        return 25
      case this.annotationShapes().CHECK:
        return 25
      case this.annotationShapes().BAN:
        return 42
    }
  }

  getAnnotationOffsetY(annotation: QuestionAnnotation): number {
    switch (annotation.identity.shape) {
      case this.annotationShapes().RING:
        return 25
      case this.annotationShapes().UNDERLINE:
        return 10
      case this.annotationShapes().X:
        return 25
      case this.annotationShapes().NONE:
        return 25
      case this.annotationShapes().CHECK:
        return 25
      case this.annotationShapes().BAN:
        return 25
    }
  }


  onPageClick(event: Event) {
    if (this.currentPageIsBlank()) {
      return
    }

    if (this.highlightedAnnotation()) {
      this._gradingService.unHighlightCurrentQuestionnnotations()
      return
    }

    this._gradingService.unHighlightCurrentQuestionnnotations()

    if (this.store().canvas.selectedMeasuringToolsSet.size > 0) {
      return
    }

    const x = (event as MouseEvent).offsetX;
    const y = (event as MouseEvent).offsetY;

    this.applySectionScore([x.toString(), y.toString()])
  }

  applySectionScore(position: string[]) {
    if (!this.useConstraints()) {
      this._toast.error("Cannot apply score on this page", { position: 'bottom-center' })
      return
    }

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
