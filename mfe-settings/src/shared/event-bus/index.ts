/**
 * ============================================================================
 * SHARED EVENT BUS LIBRARY - PUBLIC API
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Exports all public APIs from the event-bus library.
 * Import from '@shared/event-bus' to access these exports.
 * 
 * 🎯 TWO COMMUNICATION METHODS:
 * 1. EventBusService - RxJS-based, Angular-optimized
 * 2. CustomEventService - Browser-native, framework-agnostic
 * 
 * Choose based on your needs (see README for comparison).
 */

// ============================================================================
// SERVICES
// ============================================================================

export { EventBusService } from './event-bus.service';
export { CustomEventService } from './custom-event.service';

// ============================================================================
// MODELS & TYPES
// ============================================================================

// Type exports (for isolatedModules)
export type {
    // Base event interface
    MfeEvent,

    // Event type
    EventType,

    // Typed payloads
    UserLoggedInPayload,
    MetricSelectedPayload,
    SettingsUpdatedPayload,
    ThemeChangedPayload,
    NavigateToPayload,
    ErrorOccurredPayload,

    // MFE source type
    MfeSource,
} from './event.models';

// Value exports
export {
    // Event type constants
    EventTypes,

    // Event creators
    createEvent,
    createMetricSelectedEvent,
    createThemeChangedEvent,
    createNavigateToEvent,

    // MFE identifiers
    MfeSources,
} from './event.models';

// ============================================================================
// USAGE EXAMPLES (Documentation)
// ============================================================================

/**
 * 📚 QUICK START
 * 
 * ## 1. Emit an Event (Publisher)
 * 
 * ```typescript
 * import { EventBusService, EventTypes, MfeSources } from '@shared/event-bus';
 * 
 * @Component({ ... })
 * export class DashboardComponent {
 *   private eventBus = inject(EventBusService);
 *   
 *   onMetricClick(metric: Metric) {
 *     this.eventBus.emit({
 *       type: EventTypes.METRIC_SELECTED,
 *       source: MfeSources.DASHBOARD,
 *       payload: { metricId: metric.id, metricName: metric.name, value: metric.value }
 *     });
 *   }
 * }
 * ```
 * 
 * ## 2. Subscribe to Events (Consumer)
 * 
 * ```typescript
 * import { EventBusService, EventTypes, MetricSelectedPayload } from '@shared/event-bus';
 * 
 * @Component({ ... })
 * export class SettingsComponent implements OnInit, OnDestroy {
 *   private eventBus = inject(EventBusService);
 *   private destroy$ = new Subject<void>();
 *   
 *   ngOnInit() {
 *     this.eventBus.on<MetricSelectedPayload>(EventTypes.METRIC_SELECTED)
 *       .pipe(takeUntil(this.destroy$))
 *       .subscribe(event => {
 *         console.log('Metric selected:', event.payload.metricName);
 *       });
 *   }
 *   
 *   ngOnDestroy() {
 *     this.destroy$.next();
 *     this.destroy$.complete();
 *   }
 * }
 * ```
 * 
 * ## 3. Using Custom Events (Browser-Native)
 * 
 * ```typescript
 * import { CustomEventService } from '@shared/event-bus';
 * 
 * @Component({ ... })
 * export class ThemeToggleComponent {
 *   private customEvents = inject(CustomEventService);
 *   
 *   toggleTheme() {
 *     this.customEvents.dispatch('theme-changed', { theme: 'dark' });
 *   }
 * }
 * ```
 */
