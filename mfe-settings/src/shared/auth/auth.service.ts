/**
 * ============================================================================
 * AUTH SERVICE - Central Authentication Management
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * This is the MAIN authentication service used across all MFEs.
 * It handles login, logout, and maintains the current auth state.
 * 
 * 🎯 WHY THIS MATTERS IN MFE:
 * - Shell uses this to perform login/logout
 * - MFEs READ from this to know if user is authenticated
 * - All apps share the SAME INSTANCE (singleton)
 * 
 * 💡 ANGULAR CONCEPT: Signals for State Management
 * Signals are Angular's new reactive primitive (Angular 16+).
 * They're simpler than RxJS for synchronous state.
 * 
 * 🔗 RELATED FILES:
 * - token.service.ts - Handles token storage
 * - auth.guard.ts - Uses this for route protection
 * - auth.models.ts - Type definitions
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import {
    User,
    UserRole,
    AuthState,
    INITIAL_AUTH_STATE,
    LoginCredentials,
    LoginResponse,
    DEMO_USERS
} from './auth.models';
import { TokenService } from './token.service';

/**
 * ============================================================================
 * AUTH SERVICE
 * ============================================================================
 * 
 * 🔐 RESPONSIBILITIES:
 * 1. Login - Authenticate user and store token
 * 2. Logout - Clear auth state and token
 * 3. State - Provide reactive auth state to all apps
 * 4. Role Check - Verify user has required roles
 * 
 * 📡 SHARED ACROSS:
 * - mfe-shell (manages login/logout)
 * - mfe-dashboard (reads auth state)
 * - mfe-settings (reads auth state, checks roles)
 */
@Injectable({
    providedIn: 'root'  // 👈 Singleton across the entire app
})
export class AuthService {

    // =========================================================================
    // STATE (Signals)
    // =========================================================================

    /**
     * Private writable signal for auth state.
     * Only this service can modify it.
     * 
     * 💡 SIGNAL PATTERN:
     * - Private writable signal (_state)
     * - Public readonly signals derived from it
     * - This prevents external modification
     */
    private _authState = signal<AuthState>(INITIAL_AUTH_STATE);

    // -------------------------------------------------------------------------
    // Public Readonly Signals (What other components/services use)
    // -------------------------------------------------------------------------

    /**
     * The complete auth state.
     * Use this if you need all auth info at once.
     */
    readonly authState = this._authState.asReadonly();

    /**
     * Whether the user is authenticated.
     * 
     * 🔍 USAGE IN TEMPLATE:
     * @if (authService.isAuthenticated()) {
     *   <p>Welcome back!</p>
     * }
     */
    readonly isAuthenticated = computed(() => this._authState().isAuthenticated);

    /**
     * The current user (or null if not logged in).
     * 
     * 🔍 USAGE:
     * const user = authService.user();
     * console.log(user?.name);
     */
    readonly user = computed(() => this._authState().user);

    /**
     * The current user's role (or null).
     * 
     * 🔍 USAGE:
     * const role = authService.userRole();
     * if (role === 'admin') { ... }
     */
    readonly userRole = computed(() => this._authState().user?.role ?? null);

    /**
     * Whether an auth operation is in progress.
     * Use this to show loading indicators.
     */
    readonly isLoading = computed(() => this._authState().isLoading);

    /**
     * Any auth error message.
     * Use this to show error alerts.
     */
    readonly error = computed(() => this._authState().error);

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor(private tokenService: TokenService) {
        console.log('[AuthService] Initializing...');

        // 🔄 Try to restore session from stored token
        this.restoreSession();

        // 💡 ANGULAR CONCEPT: effect()
        // Effects run whenever their dependencies change.
        // This logs every auth state change for debugging.
        effect(() => {
            const state = this._authState();
            console.log('[AuthService] State changed:', {
                isAuthenticated: state.isAuthenticated,
                user: state.user?.email,
                isLoading: state.isLoading
            });
        });
    }

    // =========================================================================
    // PUBLIC METHODS
    // =========================================================================

    /**
     * Login with email and password.
     * 
     * 🔍 WHAT HAPPENS:
     * 1. Set loading state
     * 2. Simulate API call (delay)
     * 3. Find user in demo users
     * 4. Generate token
     * 5. Store token and update state
     * 
     * ⚠️ POC NOTE: This simulates a backend. In real apps,
     * you'd call an actual API endpoint.
     * 
     * @param email - User's email
     * @param password - User's password
     * @returns Promise that resolves when login completes
     * 
     * @example
     * try {
     *   await authService.login('admin@demo.com', 'admin123');
     *   router.navigate(['/dashboard']);
     * } catch (error) {
     *   console.error('Login failed:', error);
     * }
     */
    async login(email: string, password: string): Promise<void> {
        console.log('[AuthService] Login attempt for:', email);

        // Step 1: Set loading state
        this.updateState({ isLoading: true, error: null });

        try {
            // Step 2: Simulate API call delay (500ms)
            await this.delay(500);

            // Step 3: Find user in demo users (simulated backend)
            const loginResponse = this.simulateLogin({ email, password });

            if (!loginResponse) {
                throw new Error('Invalid email or password');
            }

            // Step 4: Store the token
            this.tokenService.setToken(loginResponse.token);

            // Step 5: Update auth state
            this.updateState({
                isAuthenticated: true,
                user: loginResponse.user,
                isLoading: false,
                error: null
            });

            console.log('[AuthService] Login successful:', loginResponse.user.name);

        } catch (error) {
            // Handle login failure
            const message = error instanceof Error ? error.message : 'Login failed';

            this.updateState({
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: message
            });

            console.error('[AuthService] Login failed:', message);
            throw error;  // Re-throw so caller can handle
        }
    }

    /**
     * Logout the current user.
     * 
     * 🔍 WHAT HAPPENS:
     * 1. Clear the stored token
     * 2. Reset auth state to initial
     * 
     * @example
     * authService.logout();
     * router.navigate(['/login']);
     */
    logout(): void {
        console.log('[AuthService] Logging out...');

        // Clear the token
        this.tokenService.clearToken();

        // Reset to initial state
        this._authState.set(INITIAL_AUTH_STATE);

        console.log('[AuthService] Logged out successfully');
    }

    /**
     * Check if current user has a specific role.
     * 
     * 🔐 ROLE HIERARCHY:
     * - admin: Has access to everything
     * - manager: Has access to manager and below
     * - user: Has access to user and below
     * - guest: Minimal access
     * 
     * @param requiredRole - The role to check for
     * @returns true if user has the required role or higher
     * 
     * @example
     * if (authService.hasRole('admin')) {
     *   // Show admin panel
     * }
     */
    hasRole(requiredRole: UserRole): boolean {
        const userRole = this.userRole();

        if (!userRole) {
            return false;  // Not logged in
        }

        // Define role hierarchy (higher index = more permissions)
        const roleHierarchy: UserRole[] = ['guest', 'user', 'manager', 'admin'];

        const userRoleIndex = roleHierarchy.indexOf(userRole);
        const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

        // User has access if their role is >= required role
        return userRoleIndex >= requiredRoleIndex;
    }

    /**
     * Check if user has ANY of the specified roles.
     * 
     * @param roles - Array of roles to check
     * @returns true if user has any of the roles
     * 
     * @example
     * if (authService.hasAnyRole(['admin', 'manager'])) {
     *   // Show management features
     * }
     */
    hasAnyRole(roles: UserRole[]): boolean {
        return roles.some(role => this.hasRole(role));
    }

    // =========================================================================
    // PRIVATE METHODS
    // =========================================================================

    /**
     * Update auth state (partial update).
     * This is a helper to avoid repeating the spread pattern.
     */
    private updateState(partial: Partial<AuthState>): void {
        this._authState.update(current => ({
            ...current,
            ...partial
        }));
    }

    /**
     * Restore session from stored token.
     * Called on service initialization.
     * 
     * 🔍 WHAT HAPPENS:
     * 1. Check if token exists
     * 2. Check if token is expired
     * 3. Decode user info from token
     * 4. Restore auth state
     */
    private restoreSession(): void {
        console.log('[AuthService] Checking for existing session...');

        // Check if we have a token
        if (!this.tokenService.hasToken()) {
            console.log('[AuthService] No stored token found');
            return;
        }

        // Check if token is expired
        if (this.tokenService.isTokenExpired()) {
            console.log('[AuthService] Token expired, clearing...');
            this.tokenService.clearToken();
            return;
        }

        // Decode user info from token
        const payload = this.tokenService.decodeToken();
        if (!payload) {
            console.log('[AuthService] Could not decode token');
            this.tokenService.clearToken();
            return;
        }

        // Find the user (in real app, you might fetch from API)
        const user = DEMO_USERS.find(u => u.email === payload.email);
        if (!user) {
            console.log('[AuthService] User not found for token');
            this.tokenService.clearToken();
            return;
        }

        // Restore auth state
        this.updateState({
            isAuthenticated: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar
            }
        });

        console.log('[AuthService] Session restored for:', user.email);
    }

    /**
     * Simulate a backend login API call.
     * 
     * ⚠️ POC ONLY: In real apps, this would be an HTTP POST to your backend.
     * 
     * @param credentials - Email and password
     * @returns Login response or null if invalid
     */
    private simulateLogin(credentials: LoginCredentials): LoginResponse | null {
        // Find user with matching email and password
        const user = DEMO_USERS.find(
            u => u.email === credentials.email && u.password === credentials.password
        );

        if (!user) {
            return null;  // Invalid credentials
        }

        // Generate a simulated JWT token
        const token = this.generateSimulatedToken(user);

        // Calculate expiration (1 hour from now)
        const expiresAt = Date.now() + 3600000;

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar
            },
            expiresAt
        };
    }

    /**
     * Generate a simulated JWT token.
     * 
     * 📖 REAL JWT STRUCTURE:
     * - Header: { alg, typ }
     * - Payload: { sub, email, role, iat, exp }
     * - Signature: HMAC-SHA256(header + payload, secret)
     * 
     * ⚠️ POC NOTE: We're just base64 encoding. Real JWTs are
     * cryptographically signed by the server.
     */
    private generateSimulatedToken(user: User): string {
        // JWT Header
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        // JWT Payload
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600  // 1 hour
        };

        // Encode (simplified - not a real signature)
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const fakeSignature = btoa('simulated-signature');

        return `${encodedHeader}.${encodedPayload}.${fakeSignature}`;
    }

    /**
     * Promise-based delay for simulating async operations.
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
