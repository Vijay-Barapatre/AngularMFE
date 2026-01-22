/**
 * ============================================================================
 * APP CONFIG - Application Configuration and Providers
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Configures the Angular application with all necessary providers.
 * This is where you register services, interceptors, and other dependencies.
 * 
 * 🎯 KEY CONCEPTS:
 * 1. provideRouter - Sets up routing
 * 2. provideHttpClient - Enables HTTP requests
 * 3. withInterceptors - Registers HTTP interceptors (like auth)
 * 
 * 💡 ANGULAR 17+ CONCEPT: Standalone Configuration
 * Instead of NgModule, we use ApplicationConfig with providers.
 * This is the modern, simpler approach.
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@shared/auth';

/**
 * Application configuration object.
 * This is passed to bootstrapApplication() in main.ts.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // =========================================================================
    // CORE ANGULAR PROVIDERS
    // =========================================================================

    /**
     * Zone.js change detection with coalescing.
     * eventCoalescing: true improves performance by batching events.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    // =========================================================================
    // ROUTING
    // =========================================================================

    /**
     * Set up the router with our routes.
     * 
     * withComponentInputBinding():
     * Allows route params to be passed as component inputs.
     * Example: /user/:id → @Input() id: string
     */
    provideRouter(
      routes,
      withComponentInputBinding()
    ),

    // =========================================================================
    // HTTP CLIENT
    // =========================================================================

    /**
     * Enable HttpClient with interceptors.
     * 
     * withInterceptors():
     * Registers our auth interceptor to auto-attach JWT tokens.
     * The interceptor runs for every HTTP request.
     * 
     * 💡 ORDER MATTERS:
     * Interceptors run in the order they're listed.
     * First in the array runs first for requests.
     */
    provideHttpClient(
      withInterceptors([
        authInterceptor  // 👈 Auto-attach JWT to requests
      ])
    ),

    // =========================================================================
    // FUTURE: MODULE FEDERATION
    // =========================================================================

    /**
     * When using @angular-architects/native-federation:
     * 
     * Import and add:
     * provideNativeFederation()
     * 
     * This sets up the infrastructure for loading remote MFEs.
     */
  ]
};

/**
 * ============================================================================
 * PROVIDER EXPLANATION
 * ============================================================================
 * 
 * 📋 WHAT ARE PROVIDERS?
 * 
 * Providers tell Angular's dependency injection system how to create services.
 * 
 * Common provider patterns:
 * 
 * 1. provideXxx() functions - Modern way (Angular 15+)
 *    provideRouter(routes)
 *    provideHttpClient()
 * 
 * 2. { provide: Token, useClass: Service } - Class provider
 *    { provide: LoggerService, useClass: ConsoleLoggerService }
 * 
 * 3. { provide: Token, useValue: value } - Value provider
 *    { provide: API_URL, useValue: 'https://api.example.com' }
 * 
 * 4. { provide: Token, useFactory: fn } - Factory provider
 *    { provide: ConfigService, useFactory: () => new ConfigService(env) }
 */
