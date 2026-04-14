import { Routes } from '@angular/router';
import Layout from './grading/layout/layout';
import { authGuard, unsavedChangesGuard } from './grading/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'app',
        children: [
            {
                path: '',
                component: Layout,
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', loadComponent: () => import('./grading/overview/overview') },
                    { path: 'booklets', loadComponent: () => import('./grading/booklets/booklets') }
                ]
            },
            {
                path: 'grade',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./grading/grade/grade'),
                        canDeactivate: [unsavedChangesGuard]
                    }
                ]
            }
        ]
    }
];
