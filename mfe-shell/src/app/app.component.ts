/**
 * ============================================================================
 * APP COMPONENT - Root Application Component
 * ============================================================================
 * 
 * 📖 WHAT THIS FILE DOES:
 * This is the root component that contains only the router outlet.
 * All actual content comes from routed components (login, shell-layout, etc.)
 * 
 * 🎯 WHY SO SIMPLE:
 * The app component should be minimal. Layout logic goes in shell-layout.
 * This separation allows the login page to have a different layout than
 * the main application.
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- 
      🎯 ROUTER OUTLET
      This is where routed components are displayed.
      - /login → LoginComponent
      - / → ShellLayoutComponent (which has its own outlet for nested routes)
    -->
    <router-outlet />
  `,
  styles: [`
    /* 
      Make the app fill the viewport.
      This ensures layouts can use 100vh properly.
    */
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  /**
   * 💡 NO LOGIC HERE!
   * 
   * The root component should be almost empty.
   * All authentication, layout, and business logic goes in:
   * - AuthService (authentication)
   * - ShellLayoutComponent (main layout)
   * - Feature components (business logic)
   */
}
