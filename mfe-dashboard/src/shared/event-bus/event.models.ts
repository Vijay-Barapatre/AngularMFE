/**
 * ============================================================================
 * EVENT MODELS - Type Definitions for Cross-MFE Events
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Defines all event types and interfaces used for MFE communication.
 * Having typed events prevents bugs and improves developer experience.
 * 
 * 🎯 WHY TYPED EVENTS:
 * - Autocomplete for event types and payloads
 * - Compile-time checking of event data
 * - Self-documenting code
 * - Easier refactoring
 * 
 * 💡 PATTERN: Event-Driven Architecture
 * MFEs communicate by publishing events that others subscribe to.
 * This creates loose coupling - MFEs don't know about each other.
 */

// ============================================================================
// BASE EVENT INTERFACE
// ============================================================================

/**
 * Base interface for all MFE events.
 * 
 * 📋 STRUCTURE:
 * - type: What kind of event (e.g., 'USER_LOGGED_IN')
 * - source: Which MFE sent it (e.g., 'mfe-shell')
 * - payload: The data (generic type T)
 * - timestamp: When it happened
 * 
 * @template T - The type of the payload data
 */
export interface MfeEvent<T = unknown> {
    /** 
     * Event type identifier.
     * Use SCREAMING_SNAKE_CASE by convention.
     * @example 'METRIC_SELECTED', 'USER_SETTINGS_UPDATED'
     */
    type: string;

    /**
     * Source MFE that emitted the event.
     * Helps with debugging and filtering.
     * @example 'mfe-shell', 'mfe-dashboard', 'mfe-settings'
     */
    source: string;

    /**
     * Event payload data.
     * Can be any type - use generics for type safety.
     */
    payload: T;

    /**
     * Unix timestamp when event was created.
     * Useful for ordering and debugging.
     */
    timestamp: number;
}

// ============================================================================
// COMMON EVENT TYPES
// ============================================================================

/**
 * Predefined event types used in this POC.
 * 
 * 💡 WHY CONSTANTS:
 * - Prevent typos in event type strings
 * - Single source of truth
 * - Easy to find all event types
 */
export const EventTypes = {
    // Authentication events (from Shell)
    USER_LOGGED_IN: 'USER_LOGGED_IN',
    USER_LOGGED_OUT: 'USER_LOGGED_OUT',
    SESSION_EXPIRED: 'SESSION_EXPIRED',

    // Dashboard events
    METRIC_SELECTED: 'METRIC_SELECTED',
    DASHBOARD_LOADED: 'DASHBOARD_LOADED',
    REFRESH_REQUESTED: 'REFRESH_REQUESTED',

    // Settings events
    SETTINGS_UPDATED: 'SETTINGS_UPDATED',
    THEME_CHANGED: 'THEME_CHANGED',
    LANGUAGE_CHANGED: 'LANGUAGE_CHANGED',

    // Navigation events
    NAVIGATE_TO: 'NAVIGATE_TO',

    // Generic
    ERROR_OCCURRED: 'ERROR_OCCURRED',
} as const;

/**
 * Type representing all valid event types.
 * Creates a union type from EventTypes values.
 * 
 * 💡 TYPESCRIPT CONCEPT: keyof typeof
 * - typeof EventTypes = the type of the EventTypes object
 * - keyof = gets all keys as a union type
 * - EventTypes[keyof typeof EventTypes] = all values as union
 */
export type EventType = typeof EventTypes[keyof typeof EventTypes];

// ============================================================================
// TYPED EVENT PAYLOADS
// ============================================================================

/**
 * Payload for USER_LOGGED_IN event.
 */
export interface UserLoggedInPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Payload for METRIC_SELECTED event.
 */
export interface MetricSelectedPayload {
    metricId: string;
    metricName: string;
    value: number;
    category?: string;
}

/**
 * Payload for SETTINGS_UPDATED event.
 */
export interface SettingsUpdatedPayload {
    setting: string;
    oldValue: unknown;
    newValue: unknown;
}

/**
 * Payload for THEME_CHANGED event.
 */
export interface ThemeChangedPayload {
    theme: 'light' | 'dark' | 'system';
}

/**
 * Payload for NAVIGATE_TO event.
 */
export interface NavigateToPayload {
    path: string;
    queryParams?: Record<string, string>;
}

/**
 * Payload for ERROR_OCCURRED event.
 */
export interface ErrorOccurredPayload {
    message: string;
    code?: string;
    source: string;
    details?: unknown;
}

// ============================================================================
// TYPE-SAFE EVENT CREATORS (Optional Helper Pattern)
// ============================================================================

/**
 * 🏭 EVENT CREATORS
 * 
 * Helper functions that create properly typed events.
 * Ensures consistent event structure and provides autocomplete.
 * 
 * 🔍 USAGE:
 * ```typescript
 * // Instead of manually creating the object:
 * eventBus.emit(createMetricSelectedEvent('mfe-dashboard', {
 *   metricId: '1',
 *   metricName: 'Revenue',
 *   value: 50000
 * }));
 * ```
 */

export function createEvent<T>(
    type: string,
    source: string,
    payload: T
): MfeEvent<T> {
    return {
        type,
        source,
        payload,
        timestamp: Date.now(),
    };
}

export function createMetricSelectedEvent(
    source: string,
    payload: MetricSelectedPayload
): MfeEvent<MetricSelectedPayload> {
    return createEvent(EventTypes.METRIC_SELECTED, source, payload);
}

export function createThemeChangedEvent(
    source: string,
    payload: ThemeChangedPayload
): MfeEvent<ThemeChangedPayload> {
    return createEvent(EventTypes.THEME_CHANGED, source, payload);
}

export function createNavigateToEvent(
    source: string,
    payload: NavigateToPayload
): MfeEvent<NavigateToPayload> {
    return createEvent(EventTypes.NAVIGATE_TO, source, payload);
}

// ============================================================================
// MFE IDENTIFIERS
// ============================================================================

/**
 * Known MFE identifiers in the system.
 * Use these as the 'source' field in events.
 */
export const MfeSources = {
    SHELL: 'mfe-shell',
    DASHBOARD: 'mfe-dashboard',
    SETTINGS: 'mfe-settings',
} as const;

export type MfeSource = typeof MfeSources[keyof typeof MfeSources];
