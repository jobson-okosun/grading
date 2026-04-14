import { Component, computed, inject, signal } from '@angular/core';
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

  isLoading = signal(false)
  hasError = signal(false)

  ngOnInit() {
    this.restoreState()
  }

  async fetchInfo() {
    this.isLoading.set(true)
    this.hasError.set(false)

    try {
      await lastValueFrom(this._dataService.login())
    } catch (error) {
      this._toast.error('Authentication failed!', { position: 'top-center', duration: 60000 })
      this.hasError.set(true)
      return
    }

    try {
      await lastValueFrom(this._dataService.fetchGradingInformation())

    } catch (error) {
      this._toast.error('Failed to load grading data', { position: 'top-right', duration: 60000 })
      this.hasError.set(true)
      return
    }

    try {
      await lastValueFrom(this._dataService.fetchSessionState())
    } catch (error) {
      this._toast.error('Failed to load session state', { position: 'top-right', duration: 60000 })
      this.hasError.set(true)
      return
    }

    try {
      await lastValueFrom(this._dataService.fetchSchemeId())
    } catch (error) {
      this._toast.error('Failed to load scheme', { position: 'top-right', duration: 60000 })
      this.hasError.set(true)
      return
    }

    try {
      await lastValueFrom(this._dataService.fetchMarkingGuide())
    } catch (error) {
      this._toast.error('Failed to load marking guide', { position: 'top-right', duration: 60000 })
      this.hasError.set(true)
      return
    }

    this.isLoading.set(false)
    this.hasError.set(false)
  }

  restoreState() {
    const params = localStorage.getItem('params')

    if (params) {
      const queryParams = JSON.parse(params)

      this._dataService.userId.set(queryParams.userId)
      this._dataService.sessionId.set(queryParams.sessionId)
      this._dataService.subjectId.set(queryParams.subjectId)
      this._dataService.userRemoteId.set(queryParams.userRemoteId)

      this.fetchInfo()
    }
  }

  startGrading() {
    this._router.navigate(['/app/grade'])
  }
}
