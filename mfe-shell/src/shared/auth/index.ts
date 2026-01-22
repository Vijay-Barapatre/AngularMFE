/**
 * ============================================================================
 * SHARED AUTH LIBRARY - PUBLIC API
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * This is the "barrel file" that exports everything from the auth library.
 * Other apps import from this single file instead of individual files.
 * 
 * 🎯 WHY BARREL FILES:
 * - Clean imports: `import { AuthService, authGuard } from '@shared/auth'`
 * - Encapsulation: Hide internal file structure
 * - Refactoring: Can move files without changing imports elsewhere
 * 
 * 💡 ANGULAR/TS CONCEPT: Re-exporting
 * `export { X } from './file'` re-exports X from another file.
 * This is how libraries expose their public API.
 * 
 * ⚠️ BEST PRACTICE:
 * Only export what external consumers need.
 * Keep internal utilities private.
 */

// ============================================================================
// MODELS (Types and Interfaces)
// ============================================================================

// Type exports (for isolatedModules)
export type {
    // User-related types
    User,
    UserRole,

    // Auth state types
    AuthState,

    // Login types
    LoginCredentials,
    LoginResponse,

    // Token types
    TokenPayload,
} from './auth.models';

// Value exports
export {
    INITIAL_AUTH_STATE,
    DEMO_USERS,
} from './auth.models';

// ============================================================================
// SERVICES
// ============================================================================

export { AuthService } from './auth.service';
export { TokenService } from './token.service';

// ============================================================================
// GUARDS
// ============================================================================

// Basic authentication guards
export {
    authGuard,           // Require authentication
    publicGuard,         // Redirect if already authenticated
    createAuthGuard,     // Factory for custom redirect
    combineGuards,       // Combine multiple guards
} from './auth.guard';

// Role-based access control guards
export {
    roleGuard,           // Require specific role
    anyRoleGuard,        // Require any of multiple roles
    dataRoleGuard,       // Read roles from route data
    roleCanMatch,        // For lazy-loaded routes
} from './role.guard';

// ============================================================================
// INTERCEPTORS
// ============================================================================

export type { AuthInterceptorConfig } from './auth.interceptor';

export {
    authInterceptor,           // Auto-attach tokens
    createAuthInterceptor,     // Configurable version
    loggingInterceptor,        // For debugging
} from './auth.interceptor';

// ============================================================================
// USAGE EXAMPLE (for documentation)
// ============================================================================

/**
 * 📚 HOW TO USE THIS LIBRARY
 * 
 * 1️⃣ SETUP (in app.config.ts):
 * 
 * ```typescript
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import { authInterceptor } from '@shared/auth';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([authInterceptor]))
 *   ]
 * };
 * ```
 * 
 * 2️⃣ LOGIN (in login component):
 * 
 * ```typescript
 * import { AuthService } from '@shared/auth';
 * 
 * @Component({ ... })
 * export class LoginComponent {
 *   private auth = inject(AuthService);
 *   
 *   async login(email: string, password: string) {
 *     await this.auth.login(email, password);
 *   }
 * }
 * ```
 * 
 * 3️⃣ PROTECT ROUTES (in app.routes.ts):
 * 
 * ```typescript
 * import { authGuard, roleGuard } from '@shared/auth';
 * 
 * export const routes: Routes = [
 *   { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
 *   { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
 *   { path: 'admin', component: AdminComponent, canActivate: [authGuard, roleGuard('admin')] },
 * ];
 * ```
 * 
 * 4️⃣ CHECK AUTH STATE (in any component):
 * 
 * ```typescript
 * import { AuthService } from '@shared/auth';
 * 
 * @Component({
 *   template: `
 *     @if (auth.isAuthenticated()) {
 *       <p>Welcome, {{ auth.user()?.name }}!</p>
 *       <button (click)="auth.logout()">Logout</button>
 *     }
 *   `
 * })
 * export class HeaderComponent {
 *   auth = inject(AuthService);
 * }
 * ```
 * 
 * 5️⃣ CHECK ROLES (in templates):
 * 
 * ```typescript
 * @Component({
 *   template: `
 *     @if (auth.hasRole('admin')) {
 *       <button>Admin Panel</button>
 *     }
 *   `
 * })
 * export class NavComponent {
 *   auth = inject(AuthService);
 * }
 * ```
 */
