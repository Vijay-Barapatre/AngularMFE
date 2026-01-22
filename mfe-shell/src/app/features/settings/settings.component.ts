/**
 * ============================================================================
 * SETTINGS COMPONENT - User Settings Page
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Placeholder settings component demonstrating:
 * - Event Bus subscription (listening to Dashboard events)
 * - Role-based UI visibility
 * - Event publishing (theme changes, etc.)
 * 
 * 🎯 KEY CONCEPTS DEMONSTRATED:
 * 1. Subscribing to Event Bus events from other MFEs
 * 2. Showing/hiding UI based on user role
 * 3. Publishing settings updates
 */

import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@shared/auth';
import {
    EventBusService,
    EventTypes,
    MfeSources,
    MetricSelectedPayload,
    ThemeChangedPayload
} from '@shared/event-bus';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="settings">
      <!-- Page Header -->
      <header class="page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your preferences and account settings.</p>
      </header>
      
      <!-- Profile Section -->
      <section class="settings-section">
        <h2>👤 Profile</h2>
        <div class="settings-card">
          <div class="profile-row">
            <img 
              [src]="user()?.avatar" 
              [alt]="user()?.name"
              class="profile-avatar"
            />
            <div class="profile-info">
              <h3>{{ user()?.name }}</h3>
              <p>{{ user()?.email }}</p>
              <span class="role-badge" [attr.data-role]="user()?.role">
                {{ user()?.role }}
              </span>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Preferences Section -->
      <section class="settings-section">
        <h2>🎨 Preferences</h2>
        <div class="settings-card">
          <div class="setting-item">
            <label>Theme</label>
            <div class="theme-options">
              @for (theme of themes; track theme) {
                <button 
                  class="theme-btn"
                  [class.active]="currentTheme() === theme"
                  (click)="onThemeChange(theme)"
                >
                  {{ themeIcons[theme] }} {{ theme }}
                </button>
              }
            </div>
          </div>
        </div>
      </section>
      
      <!-- Admin-Only Section -->
      @if (isAdmin()) {
        <section class="settings-section admin-section">
          <h2>🔧 Admin Settings</h2>
          <p class="admin-notice">
            These settings are only visible to administrators.
          </p>
          <div class="settings-card">
            <div class="setting-item">
              <label>System Maintenance Mode</label>
              <input type="checkbox" class="toggle" />
            </div>
            <div class="setting-item">
              <label>Debug Logging</label>
              <input type="checkbox" class="toggle" checked />
            </div>
          </div>
        </section>
      }
      
      <!-- Event Bus Demo Section -->
      <section class="settings-section">
        <h2>📡 Event Bus Listener</h2>
        <p>Listening for events from other MFEs...</p>
        
        <div class="events-log">
          @if (receivedEvents().length === 0) {
            <p class="no-events">
              No events received yet. 
              <br/>
              <small>Go to Dashboard and click a metric to see events here!</small>
            </p>
          } @else {
            @for (event of receivedEvents(); track event.timestamp) {
              <div class="event-item">
                <span class="event-type">{{ event.type }}</span>
                <span class="event-source">from {{ event.source }}</span>
                <pre class="event-payload">{{ event.payload | json }}</pre>
              </div>
            }
          }
        </div>
        
        <button class="clear-btn" (click)="clearEvents()">
          🗑️ Clear Events
        </button>
      </section>
    </div>
  `,
    styles: [`
    .settings {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .page-header {
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
    
    .settings-section {
      margin-bottom: 2rem;
      
      h2 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #333;
      }
    }
    
    .settings-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .profile-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid #667eea;
    }
    
    .profile-info {
      h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #333;
      }
      
      p {
        margin: 0.25rem 0 0.5rem;
        color: #666;
      }
    }
    
    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      
      &[data-role="admin"] {
        background: #fee2e2;
        color: #b91c1c;
      }
      
      &[data-role="manager"] {
        background: #fef3c7;
        color: #b45309;
      }
      
      &[data-role="user"] {
        background: #dbeafe;
        color: #1d4ed8;
      }
      
      &[data-role="guest"] {
        background: #e5e7eb;
        color: #4b5563;
      }
    }
    
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      label {
        font-weight: 500;
        color: #333;
      }
    }
    
    .theme-options {
      display: flex;
      gap: 0.5rem;
    }
    
    .theme-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: #667eea;
      }
      
      &.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }
    }
    
    .admin-section {
      border: 2px dashed #b91c1c;
      border-radius: 12px;
      padding: 1.5rem;
      background: #fef2f2;
    }
    
    .admin-notice {
      margin: 0 0 1rem;
      padding: 0.75rem;
      background: #fee2e2;
      border-radius: 8px;
      color: #b91c1c;
      font-size: 0.9rem;
    }
    
    .toggle {
      width: 48px;
      height: 24px;
      cursor: pointer;
    }
    
    .events-log {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .no-events {
      text-align: center;
      color: #888;
      padding: 2rem;
      margin: 0;
      
      small {
        display: block;
        margin-top: 0.5rem;
      }
    }
    
    .event-item {
      background: white;
      border-radius: 6px;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-left: 3px solid #667eea;
    }
    
    .event-type {
      font-weight: 600;
      color: #667eea;
    }
    
    .event-source {
      font-size: 0.8rem;
      color: #888;
      margin-left: 0.5rem;
    }
    
    .event-payload {
      margin: 0.5rem 0 0;
      font-size: 0.8rem;
      color: #666;
      white-space: pre-wrap;
    }
    
    .clear-btn {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      
      &:hover {
        background: #f0f0f0;
      }
    }
  `]
})
export class SettingsComponent implements OnInit, OnDestroy {
    // ===========================================================================
    // DEPENDENCY INJECTION
    // ===========================================================================

    private authService = inject(AuthService);
    private eventBus = inject(EventBusService);

    // ===========================================================================
    // STATE
    // ===========================================================================

    private destroy$ = new Subject<void>();

    /** Current user */
    user = this.authService.user;

    /** Is user an admin? */
    isAdmin = computed(() => this.authService.hasRole('admin'));

    /** Available themes */
    themes = ['light', 'dark', 'system'] as const;
    themeIcons: Record<string, string> = { light: '☀️', dark: '🌙', system: '💻' };

    /** Current theme */
    currentTheme = signal<string>('light');

    /** Received events from other MFEs */
    receivedEvents = signal<Array<{ type: string; source: string; payload: unknown; timestamp: number }>>([]);

    // ===========================================================================
    // LIFECYCLE
    // ===========================================================================

    ngOnInit(): void {
        console.log('[Settings] Component initialized');

        /**
         * 📥 SUBSCRIBE TO EVENTS FROM OTHER MFEs
         * 
         * This demonstrates how Settings listens for Dashboard events.
         * When Dashboard publishes METRIC_SELECTED, we receive it here.
         */
        this.eventBus.on<MetricSelectedPayload>(EventTypes.METRIC_SELECTED)
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                console.log('[Settings] Received metric selection:', event);
                this.addReceivedEvent(event.type, event.source, event.payload, event.timestamp);
            });

        // Listen for any navigation events
        this.eventBus.on(EventTypes.NAVIGATE_TO)
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                console.log('[Settings] Navigation event:', event);
                this.addReceivedEvent(event.type, event.source, event.payload, event.timestamp);
            });

        // Listen for refresh requests
        this.eventBus.on(EventTypes.REFRESH_REQUESTED)
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                console.log('[Settings] Refresh requested:', event);
                this.addReceivedEvent(event.type, event.source, event.payload, event.timestamp);
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
     * Handle theme change.
     * Publishes THEME_CHANGED event for other MFEs.
     */
    onThemeChange(theme: string): void {
        console.log('[Settings] Theme changed to:', theme);

        this.currentTheme.set(theme);

        // Publish theme change event
        const payload: ThemeChangedPayload = {
            theme: theme as 'light' | 'dark' | 'system'
        };

        this.eventBus.emit({
            type: EventTypes.THEME_CHANGED,
            source: MfeSources.SETTINGS,
            payload
        });

        // Also publish as SETTINGS_UPDATED
        this.eventBus.emit({
            type: EventTypes.SETTINGS_UPDATED,
            source: MfeSources.SETTINGS,
            payload: { setting: 'theme', oldValue: this.currentTheme(), newValue: theme }
        });
    }

    /**
     * Add event to the received events list.
     */
    private addReceivedEvent(type: string, source: string, payload: unknown, timestamp: number): void {
        this.receivedEvents.update(events => [
            { type, source, payload, timestamp },
            ...events.slice(0, 9)  // Keep last 10 events
        ]);
    }

    /**
     * Clear the events log.
     */
    clearEvents(): void {
        this.receivedEvents.set([]);
    }
}
