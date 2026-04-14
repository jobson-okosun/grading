import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DataService } from '../services/data.service';
import Grade from '../grade/grade';
import { ConfirmationService } from 'primeng/api';

export const authGuard: CanActivateFn = () => {
	const _dataService = inject(DataService);
	const router = inject(Router);

	if (_dataService.tempStore().gradingInfo) {
		return true;
	}

	return router.createUrlTree(['/app']);
};

export const unsavedChangesGuard: CanDeactivateFn<Grade> = (component: Grade) => {
	const _confirmationService = inject(ConfirmationService);

	if (!component.hasUnsavedChanges()) {
		return true;
	}

	return new Promise<boolean>((resolve) => {
		_confirmationService.confirm({
			message: 'You may have unsaved changes. Are you sure you want to leave?',
			header: 'Confirm',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			rejectButtonStyleClass: 'p-button-secondary',
			accept: () => resolve(true),
			reject: () => resolve(false)
		});
	});
};