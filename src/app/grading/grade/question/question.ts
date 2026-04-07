import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ParticipantSectionTranscript, QuestionAnnotation, SchemeMarkCategory, SchemeQuestionsTransformed } from '../../model/types';
import { Store } from '../../store/store';

@Component({
  selector: 'app-question',
  imports: [],
  templateUrl: './question.html',
  styleUrl: './question.css',
})
export class Question {
  private _store = inject(Store)

  questionIndex = input.required<number>()
  store = computed(() => this._store.store())
  question = signal<ParticipantSectionTranscript | null>(null)
  questionGuide = signal<SchemeQuestionsTransformed | null>(null)

  currentQuestion = computed(() => this.store().currentQuestion)
  sectionsAnnotation = signal<{ section: string, annotations: QuestionAnnotation[] }[]>([])
  markTypes = signal(SchemeMarkCategory)

  constructor() {
    effect(() => {
      if (this.questionIndex() >= 0 && this.store().questions.length > 0) {
        this.question.set(this.store().questions[this.questionIndex()])
        this.questionGuide.set(this.store().markingGuide.questions[this.questionIndex()])

        const questionAnnotations = this.store().questions[this.questionIndex()].annotations;
        if (!questionAnnotations.length) {
          this.sectionsAnnotation.set([])
          return
        }

        const sectionsAnnotations = this.questionGuide()?.sections.map(section => {
          const sectionAnnotations = questionAnnotations.filter(ann => ann.question_section_id == section.id)
          return {
            section: section.id,
            annotations: sectionAnnotations
          }
        })

        this.sectionsAnnotation.set(sectionsAnnotations ?? [])

        this.hideAnnotationsHighlight()
      }
    })
  }
  hideAnnotationsHighlight() {
    this.sectionsAnnotation().forEach(section => {
      section.annotations.forEach(ann => {
        ann.identity.highlight = false
      })
    })
  }

  setCurrentSection(index: number) {
    this._store.updateStore({ questionCurrentSectionIndex: index })
  }

  selectAnnotation(item: QuestionAnnotation, event: MouseEvent) {
    if (item.identity.highlight) {
      item.identity.highlight = false
      return
    }

    item.identity.highlight = !item.identity.highlight
  }
}
