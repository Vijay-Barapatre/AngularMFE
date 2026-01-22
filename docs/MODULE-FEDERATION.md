# 🔌 Module Federation - Complete Guide

> **Understanding runtime micro frontend loading in the simplest terms**

## 📑 Table of Contents

1. [What is Module Federation?](#what-is-module-federation)
2. [Why Do We Need It?](#why-do-we-need-module-federation)
3. [How Does It Work?](#how-does-it-work)
4. [Code Examples](#simple-code-example)
5. [Problems Solved](#what-problems-does-it-solve)
6. [Advantages](#advantages-)
7. [Disadvantages](#disadvantages-)
8. [Alternatives](#alternative-options)
9. [Why We Selected It](#why-we-selected-native-federation)
10. [When to Use What](#when-to-use-what)
11. [Performance Considerations](#performance-considerations)
12. [Configuration](#configuration-in-this-project)
13. [Summary](#summary)
14. [Our Project Implementation](#-our-project-implementation)
15. [Use Cases & Scenarios](#-use-cases--scenarios)
16. [Advanced Design Patterns](#️-advanced-design-patterns)
17. [Advanced Features](#-advanced-features)
18. [Implementation Steps for New MFE](#-implementation-steps-for-new-mfe)

---

## What is Module Federation?

Think of Module Federation like **Netflix streaming**:

- **Without streaming**: Download the ENTIRE movie library before watching anything (slow!)
- **With streaming**: Download only the movie you want to watch, when you click play (fast!)

```
Traditional App (Download Everything):
┌─────────────────────────────────────────────┐
│  One HUGE bundle with everything            │
│  📦 Dashboard + Settings + Reports + Admin  │
│  Size: 10 MB, Load time: 10 seconds         │
└─────────────────────────────────────────────┘

Module Federation (Stream on Demand):
┌─────────────────┐
│  Shell (Host)   │  ← User loads this first (fast!)
│  📦 50 KB       │
└────────┬────────┘
         │
    User clicks "Dashboard"
         │
         ▼
┌─────────────────┐
│  Dashboard MFE  │  ← Downloaded NOW (on demand)
│  📦 from :4201  │
└─────────────────┘
```

---

## Why Do We Need Module Federation?

### The Problem: Monolithic Frontend

```
❌ THE PROBLEM (Traditional):

                 ┌─────────────────────────────┐
                 │     ONE BIG APPLICATION     │
                 │                             │
                 │  • Dashboard code           │
                 │  • Settings code            │
                 │  • Admin code               │
                 │  • Reports code             │
                 │  • All 50 developers' code  │
                 │                             │
                 │  Deploy EVERYTHING together │
                 │  Break one thing = break ALL│
                 └─────────────────────────────┘

Problems:
1. One team's bug breaks entire app
2. Deploy entire app for small change
3. Slow initial load (everything at once)
4. 50 developers = merge hell
```

### The Solution: Module Federation

```
✅ THE SOLUTION (Module Federation):

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Dashboard   │   │   Settings   │   │   Reports    │
│    Team A    │   │    Team B    │   │    Team C    │
│  Deploy: Mon │   │  Deploy: Tue │   │  Deploy: Wed │
└──────────────┘   └──────────────┘   └──────────────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Shell (Host App)    │
              │   Loads others at     │
              │   RUNTIME             │
              └───────────────────────┘

Benefits:
1. Team A deploys without affecting B or C
2. Fast initial load (shell only)
3. Each team owns their code
4. Update Dashboard = only redeploy Dashboard
```

---

## How Does It Work?

### Step 1: Remote MFE Creates Entry Point

```
Dashboard MFE builds and creates:
├── remoteEntry.json     ← "Here's what I expose"
├── app.routes.ts        ← My routes
└── components/          ← My code
```

```javascript
// federation.config.js (Dashboard)
module.exports = {
    name: 'mfe-dashboard',
    exposes: {
        './routes': './src/app/app.routes.ts'  // What I share
    }
};
```

### Step 2: Shell Knows Where to Find Remotes

```json
// federation.manifest.json (Shell)
{
    "mfe-dashboard": "http://localhost:4201/remoteEntry.json",
    "mfe-settings": "http://localhost:4202/remoteEntry.json"
}
```

### Step 3: Shell Loads Remote at Runtime

```typescript
// Shell's route config
{
    path: 'dashboard',
    loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
        .then(m => m.routes)
}
```

### Visual Flow:

```
User types: localhost:4200
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Shell loads                                              │
│    - Reads federation.manifest.json                         │
│    - Knows: Dashboard is at :4201, Settings is at :4202    │
└─────────────────────────────────────────────────────────────┘
    │
    ▼ User clicks "Dashboard"
    │
┌─────────────────────────────────────────────────────────────┐
│ 2. Shell calls: loadRemoteModule('mfe-dashboard', './routes')│
│    - Fetches: http://localhost:4201/remoteEntry.json        │
│    - Downloads Dashboard's routes and components            │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Dashboard renders INSIDE Shell's layout                  │
│    - Shell provides: Header, Sidebar, Auth                  │
│    - Dashboard provides: Content                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Simple Code Example

### Remote MFE (Dashboard) - Exposes Routes

```javascript
// mfe-dashboard/federation.config.js
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
    name: 'mfe-dashboard',
    
    // What I expose to others
    exposes: {
        './routes': './src/app/app.routes.ts',
    },
    
    // Share Angular libraries (only load once!)
    shared: {
        ...shareAll({
            singleton: true,      // Only one Angular instance
            strictVersion: true,
            requiredVersion: 'auto'
        }),
    },
});
```

### Host App (Shell) - Loads Remotes

```typescript
// mfe-shell/src/app/app.routes.ts
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
    {
        path: 'dashboard',
        loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
            .then(m => m.routes)
            .catch(err => {
                console.error('Dashboard failed to load:', err);
                // Fallback to local component
                return import('./fallback/dashboard.component')
                    .then(m => [{ path: '', component: m.DashboardComponent }]);
            }),
    },
];
```

---

## What Problems Does It Solve?

| Problem | How Module Federation Solves It |
|---------|--------------------------------|
| **Slow initial load** | Only load shell first, rest on demand |
| **One team blocks another** | Each MFE deploys independently |
| **Big bang releases** | Deploy only changed MFE |
| **Merge conflicts** | Separate repos per MFE |
| **Tech stack lock-in** | Each MFE could use different version |
| **Single point of failure** | MFE fails? Show fallback |

---

## Advantages ✅

### 1. Independent Deployment
```
Dashboard team deploys Monday
Settings team deploys Tuesday
Reports team deploys Friday

Nobody waits for anybody!
```

### 2. Faster Initial Load
```
Before: Load 10 MB → Wait 10 seconds
After:  Load 50 KB shell → Start using immediately
        Load Dashboard when needed → 500 KB
```

### 3. Team Autonomy
```
Team A: Angular 18
Team B: Angular 19
Team C: React (yes, possible!)

Each team chooses their tools.
```

### 4. Fault Isolation
```
Dashboard crashes?
→ Settings still works
→ Shell shows fallback for Dashboard
→ User can still do their job
```

### 5. Shared Dependencies
```
Angular loaded ONCE by Shell
→ Dashboard reuses it
→ Settings reuses it
→ No duplicate Angular bundles!
```

---

## Disadvantages ❌

### 1. Complexity
```
More moving parts:
- Multiple apps to run
- Multiple deployments to manage
- Network requests between apps
```

### 2. Version Mismatches
```
Shell: Angular 19.0.0
Dashboard: Angular 18.2.0

Might cause runtime errors!
Solution: Use `singleton: true` and test together
```

### 3. Network Dependency
```
Dashboard server down?
→ Dashboard won't load
→ Need fallback components
→ More error handling needed
```

### 4. Debugging Difficulty
```
Error in Dashboard?
→ Which repo is it?
→ Which team owns it?
→ Stack traces cross app boundaries
```

### 5. Shared State Complexity
```
How do MFEs share user data?
→ Need shared services (like our @shared/auth)
→ Need Event Bus for communication
→ More architecture to design
```

---

## Alternative Options

| Option | Description | Best For |
|--------|-------------|----------|
| **Module Federation** | Runtime loading via Webpack/Native Fed | Large enterprise, many teams |
| **iframe** | Each MFE in separate iframe | Complete isolation, legacy apps |
| **Web Components** | Custom elements standard | Multi-framework, browser-native |
| **Single-SPA** | Framework-agnostic orchestrator | Mixed frameworks |
| **Monorepo (Nx)** | Same repo, separate libs | Medium teams, shared code |
| **Build-time Integration** | NPM packages | Small teams, stable APIs |

### Comparison Chart

| Feature | Module Fed | iframe | Web Components | Single-SPA | Monorepo |
|---------|------------|--------|----------------|------------|----------|
| **Runtime loading** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Build-time |
| **Shared dependencies** | ✅ Yes | ❌ No | ⚠️ Partial | ✅ Yes | ✅ Yes |
| **Complete isolation** | ⚠️ Partial | ✅ Yes | ✅ Yes | ⚠️ Partial | ❌ No |
| **Performance** | ✅ Good | ❌ Poor | ✅ Good | ✅ Good | ✅ Best |
| **Debugging** | ⚠️ Medium | ❌ Hard | ⚠️ Medium | ⚠️ Medium | ✅ Easy |
| **Learning curve** | Medium | Low | High | High | Low |

---

## Why We Selected Native Federation

### Our Requirements:

| Requirement | Native Federation |
|-------------|-------------------|
| ✅ Angular 19 support | Native Fed 19 works |
| ✅ Runtime loading | Yes, via manifest |
| ✅ Share Angular core | singleton: true |
| ✅ Independent deploy | Each MFE separate |
| ✅ ES modules native | No Webpack config needed |

### Why NOT iframe?
```
- Poor performance (each iframe = separate browser context)
- Hard to share authentication
- Hard to share styling
- Can't share Angular singleton services
```

### Why NOT Web Components?
```
- More boilerplate to wrap Angular components
- Shadow DOM styling complexity
- Less mature Angular tooling
```

### Why NOT Single-SPA?
```
- Extra framework to learn
- More configuration overhead
- Native Federation is simpler for Angular-only
```

---

## When to Use What?

| Scenario | Recommendation |
|----------|---------------|
| All teams use Angular | **Module Federation** ✅ |
| Mix of React + Angular + Vue | Web Components or Single-SPA |
| Need complete isolation (security) | iframe |
| Small team, shared code needed | Monorepo (Nx) |
| Legacy system integration | iframe |
| Just want code splitting | Lazy loading (no federation needed) |

---

## Performance Considerations

### ✅ Good Practices

```typescript
// 1. Fallback for failed loads
loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
    .catch(err => import('./fallback').then(m => m.routes))  // ✅

// 2. Preload critical routes
// In Shell, preload Dashboard during idle time
@NgModule({
    providers: [
        { provide: PreloadingStrategy, useClass: PreloadAllModules }
    ]
})

// 3. Keep shared deps in sync
// All MFEs should use same Angular version
```

### ❌ Bad Practices

```typescript
// 1. DON'T expose everything
exposes: {
    './everything': './src/index.ts'  // ❌ Too much!
}

// 2. DON'T skip fallbacks
loadChildren: () => loadRemoteModule(...)  // ❌ What if it fails?

// 3. DON'T have version mismatches
// Shell: Angular 19, Dashboard: Angular 17  // ❌ Runtime errors!
```

### Performance Impact

| Metric | Impact | Mitigation |
|--------|--------|------------|
| **Initial load** | ✅ Faster (shell only) | - |
| **Navigation** | ⚠️ Extra network request | Preload routes |
| **Memory** | ✅ Only loaded MFEs | Unload unused |
| **Bundle size** | ✅ Split per MFE | Keep exposes small |
| **Cache** | ✅ Cache each MFE separately | Version URLs |

### Performance Numbers (Typical)

| Scenario | Load Time | Bundle Size |
|----------|-----------|-------------|
| Monolith | 5-10s | 2-5 MB |
| With Module Fed (Shell) | 0.5-1s | 50-200 KB |
| Loading one MFE | 0.5-2s | 200-500 KB |
| **Total with one MFE** | **1-3s** | **250-700 KB** |

---

## Configuration in This Project

### Files Overview

| File | Purpose |
|------|---------|
| `mfe-shell/federation.config.js` | Host configuration |
| `mfe-dashboard/federation.config.js` | Exposes `./routes` |
| `mfe-settings/federation.config.js` | Exposes `./routes` |
| `mfe-shell/src/assets/federation.manifest.json` | URL mapping |
| `mfe-shell/src/main.ts` | Federation initialization |

### Federation Manifest

```json
{
    "mfe-dashboard": "http://localhost:4201/remoteEntry.json",
    "mfe-settings": "http://localhost:4202/remoteEntry.json"
}
```

### Initialization

```typescript
// mfe-shell/src/main.ts
import { initFederation } from '@angular-architects/native-federation';

initFederation('/assets/federation.manifest.json')
    .then(() => import('./bootstrap'))
    .catch(err => console.error(err));
```

---

## Summary

### What is Module Federation?
Load separate applications (MFEs) at **runtime** into a host shell, like streaming movies instead of downloading everything.

### When to Use?
- Large teams (5+ developers)
- Need independent deployment
- Multiple business domains
- Want faster initial load

### When NOT to Use?
- Small team / small app
- Need complete isolation (use iframe)
- Mixed frameworks (consider Single-SPA)
- Just need code splitting (use lazy loading)

### Our Setup
- **Library**: `@angular-architects/native-federation@19`
- **Shell**: Loads Dashboard and Settings at runtime
- **Shared**: Angular core as singleton
- **Fallback**: Local components if remote fails

---

## Quick Reference

```javascript
// 1. REMOTE: Expose routes
// federation.config.js
module.exports = withNativeFederation({
    name: 'mfe-xxx',
    exposes: {
        './routes': './src/app/app.routes.ts',
    },
    shared: { ...shareAll({ singleton: true }) },
});

// 2. HOST: Declare remotes
// federation.manifest.json
{
    "mfe-xxx": "http://localhost:xxxx/remoteEntry.json"
}

// 3. HOST: Load at runtime
// app.routes.ts
{
    path: 'xxx',
    loadChildren: () => loadRemoteModule('mfe-xxx', './routes')
        .then(m => m.routes)
}
```

---

## 🔧 Our Project Implementation

### Project Structure

```
AngularMFE/
├── mfe-shell/                 ← HOST (Port 4200)
│   ├── federation.config.js   ← Host config
│   ├── src/
│   │   ├── main.ts            ← initFederation()
│   │   ├── bootstrap.ts       ← bootstrapApplication()
│   │   ├── assets/
│   │   │   └── federation.manifest.json  ← Remote URLs
│   │   └── app/
│   │       └── app.routes.ts  ← loadRemoteModule()
│
├── mfe-dashboard/             ← REMOTE (Port 4201)
│   ├── federation.config.js   ← Exposes ./routes
│   └── src/app/app.routes.ts  ← Exposed routes
│
├── mfe-settings/              ← REMOTE (Port 4202)
│   ├── federation.config.js   ← Exposes ./routes
│   └── src/app/app.routes.ts  ← Exposed routes
│
└── shared/                    ← SHARED LIBRARIES
    ├── auth/                  ← Singleton across all MFEs
    ├── event-bus/             ← Cross-MFE communication
    └── patterns/              ← Design pattern demos
```

### Key Configuration Files

**1. Shell Host Configuration:**
```javascript
// mfe-shell/federation.config.js
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
    name: 'mfe-shell',
    shared: {
        ...shareAll({
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto'
        }),
    },
    skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket']
});
```

**2. Remote MFE Configuration:**
```javascript
// mfe-dashboard/federation.config.js
module.exports = withNativeFederation({
    name: 'mfe-dashboard',
    exposes: {
        './routes': './src/app/app.routes.ts',
    },
    shared: {
        ...shareAll({
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto'
        }),
    },
    skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket']
});
```

**3. Federation Manifest:**
```json
// mfe-shell/src/assets/federation.manifest.json
{
    "mfe-dashboard": "http://localhost:4201/remoteEntry.json",
    "mfe-settings": "http://localhost:4202/remoteEntry.json"
}
```

**4. Shell Main Entry:**
```typescript
// mfe-shell/src/main.ts
import { initFederation } from '@angular-architects/native-federation';

initFederation('/assets/federation.manifest.json')
    .catch(err => console.error('Federation init failed:', err))
    .then(_ => import('./bootstrap'))
    .catch(err => console.error('Bootstrap failed:', err));
```

**5. Route Loading with Fallback:**
```typescript
// mfe-shell/src/app/app.routes.ts
{
    path: 'dashboard',
    loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
        .then(m => m.routes)
        .catch(err => {
            console.error('[Shell] Dashboard load failed:', err);
            return import('./features/dashboard/dashboard.component')
                .then(m => [{ path: '', component: m.DashboardComponent }]);
        }),
},
```

---

## 📋 Use Cases & Scenarios

### Use Case 1: Basic MFE Loading

**Scenario**: Load a remote MFE when user navigates to a route.

```typescript
// Simple case - just load routes
{
    path: 'dashboard',
    loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
        .then(m => m.routes)
}
```

### Use Case 2: Loading with Fallback (Our Implementation)

**Scenario**: Handle remote server being down gracefully.

```typescript
// With fallback component
{
    path: 'dashboard',
    loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
        .then(m => m.routes)
        .catch(err => {
            console.error('Remote failed:', err);
            // Show local fallback
            return import('./fallback/dashboard.component')
                .then(m => [{ path: '', component: m.DashboardComponent }]);
        })
}
```

### Use Case 3: Exposing Multiple Entry Points

**Scenario**: MFE exposes both routes AND individual components.

```javascript
// federation.config.js
module.exports = withNativeFederation({
    name: 'mfe-dashboard',
    exposes: {
        './routes': './src/app/app.routes.ts',
        './MetricCard': './src/app/components/metric-card.component.ts',
        './ChartWidget': './src/app/components/chart-widget.component.ts',
    },
});
```

```typescript
// Shell can load individual components
const MetricCard = await loadRemoteModule('mfe-dashboard', './MetricCard')
    .then(m => m.MetricCardComponent);
```

### Use Case 4: Dynamic Remote URL (Production)

**Scenario**: Different URLs for dev/staging/prod environments.

```typescript
// environment.ts
export const environment = {
    production: false,
    mfeManifest: '/assets/federation.manifest.json'
};

// environment.prod.ts
export const environment = {
    production: true,
    mfeManifest: 'https://cdn.mycompany.com/federation.manifest.json'
};

// main.ts
import { environment } from './environments/environment';
initFederation(environment.mfeManifest);
```

### Use Case 5: Authenticated Remote Loading

**Scenario**: Only load MFE if user has permission.

```typescript
{
    path: 'admin',
    canMatch: [roleCanMatch(['admin'])],  // Check role BEFORE loading
    loadChildren: () => loadRemoteModule('mfe-admin', './routes')
        .then(m => m.routes)
}
```

### Use Case 6: Preloading Critical MFEs

**Scenario**: Preload Dashboard while user is on login page.

```typescript
// CustomPreloadingService
@Injectable({ providedIn: 'root' })
export class MfePreloadService {
    preloadMfe(name: string, exposedModule: string): void {
        // Start loading in background
        loadRemoteModule(name, exposedModule)
            .then(() => console.log(`[Preload] ${name} ready`))
            .catch(err => console.warn(`[Preload] ${name} failed`, err));
    }
}

// In LoginComponent
ngOnInit() {
    // User will likely go to dashboard after login
    this.preloadService.preloadMfe('mfe-dashboard', './routes');
}
```

---

## 🏗️ Advanced Design Patterns

### Pattern 1: Shell as Orchestrator

```
┌─────────────────────────────────────────────────────────────────┐
│                         SHELL (Orchestrator)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Header    │  │  Sidebar    │  │      <router-outlet>    │  │
│  │   (Shell)   │  │  (Shell)    │  │    ┌─────────────────┐  │  │
│  │             │  │             │  │    │  Remote MFE     │  │  │
│  │  User info  │  │  Navigation │  │    │  Content Here   │  │  │
│  │  Logout btn │  │  Menu items │  │    │                 │  │  │
│  └─────────────┘  └─────────────┘  │    └─────────────────┘  │  │
│                                    └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Shell provides: Layout, Navigation, Auth UI, User Context
MFEs provide: Business functionality within their domain
```

### Pattern 2: Shared Services via Singleton

```typescript
// Shared service pattern - CRITICAL for MFE communication
@Injectable({
    providedIn: 'root'  // Singleton across ALL apps
})
export class AuthService {
    private _user = signal<User | null>(null);
    readonly user = this._user.asReadonly();
    
    // All MFEs get the SAME instance
    // Dashboard reads: this.authService.user()
    // Settings reads: this.authService.user()
    // Same value! 🎯
}
```

### Pattern 3: Event-Driven MFE Communication

```
┌──────────────┐                  ┌──────────────┐
│  Dashboard   │   emit event     │   Settings   │
│     MFE      │ ───────────────► │     MFE      │
│              │                  │              │
│ "Metric X    │   EVENT BUS      │ Receives:    │
│  selected"   │  (Singleton)     │ "Show metric │
│              │                  │  X details"  │
└──────────────┘                  └──────────────┘
```

```typescript
// Dashboard emits
this.eventBus.emit({
    type: 'METRIC_SELECTED',
    source: 'mfe-dashboard',
    payload: { metricId: '123' }
});

// Settings receives
this.eventBus.on('METRIC_SELECTED').subscribe(event => {
    this.showMetricDetails(event.payload.metricId);
});
```

### Pattern 4: Graceful Degradation

```typescript
// Multiple fallback levels
{
    path: 'dashboard',
    loadChildren: async () => {
        try {
            // Level 1: Try remote MFE
            return await loadRemoteModule('mfe-dashboard', './routes')
                .then(m => m.routes);
        } catch (primaryError) {
            console.warn('Primary remote failed, trying backup...');
            
            try {
                // Level 2: Try backup CDN
                return await loadRemoteModule('mfe-dashboard-backup', './routes')
                    .then(m => m.routes);
            } catch (backupError) {
                console.error('All remotes failed, using local fallback');
                
                // Level 3: Local fallback component
                return import('./fallback/dashboard.component')
                    .then(m => [{ path: '', component: m.DashboardComponent }]);
            }
        }
    }
}
```

### Pattern 5: Version Negotiation

```javascript
// federation.config.js with strict versions
shared: {
    '@angular/core': {
        singleton: true,
        strictVersion: true,
        requiredVersion: '^19.0.0'  // Must be Angular 19.x
    },
    '@angular/common': {
        singleton: true,
        strictVersion: true,
        requiredVersion: '^19.0.0'
    },
    'rxjs': {
        singleton: true,
        strictVersion: false,  // More flexible
        requiredVersion: '^7.0.0'
    }
}
```

---

## ⚡ Advanced Features

### Feature 1: Dynamic Federation Manifest

Load MFE configuration from API instead of static file:

```typescript
// main.ts - Dynamic manifest
async function loadDynamicManifest(): Promise<void> {
    const response = await fetch('/api/federation-config');
    const manifest = await response.json();
    
    // manifest = { "mfe-dashboard": "https://prod-cdn/dashboard/remoteEntry.json" }
    await initFederation(manifest);
}

loadDynamicManifest()
    .then(() => import('./bootstrap'))
    .catch(err => console.error(err));
```

### Feature 2: Remote Component Loading (Not Just Routes)

```typescript
// Load specific component from remote
async loadRemoteComponent(mfeName: string, componentPath: string) {
    const module = await loadRemoteModule(mfeName, componentPath);
    return module.default || module[Object.keys(module)[0]];
}

// Usage
const ChartComponent = await this.loadRemoteComponent('mfe-dashboard', './Chart');

// Dynamically create component
const componentRef = this.viewContainerRef.createComponent(ChartComponent);
componentRef.instance.data = myChartData;
```

### Feature 3: Shared Styles Injection

```typescript
// Shell injects global styles that MFEs inherit
// styles.css in Shell
:root {
    --primary-color: #3b82f6;
    --background: #ffffff;
    --text-color: #1e293b;
}

// MFE components use CSS variables
.dashboard-card {
    background: var(--background);
    color: var(--text-color);
    border: 2px solid var(--primary-color);
}
```

### Feature 4: Health Checking Before Load

```typescript
// Check if remote is healthy before loading
async loadWithHealthCheck(mfeName: string, exposedModule: string) {
    const manifest = await fetch('/assets/federation.manifest.json').then(r => r.json());
    const remoteUrl = manifest[mfeName];
    
    // Health check
    try {
        const healthResponse = await fetch(remoteUrl.replace('remoteEntry.json', 'health'));
        if (!healthResponse.ok) {
            throw new Error('Remote unhealthy');
        }
    } catch (err) {
        console.warn(`${mfeName} health check failed, using fallback`);
        return this.loadFallback(mfeName);
    }
    
    return loadRemoteModule(mfeName, exposedModule);
}
```

### Feature 5: MFE Analytics & Monitoring

```typescript
// Track MFE load times for monitoring
const loadWithMetrics = async (name: string, module: string) => {
    const startTime = performance.now();
    
    try {
        const result = await loadRemoteModule(name, module);
        const loadTime = performance.now() - startTime;
        
        // Send to analytics
        analytics.track('mfe_loaded', {
            mfeName: name,
            loadTimeMs: loadTime,
            success: true
        });
        
        return result;
    } catch (error) {
        const loadTime = performance.now() - startTime;
        
        analytics.track('mfe_load_failed', {
            mfeName: name,
            loadTimeMs: loadTime,
            error: error.message
        });
        
        throw error;
    }
};
```

### Feature 6: Lazy Loading with Intersection Observer

```typescript
// Load MFE when widget becomes visible on screen
@Directive({ selector: '[loadMfeOnVisible]' })
export class LoadMfeOnVisibleDirective implements OnInit {
    @Input() loadMfeOnVisible!: string; // "mfe-dashboard:./Widget"
    
    private observer?: IntersectionObserver;
    
    constructor(
        private el: ElementRef,
        private vcr: ViewContainerRef
    ) {}
    
    ngOnInit() {
        this.observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                this.loadMfe();
                this.observer?.disconnect();
            }
        });
        
        this.observer.observe(this.el.nativeElement);
    }
    
    private async loadMfe() {
        const [mfeName, modulePath] = this.loadMfeOnVisible.split(':');
        const module = await loadRemoteModule(mfeName, modulePath);
        const component = module.default;
        this.vcr.createComponent(component);
    }
}

// Usage
<div loadMfeOnVisible="mfe-dashboard:./ChartWidget"></div>
```

---

## 🚀 Implementation Steps for New MFE

### Step 1: Create New Angular App
```bash
ng new mfe-reports --routing --style=scss
cd mfe-reports
```

### Step 2: Add Native Federation
```bash
npm install @angular-architects/native-federation@19 --save
```

### Step 3: Create Federation Config
```javascript
// mfe-reports/federation.config.js
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
    name: 'mfe-reports',
    exposes: {
        './routes': './src/app/app.routes.ts',
    },
    shared: {
        ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    },
});
```

### Step 4: Update Shell Manifest
```json
// mfe-shell/src/assets/federation.manifest.json
{
    "mfe-dashboard": "http://localhost:4201/remoteEntry.json",
    "mfe-settings": "http://localhost:4202/remoteEntry.json",
    "mfe-reports": "http://localhost:4203/remoteEntry.json"  // NEW
}
```

### Step 5: Add Route in Shell
```typescript
// mfe-shell/src/app/app.routes.ts
{
    path: 'reports',
    loadChildren: () => loadRemoteModule('mfe-reports', './routes')
        .then(m => m.routes)
        .catch(err => {
            console.error('Reports failed:', err);
            return import('./fallback/reports.component')
                .then(m => [{ path: '', component: m.ReportsComponent }]);
        }),
    title: 'Reports'
}
```

### Step 6: Create Fallback Component
```typescript
// mfe-shell/src/app/fallback/reports.component.ts
@Component({
    template: `
        <div class="fallback">
            <h2>📊 Reports Unavailable</h2>
            <p>The Reports module is currently unavailable. Please try again later.</p>
            <button (click)="retry()">Retry</button>
        </div>
    `
})
export class ReportsComponent {
    retry() {
        window.location.reload();
    }
}
```

### Step 7: Run All Apps
```bash
# Terminal 1-3: Existing apps
# Terminal 4: New Reports MFE
cd mfe-reports && npm start  # http://localhost:4203
```

---

## References

- [@angular-architects/native-federation](https://www.npmjs.com/package/@angular-architects/native-federation)
- [Native Federation Guide](https://www.angulararchitects.io/en/blog/quick-guide-to-angular-19-native-federation/)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)

