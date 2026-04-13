import { Component, computed, inject, TemplateRef, viewChild } from '@angular/core';
import { Store } from '../../store/store';
import { GradingService } from '../../services/grading.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-navigation',
  imports: [],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  private _store = inject(Store)
  private _gradingService = inject(GradingService)
  private _toast = inject(HotToastService)
  ungradedSectionsTemplate = viewChild<TemplateRef<any>>('ungradedSections')
  questionPagesUngradedTemplate = viewChild<TemplateRef<any>>('questionPagesUngraded')

  store = computed(() => this._store.store())
  currentQuestion = computed(() => this._gradingService.currentQuestion())
  currentQuestionMarkingGuide = computed(() => this._gradingService.currentQuestionMarkingGuide())
  currentQuestionSectionsAnnotations = computed(() => this._gradingService.currentQuestionSectionsAnnotations())
  useConstraints = computed(() => this._gradingService.useConstraints())

  currentQuestionPagesNavigationResolved = computed(() => {
    if (this._store.store()) {
      return this._gradingService.currentQuestion()?.pages.every(p => p.allowNavigation)
    }

    return false
  })

  sectionsNotGraded = computed(() => {
    return this.currentQuestionMarkingGuide()?.sections.map(s => {
      const section = this._gradingService.currentQuestionSectionsAnnotations()?.find(section => section.section == s.id)
      const unversionedAnnotations = section?.annotations?.filter(ann => !ann.identity.versioned)

      if (!unversionedAnnotations?.length && !s.not_attempted) {
        return s
      }

      return []
    }).flat()
  })

  questionPagesUngraded = computed(() => {
    return this.currentQuestion()?.pages.filter(p => !p.blank).map(p => {
      const questionAnnnotations = this.currentQuestion().annotations?.filter(ann => ann.page == p.page)
      const unversionedAnnotations = questionAnnnotations?.filter(ann => !ann.identity.versioned)

      if (!unversionedAnnotations?.length) {
        return p
      }

      return []
    })
  })

  currentQuestionGradedResolved = computed(() => {
    if (!this.useConstraints()) {
      return true
    }

    return this.sectionsNotGraded()?.length === 0 && this.currentQuestionPagesNavigationResolved()
  })

  nextQuestion() {
    if (this.store().currentQuestionIndex < this.store().questions.length - 1) {
      if (!this.useConstraints()) {
        this._store.updateStore({ currentQuestionIndex: this.store().currentQuestionIndex + 1 })
        return
      }

      if (!this.currentQuestionGradedResolved()) {
        this._toast.show(this.ungradedSectionsTemplate(), { position: 'bottom-center', data: { sectionsNotGraded: this.sectionsNotGraded() } })
        return
      }

      if (this.questionPagesUngraded()?.length > 0) {
        this._toast.show(this.questionPagesUngradedTemplate(), { position: 'bottom-center', data: { questionPagesUngraded: this.questionPagesUngraded() } })
        return
      }

      this._store.updateStore({ currentQuestionIndex: this.store().currentQuestionIndex + 1 })
    }
  }

  previousQuestion() {
    if (this.store().currentQuestionIndex > 0) {
      this._store.updateStore({ currentQuestionIndex: this.store().currentQuestionIndex - 1 })
    }
  }
}
