/**
 * ============================================================================
 * STANDALONE LOGIN COMPONENT - For Independent MFE Development
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Provides a simplified login page for running Dashboard MFE independently.
 * This allows developers to work on the Dashboard without running the Shell.
 * 
 * 🎯 STANDALONE APP PRINCIPLE:
 * When running with `npm start`, this MFE can authenticate users directly.
 * When loaded by Shell, the Shell handles authentication and this page
 * is never shown.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, DEMO_USERS } from '@shared/auth';

@Component({
    selector: 'app-standalone-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-container">
      <div class="login-card">
        <div class="mfe-badge">📊 MFE-Dashboard (Standalone)</div>
        <h1>Developer Login</h1>
        <p>This login is only shown when running Dashboard independently.</p>
        
        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password"
              required
            />
          </div>
          
          @if (error()) {
            <div class="error">{{ error() }}</div>
          }
          
          <button type="submit" [disabled]="isLoading()">
            @if (isLoading()) { Logging in... } @else { Login }
          </button>
        </form>
        
        <div class="quick-login">
          <p>Quick access:</p>
          <div class="user-buttons">
            @for (user of demoUsers; track user.email) {
              <button 
                type="button"
                (click)="quickLogin(user.email, user.password)"
                class="user-btn"
              >
                {{ user.role }}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      padding: 1rem;
    }
    
    .login-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    
    .mfe-badge {
      background: #e2e8f0;
      color: #4a5568;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      color: #1a202c;
    }
    
    p {
      margin: 0 0 1.5rem;
      color: #718096;
      font-size: 0.9rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #4a5568;
      }
      
      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 1rem;
        box-sizing: border-box;
        
        &:focus {
          outline: none;
          border-color: #667eea;
        }
      }
    }
    
    .error {
      background: #fed7d7;
      color: #c53030;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    
    button[type="submit"] {
      width: 100%;
      padding: 0.875rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      
      &:hover:not(:disabled) {
        background: #5a67d8;
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    .quick-login {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      
      p {
        margin: 0 0 0.75rem;
        color: #718096;
        font-size: 0.85rem;
      }
    }
    
    .user-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .user-btn {
      padding: 0.5rem 1rem;
      background: #edf2f7;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      text-transform: capitalize;
      
      &:hover {
        background: #e2e8f0;
      }
    }
  `]
})
export class StandaloneLoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    email = '';
    password = '';
    isLoading = signal(false);
    error = signal<string | null>(null);
    demoUsers = DEMO_USERS;

    async onSubmit(): Promise<void> {
        if (this.isLoading()) return;

        this.isLoading.set(true);
        this.error.set(null);

        try {
            await this.authService.login(this.email, this.password);
            await this.router.navigate(['/overview']);
        } catch (e) {
            this.error.set(e instanceof Error ? e.message : 'Login failed');
        } finally {
            this.isLoading.set(false);
        }
    }

    async quickLogin(email: string, password: string): Promise<void> {
        this.email = email;
        this.password = password;
        await this.onSubmit();
    }
}
