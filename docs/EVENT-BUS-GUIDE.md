# 📡 Event Bus - Complete Guide

> **Understanding cross-MFE communication in the simplest terms possible**

## 📑 Table of Contents

1. [What is an Event Bus?](#what-is-an-event-bus)
2. [Why Do We Need an Event Bus?](#why-do-we-need-an-event-bus)
3. [How Does It Work?](#how-does-it-work)
4. [Simple Code Example](#simple-code-example)
5. [What Problems Does It Solve?](#what-problems-does-it-solve)
6. [Advantages](#advantages-)
7. [Disadvantages](#disadvantages-)
8. [Alternative Options](#alternative-options)
9. [Why Did We Choose Event Bus?](#why-did-we-choose-event-bus-rxjs)
10. [When to Use What?](#when-to-use-what)
11. [Performance Considerations](#performance-considerations)
12. [Summary](#summary)
13. [Quick Reference](#quick-reference)

---

## What is an Event Bus?

Think of an Event Bus like a **WhatsApp group** for your application:

- Anyone in the group can **send a message** (publish an event)
- Everyone in the group **receives the message** (subscribe to events)
- People don't need to know each other personally (loose coupling)

```
┌──────────────┐    "Hey, user logged in!"    ┌──────────────┐
│   Dashboard  │ ──────────────────────────── │   Settings   │
│     MFE      │                              │     MFE      │
└──────────────┘         EVENT BUS            └──────────────┘
       │              (The WhatsApp Group)           │
       │                     │                       │
       └─────────────────────┴───────────────────────┘
                    All apps connected!
```

---

## Why Do We Need an Event Bus?

### The Problem: MFEs Can't Talk Directly

In a Micro Frontend architecture, each MFE is **independent**:

```
❌ THE PROBLEM:

Dashboard MFE                    Settings MFE
     │                               │
     │   "I need to tell Settings    │
     │    that user clicked a        │
     │    metric!"                   │
     │                               │
     └───────── HOW?! ───────────────┘
     
Each MFE is a separate app.
They don't share code.
They can't import each other.
```

### The Solution: Event Bus as Middleman

```
✅ THE SOLUTION:

Dashboard MFE                    Settings MFE
     │                               │
     │                               │
     ▼                               ▼
   emit()  ─────► EVENT BUS ─────►  on()
                  (Middleman)
                  
Dashboard: "Hey Event Bus, broadcast this message"
Event Bus: "Got it! Broadcasting to everyone..."
Settings: "Oh, I received a message from Event Bus!"
```

---

## How Does It Work?

### Step 1: Dashboard Sends (Publishes) an Event

```typescript
// In Dashboard MFE
onMetricClick(metric: Metric) {
    this.eventBus.emit({
        type: 'METRIC_SELECTED',        // What happened
        source: 'mfe-dashboard',         // Who sent it
        payload: { metricId: metric.id } // Data to share
    });
}
```

### Step 2: Event Bus Broadcasts to Everyone

```
Event Bus receives message:
  ┌───────────────────────────────┐
  │ type: "METRIC_SELECTED"       │
  │ source: "mfe-dashboard"       │
  │ payload: { metricId: "123" }  │
  └───────────────────────────────┘
           │
           ├──► Dashboard (ignores, it sent this)
           ├──► Settings (receives!)
           └──► Shell (receives!)
```

### Step 3: Settings Receives (Subscribes) to the Event

```typescript
// In Settings MFE
ngOnInit() {
    this.eventBus.on('METRIC_SELECTED').subscribe(event => {
        console.log('Dashboard selected:', event.payload.metricId);
        // React to the event!
    });
}
```

---

## Simple Code Example

### Publishing (Sending)

```typescript
// ANY component in ANY MFE can send events
import { EventBusService } from '@shared/event-bus';

export class DashboardComponent {
    private eventBus = inject(EventBusService);
    
    selectMetric(id: string) {
        // Send a message to the "group chat"
        this.eventBus.emit({
            type: 'METRIC_SELECTED',
            source: 'dashboard',
            payload: { metricId: id, metricName: 'Revenue' }
        });
    }
}
```

### Subscribing (Receiving)

```typescript
// ANY component in ANY MFE can receive events
import { EventBusService } from '@shared/event-bus';

export class SettingsComponent implements OnInit, OnDestroy {
    private eventBus = inject(EventBusService);
    private destroy$ = new Subject<void>();
    
    ngOnInit() {
        // Listen for messages in the "group chat"
        this.eventBus.on('METRIC_SELECTED')
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                console.log('Received:', event.payload);
            });
    }
    
    ngOnDestroy() {
        // IMPORTANT: Stop listening when component dies!
        this.destroy$.next();
        this.destroy$.complete();
    }
}
```

---

## What Problems Does It Solve?

| Problem | How Event Bus Solves It |
|---------|-------------------------|
| **MFEs can't import each other** | They both import EventBusService (shared) |
| **Need to coordinate user actions** | One MFE emits, others react |
| **Tight coupling** | Publisher doesn't know who's listening |
| **Adding new MFEs later** | Just subscribe to existing events |
| **Debugging** | All events go through one place (easy to log) |

---

## Advantages ✅

### 1. Loose Coupling
```
Dashboard doesn't know Settings exists.
Settings doesn't know Dashboard exists.
They just talk to the Event Bus.

Easy to add new MFEs later!
```

### 2. Scalability
```
10 components listening? 100? 1000?
Publisher doesn't care - it just emits once.
```

### 3. Debugging
```
All communication in ONE place.
Easy to log everything:

[EventBus] METRIC_SELECTED from dashboard → { metricId: "123" }
[EventBus] THEME_CHANGED from settings → { theme: "dark" }
```

### 4. Framework Agnostic
```
Works with Angular, React, Vue, or any framework.
(In this project we use RxJS, but pattern is universal)
```

---

## Disadvantages ❌

### 1. Memory Leaks (If Not Careful!)
```typescript
// ❌ WRONG - Memory leak!
ngOnInit() {
    this.eventBus.on('EVENT').subscribe(...);
    // Component dies, but subscription lives forever! 💀
}

// ✅ CORRECT - Clean up!
ngOnDestroy() {
    this.destroy$.next();  // Unsubscribe everything
}
```

### 2. Hard to Track Event Flow
```
Event emitted... but who's listening?
Who changed the data?
Debugging complex flows can be tricky.
```

### 3. No Type Safety by Default
```typescript
// Event could have ANY payload
// TypeScript doesn't know what's inside
event.payload.???

// Solution: Use typed events (we do this!)
eventBus.on<MetricSelectedPayload>('METRIC_SELECTED')
```

### 4. Event Explosion
```
Too many events = hard to manage
Keep events focused and documented!
```

---

## Alternative Options

| Option | Description | When to Use |
|--------|-------------|-------------|
| **Event Bus (RxJS)** | What we use. Subject-based pub/sub | Angular apps, need RxJS operators |
| **Custom Events** | Browser-native `window.dispatchEvent()` | Multi-framework, simple needs |
| **Shared State** | Signals/NgRx/Redux | Complex state, need time-travel debugging |
| **Props Drilling** | Pass data through component hierarchy | Small apps, parent-child only |
| **URL/Query Params** | Share state via URL | Need bookmarkable state |
| **LocalStorage** | Share via browser storage | Need persistence |

### Comparison Chart

| Feature | Event Bus | Custom Events | Shared State | Props |
|---------|-----------|---------------|--------------|-------|
| **Loose coupling** | ✅ Yes | ✅ Yes | ⚠️ Medium | ❌ No |
| **Type safety** | ✅ With generics | ❌ No | ✅ Yes | ✅ Yes |
| **RxJS operators** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Cross-framework** | ⚠️ Angular only | ✅ Any framework | ⚠️ Depends | ❌ Same only |
| **Memory safe** | ⚠️ Need cleanup | ⚠️ Need cleanup | ✅ Automatic | ✅ Yes |
| **Learning curve** | Medium | Low | High | Low |

---

## Why Did We Choose Event Bus (RxJS)?

### Our Requirements:
1. ✅ Angular 19 app - RxJS is already included
2. ✅ Need operators like `filter()`, `map()`, `debounce()`
3. ✅ MFEs loaded at runtime - need loose coupling
4. ✅ Type safety with TypeScript generics
5. ✅ Centralized logging for debugging

### Why NOT Custom Events?
```typescript
// Custom Events work but...
window.dispatchEvent(new CustomEvent('metric', { detail: data }));

// No type safety ❌
// No RxJS operators ❌
// Harder to unit test ❌
```

### Why NOT NgRx?
```
NgRx is for COMPLEX state management:
- Actions, Reducers, Effects, Selectors
- Time-travel debugging
- Overkill for simple MFE communication!

Our auth state uses Signals (simpler).
Our MFE events use Event Bus (simpler).
```

---

## When to Use What?

| Use Case | Best Choice |
|----------|-------------|
| MFE-to-MFE simple events | **Event Bus** ✅ |
| Complex app state (100+ properties) | NgRx/Redux |
| Parent-child communication | @Input/@Output |
| Need persistence | LocalStorage + Signals |
| Multi-framework MFEs | Custom Events |
| Bookmarkable state | URL Query Params |

---

## Performance Considerations

### ✅ Good Practices

```typescript
// 1. Use specific event types (not "broadcast everything")
this.eventBus.on('SPECIFIC_EVENT')  // ✅ Good

// 2. Debounce rapid events
this.eventBus.on('SEARCH_CHANGED').pipe(
    debounceTime(300)  // ✅ Wait 300ms between events
)

// 3. Unsubscribe when done
ngOnDestroy() {
    this.destroy$.next();  // ✅ Prevent memory leaks
}
```

### ❌ Bad Practices

```typescript
// 1. DON'T emit too frequently
while (true) {
    eventBus.emit(...);  // ❌ Will flood the bus!
}

// 2. DON'T send huge payloads
eventBus.emit({
    payload: massiveObject  // ❌ 10MB of data
});

// 3. DON'T forget to unsubscribe
ngOnInit() {
    eventBus.on('EVENT').subscribe(...);  // ❌ Memory leak!
}
```

### Performance Impact

| Scenario | Impact | Solution |
|----------|--------|----------|
| 1-10 events/second | ✅ Negligible | Normal use |
| 100 events/second | ⚠️ Noticeable | Debounce/throttle |
| 1000+ events/second | ❌ Performance issue | Batch events |
| Large payloads (>1MB) | ⚠️ Slow | Send IDs, not data |

---

## Summary

### What is Event Bus?
A central communication channel where MFEs can send and receive messages without knowing about each other.

### When to Use?
- Cross-MFE communication
- Loose coupling needed
- Already using RxJS (Angular)
- Simple event-based patterns

### When NOT to Use?
- Complex state with many dependenc

Ies
- Need time-travel debugging
- Multi-framework (use Custom Events instead)
- Parent-child only (use @Input/@Output)

### Our Implementation
- File: `shared/event-bus/event-bus.service.ts`
- Uses: RxJS Subject
- Features: Type-safe, logging, debugging helpers

---

## Quick Reference

```typescript
// SEND an event
this.eventBus.emit({
    type: 'EVENT_NAME',
    source: 'sender-id',
    payload: { data: 'here' }
});

// RECEIVE an event
this.eventBus.on<PayloadType>('EVENT_NAME')
    .pipe(takeUntil(this.destroy$))
    .subscribe(event => {
        console.log(event.payload);
    });

// CLEANUP (important!)
ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
}
```
