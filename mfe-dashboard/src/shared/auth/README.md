# 🔐 Shared Auth Library

> **Secure authentication and authorization for the MFE ecosystem**

## 📖 What This Library Provides

This library handles all authentication concerns across the MFE architecture:

| Feature | File | Description |
|---------|------|-------------|
| **Auth State** | `auth.service.ts` | Login/logout, user state with Signals |
| **Token Management** | `token.service.ts` | Secure storage with encryption |
| **Route Protection** | `auth.guard.ts` | Functional guard for routes |
| **Role-Based Access** | `role.guard.ts` | Check user roles/permissions |
| **HTTP Interceptor** | `auth.interceptor.ts` | Auto-attach tokens to requests |

## 🎯 Key Concepts Demonstrated

### 1. Angular Signals for State
```typescript
// Instead of BehaviorSubject, we use Signals (Angular 16+)
private _user = signal<User | null>(null);
readonly user = this._user.asReadonly();  // Expose as readonly
```

### 2. Functional Guards (Angular 15+)
```typescript
// New way - functional guard (recommended)
export const authGuard = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

### 3. Simulated JWT (No Backend Required)
```typescript
// We generate a fake JWT client-side for learning
const token = btoa(JSON.stringify({ user, exp: Date.now() + 3600000 }));
```

## 📂 Files

```
shared/auth/
├── index.ts                    # Public API exports
├── auth.service.ts             # 🔐 Main auth service with Signals
├── token.service.ts            # 🔑 Token storage/encryption
├── auth.guard.ts               # 🛡️ Route protection
├── role.guard.ts               # 👤 Role-based access
├── auth.interceptor.ts         # 📡 HTTP token attachment
├── auth.models.ts              # 📋 TypeScript interfaces
└── README.md                   # This file
```

## 🔧 Usage

### In Shell (manages auth)
```typescript
// Login
await authService.login('admin@demo.com', 'admin123');

// Check auth state
if (authService.isAuthenticated()) {
  // User is logged in
}

// Logout
authService.logout();
```

### In MFEs (reads auth)
```typescript
// Subscribe to auth changes
effect(() => {
  const user = authService.user();
  console.log('User changed:', user);
});

// Check role
if (authService.hasRole('admin')) {
  // Show admin features
}
```
