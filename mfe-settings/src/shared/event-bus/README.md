# 📡 Shared Event Bus Library

> **Cross-MFE Communication without Direct Coupling**

## 📖 What This Library Provides

This library enables communication between MFEs without them importing each other:

| Feature | File | Description |
|---------|------|-------------|
| **Event Bus** | `event-bus.service.ts` | RxJS-based pub/sub for MFE events |
| **Custom Events** | `custom-event.service.ts` | Browser-native events (framework-agnostic) |
| **Event Types** | `event.models.ts` | Type-safe event definitions |

## 🎯 Why Two Communication Methods?

### 1. Event Bus (RxJS Subjects)
- **Angular-optimized** - Works with signals and async pipe
- **Type-safe** - Full TypeScript support
- **Filtered subscriptions** - Subscribe by event type or source

### 2. Browser Custom Events
- **Framework-agnostic** - Works with any JavaScript
- **DOM-based** - Uses native browser APIs
- **Useful for** - Non-Angular MFEs, legacy code

## 🔍 Quick Example

```typescript
// In MFE-Dashboard: PUBLISH an event
eventBus.emit({
  type: 'METRIC_SELECTED',
  source: 'mfe-dashboard',
  payload: { metricId: 123, value: 95 }
});

// In MFE-Settings: SUBSCRIBE to events
eventBus.on<MetricEvent>('METRIC_SELECTED').subscribe(event => {
  console.log('Metric selected:', event.payload);
});
```

## ⚠️ Anti-Pattern Reminder

```
❌ NEVER DO THIS:
import { SomeService } from 'mfe-dashboard';  // Direct import between MFEs

✅ ALWAYS DO THIS:
import { EventBusService } from '@shared/event-bus';  // Use shared communication
```
