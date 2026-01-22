# 🔐 Authentication & Authorization Guide

> **Complete guide to securing your MFE Architecture**

## 📊 Overview

This guide covers:
1. Authentication flow
2. Token management
3. Route protection with guards
4. Role-based access control (RBAC)
5. HTTP interceptors

---

## 🔄 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User visits /dashboard (protected route)                        │
│                    │                                                 │
│                    ▼                                                 │
│  2. authGuard checks isAuthenticated()                              │
│                    │                                                 │
│        ┌──────────┴──────────┐                                      │
│        │                     │                                       │
│      FALSE                  TRUE                                     │
│        │                     │                                       │
│        ▼                     ▼                                       │
│  3a. Redirect to          3b. Load                                  │
│      /login                   component                              │
│        │                                                             │
│        ▼                                                             │
│  4. User submits credentials                                        │
│        │                                                             │
│        ▼                                                             │
│  5. AuthService.login() validates                                   │
│        │                                                             │
│        ┌──────────┴──────────┐                                      │
│        │                     │                                       │
│     SUCCESS                FAILURE                                   │
│        │                     │                                       │
│        ▼                     ▼                                       │
│  6a. Store token +        6b. Show                                  │
│      Update state            error                                   │
│        │                                                             │
│        ▼                                                             │
│  7. Redirect to returnUrl                                           │
│        │                                                             │
│        ▼                                                             │
│  8. authGuard passes → Load component                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 AuthService

The central authentication service manages all auth state using Angular Signals.

### Key Signals (State)

```typescript
// Private writable signal
private _authState = signal<AuthState>(INITIAL_AUTH_STATE);

// Public readonly derived signals
readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
readonly user = computed(() => this._authState().user);
readonly userRole = computed(() => this._authState().user?.role ?? null);
readonly isLoading = computed(() => this._authState().isLoading);
readonly error = computed(() => this._authState().error);
```

### Methods

| Method | Description |
|--------|-------------|
| `login(email, password)` | Authenticate user, store token |
| `logout()` | Clear token and state |
| `hasRole(role)` | Check if user has role or higher |
| `hasAnyRole(roles[])` | Check if user has any of the roles |

### Usage in Components

```typescript
@Component({
  template: `
    @if (auth.isAuthenticated()) {
      <p>Welcome, {{ auth.user()?.name }}!</p>
      <button (click)="auth.logout()">Logout</button>
    }
  `
})
export class HeaderComponent {
  auth = inject(AuthService);
}
```

---

## 🔒 Token Management

### TokenService

Handles secure token storage with encryption.

```typescript
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly STORAGE_KEY = 'mfe_auth_token';
  
  // Store with encryption
  setToken(token: string): void {
    const encrypted = this.encrypt(token);
    sessionStorage.setItem(this.STORAGE_KEY, encrypted);
  }
  
  // Retrieve and decrypt
  getToken(): string | null {
    const encrypted = sessionStorage.getItem(this.STORAGE_KEY);
    return encrypted ? this.decrypt(encrypted) : null;
  }
  
  // Decode JWT payload (without verification)
  decodeToken(): TokenPayload | null { ... }
  
  // Check expiration
  isTokenExpired(): boolean { ... }
}
```

### Why sessionStorage?

| Storage | Persistence | Security |
|---------|-------------|----------|
| sessionStorage | Tab/browser close clears it | Better for auth |
| localStorage | Persists forever | Less secure |
| Cookies (HttpOnly) | Best security | Requires backend |

---

## 🛡️ Route Guards

### authGuard - Require Authentication

```typescript
// Functional guard (Angular 15+)
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;  // Allow access
  }
  
  // Redirect to login with return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

### publicGuard - Redirect Authenticated Users

```typescript
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true;  // Allow access to login page
  }
  
  // Already logged in, go to dashboard
  return router.createUrlTree(['/dashboard']);
};
```

### Route Configuration

```typescript
export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./login/login.component'),
    canActivate: [publicGuard]  // Redirect if authenticated
  },
  
  // Protected routes
  {
    path: '',
    loadComponent: () => import('./layout/shell-layout.component'),
    canActivate: [authGuard],  // Must be authenticated
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/...') },
      { path: 'settings', loadComponent: () => import('./settings/...') },
    ]
  }
];
```

---

## 👥 Role-Based Access Control (RBAC)

### Role Hierarchy

```
ADMIN (highest)
   │
   ├── Can access: Everything
   │
MANAGER
   │
   ├── Can access: Manager + User + Guest features
   │
USER
   │
   ├── Can access: User + Guest features
   │
GUEST (lowest)
   │
   └── Can access: Guest features only
```

### roleGuard Factory

```typescript
// Factory function that returns a guard
export function roleGuard(requiredRole: UserRole): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }
    
    if (authService.hasRole(requiredRole)) {
      return true;
    }
    
    // No permission - redirect to unauthorized
    return router.createUrlTree(['/unauthorized']);
  };
}
```

### Usage in Routes

```typescript
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component'),
  canActivate: [authGuard, roleGuard('admin')]  // Both must pass
}
```

### Role-Based UI in Templates

```typescript
@Component({
  template: `
    <!-- Show to all authenticated users -->
    <nav>
      <a routerLink="/dashboard">Dashboard</a>
      <a routerLink="/settings">Settings</a>
      
      <!-- Only for admins -->
      @if (auth.hasRole('admin')) {
        <a routerLink="/admin">Admin Panel</a>
      }
      
      <!-- For managers and above -->
      @if (auth.hasRole('manager')) {
        <a routerLink="/team">Team Management</a>
      }
    </nav>
  `
})
export class NavComponent {
  auth = inject(AuthService);
}
```

---

## 📡 HTTP Interceptor

Automatically attaches JWT token to all HTTP requests.

### authInterceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();
  
  if (token) {
    // Clone request with Authorization header
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  
  return next(req);
};
```

### Registration in app.config.ts

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

---

## 🔐 Demo Credentials

For testing the POC:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Manager | manager@demo.com | manager123 |
| User | user@demo.com | user123 |
| Guest | guest@demo.com | guest123 |

---

## ⚠️ Security Notes

> [!CAUTION]
> This POC uses **simulated JWT tokens** generated client-side.
> In production, tokens must be issued by a secure backend server
> and validated on every API request.

### Production Recommendations

1. **Use HttpOnly Cookies** for token storage (prevents XSS)
2. **Implement CSRF protection** when using cookies
3. **Use short-lived access tokens** with refresh tokens
4. **Validate tokens on the server** for every API call
5. **Use HTTPS everywhere**

---

## 📚 Related Files

- [auth.service.ts](../mfe-shell/src/shared/auth/auth.service.ts) - Main auth service
- [token.service.ts](../mfe-shell/src/shared/auth/token.service.ts) - Token management
- [auth.guard.ts](../mfe-shell/src/shared/auth/auth.guard.ts) - Route protection
- [role.guard.ts](../mfe-shell/src/shared/auth/role.guard.ts) - RBAC guards
- [auth.interceptor.ts](../mfe-shell/src/shared/auth/auth.interceptor.ts) - HTTP interceptor
