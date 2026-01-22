/**
 * ============================================================================
 * ANALYTICS COMPONENT - Analytics Dashboard View
 * ============================================================================
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@shared/auth';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="analytics">
      <header class="page-header">
        <h1>📊 Analytics</h1>
        <p>Detailed performance metrics and insights.</p>
      </header>
      
      <!-- Charts Placeholder -->
      <section class="charts-section">
        <div class="chart-card">
          <h3>Revenue Over Time</h3>
          <div class="chart-placeholder">
            <p>📈 Chart visualization would go here</p>
            <small>Integration with charting library (e.g., Chart.js, ngx-charts)</small>
          </div>
        </div>
        
        <div class="chart-card">
          <h3>User Activity</h3>
          <div class="chart-placeholder">
            <p>📊 User activity chart</p>
            <small>Daily active users, sessions, etc.</small>
          </div>
        </div>
      </section>
      
      <!-- Data Table -->
      <section class="table-section">
        <h2>Top Performing Metrics</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current</th>
              <th>Previous</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            @for (row of tableData(); track row.metric) {
              <tr>
                <td>{{ row.metric }}</td>
                <td>{{ row.current | number }}</td>
                <td>{{ row.previous | number }}</td>
                <td [class.positive]="row.change > 0" [class.negative]="row.change < 0">
                  {{ row.change > 0 ? '+' : '' }}{{ row.change }}%
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
      
      <!-- Role-Based Content -->
      @if (isManagerOrAbove()) {
        <section class="manager-section">
          <h2>🔒 Manager Insights</h2>
          <p>This section is only visible to managers and admins.</p>
          <div class="insights-grid">
            <div class="insight-card">
              <h4>Team Performance</h4>
              <p class="big-number">94%</p>
              <p>Target completion rate</p>
            </div>
            <div class="insight-card">
              <h4>Budget Usage</h4>
              <p class="big-number">68%</p>
              <p>Of quarterly budget used</p>
            </div>
          </div>
        </section>
      }
    </div>
  `,
    styles: [`
    .analytics {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 1.5rem;
      
      h1 { margin: 0; font-size: 1.5rem; color: #1a202c; }
      p { margin: 0.25rem 0 0; color: #718096; }
    }
    
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .chart-card {
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      
      h3 { margin: 0 0 1rem; font-size: 1rem; color: #2d3748; }
    }
    
    .chart-placeholder {
      height: 200px;
      background: #f7fafc;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #a0aec0;
      
      p { margin: 0; font-size: 1.25rem; }
      small { margin-top: 0.5rem; font-size: 0.8rem; }
    }
    
    .table-section {
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      margin-bottom: 1.5rem;
      
      h2 { margin: 0 0 1rem; font-size: 1.1rem; }
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }
      
      th {
        font-weight: 600;
        color: #4a5568;
        font-size: 0.85rem;
      }
      
      td {
        color: #2d3748;
      }
      
      .positive { color: #38a169; }
      .negative { color: #e53e3e; }
    }
    
    .manager-section {
      background: #fffbeb;
      border: 2px dashed #ecc94b;
      border-radius: 10px;
      padding: 1.25rem;
      
      h2 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #744210; }
      > p { margin: 0 0 1rem; color: #975a16; }
    }
    
    .insights-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    .insight-card {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      
      h4 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #4a5568; }
      
      .big-number {
        font-size: 2rem;
        font-weight: 700;
        color: #38a169;
        margin: 0;
      }
      
      p:last-child {
        margin: 0.25rem 0 0;
        color: #718096;
        font-size: 0.85rem;
      }
    }
  `]
})
export class AnalyticsComponent {
    private authService = inject(AuthService);

    isManagerOrAbove = () => this.authService.hasRole('manager');

    tableData = signal([
        { metric: 'Revenue', current: 128500, previous: 114280, change: 12.5 },
        { metric: 'Active Users', current: 8423, previous: 7775, change: 8.3 },
        { metric: 'Orders', current: 1247, previous: 1189, change: 4.9 },
        { metric: 'Support Tickets', current: 45, previous: 52, change: -13.5 },
    ]);
}
