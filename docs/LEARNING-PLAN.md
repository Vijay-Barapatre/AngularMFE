# 📚 5-Day Learning Plan

> **Master Angular MFE Architecture in 5 Days**

## 📑 Table of Contents

1. [Learning Objectives](#-learning-objectives)
2. [Day 1: Foundation - MFE Architecture](#day-1-foundation---understanding-mfe-architecture)
3. [Day 2: Authentication & Authorization](#day-2-authentication--authorization)
4. [Day 3: Cross-MFE Communication](#day-3-cross-mfe-communication)
5. [Day 4: Design Patterns](#day-4-design-patterns)
6. [Day 5: Putting It All Together](#day-5-putting-it-all-together)
7. [Documentation Reference](#-documentation-reference)
8. [Completion Checklist](#-completion-checklist)
9. [Daily Schedule Template](#️-daily-schedule-template)

---

## 🎯 Learning Objectives

By the end of this plan, you will understand:
- ✅ Micro Frontend Architecture concepts
- ✅ Module Federation for runtime loading
- ✅ Cross-MFE communication patterns
- ✅ Authentication in distributed systems
- ✅ Enterprise Angular design patterns

---

## Day 1: Foundation - Understanding MFE Architecture

### Morning (2 hours)

**Topic: What is Micro Frontend?**

| Activity | Duration | Resource |
|----------|----------|----------|
| Read MFE concepts | 30 min | [ARCHITECTURE.md](./ARCHITECTURE.md) - High-Level Architecture |
| Study the diagram | 15 min | ![MFE Architecture](./images/mfe_architecture_1769117634135.png) |
| Explore project structure | 30 min | Navigate folders: `mfe-shell`, `mfe-dashboard`, `mfe-settings` |
| Run each app independently | 45 min | See Quick Start commands below |

**Quick Start Commands:**
```bash
# Terminal 1: Shell
cd mfe-shell && npm install && npm start
# → http://localhost:4200

# Terminal 2: Dashboard
cd mfe-dashboard && npm install && npm start
# → http://localhost:4201

# Terminal 3: Settings
cd mfe-settings && npm install && npm start
# → http://localhost:4202
```

### Afternoon (2 hours)

**Topic: Module Federation**

| Activity | Duration | Resource |
|----------|----------|----------|
| Read Module Federation flow | 30 min | [ARCHITECTURE.md](./ARCHITECTURE.md) - Module Federation Flow |
| Study federation config files | 30 min | `*/federation.config.js` in each MFE |
| Understand `loadRemoteModule` | 30 min | `mfe-shell/src/app/app.routes.ts` |
| Try breaking/fixing federation | 30 min | Change ports, see errors, fix them |

### 📝 Day 1 Exercises

- [ ] Draw the MFE architecture from memory
- [ ] Explain in your words: Why can't MFEs directly import each other?
- [ ] What happens if Dashboard server is down? (Hint: fallback)

---

## Day 2: Authentication & Authorization

### Morning (2 hours)

**Topic: How Auth Works Across MFEs**

| Activity | Duration | Resource |
|----------|----------|----------|
| Read auth guide | 45 min | [AUTH-GUIDE.md](./AUTH-GUIDE.md) |
| Study AuthService facade | 30 min | `shared/auth/auth.service.ts` |
| Study TokenService | 30 min | `shared/auth/token.service.ts` |
| Trace login flow | 15 min | Login → Token → Storage → Redirect |

### Afternoon (2 hours)

**Topic: Guards & Interceptors**

| Activity | Duration | Resource |
|----------|----------|----------|
| Study route guards | 30 min | `shared/auth/auth.guard.ts` |
| Study role guards | 30 min | `shared/auth/role.guard.ts` |
| Study auth interceptor | 30 min | `shared/auth/auth.interceptor.ts` |
| Test different user roles | 30 min | Login as admin, manager, user |

**Test Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Manager | manager@demo.com | manager123 |
| User | user@demo.com | user123 |

### 📝 Day 2 Exercises

- [ ] Login as each role and note what's different
- [ ] Add a new role "viewer" to the system
- [ ] Explain: Why is token stored encrypted?

---

## Day 3: Cross-MFE Communication

### Morning (2 hours)

**Topic: Event Bus Pattern**

| Activity | Duration | Resource |
|----------|----------|----------|
| Read Event Bus guide | 45 min | [EVENT-BUS-GUIDE.md](./EVENT-BUS-GUIDE.md) |
| Study EventBusService | 30 min | `shared/event-bus/event-bus.service.ts` |
| Study event models | 15 min | `shared/event-bus/event.models.ts` |
| Trace an event flow | 30 min | Dashboard → Event Bus → Settings |

### Afternoon (2 hours)

**Topic: Alternatives & Practice**

| Activity | Duration | Resource |
|----------|----------|----------|
| Study Custom Events alternative | 30 min | `shared/event-bus/custom-event.service.ts` |
| Compare RxJS vs CustomEvents | 30 min | [EVENT-BUS-GUIDE.md](./EVENT-BUS-GUIDE.md) - Alternatives |
| Create your own event | 45 min | Add a new event type |
| Test cross-MFE communication | 15 min | Emit from Dashboard, receive in Settings |

### 📝 Day 3 Exercises

- [ ] Create a THEME_TOGGLE event
- [ ] Make Dashboard emit when a card is clicked
- [ ] Make Settings listen and log the payload
- [ ] Explain: What happens if you forget to unsubscribe?

---

## Day 4: Design Patterns

### Morning (2 hours)

**Topic: Core Patterns**

| Activity | Duration | Resource |
|----------|----------|----------|
| Read patterns guide | 45 min | [PATTERNS-GUIDE.md](./PATTERNS-GUIDE.md) |
| Study visual guide | 30 min | [PATTERNS-VISUAL-GUIDE.md](./PATTERNS-VISUAL-GUIDE.md) |
| Study Facade pattern | 30 min | AuthService as Facade |
| Study Adapter pattern | 15 min | `shared/patterns/api-adapter.ts` |

### Afternoon (2 hours)

**Topic: Advanced Patterns**

| Activity | Duration | Resource |
|----------|----------|----------|
| Study Proxy pattern | 30 min | `shared/patterns/caching-proxy.service.ts` |
| Study Smart/Presentational | 30 min | `shared/patterns/metric-card.component.ts` |
| Study Barrel files | 15 min | `shared/*/index.ts` files |
| Practice lazy loading | 45 min | Add a new lazy-loaded route |

### 📝 Day 4 Exercises

- [ ] Use CachingProxyService in a component
- [ ] Create a new Presentational component
- [ ] Write an Adapter for a different API format
- [ ] Explain each pattern in one sentence

---

## Day 5: Putting It All Together

### Morning (2 hours)

**Topic: Build a New Feature**

Build a "Notifications" feature that demonstrates all learned concepts:

| Task | Pattern Used |
|------|--------------|
| Create notifications data | Adapter Pattern |
| Create notification service | Facade Pattern |
| Create notification card | Presentational Component |
| Emit when notification clicked | Event Bus |
| Lazy load notification page | Lazy Loading |
| Protect with auth guard | Guards |

### Afternoon (2 hours)

**Topic: Review & Advanced Topics**

| Activity | Duration | Resource |
|----------|----------|----------|
| Read security analysis | 30 min | [ARCHITECTURE.md](./ARCHITECTURE.md) - Security Analysis |
| Study production recommendations | 30 min | [ARCHITECTURE.md](./ARCHITECTURE.md) - Production |
| Review all documentation | 30 min | All docs in `/docs` folder |
| Plan your own MFE project | 30 min | Apply learnings! |

### 📝 Day 5 Exercises

- [ ] Complete the Notifications feature
- [ ] Present your understanding to someone (rubber duck!)
- [ ] List 5 things you'd do differently in production
- [ ] Plan your own MFE project architecture

---

## 📖 Documentation Reference

| Day | Key Documents |
|-----|---------------|
| 1 | [ARCHITECTURE.md](./ARCHITECTURE.md), [GETTING-STARTED.md](./GETTING-STARTED.md) |
| 2 | [AUTH-GUIDE.md](./AUTH-GUIDE.md), [AUTHENTICATION-MODES.md](./AUTHENTICATION-MODES.md) |
| 3 | [EVENT-BUS-GUIDE.md](./EVENT-BUS-GUIDE.md), [COMMUNICATION.md](./COMMUNICATION.md) |
| 4 | [PATTERNS-GUIDE.md](./PATTERNS-GUIDE.md), [PATTERNS-VISUAL-GUIDE.md](./PATTERNS-VISUAL-GUIDE.md) |
| 5 | All above + [MODULE-FEDERATION.md](./MODULE-FEDERATION.md) |

---

## 🏆 Completion Checklist

### Concepts Mastered
- [ ] Explain MFE architecture to a colleague
- [ ] Describe Module Federation loading flow
- [ ] Explain Event Bus pub/sub pattern
- [ ] Describe auth flow across MFEs
- [ ] Name 5+ design patterns used

### Practical Skills
- [ ] Run all 3 MFEs together
- [ ] Login with different roles
- [ ] Add a new event type
- [ ] Create a presentational component
- [ ] Use the CachingProxy service
- [ ] Add a new lazy-loaded route

### Capstone Project
- [ ] Build a complete new feature using all patterns

---

## ⏱️ Daily Schedule Template

| Time | Activity |
|------|----------|
| 9:00 - 9:30 | Read documentation |
| 9:30 - 10:30 | Study code files |
| 10:30 - 10:45 | ☕ Break |
| 10:45 - 12:00 | Hands-on practice |
| 12:00 - 13:00 | 🍽️ Lunch |
| 13:00 - 14:00 | Read afternoon topic |
| 14:00 - 15:00 | Code exploration |
| 15:00 - 15:15 | ☕ Break |
| 15:15 - 16:00 | Exercises |
| 16:00 - 16:30 | Review & notes |

---

> **Tip**: Don't just read - type out the code yourself! Muscle memory helps understanding.

Good luck! 🚀
