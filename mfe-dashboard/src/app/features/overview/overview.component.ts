/**
 * ============================================================================
 * OVERVIEW COMPONENT - Main Dashboard View
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * The main dashboard overview with metrics cards that publish events
 * to the Event Bus for other MFEs to consume.
 * 
 * 🎯 KEY CONCEPTS:
 * 1. Smart Component Pattern - Injects services, manages state
 * 2. Event Bus Publishing - Sends events when metrics are selected
 * 3. Signals State - Uses Angular signals for reactive data
 */

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@shared/auth';
import {
    EventBusService,
    EventTypes,
    MfeSources,
    MetricSelectedPayload
} from '@shared/event-bus';
import { Subject, takeUntil } from 'rxjs';

interface Metric {
    id: string;
    title: string;
    value: number;
    unit: string;
    change: number;
    icon: string;
    color: string;
}

interface Activity {
    id: string;
    message: string;
    time: string;
    type: 'success' | 'warning' | 'info';
}

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="overview">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <h1>👋 Welcome back, {{ userName() }}!</h1>
        <p>Here's what's happening with your metrics today.</p>
      </section>
      
      <!-- Metrics Grid -->
      <section class="metrics-section">
        <h2>📊 Key Metrics</h2>
        <p class="hint">Click a metric to publish an event to other MFEs</p>
        
        <div class="metrics-grid">
          @for (metric of metrics(); track metric.id) {
            <article 
              class="metric-card"
              [style.--accent-color]="metric.color"
              (click)="onMetricClick(metric)"
              [class.selected]="selectedMetricId() === metric.id"
            >
              <div class="metric-icon">{{ metric.icon }}</div>
              <div class="metric-info">
                <p class="metric-title">{{ metric.title }}</p>
                <p class="metric-value">
                  {{ metric.value | number }}
                  <span class="metric-unit">{{ metric.unit }}</span>
                </p>
                <p class="metric-change" [class.positive]="metric.change > 0" [class.negative]="metric.change < 0">
                  {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}% from last month
                </p>
              </div>
            </article>
          }
        </div>
      </section>
      
      <!-- Recent Activity -->
      <section class="activity-section">
        <h2>📋 Recent Activity</h2>
        <div class="activity-list">
          @for (activity of activities(); track activity.id) {
            <div class="activity-item" [attr.data-type]="activity.type">
              <span class="activity-dot"></span>
              <div class="activity-content">
                <p>{{ activity.message }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          }
        </div>
      </section>
      
      <!-- Event Log -->
      <section class="event-section">
        <h2>📡 Events Published</h2>
        <p>Events sent to the Event Bus from this MFE:</p>
        
        @if (publishedEvents().length === 0) {
          <p class="no-events">No events published yet. Click a metric above!</p>
        } @else {
          <div class="event-log">
            @for (event of publishedEvents(); track event.timestamp) {
              <div class="event-item">
                <span class="event-type">{{ event.type }}</span>
                <pre>{{ event.payload | json }}</pre>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
    styles: [`
    .overview {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    section {
      margin-bottom: 2rem;
    }
    
    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #1a202c;
    }
    
    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      color: #2d3748;
    }
    
    .welcome-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      
      p {
        margin: 0.5rem 0 0;
        opacity: 0.9;
      }
    }
    
    .hint {
      color: #718096;
      font-size: 0.85rem;
      margin: 0 0 1rem;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    
    .metric-card {
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      gap: 1rem;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      &.selected {
        border-color: var(--accent-color);
        background: color-mix(in srgb, var(--accent-color) 5%, white);
      }
    }
    
    .metric-icon {
      font-size: 2rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--accent-color) 15%, white);
      border-radius: 10px;
    }
    
    .metric-info {
      flex: 1;
    }
    
    .metric-title {
      margin: 0;
      font-size: 0.85rem;
      color: #718096;
    }
    
    .metric-value {
      margin: 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      
      .metric-unit {
        font-size: 0.85rem;
        font-weight: 400;
        color: #a0aec0;
      }
    }
    
    .metric-change {
      margin: 0;
      font-size: 0.8rem;
      
      &.positive { color: #38a169; }
      &.negative { color: #e53e3e; }
    }
    
    .activity-section {
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .activity-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      
      [data-type="success"] & { background: #38a169; }
      [data-type="warning"] & { background: #ecc94b; }
      [data-type="info"] & { background: #4299e1; }
    }
    
    .activity-content {
      flex: 1;
      
      p { margin: 0; color: #2d3748; }
    }
    
    .activity-time {
      font-size: 0.8rem;
      color: #a0aec0;
    }
    
    .event-section {
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      
      p { margin: 0 0 1rem; color: #718096; font-size: 0.9rem; }
    }
    
    .no-events {
      text-align: center;
      padding: 2rem;
      color: #a0aec0;
    }
    
    .event-log {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .event-item {
      background: #f7fafc;
      border-radius: 6px;
      padding: 0.75rem;
      border-left: 3px solid #667eea;
    }
    
    .event-type {
      font-weight: 600;
      color: #667eea;
      font-size: 0.85rem;
    }
    
    pre {
      margin: 0.5rem 0 0;
      font-size: 0.8rem;
      color: #4a5568;
      white-space: pre-wrap;
    }
  `]
})
export class OverviewComponent implements OnInit, OnDestroy {
    private authService = inject(AuthService);
    private eventBus = inject(EventBusService);
    private destroy$ = new Subject<void>();

    userName = signal('');
    selectedMetricId = signal<string | null>(null);
    publishedEvents = signal<Array<{ type: string; payload: unknown; timestamp: number }>>([]);

    metrics = signal<Metric[]>([
        { id: '1', title: 'Total Revenue', value: 128500, unit: 'USD', change: 12.5, icon: '💰', color: '#38a169' },
        { id: '2', title: 'Active Users', value: 8423, unit: 'users', change: 8.3, icon: '👥', color: '#4299e1' },
        { id: '3', title: 'Conversion Rate', value: 3.24, unit: '%', change: -2.1, icon: '📈', color: '#ed8936' },
        { id: '4', title: 'Avg. Response Time', value: 245, unit: 'ms', change: 5.7, icon: '⚡', color: '#9f7aea' },
    ]);

    activities = signal<Activity[]>([
        { id: '1', message: 'New user registration completed', time: '5 min ago', type: 'success' },
        { id: '2', message: 'Server load reached 80% capacity', time: '12 min ago', type: 'warning' },
        { id: '3', message: 'Weekly report generated', time: '1 hour ago', type: 'info' },
        { id: '4', message: 'Database backup completed', time: '3 hours ago', type: 'success' },
    ]);

    ngOnInit(): void {
        const user = this.authService.user();
        this.userName.set(user?.name || 'User');

        // Publish dashboard loaded event
        this.eventBus.emit({
            type: EventTypes.DASHBOARD_LOADED,
            source: MfeSources.DASHBOARD,
            payload: { timestamp: Date.now() }
        });

        // Listen for settings updates
        this.eventBus.on(EventTypes.SETTINGS_UPDATED)
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                console.log('[Dashboard] Settings updated:', event.payload);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onMetricClick(metric: Metric): void {
        this.selectedMetricId.set(metric.id);

        const payload: MetricSelectedPayload = {
            metricId: metric.id,
            metricName: metric.title,
            value: metric.value
        };

        // Publish event
        this.eventBus.emit({
            type: EventTypes.METRIC_SELECTED,
            source: MfeSources.DASHBOARD,
            payload
        });

        // Track published events
        this.publishedEvents.update(events => [
            { type: EventTypes.METRIC_SELECTED, payload, timestamp: Date.now() },
            ...events.slice(0, 4)
        ]);
    }
}
