/**
 * ============================================================================
 * PREFERENCES COMPONENT - User Preferences
 * ============================================================================
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventBusService, EventTypes, MfeSources, ThemeChangedPayload } from '@shared/event-bus';

@Component({
    selector: 'app-preferences',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="preferences">
      <header class="page-header">
        <h1>🎨 Preferences</h1>
        <p>Customize your experience.</p>
      </header>
      
      <section class="prefs-card">
        <h2>Theme</h2>
        <p>Select your preferred color scheme.</p>
        <div class="theme-options">
          @for (theme of themes; track theme) {
            <button 
              [class.active]="currentTheme() === theme"
              (click)="setTheme(theme)"
            >
              {{ themeIcons[theme] }} {{ theme }}
            </button>
          }
        </div>
      </section>
      
      <section class="prefs-card">
        <h2>Notifications</h2>
        <div class="toggle-item">
          <label>Email notifications</label>
          <input type="checkbox" [(ngModel)]="emailNotifications" />
        </div>
        <div class="toggle-item">
          <label>Push notifications</label>
          <input type="checkbox" [(ngModel)]="pushNotifications" />
        </div>
      </section>
      
      <section class="event-info">
        <h3>📡 Event Published</h3>
        <p>When you change the theme, an event is published to the Event Bus.</p>
        <p>Other MFEs (like Dashboard) can listen for <code>THEME_CHANGED</code> events.</p>
      </section>
    </div>
  `,
    styles: [`
    .preferences { max-width: 600px; margin: 0 auto; }
    .page-header {
      margin-bottom: 1.5rem;
      h1 { margin: 0; font-size: 1.5rem; color: #22543d; }
      p { margin: 0.25rem 0 0; color: #718096; }
    }
    .prefs-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      h2 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #2d3748; }
      p { margin: 0 0 1rem; color: #718096; font-size: 0.9rem; }
    }
    .theme-options {
      display: flex;
      gap: 0.5rem;
      button {
        padding: 0.75rem 1.25rem;
        border: 2px solid #c6f6d5;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        &:hover { border-color: #38a169; }
        &.active {
          background: #38a169;
          color: white;
          border-color: #38a169;
        }
      }
    }
    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e2e8f0;
      &:last-child { border-bottom: none; }
      label { font-weight: 500; color: #2d3748; }
      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
    }
    .event-info {
      background: #f0fff4;
      border: 1px dashed #38a169;
      border-radius: 10px;
      padding: 1rem;
      h3 { margin: 0 0 0.5rem; font-size: 0.95rem; color: #22543d; }
      p { margin: 0.25rem 0; color: #2f855a; font-size: 0.85rem; }
      code { background: #c6f6d5; padding: 0.125rem 0.375rem; border-radius: 4px; }
    }
  `]
})
export class PreferencesComponent {
    private eventBus = inject(EventBusService);

    themes = ['light', 'dark', 'system'] as const;
    themeIcons: Record<string, string> = { light: '☀️', dark: '🌙', system: '💻' };
    currentTheme = signal<string>('light');

    emailNotifications = true;
    pushNotifications = false;

    setTheme(theme: string): void {
        this.currentTheme.set(theme);

        // Publish theme change event
        const payload: ThemeChangedPayload = { theme: theme as 'light' | 'dark' | 'system' };

        this.eventBus.emit({
            type: EventTypes.THEME_CHANGED,
            source: MfeSources.SETTINGS,
            payload
        });

        console.log('[Preferences] Theme changed, event published:', theme);
    }
}
