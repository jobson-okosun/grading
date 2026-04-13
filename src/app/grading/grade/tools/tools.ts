import { Component, computed, inject, signal } from '@angular/core';
import { GradingService } from '../../services/grading.service';
import { ConfirmationService } from 'primeng/api';
import { Store } from '../../store/store';
import { DrawingAndWritingStore } from '../canvas/sevices/canvas-store';
import { HotToastService } from '@ngxpert/hot-toast';
import { ConfigService } from '../../services/config.service';
import { DrawingStoreEvent } from '../canvas/sevices/event.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-tools',
  imports: [TooltipModule],
  templateUrl: './tools.html',
  styleUrl: './tools.css',
})
export class Tools {
  private _gradingService = inject(GradingService)
  private confirmationService = inject(ConfirmationService);
  private _store = inject(Store)
  private _drawingStore = inject(DrawingAndWritingStore)
  private _toast = inject(HotToastService)
  private _configService = inject(ConfigService)
  private _drawingStoreEvent = inject(DrawingStoreEvent)

  highlightedAnnotation = computed(() => this._gradingService.highlightedAnnotation())
  store = computed(() => this._store.store())
  drawingStore = computed(() => this._drawingStore.store())
  currentPageHasData = computed(() => this.drawingStore()?.pages[this.drawingStore().currentPage]?.strokes?.length > 0)
  currentPageIsBlank = computed(() => this._gradingService.currentPageIsBlank())

  gradingStarted = computed(() => this._gradingService.gradingStarted())
  currentQuestionMarkingGuide = computed(() => this._gradingService.currentQuestionMarkingGuide())
  currentSectionIsMarkedAsNotAttempted = computed(() => {
    const markingGuide = this.currentQuestionMarkingGuide()
    const section = markingGuide?.sections[this.store().questionCurrentSectionIndex]
    return section?.not_attempted
  })

  deleteAnnotation() {
    if (!this.gradingStarted()) {
      this._toast.error('Grading must be started before deleting a score', { position: 'bottom-center' })
      return
    }

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
    if (!this.gradingStarted()) {
      this._toast.error('Grading must be started before marking a page as blank', { position: 'bottom-center' })
      return
    }

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
    if (!this.gradingStarted()) {
      this._toast.error('Grading must be started before undoing a score', { position: 'bottom-center' })
      return
    }

    this._gradingService.undoLastScore()
  }

  allowPageNavigation() {
    if (!this.gradingStarted()) {
      this._toast.error('Grading must be started before allowing page navigation', { position: 'bottom-center' })
      return
    }
    this._gradingService.allowPageNavigation()
  }

  toggleQuestionSidebar() {
    this._configService.questionSidebarOpen.set(!this._configService.questionSidebarOpen())
    this._drawingStoreEvent._layoutSub$.next()
  }

  markAsNotAttempted() {
    if (!this.gradingStarted()) {
      this._toast.error('Grading must be started before marking a page as not attempted', { position: 'bottom-center' })
      return
    }

    const currentSectionName = this.currentQuestionMarkingGuide()?.sections?.[this.store().questionCurrentSectionIndex]?.name
    this.confirmationService.confirm({
      header: 'Not Attempted',
      message: `Are you sure you want to mark section ${currentSectionName} as not attempted?`,
      acceptLabel: 'Mark as Not Attempted',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => this._gradingService.markCurrentSectionAsNotAttempted(),
    });
  }

  markAsAttempted() {
    this._gradingService.undoMarkCurrentSectionAsNotAttempted()
  }

}
