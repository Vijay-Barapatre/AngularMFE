/**
 * ============================================================================
 * EVENT MONITOR COMPONENT - Cross-MFE Event Subscription Demo
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Demonstrates receiving events from other MFEs via the Event Bus.
 * Shows events from Dashboard (METRIC_SELECTED, DASHBOARD_LOADED, etc.)
 * 
 * 🎯 KEY LEARNING:
 * This is where you see the Event Bus subscription in action!
 */

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    EventBusService,
    EventTypes,
    MfeEvent,
    MetricSelectedPayload
} from '@shared/event-bus';
import { Subject, takeUntil } from 'rxjs';

interface ReceivedEvent {
    type: string;
    source: string;
    payload: unknown;
    timestamp: number;
    receivedAt: Date;
}

@Component({
    selector: 'app-event-monitor',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="event-monitor">
      <header class="page-header">
        <h1>📡 Event Monitor</h1>
        <p>Real-time view of cross-MFE communication via the Event Bus.</p>
      </header>
      
      <section class="info-section">
        <h2>🎓 How This Works</h2>
        <p>
          This component subscribes to events from <strong>all sources</strong> via the Event Bus.
          When Dashboard selects a metric, or any MFE publishes an event, it appears here.
        </p>
        <div class="code-sample">
          <code>eventBus.onAny([METRIC_SELECTED, DASHBOARD_LOADED]).subscribe(event =&gt; ...)</code>
        </div>
      </section>
      
      <section class="stats-section">
        <div class="stat-card">
          <span class="stat-value">{{ receivedEvents().length }}</span>
          <span class="stat-label">Events Received</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ eventBus.getDebugInfo().eventCount }}</span>
          <span class="stat-label">Total Bus Events</span>
        </div>
      </section>
      
      <section class="events-section">
        <div class="events-header">
          <h2>📋 Received Events</h2>
          <button (click)="clearEvents()" class="clear-btn">🗑️ Clear</button>
        </div>
        
        @if (receivedEvents().length === 0) {
          <div class="empty-state">
            <p>🎧 Listening for events...</p>
            <small>
              Go to the <strong>Dashboard MFE</strong> (port 4201) and click a metric
              to see events appear here!
            </small>
          </div>
        } @else {
          <div class="events-list">
            @for (event of receivedEvents(); track event.timestamp) {
              <article class="event-card" [attr.data-source]="event.source">
                <div class="event-header">
                  <span class="event-type">{{ event.type }}</span>
                  <span class="event-source">from {{ event.source }}</span>
                  <span class="event-time">{{ event.receivedAt | date:'HH:mm:ss' }}</span>
                </div>
                <pre class="event-payload">{{ event.payload | json }}</pre>
              </article>
            }
          </div>
        }
      </section>
    </div>
  `,
    styles: [`
    .event-monitor { max-width: 800px; margin: 0 auto; }
    
    .page-header {
      margin-bottom: 1.5rem;
      h1 { margin: 0; font-size: 1.5rem; color: #22543d; }
      p { margin: 0.25rem 0 0; color: #718096; }
    }
    
    .info-section {
      background: #f0fff4;
      border: 1px solid #c6f6d5;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      h2 { margin: 0 0 0.5rem; font-size: 1rem; color: #22543d; }
      p { margin: 0; color: #2f855a; font-size: 0.9rem; }
    }
    
    .code-sample {
      margin-top: 0.75rem;
      code {
        display: block;
        background: #22543d;
        color: #9ae6b4;
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        overflow-x: auto;
      }
    }
    
    .stats-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .stat-card {
      flex: 1;
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      .stat-value { 
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: #38a169;
      }
      .stat-label {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.85rem;
        color: #718096;
      }
    }
    
    .events-section {
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .events-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      h2 { margin: 0; font-size: 1.1rem; }
    }
    
    .clear-btn {
      padding: 0.5rem 1rem;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      &:hover { background: #edf2f7; }
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #718096;
      p { margin: 0; font-size: 1.1rem; }
      small { display: block; margin-top: 0.75rem; }
      strong { color: #38a169; }
    }
    
    .events-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .event-card {
      background: #f7fafc;
      border-radius: 8px;
      padding: 1rem;
      border-left: 4px solid #38a169;
      
      &[data-source="mfe-dashboard"] { border-left-color: #4299e1; }
      &[data-source="mfe-shell"] { border-left-color: #667eea; }
    }
    
    .event-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    
    .event-type {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.9rem;
    }
    
    .event-source {
      font-size: 0.8rem;
      color: #718096;
    }
    
    .event-time {
      margin-left: auto;
      font-size: 0.75rem;
      color: #a0aec0;
    }
    
    .event-payload {
      margin: 0;
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      color: #4a5568;
      white-space: pre-wrap;
    }
  `]
})
export class EventMonitorComponent implements OnInit, OnDestroy {
    eventBus = inject(EventBusService);
    private destroy$ = new Subject<void>();

    receivedEvents = signal<ReceivedEvent[]>([]);

    ngOnInit(): void {
        console.log('[EventMonitor] Subscribing to all events...');

        // Subscribe to multiple event types at once
        this.eventBus.onAny([
            EventTypes.METRIC_SELECTED,
            EventTypes.DASHBOARD_LOADED,
            EventTypes.REFRESH_REQUESTED,
            EventTypes.USER_LOGGED_IN,
            EventTypes.USER_LOGGED_OUT,
            EventTypes.NAVIGATE_TO,
        ]).pipe(takeUntil(this.destroy$)).subscribe((event: MfeEvent) => {
            console.log('[EventMonitor] Received event:', event);
            this.addEvent(event);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private addEvent(event: MfeEvent): void {
        this.receivedEvents.update(events => [
            {
                type: event.type,
                source: event.source,
                payload: event.payload,
                timestamp: event.timestamp,
                receivedAt: new Date()
            },
            ...events.slice(0, 19)  // Keep last 20
        ]);
    }

    clearEvents(): void {
        this.receivedEvents.set([]);
    }
}
