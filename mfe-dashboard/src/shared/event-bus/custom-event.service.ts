/**
 * ============================================================================
 * CUSTOM EVENT SERVICE - Browser-Native Cross-MFE Communication
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Provides an alternative to the RxJS Event Bus using native browser
 * CustomEvents. This is framework-agnostic and works with any JavaScript.
 * 
 * 🎯 WHEN TO USE THIS vs EVENT BUS:
 * 
 * | Use Case | Event Bus (RxJS) | Custom Events |
 * |----------|------------------|---------------|
 * | Angular-only MFEs | ✅ Recommended | Works |
 * | Mixed frameworks | Works | ✅ Recommended |
 * | Need RxJS operators | ✅ Recommended | Convert to Observable |
 * | Simpler debugging | Works | ✅ DevTools support |
 * 
 * 💡 BROWSER CONCEPT: CustomEvent
 * CustomEvent is a native browser API for creating custom events.
 * They work like click/keydown events but with your own data.
 * 
 * 📡 HOW IT WORKS:
 * 1. Create a CustomEvent with your data
 * 2. Dispatch it on the window object
 * 3. Any code listening on window receives it
 * 
 * 🔗 RELATED FILES:
 * - event-bus.service.ts - RxJS alternative
 * - event.models.ts - Shared type definitions
 */

import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { MfeEvent } from './event.models';

/**
 * ============================================================================
 * CUSTOM EVENT SERVICE
 * ============================================================================
 * 
 * 📢 BROWSER-NATIVE EVENTS
 * 
 * Uses window.dispatchEvent and window.addEventListener for communication.
 * Works across any JavaScript code, even outside Angular.
 * 
 * 🔍 KEY DIFFERENCE FROM EVENT BUS:
 * - Event Bus: RxJS Subject (Angular/TypeScript)
 * - Custom Events: Native browser API (any JavaScript)
 */
@Injectable({
    providedIn: 'root'
})
export class CustomEventService {

    // =========================================================================
    // CONFIGURATION
    // =========================================================================

    /**
     * Prefix for all MFE custom events.
     * Prevents conflicts with other events in the application.
     * 
     * 💡 WHY PREFIX:
     * If another library uses 'click' as a custom event name,
     * we don't want to accidentally catch it.
     */
    private readonly EVENT_PREFIX = 'mfe:';

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * 💉 NgZone EXPLAINED:
     * 
     * Angular uses Zone.js to detect changes and update the UI.
     * When events come from outside Angular (like native browser events),
     * we need to run the handler inside Angular's zone.
     * 
     * NgZone.run() tells Angular "hey, something changed, check the UI!"
     */
    constructor(private ngZone: NgZone) {
        console.log('[CustomEventService] 📢 Initialized');
    }

    // =========================================================================
    // DISPATCH (Publish Events)
    // =========================================================================

    /**
     * Dispatch a custom event on the window object.
     * 
     * 📤 WHAT HAPPENS:
     * 1. Create a CustomEvent with the prefixed name
     * 2. Put our data in the 'detail' property
     * 3. Dispatch it on window (broadcasts to all listeners)
     * 
     * @param eventName - Name of the event (will be prefixed)
     * @param detail - Any data to send with the event
     * 
     * @example
     * // Dispatch a theme change event
     * customEventService.dispatch('theme-changed', { theme: 'dark' });
     * // Actual event name: 'mfe:theme-changed'
     */
    dispatch<T>(eventName: string, detail: T): void {
        // Create the full event name with prefix
        const fullEventName = `${this.EVENT_PREFIX}${eventName}`;

        // Create a CustomEvent with our data
        const event = new CustomEvent(fullEventName, {
            detail,           // The data payload
            bubbles: true,    // Event bubbles up through DOM
            cancelable: true, // Event can be cancelled with preventDefault()
        });

        console.log(`[CustomEventService] 📤 Dispatching: ${fullEventName}`, detail);

        // Dispatch on window (global)
        window.dispatchEvent(event);
    }

    /**
     * Dispatch using the MfeEvent format (for consistency with Event Bus).
     * 
     * @param event - Full MfeEvent object
     * 
     * @example
     * customEventService.emit({
     *   type: 'METRIC_SELECTED',
     *   source: 'mfe-dashboard',
     *   payload: { metricId: '1' }
     * });
     */
    emit<T>(event: Omit<MfeEvent<T>, 'timestamp'>): void {
        const fullEvent: MfeEvent<T> = {
            ...event,
            timestamp: Date.now(),
        };

        this.dispatch(event.type, fullEvent);
    }

    // =========================================================================
    // LISTEN (Subscribe to Events)
    // =========================================================================

    /**
     * Listen for custom events as an Observable.
     * 
     * 📥 WHAT HAPPENS:
     * 1. Creates an Observable (lazy - nothing happens until subscribed)
     * 2. When subscribed, adds event listener to window
     * 3. When event fires, runs handler in Angular zone
     * 4. When unsubscribed, removes event listener (cleanup!)
     * 
     * @param eventName - Name of event to listen for (will be prefixed)
     * @returns Observable that emits when event is dispatched
     * 
     * @example
     * // Listen for theme changes
     * customEventService.listen<{ theme: string }>('theme-changed')
     *   .subscribe(data => {
     *     console.log('Theme changed to:', data.theme);
     *   });
     */
    listen<T>(eventName: string): Observable<T> {
        const fullEventName = `${this.EVENT_PREFIX}${eventName}`;

        // 💡 OBSERVABLE CONCEPT:
        // The function passed to new Observable is called when someone subscribes.
        // The returned function is called when they unsubscribe.
        return new Observable<T>(observer => {
            // Handler function
            const handler = (event: Event) => {
                const customEvent = event as CustomEvent<T>;

                console.log(`[CustomEventService] 📥 Received: ${fullEventName}`, customEvent.detail);

                // Run inside Angular zone to trigger change detection
                this.ngZone.run(() => {
                    observer.next(customEvent.detail);
                });
            };

            // Add listener when subscribed
            window.addEventListener(fullEventName, handler);
            console.log(`[CustomEventService] 👂 Listening: ${fullEventName}`);

            // CLEANUP: Remove listener when unsubscribed
            // This is IMPORTANT to prevent memory leaks!
            return () => {
                window.removeEventListener(fullEventName, handler);
                console.log(`[CustomEventService] 🔇 Stopped listening: ${fullEventName}`);
            };
        });
    }

    /**
     * Listen for MfeEvent format (for consistency with Event Bus).
     * 
     * @param eventType - The event type (from EventTypes)
     * @returns Observable of the full MfeEvent
     * 
     * @example
     * customEventService.on<MetricSelectedPayload>('METRIC_SELECTED')
     *   .subscribe(event => {
     *     console.log(event.source, event.payload);
     *   });
     */
    on<T>(eventType: string): Observable<MfeEvent<T>> {
        return this.listen<MfeEvent<T>>(eventType);
    }

    // =========================================================================
    // ONE-TIME LISTENERS
    // =========================================================================

    /**
     * Listen for an event only once, then auto-unsubscribe.
     * 
     * 🔍 USE CASE:
     * Waiting for a one-time response, like a modal result.
     * 
     * @param eventName - Event to listen for once
     * @returns Promise that resolves with the event data
     * 
     * @example
     * // Wait for user to confirm
     * const result = await customEventService.once('confirm-dialog-result');
     * if (result.confirmed) { ... }
     */
    once<T>(eventName: string): Promise<T> {
        return new Promise<T>((resolve) => {
            const fullEventName = `${this.EVENT_PREFIX}${eventName}`;

            const handler = (event: Event) => {
                const customEvent = event as CustomEvent<T>;

                // Remove listener immediately (one-time)
                window.removeEventListener(fullEventName, handler);

                // Run in Angular zone and resolve
                this.ngZone.run(() => {
                    resolve(customEvent.detail);
                });
            };

            window.addEventListener(fullEventName, handler);
        });
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    /**
     * Check if browser supports CustomEvent.
     * (Should be true for all modern browsers)
     */
    isSupported(): boolean {
        return typeof CustomEvent === 'function';
    }

    /**
     * Get the prefixed event name.
     * Useful for debugging or manual addEventListener.
     */
    getEventName(eventName: string): string {
        return `${this.EVENT_PREFIX}${eventName}`;
    }
}

/**
 * ============================================================================
 * BROWSER DEVTOOLS TIP
 * ============================================================================
 * 
 * 🔧 To debug custom events in browser DevTools:
 * 
 * 1. Open DevTools Console
 * 2. Run this code:
 * 
 * ```javascript
 * // Listen for all MFE events
 * ['theme-changed', 'METRIC_SELECTED', 'SETTINGS_UPDATED'].forEach(name => {
 *   window.addEventListener('mfe:' + name, e => {
 *     console.log('🔔 MFE Event:', name, e.detail);
 *   });
 * });
 * ```
 * 
 * 3. Now you'll see events logged when they fire!
 */
