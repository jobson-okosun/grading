import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { User } from '../user/user';
import { DataService } from '../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { GradingService } from '../services/grading.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, User],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export default class Layout {
  private _router = inject(Router)
  private _dataService = inject(DataService)
  private _toast = inject(HotToastService)
  private _gradingService = inject(GradingService)

  store = computed(() => this._gradingService.store())
  isGradingSeed = computed(() => this._gradingService.isGradingSeed())
  gradingInfo = computed(() => this._gradingService.store().gradingInfo)

  ngOnInit() {
    this.restoreState()
  }

  async fetchInfo() {
    try {
      // other api calls must be called after this login
      await lastValueFrom(this._dataService.login())
      await lastValueFrom(this._dataService.fetchGradingInformation())
      await lastValueFrom(this._dataService.fetchSessionState())
      await lastValueFrom(this._dataService.fetchSchemeId())
      await lastValueFrom(this._dataService.fetchMarkingGuide())

    } catch (error) {
      this._toast.error('Failed load grading data', { position: 'top-right' })
    }
  }

  restoreState() {
    const params = localStorage.getItem('params')

    if (params) {
      const queryParams = JSON.parse(params)

      this._dataService.userId.set(queryParams.userId)
      this._dataService.sessionId.set(queryParams.sessionId)
      this._dataService.subjectId.set(queryParams.subjectId)

      this.fetchInfo()
    }
  }

  startGrading() {
    this._dataService.fetchQuestionsToGrade(false)
      .pipe(this._toast.observe({
        loading: 'Please wait...',
        success: 'Good to go!',
        error: ' '
      }))
      .subscribe({
        next: () => {
          this._router.navigate(['/app/grade'])
        },
        error: (error) => {
          this._toast.error(error.message ?? 'Failed to fetch questions to grade', { position: 'top-right' })
          this._router.navigate(['/app/grade'])
        }
      })
  }
}
