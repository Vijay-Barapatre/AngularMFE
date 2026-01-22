/**
 * ============================================================================
 * SHARED PATTERNS LIBRARY - PUBLIC API
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Exports all design pattern implementations for use across the application.
 * Import from '@shared/patterns' to access these exports.
 * 
 * 🎯 PATTERNS INCLUDED:
 * 1. Adapter Pattern - Data transformation (API → App models)
 * 2. Proxy Pattern - Caching HTTP requests
 * 3. Presentational Components - Smart/Dumb component separation
 */

// ============================================================================
// ADAPTER PATTERN
// ============================================================================

export {
    // Types - API format
    ApiUserResponse,
    ApiMetricsResponse,

    // Types - App format
    AppUser,
    AppMetric,

    // Adapters
    UserAdapter,
    MetricsAdapter
} from './api-adapter';

// ============================================================================
// PROXY PATTERN (CACHING)
// ============================================================================

export {
    CachingProxyService,
    CacheOptions,
    CacheStats
} from './caching-proxy.service';

// ============================================================================
// PRESENTATIONAL COMPONENTS
// ============================================================================

export {
    MetricCardComponent,
    MetricData
} from './metric-card.component';

// ============================================================================
// USAGE EXAMPLES (Documentation)
// ============================================================================

/**
 * 📚 QUICK START
 * 
 * ## 1. Adapter Pattern (Data Transformation)
 * 
 * ```typescript
 * import { UserAdapter, MetricsAdapter } from '@shared/patterns';
 * 
 * // Transform API response to app model
 * const appUser = UserAdapter.toAppUser(apiResponse);
 * console.log(appUser.fullName);  // "John Doe"
 * 
 * // Transform for API request
 * const apiPayload = UserAdapter.toApiUser(appUser);
 * ```
 * 
 * ## 2. Caching Proxy (HTTP Caching)
 * 
 * ```typescript
 * import { CachingProxyService } from '@shared/patterns';
 * 
 * @Injectable({ providedIn: 'root' })
 * export class DataService {
 *     constructor(private proxy: CachingProxyService) {}
 *     
 *     getData(): Observable<Data[]> {
 *         // Cached for 60 seconds (default)
 *         return this.proxy.get<Data[]>('/api/data');
 *     }
 * }
 * ```
 * 
 * ## 3. Presentational Components
 * 
 * ```typescript
 * import { MetricCardComponent } from '@shared/patterns';
 * 
 * @Component({
 *     imports: [MetricCardComponent],
 *     template: `
 *         <app-metric-card
 *             [metric]="metric"
 *             (select)="onSelect($event)">
 *         </app-metric-card>
 *     `
 * })
 * export class DashboardComponent { ... }
 * ```
 */
