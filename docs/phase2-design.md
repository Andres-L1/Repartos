# Chedex Pulse, Fase 2: plataforma educativa inicial (diseño)

Objetivo (spec §12): una primera experiencia de aprendizaje completa, de 0 a 800 Elo, con catálogo limitado de alta calidad. Sustituirá al dashboard actual de https://chedexpulse.app (mismo Worker, misma base D1, tablas nuevas).

## Alcance
Acceso con Lichess, perfiles, mapa de aprendizaje, unidades 0-800, lecciones interactivas, sistema de progreso, evaluaciones. Pagos: preparados pero desactivados (beta abierta).

## Arquitectura
- **Web:** React + Vite + TypeScript en `web/` (router de hash). Tablero con `chessground`, legalidad con `chessops`. Identidad: DM Sans, negro y naranja. Se compila a `dist/web`.
- **API:** Hono sobre **Cloudflare Workers** (`worker/`). Solo APIs Web (`crypto.subtle`, `fetch`). Los estáticos los sirve la plataforma de assets (fallback SPA); el Worker solo recibe `/api/*` y `/auth/*` (`run_worker_first`).
- **Datos:** **D1** (`PULSE_DB`, base `chedexpulse-users`) tras la interfaz asíncrona `Db` (`worker/db.ts`). Implementación D1 en producción; en tests, `node:sqlite` (`test/worker/sqlite-db.ts`) con el mismo SQL y las mismas migraciones.
- **Tablas:** solo nuevas, prefijo `cp_` (`cp_users`, `cp_lesson_progress`, `cp_profiles`, `cp_weak_concepts`, `cp_subscriptions`, `cp_placement`) en `migrations/*.sql`. **Solo `CREATE TABLE IF NOT EXISTS`**: nunca DROP/ALTER ni se tocan datos de las tablas existentes (hay usuarios reales). Un test lo comprueba. La tabla de control de migraciones es `cp_d1_migrations`, para no chocar con la `d1_migrations` de otros módulos.
- **Acceso (solo Lichess):** OAuth PKCE sin scopes (`/auth/login`, `/auth/callback`, `POST /auth/logout`, `GET /api/me`). Sesión sellada con AES-GCM (`SESSION_SECRET`) en cookie `__Host-chedex_session` (HttpOnly, Secure, SameSite=Lax, 7 días). El token de Lichess se usa una vez para leer la cuenta y se revoca siempre; nunca se guarda. Usuario = `{id, username}` con upsert en `cp_users`. En local con HTTP el prefijo `__Host-` y `Secure` se omiten.
- **Colocación inicial:** en `/auth/callback` se leen de `/api/account` solo `perfs.rapid` y `perfs.classical` (se validan estrictamente, Elo 0-4000) y se guarda el mayor Elo fiable (no provisional y >= 10 partidas) en `cp_placement`, refrescado en cada login. `worker/placement.ts` (`PLACEMENT_BANDS`, calibración inicial a ajustar con datos reales) decide por `unit.level` y orden: <1000 empieza en la primera unidad; 1000-1399 abre `beginner` como repaso y recomienda la primera `initiation`; >=1400 abre todo y recomienda la segunda `initiation`. Las unidades abiertas dejan sus lecciones `available` (nunca `completed`), con `placedOpen`/`recommended` en `GET /api/map`. `GET/POST /api/placement`: el usuario puede elegir `scratch` y desactivar los efectos.
- **Seguridad:** comprobación de origen en `/auth/*` y en peticiones que cambian estado, CORS cerrado, límite de cuerpo, cabeceras (`nosniff`, `X-Frame-Options`, CSP) en API y en estáticos (`web/public/_headers`).
- **Contenido:** datos tipados en `src/content/` (TypeScript), empaquetados en el Worker. Posiciones y soluciones verificadas por código, no por IA. Enroque en UCI como `e1g1`/`e8c8`; el reproductor normaliza `e1h1` a esa forma (`canonicalUci`).
- **Pagos (`BILLING_MODE`):** `beta_open` (por defecto, producción): todas las lecciones sin paywall (se mantiene el orden pedagógico del mapa), `/api/billing` devuelve `{status:'none', beta:true}` y subscribe/cancel responden 501 «próximamente». `dev` (solo local): proveedor simulado. Nunca cobros reales; cualquier valor desconocido cae en `beta_open`.
- **Idioma:** español.

## Desarrollo local
```
cp .dev.vars.example .dev.vars   # y rellena SESSION_SECRET
npm run dev                      # build:web + migraciones locales + wrangler dev --local en :8787
npm test                         # vitest
npm run typecheck
npm run build                    # build:web + tsc
```
`SESSION_SECRET` = 32 bytes aleatorios en base64url: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. En `.dev.vars` va un valor de prueba (ignorado por git); en producción: `npx wrangler secret put SESSION_SECRET`.

## Despliegue (pasos manuales, no automatizados)
1. `npx wrangler secret put SESSION_SECRET` con un secreto nuevo de 32 bytes base64url.
2. Revisar `migrations/0001_cp_init.sql` y `0002_cp_placement.sql` y aplicar: `npx wrangler d1 migrations apply PULSE_DB --remote` (solo crea tablas `cp_*`; considerar una copia de seguridad de D1 antes).
3. `npm run build && npx wrangler deploy` (el custom domain `chedexpulse.app` ya está en `wrangler.jsonc`; sustituye al Worker actual, que usa el mismo nombre `chedexpulse`).
4. Comprobar que el cliente OAuth `chedexpulse` de Lichess admite la redirección `https://chedexpulse.app/auth/callback` (es la misma que usa hoy el dashboard, pero tras el despliegue el callback antiguo desaparece).

## Fuera de alcance (Fase 3+)
Repaso espaciado, sesiones diarias personalizadas, integración del entrenador pedagógico con las lecciones, Elo > 800, pagos reales (Stripe).

## Reparto
- API y datos: `worker/`, `migrations/`, `test/worker/`.
- Contenido unidades 1-3 y 4-6: `src/content/units/`, `test/content/`.
- Web: `web/`, `test/web/`.
Contratos: `src/content/schema.ts` y `src/shared/api.ts`.
