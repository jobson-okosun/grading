import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { Store } from '../../store/store';
import { QuestionAnnotation, SchemeMarkCategory } from '../../model/types';
import { DrawingAndWritingStore } from '../canvas/sevices/canvas-store';
import { GradingService } from '../../services/grading.service';
import { QuestionTools } from '../question-tools/question-tools';
import { ConfirmationService } from 'primeng/api';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-current-question',
  imports: [QuestionTools],
  templateUrl: './current-question.html',
  styleUrl: './current-question.css',
})
export class CurrentQuestion {
  private _store = inject(Store)
  private _drawingStore = inject(DrawingAndWritingStore)
  private _gradingService = inject(GradingService)
  private _confirmationService = inject(ConfirmationService)
  private _toast = inject(HotToastService)

  store = computed(() => this._store.store())
  currentQuestionMarkingGuide = computed(() => this._gradingService.currentQuestionMarkingGuide())
  currentQuestionSectionsAnnotations = computed(() => this._gradingService.currentQuestionSectionsAnnotations())
  markTypes = signal(SchemeMarkCategory)
  currentPage = computed(() => this._drawingStore.store().currentPage)

  gradingStarted = computed(() => this._gradingService.gradingStarted())
  isGradingSeed = computed(() => this._gradingService.isGradingSeed())

  selectAnnotation(item: QuestionAnnotation, event: MouseEvent) {
    this._gradingService.highlightAnnotation(item)
  }

  setCurrentSection(index: number) {
    if (index == this.store().questionCurrentSectionIndex) {
      return
    }

    if (!this.gradingStarted() && this.isGradingSeed()) {
      this._store.updateStore({ questionCurrentSectionIndex: index })
      return
    }

    if (!this.gradingStarted()) {
      this._toast.error('Please start grading before moving to the next section', { position: 'bottom-center' })
      return
    }

    if (index < this.store().questionCurrentSectionIndex) {
      this._store.updateStore({ questionCurrentSectionIndex: index })
      return
    }

    if (index > this.store().questionCurrentSectionIndex && this.currentQuestionSectionsAnnotations()[index]?.annotations?.length) {
      this._store.updateStore({ questionCurrentSectionIndex: index })
      return
    }

    const nextSection = this.currentQuestionMarkingGuide()?.sections?.[index]

    if (nextSection?.not_attempted) {
      this._store.updateStore({ questionCurrentSectionIndex: index })
      return
    }

    this._confirmationService.confirm({
      header: 'Grade Section',
      message: `Are you sure you want to grade section ${nextSection?.name}?`,
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this._store.updateStore({ questionCurrentSectionIndex: index })
      }
    })
  }
}
