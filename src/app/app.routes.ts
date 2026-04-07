import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: 'grading',
        children: [
            { path: '', loadComponent: () => import('./grading/overview/overview')},
            { path: 'grade/assessment/:assessmentId/section/:sectionId/participant/:participantId/scheme/:schemeId', loadComponent: () => import('./grading/grade/grade')}
        ]
    }
];
