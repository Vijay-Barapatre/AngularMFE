/**
 * ============================================================================
 * SETTINGS LAYOUT COMPONENT
 * ============================================================================
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@shared/auth';

@Component({
    selector: 'app-settings-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="settings-layout">
      @if (isStandalone) {
        <header class="standalone-header">
          <span>⚙️ Settings MFE (Standalone)</span>
          <div class="header-right">
            <span>{{ user()?.email }}</span>
            <button (click)="logout()">Logout</button>
          </div>
        </header>
      }
      
      <nav class="settings-nav">
        <a routerLink="profile" routerLinkActive="active">👤 Profile</a>
        <a routerLink="preferences" routerLinkActive="active">🎨 Preferences</a>
        <a routerLink="events" routerLinkActive="active">📡 Event Monitor</a>
      </nav>
      
      <main class="settings-content">
        <router-outlet />
      </main>
    </div>
  `,
    styles: [`
    .settings-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f0fff4;
    }
    .standalone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: #2f855a;
      color: white;
      .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
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
    .settings-nav {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: white;
      border-bottom: 1px solid #c6f6d5;
      a {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        color: #2f855a;
        font-weight: 500;
        transition: all 0.2s;
        &:hover { background: #f0fff4; }
        &.active { background: #38a169; color: white; }
      }
    }
    .settings-content {
      flex: 1;
      padding: 1.5rem;
    }
  `]
})
export class SettingsLayoutComponent {
    private authService = inject(AuthService);
    user = this.authService.user;
    isStandalone = window.location.port === '4202';

    logout(): void {
        this.authService.logout();
    }
}
