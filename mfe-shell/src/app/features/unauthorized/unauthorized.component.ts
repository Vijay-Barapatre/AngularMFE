/**
 * ============================================================================
 * UNAUTHORIZED COMPONENT - Access Denied Page
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Displayed when a user tries to access a route they don't have permission for.
 * For example, a regular user trying to access an admin-only page.
 * 
 * 🎯 WHEN SHOWN:
 * - RoleGuard returns UrlTree to '/unauthorized'
 * - User doesn't have required role for a route
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@shared/auth';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="icon">🚫</div>
        <h1>Access Denied</h1>
        <p>
          Sorry, you don't have permission to access this page.
        </p>
        
        @if (user()) {
          <p class="user-info">
            You are logged in as <strong>{{ user()?.email }}</strong> 
            with role <span class="role-badge">{{ user()?.role }}</span>.
          </p>
        }
        
        <div class="actions">
          <button class="btn-primary" (click)="goToDashboard()">
            📊 Go to Dashboard
          </button>
          <button class="btn-secondary" (click)="goBack()">
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .unauthorized-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 2rem;
    }
    
    .unauthorized-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      max-width: 450px;
    }
    
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    h1 {
      margin: 0 0 1rem;
      color: #b91c1c;
      font-size: 1.75rem;
    }
    
    p {
      color: #666;
      margin: 0 0 1rem;
      line-height: 1.5;
    }
    
    .user-info {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    
    .role-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      background: #e5e7eb;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1.5rem;
    }
    
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }
    
    .btn-secondary {
      background: white;
      color: #333;
      border: 1px solid #e0e0e0;
      
      &:hover {
        background: #f0f0f0;
      }
    }
  `]
})
export class UnauthorizedComponent {
    private router = inject(Router);
    private authService = inject(AuthService);

    user = this.authService.user;

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    goBack(): void {
        history.back();
    }
}
