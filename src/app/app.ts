import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('grading');
  private _router = inject(Router)

  ngOnInit() {
    this._router.navigateByUrl('/grading/grade/assessment/1/section/1/participant/1/scheme/1')
  }
}
