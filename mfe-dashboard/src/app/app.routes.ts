/**
 * ============================================================================
 * MFE-DASHBOARD - App Routes
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Defines routes for the Dashboard MFE. This MFE can run:
 * 1. STANDALONE - With its own login and mock auth (for development)
 * 2. FEDERATED - Loaded by Shell, uses Shell's auth
 * 
 * 🎯 STANDALONE APP PRINCIPLE:
 * Each MFE is a complete application that can run independently.
 * This allows developers to work on a single MFE without running everything.
 */

import { Routes } from '@angular/router';
import { authGuard, publicGuard } from '@shared/auth';

export const routes: Routes = [
    // =========================================================================
    // STANDALONE MODE: Login for independent development
    // =========================================================================
    {
        path: 'login',
        loadComponent: () => import('./standalone/standalone-login.component')
            .then(m => m.StandaloneLoginComponent),
        canActivate: [publicGuard],
        title: 'Login - Dashboard MFE'
    },

    // =========================================================================
    // DASHBOARD FEATURES
    // =========================================================================
    {
        path: '',
        loadComponent: () => import('./features/dashboard-layout/dashboard-layout.component')
            .then(m => m.DashboardLayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
            },
            {
                path: 'overview',
                loadComponent: () => import('./features/overview/overview.component')
                    .then(m => m.OverviewComponent),
                title: 'Overview - Dashboard'
            },
            {
                path: 'analytics',
                loadComponent: () => import('./features/analytics/analytics.component')
                    .then(m => m.AnalyticsComponent),
                title: 'Analytics - Dashboard'
            },
        ]
    },

    // Fallback
    { path: '**', redirectTo: '' }
];

/**
 * 📡 EXPOSED ROUTES FOR FEDERATION
 * 
 * When loaded by the Shell via Module Federation, these routes
 * are mounted under the Shell's /dashboard path.
 * 
 * The Shell routes would look like:
 * {
 *   path: 'dashboard',
 *   loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
 * }
 */
export const dashboardRoutes = routes.filter(r => r.path !== 'login');
