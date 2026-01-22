# 📦 Webpack Module Federation - Complete Guide

> **The original Module Federation for Webpack 5 based projects**

## 📑 Table of Contents

1. [What is Webpack Module Federation?](#what-is-webpack-module-federation)
2. [Why Use It?](#why-use-webpack-module-federation)
3. [Architecture](#architecture)
4. [Core Concepts](#core-concepts)
5. [Implementation Steps](#implementation-steps)
6. [Configuration Deep Dive](#configuration-deep-dive)
7. [Shared Dependencies](#shared-dependencies)
8. [Dynamic Remotes](#dynamic-remotes)
9. [Advantages](#advantages-)
10. [Disadvantages](#disadvantages-)
11. [Performance Considerations](#performance-considerations)
12. [Common Issues & Solutions](#common-issues--solutions)
13. [Migration Guide](#migration-to-native-federation)

---

## What is Webpack Module Federation?

Webpack Module Federation is a **Webpack 5 feature** that allows loading separately compiled and deployed code at runtime.

```
Think of it like LEGO blocks that connect at runtime:

Before Module Federation:
┌─────────────────────────────────────────┐
│  One big box with ALL lego pieces       │
│  Must ship the entire box every time    │
└─────────────────────────────────────────┘

With Module Federation:
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Box A   │  │  Box B   │  │  Box C   │
│  Castle  │  │  Cars    │  │  Trees   │
└──────────┘  └──────────┘  └──────────┘
       │           │            │
       └───────────┴────────────┘
               Connect at
               runtime!
```

---

## Why Use Webpack Module Federation?

| Use Case | Why Module Federation |
|----------|----------------------|
| **Angular 12-16** | Native Federation not available |
| **Existing Webpack config** | Already customized Webpack |
| **Multi-framework** | Works with React, Vue, Angular |
| **Maximum control** | Full Webpack configuration access |
| **Mature ecosystem** | 4+ years of production use |

---

## Architecture

### High-Level View

```
    ┌─────────────────────────────────────────────────────────────┐
    │                      WEBPACK 5                              │
    │                 ModuleFederationPlugin                      │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │   HOST (Shell)              REMOTE (Dashboard)              │
    │   ┌─────────────┐           ┌─────────────┐                 │
    │   │ webpack.    │           │ webpack.    │                 │
    │   │ config.js   │           │ config.js   │                 │
    │   │             │           │             │                 │
    │   │ remotes: {  │ ◄─────── │ exposes: {  │                 │
    │   │  'remote'   │ fetch at │   './routes'│                 │
    │   │ }           │ runtime  │ }           │                 │
    │   └─────────────┘           └─────────────┘                 │
    │         │                         │                         │
    │         │                         │                         │
    │         ▼                         ▼                         │
    │   remoteEntry.js ◄──────── remoteEntry.js                  │
    │   (Host manifest)          (Remote manifest)                │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
```

### RemoteEntry.js Explained

```
remoteEntry.js is a special file that:

1. Lists what modules are exposed
2. Tells Webpack where to find them
3. Manages shared dependency negotiation

Remote Server:
├── remoteEntry.js     ← "Menu" of available modules
├── src_app_*.js       ← Actual code chunks
├── vendors_*.js       ← Dependencies
└── ...
```

---

## Core Concepts

### 1. Host (Container)

The **Host** is the main application that loads remote modules.

```javascript
// Host configuration
new ModuleFederationPlugin({
    name: 'host',
    remotes: {
        // Define where to find remotes
        'mfeRemote': 'mfeRemote@http://localhost:4201/remoteEntry.js'
    }
})
```

### 2. Remote

The **Remote** is a separately deployed application that exposes modules.

```javascript
// Remote configuration
new ModuleFederationPlugin({
    name: 'mfeRemote',
    filename: 'remoteEntry.js',
    exposes: {
        // What to share
        './routes': './src/app/app.routes.ts',
        './Button': './src/components/button.component.ts'
    }
})
```

### 3. Shared Dependencies

Dependencies that both Host and Remote use (like Angular).

```javascript
shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    'rxjs': { singleton: true }
}
```

### 4. Exposed Modules

Specific code paths that a Remote makes available.

```javascript
exposes: {
    './routes': './src/app/app.routes.ts',    // Full path
    './Widget': './src/app/widget.component'  // Component
}
```

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
# For Angular 12-16
npm install @angular-architects/module-federation --save

# Core Webpack 5 (usually included)
npm install webpack@5 --save-dev
```

### Step 2: Add Schematics (Angular)

```bash
ng add @angular-architects/module-federation

# Answer prompts:
# - Port number for this MFE
# - Is this a host or remote?
```

This modifies:
- `angular.json` - adds custom webpack builder
- Creates `webpack.config.js`
- Updates `main.ts` for async bootstrap

### Step 3: Configure Remote (MFE that exposes modules)

```javascript
// mfe-remote/webpack.config.js
const { share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
    name: 'mfeRemote',
    
    // Entry point for federation
    filename: 'remoteEntry.js',
    
    // What to expose to Host
    exposes: {
        './routes': './src/app/app.routes.ts',
    },
    
    // Shared dependencies
    shared: share({
        '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/common/http': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    }),
});
```

### Step 4: Configure Host (Shell that loads remotes)

```javascript
// mfe-shell/webpack.config.js
const { share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
    name: 'mfeShell',
    
    // Where to find remotes
    remotes: {
        'mfeRemote': 'mfeRemote@http://localhost:4201/remoteEntry.js',
        'mfeSettings': 'mfeSettings@http://localhost:4202/remoteEntry.js',
    },
    
    // Shared dependencies
    shared: share({
        '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/common/http': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    }),
});
```

### Step 5: Update main.ts for Async Bootstrap

```typescript
// main.ts - Just import bootstrap
import('./bootstrap')
    .catch(err => console.error(err));
```

```typescript
// bootstrap.ts - Actual app bootstrap
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
```

### Step 6: Load Remote in Routes

```typescript
// app.routes.ts (Host)

// Declare the remote module
declare const mfeRemote: any;

export const routes: Routes = [
    {
        path: 'dashboard',
        loadChildren: () => import('mfeRemote/routes')
            .then(m => m.routes)
    },
    {
        path: 'settings',
        loadChildren: () => import('mfeSettings/routes')
            .then(m => m.routes)
    }
];
```

### Step 7: TypeScript Declaration

```typescript
// src/decl.d.ts
declare module 'mfeRemote/routes';
declare module 'mfeSettings/routes';
```

---

## Configuration Deep Dive

### Full webpack.config.js (Remote)

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { share } = require('@angular-architects/module-federation/webpack');

module.exports = {
    output: {
        uniqueName: 'mfeRemote',
        publicPath: 'auto',
        scriptType: 'text/javascript'
    },
    optimization: {
        runtimeChunk: false
    },
    resolve: {
        alias: {}
    },
    experiments: {
        outputModule: true
    },
    plugins: [
        new ModuleFederationPlugin({
            library: { type: 'module' },
            
            name: 'mfeRemote',
            filename: 'remoteEntry.js',
            
            exposes: {
                './routes': './src/app/app.routes.ts',
                './DashboardComponent': './src/app/dashboard/dashboard.component.ts',
            },
            
            shared: share({
                '@angular/core': { 
                    singleton: true, 
                    strictVersion: true, 
                    requiredVersion: '^15.0.0' 
                },
                '@angular/common': { 
                    singleton: true, 
                    strictVersion: true 
                },
                '@angular/router': { 
                    singleton: true, 
                    strictVersion: true 
                },
                'rxjs': { 
                    singleton: true 
                },
                // Custom shared library
                '@myorg/shared-lib': {
                    singleton: true,
                    import: '@myorg/shared-lib',
                    requiredVersion: '^1.0.0'
                }
            })
        })
    ]
};
```

### Key Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `name` | Unique identifier for this MFE | `'mfeRemote'` |
| `filename` | Entry point file name | `'remoteEntry.js'` |
| `exposes` | Modules to share | `{ './routes': './src/app/routes.ts' }` |
| `remotes` | Remote MFEs to consume | `{ 'mfe': 'mfe@url/remoteEntry.js' }` |
| `shared` | Shared dependencies config | See shared section |

---

## Shared Dependencies

### Singleton Dependencies

```javascript
// Only one instance across all MFEs
shared: {
    '@angular/core': {
        singleton: true,       // Only one instance
        strictVersion: true,   // Must match version
        requiredVersion: '^15.0.0'
    }
}
```

### Eager Loading

```javascript
// Load immediately, not lazy
shared: {
    'lodash': {
        eager: true,   // Include in initial bundle
        singleton: true
    }
}
```

### Version Mismatch Handling

```javascript
// Strict: Error on mismatch
shared: {
    '@angular/core': {
        strictVersion: true,
        requiredVersion: '^15.0.0'  // Must be 15.x
    }
}

// Flexible: Use highest compatible version
shared: {
    'lodash': {
        strictVersion: false,  // Use any compatible
    }
}
```

### Share All Helper

```javascript
const { shareAll } = require('@angular-architects/module-federation/webpack');

shared: shareAll({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto'  // Read from package.json
})
```

---

## Dynamic Remotes

### Loading Remotes at Runtime

```typescript
import { loadRemoteModule } from '@angular-architects/module-federation';

// Load dynamically (not in webpack config)
{
    path: 'dashboard',
    loadChildren: () => loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './routes'
    }).then(m => m.routes)
}
```

### Manifest-Based Configuration

```json
// assets/mfe-manifest.json
{
    "mfe-dashboard": {
        "remoteEntry": "http://localhost:4201/remoteEntry.js",
        "exposedModule": "./routes"
    },
    "mfe-settings": {
        "remoteEntry": "http://localhost:4202/remoteEntry.js",
        "exposedModule": "./routes"
    }
}
```

```typescript
// Load from manifest
async function loadFromManifest(mfeName: string) {
    const manifest = await fetch('/assets/mfe-manifest.json').then(r => r.json());
    const config = manifest[mfeName];
    
    return loadRemoteModule({
        type: 'module',
        remoteEntry: config.remoteEntry,
        exposedModule: config.exposedModule
    });
}
```

---

## Advantages ✅

| Advantage | Explanation |
|-----------|-------------|
| **Mature & proven** | 4+ years of production use at scale |
| **Framework agnostic** | Works with Angular, React, Vue, vanilla JS |
| **Full Webpack control** | Access to all Webpack features |
| **Large community** | Many tutorials, Stack Overflow answers |
| **Wide Angular support** | Works with Angular 12, 13, 14, 15, 16 |
| **Flexible sharing** | Fine-grained control over shared deps |
| **Dynamic remotes** | Load remotes not known at build time |

---

## Disadvantages ❌

| Disadvantage | Explanation |
|--------------|-------------|
| **Complex configuration** | Webpack config can get verbose |
| **Slower builds** | Webpack slower than esbuild |
| **Deprecated for Angular 17+** | Use Native Federation instead |
| **Webpack knowledge required** | Need to understand Webpack |
| **Version lock** | Must coordinate Angular versions |
| **Bundle bloat** | Easy to accidentally duplicate deps |

---

## Performance Considerations

### ✅ Best Practices

```javascript
// 1. Always use singleton for Angular
shared: {
    '@angular/core': { singleton: true }  // ✅
}

// 2. Use strictVersion to catch mismatches early
shared: {
    '@angular/core': { 
        singleton: true, 
        strictVersion: true  // ✅
    }
}

// 3. Share only what's needed
shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    // Don't share everything blindly
}

// 4. Use requiredVersion: 'auto'
shared: share({
    '@angular/core': { 
        requiredVersion: 'auto'  // ✅ Reads from package.json
    }
})
```

### ❌ Anti-Patterns

```javascript
// 1. DON'T forget singleton for frameworks
shared: {
    '@angular/core': {}  // ❌ Multiple Angular instances!
}

// 2. DON'T use different major versions
// Host: Angular 15, Remote: Angular 14
// This WILL cause runtime errors

// 3. DON'T share too many deps
shared: shareAll({})  // ❌ Everything shared = slow negotiation

// 4. DON'T forget declarations
// ❌ TypeScript can't find module
import('mfeRemote/routes')  // Error: Cannot find module

// ✅ Add declaration
// src/decl.d.ts
declare module 'mfeRemote/routes';
```

### Bundle Analysis

```bash
# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/mfe-shell/stats.json
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module 'XXX/routes'"

**Solution**: Add TypeScript declaration

```typescript
// src/decl.d.ts
declare module 'mfeRemote/routes';
```

### Issue 2: Multiple Angular Instances

**Symptom**: `NullInjectorError` or services not shared

**Solution**: Ensure singleton configuration

```javascript
shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true }
}
```

### Issue 3: Remote Not Loading

**Checklist**:
1. Is remote server running?
2. Is remoteEntry.js accessible? (check browser)
3. Is CORS configured?
4. Is the name in `remotes` matching the remote's `name`?

```bash
# Test remote entry
curl http://localhost:4201/remoteEntry.js
```

### Issue 4: Version Mismatch Error

**Error**: `Unsatisfied version 15.0.0 of shared singleton module @angular/core`

**Solution**: Align versions in all MFEs

```json
// All package.json files should have same versions
{
    "@angular/core": "^15.0.0",
    "@angular/common": "^15.0.0"
}
```

### Issue 5: Shared State Not Working

**Problem**: Services not sharing state across MFEs

**Solution**: Ensure services are `providedIn: 'root'` and imported from shared library

```typescript
// ✅ Correct - singleton service
@Injectable({ providedIn: 'root' })
export class AuthService { }

// Import from shared path (same in all MFEs)
import { AuthService } from '@shared/auth';
```

---

## Migration to Native Federation

If upgrading to Angular 17+, migrate from Webpack Module Federation to Native Federation:

### Step 1: Remove Old Dependencies

```bash
npm uninstall @angular-architects/module-federation
```

### Step 2: Install Native Federation

```bash
npm install @angular-architects/native-federation@19 --save
ng add @angular-architects/native-federation
```

### Step 3: Convert webpack.config.js to federation.config.js

```javascript
// OLD: webpack.config.js
module.exports = withModuleFederationPlugin({
    name: 'mfeRemote',
    filename: 'remoteEntry.js',
    exposes: { './routes': './src/app/app.routes.ts' },
    shared: share({ ... })
});

// NEW: federation.config.js
module.exports = withNativeFederation({
    name: 'mfeRemote',
    exposes: { './routes': './src/app/app.routes.ts' },
    shared: { ...shareAll({ singleton: true }) }
});
```

### Step 4: Update remotes from .js to .json

```javascript
// OLD
remotes: {
    'mfe': 'mfe@http://localhost:4201/remoteEntry.js'
}

// NEW: Use manifest
// federation.manifest.json
{
    "mfe": "http://localhost:4201/remoteEntry.json"
}
```

---

## Quick Reference

### Remote Configuration

```javascript
new ModuleFederationPlugin({
    name: 'remoteApp',
    filename: 'remoteEntry.js',
    exposes: {
        './Module': './src/app/module.ts'
    },
    shared: share({
        '@angular/core': { singleton: true, strictVersion: true }
    })
})
```

### Host Configuration

```javascript
new ModuleFederationPlugin({
    name: 'hostApp',
    remotes: {
        'remoteApp': 'remoteApp@http://localhost:XXXX/remoteEntry.js'
    },
    shared: share({
        '@angular/core': { singleton: true, strictVersion: true }
    })
})
```

### Route Loading

```typescript
// Method 1: Static import
import('remoteApp/Module').then(m => m.AppModule)

// Method 2: Dynamic with loadRemoteModule
loadRemoteModule({
    type: 'module',
    remoteEntry: 'http://localhost:XXXX/remoteEntry.js',
    exposedModule: './Module'
}).then(m => m.AppModule)
```

---

## References

- [@angular-architects/module-federation](https://www.npmjs.com/package/@angular-architects/module-federation)
- [Webpack Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)
- [Angular Architects Blog](https://www.angulararchitects.io/en/blog/)
