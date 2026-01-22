/**
 * ============================================================================
 * AUTH MODELS - Type Definitions for Authentication
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * Defines all TypeScript interfaces and types used across the auth system.
 * Having these in one place ensures consistency across Shell and all MFEs.
 * 
 * 🎯 WHY SEPARATE MODELS FILE:
 * - Single source of truth for auth-related types
 * - Easy to update types in one place
 * - Prevents circular dependencies
 * - Makes code more maintainable
 * 
 * 💡 ANGULAR CONCEPT: TypeScript Interfaces
 * Interfaces define the "shape" of objects. They don't exist at runtime
 * (they're compiled away), but provide compile-time type checking.
 */

// ============================================================================
// USER MODELS
// ============================================================================

/**
 * Represents a logged-in user.
 * 
 * 🔍 USAGE:
 * - Stored in AuthService when user logs in
 * - Used to display user info in UI
 * - Used for role-based access control
 */
export interface User {
  /** Unique user identifier */
  id: string;
  
  /** User's email address (used for login) */
  email: string;
  
  /** Display name shown in UI */
  name: string;
  
  /** 
   * User's role determines what they can access
   * @example 'admin' | 'manager' | 'user' | 'guest'
   */
  role: UserRole;
  
  /** URL to user's avatar image (optional) */
  avatar?: string;
}

/**
 * Available user roles in the system.
 * 
 * 🔐 ROLE HIERARCHY (highest to lowest):
 * - admin: Full access to everything
 * - manager: Access to team features
 * - user: Basic access
 * - guest: View-only access
 * 
 * 💡 TIP: Use union types instead of enums when you need
 * the values as string literals (better tree-shaking).
 */
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

// ============================================================================
// AUTH STATE MODELS
// ============================================================================

/**
 * Complete authentication state.
 * 
 * 🔍 USAGE:
 * This is what gets shared across MFEs. It contains everything
 * needed to know about the current authentication status.
 * 
 * 📡 SHARED VIA: AuthService.authState$ signal
 */
export interface AuthState {
  /** Whether a user is currently logged in */
  isAuthenticated: boolean;
  
  /** The logged-in user (null if not authenticated) */
  user: User | null;
  
  /** Whether an auth operation is in progress */
  isLoading: boolean;
  
  /** Any auth-related error message */
  error: string | null;
}

/**
 * Initial auth state (not logged in, not loading, no errors).
 * 
 * 💡 TIP: Having a constant for initial state makes it easy
 * to reset the auth state (e.g., on logout).
 */
export const INITIAL_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// LOGIN/CREDENTIAL MODELS
// ============================================================================

/**
 * Credentials required for login.
 * 
 * 🔍 USAGE:
 * - Sent to AuthService.login()
 * - In real app, would be sent to backend API
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response from a successful login.
 * 
 * 🔍 USAGE:
 * - Returned by login API (simulated in this POC)
 * - Contains token and user info
 */
export interface LoginResponse {
  /** JWT access token */
  token: string;
  
  /** User information */
  user: User;
  
  /** Token expiration timestamp (Unix ms) */
  expiresAt: number;
}

// ============================================================================
// TOKEN MODELS
// ============================================================================

/**
 * Decoded JWT token payload.
 * 
 * 📖 WHAT IS JWT?
 * JSON Web Token - a compact, URL-safe way to represent claims.
 * Structure: header.payload.signature (all base64 encoded)
 * 
 * 🔍 IN THIS POC:
 * We simulate JWT by base64-encoding a JSON object.
 * Real JWTs are cryptographically signed by the server.
 */
export interface TokenPayload {
  /** User ID (from the user object) */
  sub: string;
  
  /** User's email */
  email: string;
  
  /** User's role */
  role: UserRole;
  
  /** Token issued at timestamp (Unix seconds) */
  iat: number;
  
  /** Token expiration timestamp (Unix seconds) */
  exp: number;
}

// ============================================================================
// DEMO USERS (FOR POC ONLY)
// ============================================================================

/**
 * Pre-configured demo users for testing.
 * 
 * ⚠️ WARNING: In a real app, NEVER store passwords in frontend code!
 * This is only for POC demonstration purposes.
 * 
 * 🔍 USAGE:
 * - Login with these credentials to test different roles
 * - Each user has different access levels
 */
export const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: '2',
    email: 'manager@demo.com',
    password: 'manager123',
    name: 'Manager User',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager'
  },
  {
    id: '3',
    email: 'user@demo.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
  },
  {
    id: '4',
    email: 'guest@demo.com',
    password: 'guest123',
    name: 'Guest User',
    role: 'guest',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
  },
];
