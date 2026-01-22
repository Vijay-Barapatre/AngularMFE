/**
 * ============================================================================
 * SHELL LAYOUT COMPONENT - Main Application Layout
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Provides the main layout for authenticated users, including:
 * - Header with user info and logout
 * - Sidebar navigation
 * - Content area (router outlet)
 * 
 * 🎯 KEY CONCEPTS DEMONSTRATED:
 * 1. Angular Signals - Reading auth state reactively
 * 2. Event Bus - Publishing navigation events
 * 3. Layout Pattern - Separating layout from content
 * 
 * 💡 PATTERN: Smart Component
 * This is a "smart" component - it injects services and handles logic.
 * The child routes are where actual content lives.
 */

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@shared/auth';
import { EventBusService, EventTypes, MfeSources } from '@shared/event-bus';

@Component({
    selector: 'app-shell-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <!-- 
      ============================================================================
      SHELL LAYOUT STRUCTURE
      ============================================================================
      
      ┌─────────────────────────────────────────────────────┐
      │                      HEADER                         │
      ├───────────┬─────────────────────────────────────────┤
      │           │                                         │
      │  SIDEBAR  │              CONTENT                    │
      │           │          (router-outlet)                │
      │           │                                         │
      └───────────┴─────────────────────────────────────────┘
    -->
    
    <div class="shell-layout">
      <!-- ================================================================== -->
      <!-- HEADER -->
      <!-- ================================================================== -->
      <header class="shell-header">
        <div class="header-left">
          <h1 class="logo">🏢 MFE Shell</h1>
        </div>
        
        <div class="header-right">
          <!-- User Info -->
          @if (user()) {
            <div class="user-info">
              <img 
                [src]="user()?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" 
                [alt]="user()?.name"
                class="user-avatar"
              />
              <div class="user-details">
                <span class="user-name">{{ user()?.name }}</span>
                <span class="user-role" [attr.data-role]="user()?.role">
                  {{ user()?.role }}
                </span>
              </div>
            </div>
          }
          
          <!-- Logout Button -->
          <button class="logout-btn" (click)="onLogout()">
            🚪 Logout
          </button>
        </div>
      </header>
      
      <!-- ================================================================== -->
      <!-- MAIN CONTENT AREA -->
      <!-- ================================================================== -->
      <div class="shell-content">
        <!-- Sidebar Navigation -->
        <aside class="shell-sidebar">
          <nav class="nav-menu">
            <!-- Dashboard Link -->
            <a 
              routerLink="/dashboard" 
              routerLinkActive="active"
              class="nav-item"
              (click)="onNavigate('/dashboard')"
            >
              <span class="nav-icon">📊</span>
              <span class="nav-label">Dashboard</span>
            </a>
            
            <!-- Settings Link -->
            <a 
              routerLink="/settings" 
              routerLinkActive="active"
              class="nav-item"
              (click)="onNavigate('/settings')"
            >
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Settings</span>
            </a>
            
            <!-- Admin Panel (only for admins) -->
            @if (isAdmin()) {
              <a 
                routerLink="/admin" 
                routerLinkActive="active"
                class="nav-item"
              >
                <span class="nav-icon">🔧</span>
                <span class="nav-label">Admin</span>
              </a>
            }
          </nav>
          
          <!-- Sidebar Footer -->
          <div class="sidebar-footer">
            <p class="mfe-info">
              MFE Architecture POC<br/>
              <small>Angular 19 + Signals</small>
            </p>
          </div>
        </aside>
        
        <!-- Main Content (Child Routes) -->
        <main class="shell-main">
          <!-- 
            🎯 ROUTER OUTLET
            Child routes from app.routes.ts render here:
            - /dashboard → DashboardComponent
            - /settings → SettingsComponent
          -->
          <router-outlet />
        </main>
      </div>
    </div>
  `,
    styles: [`
    /* 
      ============================================================================
      SHELL LAYOUT STYLES
      ============================================================================
    */
    
    .shell-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f7fa;
    }
    
    /* ============================== HEADER ============================== */
    
    .shell-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1.5rem;
      height: 64px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .logo {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 500;
      font-size: 0.95rem;
    }
    
    .user-role {
      font-size: 0.75rem;
      text-transform: uppercase;
      opacity: 0.9;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.2);
      width: fit-content;
    }
    
    .logout-btn {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
    
    /* ============================== CONTENT ============================== */
    
    .shell-content {
      display: flex;
      flex: 1;
    }
    
    /* ============================== SIDEBAR ============================== */
    
    .shell-sidebar {
      width: 240px;
      background: white;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      padding: 1rem 0;
    }
    
    .nav-menu {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0 0.75rem;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: #333;
      transition: background 0.2s, color 0.2s;
      
      &:hover {
        background: #f0f0f0;
      }
      
      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }
    
    .nav-icon {
      font-size: 1.25rem;
    }
    
    .nav-label {
      font-weight: 500;
    }
    
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid #e0e0e0;
      margin-top: auto;
    }
    
    .mfe-info {
      margin: 0;
      text-align: center;
      color: #888;
      font-size: 0.8rem;
      line-height: 1.4;
    }
    
    /* ============================== MAIN ============================== */
    
    .shell-main {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
  `]
})
export class ShellLayoutComponent {
    // ===========================================================================
    // DEPENDENCY INJECTION
    // ===========================================================================

    private authService = inject(AuthService);
    private eventBus = inject(EventBusService);

    // ===========================================================================
    // SIGNALS / COMPUTED
    // ===========================================================================

    /**
     * 📊 USER STATE FROM AUTH SERVICE
     * 
     * We expose the auth service's signals directly.
     * Signals are reactive - template updates automatically.
     */
    user = this.authService.user;

    /**
     * 📊 COMPUTED: Is user an admin?
     * 
     * computed() creates a derived signal.
     * It automatically recalculates when dependencies change.
     */
    isAdmin = computed(() => this.authService.hasRole('admin'));

    // ===========================================================================
    // METHODS
    // ===========================================================================

    /**
     * Handle logout button click.
     * 
     * 📤 PUBLISHES EVENT:
     * Other MFEs can listen for USER_LOGGED_OUT to clean up their state.
     */
    onLogout(): void {
        console.log('[ShellLayout] Logging out...');

        // Publish logout event BEFORE actual logout
        // (so MFEs can clean up while still having user context)
        this.eventBus.emit({
            type: EventTypes.USER_LOGGED_OUT,
            source: MfeSources.SHELL,
            payload: { userId: this.user()?.id }
        });

        // Perform logout (clears token, resets state)
        this.authService.logout();

        // Router will redirect to login via authGuard
    }

    /**
     * Handle navigation clicks.
     * 
     * 📤 PUBLISHES EVENT:
     * MFEs can listen for NAVIGATE_TO events to know when user navigates.
     */
    onNavigate(path: string): void {
        console.log('[ShellLayout] Navigating to:', path);

        this.eventBus.emit({
            type: EventTypes.NAVIGATE_TO,
            source: MfeSources.SHELL,
            payload: { path }
        });
    }
}
