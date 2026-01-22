/**
 * ============================================================================
 * ROLE GUARD - Role-Based Access Control (RBAC)
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Provides guards that check user ROLES, not just authentication.
 * Used to restrict access to features based on user permissions.
 * 
 * 🎯 RBAC EXPLAINED:
 * Role-Based Access Control assigns permissions to roles, then users to roles.
 * 
 * HIERARCHY IN THIS POC:
 * admin > manager > user > guest
 * 
 * A user with 'manager' role can access:
 * - Routes requiring 'manager' role ✅
 * - Routes requiring 'user' role ✅
 * - Routes requiring 'guest' role ✅
 * - Routes requiring 'admin' role ❌
 * 
 * 💡 ANGULAR CONCEPT: Route Data
 * You can pass data to routes that guards can access.
 * This is how we specify which roles are required.
 * 
 * 🔗 RELATED FILES:
 * - auth.service.ts - Provides hasRole() check
 * - auth.guard.ts - Basic authentication guard
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from './auth.models';

/**
 * ============================================================================
 * ROLE GUARD FACTORY - Create Role-Specific Guards
 * ============================================================================
 * 
 * 🏭 WHAT IT DOES:
 * Factory function that creates a guard requiring specific roles.
 * 
 * 🔍 USAGE IN ROUTES:
 * 
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [authGuard, roleGuard('admin')]  // 👈 Must be admin
 *   },
 *   {
 *     path: 'reports',
 *     component: ReportsComponent,
 *     canActivate: [authGuard, roleGuard('manager')]  // 👈 Manager or above
 *   }
 * ];
 * ```
 * 
 * 💡 WHY FACTORY:
 * We use a factory so you can specify the required role at route definition time.
 * roleGuard('admin') returns a CanActivateFn that checks for admin role.
 * 
 * @param requiredRole - The minimum role required to access the route
 * @returns A CanActivateFn that checks the role
 */
export function roleGuard(requiredRole: UserRole): CanActivateFn {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        console.log(`[RoleGuard] Checking for role: ${requiredRole}`);

        // First, check if user is authenticated
        if (!authService.isAuthenticated()) {
            console.log('[RoleGuard] ❌ Not authenticated');
            return router.createUrlTree(['/login'], {
                queryParams: { returnUrl: state.url }
            });
        }

        // Then, check if user has the required role
        const hasRequiredRole = authService.hasRole(requiredRole);

        if (hasRequiredRole) {
            console.log(`[RoleGuard] ✅ Role check passed: ${authService.userRole()}`);
            return true;
        }

        // User doesn't have required role - redirect to unauthorized page
        console.log(`[RoleGuard] ❌ Role check failed: ${authService.userRole()} < ${requiredRole}`);
        return router.createUrlTree(['/unauthorized']);
    };
}

/**
 * ============================================================================
 * ANY ROLE GUARD - Require Any of Multiple Roles
 * ============================================================================
 * 
 * 🔐 WHAT IT DOES:
 * Allows access if user has ANY of the specified roles.
 * 
 * 🔍 USAGE:
 * 
 * ```typescript
 * canActivate: [authGuard, anyRoleGuard(['admin', 'manager'])]
 * ```
 */
export function anyRoleGuard(allowedRoles: UserRole[]): CanActivateFn {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        console.log(`[AnyRoleGuard] Checking for any of: ${allowedRoles.join(', ')}`);

        if (!authService.isAuthenticated()) {
            return router.createUrlTree(['/login'], {
                queryParams: { returnUrl: state.url }
            });
        }

        const hasAnyRole = authService.hasAnyRole(allowedRoles);

        if (hasAnyRole) {
            console.log(`[AnyRoleGuard] ✅ Has allowed role: ${authService.userRole()}`);
            return true;
        }

        console.log(`[AnyRoleGuard] ❌ No matching role`);
        return router.createUrlTree(['/unauthorized']);
    };
}

/**
 * ============================================================================
 * ROLE GUARD WITH DATA - Read Role from Route Data
 * ============================================================================
 * 
 * 📋 WHAT IT DOES:
 * Reads the required roles from route data instead of hardcoding.
 * More flexible for complex routing configurations.
 * 
 * 🔍 USAGE:
 * 
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [dataRoleGuard],
 *     data: { roles: ['admin'] }  // 👈 Roles defined in data
 *   },
 *   {
 *     path: 'settings',
 *     component: SettingsComponent,
 *     canActivate: [dataRoleGuard],
 *     data: { roles: ['user', 'manager', 'admin'] }  // 👈 Multiple roles
 *   }
 * ];
 * ```
 * 
 * 💡 ADVANTAGE:
 * The same guard function works for all routes.
 * Just change the data.roles array per route.
 */
export const dataRoleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Get required roles from route data
    const requiredRoles = route.data?.['roles'] as UserRole[] | undefined;

    console.log('[DataRoleGuard] Required roles:', requiredRoles);

    // If no roles specified, just check authentication
    if (!requiredRoles || requiredRoles.length === 0) {
        console.log('[DataRoleGuard] No roles required, checking auth only');
        return authService.isAuthenticated()
            ? true
            : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    // Check authentication first
    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
        });
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some(role => authService.hasRole(role));

    if (hasRole) {
        console.log('[DataRoleGuard] ✅ Access granted');
        return true;
    }

    console.log('[DataRoleGuard] ❌ Access denied');
    return router.createUrlTree(['/unauthorized']);
};

/**
 * ============================================================================
 * CAN MATCH ROLE GUARD - For Lazy Loaded Routes
 * ============================================================================
 * 
 * 🚀 WHAT IT DOES:
 * canMatch guards prevent even LOADING routes that don't match.
 * Use this for lazy-loaded routes to avoid loading unnecessary bundles.
 * 
 * 🔍 DIFFERENCE: canActivate vs canMatch
 * - canActivate: Route loads, then guard runs
 * - canMatch: Guard runs FIRST, route only loads if guard passes
 * 
 * 🔍 USAGE (with lazy loading):
 * 
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     loadChildren: () => import('./admin/admin.routes'),
 *     canMatch: [roleCanMatch('admin')]  // 👈 Won't even load if not admin
 *   }
 * ];
 * ```
 */
export function roleCanMatch(requiredRole: UserRole): CanMatchFn {
    return (route, segments) => {
        const authService = inject(AuthService);

        console.log(`[RoleCanMatch] Checking role: ${requiredRole}`);

        // Must be authenticated AND have the role
        const canMatch = authService.isAuthenticated() && authService.hasRole(requiredRole);

        console.log(`[RoleCanMatch] Result: ${canMatch ? '✅ Match' : '❌ No match'}`);

        return canMatch;
    };
}
