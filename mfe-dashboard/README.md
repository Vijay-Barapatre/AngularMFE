# 📊 MFE-Dashboard

> **Micro Frontend for Dashboard & Analytics**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start standalone (port 4201)
npm start

# Build for production
npm run build
```

## 🎯 Standalone Mode

This MFE can run independently for development:

```bash
npm start
# Opens at http://localhost:4201
```

Use demo credentials:
- admin@demo.com / admin123
- user@demo.com / user123

## 📁 Structure

```
mfe-dashboard/
├── src/
│   ├── app/
│   │   ├── standalone/              # Standalone login
│   │   └── features/
│   │       ├── dashboard-layout/    # Layout with tabs
│   │       ├── overview/            # Metrics + events
│   │       └── analytics/           # Analytics page
│   └── shared/                      # Shared libraries
└── package.json
```

## 📡 Events Published

| Event | Payload |
|-------|---------|
| `METRIC_SELECTED` | `{ metricId, metricName, value }` |
| `DASHBOARD_LOADED` | `{ timestamp }` |

## 🔄 Events Consumed

| Event | Action |
|-------|--------|
| `SETTINGS_UPDATED` | Log to console |

## 🏗️ Federation (Future)

When Module Federation is configured, this MFE will expose:
- `./routes` - Dashboard routes for Shell to load
