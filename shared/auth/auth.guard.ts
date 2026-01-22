/**
 * ============================================================================
 * AUTH GUARD - Protect Routes Based on Authentication
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Provides route guards that prevent unauthenticated users from accessing
 * protected routes. Uses the modern functional guard pattern (Angular 15+).
 * 
 * 🎯 WHY FUNCTIONAL GUARDS:
 * Angular 15+ recommends functional guards over class-based guards because:
 * - Less boilerplate code
 * - Easier to test
 * - More tree-shakable
 * - Can be composed easily
 * 
 * 💡 ANGULAR CONCEPT: Route Guards
 * Guards are functions that return true/false (or UrlTree for redirects).
 * Angular calls them before activating a route.
 * 
 * Available guard types:
 * - canActivate: Can this route be activated?
 * - canActivateChild: Can child routes be activated?
 * - canDeactivate: Can user leave this route?
 * - canMatch: Should this route even be considered?
 * 
 * 🔗 RELATED FILES:
 * - auth.service.ts - Provides isAuthenticated() check
 * - role.guard.ts - Role-based access control
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * ============================================================================
 * AUTH GUARD - Require Authentication
 * ============================================================================
 * 
 * 🔐 WHAT IT DOES:
 * - Checks if user is authenticated
 * - If yes: Allow access (return true)
 * - If no: Redirect to login page
 * 
 * 🔍 USAGE IN ROUTES:
 * 
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [authGuard]  // 👈 Protected!
 *   }
 * ];
 * ```
 * 
 * 💡 HOW FUNCTIONAL GUARDS WORK:
 * This is a function that returns a CanActivateFn.
 * The inner function is what Angular actually calls.
 * inject() works inside route guards since Angular 14.
 */
export const authGuard: CanActivateFn = (route, state) => {
    // 💉 Inject dependencies using inject() function
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('[AuthGuard] Checking access to:', state.url);

    // ✅ Check if user is authenticated
    if (authService.isAuthenticated()) {
        console.log('[AuthGuard] ✅ Access granted');
        return true;
    }

    // ❌ Not authenticated - redirect to login
    console.log('[AuthGuard] ❌ Access denied - redirecting to login');

    /**
     * 💡 UrlTree vs Router.navigate:
     * Returning a UrlTree is preferred because:
     * - It's synchronous (no race conditions)
     * - Angular handles the navigation properly
     * - Can include query params (like returnUrl)
     */
    return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
    });
};

/**
 * ============================================================================
 * PUBLIC GUARD - Redirect Authenticated Users
 * ============================================================================
 * 
 * 🔓 WHAT IT DOES:
 * Opposite of authGuard - redirects AUTHENTICATED users away from
 * public pages like login/register.
 * 
 * 🔍 USE CASE:
 * When logged-in user tries to access /login, redirect them to dashboard.
 * 
 * 🔍 USAGE IN ROUTES:
 * 
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'login',
 *     component: LoginComponent,
 *     canActivate: [publicGuard]  // 👈 Redirect if already logged in
 *   }
 * ];
 * ```
 */
export const publicGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('[PublicGuard] Checking access to:', state.url);

    // If NOT authenticated, allow access (it's a public route)
    if (!authService.isAuthenticated()) {
        console.log('[PublicGuard] ✅ Public access granted');
        return true;
    }

    // If authenticated, redirect to dashboard
    console.log('[PublicGuard] ↪️ Already authenticated - redirecting to dashboard');
    return router.createUrlTree(['/dashboard']);
};

/**
 * ============================================================================
 * AUTH GUARD FACTORY - Create Guards with Custom Redirect
 * ============================================================================
 * 
 * 🏭 WHAT IT DOES:
 * A factory function that creates customized auth guards.
 * Use this when you need different redirect behavior.
 * 
 * 🔍 USAGE:
 * 
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [createAuthGuard('/admin-login')]  // 👈 Custom redirect
 *   }
 * ];
 * ```
 * 
 * 💡 FACTORY PATTERN:
 * This is a function that RETURNS a guard function.
 * Useful when you need to configure the guard.
 */
export function createAuthGuard(loginPath: string = '/login'): CanActivateFn {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isAuthenticated()) {
            return true;
        }

        return router.createUrlTree([loginPath], {
            queryParams: { returnUrl: state.url }
        });
    };
}

/**
 * ============================================================================
 * COMBINED GUARD HELPER - Combine Multiple Guards
 * ============================================================================
 * 
 * 🔗 WHAT IT DOES:
 * Combines multiple guards into one. All guards must pass.
 * 
 * 🔍 USAGE:
 * 
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [combineGuards(authGuard, adminRoleGuard)]
 *   }
 * ];
 * ```
 * 
 * ⚠️ NOTE: This is a simplified version. In complex cases,
 * you might want to handle async guards differently.
 */
export function combineGuards(...guards: CanActivateFn[]): CanActivateFn {
    return (route, state) => {
        for (const guard of guards) {
            const result = guard(route, state);

            // If any guard returns false or UrlTree, stop and return that
            if (result !== true) {
                return result;
            }
        }

        // All guards passed
        return true;
    };
}
