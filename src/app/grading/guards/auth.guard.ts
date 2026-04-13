import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '../store/store';

export const authGuard: CanMatchFn = () => {
	const _store = inject(Store);
	const router = inject(Router);

	if (_store.store().gradingInfo) {
		return true;
	}

	return router.createUrlTree(['/app']);
};
