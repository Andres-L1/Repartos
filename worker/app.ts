import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { createContext, type AppDeps } from './context.js';
import { HttpError, type Env } from './http.js';
import { registerAccountRoutes } from './routes/account.js';
import { registerMapRoutes } from './routes/map.js';
import { registerLessonRoutes } from './routes/lessons.js';
import { registerReviewRoutes } from './routes/review.js';
import { registerShopRoutes } from './routes/shop.js';
import { registerAdminRoutes } from './routes/admin.js';

export type { AppDeps };

const MAX_BODY = 16 * 1024;

/** Cabeceras, CORS y límites comunes; las rutas viven por dominio en worker/routes/. */
export function createApp(deps: AppDeps) {
  const app = new Hono<Env>();

  // ---------- cabeceras, CORS, límites ----------
  app.use('*', async (c, next) => {
    await next();
    const p = new URL(c.req.url).pathname;
    if (p.startsWith('/api/') || p.startsWith('/auth/')) {
      c.header('X-Content-Type-Options', 'nosniff');
      c.header('X-Frame-Options', 'DENY');
      c.header('Referrer-Policy', 'no-referrer');
      c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
      // El temario público (/api/outline) no depende de la sesión: cacheable unos minutos. Todo lo demás, nunca.
      c.header('Cache-Control', p === '/api/outline' && c.res.status === 200 ? 'public, max-age=300' : 'no-store');
    }
  });
  app.use(
    '/api/*',
    cors({
      origin: (o) => (deps.devOrigin && o === deps.devOrigin ? o : null),
      credentials: true,
      allowHeaders: ['Content-Type'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      maxAge: 600,
    }),
  );
  // Defensa CSRF adicional: peticiones que cambian estado solo desde el origen propio (o el de desarrollo).
  app.use('/api/*', async (c, next) => {
    if (c.req.method !== 'GET' && c.req.method !== 'OPTIONS') {
      const origin = c.req.header('origin');
      if (origin) {
        let ok = origin === deps.publicOrigin || (!!deps.devOrigin && origin === deps.devOrigin);
        try {
          ok = ok || new URL(origin).host === new URL(c.req.url).host;
        } catch {
          ok = false;
        }
        if (!ok) return c.json({ error: 'Origen no permitido' }, 403);
      }
    }
    await next();
  });
  app.use(
    '/api/*',
    bodyLimit({ maxSize: MAX_BODY, onError: (c) => c.json({ error: 'Cuerpo demasiado grande' }, 413) }),
  );
  app.onError((err, c) => {
    if (err instanceof HttpError) return c.json({ error: err.message }, err.status);
    console.error('error interno:', err instanceof Error ? err.message : 'desconocido'); // sin cuerpos ni secretos
    return c.json({ error: 'Error interno' }, 500);
  });
  app.notFound(async (c) => {
    const p = new URL(c.req.url).pathname;
    if (!p.startsWith('/api/') && !p.startsWith('/auth/') && deps.assets) return deps.assets.fetch(c.req.raw);
    return c.json({ error: 'No encontrado' }, 404);
  });

  const k = createContext(deps);
  registerAccountRoutes(app, k); // /auth/*, /api/config, /api/outline, /api/me, /api/account, /api/profile
  registerMapRoutes(app, k); // /api/map, /api/level
  registerLessonRoutes(app, k); // /api/lessons/*, /api/demo
  registerReviewRoutes(app, k); // /api/review/complete, /api/session/*
  registerShopRoutes(app, k); // /api/shop/*
  registerAdminRoutes(app, k); // /api/admin/*

  return app;
}
