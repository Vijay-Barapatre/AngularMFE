/**
 * ============================================================================
 * PROXY PATTERN - Caching HTTP Requests
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Demonstrates the Proxy pattern by wrapping HTTP calls with caching.
 * This reduces API calls and improves performance.
 * 
 * 🎯 WHEN TO USE:
 * - Frequently accessed data that doesn't change often
 * - Expensive API calls you want to minimize
 * - Offline-first applications
 * 
 * 💡 GANG OF FOUR PATTERN: Proxy (Structural)
 * "Provide a surrogate or placeholder for another object to control access."
 * 
 * 🔄 OTHER PROXY USE CASES:
 * - Authorization proxy (check permissions before calling)
 * - Logging proxy (log all requests)
 * - Virtual proxy (lazy loading)
 * - Remote proxy (network abstraction)
 */

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, shareReplay } from 'rxjs';

// ============================================================================
// CACHE ENTRY TYPE
// ============================================================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

// ============================================================================
// CACHING PROXY SERVICE
// ============================================================================

/**
 * 🔄 CACHING PROXY
 * 
 * Wraps HttpClient with automatic caching.
 * Cached responses are returned immediately without hitting the API.
 * 
 * @example
 * // Instead of:
 * this.http.get<User[]>('/api/users')
 * 
 * // Use:
 * this.cachingProxy.get<User[]>('/api/users', { ttl: 60000 })
 */
@Injectable({
    providedIn: 'root'
})
export class CachingProxyService {

    // =========================================================================
    // STATE
    // =========================================================================

    /**
     * In-memory cache store.
     * Key: URL, Value: cached response with metadata.
     */
    private cache = new Map<string, CacheEntry<unknown>>();

    /**
     * Track in-flight requests to prevent duplicate calls.
     * Key: URL, Value: Observable (shared).
     */
    private inFlight = new Map<string, Observable<unknown>>();

    /**
     * Cache statistics for monitoring.
     */
    private _cacheHits = signal(0);
    private _cacheMisses = signal(0);

    readonly cacheHits = this._cacheHits.asReadonly();
    readonly cacheMisses = this._cacheMisses.asReadonly();
    readonly hitRate = computed(() => {
        const total = this._cacheHits() + this._cacheMisses();
        return total > 0 ? (this._cacheHits() / total * 100).toFixed(1) + '%' : '0%';
    });

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor(private http: HttpClient) {
        console.log('[CachingProxy] Initialized');
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /**
     * GET request with caching.
     * 
     * @param url - API endpoint URL
     * @param options - Cache options
     * @returns Observable of cached or fresh data
     * 
     * @example
     * // Cache for 1 minute (default)
     * this.proxy.get<User[]>('/api/users')
     * 
     * // Cache for 5 minutes
     * this.proxy.get<User[]>('/api/users', { ttl: 300000 })
     * 
     * // Force fresh data (bypass cache)
     * this.proxy.get<User[]>('/api/users', { forceRefresh: true })
     */
    get<T>(url: string, options: CacheOptions = {}): Observable<T> {
        const { ttl = 60000, forceRefresh = false } = options;

        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cached = this.getFromCache<T>(url);
            if (cached !== null) {
                console.log(`[CachingProxy] CACHE HIT: ${url}`);
                this._cacheHits.update(n => n + 1);
                return of(cached);
            }
        }

        // Check if request is already in-flight (prevent duplicate calls)
        const existingRequest = this.inFlight.get(url) as Observable<T> | undefined;
        if (existingRequest) {
            console.log(`[CachingProxy] REUSING IN-FLIGHT: ${url}`);
            return existingRequest;
        }

        // Cache miss - make actual HTTP call
        console.log(`[CachingProxy] CACHE MISS: ${url}`);
        this._cacheMisses.update(n => n + 1);

        const request$ = this.http.get<T>(url).pipe(
            tap(data => {
                // Store in cache
                this.setCache(url, data, ttl);
                // Remove from in-flight
                this.inFlight.delete(url);
            }),
            shareReplay(1)  // Share response with multiple subscribers
        );

        // Track in-flight request
        this.inFlight.set(url, request$);

        return request$;
    }

    /**
     * Invalidate cached data for a URL.
     * Use after POST/PUT/DELETE to ensure fresh data on next GET.
     * 
     * @param url - URL to invalidate
     * 
     * @example
     * this.http.post('/api/users', newUser).pipe(
     *     tap(() => this.proxy.invalidate('/api/users'))
     * );
     */
    invalidate(url: string): void {
        if (this.cache.has(url)) {
            this.cache.delete(url);
            console.log(`[CachingProxy] INVALIDATED: ${url}`);
        }
    }

    /**
     * Invalidate all cached data matching a pattern.
     * 
     * @param pattern - URL pattern (prefix match)
     * 
     * @example
     * // Invalidate all user-related cache
     * this.proxy.invalidatePattern('/api/users');
     */
    invalidatePattern(pattern: string): void {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(pattern)) {
                this.cache.delete(key);
                count++;
            }
        }
        console.log(`[CachingProxy] INVALIDATED ${count} entries matching: ${pattern}`);
    }

    /**
     * Clear all cached data.
     */
    clearAll(): void {
        const size = this.cache.size;
        this.cache.clear();
        this.inFlight.clear();
        console.log(`[CachingProxy] CLEARED ${size} entries`);
    }

    /**
     * Get cache statistics for debugging.
     */
    getStats(): CacheStats {
        return {
            size: this.cache.size,
            hits: this._cacheHits(),
            misses: this._cacheMisses(),
            hitRate: this.hitRate(),
            keys: Array.from(this.cache.keys())
        };
    }

    // =========================================================================
    // PRIVATE METHODS
    // =========================================================================

    private getFromCache<T>(url: string): T | null {
        const entry = this.cache.get(url);
        if (!entry) return null;

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(url);
            console.log(`[CachingProxy] EXPIRED: ${url}`);
            return null;
        }

        return entry.data as T;
    }

    private setCache<T>(url: string, data: T, ttl: number): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl
        };
        this.cache.set(url, entry);
        console.log(`[CachingProxy] CACHED: ${url} (TTL: ${ttl}ms)`);
    }
}

// ============================================================================
// TYPES
// ============================================================================

export interface CacheOptions {
    /** Time-to-live in milliseconds (default: 60000 = 1 minute) */
    ttl?: number;
    /** Force refresh, bypassing cache (default: false) */
    forceRefresh?: boolean;
}

export interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: string;
    keys: string[];
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * 📚 HOW TO USE IN A SERVICE:
 * 
 * ```typescript
 * import { CachingProxyService } from '@shared/patterns';
 * 
 * @Injectable({ providedIn: 'root' })
 * export class DashboardService {
 *     constructor(private proxy: CachingProxyService) {}
 *     
 *     // Cached for 1 minute (default)
 *     getMetrics(): Observable<Metric[]> {
 *         return this.proxy.get<Metric[]>('/api/metrics');
 *     }
 *     
 *     // Cached for 5 minutes
 *     getStaticData(): Observable<Config> {
 *         return this.proxy.get<Config>('/api/config', { ttl: 300000 });
 *     }
 *     
 *     // Force fresh data
 *     refreshMetrics(): Observable<Metric[]> {
 *         return this.proxy.get<Metric[]>('/api/metrics', { forceRefresh: true });
 *     }
 *     
 *     // Invalidate after mutation
 *     createMetric(metric: Metric): Observable<Metric> {
 *         return this.http.post<Metric>('/api/metrics', metric).pipe(
 *             tap(() => this.proxy.invalidate('/api/metrics'))
 *         );
 *     }
 * }
 * ```
 */
