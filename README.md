# 🏗️ Angular MFE Architecture POC

> **A learning-focused Proof of Concept for Micro Frontend Architecture with Angular 19**

## 📚 What You'll Learn

This POC demonstrates enterprise MFE patterns in a simple, understandable way:

- 🔐 **Authentication & Authorization** - JWT tokens, guards, role-based access
- 📡 **Cross-MFE Communication** - Event Bus, Custom Events, Shared State
- 🏗️ **Architecture Patterns** - Smart/Dumb components, Facades, Signals
- ⚙️ **Module Federation** - Runtime loading, shared dependencies

## 🗂️ Project Structure

```
AngularMFE/
├── shared/                    # 📦 Shared Libraries (used by all apps)
│   ├── auth/                  # Authentication & Authorization
│   └── event-bus/             # Cross-MFE Communication
│
├── mfe-shell/                 # 🏠 Shell Application (Host)
│   └── (Login, Layout, Navigation)
│
├── mfe-dashboard/             # 📊 Dashboard MFE (Remote)
│   └── (Metrics, Analytics)
│
└── mfe-settings/              # ⚙️ Settings MFE (Remote)
    └── (Profile, Preferences)
```

## 🚀 Quick Start

### Run Each App Independently (Standalone Mode)

```bash
# Terminal 1: Shell (includes login)
cd mfe-shell
npm install
npm start
# → http://localhost:4200

# Terminal 2: Dashboard (works alone with mock auth)
cd mfe-dashboard
npm install
npm start
# → http://localhost:4201

# Terminal 3: Settings (works alone with mock auth)
cd mfe-settings
npm install
npm start
# → http://localhost:4202
```

### Run All Together (Federated Mode)

```bash
# Start all apps, then access Shell at http://localhost:4200
# Shell will load Dashboard and Settings as remote MFEs
```

## 🔐 Demo Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@demo.com | admin123 | admin |
| Manager | manager@demo.com | manager123 | manager |
| User | user@demo.com | user123 | user |

## 📖 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Overall architecture explanation
- [Authentication Guide](./docs/AUTH-GUIDE.md) - How auth works across MFEs
- [Communication Guide](./docs/COMMUNICATION.md) - Event Bus and messaging patterns
- [Getting Started](./docs/GETTING-STARTED.md) - Detailed setup instructions

## 🎯 Key Concepts Demonstrated

### 1. Each MFE is Standalone
Every MFE can run independently with its own auth. When running in Shell, it shares auth state.

### 2. No Direct Imports Between MFEs
MFEs communicate via Event Bus or Custom Events, never by importing each other's code.

### 3. Shared Libraries via NPM
Common code lives in `shared/` and is linked locally for development.

### 4. State Management
- **Global (shared)**: Only auth state, user profile, tenant context
- **Local (per MFE)**: Business state stays within each MFE using Signals

---

Built with ❤️ for learning Angular MFE Architecture
