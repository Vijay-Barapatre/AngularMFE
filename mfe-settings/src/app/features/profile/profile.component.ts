/**
 * ============================================================================
 * PROFILE COMPONENT - User Profile Settings
 * ============================================================================
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@shared/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile">
      <header class="page-header">
        <h1>👤 Profile</h1>
        <p>View and manage your profile information.</p>
      </header>
      
      <section class="profile-card">
        <div class="avatar-section">
          <img [src]="user()?.avatar" [alt]="user()?.name" class="avatar" />
          <div class="user-info">
            <h2>{{ user()?.name }}</h2>
            <p>{{ user()?.email }}</p>
            <span class="role-badge" [attr.data-role]="user()?.role">
              {{ user()?.role }}
            </span>
          </div>
        </div>
        
        <div class="details-grid">
          <div class="detail-item">
            <label>User ID</label>
            <span>{{ user()?.id }}</span>
          </div>
          <div class="detail-item">
            <label>Role</label>
            <span>{{ user()?.role }}</span>
          </div>
          <div class="detail-item">
            <label>Email</label>
            <span>{{ user()?.email }}</span>
          </div>
          <div class="detail-item">
            <label>Status</label>
            <span>Active</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .profile { max-width: 800px; margin: 0 auto; }
    .page-header {
      margin-bottom: 1.5rem;
      h1 { margin: 0; font-size: 1.5rem; color: #22543d; }
      p { margin: 0.25rem 0 0; color: #718096; }
    }
    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .avatar-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
    }
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid #38a169;
    }
    .user-info {
      h2 { margin: 0; font-size: 1.25rem; color: #1a202c; }
      p { margin: 0.25rem 0 0.5rem; color: #718096; }
    }
    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      &[data-role="admin"] { background: #fed7d7; color: #c53030; }
      &[data-role="manager"] { background: #fefcbf; color: #975a16; }
      &[data-role="user"] { background: #bee3f8; color: #2b6cb0; }
      &[data-role="guest"] { background: #e2e8f0; color: #4a5568; }
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .detail-item {
      label { display: block; font-size: 0.85rem; color: #718096; margin-bottom: 0.25rem; }
      span { font-weight: 500; color: #2d3748; }
    }
  `]
})
export class ProfileComponent {
  private authService = inject(AuthService);
  user = this.authService.user;
}
