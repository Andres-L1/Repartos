# Repasos espaciados y sesión diaria — plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans. Pasos con casillas `- [ ]`.

**Objetivo:** botón «Entrenar hoy» que arma una sesión de hasta 5 posiciones de los conceptos que toca repasar (errores propios, puzles de Lichess o banco), con las respuestas verificadas en el servidor.

**Arquitectura:** calendario de 5 cajas por concepto (`cp_review_schedule`); el servidor crea la sesión, guarda las soluciones y valida cada jugada; los puzles salen de un depósito del servidor que rellena el Worker desde Lichess; el navegador solo juega y muestra.

**Stack:** TypeScript, Hono + D1 (`worker/`), React 19 + Vite (`web/`), chessops, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md`

## Restricciones globales

- D1: solo `CREATE TABLE IF NOT EXISTS`, tablas `cp_*`, migración `0007` (hay un test que lo exige).
- Cajas: esperas de 1, 2, 4, 8 y 16 días; acertar sube una caja, fallar vuelve a la caja 1. Un concepto sin fila se trata como caja 1 y vencido. Un fallo nuevo en una caja superior la devuelve a la 1.
- Temas de Lichess: `hangingPiece`→`tactics.hanging_piece`, `fork`→`tactics.fork`, `pin`→`tactics.pin`, `discoveredAttack`→`tactics.discovered_attack`, `mate`→`tactics.mate_threat`; `tactics.bad_exchange` usa el banco.
- Puzle: tras reproducir `game.pgn` completo con `parseGame`, `solution[0]` es legal y es el movimiento del alumno; el rival responde con `solution[1]`, etc. (comprobado con 75 puzles reales). Se descarta el que no lo cumpla. El lote (`/api/puzzle/batch/{tema}?nb=50&difficulty=...`) no trae `fen`.
- Las peticiones a Lichess las hace el Worker (API anónima), depósito por tema y dificultad: se rellena cuando quedan menos de 10 sin usar o tiene más de 7 días. Con 429 o error, la sesión cae al banco de 26 ejercicios (`EXERCISES`, solución en `solutionUci`, el alumno mueve primero).
- El navegador nunca recibe soluciones antes de intentar; la solución solo se revela al terminar el elemento o tras el segundo fallo. No hay resultados declarados por el cliente.
- Una sesión sin terminar caduca a las 24 h; `finish` es idempotente y mueve una caja solo si el concepto está vencido (`due_at` ≤ ahora).
- Una sesión solo avanza la racha con la regla actual (puede dar Chedex de hito), sin XP. Se extrae la lógica de racha de la finalización de lecciones a una función compartida; los tests de lecciones deben seguir pasando.
- Tope de 100 posiciones propias sin resolver por usuario (se borran las más antiguas).
- `/privacidad` pasa a decir que se guardan las posiciones de los errores.
- Español claro, sin emojis, responsive desde 320 px, toques de 44 px, piezas movibles de verdad y sonidos como en el repaso (`web/src/sound.ts`).
- Commits directos en `main` con `git add <rutas>` explícitas y la línea final `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. No push ni despliegue hasta que lo decida el controlador.

## Foco de revisión

1. Lichess responde 429 o está caído: la sesión se crea igual con banco, sin error visible. (T3, T4)
2. Alumno sin conceptos vencidos o sin fallos: «Hoy no toca repasar» con la próxima fecha, nunca una sesión vacía. (T4, T5)
3. Doble envío de `answer` o `finish`, o responder con el `itemId` de otro usuario: sin efecto doble ni fuga de datos. (T4)
4. Payload de errores propios inválido (FEN ilegal, `bestUci` ilegal, concepto desconocido, más de 3). (T2)
5. Puzle del depósito que no pasa la validación del PGN, o concepto sin tema de Lichess (`bad_exchange`). (T1, T3)

---

### Task 1: Calendario y puzles (módulo puro)

**Archivos:** Crear `src/review/srs.ts`, `test/review/srs.test.ts`, `test/fixtures/lichess-puzzles.json` (3 puzles reales de lotes distintos, obtenidos de la API anónima; si no hay red, 3 escritos a mano con PGN válido).

**Interfaces:**
- Produce: `BOX_DAYS: readonly [1, 2, 4, 8, 16]`; `nextBox(box: number, correct: boolean): number` (acierto: min(box+1, 5); fallo: 1; cajas 1 a 5); `dueAfter(box: number, nowMs: number): number` (milisegundos del próximo vencimiento: `BOX_DAYS[box-1]` días); `themeForConcept(conceptId: string): string | null` y `conceptForThemes(themes: string[]): string | null` con la tabla de temas; `difficultyForLevel(level: Level): 'easiest'|'easier'|'normal'|'harder'|'hardest'` (beginner→easiest, initiation→easier, basic→normal, intermediate→normal, advanced→harder, competitive→hardest; constante marcada como calibración pendiente); `puzzleStart(pgn: string, solution: string[]): { fen: string; line: string[] } | null` (reproduce el PGN con `parseGame`, devuelve el FEN final y la línea completa si `solution[0]` es legal y la línea entera se puede jugar; `null` si no).
- Sin imports de `node:` (lo vigila `test/web/no-node-imports.test.ts`: añadir `src/review/srs.ts` a su lista si no la cubre ya `src/review/**`).

- [ ] **Paso 1: tests que fallan** en `srs.test.ts`: `nextBox` (acierto en cajas 1 a 4 sube, en 5 se queda; fallo siempre 1); `dueAfter(1, t)` = t + 1 día y `dueAfter(5, t)` = t + 16 días; `themeForConcept('tactics.bad_exchange')` = `null` y las otras 5 dan su tema; `conceptForThemes(['middlegame','fork'])` = `tactics.fork`, sin tema conocido = `null`; `difficultyForLevel` de los 6 niveles; `puzzleStart` con los 3 puzles del fixture devuelve `fen` y `line` con `line[0] === solution[0]`; con un PGN ilegal, una solución cuyo primer movimiento no es legal o una línea que se rompe a mitad devuelve `null`.
- [ ] **Paso 2: ejecutar** `npx vitest run test/review/srs.test.ts`. Esperado: FAIL.
- [ ] **Paso 3: implementar** las firmas anteriores en `src/review/srs.ts`.
- [ ] **Paso 4: ejecutar** el mismo test y `npx tsc --noEmit`. Esperado: PASS.

### Task 2: Datos del servidor y errores propios

**Archivos:** Crear `migrations/0007_cp_review_srs.sql`, `worker/srs.ts`, `test/worker/srs.test.ts`. Modificar `worker/review.ts`, `worker/app.ts`, `src/shared/api.ts`, `web/src/review/completion.ts` y `web/src/screens/ReviewGameScreen.tsx` (envío de `positions`), `test/worker/api.test.ts`.

**Interfaces:**
- Esquema (todo `IF NOT EXISTS`): `cp_review_schedule (user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE, concept_id TEXT NOT NULL, box INTEGER NOT NULL, due_at INTEGER NOT NULL, last_at INTEGER, PRIMARY KEY (user_id, concept_id))`; `cp_review_positions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE, game_id TEXT NOT NULL, ply INTEGER NOT NULL, concept_id TEXT NOT NULL, fen TEXT NOT NULL, best_uci TEXT NOT NULL, created_at INTEGER NOT NULL, solved_at INTEGER, UNIQUE (user_id, game_id, ply))`; `cp_puzzle_pool (puzzle_id TEXT PRIMARY KEY, theme TEXT NOT NULL, difficulty TEXT NOT NULL, rating INTEGER NOT NULL, fen TEXT NOT NULL, line_json TEXT NOT NULL, fetched_at INTEGER NOT NULL, used_at INTEGER)`; `cp_session_items (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE, session_id TEXT NOT NULL, concept_id TEXT NOT NULL, kind TEXT NOT NULL, source_id TEXT, fen TEXT NOT NULL, line_json TEXT NOT NULL, step INTEGER NOT NULL DEFAULT 0, attempts INTEGER NOT NULL DEFAULT 0, first_try_ok INTEGER, status TEXT NOT NULL DEFAULT 'open', created_at INTEGER NOT NULL)`.
- Produce (`worker/srs.ts`): `touchSchedule(userId: string, conceptId: string, nowMs: number): Stmt` (si no hay fila: caja 1 y `due_at = dueAfter(1, now)`; si hay fila en caja > 1: la devuelve a la caja 1 con el mismo vencimiento; si está en caja 1: sin cambios); `parsePositions(raw: unknown): ReviewPosition[] | string` donde `ReviewPosition = { ply: number; conceptId: string; fen: string; bestUci: string }` (máx. 3; concepto conocido; FEN legal con chessops; `bestUci` legal en ese FEN; `ply` entero positivo); `storePositionStmts(userId: string, gameId: string, positions: ReviewPosition[], nowMs: number): Stmt[]` (inserta y recorta a 100 sin resolver por usuario, borrando los más antiguos).
- Contrato (`src/shared/api.ts`): `CompleteReviewBody` gana `positions?: ReviewPosition[]` (reexportado desde `src/review/srs.ts` o definido en `shared`; un solo origen).
- Integración: `completeReview` añade, en el mismo lote atómico y solo la primera vez, `touchSchedule` por concepto y `storePositionStmts`; la finalización de lecciones llama a `touchSchedule` por cada concepto de `mistakes`.

- [ ] **Paso 1: tests que fallan** en `test/worker/srs.test.ts` y `api.test.ts`: `touchSchedule` en los tres casos (sin fila, caja 3, caja 1); `parsePositions` rechaza FEN ilegal, `bestUci` ilegal, concepto desconocido, 4 posiciones y `ply` 0, y acepta un caso válido; `POST /api/review/complete` con `positions` guarda las filas y crea la fila del calendario solo la primera vez (segundo envío idéntico no duplica nada); con 101 posiciones sin resolver acumuladas queda el tope de 100 y se conservan las más recientes; la migración respeta el test de «solo `IF NOT EXISTS`»; el contrato antiguo sin `positions` sigue funcionando.
- [ ] **Paso 2: ejecutar** `npx vitest run test/worker`. Esperado: FAIL.
- [ ] **Paso 3: implementar** migración, `worker/srs.ts` e integración; el cliente (`completion.ts`/`ReviewGameScreen`) envía las posiciones de `keyErrors` (`fen = move.fenBefore`, `bestUci = move.bestUci`, `ply`, `conceptId = diagnosis.conceptIds[0]`).
- [ ] **Paso 4: ejecutar** `npx vitest run test/worker test/web` y `npx tsc --noEmit`; aplicar con `npm run db:migrate:local`. Esperado: PASS.

### Task 3: Depósito de puzles

**Archivos:** Crear `worker/puzzles.ts`, `test/worker/puzzles.test.ts`.

**Interfaces:**
- Consume: `puzzleStart`, `themeForConcept`, `difficultyForLevel` (T1), tabla `cp_puzzle_pool` (T2).
- Produce: `takePuzzle(db: Db, theme: string, difficulty: string, nowMs: number, fetchImpl?: typeof fetch): Promise<{ puzzleId: string; rating: number; fen: string; line: string[] } | null>` (elige uno sin usar del depósito y lo marca `used_at`; rellena antes con un lote de 50 si quedan menos de 10 sin usar o el último relleno tiene más de 7 días; cada puzle del lote se valida con `puzzleStart` y se descarta si da `null`; con 429, error de red, cuerpo inválido o depósito vacío devuelve `null`, nunca lanza).

- [ ] **Paso 1: tests que fallan** con un `fetchImpl` falso: depósito vacío → un fetch y devuelve uno válido; con 10 o más sin usar y reciente → cero fetch; el puzle inválido del lote no entra; 429 → `null` y no escribe; error de red → `null`; el mismo puzle no se entrega dos veces; relleno por caducidad de 7 días.
- [ ] **Paso 2: ejecutar** `npx vitest run test/worker/puzzles.test.ts`. Esperado: FAIL.
- [ ] **Paso 3: implementar** `takePuzzle` (una sola petición a la vez, `Accept: application/json`).
- [ ] **Paso 4: ejecutar** el test y `npx tsc --noEmit`. Esperado: PASS.

### Task 4: API de la sesión

**Archivos:** Crear `worker/session.ts`, `test/worker/session.test.ts`. Modificar `worker/app.ts` (rutas y extracción de la racha), `worker/shop.ts` si la función compartida de racha vive allí, `src/shared/api.ts`.

**Interfaces:**
- Consume: `touchSchedule`, `nextBox`, `dueAfter` (T1/T2), `takePuzzle` (T3), `EXERCISES` (`src/pedagogy/exercises.ts`), `cp_weak_concepts`.
- Produce (contratos en `src/shared/api.ts`): `SessionStatus { due: number; nextDueAt: string | null }`; `SessionItem { itemId: string; kind: 'own' | 'puzzle' | 'bank'; conceptId: string; fen: string; prompt: string }` (sin soluciones); `SessionStart { sessionId: string; items: SessionItem[] }`; `AnswerBody { itemId: string; uci: string }`; `AnswerResult { correct: boolean; reply?: string; done: boolean; solution?: string[]; tryAgain?: boolean }`; `FinishResult { reviewed: { conceptId: string; correct: boolean }[]; nextDueAt: string | null; streak: number }`.
- Rutas con sesión (`requireAuth`): `GET /api/session/status`; `GET /api/session` (reutiliza la sesión abierta de menos de 24 h o crea una nueva con hasta 5 elementos; conceptos vencidos ordenados por recuento en `cp_weak_concepts` descendente, un elemento por concepto y, si hay menos de 5 conceptos, repite concepto con otra posición; origen: posición propia sin resolver → `takePuzzle` → banco del nivel del alumno; 409 con `{ error }` si no hay nada que repasar); `POST /api/session/answer`; `POST /api/session/finish`.
- Reglas de `answer`: el elemento debe ser del usuario y estar abierto (si no, 404); compara `uci` con `line[step]`; acierto: si era el último movimiento del alumno → `done`, si no → devuelve el movimiento del rival (`reply`) y avanza dos pasos; fallo: primer fallo → `tryAgain: true`; segundo fallo → `done` con `solution`. `first_try_ok` se fija en el primer intento del elemento. Posición propia: acierto marca `solved_at`.
- Reglas de `finish`: solo si hay elementos de la sesión; una vez (idempotente); resultado por concepto = `first_try_ok` de su primer elemento; mueve la caja solo si `due_at` ≤ ahora; sesión sin elementos terminados responde 409; avanza la racha con la función compartida extraída de la finalización de lecciones; marca los elementos abiertos como cerrados.

- [ ] **Paso 1: tests que fallan** (arnés de `test/worker/api.test.ts` con SQLite): 401 sin sesión en las 4 rutas; `status` con conceptos vencidos y sin ellos; `GET /api/session` no incluye soluciones ni `line_json`; crea el máximo de 5 y prioriza el concepto más fallado; sin Lichess (`fetchImpl` que da 429) usa el banco; concepto `bad_exchange` usa el banco; `answer` con el `itemId` de otro usuario → 404; acierto de una línea de 3 movimientos devuelve `reply` y luego `done`; primer fallo `tryAgain`, segundo `done` con `solution`; `answer` sobre un elemento ya cerrado → 404; `finish` mueve la caja de un concepto vencido y no la de uno no vencido; `finish` dos veces mueve una sola vez y la racha avanza una sola vez; sin conceptos vencidos `GET /api/session` → 409; tests de lecciones intactos tras extraer la racha.
- [ ] **Paso 2: ejecutar** `npx vitest run test/worker`. Esperado: FAIL.
- [ ] **Paso 3: implementar** `worker/session.ts` y las rutas; extraer la racha a una función compartida (`advanceStreakStmts(userId, t)` o equivalente) y usarla en lecciones y sesión.
- [ ] **Paso 4: ejecutar** `npx vitest run test/worker` y `npx tsc --noEmit`. Esperado: PASS.

### Task 5: Pantalla «Entrenar hoy»

**Archivos:** Crear `web/src/screens/SessionScreen.tsx`, `web/src/session.css`. Modificar `web/src/api.ts`, `web/src/App.tsx` (ruta privada `/entrenar` y `router.ts` `PRIVATE_PREFIXES`), `web/src/screens/MapScreen.tsx` y `ProfileScreen.tsx` (botón con el número de conceptos que tocan), `web/src/screens/Privacy.tsx`, `test/web/router.test.ts`.

**Interfaces:**
- Consume: `SessionStatus`, `SessionStart`, `AnswerResult`, `FinishResult` (T4); `Board` y movimiento real de piezas (`web/src/components/Board.tsx`, `judgeBestMove`-style: el movimiento sale del tablero como `uci`), `ruleFor`, `playSound`.
- Produce: `api.sessionStatus()`, `api.session()`, `api.answer(body)`, `api.finish()`.

- [ ] **Paso 1: tests que fallan:** `isPrivatePath('/entrenar')` es verdadero.
- [ ] **Paso 2: implementar `SessionScreen`:** entrada con el recuento («Hoy toca repasar 3 conceptos») o, sin nada vencido, «Hoy no toca repasar» con la próxima fecha; durante la sesión, un elemento cada vez: tablero con la posición, enunciado del concepto, el alumno mueve la pieza (arrastrar o clic y clic, casillas legales), la jugada va a `answer`, el rival responde con su `reply` animado, el primer fallo muestra un aviso amable y deja reintentar, el segundo revela la solución animada; barra de progreso accesible; al final llama a `finish` y muestra el resumen (conceptos repasados, la regla `ruleFor` del más fallado, próxima fecha) con botón de volver. Errores de red: aviso con «Reintentar» sin perder la posición. Sonidos de movimiento y captura como en el repaso. Móvil: botones fijos al alcance del pulgar, tablero grande.
- [ ] **Paso 3: enlaces y privacidad:** botón «Entrenar hoy» en el mapa y el Perfil (con el recuento de `sessionStatus`; si no toca nada, sigue visible con el texto de próxima fecha); texto de `/privacidad` actualizado.
- [ ] **Paso 4: verificar:** `npx tsc --noEmit`, `npx vitest run test/web`, y una pasada visual a 320 y 1280 px con un arnés temporal que no se sube y se borra (decir en el informe si se hizo).

### Task 6: Cierre

- [ ] **Paso 1:** una sola pasada de `npm run typecheck`, `npm test` y `npm run build`.
- [ ] **Paso 2:** actualizar `docs/estado-proyecto.md` (leerlo antes): repasos espaciados y sesión diaria hechos, cómo funcionan las cajas y las fuentes, la verificación en el servidor, y pendientes (calibración de la dificultad de puzles, Fase 4).
- [ ] **Paso 3:** revisión de calidad con un agente independiente que arregla lo que encuentre (320, 375, 414, 768 px; desbordes, solapes, toques de 44 px, emojis, consola; la sesión completa con piezas movibles, un fallo y un acierto; estados de error y vacío).
- [ ] **Paso 4:** aplicar `0007` en producción y desplegar solo si todo está en verde; el controlador lo ejecuta.
