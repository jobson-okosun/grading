import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { User } from '../user/user';
import { DataService } from '../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { GradingService } from '../services/grading.service';
import { ParticipantSectionTranscript, SeedParticipantSectionTranscript } from '../model/types';

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
    this.fetchInfo()
  }

  fetchInfo() {
    this._dataService.fetchGradingInformation().subscribe()
  }

  startGrading(event: Event) {
    this._dataService.fetchQuestionsToGrade(false)
      .pipe(this._toast.observe({
        loading: 'Please wait...',
        success: 'Good to go!',
        error: ' '
      }))
      .subscribe({
        next: (res) => {
          this._router.navigate(['/app/grade/'])
        },
        error: (error) => {
          this._toast.error(error.message ?? 'Failed to fetch questions to grade', { position: 'top-right' })

          this._router.navigate(['/app/grade/'])
        }
      })
  }

  gotoGrading() {
    this._router.navigate(['/app/grade/'])
  }
}
