# 🏗️ MFE Architecture Deep Dive

> **Complete Technical Documentation for Angular Micro Frontend Architecture with Native Federation**

---

## 📑 Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [MFE Communication Diagram](#mfe-communication-diagram)
3. [Module Federation Flow](#module-federation-flow)
4. [Authentication Architecture](#authentication-architecture)
5. [Security Analysis](#security-analysis)
6. [Shared Library Architecture](#shared-library-architecture)
7. [Inter-MFE Communication Patterns](#inter-mfe-communication-patterns)
8. [Production Recommendations](#production-recommendations)

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Browser"
        subgraph "Shell Host [:4200]"
            ShellApp["🏠 Shell App<br/>(Host Container)"]
            Router["Angular Router"]
            Layout["Shell Layout"]
            AuthUI["Login Component"]
        end
        
        subgraph "Remote MFEs"
            Dashboard["📊 Dashboard MFE<br/>[:4201]"]
            Settings["⚙️ Settings MFE<br/>[:4202]"]
        end
        
        subgraph "Shared Libraries"
            AuthLib["🔐 @shared/auth"]
            EventBus["📡 @shared/event-bus"]
        end
        
        Storage["💾 SessionStorage<br/>(Encrypted Token)"]
    end
    
    ShellApp --> Router
    Router --> Layout
    Router --> AuthUI
    Layout --> |"loadRemoteModule"| Dashboard
    Layout --> |"loadRemoteModule"| Settings
    
    Dashboard --> AuthLib
    Settings --> AuthLib
    ShellApp --> AuthLib
    
    Dashboard <--> EventBus
    Settings <--> EventBus
    ShellApp <--> EventBus
    
    AuthLib --> Storage
```

### Architecture Components

| Component | Role | Port |
|-----------|------|------|
| **mfe-shell** | Host container, manages layout, routing, authentication UI | 4200 |
| **mfe-dashboard** | Remote MFE for dashboard features, metrics, analytics | 4201 |
| **mfe-settings** | Remote MFE for user settings, preferences | 4202 |
| **@shared/auth** | Shared authentication library (singleton) | N/A |
| **@shared/event-bus** | Cross-MFE communication via RxJS | N/A |

---

## MFE Communication Diagram

### Runtime Loading Sequence

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Shell as Shell [:4200]
    participant Manifest as federation.manifest.json
    participant Dashboard as Dashboard [:4201]
    participant Settings as Settings [:4202]
    
    User->>Browser: Navigate to localhost:4200
    Browser->>Shell: Load index.html
    Shell->>Shell: main.ts → initFederation()
    Shell->>Manifest: Fetch /assets/federation.manifest.json
    Manifest-->>Shell: {"mfe-dashboard": "http://localhost:4201/remoteEntry.json", ...}
    Shell->>Shell: bootstrap.ts → bootstrapApplication()
    Shell->>Browser: Render Shell Layout
    
    Note over Shell: User navigates to /dashboard
    
    Shell->>Dashboard: loadRemoteModule('mfe-dashboard', './routes')
    Dashboard->>Shell: Return remoteEntry.json
    Shell->>Dashboard: Fetch exposed module chunks
    Dashboard-->>Shell: Dashboard routes + components
    Shell->>Browser: Render Dashboard inside Shell
    
    Note over Shell: User navigates to /settings
    
    Shell->>Settings: loadRemoteModule('mfe-settings', './routes')
    Settings-->>Shell: Settings routes + components
    Shell->>Browser: Render Settings inside Shell
```

### Event-Based Communication

```mermaid
sequenceDiagram
    participant Dashboard as 📊 Dashboard MFE
    participant EventBus as 📡 EventBusService
    participant Settings as ⚙️ Settings MFE
    participant Shell as 🏠 Shell
    
    Note over Dashboard,Shell: All MFEs share same EventBus instance
    
    Dashboard->>EventBus: emit({type: 'METRIC_SELECTED', payload: {...}})
    EventBus-->>Settings: on('METRIC_SELECTED').subscribe()
    EventBus-->>Shell: on('METRIC_SELECTED').subscribe()
    
    Settings->>EventBus: emit({type: 'THEME_CHANGED', payload: 'dark'})
    EventBus-->>Dashboard: on('THEME_CHANGED').subscribe()
    EventBus-->>Shell: on('THEME_CHANGED').subscribe()
```

---

## Module Federation Flow

### Federation Configuration

```mermaid
flowchart LR
    subgraph "Shell (Host)"
        ShellConfig["federation.config.js"]
        ShellManifest["federation.manifest.json"]
        ShellMain["main.ts<br/>initFederation()"]
    end
    
    subgraph "Dashboard (Remote)"
        DashConfig["federation.config.js<br/>exposes: {'./routes': '...'}"]
        DashEntry["remoteEntry.json"]
        DashRoutes["app.routes.ts"]
    end
    
    subgraph "Settings (Remote)"
        SettConfig["federation.config.js<br/>exposes: {'./routes': '...'}"]
        SettEntry["remoteEntry.json"]
        SettRoutes["app.routes.ts"]
    end
    
    ShellMain --> ShellManifest
    ShellManifest --> |"http://localhost:4201/remoteEntry.json"| DashEntry
    ShellManifest --> |"http://localhost:4202/remoteEntry.json"| SettEntry
    DashEntry --> DashRoutes
    SettEntry --> SettRoutes
```

### How `shareAll` Works

```mermaid
flowchart TB
    subgraph "Shared Dependencies (singleton: true)"
        Angular["@angular/core<br/>@angular/common<br/>@angular/router"]
        RxJS["rxjs"]
        SharedLibs["@shared/auth<br/>@shared/event-bus"]
    end
    
    subgraph "Shell Runtime"
        ShellDeps["Dependencies loaded ONCE"]
    end
    
    subgraph "Dashboard Runtime"
        DashDeps["Reuses Shell's dependencies"]
    end
    
    subgraph "Settings Runtime"  
        SettDeps["Reuses Shell's dependencies"]
    end
    
    Angular --> ShellDeps
    ShellDeps --> |"shared"| DashDeps
    ShellDeps --> |"shared"| SettDeps
    
    RxJS --> ShellDeps
    SharedLibs --> ShellDeps
```

> [!IMPORTANT]
> **Singleton Pattern**: `shareAll({ singleton: true })` ensures only ONE instance of Angular, RxJS, and shared services exists across all MFEs. This is critical for authentication state sharing!

---

## Authentication Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginUI as Login Component
    participant AuthService as AuthService
    participant TokenService as TokenService
    participant Storage as SessionStorage
    participant Guard as authGuard
    participant Dashboard as Dashboard MFE
    
    Note over User,Dashboard: == LOGIN FLOW ==
    
    User->>LoginUI: Enter credentials
    LoginUI->>AuthService: login(email, password)
    AuthService->>AuthService: simulateLogin()<br/>(or real API call)
    AuthService->>AuthService: generateSimulatedToken()
    AuthService->>TokenService: setToken(jwt)
    TokenService->>TokenService: encrypt(jwt) with XOR
    TokenService->>Storage: sessionStorage.setItem('mfe_auth_token', encrypted)
    TokenService->>TokenService: _token.set(jwt)
    AuthService->>AuthService: _authState.set({isAuthenticated: true, user: {...}})
    AuthService-->>LoginUI: Success
    LoginUI->>User: Navigate to /dashboard
    
    Note over User,Dashboard: == ROUTE ACCESS ==
    
    User->>Guard: Navigate to protected route
    Guard->>AuthService: isAuthenticated()
    AuthService-->>Guard: true (from signal)
    Guard-->>Dashboard: Allow access
    
    Note over User,Dashboard: == SESSION RESTORE ==
    
    User->>User: Refresh page
    Storage-->>TokenService: getItem('mfe_auth_token')
    TokenService->>TokenService: decrypt(encrypted)
    TokenService->>TokenService: _token.set(jwt)
    AuthService->>AuthService: restoreSession()
    AuthService->>TokenService: hasToken() → true
    AuthService->>TokenService: isTokenExpired() → false
    AuthService->>TokenService: decodeToken() → payload
    AuthService->>AuthService: _authState.set({isAuthenticated: true, user: {...}})
```

### Auth State Management

```mermaid
stateDiagram-v2
    [*] --> NotAuthenticated: App starts
    
    NotAuthenticated --> Loading: login() called
    Loading --> Authenticated: Success
    Loading --> NotAuthenticated: Error
    
    Authenticated --> NotAuthenticated: logout()
    Authenticated --> NotAuthenticated: Token expired
    
    NotAuthenticated --> Authenticated: Session restored
    
    state Authenticated {
        [*] --> Active
        Active --> RoleCheck: Access protected route
        RoleCheck --> Allowed: hasRole() = true
        RoleCheck --> Denied: hasRole() = false
    }
```

### Token Storage & Encryption

```mermaid
flowchart LR
    subgraph "Token Flow"
        JWT["JWT Token<br/>(header.payload.signature)"]
        XOR["XOR Encryption<br/>with secret key"]
        B64["Base64 Encode"]
        Storage["SessionStorage<br/>mfe_auth_token"]
    end
    
    JWT --> XOR --> B64 --> Storage
    Storage --> |"On read"| B64Decode["Base64 Decode"]
    B64Decode --> XORDecrypt["XOR Decrypt"]
    XORDecrypt --> JWTOut["JWT Token"]
```

---

## Security Analysis

### Current Implementation

| Aspect | Current Approach | Security Level | Notes |
|--------|------------------|----------------|-------|
| **Token Storage** | SessionStorage | 🟡 Medium | Vulnerable to XSS |
| **Token Encryption** | XOR with fixed key | 🔴 Low | Key exposed in source |
| **Token Format** | Simulated JWT | 🟡 Demo Only | No real signature verification |
| **Session Lifetime** | Tab/Browser close | 🟢 Good | Tokens cleared on close |
| **Route Protection** | Functional guards | 🟢 Good | Proper Angular guards |
| **Role-Based Access** | Hierarchy-based | 🟢 Good | admin > manager > user > guest |

### Vulnerabilities

```mermaid
flowchart TB
    subgraph "XSS Attack Vector"
        Attack["🔓 XSS Attack"]
        ReadStorage["Read sessionStorage"]
        StealToken["Steal encrypted token"]
        ReverseXOR["Reverse XOR<br/>(key in source)"]
        UseToken["Use stolen token"]
    end
    
    Attack --> ReadStorage --> StealToken --> ReverseXOR --> UseToken
    
    subgraph "Mitigations Needed"
        HttpOnly["HttpOnly Cookies<br/>(Backend sets token)"]
        CSP["Content Security Policy"]
        ProperCrypto["AES-256 Encryption<br/>(crypto-js)"]
    end
```

> [!CAUTION]
> **Critical Security Issues:**
> 1. XOR encryption key is hardcoded in source code (`ENCRYPTION_KEY = 'MFE_POC_SECRET_KEY_2024'`)
> 2. Client-side token storage is vulnerable to XSS attacks
> 3. JWT signature is simulated, not cryptographically verified

### Recommended Secure Architecture

```mermaid
sequenceDiagram
    participant User
    participant MFE as Any MFE
    participant Backend as Backend API
    participant TokenStore as HttpOnly Cookie
    
    User->>MFE: Login with credentials
    MFE->>Backend: POST /auth/login {email, password}
    Backend->>Backend: Validate credentials
    Backend->>Backend: Generate JWT (signed with secret)
    Backend->>TokenStore: Set-Cookie: token=jwt; HttpOnly; Secure; SameSite=Strict
    Backend-->>MFE: 200 OK (no token in body!)
    
    Note over MFE,Backend: Subsequent requests
    
    MFE->>Backend: GET /api/resource (Cookie auto-attached)
    Backend->>Backend: Verify JWT signature
    Backend-->>MFE: Protected data
    
    Note over User,TokenStore: XSS cannot access HttpOnly cookie!
```

---

## Shared Library Architecture

### Library Structure

```
shared/
├── auth/
│   ├── index.ts            # Barrel file (public API)
│   ├── package.json        # Library metadata
│   ├── auth.service.ts     # Main auth service
│   ├── token.service.ts    # Token management
│   ├── auth.guard.ts       # Route guards
│   ├── role.guard.ts       # RBAC guards
│   ├── auth.interceptor.ts # HTTP interceptor
│   └── auth.models.ts      # Type definitions
│
├── event-bus/
│   ├── index.ts            # Barrel file
│   ├── package.json        # Library metadata
│   ├── event-bus.service.ts    # RxJS-based bus
│   ├── custom-event.service.ts # Browser CustomEvent alternative
│   └── event.models.ts     # Event type definitions
```

### How Libraries Are Shared

```mermaid
flowchart TB
    subgraph "tsconfig.json (each MFE)"
        Paths["paths: {<br/>'@shared/auth': ['../../shared/auth']<br/>'@shared/event-bus': ['../../shared/event-bus']<br/>}"]
    end
    
    subgraph "federation.config.js"
        ShareAll["shareAll({<br/>  singleton: true,<br/>  strictVersion: true<br/>})"]
    end
    
    subgraph "Runtime"
        SingleInstance["Single instance of<br/>AuthService, TokenService,<br/>EventBusService"]
    end
    
    Paths --> |"Compile time"| ShareAll
    ShareAll --> |"Runtime"| SingleInstance
```

### Import Pattern

```typescript
// All MFEs use the same clean import
import { AuthService, authGuard, roleGuard } from '@shared/auth';
import { EventBusService } from '@shared/event-bus';

// The path alias resolves to actual file location
// tsconfig.json: "@shared/auth" → "../../shared/auth/index.ts"
```

> [!TIP]
> **Barrel Files** (`index.ts`) provide:
> - Clean imports (`from '@shared/auth'` instead of `from '../../shared/auth/auth.service'`)
> - Encapsulation (hide internal file structure)
> - Controlled public API (only export what's needed)

---

## Inter-MFE Communication Patterns

### Pattern 1: EventBus (RxJS Subject)

```mermaid
flowchart LR
    subgraph "Publisher"
        Dashboard["Dashboard MFE"]
        EmitCall["eventBus.emit({<br/>type: 'METRIC_SELECTED',<br/>source: 'dashboard',<br/>payload: {id: '123'}<br/>})"]
    end
    
    subgraph "EventBusService"
        Subject["Subject<MfeEvent>"]
        Filter["filter(type === 'METRIC_SELECTED')"]
    end
    
    subgraph "Subscribers"
        Settings["Settings MFE"]
        Shell["Shell"]
    end
    
    Dashboard --> EmitCall --> Subject
    Subject --> Filter
    Filter --> Settings
    Filter --> Shell
```

**Pros:** Type-safe, Angular-native, supports operators  
**Cons:** Memory leaks if subscriptions not cleaned up

### Pattern 2: Browser CustomEvents

```typescript
// Emitter (Dashboard)
window.dispatchEvent(new CustomEvent('mfe:metric-selected', {
  detail: { metricId: '123' }
}));

// Listener (Settings)
window.addEventListener('mfe:metric-selected', (event) => {
  console.log(event.detail.metricId);
});
```

**Pros:** Works across any framework, persists across MFE boundaries  
**Cons:** No type safety, manual cleanup required

### Pattern 3: Shared State via Signals

```mermaid
flowchart TB
    AuthService["AuthService (singleton)"]
    Signal["_authState = signal<AuthState>(...)"]
    
    Shell["Shell: auth.isAuthenticated()"]
    Dashboard["Dashboard: auth.user()"]
    Settings["Settings: auth.userRole()"]
    
    AuthService --> Signal
    Signal --> Shell
    Signal --> Dashboard
    Signal --> Settings
    
    Shell --> |"All read same<br/>reactive state"| Signal
```

**Pros:** Reactive, no subscriptions to manage, Angular 19+ optimized  
**Cons:** Only for state, not events

---

## Production Recommendations

### Security Hardening

| Issue | Solution | Priority |
|-------|----------|----------|
| Client-side token storage | Use HttpOnly cookies set by backend | 🔴 Critical |
| XOR encryption | Use proper crypto (AES-256) or avoid client encryption | 🔴 Critical |
| JWT verification | Backend-only signature verification | 🔴 Critical |
| XSS protection | Implement strict CSP headers | 🟡 High |
| CSRF protection | Use SameSite cookies + CSRF tokens | 🟡 High |

### Architecture Improvements

```mermaid
flowchart TB
    subgraph "Current (POC)"
        SimAuth["Simulated Auth<br/>(client-side)"]
        XOREnc["XOR Encryption"]
        SessionStore["SessionStorage"]
    end
    
    subgraph "Production Ready"
        RealAuth["Real Backend Auth<br/>(OAuth2/OIDC)"]
        HttpOnly["HttpOnly Cookies"]
        Refresh["Refresh Token Flow"]
        RBAC["Backend RBAC"]
    end
    
    SimAuth --> |"Replace"| RealAuth
    XOREnc --> |"Remove"| HttpOnly
    SessionStore --> |"Replace"| HttpOnly
```

### Recommended Token Flow

```mermaid
sequenceDiagram
    participant MFE
    participant Auth0 as Auth Provider (Auth0/Keycloak)
    participant API as Backend API
    
    MFE->>Auth0: Redirect to /authorize
    Auth0->>Auth0: User authenticates
    Auth0->>MFE: Callback with authorization code
    MFE->>Auth0: Exchange code for tokens
    Auth0-->>MFE: Access Token + Refresh Token
    Note over MFE: Store tokens in memory only
    
    MFE->>API: Request with Bearer token
    API->>Auth0: Verify token
    Auth0-->>API: Valid
    API-->>MFE: Protected data
    
    Note over MFE: Token expires
    MFE->>Auth0: Use refresh token
    Auth0-->>MFE: New access token
```

---

## Summary

### What This Architecture Achieves

✅ **Independent Deployment**: Each MFE can be built and deployed separately  
✅ **Shared Authentication**: Single auth state across all MFEs  
✅ **Loose Coupling**: MFEs communicate via events, not direct imports  
✅ **Technology Agnostic**: Native Federation works with any framework  
✅ **Runtime Integration**: No rebuild of shell required for remote updates  

### Key Files Reference

| File | Purpose |
|------|---------|
| `mfe-shell/src/main.ts` | Federation initialization |
| `mfe-shell/src/assets/federation.manifest.json` | Remote MFE URLs |
| `*/federation.config.js` | Federation configuration |
| `shared/auth/auth.service.ts` | Central authentication |
| `shared/auth/token.service.ts` | Token storage and encryption |
| `shared/event-bus/event-bus.service.ts` | Cross-MFE events |

---

> **Last Updated**: January 2026  
> **Version**: 1.0.0  
> **Architecture**: Angular 19 + Native Federation 19
