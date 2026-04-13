import { Component, computed, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Store } from '../../store/store';
import { DrawerModule } from 'primeng/drawer';
import { AccordionModule } from 'primeng/accordion';
import { MenuModule } from 'primeng/menu';
import { DrawingStoreEvent } from '../canvas/sevices/event.service';
import { GradingService } from '../../services/grading.service';

@Component({
  selector: 'app-question-tools',
  imports: [DialogModule, DrawerModule, AccordionModule, MenuModule],
  templateUrl: './question-tools.html',
  styleUrl: './question-tools.css',
})
export class QuestionTools {
  private _store = inject(Store)
  private _drawingStoreEvent = inject(DrawingStoreEvent)
  private _gradingService = inject(GradingService)

  store = computed(() => this._store.store())
  currentQuestionIndex = computed(() => this.store().currentQuestionIndex)
  currentQuestionMarkingGuide = computed(() => this._gradingService.currentQuestionMarkingGuide())
  currentQuestion = computed(() => this._gradingService.currentQuestion())
  showQuestionModal = signal(false)
  showMarkingGuideDrawer = signal(false)
  selectedTools = computed(() => Array.from(this.store().canvas.selectedMeasuringToolsSet.values()))

  selectMeasurementTool(tool: string) {
    this._store.updateStore({
      canvas: {
        ...this.store().canvas,
        type: 'OVERLAY',
        selectedMeasuringToolsSet: this.store().canvas.selectedMeasuringToolsSet.add(tool)
      }
    })

    setTimeout(() => {
      this._drawingStoreEvent._selectMeasurementTool$.next(tool);
    }, 1000);
  }

  removeTool(tool: string) {
    if (tool == 'all') {
      this._store.updateStore({
        canvas: {
          ...this.store().canvas,
          type: 'DEFAULT',
          selectedMeasuringToolsSet: new Set()
        }
      })
    } else {
      const set = new Set(this.store().canvas.selectedMeasuringToolsSet)
      set.delete(tool)

      this._store.updateStore({
        canvas: {
          ...this.store().canvas,
          selectedMeasuringToolsSet: set
        }
      })

      if (this.store().canvas.selectedMeasuringToolsSet.size === 0) {
        this._store.updateStore({
          canvas: {
            ...this.store().canvas,
            type: 'DEFAULT',
            selectedMeasuringToolsSet: new Set()
          }
        })
      }
    }

    this._drawingStoreEvent._removeMeasurementTool$.next(tool);
  }

  selectBackgroundType(type: string | null) {
    this._drawingStoreEvent._backgroundChange$.next(type);
  }
}
