/**
 * ============================================================================
 * MFE-SETTINGS - App Routes
 * ============================================================================
 * 
 * Settings MFE with standalone capability and Event Bus subscription.
 */

import { Routes } from '@angular/router';
import { authGuard, publicGuard } from '@shared/auth';

export const routes: Routes = [
    // Standalone login
    {
        path: 'login',
        loadComponent: () => import('./standalone/standalone-login.component')
            .then(m => m.StandaloneLoginComponent),
        canActivate: [publicGuard],
        title: 'Login - Settings MFE'
    },

    // Settings features
    {
        path: '',
        loadComponent: () => import('./features/settings-layout/settings-layout.component')
            .then(m => m.SettingsLayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'profile', pathMatch: 'full' },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile.component')
                    .then(m => m.ProfileComponent),
                title: 'Profile - Settings'
            },
            {
                path: 'preferences',
                loadComponent: () => import('./features/preferences/preferences.component')
                    .then(m => m.PreferencesComponent),
                title: 'Preferences - Settings'
            },
            {
                path: 'events',
                loadComponent: () => import('./features/event-monitor/event-monitor.component')
                    .then(m => m.EventMonitorComponent),
                title: 'Event Monitor - Settings'
            },
        ]
    },

    { path: '**', redirectTo: '' }
];
