# 🚀 Getting Started Guide

> **Step-by-step setup instructions for the MFE Architecture POC**

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git**
- A code editor (VS Code recommended)

---

## 🏃 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AngularMFE
```

### 2. Install Shell Dependencies

```bash
cd mfe-shell
npm install
```

### 3. Start the Application

```bash
npm start
```

### 4. Open in Browser

Navigate to: http://localhost:4200

### 5. Login

Use any of these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Manager | manager@demo.com | manager123 |
| User | user@demo.com | user123 |
| Guest | guest@demo.com | guest123 |

---

## 📂 Project Structure

```
AngularMFE/
├── README.md                    # Project overview
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # Architecture patterns
│   ├── AUTH-GUIDE.md            # Authentication guide
│   ├── COMMUNICATION.md         # Cross-MFE communication
│   └── GETTING-STARTED.md       # This file
│
├── shared/                      # 📦 Shared Libraries
│   ├── auth/                    # Authentication library
│   └── event-bus/               # Communication library
│
└── mfe-shell/                   # 🏠 Shell Application
    ├── src/
    │   ├── app/
    │   │   ├── features/        # Feature components
    │   │   └── layout/          # Layout components
    │   └── shared/              # Local copy of shared libs
    └── package.json
```

---

## 🔧 Development Workflow

### Making Changes to Shell

```bash
cd mfe-shell
npm start
# Edit files - hot reload is enabled
```

### Making Changes to Shared Libraries

Shared libraries are copied into `mfe-shell/src/shared/`.

1. Make changes in `mfe-shell/src/shared/`
2. Test in the Shell
3. Copy back to root `shared/` folder:

```bash
cd mfe-shell
xcopy /E /I /Y "src/shared" "../shared"
```

---

## 📦 Building for Production

```bash
cd mfe-shell
npm run build
```

Output: `mfe-shell/dist/mfe-shell/`

---

## 🧪 Testing Different Roles

### Admin Access
- Email: admin@demo.com / Password: admin123
- Can see: Dashboard, Settings, Admin-only features

### Manager Access
- Email: manager@demo.com / Password: manager123
- Can see: Dashboard, Settings, Manager features

### Regular User Access
- Email: user@demo.com / Password: user123
- Can see: Dashboard, Settings (limited)

---

## 📡 Testing Event Bus

1. **Login** and go to Dashboard
2. **Click a metric card** 
3. **Navigate to Settings**
4. See the event appear in the "Event Bus Listener" section

This demonstrates cross-MFE communication!

---

## 🏗️ Adding New Features

### Adding a New Route

1. Create component in `mfe-shell/src/app/features/`
2. Add to `app.routes.ts`:

```typescript
{
  path: 'new-feature',
  loadComponent: () => import('./features/new-feature/new-feature.component')
    .then(m => m.NewFeatureComponent),
  canActivate: [authGuard]  // Protect the route
}
```

### Adding a New Event Type

1. Add to `shared/event-bus/event.models.ts`:

```typescript
export const EventTypes = {
  // ... existing
  MY_NEW_EVENT: 'MY_NEW_EVENT',
} as const;

export interface MyNewEventPayload {
  someData: string;
}
```

2. Publish:

```typescript
eventBus.emit({
  type: EventTypes.MY_NEW_EVENT,
  source: 'mfe-shell',
  payload: { someData: 'hello' }
});
```

3. Subscribe:

```typescript
eventBus.on<MyNewEventPayload>(EventTypes.MY_NEW_EVENT)
  .subscribe(event => console.log(event.payload));
```

---

## 🐛 Troubleshooting

### Build Errors: "Could not resolve..."

Check `tsconfig.json` path mappings:

```json
{
  "paths": {
    "@shared/auth": ["src/shared/auth/index.ts"],
    "@shared/event-bus": ["src/shared/event-bus/index.ts"]
  }
}
```

### Routes Not Working

1. Check guard returns (`true` or `UrlTree`)
2. Check browser console for `[AuthGuard]` logs
3. Verify `AuthService.isAuthenticated()` returns expected value

### Events Not Received

1. Verify event type strings match exactly
2. Check source/subscriber are using same event type constant
3. Verify subscription is created before event is emitted
4. Check for `takeUntil` cleanup issues

---

## 📚 Learn More

| Document | Topic |
|----------|-------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Overall architecture |
| [AUTH-GUIDE.md](./AUTH-GUIDE.md) | Authentication & Authorization |
| [COMMUNICATION.md](./COMMUNICATION.md) | Cross-MFE communication |

---

## 🎓 Key Concepts to Learn

1. **Angular Signals** - Modern reactive state
2. **Functional Guards** - Route protection
3. **HTTP Interceptors** - Auto-attach tokens
4. **Lazy Loading** - Code splitting
5. **Module Federation** - Runtime MFE loading (future)

---

## 💡 Next Steps

After exploring the Shell:

1. ✅ Understand the architecture
2. ✅ Test different user roles
3. ✅ See Event Bus in action
4. 🔜 Create MFE-Dashboard (separate project)
5. 🔜 Create MFE-Settings (separate project)
6. 🔜 Configure Module Federation
7. 🔜 Connect everything together

---

Built with ❤️ for learning Angular MFE Architecture
