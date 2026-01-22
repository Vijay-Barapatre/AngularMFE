/**
 * ============================================================================
 * SHELL APP ROUTES - Module Federation Enabled
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Loads remote MFEs (Dashboard, Settings) dynamically via Module Federation.
 * 
 * 🎯 KEY CONCEPTS:
 * - loadRemoteModule fetches MFE from remote URL
 * - Federation manifest defines where each MFE lives
 * - Routes are loaded at runtime, not at build time
 */

import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { authGuard, publicGuard } from '@shared/auth';

export const routes: Routes = [
    // =========================================================================
    // PUBLIC ROUTES
    // =========================================================================
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
            .then(m => m.LoginComponent),
        canActivate: [publicGuard],
        title: 'Login - MFE Shell'
    },

    // =========================================================================
    // PROTECTED ROUTES (with Remote MFE Loading)
    // =========================================================================
    {
        path: '',
        loadComponent: () => import('./layout/shell-layout/shell-layout.component')
            .then(m => m.ShellLayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            /**
             * 📊 DASHBOARD - Remote MFE from localhost:4201
             */
            {
                path: 'dashboard',
                loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
                    .then(m => m.routes)
                    .catch(err => {
                        console.error('[Shell] Dashboard load failed:', err);
                        // Fallback to local component
                        return import('./features/dashboard/dashboard.component')
                            .then(m => [{ path: '', component: m.DashboardComponent }]);
                    }),
                title: 'Dashboard'
            },

            /**
             * ⚙️ SETTINGS - Remote MFE from localhost:4202
             */
            {
                path: 'settings',
                loadChildren: () => loadRemoteModule('mfe-settings', './routes')
                    .then(m => m.routes)
                    .catch(err => {
                        console.error('[Shell] Settings load failed:', err);
                        // Fallback to local component
                        return import('./features/settings/settings.component')
                            .then(m => [{ path: '', component: m.SettingsComponent }]);
                    }),
                title: 'Settings'
            },

            {
                path: 'unauthorized',
                loadComponent: () => import('./features/unauthorized/unauthorized.component')
                    .then(m => m.UnauthorizedComponent),
                title: 'Unauthorized'
            },
        ]
    },

    { path: '**', redirectTo: 'login' }
];
