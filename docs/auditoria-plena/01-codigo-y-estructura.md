# Auditoría plena 01: código y estructura (2026-11-15)

Alcance: `worker/`, `src/`, capa de datos de `web/src`, `scripts/`, `migrations/`, `package.json`, `wrangler.jsonc`, `web/public/_headers`, estructura del repo, tests, bundle y privacidad. Base: commit `de74847`. Los CSS y las pantallas no se tocaron salvo lo indicado en «Cambios en archivos de pantalla».

## Resumen

1. No hay hallazgos Críticos: la API valida en el límite (JSON con tipo, tamaños, regex de ids, UCI, FEN con jugada legal), usa solo sentencias con parámetros y las operaciones sensibles (compra, racha, sesión, repaso) son atómicas con índices únicos.
2. La administración (`andresli`) es segura para lo que hace: se decide por el id que verifica Lichess y no hay ruta de administración; solo abre unidades y equipa tienda, sin regalar saldo ni progreso.
3. Importante resuelto: paquete JS inicial de 741 kB a 264 kB con carga diferida real de pantallas (desaparece el aviso de chunk grande sin subir el límite).
4. Importante resuelto: los avisos de partidas repasadas pendientes se enviaban con la sesión de quien entrara después en el mismo navegador; ahora van por cuenta.
5. Importante resuelto: `/privacidad` omitía tienda, identificadores de partidas, IndexedDB, la petición del navegador a Lichess y Cloudflare; reescrita contra las tablas `cp_*`.
6. Importante resuelto: no había forma de borrar la cuenta; `DELETE /api/account` (cascada). Falta el botón en el Perfil.
7. `tsc` no revisaba `worker/` ni `scripts/` (el `include` apuntaba a una carpeta `server` inexistente); ahora sí, con `noUnusedLocals`.
8. Sin resolver y documentado: sin límite de tasa por usuario, sesión sin revocación, lectura de todo el depósito de puzles cada minuto, código muerto de XP/objetivo diario.

## Hallazgos

| # | Sev. | Dónde | Evidencia | Estado |
|---|---|---|---|---|
| 1 | Importante | `web/src/App.tsx` (importaciones de pantallas), `web/src/api.ts:23` | Un único chunk de 741 kB (215 kB gzip) y aviso de Vite; el simulador `dev/mock` y los datos de contenido iban en el paquete inicial | Arreglado (commit «carga diferida»): `React.lazy` por pantalla + `import()` del simulador; inicial 264 kB |
| 2 | Importante | `web/src/review/completion.ts` | La lista `chedex-review-pending` de `localStorage` no tenía dueño: otra persona que entrara en el mismo navegador enviaba esos repasos a su propia cuenta; un 400 permanente se reintentaba para siempre | Arreglado: cada aviso lleva `userId`, solo se envía con su cuenta, los rechazos 4xx definitivos se descartan, tope de 50. Test `test/web/review-completion.test.ts` (3) |
| 3 | Importante | `web/src/api.ts:42` | `sessionStorage.getItem` sin protección al cargar el módulo: con almacenamiento bloqueado la app entera no arrancaba | Arreglado (try/catch con valor definido, no vacío) |
| 4 | Importante | `web/src/screens/Privacy.tsx` | Decía guardar 5 cosas; el código guarda además fechas de acceso, nivel, objetivo, Chedex, compras, protectores, ids de partidas repasadas y elementos de sesión; no mencionaba IndexedDB, la petición directa del navegador a Lichess (IP y usuario visibles), la cookie OAuth de 10 min ni Cloudflare | Arreglado (solo texto) |
| 5 | Importante | `worker/app.ts` | Sin endpoint de borrado de cuenta (RGPD: supresión) | Arreglado en API: `DELETE /api/account`, Origin obligatorio, borra `cp_users` y por `ON DELETE CASCADE` todas las tablas `cp_*` del usuario (todas tienen FK con cascada: `grep REFERENCES migrations`). Test en `api.test.ts`. **Falta** botón en la web (pantalla de Perfil, fuera de mi área); la privacidad dice que de momento se pide en el repositorio |
| 6 | Importante | `tsconfig.json` | `include` listaba `server` (no existe) y omitía `worker` y `scripts`: `worker/index.ts` no se tipaba | Arreglado; además `noUnusedLocals/Parameters` (salieron 4: `xpToday` muerto en `worker/app.ts`, `yesterdayOf`, `Level`, `priceText`) |
| 7 | Importante | `web/public/_headers` | `style-src 'unsafe-inline'` sin necesitarlo; `form-action` permitía lichess.org (el acceso es un enlace, no un formulario); `/assets/*` (con hash) sin caché inmutable; sin HSTS, COOP ni Permissions-Policy | Arreglado. CSP sin inline comprobada en navegador (tablero con flechas, motor Stockfish en Worker con wasm, tienda, perfil, partidas, entrenar): 0 violaciones. Test `test/web/headers.test.ts` |
| 8 | Menor | `vitest.config.ts` | `npm test` recogía los tests de `.claude/worktrees/` | Arreglado (`exclude`) |
| 9 | Menor | `package.json` `engines` | `>=20` pero los tests usan `node:sqlite` (22.5+) | Arreglado (`>=22.5`) y README |
| 10 | Menor | `worker/puzzles.ts:36` | Petición a Lichess del cron sin tiempo máximo | Arreglado (`AbortSignal.timeout(15 s)`) |
| 11 | Menor | `README.md`, `docs/estado-proyecto.md` | Decían «0 a ~800 Elo», «rápidas y clásicas» y no hablaban de la administración; el estado afirmaba «sin XP» aunque el servidor lo sigue calculando | Arreglado (docs al día) |
| 12 | Menor | `test/shared/admin.test.ts` | La administración solo tenía un test de integración | Añadido: mayúsculas, cuentas parecidas, espacios, vacío |
| 13 | Importante (riesgo de coste) | `worker/puzzles.ts` `fillPool` | El cron de cada minuto hace `GROUP BY` sobre todo `cp_puzzle_pool` (plan: `SCAN ... USING INDEX idx_cp_puzzle_pool_pick`). 65 combinaciones x 40-90 sin usar = unas 2.600-5.800 filas leídas por minuto, 3,7-8,4 M al día frente a los 5 M diarios del plan gratuito de D1 | **No tocado**: no puedo medir el plan de D1 de la cuenta. Propuesta: tabla de contadores por combinación (migración nueva, solo lecturas de 65 filas) o ejecutar el relleno solo cuando `minuto % 3 = 0` |
| 14 | Importante (riesgo) | `worker/app.ts` (todas las rutas) | Sin límite de tasa por usuario. Un usuario autenticado puede inventar `gameId` de 8 caracteres en `/api/review/complete` (filas ilimitadas en `cp_reviewed_games` y sumar a `cp_weak_concepts`) o martillear escrituras en D1 | **No tocado**: lo correcto es una regla de limitación de tasa de Cloudflare (WAF) sobre `/api/*`; hacerlo en D1 añadiría escrituras por petición. Propuesta además: tope de partidas repasadas por usuario |
| 15 | Menor (riesgo) | `worker/auth.ts` `readSession` | Sesión sin estado (cookie AES-GCM de 7 días): salir o borrar la cuenta no invalida una cookie copiada; tras el borrado, otra pestaña con cookie válida recibiría 500 por la clave foránea en vez de 401 | **No tocado**: revocarla exige una consulta a D1 por petición o una tabla de sesiones. Propuesta: comprobar `cp_users` solo en `/api/me` y en escrituras |
| 16 | Menor | `web/src/dev/mock.ts` | El simulador sigue accesible en producción con `?mock` (datos falsos, sin efectos en el servidor) | Reducido: ya no pesa en el paquete inicial. Dejarlo es decisión del usuario (lo usan las pruebas visuales); propuesta: `import.meta.env.DEV` |
| 17 | Menor | `web/src/review/cache.ts` | El análisis de las partidas queda en IndexedDB tras cerrar sesión (dispositivo compartido) | Documentado en `/privacidad`; propuesta: borrar al «Salir» |
| 18 | Menor | `PUT /api/profile/daily-goal`, columnas `xp*`, `xpGained` | Código muerto: la web no usa XP ni objetivo diario | **No tocado**: tiene tests y contrato; decisión del usuario (quitar o reactivar) |
| 19 | Menor | `worker/app.ts` (655 líneas, `createApp` monolítico) | El módulo más grande | **No tocado**: dividir en módulos por grupo de rutas es un refactor sin cambio de comportamiento que conviene hacer aparte, con la suite actual de red de seguridad |
| 20 | Menor | `web/src/components/Board.tsx:106,113`, `ErrorLessonPlayer.tsx:81`, `ReviewGameScreen.tsx:73`, `ShopScreen.tsx:40` | 5 comentarios `eslint-disable` de un plugin que no está instalado (no hay ESLint): comentarios inertes que además ocultan dependencias de hooks sin revisar | **No tocado** (pantallas, otra auditoría). Propuesta: revisar cada `useEffect` y borrar el comentario |
| 21 | Menor (legal) | `THIRD_PARTY_NOTICES.md` | Coherente con lo distribuido: chessground, chessops, stockfish, cburnett, sonidos AGPL, hono, react, DM Sans; los diez juegos ilustrados (catedral, cosmos, egipto, neon, olimpo, pixel, plano, samurai, sombras, vikingo) coinciden con `web/public/pieces/` (120 imágenes WebP) y `geo`/`contorno` (SVG) son propios. Las ilustraciones generadas con IA se declaran bajo GPL, pero la autoría de obras generadas con IA es dudosa | Sin cambios; consulta a un abogado si el proyecto será un negocio |
| 22 | Menor | `scripts/`, `samples/`, `pulse/` | `pulse/legacy-redirect.mjs` + `wrangler.redirect.jsonc` (dominio anterior) y `samples/` (CLI) están descritos en el README; sin ficheros sobrantes encontrados | Sin cambios |

### Revisado y correcto (sin hallazgo)

- Índices (EXPLAIN en SQLite sobre las migraciones reales): todas las consultas de usuario usan índice (`idx_cp_wallet_ledger_once`, `idx_cp_session_items_*`, `idx_cp_review_*`, PK). Solo dos recorren la tabla entera: la limpieza horaria de `cp_session_items` (`DELETE ... WHERE created_at < ?`, tabla pequeña por la retención de 7 días) y `cp_puzzle_pool` (ver 13).
- CSRF/origen: `/api/*` rechaza `Origin` ajeno en métodos que cambian estado; las cookies son `HttpOnly; Secure; SameSite=Lax` con prefijo `__Host-`; el cierre de sesión exige `Origin` propio; CORS solo para el origen de desarrollo.
- Límite de cuerpo 16 kB (`bodyLimit`), `Content-Type` obligatorio, errores 500 sin cuerpos ni secretos en el log, cabeceras `no-store` y CSP restrictiva en la API.
- Token de Lichess: solo en memoria, revocado siempre (`finally`); `SESSION_SECRET` solo por secreto de Worker (`.dev.vars` ignorado por git; `wrangler.jsonc` solo tiene variables públicas y el id de base).
- Motor Stockfish: `BrowserEngine.close()` termina el Worker y aborta la sesión; el runner lo cierra en `finally`; sin listeners sin limpiar en `sound.ts` (el desbloqueo se desinstala tras el primer gesto).
- `npm audit`: 0 vulnerabilidades. Dependencias: todas las de `dependencies` se usan; `chessground` figura como «deprecated» en npm (aviso del paquete, sin alternativa libre equivalente).

## Métricas

| | Antes | Después |
|---|---|---|
| `tsc --noEmit` | verde (sin `worker/` ni `scripts/`) | verde, con `worker/`, `scripts/`, `noUnusedLocals` |
| Tests | 45 archivos, 1373 | 48 archivos, 1381 (+8: repasos por cuenta 3, cabeceras 2, administración 2, borrado de cuenta 1) |
| Duración de tests | 22,5 s | 23,7 s |
| JS inicial (entrada) | 741 kB (215,8 kB gzip), 1 chunk | 264 kB (81,6 kB gzip) |
| JS que carga la portada (entrada + preload: catálogo, sesión, tablero, runtime) | 741 kB | unos 345 kB |
| CSS inicial | 118,6 kB (25,2 kB gzip) | 83,2 kB (16,8 kB gzip) + trozos por pantalla |
| Chunks | 2 ficheros | 26 ficheros; la mayor pantalla (Partidas) 80 kB; el temario (`content`) 218 kB solo se carga con Perfil o el simulador |
| Aviso de chunk grande | sí | no (límite sin tocar) |
| `vite build` | 0,3 s (1,2 s con copia del motor) | igual |
| `dist/web` | 2,9 MB | 3,0 MB (más ficheros por la división) |

## Cambios en archivos de pantalla (excepciones declaradas)

- `web/src/App.tsx`: carga diferida de pantallas (exigido por la tarea del bundle).
- `web/src/screens/Privacy.tsx`: solo texto (exigido por la tarea de privacidad).
- `web/src/screens/ShopScreen.tsx`: una importación sin uso eliminada.

## Lo que NO pude verificar

- D1 en producción: que `PRAGMA foreign_keys` esté activa (D1 la aplica por defecto) y por tanto que el borrado en cascada funcione allí; en tests con `node:sqlite` con claves foráneas activadas funciona. El coste real de filas leídas por el cron (13) y el plan de la cuenta.
- La CSP nueva y las cabeceras (HSTS, COOP, Permissions-Policy, caché inmutable) en producción: probadas con un servidor estático propio en un puerto local con la misma CSP, no con `wrangler` ni con las reglas de `_headers` de Cloudflare. Revisar tras desplegar que COOP no afecta al retorno del acceso con Lichess (es navegación de nivel superior, no debería).
- Safari, Firefox y dispositivos reales (CSP con tablero y motor solo en Chromium integrado).
- La carga diferida solo se comprobó en el build local y con `?mock=1`; no con latencia de red real.
- Aplicar migraciones remotas, desplegar o empujar: no se hizo.
- Que los textos de `/privacidad` sean suficientes legalmente (no es asesoría legal); su contenido sí se contrastó con el código.

## Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor

| # | Punto | Estado | Cómo |
|---|-------|--------|------|
| 1 | Coste del cron de puzles (leía todo `cp_puzzle_pool` en cada ejecución) | Arreglado | Migración 0010: tabla `cp_puzzle_stats` (tema, dificultad, sin usar, último relleno) mantenida por tres disparadores sobre `cp_puzzle_pool` (alta, cambio de `used_at`, baja), atómicos con cada inserción, reclamo, liberación de carrera perdida o limpieza, así que no hay deriva; relleno inicial idempotente con `INSERT OR REPLACE ... SELECT`. `fillPool` lee 1 fila de pausa + una por combinación (75): **76 filas por ejecución** (antes, todo el depósito: con 75 combinaciones de hasta 200 sin usar más los usados de los últimos 30 días, del orden de **15 000 a 20 000 filas**; a cada minuto serían 22 a 29 M al día contra las 5 M del plan gratuito). A cada minuto: 76 x 1440 = **~110 000 filas/día** (2 % del límite); con un relleno cada minuto en el peor caso (50 altas con su disparador y comprobación del índice, unas 300 lecturas) sumarían otras ~430 000: **menos del 11 %**. Limpieza horaria sin recorrer tablas: índices nuevos `idx_cp_puzzle_pool_used` y `idx_cp_session_items_created`, y el recorte de 200 sin usar solo mira las combinaciones que los contadores dicen que se pasan. Toma de puzle (`GET /api/session`): índice `idx_cp_puzzle_pool_take (theme, difficulty, used_at, fetched_at)` que da el orden sin ordenar y para en el primero que cumple el tope de valoración (con EXPLAIN: antes `SCAN`/ordenación de hasta 200 filas por puzle; ahora 1 entrada de índice y 1 fila, o hasta 200 si el tope descarta muchos). Cron de vuelta a `* * * * *`. Tests: `test/worker/puzzle-stats.test.ts` (5: contadores = verdad tras altas, reclamos, liberaciones, repetidos y limpieza; 30 reclamos concurrentes; relleno repetible; el cron lee <= 76 filas sin tocar `cp_puzzle_pool`; planes sin SCAN ni ordenación) y una aserción de contadores en la carrera de `GET /api/session` contra D1 local real. **Pendiente: aplicar 0010 en remoto antes de desplegar.** |
| 2 | Límites por usuario (`gameId` inventado, tablas sin tope) | Arreglado | El formato de `gameId` (8 alfanuméricos) ya se validaba. Topes nuevos por usuario, conservando lo más reciente: 500 partidas repasadas (`cp_reviewed_games`; una partida muy antigua podría volver a contarse), 200 posiciones resueltas (además de las 100 sin resolver), 300 conceptos fallados distintos (`cp_weak_concepts`: `mistakes` de una lección admitía cualquier cadena; el cliente legítimo manda ids del temario; pasado el tope solo cuentan los ya existentes), y los reclamos de intento de lección (`cp_wallet_ledger`, una fila por intento sin fin) se podan a las 2 últimas por lección. Se recorta en el mismo lote atómico, sin error al usuario (los topes no afectan a un uso normal). Tests en `api.test.ts` («partidas repasadas»). |
| 3 | Sesión tras borrar la cuenta (500) | Arreglado | `requireAuth` comprueba que `cp_users` tenga al usuario (1 lectura por PK); si no, 401 y cookies limpiadas. Test con la cookie anterior al `DELETE /api/account` sobre cuatro rutas. |
| 4 | Código muerto XP y objetivo diario | Arreglado en servidor | Fuera `PUT /api/profile/daily-goal`, `computeXp`, la escritura de `xp*`/`last_xp` y los campos de la respuesta. Columnas de D1 intactas. En `src/shared/api.ts` queda `Profile` (deprecated) solo porque `web/src/dev/mock.ts` y `web/src/api.ts` aún los nombran (carpeta ajena a este arreglo). Tests ajustados (los de CSRF, tamaño y tipo de contenido pasan a `PUT /api/level`) y uno nuevo que fija la ausencia. |
| 5 | `worker/app.ts` de 650 líneas | Arreglado | `worker/app.ts` (84 líneas: cabeceras, CORS, CSRF, límite de cuerpo, errores), `worker/context.ts` (`createContext`: datos compartidos, `requireAuth`), `worker/http.ts` y `worker/routes/{account,map,lessons,review,shop}.ts (hoy también admin.ts; la facturación se retiró)`. Mismo `createApp(deps)` y `AppDeps`; el código de las rutas se movió sin cambios y los 1543 tests pasan sin tocar ninguno por esta división. |

No verificado: `wrangler d1 migrations apply --remote` con disparadores (ver estado-proyecto, punto 00); las cifras de filas leídas salen de contar con node:sqlite y EXPLAIN, no del `rows_read` de D1 real.
