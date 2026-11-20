import { Router, type RequestHandler } from 'express';
import { createCloneHandler, listAllClones, preview, download, type ClonerConfig } from '../controllers/clonerController';

/**
 * Options for creating the cloner router.
 */
export interface ClonerRouterOptions extends ClonerConfig {
  /** Optional authentication middleware to protect routes */
  requireAuth?: RequestHandler;
}

/**
 * Creates a cloner router with optional configuration and middleware.
 * 
 * @param options - Configuration options including auth middleware and cloner settings
 * @returns Express router with cloner endpoints
 * 
 * @example
 * // Public access (no auth)
 * app.use('/api/cloner', createClonerRouter());
 * 
 * @example
 * // Protected with custom config
 * app.use('/api/cloner', createClonerRouter({
 *   requireAuth: authenticateToken,
 *   banner: false,
 *   clonesDir: '/custom/path'
 * }));
 */
export function createClonerRouter(options: ClonerRouterOptions = {}): Router {
  const router = Router();
  const { requireAuth, ...config } = options;

  // Clone handler with config
  const cloneHandler = createCloneHandler(config);

  // Apply auth middleware if provided
  if (requireAuth) {
    router.post('/clone', requireAuth, cloneHandler);
    router.get('/clones', requireAuth, listAllClones);
    router.get('/preview/:id', requireAuth, preview);
    router.get('/download/:id', requireAuth, download);
  } else {
    router.post('/clone', cloneHandler);
    router.get('/clones', listAllClones);
    router.get('/preview/:id', preview);
    router.get('/download/:id', download);
  }

  return router;
}

// Default router (public access, default config) — backward compatible
const router = createClonerRouter();

export default router;
