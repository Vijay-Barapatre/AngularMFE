/**
 * ============================================================================
 * EVENT BUS SERVICE - Cross-MFE Communication via RxJS
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Provides a centralized event bus for MFEs to communicate without
 * directly importing each other. Uses RxJS Subjects for pub/sub pattern.
 * 
 * 🎯 WHY EVENT BUS:
 * - Loose coupling: MFEs don't know about each other
 * - Scalable: Add new MFEs without changing existing code
 * - Testable: Easy to mock events in tests
 * - Debuggable: Central place to log all inter-MFE communication
 * 
 * 💡 ANGULAR CONCEPT: RxJS Subject
 * A Subject is both an Observable (can be subscribed to) and an
 * Observer (can emit values). Perfect for event buses.
 * 
 * 📡 PATTERN: Publish-Subscribe (Pub/Sub)
 * - Publishers emit events without knowing who listens
 * - Subscribers receive events without knowing who sent them
 * - The event bus is the middleman
 * 
 * 🔗 RELATED FILES:
 * - event.models.ts - Event type definitions
 * - custom-event.service.ts - Browser-native alternative
 */

import { Injectable, signal, computed } from '@angular/core';
import { Subject, Observable, filter, map } from 'rxjs';
import { MfeEvent, EventType, MfeSource } from './event.models';

/**
 * ============================================================================
 * EVENT BUS SERVICE
 * ============================================================================
 * 
 * 🚌 THE CENTRAL MESSAGE BUS
 * 
 * All MFE-to-MFE communication goes through here.
 * Think of it like a message broker (e.g., RabbitMQ) but in-browser.
 * 
 * 📡 USAGE PATTERNS:
 * 
 * 1. EMIT (publish) an event:
 *    eventBus.emit({ type: 'METRIC_SELECTED', source: 'mfe-dashboard', payload: data });
 * 
 * 2. SUBSCRIBE to specific event type:
 *    eventBus.on('METRIC_SELECTED').subscribe(event => { ... });
 * 
 * 3. SUBSCRIBE to all events from a source:
 *    eventBus.fromSource('mfe-dashboard').subscribe(event => { ... });
 * 
 * 4. SUBSCRIBE to all events:
 *    eventBus.events$.subscribe(event => { ... });
 */
@Injectable({
    providedIn: 'root'  // 👈 Singleton - same bus for all MFEs
})
export class EventBusService {

    // =========================================================================
    // THE EVENT STREAM (Core of the Event Bus)
    // =========================================================================

    /**
     * The central Subject that all events flow through.
     * 
     * 💡 WHY SUBJECT (not BehaviorSubject):
     * - Subject: Doesn't replay - subscribers only get NEW events
     * - BehaviorSubject: Replays last value - not wanted for events
     * 
     * We use Subject because events are point-in-time occurrences,
     * not state that should be replayed.
     */
    private eventSubject = new Subject<MfeEvent>();

    /**
     * Public observable of all events.
     * Subscribe to this to see everything.
     * 
     * 💡 asObservable() hides the Subject's emit capability,
     * so external code can only subscribe, not emit.
     */
    readonly events$ = this.eventSubject.asObservable();

    // =========================================================================
    // STATE FOR DEBUGGING
    // =========================================================================

    /**
     * Count of events emitted (for debugging/monitoring).
     */
    private _eventCount = signal(0);
    readonly eventCount = this._eventCount.asReadonly();

    /**
     * Last event emitted (for debugging).
     */
    private _lastEvent = signal<MfeEvent | null>(null);
    readonly lastEvent = this._lastEvent.asReadonly();

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor() {
        console.log('[EventBus] 🚌 Initialized');

        // Log all events for debugging (remove in production)
        this.events$.subscribe(event => {
            console.log(`[EventBus] 📨 Event: ${event.type} from ${event.source}`, event.payload);
        });
    }

    // =========================================================================
    // EMIT (Publish Events)
    // =========================================================================

    /**
     * Emit an event to all subscribers.
     * 
     * 📤 WHAT HAPPENS:
     * 1. Timestamp is added if not present
     * 2. Event is pushed to the Subject
     * 3. All subscribers receive the event
     * 
     * @param event - The event to emit (type, source, payload required)
     * 
     * @example
     * // Simple emit
     * eventBus.emit({
     *   type: 'METRIC_SELECTED',
     *   source: 'mfe-dashboard',
     *   payload: { metricId: '123', value: 95 }
     * });
     * 
     * // Using typed payload
     * eventBus.emit<MetricSelectedPayload>({
     *   type: EventTypes.METRIC_SELECTED,
     *   source: MfeSources.DASHBOARD,
     *   payload: { metricId: '123', metricName: 'Revenue', value: 50000 }
     * });
     */
    emit<T>(event: Omit<MfeEvent<T>, 'timestamp'> & { timestamp?: number }): void {
        // Add timestamp if not provided
        const fullEvent: MfeEvent<T> = {
            ...event,
            timestamp: event.timestamp ?? Date.now(),
        };

        // Update debug state
        this._eventCount.update(count => count + 1);
        this._lastEvent.set(fullEvent as MfeEvent);

        // Emit to all subscribers
        this.eventSubject.next(fullEvent as MfeEvent);
    }

    /**
     * Helper method for quick emit with just essential params.
     * 
     * @param type - Event type string
     * @param source - Source MFE identifier
     * @param payload - Event data
     */
    send<T>(type: string, source: string, payload: T): void {
        this.emit({ type, source, payload });
    }

    // =========================================================================
    // SUBSCRIBE (Receive Events)
    // =========================================================================

    /**
     * Subscribe to events of a specific type.
     * 
     * 📥 MOST COMMON PATTERN:
     * Filter events by type and subscribe to only what you need.
     * 
     * @param eventType - The event type to listen for
     * @returns Observable of events matching the type
     * 
     * @example
     * // In MFE-Settings, listen for metric selections
     * eventBus.on<MetricSelectedPayload>('METRIC_SELECTED')
     *   .subscribe(event => {
     *     console.log('Metric selected:', event.payload.metricName);
     *   });
     */
    on<T = unknown>(eventType: string): Observable<MfeEvent<T>> {
        return this.events$.pipe(
            filter(event => event.type === eventType)
        ) as Observable<MfeEvent<T>>;
    }

    /**
     * Subscribe to events from a specific source MFE.
     * 
     * 🔍 USE CASE:
     * Listen to all events from a particular MFE.
     * 
     * @param source - The source MFE identifier
     * @returns Observable of events from that source
     * 
     * @example
     * // Listen to everything from Dashboard
     * eventBus.fromSource('mfe-dashboard').subscribe(event => {
     *   console.log('Dashboard event:', event.type);
     * });
     */
    fromSource(source: string): Observable<MfeEvent> {
        return this.events$.pipe(
            filter(event => event.source === source)
        );
    }

    /**
     * Subscribe to events matching multiple types.
     * 
     * @param eventTypes - Array of event types to listen for
     * @returns Observable of matching events
     * 
     * @example
     * eventBus.onAny(['SETTINGS_UPDATED', 'THEME_CHANGED'])
     *   .subscribe(event => { ... });
     */
    onAny(eventTypes: string[]): Observable<MfeEvent> {
        return this.events$.pipe(
            filter(event => eventTypes.includes(event.type))
        );
    }

    /**
     * Get just the payload from events (convenience method).
     * 
     * @param eventType - The event type to listen for
     * @returns Observable of just the payload data
     * 
     * @example
     * // Get just the metric data, not the full event
     * eventBus.payload<MetricSelectedPayload>('METRIC_SELECTED')
     *   .subscribe(metric => {
     *     console.log(metric.metricName, metric.value);
     *   });
     */
    payload<T>(eventType: string): Observable<T> {
        return this.on<T>(eventType).pipe(
            map(event => event.payload)
        );
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    /**
     * Clear event history (for testing).
     */
    reset(): void {
        this._eventCount.set(0);
        this._lastEvent.set(null);
        console.log('[EventBus] 🔄 Reset');
    }

    /**
     * Get debug info about the event bus.
     */
    getDebugInfo(): { eventCount: number; lastEvent: MfeEvent | null } {
        return {
            eventCount: this._eventCount(),
            lastEvent: this._lastEvent(),
        };
    }
}
