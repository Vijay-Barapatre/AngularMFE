/**
 * ============================================================================
 * LOGIN COMPONENT - User Authentication Page
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Provides a login form where users enter credentials and authenticate.
 * On successful login, redirects to the dashboard (or returnUrl).
 * 
 * 🎯 KEY CONCEPTS DEMONSTRATED:
 * 1. Angular Signals - For reactive form state
 * 2. Reactive Forms - For form validation
 * 3. AuthService - For authentication logic
 * 4. Router - For navigation after login
 * 
 * 💡 PATTERN: Smart Component
 * This is a "smart" (container) component because it:
 * - Injects services
 * - Handles business logic (login)
 * - Manages state (form, loading, error)
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, DEMO_USERS } from '@shared/auth';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <!-- 
      ============================================================================
      LOGIN PAGE LAYOUT
      ============================================================================
      
      Simple centered card with:
      - Title
      - Login form
      - Demo credentials info
      - Error message display
    -->
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <h1>🏢 MFE Shell</h1>
          <p>Micro Frontend Architecture POC</p>
        </div>
        
        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              placeholder="Enter your email"
              [disabled]="isLoading()"
              required
            />
          </div>
          
          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Enter your password"
              [disabled]="isLoading()"
              required
            />
          </div>
          
          <!-- Error Message -->
          @if (error()) {
            <div class="error-message">
              ❌ {{ error() }}
            </div>
          }
          
          <!-- Submit Button -->
          <button 
            type="submit" 
            class="login-button"
            [disabled]="isLoading() || !email || !password"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Logging in...
            } @else {
              🔐 Login
            }
          </button>
        </form>
        
        <!-- Demo Credentials Info -->
        <div class="demo-info">
          <h3>📋 Demo Credentials</h3>
          <p>Use these test accounts to explore different roles:</p>
          <div class="credentials-list">
            @for (user of demoUsers; track user.email) {
              <button 
                class="credential-btn"
                (click)="fillCredentials(user.email, user.password)"
                type="button"
              >
                <span class="role-badge" [attr.data-role]="user.role">
                  {{ user.role }}
                </span>
                <span class="user-email">{{ user.email }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    /* 
      ============================================================================
      LOGIN PAGE STYLES
      ============================================================================
    */
    
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }
    
    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
      
      h1 {
        margin: 0;
        font-size: 1.75rem;
        color: #333;
      }
      
      p {
        margin: 0.5rem 0 0;
        color: #666;
        font-size: 0.9rem;
      }
    }
    
    .login-form {
      margin-bottom: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1.25rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
      }
      
      input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
        
        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        &:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
      }
    }
    
    .error-message {
      background: #fee2e2;
      color: #b91c1c;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    .login-button {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .demo-info {
      border-top: 1px solid #eee;
      padding-top: 1.5rem;
      
      h3 {
        margin: 0 0 0.5rem;
        font-size: 0.95rem;
        color: #333;
      }
      
      p {
        margin: 0 0 1rem;
        color: #666;
        font-size: 0.85rem;
      }
    }
    
    .credentials-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .credential-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      text-align: left;
      
      &:hover {
        background: #f0f0f0;
        border-color: #667eea;
      }
    }
    
    .role-badge {
      padding: 0.25rem 0.625rem;
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
    
    .user-email {
      color: #333;
      font-size: 0.9rem;
    }
  `]
})
export class LoginComponent {
    // ===========================================================================
    // DEPENDENCY INJECTION
    // ===========================================================================

    /**
     * 💉 INJECT PATTERN (Angular 14+)
     * 
     * Using inject() function instead of constructor injection.
     * Benefits:
     * - Less boilerplate
     * - Works in functions (guards, interceptors)
     * - Cleaner inheritance
     */
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    // ===========================================================================
    // COMPONENT STATE (Signals)
    // ===========================================================================

    /**
     * 📊 SIGNALS FOR STATE
     * 
     * Using signals instead of plain properties for reactivity.
     * Signals automatically trigger updates when values change.
     */
    email = '';
    password = '';

    /** Loading state - shown during login request */
    isLoading = signal(false);

    /** Error message - shown if login fails */
    error = signal<string | null>(null);

    /** Demo users for quick fill */
    demoUsers = DEMO_USERS;

    // ===========================================================================
    // METHODS
    // ===========================================================================

    /**
     * Handle form submission.
     * 
     * 📋 WHAT HAPPENS:
     * 1. Set loading state
     * 2. Clear previous error
     * 3. Call AuthService.login()
     * 4. On success: Navigate to returnUrl or dashboard
     * 5. On error: Show error message
     */
    async onSubmit(): Promise<void> {
        // Prevent double submission
        if (this.isLoading()) return;

        // Set loading state
        this.isLoading.set(true);
        this.error.set(null);

        try {
            // Attempt login
            await this.authService.login(this.email, this.password);

            // Get return URL from query params (if redirected from protected route)
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

            // Navigate to the return URL
            console.log('[LoginComponent] Login successful, navigating to:', returnUrl);
            await this.router.navigateByUrl(returnUrl);

        } catch (err) {
            // Show error message
            const message = err instanceof Error ? err.message : 'Login failed';
            this.error.set(message);
            console.error('[LoginComponent] Login failed:', message);

        } finally {
            // Clear loading state
            this.isLoading.set(false);
        }
    }

    /**
     * Fill credentials from demo user buttons.
     * Makes testing easier.
     */
    fillCredentials(email: string, password: string): void {
        this.email = email;
        this.password = password;
        this.error.set(null);  // Clear any previous error
    }
}
