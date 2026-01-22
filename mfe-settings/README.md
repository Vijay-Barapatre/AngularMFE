# ⚙️ MFE-Settings

> **Micro Frontend for User Settings & Preferences**

## 🚀 Quick Start

```bash
npm install
npm start  # Runs on port 4202
```

## 🎯 Standalone Mode

```bash
npx ng serve --port 4202
# http://localhost:4202
```

## 📁 Structure

```
mfe-settings/
├── src/app/
│   ├── standalone/              # Standalone login
│   └── features/
│       ├── settings-layout/     # Layout with tabs
│       ├── profile/             # User profile
│       ├── preferences/         # Theme, notifications
│       └── event-monitor/       # Cross-MFE event demo
└── shared/                      # Shared libraries
```

## 📡 Event Bus Demo

The **Event Monitor** page shows cross-MFE communication:
1. Open Dashboard MFE (port 4201)
2. Click a metric
3. See event appear in Settings Event Monitor!

## Events Published
- `THEME_CHANGED` - When theme changes
- `SETTINGS_UPDATED` - General settings updates

## Events Consumed
- `METRIC_SELECTED` - From Dashboard
- `DASHBOARD_LOADED` - From Dashboard
- `NAVIGATE_TO` - From Shell
