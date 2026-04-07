import { Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '../../store/store';
import { QuestionAnnotation, SchemeMarkCategory } from '../../model/types';
import { DrawingAndWritingStore } from '../canvas/sevices/canvas-store';
import { GradingService } from '../../services/grading.service';
import { QuestionTools } from '../question-tools/question-tools';

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

  store = computed(() => this._store.store())
  currentPageAnnotations = signal<QuestionAnnotation[]>([])
  currentQuestion = computed(() => this.store().currentQuestion)
  sectionsAnnotation = signal<{ section: string, annotations: QuestionAnnotation[] }[]>([])
  markTypes = signal(SchemeMarkCategory)
  currentPage = computed(() => this._drawingStore.store().currentPage)

  constructor() {
    effect(() => {
      if (this.store()) {
        const questionAnnotations = this.store().questions[this.store().currentQuestionIndex].annotations;
        if (!questionAnnotations.length) {
          this.currentPageAnnotations.set([])
          this.sectionsAnnotation.set([])
          return
        }

        // todo: Set current page from drawing store
        const pageAnnotations = questionAnnotations.filter(ann => ann.page == this.currentPage())
        this.currentPageAnnotations.set(pageAnnotations)

        const sectionsAnnotations = this.currentQuestion()?.gradingGuide.sections.map(section => {
          const sectionAnnotations = questionAnnotations.filter(ann => ann.question_section_id == section.id)
          return {
            section: section.id,
            annotations: sectionAnnotations
          }
        })

        this.sectionsAnnotation.set(sectionsAnnotations ?? [])
      }
    })
  }

  selectAnnotation(item: QuestionAnnotation, event: MouseEvent) {
    this._gradingService.highlightAnnotation(item)
  }

  setCurrentSection(index: number) {
    this._store.updateStore({ questionCurrentSectionIndex: index })
  }
}
