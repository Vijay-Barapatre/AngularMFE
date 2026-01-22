# 📡 Cross-MFE Communication Guide

> **Patterns for loosely-coupled communication between Micro Frontends**

## 🎯 The Core Problem

In a Micro Frontend architecture, MFEs need to communicate but **cannot import each other directly**:

```typescript
// ❌ ANTI-PATTERN: Direct imports create tight coupling
import { MetricService } from 'mfe-dashboard';

// ✅ CORRECT: Use shared communication patterns
import { EventBusService } from '@shared/event-bus';
```

---

## 📊 Communication Methods

| Method | Best For | Type Safety | Framework |
|--------|----------|-------------|-----------|
| **Event Bus (RxJS)** | Most use cases | ✅ Full | Angular |
| **Browser Custom Events** | Cross-framework | ⚠️ Manual | Any |
| **Shared Signals** | Auth/config state | ✅ Full | Angular |

---

## 🚌 Event Bus (RxJS)

The primary communication method for Angular MFEs.

### How It Works

```
┌──────────────┐                    ┌──────────────┐
│  MFE-Dashboard│                    │ MFE-Settings │
│              │                    │              │
│  eventBus   │   METRIC_SELECTED   │  eventBus   │
│  .emit({...})├──────────────────►│  .on(...)    │
│              │                    │  .subscribe()│
└──────────────┘                    └──────────────┘
       │                                   │
       ▼                                   ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│          EVENT BUS SERVICE (Singleton)          │
│                                                 │
│    Subject<MfeEvent> ─── Observable<MfeEvent>   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Publishing Events

```typescript
import { EventBusService, EventTypes, MfeSources } from '@shared/event-bus';

@Component({...})
export class DashboardComponent {
  private eventBus = inject(EventBusService);
  
  onMetricClick(metric: Metric): void {
    this.eventBus.emit({
      type: EventTypes.METRIC_SELECTED,
      source: MfeSources.DASHBOARD,
      payload: {
        metricId: metric.id,
        metricName: metric.name,
        value: metric.value
      }
    });
  }
}
```

### Subscribing to Events

```typescript
import { EventBusService, EventTypes, MetricSelectedPayload } from '@shared/event-bus';
import { Subject, takeUntil } from 'rxjs';

@Component({...})
export class SettingsComponent implements OnInit, OnDestroy {
  private eventBus = inject(EventBusService);
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    // Subscribe to specific event type
    this.eventBus.on<MetricSelectedPayload>(EventTypes.METRIC_SELECTED)
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('Metric selected:', event.payload.metricName);
        console.log('Value:', event.payload.value);
      });
  }
  
  ngOnDestroy(): void {
    // IMPORTANT: Clean up subscriptions!
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Event Types

Predefined event types for type safety:

```typescript
export const EventTypes = {
  // Authentication
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  
  // Dashboard
  METRIC_SELECTED: 'METRIC_SELECTED',
  DASHBOARD_LOADED: 'DASHBOARD_LOADED',
  REFRESH_REQUESTED: 'REFRESH_REQUESTED',
  
  // Settings
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  THEME_CHANGED: 'THEME_CHANGED',
  
  // Navigation
  NAVIGATE_TO: 'NAVIGATE_TO',
} as const;
```

### Typed Payloads

```typescript
export interface MetricSelectedPayload {
  metricId: string;
  metricName: string;
  value: number;
}

export interface ThemeChangedPayload {
  theme: 'light' | 'dark' | 'system';
}
```

---

## 📢 Browser Custom Events

For framework-agnostic communication (e.g., Angular to React).

### Why Use Custom Events?

| Scenario | Use Custom Events? |
|----------|-------------------|
| All MFEs are Angular | No, use Event Bus |
| Mixed frameworks (Angular + React) | Yes |
| Need to work with legacy code | Yes |
| Want browser DevTools visibility | Yes |

### Publishing Custom Events

```typescript
import { CustomEventService } from '@shared/event-bus';

@Component({...})
export class ThemeToggle {
  private customEvents = inject(CustomEventService);
  
  toggleTheme(theme: string): void {
    this.customEvents.dispatch('theme-changed', { theme });
    // Dispatches: window CustomEvent named 'mfe:theme-changed'
  }
}
```

### Listening for Custom Events

```typescript
@Component({...})
export class AppComponent implements OnInit, OnDestroy {
  private customEvents = inject(CustomEventService);
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.customEvents.listen<{ theme: string }>('theme-changed')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('Theme changed to:', data.theme);
        this.applyTheme(data.theme);
      });
  }
}
```

### Debugging Custom Events

Open browser DevTools Console:

```javascript
// Listen for MFE events
window.addEventListener('mfe:theme-changed', (e) => {
  console.log('Theme event:', e.detail);
});
```

---

## 📊 Shared State (Signals)

For state that needs to be visible across all MFEs.

### Allowed Shared State

> [!IMPORTANT]
> Only share these types of state globally:
> - Authentication (user, token, isAuthenticated)
> - Configuration (feature flags, environment)
> - Theme/UI preferences

### Reading Auth State

```typescript
@Component({
  template: `
    @if (auth.isAuthenticated()) {
      <p>Hello, {{ auth.user()?.name }}</p>
      <p>Your role: {{ auth.userRole() }}</p>
    }
  `
})
export class UserInfoComponent {
  auth = inject(AuthService);
}
```

### Reacting to State Changes

```typescript
@Component({...})
export class HeaderComponent {
  auth = inject(AuthService);
  
  constructor() {
    // effect() runs when any signal it reads changes
    effect(() => {
      const isAuth = this.auth.isAuthenticated();
      console.log('Auth state changed:', isAuth);
    });
  }
}
```

---

## 📋 Best Practices

### 1. Always Unsubscribe

```typescript
// Use takeUntil pattern
private destroy$ = new Subject<void>();

ngOnInit() {
  this.eventBus.on(EventTypes.SOME_EVENT)
    .pipe(takeUntil(this.destroy$))  // 👈 Automatic cleanup
    .subscribe(...);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 2. Use Typed Events

```typescript
// ✅ Type-safe
eventBus.on<MetricSelectedPayload>(EventTypes.METRIC_SELECTED)
  .subscribe(event => {
    // event.payload is typed!
    const name = event.payload.metricName;
  });

// ❌ Unsafe - no type checking
eventBus.on('METRIC_SELECTED')
  .subscribe(event => {
    // event.payload is unknown
  });
```

### 3. Include Source in Events

```typescript
eventBus.emit({
  type: EventTypes.METRIC_SELECTED,
  source: 'mfe-dashboard',  // 👈 Helpful for debugging
  payload: { ... }
});
```

### 4. Don't Pass Functions

```typescript
// ❌ WRONG - functions can't be serialized
eventBus.emit({
  type: 'ACTION',
  payload: {
    callback: () => console.log('hi')  // Will break!
  }
});

// ✅ CORRECT - pass serializable data
eventBus.emit({
  type: 'ACTION',
  payload: {
    actionType: 'LOG',
    message: 'hi'
  }
});
```

---

## 🔍 Debugging

### Event Bus Debug Info

```typescript
const eventBus = inject(EventBusService);

// Get stats
const info = eventBus.getDebugInfo();
console.log('Total events:', info.eventCount);
console.log('Last event:', info.lastEvent);
```

### Console Logging

All events are logged in development:

```
[EventBus] 📨 Event: METRIC_SELECTED from mfe-dashboard { metricId: '1', ... }
```

---

## 📚 Related Files

- [event-bus.service.ts](../mfe-shell/src/shared/event-bus/event-bus.service.ts)
- [custom-event.service.ts](../mfe-shell/src/shared/event-bus/custom-event.service.ts)
- [event.models.ts](../mfe-shell/src/shared/event-bus/event.models.ts)
