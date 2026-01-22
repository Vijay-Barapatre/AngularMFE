/**
 * ============================================================================
 * PRESENTATIONAL COMPONENT - Metric Card (Dumb Component)
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Demonstrates the Presentational (Dumb) Component pattern.
 * This component only receives data via @Input() and emits events via @Output().
 * It has NO service dependencies and is purely for rendering.
 * 
 * 🎯 SMART vs PRESENTATIONAL:
 * 
 * SMART (Container) Components:
 * - Inject services
 * - Handle subscriptions
 * - Manage side effects
 * - Know about state/store
 * 
 * PRESENTATIONAL (Dumb) Components:
 * - Only @Input() and @Output()
 * - No service dependencies
 * - Pure rendering logic
 * - Highly reusable
 * 
 * 💡 BENEFITS:
 * - Easy to test (just pass inputs, check outputs)
 * - Highly reusable across features
 * - Clear separation of concerns
 * - Works well with OnPush change detection
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================================================
// TYPES
// ============================================================================

export interface MetricData {
    id: string;
    name: string;
    value: number;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    percentChange?: number;
}

// ============================================================================
// PRESENTATIONAL COMPONENT
// ============================================================================

/**
 * 📊 METRIC CARD COMPONENT
 * 
 * A presentational component that displays a single metric.
 * 
 * @example
 * <app-metric-card
 *   [metric]="{ id: '1', name: 'Revenue', value: 50000, unit: '$', trend: 'up' }"
 *   [selected]="false"
 *   (select)="onMetricSelected($event)">
 * </app-metric-card>
 */
@Component({
    selector: 'app-metric-card',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,  // 👈 Performance optimization
    template: `
        <div 
            class="metric-card"
            [class.selected]="selected"
            [class.trend-up]="metric?.trend === 'up'"
            [class.trend-down]="metric?.trend === 'down'"
            (click)="onCardClick()"
            (keydown.enter)="onCardClick()"
            tabindex="0"
            role="button"
            [attr.aria-label]="metric?.name + ': ' + metric?.value">
            
            <!-- Metric Name -->
            <h3 class="metric-name">{{ metric?.name }}</h3>
            
            <!-- Metric Value -->
            <div class="metric-value">
                <span class="unit" *ngIf="metric?.unit && !unitAfter">{{ metric?.unit }}</span>
                <span class="value">{{ formatValue(metric?.value) }}</span>
                <span class="unit" *ngIf="metric?.unit && unitAfter">{{ metric?.unit }}</span>
            </div>
            
            <!-- Trend Indicator -->
            <div class="metric-trend" *ngIf="metric?.trend">
                <span class="trend-icon">
                    {{ getTrendIcon(metric?.trend) }}
                </span>
                <span class="trend-value" *ngIf="metric?.percentChange !== undefined">
                    {{ formatPercent(metric?.percentChange) }}
                </span>
            </div>
        </div>
    `,
    styles: [`
        .metric-card {
            padding: 1.5rem;
            border-radius: 12px;
            background: var(--card-bg, #ffffff);
            border: 2px solid var(--border-color, #e2e8f0);
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .metric-card:focus {
            border-color: var(--primary-color, #3b82f6);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .metric-card.selected {
            border-color: var(--primary-color, #3b82f6);
            background: var(--primary-bg, #eff6ff);
        }
        
        .metric-card.trend-up {
            border-left: 4px solid var(--success-color, #10b981);
        }
        
        .metric-card.trend-down {
            border-left: 4px solid var(--danger-color, #ef4444);
        }
        
        .metric-name {
            margin: 0 0 0.5rem 0;
            font-size: 0.875rem;
            color: var(--text-secondary, #64748b);
            font-weight: 500;
        }
        
        .metric-value {
            display: flex;
            align-items: baseline;
            gap: 0.25rem;
        }
        
        .value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary, #1e293b);
        }
        
        .unit {
            font-size: 1rem;
            color: var(--text-secondary, #64748b);
        }
        
        .metric-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.5rem;
            font-size: 0.875rem;
        }
        
        .trend-up .metric-trend {
            color: var(--success-color, #10b981);
        }
        
        .trend-down .metric-trend {
            color: var(--danger-color, #ef4444);
        }
        
        .trend-icon {
            font-size: 1rem;
        }
    `]
})
export class MetricCardComponent {
    // =========================================================================
    // INPUTS (Data from parent)
    // =========================================================================

    /** The metric data to display */
    @Input() metric: MetricData | null = null;

    /** Whether this card is currently selected */
    @Input() selected = false;

    /** Whether to show unit after value (e.g., "100%" vs "$100") */
    @Input() unitAfter = false;

    // =========================================================================
    // OUTPUTS (Events to parent)
    // =========================================================================

    /** Emitted when the card is clicked */
    @Output() select = new EventEmitter<MetricData>();

    /** Emitted when the card is double-clicked */
    @Output() details = new EventEmitter<MetricData>();

    // =========================================================================
    // TEMPLATE HELPERS (Pure functions, no side effects)
    // =========================================================================

    onCardClick(): void {
        if (this.metric) {
            this.select.emit(this.metric);
        }
    }

    formatValue(value: number | undefined): string {
        if (value === undefined) return '–';

        // Format large numbers (e.g., 1000 → 1K, 1000000 → 1M)
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toLocaleString();
    }

    formatPercent(value: number | undefined): string {
        if (value === undefined) return '';
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    }

    getTrendIcon(trend: 'up' | 'down' | 'stable' | undefined): string {
        switch (trend) {
            case 'up': return '↑';
            case 'down': return '↓';
            case 'stable': return '→';
            default: return '';
        }
    }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * 📚 HOW TO USE IN A SMART (CONTAINER) COMPONENT:
 * 
 * ```typescript
 * import { MetricCardComponent, MetricData } from '@shared/patterns';
 * 
 * @Component({
 *     selector: 'app-dashboard',
 *     standalone: true,
 *     imports: [MetricCardComponent],
 *     template: `
 *         <div class="metrics-grid">
 *             @for (metric of metrics(); track metric.id) {
 *                 <app-metric-card
 *                     [metric]="metric"
 *                     [selected]="selectedId() === metric.id"
 *                     (select)="onMetricSelect($event)">
 *                 </app-metric-card>
 *             }
 *         </div>
 *     `
 * })
 * export class DashboardComponent {
 *     // Smart component handles data fetching
 *     private dashboardService = inject(DashboardService);
 *     
 *     metrics = signal<MetricData[]>([]);
 *     selectedId = signal<string | null>(null);
 *     
 *     constructor() {
 *         // Load data
 *         this.dashboardService.getMetrics().subscribe(data => {
 *             this.metrics.set(data);
 *         });
 *     }
 *     
 *     onMetricSelect(metric: MetricData): void {
 *         this.selectedId.set(metric.id);
 *         // Handle selection (analytics, navigation, etc.)
 *     }
 * }
 * ```
 */
