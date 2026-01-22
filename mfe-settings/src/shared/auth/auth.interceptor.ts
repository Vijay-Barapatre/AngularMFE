/**
 * ============================================================================
 * AUTH INTERCEPTOR - Automatically Attach Tokens to HTTP Requests
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Intercepts all HTTP requests and adds the JWT token to the Authorization header.
 * This means you don't have to manually add tokens to every API call.
 * 
 * 🎯 WHY INTERCEPTORS:
 * - DRY principle: Token logic in one place
 * - Consistency: All requests get the token
 * - Separation: Components don't deal with auth headers
 * 
 * 💡 ANGULAR CONCEPT: HTTP Interceptors (Functional)
 * Angular 15+ introduced functional interceptors with `HttpInterceptorFn`.
 * They're simpler than class-based interceptors.
 * 
 * 📡 HOW IT WORKS:
 * 1. App makes HTTP request
 * 2. Interceptor catches it
 * 3. Interceptor adds Authorization header
 * 4. Request continues to server
 * 
 * 🔗 RELATED FILES:
 * - token.service.ts - Provides the token
 * - app.config.ts - Where this interceptor is registered
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

/**
 * ============================================================================
 * AUTH INTERCEPTOR FUNCTION
 * ============================================================================
 * 
 * 🔐 WHAT IT DOES:
 * 1. Gets the current token from TokenService
 * 2. If token exists, clones the request with Authorization header
 * 3. If no token, passes request through unchanged
 * 
 * 🔍 USAGE (in app.config.ts):
 * 
 * ```typescript
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import { authInterceptor } from '@shared/auth';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(
 *       withInterceptors([authInterceptor])  // 👈 Register here
 *     )
 *   ]
 * };
 * ```
 * 
 * 💡 WHY CLONE THE REQUEST:
 * HttpRequest objects are immutable in Angular.
 * We can't modify them directly, so we create a clone with changes.
 */
export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    // 💉 Inject the TokenService
    const tokenService = inject(TokenService);

    // Get the current token
    const token = tokenService.getToken();

    // Log for debugging (remove in production)
    console.log('[AuthInterceptor] Request:', req.method, req.url);
    console.log('[AuthInterceptor] Has token:', !!token);

    // ✅ If we have a token, add it to the request
    if (token) {
        /**
         * 📋 AUTHORIZATION HEADER FORMAT:
         * Bearer <token>
         * 
         * "Bearer" is the authentication scheme.
         * This is the standard format for JWT authentication.
         */
        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        console.log('[AuthInterceptor] ✅ Token attached');
        return next(authReq);
    }

    // ❌ No token - pass request through unchanged
    console.log('[AuthInterceptor] ⚠️ No token - request sent without auth');
    return next(req);
};

/**
 * ============================================================================
 * ADVANCED: SKIP AUTH FOR CERTAIN URLS
 * ============================================================================
 * 
 * 🔍 USE CASE:
 * Some endpoints (like login) shouldn't have a token.
 * This interceptor skips auth for specified URLs.
 * 
 * 🔍 USAGE:
 * 
 * ```typescript
 * provideHttpClient(
 *   withInterceptors([
 *     createAuthInterceptor({
 *       skipUrls: ['/api/auth/login', '/api/auth/register']
 *     })
 *   ])
 * )
 * ```
 */
export interface AuthInterceptorConfig {
    /** URLs that should NOT have auth headers */
    skipUrls?: string[];

    /** Only add auth to URLs matching this pattern */
    includeUrls?: string[];
}

/**
 * Factory function to create a configurable auth interceptor.
 */
export function createAuthInterceptor(config: AuthInterceptorConfig = {}): HttpInterceptorFn {
    return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        const tokenService = inject(TokenService);

        // Check if this URL should be skipped
        if (config.skipUrls?.some(url => req.url.includes(url))) {
            console.log('[AuthInterceptor] Skipping auth for:', req.url);
            return next(req);
        }

        // Check if this URL should be included
        if (config.includeUrls && !config.includeUrls.some(url => req.url.includes(url))) {
            console.log('[AuthInterceptor] URL not in include list:', req.url);
            return next(req);
        }

        // Add token if available
        const token = tokenService.getToken();

        if (token) {
            const authReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            return next(authReq);
        }

        return next(req);
    };
}

/**
 * ============================================================================
 * EXTRA: LOGGING INTERCEPTOR (For Debugging)
 * ============================================================================
 * 
 * 📋 WHAT IT DOES:
 * Logs all HTTP requests and responses. Useful for debugging.
 * 
 * 🔍 USAGE:
 * Add to app.config.ts BEFORE authInterceptor to see full request flow.
 * 
 * ⚠️ REMOVE IN PRODUCTION - logging can leak sensitive data!
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
    const startTime = Date.now();

    console.log(`[HTTP] ➡️ ${req.method} ${req.url}`);

    // Import and use tap from rxjs to log response
    // This is just for demonstration - actual implementation would use tap()

    return next(req);
};
