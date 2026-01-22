# 🏠 MFE Shell Application

> **The host application for the Micro Frontend Architecture**

## 📖 What This Application Does

The Shell is the **host application** that:

1. **Manages Authentication** - Login/logout, token storage
2. **Provides Layout** - Header, sidebar, navigation
3. **Loads MFEs** - Remote applications loaded at runtime
4. **Shares State** - Auth state available to all MFEs

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Visit: http://localhost:4200

## 📁 Project Structure

```
mfe-shell/
├── src/
│   ├── app/
│   │   ├── app.component.ts        # Root component (minimal)
│   │   ├── app.config.ts           # App configuration & providers
│   │   ├── app.routes.ts           # Route definitions with guards
│   │   │
│   │   ├── layout/
│   │   │   └── shell-layout/       # Main layout (header, sidebar)
│   │   │
│   │   └── features/
│   │       ├── auth/
│   │       │   └── login/          # Login page
│   │       ├── dashboard/          # Placeholder (will be MFE)
│   │       ├── settings/           # Placeholder (will be MFE)
│   │       └── unauthorized/       # Access denied page
│   │
│   ├── styles.scss                 # Global styles
│   └── index.html                  # Entry HTML
│
└── tsconfig.json                   # TypeScript config with path mappings
```

## 🔐 Authentication Flow

```
1. User visits /dashboard (protected)
         ↓
2. authGuard checks isAuthenticated()
         ↓
3. Not authenticated → Redirect to /login
         ↓
4. User enters credentials and submits
         ↓
5. AuthService.login() validates credentials
         ↓
6. Token stored (encrypted) in sessionStorage
         ↓
7. Auth state updated (signal)
         ↓
8. User redirected to /dashboard
         ↓
9. authGuard passes → Dashboard renders
```

## 📋 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Manager | manager@demo.com | manager123 |
| User | user@demo.com | user123 |
| Guest | guest@demo.com | guest123 |

## 🔗 Shared Libraries Used

This application uses shared libraries from `../shared/`:

| Library | Purpose |
|---------|---------|
| `@shared/auth` | AuthService, TokenService, Guards, Interceptor |
| `@shared/event-bus` | EventBusService, CustomEventService |

## 📡 Events Published

The Shell publishes these events via EventBus:

| Event | When | Payload |
|-------|------|---------|
| `USER_LOGGED_OUT` | User clicks logout | `{ userId }` |
| `NAVIGATE_TO` | User clicks nav link | `{ path }` |

## 🛠️ Configuration

### Path Mappings (tsconfig.json)

```json
{
  "paths": {
    "@shared/auth": ["../shared/auth/index.ts"],
    "@shared/event-bus": ["../shared/event-bus/index.ts"]
  }
}
```

### Route Guards

Routes are protected using functional guards:

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard/...'),
  canActivate: [authGuard]  // Must be authenticated
}
```

## 🎓 Key Concepts Demonstrated

1. **Standalone Components** - No NgModules
2. **Functional Guards** - Modern Angular 15+ pattern
3. **Signals** - Reactive state management
4. **HTTP Interceptors** - Auto-attach JWT tokens
5. **Lazy Loading** - Load components on demand
6. **Event Bus** - Cross-MFE communication
