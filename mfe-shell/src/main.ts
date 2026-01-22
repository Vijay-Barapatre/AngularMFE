/**
 * ============================================================================
 * MAIN.TS - Federation Bootstrap
 * ============================================================================
 * 
 * Initializes Native Federation before bootstrapping Angular.
 * Loads the federation manifest to discover remote MFEs.
 */

import { initFederation } from '@angular-architects/native-federation';

// Load federation manifest dynamically
initFederation('/assets/federation.manifest.json')
  .catch(err => console.error('Federation init failed:', err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error('Bootstrap failed:', err));
