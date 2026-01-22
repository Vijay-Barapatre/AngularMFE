/**
 * ============================================================================
 * TOKEN SERVICE - Secure Token Storage and Management
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Handles secure storage and retrieval of JWT tokens. Tokens are encrypted
 * before being stored in sessionStorage to add a layer of security.
 * 
 * 🎯 WHY ENCRYPT TOKENS:
 * - XSS attacks could read plain tokens from storage
 * - Encryption adds defense in depth
 * - Even if attacker reads storage, token is unusable without key
 * 
 * 💡 ANGULAR CONCEPT: Injectable Service
 * Services are singleton objects that encapsulate reusable logic.
 * Using `providedIn: 'root'` makes it a singleton across the app.
 * 
 * ⚠️ SECURITY NOTE:
 * This is a simplified encryption for demonstration. In production,
 * consider using HttpOnly cookies (set by backend) for token storage,
 * or a proper encryption library like crypto-js.
 * 
 * 🔗 RELATED FILES:
 * - auth.service.ts - Uses this to store/retrieve tokens
 * - auth.interceptor.ts - Gets token from here to attach to requests
 */

import { Injectable, signal, computed } from '@angular/core';
import { TokenPayload } from './auth.models';

/**
 * ============================================================================
 * TOKEN SERVICE
 * ============================================================================
 * 
 * 🔑 RESPONSIBILITIES:
 * 1. Store tokens securely (with encryption)
 * 2. Retrieve and decrypt tokens
 * 3. Track token expiration
 * 4. Clear tokens on logout
 * 
 * 📡 USED BY:
 * - AuthService: Store token after login
 * - AuthInterceptor: Get token for HTTP requests
 * - AuthGuard: Check if token exists
 */
@Injectable({
    providedIn: 'root'  // 👈 Singleton - same instance everywhere
})
export class TokenService {

    // =========================================================================
    // CONFIGURATION
    // =========================================================================

    /**
     * Key used for storing token in sessionStorage.
     * Using sessionStorage so tokens are cleared when browser closes.
     * 
     * 💡 sessionStorage vs localStorage:
     * - sessionStorage: Cleared when browser/tab closes (more secure)
     * - localStorage: Persists forever until cleared
     */
    private readonly STORAGE_KEY = 'mfe_auth_token';

    /**
     * Simple encryption key for demonstration.
     * 
     * ⚠️ PRODUCTION NOTE:
     * In real apps, this should be a server-provided key or
     * use environment-specific configuration.
     */
    private readonly ENCRYPTION_KEY = 'MFE_POC_SECRET_KEY_2024';

    // =========================================================================
    // STATE (Signals)
    // =========================================================================

    /**
     * Current token stored in memory (decrypted).
     * Using signals for reactive state management.
     * 
     * 💡 WHY SIGNAL:
     * - Reactive: Components auto-update when token changes
     * - Type-safe: TypeScript knows it's string | null
     * - Performant: Fine-grained reactivity
     */
    private _token = signal<string | null>(null);

    /**
     * Public readonly access to token existence.
     * Computed signal - only recalculates when _token changes.
     */
    readonly hasToken = computed(() => this._token() !== null);

    // =========================================================================
    // CONSTRUCTOR - Initialize from storage
    // =========================================================================

    constructor() {
        // 🔄 On service init, check if there's a stored token
        this.loadTokenFromStorage();

        console.log('[TokenService] Initialized. Has token:', this.hasToken());
    }

    // =========================================================================
    // PUBLIC METHODS
    // =========================================================================

    /**
     * Store a token securely.
     * 
     * 🔍 WHAT HAPPENS:
     * 1. Encrypt the token
     * 2. Save to sessionStorage
     * 3. Update the signal
     * 
     * @param token - The JWT token to store
     * 
     * @example
     * tokenService.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
     */
    setToken(token: string): void {
        console.log('[TokenService] Storing token...');

        // Step 1: Encrypt the token
        const encryptedToken = this.encrypt(token);

        // Step 2: Save to sessionStorage
        try {
            sessionStorage.setItem(this.STORAGE_KEY, encryptedToken);
            console.log('[TokenService] Token saved to sessionStorage');
        } catch (error) {
            console.error('[TokenService] Failed to save token:', error);
        }

        // Step 3: Update the signal
        this._token.set(token);
    }

    /**
     * Get the current token (decrypted).
     * 
     * @returns The JWT token or null if not authenticated
     * 
     * @example
     * const token = tokenService.getToken();
     * if (token) {
     *   headers.set('Authorization', `Bearer ${token}`);
     * }
     */
    getToken(): string | null {
        return this._token();
    }

    /**
     * Clear the stored token (logout).
     * 
     * 🔍 WHAT HAPPENS:
     * 1. Remove from sessionStorage
     * 2. Clear the signal
     * 
     * 📡 CALLED BY: AuthService.logout()
     */
    clearToken(): void {
        console.log('[TokenService] Clearing token...');

        // Remove from storage
        try {
            sessionStorage.removeItem(this.STORAGE_KEY);
            console.log('[TokenService] Token removed from sessionStorage');
        } catch (error) {
            console.error('[TokenService] Failed to remove token:', error);
        }

        // Clear the signal
        this._token.set(null);
    }

    /**
     * Decode the token payload (without verification).
     * 
     * 📖 JWT STRUCTURE:
     * A JWT has three parts: header.payload.signature
     * We decode the middle part (payload) to get user info.
     * 
     * ⚠️ NOTE: This doesn't verify the signature!
     * Only the backend should verify signatures.
     * 
     * @returns Decoded payload or null if invalid/no token
     */
    decodeToken(): TokenPayload | null {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            // JWT format: header.payload.signature
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('[TokenService] Invalid JWT format');
                return null;
            }

            // Decode the payload (middle part)
            const payload = parts[1];
            const decoded = JSON.parse(atob(payload));

            return decoded as TokenPayload;
        } catch (error) {
            console.error('[TokenService] Failed to decode token:', error);
            return null;
        }
    }

    /**
     * Check if the token is expired.
     * 
     * @returns true if expired or no token, false if valid
     * 
     * @example
     * if (tokenService.isTokenExpired()) {
     *   // Redirect to login
     * }
     */
    isTokenExpired(): boolean {
        const payload = this.decodeToken();
        if (!payload) {
            return true;  // No token = expired
        }

        // exp is in seconds, Date.now() is in milliseconds
        const expirationMs = payload.exp * 1000;
        const isExpired = Date.now() > expirationMs;

        if (isExpired) {
            console.log('[TokenService] Token is expired');
        }

        return isExpired;
    }

    // =========================================================================
    // PRIVATE METHODS
    // =========================================================================

    /**
     * Load token from storage on initialization.
     * Called in constructor to restore session on page refresh.
     */
    private loadTokenFromStorage(): void {
        try {
            const encryptedToken = sessionStorage.getItem(this.STORAGE_KEY);

            if (encryptedToken) {
                // Decrypt the stored token
                const token = this.decrypt(encryptedToken);

                if (token) {
                    this._token.set(token);
                    console.log('[TokenService] Token loaded from storage');
                }
            }
        } catch (error) {
            console.error('[TokenService] Failed to load token:', error);
            // Clear corrupted data
            this.clearToken();
        }
    }

    /**
     * Simple encryption for demonstration.
     * 
     * 🔐 HOW IT WORKS:
     * 1. XOR each character with the key
     * 2. Base64 encode the result
     * 
     * ⚠️ PRODUCTION NOTE:
     * Use a proper encryption library like crypto-js in production.
     * This is intentionally simple for learning purposes.
     * 
     * @param text - Plain text to encrypt
     * @returns Encrypted string
     */
    private encrypt(text: string): string {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
            result += String.fromCharCode(charCode);
        }
        return btoa(result);  // Base64 encode
    }

    /**
     * Simple decryption for demonstration.
     * 
     * 🔓 HOW IT WORKS:
     * 1. Base64 decode
     * 2. XOR each character with the key (reverses encryption)
     * 
     * @param encrypted - Encrypted string
     * @returns Decrypted plain text
     */
    private decrypt(encrypted: string): string {
        try {
            const decoded = atob(encrypted);  // Base64 decode
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        } catch {
            console.error('[TokenService] Decryption failed');
            return '';
        }
    }
}
