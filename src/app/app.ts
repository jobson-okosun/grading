import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Subscription, take, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private _route = inject(ActivatedRoute)
  private _router = inject(Router)

  routeSub: Subscription
  showLoader = signal(true)
  showParamsError = signal(false)

  ngOnInit() {
    this.saveQueryParamsToLocalStorage();
  }

  saveQueryParamsToLocalStorage() {
    this.routeSub = this._route.queryParamMap
      .subscribe((params) => {
        const userId = params.get('userId');
        const sessionId = params.get('sessionId');
        const subjectId = params.get('subjectId');
        const userRemoteId = params.get('userRemoteId');

        if (location.pathname.includes('app')) {
          this.showLoader.set(false)
          this.showParamsError.set(false)
          return
        }

        if (!userId || !sessionId || !subjectId) {
          timer(2000).subscribe(() => {
            this.showLoader.set(false)
            this.showParamsError.set(true)
          });
        } else {
          const queryParams = { userId, sessionId, subjectId, userRemoteId };
          localStorage.setItem('params', JSON.stringify(queryParams));

          timer(2000).subscribe(() => {
            this.routeSub.unsubscribe();
            this.showLoader.set(false);
            this.showParamsError.set(false);
            this._router.navigate(['/app/overview']);
          });
        }
      });
  }

}
