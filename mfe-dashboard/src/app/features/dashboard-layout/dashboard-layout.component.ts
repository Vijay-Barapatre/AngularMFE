/**
 * ============================================================================
 * DASHBOARD LAYOUT COMPONENT - Layout for Dashboard Features
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Provides a layout for the dashboard with tabs/navigation.
 * When running standalone, shows a header. When in Shell, is minimal.
 */

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@shared/auth';

@Component({
    selector: 'app-dashboard-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="dashboard-layout">
      <!-- Standalone Header (only when running independently) -->
      @if (isStandalone) {
        <header class="standalone-header">
          <span>📊 Dashboard MFE (Standalone)</span>
          <div class="header-right">
            <span class="user-info">{{ user()?.email }}</span>
            <button (click)="logout()">Logout</button>
          </div>
        </header>
      }
      
      <!-- Dashboard Navigation -->
      <nav class="dashboard-nav">
        <a routerLink="overview" routerLinkActive="active">📈 Overview</a>
        <a routerLink="analytics" routerLinkActive="active">📊 Analytics</a>
      </nav>
      
      <!-- Content -->
      <main class="dashboard-content">
        <router-outlet />
      </main>
    </div>
  `,
    styles: [`
    .dashboard-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f7fafc;
    }
    
    .standalone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: #2d3748;
      color: white;
      
      span { font-weight: 500; }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .user-info {
        font-size: 0.9rem;
        opacity: 0.9;
      }
      
      button {
        padding: 0.5rem 1rem;
        background: rgba(255,255,255,0.1);
        color: white;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        cursor: pointer;
        
        &:hover { background: rgba(255,255,255,0.2); }
      }
    }
    
    .dashboard-nav {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      
      a {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        color: #4a5568;
        font-weight: 500;
        transition: all 0.2s;
        
        &:hover {
          background: #edf2f7;
        }
        
        &.active {
          background: #667eea;
          color: white;
        }
      }
    }
    
    .dashboard-content {
      flex: 1;
      padding: 1.5rem;
    }
  `]
})
export class DashboardLayoutComponent {
    private authService = inject(AuthService);

    user = this.authService.user;

    /**
     * Detect if running standalone (not inside Shell).
     * When loaded by Shell, we're in an iframe or the Shell layout is present.
     * 
     * Simple detection: check if we're on port 4201 (dashboard's port).
     */
    isStandalone = window.location.port === '4201';

    logout(): void {
        this.authService.logout();
    }
}
