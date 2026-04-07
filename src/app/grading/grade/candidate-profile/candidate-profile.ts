import { Component, computed, inject } from '@angular/core';
import { Store } from '../../store/store';

@Component({
  selector: 'app-candidate-profile',
  imports: [],
  templateUrl: './candidate-profile.html',
  styleUrl: './candidate-profile.css',
})
export class CandidateProfile {
  private _store = inject(Store)

  store = computed(() => this._store.store())
}
