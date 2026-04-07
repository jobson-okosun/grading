import { Component, computed, effect, inject } from '@angular/core';
import { GradingService } from '../../services/grading.service';
import { ConfirmationService } from 'primeng/api';
import { Store } from '../../store/store';
import { DrawingAndWritingStore } from '../canvas/sevices/canvas-store';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-tools',
  imports: [],
  templateUrl: './tools.html',
  styleUrl: './tools.css',
})
export class Tools {
  private _gradingService = inject(GradingService)
  private confirmationService = inject(ConfirmationService);
  private _store = inject(Store)
  private _drawingStore = inject(DrawingAndWritingStore)
  private _toast = inject(HotToastService)

  highlightedAnnotation = computed(() => this._gradingService.highlightedAnnotation())
  store = computed(() => this._store.store())
  drawingStore = computed(() => this._drawingStore.store())
  currentPageHasData = computed(() => this.drawingStore()?.pages[this.drawingStore().currentPage]?.strokes?.length > 0)
  currentPageIsBlank = computed(() => this._gradingService.currentPageIsBlank())

  deleteAnnotation() {
    if (!this.highlightedAnnotation()) {
      this._toast.error('Please select a score first', { position: 'bottom-center' })
      return
    }

    if (this.highlightedAnnotation()?.identity.versioned) {
      this._toast.error('This score has already been deleted', { position: 'bottom-center' })
      return
    }


    this.confirmationService.confirm({
      header: 'Delete Score',
      message: 'Are you sure you want to delete this score?',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => this._gradingService.versionAnnotation(),
    });
  }

  markPageAsBlank() {
    if (this.currentPageHasData()) {
      this.confirmationService.confirm({
        header: 'Mark Page as Blank',
        message: 'Page likely contains answers. Are you sure you want to mark it as blank?',
        acceptLabel: 'Mark as Blank',
        rejectLabel: 'Cancel',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
        accept: () => this._gradingService.markPageAsBlank(),
      });
    } else {
      this._gradingService.markPageAsBlank()
    }
  }

  unMarkPagePasBlank() {
    this._gradingService.unMarkPageAsBlank()
  }

  undoLastScore() {
    this._gradingService.undoLastScore()
  }

  allowPageNavigation() {
    this._gradingService.allowPageNavigation()
  }
}
