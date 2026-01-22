/**
 * ============================================================================
 * DASHBOARD COMPONENT - Main Dashboard View
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * This is a placeholder dashboard component for the Shell application.
 * In the full MFE setup, this would be replaced by the remote MFE-Dashboard.
 * 
 * 🎯 KEY CONCEPTS DEMONSTRATED:
 * 1. Reading auth state from shared AuthService
 * 2. Publishing events via EventBus
 * 3. Simple dashboard UI with metrics cards
 * 
 * 💡 NOTE:
 * When you set up Module Federation, this component would be replaced by:
 * loadRemoteModule({ remoteName: 'mfe-dashboard', exposedModule: './Component' })
 */

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@shared/auth';
import { EventBusService, EventTypes, MfeSources, MetricSelectedPayload } from '@shared/event-bus';
import { Subject, takeUntil } from 'rxjs';

/**
 * Metric data interface.
 */
interface Metric {
    id: string;
    title: string;
    value: number;
    unit: string;
    trend: number;
    icon: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <!-- 
      ============================================================================
      DASHBOARD LAYOUT
      ============================================================================
    -->
    <div class="dashboard">
      <!-- Page Header -->
      <header class="page-header">
        <div>
          <h1>📊 Dashboard</h1>
          <p>Welcome back, {{ userName() }}! Here's your overview.</p>
        </div>
        <button class="refresh-btn" (click)="onRefresh()">
          🔄 Refresh
        </button>
      </header>
      
      <!-- Metrics Grid -->
      <section class="metrics-grid">
        @for (metric of metrics(); track metric.id) {
          <article 
            class="metric-card"
            (click)="onMetricClick(metric)"
            [class.selected]="selectedMetric()?.id === metric.id"
          >
            <div class="metric-header">
              <span class="metric-icon">{{ metric.icon }}</span>
              <span 
                class="metric-trend"
                [class.positive]="metric.trend > 0"
                [class.negative]="metric.trend < 0"
              >
                {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
              </span>
            </div>
            <div class="metric-body">
              <h3 class="metric-title">{{ metric.title }}</h3>
              <p class="metric-value">
                {{ metric.value | number }}
                <span class="metric-unit">{{ metric.unit }}</span>
              </p>
            </div>
          </article>
        }
      </section>
      
      <!-- Recent Activity (Placeholder) -->
      <section class="activity-section">
        <h2>📋 Recent Activity</h2>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-icon">✅</span>
            <div class="activity-content">
              <p>System health check completed</p>
              <span class="activity-time">2 minutes ago</span>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">📧</span>
            <div class="activity-content">
              <p>New user registration</p>
              <span class="activity-time">15 minutes ago</span>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">🔄</span>
            <div class="activity-content">
              <p>Data sync completed</p>
              <span class="activity-time">1 hour ago</span>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Event Bus Demo -->
      <section class="demo-section">
        <h2>📡 Cross-MFE Communication Demo</h2>
        <p>Click a metric card above to publish a METRIC_SELECTED event.</p>
        <p>The Settings MFE would receive this event via the Event Bus.</p>
        
        @if (selectedMetric()) {
          <div class="event-preview">
            <strong>Last Event Sent:</strong>
            <pre>{{ eventPreview() | json }}</pre>
          </div>
        }
      </section>
    </div>
  `,
    styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      
      h1 {
        margin: 0;
        font-size: 1.75rem;
        color: #333;
      }
      
      p {
        margin: 0.25rem 0 0;
        color: #666;
      }
    }
    
    .refresh-btn {
      padding: 0.625rem 1.25rem;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
      
      &:hover {
        background: #f0f0f0;
        border-color: #667eea;
      }
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    
    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }
      
      &.selected {
        border-color: #667eea;
        background: #f8f9ff;
      }
    }
    
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .metric-icon {
      font-size: 1.5rem;
    }
    
    .metric-trend {
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      
      &.positive {
        background: #dcfce7;
        color: #15803d;
      }
      
      &.negative {
        background: #fee2e2;
        color: #b91c1c;
      }
    }
    
    .metric-title {
      margin: 0 0 0.5rem;
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }
    
    .metric-value {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
    }
    
    .metric-unit {
      font-size: 0.875rem;
      color: #888;
      font-weight: 400;
    }
    
    .activity-section, .demo-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      margin-bottom: 1.5rem;
      
      h2 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #333;
      }
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .activity-icon {
      font-size: 1.25rem;
    }
    
    .activity-content {
      flex: 1;
      
      p {
        margin: 0;
        color: #333;
      }
    }
    
    .activity-time {
      font-size: 0.8rem;
      color: #888;
    }
    
    .demo-section {
      p {
        margin: 0.5rem 0;
        color: #666;
      }
    }
    
    .event-preview {
      margin-top: 1rem;
      padding: 1rem;
      background: #f0f4f8;
      border-radius: 8px;
      
      strong {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
      }
      
      pre {
        margin: 0;
        font-size: 0.85rem;
        color: #667eea;
        white-space: pre-wrap;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
    // ===========================================================================
    // DEPENDENCY INJECTION
    // ===========================================================================

    private authService = inject(AuthService);
    private eventBus = inject(EventBusService);

    // ===========================================================================
    // STATE
    // ===========================================================================

    /** For cleanup on destroy */
    private destroy$ = new Subject<void>();

    /** Current user's name */
    userName = signal('');

    /** Selected metric (for demo) */
    selectedMetric = signal<Metric | null>(null);

    /** Preview of last sent event */
    eventPreview = signal<object | null>(null);

    /** Sample metrics data */
    metrics = signal<Metric[]>([
        { id: '1', title: 'Total Revenue', value: 125430, unit: 'USD', trend: 12.5, icon: '💰' },
        { id: '2', title: 'Active Users', value: 8523, unit: 'users', trend: 8.3, icon: '👥' },
        { id: '3', title: 'Conversion Rate', value: 3.24, unit: '%', trend: -2.1, icon: '📈' },
        { id: '4', title: 'Response Time', value: 245, unit: 'ms', trend: 5.7, icon: '⚡' },
    ]);

    // ===========================================================================
    // LIFECYCLE
    // ===========================================================================

    ngOnInit(): void {
        // Set username from auth state
        const user = this.authService.user();
        if (user) {
            this.userName.set(user.name);
        }

        // Listen for incoming events (example)
        this.eventBus.on(EventTypes.SETTINGS_UPDATED)
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                console.log('[Dashboard] Settings updated:', event.payload);
            });

        // Publish dashboard loaded event
        this.eventBus.emit({
            type: EventTypes.DASHBOARD_LOADED,
            source: MfeSources.DASHBOARD,
            payload: { timestamp: Date.now() }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ===========================================================================
    // METHODS
    // ===========================================================================

    /**
     * Handle metric card click.
     * Publishes METRIC_SELECTED event for other MFEs.
     */
    onMetricClick(metric: Metric): void {
        console.log('[Dashboard] Metric clicked:', metric.title);

        this.selectedMetric.set(metric);

        // Create the event payload
        const payload: MetricSelectedPayload = {
            metricId: metric.id,
            metricName: metric.title,
            value: metric.value
        };

        // Publish to Event Bus
        this.eventBus.emit({
            type: EventTypes.METRIC_SELECTED,
            source: MfeSources.DASHBOARD,
            payload
        });

        // Update preview
        this.eventPreview.set({
            type: EventTypes.METRIC_SELECTED,
            source: MfeSources.DASHBOARD,
            payload
        });
    }

    /**
     * Handle refresh button click.
     */
    onRefresh(): void {
        console.log('[Dashboard] Refresh requested');

        this.eventBus.emit({
            type: EventTypes.REFRESH_REQUESTED,
            source: MfeSources.DASHBOARD,
            payload: {}
        });
    }
}
