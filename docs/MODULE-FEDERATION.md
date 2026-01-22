# 🔌 Module Federation Setup Guide

> **Configuration for dynamic MFE loading (Angular Native Federation)**

## ✅ Current Status: WORKING

**Version Requirement:** Use `@angular-architects/native-federation@19` with Angular 19.

### Fix for `generateSearchDirectories` Error

If you see this error:
```
(0 , private_1.generateSearchDirectories) is not a function
```

**Solution:** Downgrade from version 21.x to 19.x:
```bash
npm install @angular-architects/native-federation@19 --save
```

---

## 📁 What's Already Configured

### 1. Federation Configs Created

| File | Purpose |
|------|---------|
| `mfe-shell/federation.config.js` | Shell as host |
| `mfe-dashboard/federation.config.js` | Dashboard as remote, exposes `./routes` |
| `mfe-settings/federation.config.js` | Settings as remote, exposes `./routes` |

### 2. Federation Manifest

`mfe-shell/src/assets/federation.manifest.json`:
```json
{
  "mfe-dashboard": "http://localhost:4201/remoteEntry.json",
  "mfe-settings": "http://localhost:4202/remoteEntry.json"
}
```

### 3. Route Configuration (Ready to Enable)

See `mfe-shell/src/app/app.routes.ts` for the commented federation routes.

---

## 🔧 How to Enable (When Library is Fixed)

### Step 1: Update angular.json

Restore federation builders:

```json
{
  "build": {
    "builder": "@angular-architects/native-federation:build",
    ...
  },
  "serve": {
    "builder": "@angular-architects/native-federation:build",
    ...
  }
}
```

### Step 2: Update main.ts

```typescript
import { initFederation } from '@angular-architects/native-federation';

initFederation('/assets/federation.manifest.json')
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
```

### Step 3: Update Routes

Uncomment the federation routes in `app.routes.ts`:

```typescript
{
  path: 'dashboard',
  loadChildren: () => loadRemoteModule('mfe-dashboard', './routes')
    .then(m => m.routes),
},
{
  path: 'settings',
  loadChildren: () => loadRemoteModule('mfe-settings', './routes')
    .then(m => m.routes),
}
```

### Step 4: Run All Apps

```bash
# Terminal 1 - Shell (Host)
cd mfe-shell && npm start

# Terminal 2 - Dashboard (Remote)
cd mfe-dashboard && npm start

# Terminal 3 - Settings (Remote)
cd mfe-settings && npm start
```

---

## 🎯 Expected Behavior (When Working)

1. Shell loads at http://localhost:4200
2. When user navigates to /dashboard:
   - Shell fetches http://localhost:4201/remoteEntry.json
   - Dashboard routes are dynamically loaded
   - Dashboard renders inside Shell's layout
3. Same for Settings at /settings

**Key Benefit:** Each MFE can be deployed independently!

---

## 📚 References

- [@angular-architects/native-federation](https://www.npmjs.com/package/@angular-architects/native-federation)
- [Native Federation Guide](https://www.angulararchitects.io/en/blog/quick-guide-to-angular-19-native-federation/)
