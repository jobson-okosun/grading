import { Component, computed, inject, signal } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Store } from '../../store/store';
import { GradingService } from '../../services/grading.service';
import { GeneralScoreDB, SchemeQuestionSectionScoreScoreDB } from '../../model/types';
import { AnnotationShape, AnnotationToApply } from '../../store/model/types';
import { PopoverModule } from 'primeng/popover';
import { HotToastService } from '@ngxpert/hot-toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-scores',
  imports: [PopoverModule, NgClass, NgTemplateOutlet, TooltipModule],
  templateUrl: './scores.html',
  styleUrl: './scores.css',
})
export class Scores {
  private _store = inject(Store)
  private _gradingService = inject(GradingService)
  private _toast = inject(HotToastService)

  store = computed(() => this._store.store())
  correctScores = computed(() => this._gradingService.currentQuestionSectionCorrectScores() ?? [])
  penaltyScores = computed(() => this._gradingService.currentQuestionSectionPenaltyScores() ?? [])
  violationScores = computed(() => this._gradingService.currentQuestionSectionViolationScores() ?? [])
  generalCorrectScores = computed(() => this._gradingService.generalCorrectScores() ?? [])
  generalPenaltyScores = computed(() => this._gradingService.generalPenaltyScores() ?? [])
  generalViolationScores = computed(() => this._gradingService.generalViolationScores() ?? [])
  markTypes = computed(() => this._gradingService.markTypes())

  totalViolationMaxOccurrences = computed(() => this.violationScores()?.concat(this.generalViolationScores() as any)?.reduce((sum, item) => sum + item.max_occurrence, 0) ?? 0)
  totalViolationUsedScores = computed(() => this.violationScores()?.concat(this.generalViolationScores() as any)?.reduce((sum, item) => sum + item.usage, 0) ?? 0)

  totalPenaltyMaxOccurrences = computed(() => this.penaltyScores()?.concat(this.generalPenaltyScores() as any)?.reduce((sum, item) => sum + item.max_occurrence, 0) ?? 0)
  totalPenaltyUsedScores = computed(() => this.penaltyScores()?.concat(this.generalPenaltyScores() as any)?.reduce((sum, item) => sum + item.usage, 0) ?? 0)

  totalCorrectMaxOccurrences = computed(() => this.correctScores()?.concat(this.generalCorrectScores() as any)?.reduce((sum, item) => sum + item.max_occurrence, 0) ?? 0)
  totalCorrectUsedScores = computed(() => this.correctScores()?.concat(this.generalCorrectScores() as any)?.reduce((sum, item) => sum + item.usage, 0) ?? 0)

  currentPageIsBlank = computed(() => this._gradingService.currentPageIsBlank())
  selectedPenaltyShape = signal<AnnotationShape>(AnnotationShape.X);
  annotationShapes = computed(() => this._gradingService.annotationShapes())

  gradingStarted = computed(() => this._gradingService.gradingStarted())
  currentQuestionHasResponse = computed(() => this._gradingService.currentQuestionHasResponse())

  applySectionScore(gradeScore: number, score: SchemeQuestionSectionScoreScoreDB | GeneralScoreDB) {
    if (!this.gradingStarted()) {
      this._toast.error('Please start grading before applying a score', { position: 'bottom-center' })
      return
    }

    if (!this.currentQuestionHasResponse()) {
      this._toast.error('This question has no anwsers for scoring', { position: 'bottom-center' })
      return
    }

    if (this.currentPageIsBlank()) {
      this._toast.error('You cannot apply score to a blank page', { position: 'bottom-center' })
      return
    }

    if (this.store().canvas.selectedMeasuringToolsSet.size > 0) {
      this._toast.error('Please remove all measuring tools before applying a score', { position: 'bottom-center' })
      return
    }


    this._gradingService.annotationToApply.update(ann => ({
      ...ann,
      gradeScore,
      score,
      shape: {
        correct: undefined,
        penalty: this.selectedPenaltyShape() !== 'X' ? this.selectedPenaltyShape() : undefined,
        violation: undefined
      }
    }) as AnnotationToApply)

    this.selectedPenaltyShape.set(AnnotationShape.X)
    this._toast.success('Score selected for grading', { position: 'bottom-center' })
  }
}
