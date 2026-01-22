/**
 * ============================================================================
 * ADAPTER PATTERN - Data Transformation
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Demonstrates the Adapter pattern for transforming data between
 * different formats (e.g., API response → App model).
 * 
 * 🎯 WHEN TO USE:
 * - API returns snake_case, app uses camelCase
 * - API returns flat data, app needs nested objects
 * - External library has different interface than your app
 * 
 * 💡 GANG OF FOUR PATTERN: Adapter (Structural)
 * "Convert the interface of a class into another interface clients expect."
 */

// ============================================================================
// API RESPONSE TYPES (External format - what the API returns)
// ============================================================================

/**
 * User data as returned by a typical REST API.
 * Uses snake_case naming convention.
 */
export interface ApiUserResponse {
    user_id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    created_at: string;  // ISO string
    role_id: number;
    profile_image_url: string | null;
    is_active: boolean;
}

/**
 * Dashboard metrics as returned by analytics API.
 */
export interface ApiMetricsResponse {
    metric_id: string;
    metric_name: string;
    current_value: number;
    previous_value: number;
    percent_change: number;
    last_updated_at: string;
}

// ============================================================================
// APP MODEL TYPES (Internal format - what the app uses)
// ============================================================================

/**
 * User model used throughout the application.
 * Uses camelCase and has computed properties.
 */
export interface AppUser {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;       // Computed: firstName + lastName
    email: string;
    createdAt: Date;        // Parsed Date object
    role: 'admin' | 'manager' | 'user' | 'guest';
    avatarUrl: string;      // Default if null
    isActive: boolean;
}

/**
 * Metric model with trend indicator.
 */
export interface AppMetric {
    id: string;
    name: string;
    value: number;
    previousValue: number;
    percentChange: number;
    trend: 'up' | 'down' | 'stable';  // Computed from percent change
    lastUpdated: Date;
}

// ============================================================================
// ADAPTERS (Transform external → internal)
// ============================================================================

/**
 * 🔄 USER ADAPTER
 * 
 * Transforms API user response to application user model.
 * 
 * @example
 * const apiUser = await fetchUser();
 * const appUser = UserAdapter.toAppUser(apiUser);
 * console.log(appUser.fullName); // "John Doe"
 */
export class UserAdapter {
    /**
     * Role ID to role name mapping.
     */
    private static roleMap: Record<number, AppUser['role']> = {
        1: 'admin',
        2: 'manager',
        3: 'user',
        4: 'guest'
    };

    /**
     * Transform a single API user to app user.
     */
    static toAppUser(apiUser: ApiUserResponse): AppUser {
        return {
            id: apiUser.user_id,
            firstName: apiUser.first_name,
            lastName: apiUser.last_name,
            fullName: `${apiUser.first_name} ${apiUser.last_name}`,
            email: apiUser.email_address,
            createdAt: new Date(apiUser.created_at),
            role: this.roleMap[apiUser.role_id] ?? 'guest',
            avatarUrl: apiUser.profile_image_url ?? '/assets/default-avatar.png',
            isActive: apiUser.is_active
        };
    }

    /**
     * Transform array of API users.
     */
    static toAppUsers(apiUsers: ApiUserResponse[]): AppUser[] {
        return apiUsers.map(user => this.toAppUser(user));
    }

    /**
     * Reverse adapter: app user to API format (for POST/PUT requests).
     */
    static toApiUser(appUser: Partial<AppUser>): Partial<ApiUserResponse> {
        const reverseRoleMap = Object.fromEntries(
            Object.entries(this.roleMap).map(([k, v]) => [v, Number(k)])
        );

        return {
            first_name: appUser.firstName,
            last_name: appUser.lastName,
            email_address: appUser.email,
            role_id: appUser.role ? reverseRoleMap[appUser.role] : undefined,
            is_active: appUser.isActive
        };
    }
}

/**
 * 🔄 METRICS ADAPTER
 * 
 * Transforms API metrics to application metrics with computed trend.
 * 
 * @example
 * const apiMetrics = await fetchMetrics();
 * const appMetrics = MetricsAdapter.toAppMetrics(apiMetrics);
 * console.log(appMetrics[0].trend); // "up" | "down" | "stable"
 */
export class MetricsAdapter {
    /**
     * Determine trend based on percent change.
     */
    private static calculateTrend(percentChange: number): AppMetric['trend'] {
        if (percentChange > 0.5) return 'up';
        if (percentChange < -0.5) return 'down';
        return 'stable';
    }

    /**
     * Transform a single API metric.
     */
    static toAppMetric(apiMetric: ApiMetricsResponse): AppMetric {
        return {
            id: apiMetric.metric_id,
            name: apiMetric.metric_name,
            value: apiMetric.current_value,
            previousValue: apiMetric.previous_value,
            percentChange: apiMetric.percent_change,
            trend: this.calculateTrend(apiMetric.percent_change),
            lastUpdated: new Date(apiMetric.last_updated_at)
        };
    }

    /**
     * Transform array of API metrics.
     */
    static toAppMetrics(apiMetrics: ApiMetricsResponse[]): AppMetric[] {
        return apiMetrics.map(metric => this.toAppMetric(metric));
    }
}

// ============================================================================
// USAGE EXAMPLE (in a service)
// ============================================================================

/**
 * 📚 HOW TO USE IN A SERVICE:
 * 
 * ```typescript
 * import { UserAdapter, MetricsAdapter } from '@shared/patterns';
 * 
 * @Injectable({ providedIn: 'root' })
 * export class UserService {
 *     constructor(private http: HttpClient) {}
 *     
 *     getUser(id: string): Observable<AppUser> {
 *         return this.http.get<ApiUserResponse>(`/api/users/${id}`).pipe(
 *             map(apiUser => UserAdapter.toAppUser(apiUser))
 *         );
 *     }
 *     
 *     getUsers(): Observable<AppUser[]> {
 *         return this.http.get<ApiUserResponse[]>('/api/users').pipe(
 *             map(apiUsers => UserAdapter.toAppUsers(apiUsers))
 *         );
 *     }
 *     
 *     updateUser(user: AppUser): Observable<AppUser> {
 *         const apiPayload = UserAdapter.toApiUser(user);
 *         return this.http.put<ApiUserResponse>(`/api/users/${user.id}`, apiPayload).pipe(
 *             map(response => UserAdapter.toAppUser(response))
 *         );
 *     }
 * }
 * ```
 */
