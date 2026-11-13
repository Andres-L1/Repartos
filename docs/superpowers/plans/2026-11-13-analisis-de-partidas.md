# Análisis de las últimas 10 partidas de Lichess — plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea a tarea. Los pasos usan casillas `- [ ]`.

**Objetivo:** el alumno pulsa un botón y repasa sus últimas 10 partidas de Lichess (blitz o más lento) con mini lecciones participativas y un informe final visual con una regla para sus siguientes partidas.

**Arquitectura:** todo en el navegador. Se pide a Lichess directamente, Stockfish 16 WASM de un solo hilo corre en un Web Worker, y el diagnóstico y la pedagogía actuales de `src/` se reutilizan sin duplicar lógica (el análisis recibe el motor como parámetro). Al servidor solo van ids de partida y conceptos fallados, de forma idempotente.

**Stack:** TypeScript, React 19 + Vite (`web/`), Hono en Cloudflare Worker + D1 (`worker/`), chessops, chessground, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-analisis-de-partidas-design.md`. Maqueta del informe: `.superpowers/brainstorm/3850-1794574400/content/informe-v3-mix.html`.

## Restricciones globales

- Stockfish 16 WASM de un solo hilo (`stockfish-nnue-16-single`) en un Web Worker; sin SharedArrayBuffer ni COOP/COEP.
- Reproducibilidad: búsqueda por profundidad (`REVIEW_DEPTH = 12`), un hilo, hash fijo, `ucinewgame` antes de cada posición. Una sola constante para todos los usuarios; la clave de caché incluye la profundidad.
- Lichess: petición directa desde el navegador, un solo pedido a la vez, con 429 esperar un minuto. Se piden hasta 30 partidas y se toman las 10 primeras válidas.
- `web/public/_headers`: solo abrir `connect-src` a `https://lichess.org`, `worker-src 'self'` y `'wasm-unsafe-eval'` en `script-src`.
- D1: solo `CREATE TABLE IF NOT EXISTS`, tablas `cp_*` (hay un test que lo exige). Ninguna clave de usuario en el repositorio.
- Sin XP, sin objetivo diario, sin niveles visibles. **Cero emojis** en toda la interfaz; los iconos son SVG (`web/src/components/Icon.tsx`).
- Español claro y sin jerga («evaluación», «centipeón») en los niveles `beginner` e `initiation`; texto en frase normal, sin mayúsculas gratuitas.
- Sin diagnóstico verificado no se inventa causa. Los elogios solo salen de datos.
- Licencia GPL-3.0-or-later; añadir el crédito de Stockfish en `web/src/credits.ts`.
- No hacer commits sin que el usuario lo pida. Cada tarea deja `npm test`, `npm run typecheck` y `npm run build` en verde.
- Calidad exigida: nada se solapa de 320 a 1280 px, todo estado (carga, error, vacío, cancelación) está resuelto, teclado y lectores de pantalla funcionan.

## Foco de revisión

1. Usuario inexistente, cuenta con 0 a 2 partidas elegibles o cuerpo vacío de Lichess: mensaje claro, nunca pantalla en blanco ni informe pobre. (Tareas 2, 9)
2. Partidas muy cortas (mate en pocas jugadas) y posiciones terminales: no revientan el análisis ni el informe. (Tareas 1, 2)
3. El alumno juega con negras, partidas con FEN inicial, variantes o abortadas: se filtran o se orientan bien. (Tarea 2)
4. Recargar o cerrar a mitad del análisis, o dos pestañas repasando a la vez: se continúa sin recalcular y los conceptos no se cuentan dos veces. (Tareas 7, 8)
5. El motor no carga (CSP, WASM bloqueado, error del Worker), Lichess responde 429 o no hay conexión: error explicado con salida de reintento. (Tareas 3, 8, 9)

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/analysis/engine-like.ts` (nuevo) | `EngineResult`, `EngineLike`. Sin imports de Node. |
| `src/analysis/uci.ts` (nuevo) | `UciSession`: protocolo UCI sobre un transporte (`send`, líneas entrantes). Compartido por Node y navegador. |
| `src/analysis/core.ts` (nuevo) | `analyzeWith(engine, pgn, opts)`, `classify`, `scoreToCp`. Sin Node. |
| `src/analysis/engine.ts`, `analyze.ts` | `Engine` de Node usa `UciSession`; `analyzeGame` envuelve `analyzeWith`. |
| `src/pedagogy/train.ts` (nuevo) | `trainFromMoves(moves, level)` puro. `src/pipeline.ts` lo usa. |
| `src/lichess/games.ts`, `fetch.ts` (nuevos) | URL, NDJSON, filtrado, PGN y descarga con errores tipados. |
| `src/review/types.ts`, `config.ts`, `select.ts`, `report.ts` (nuevos) | Tipos, constantes, errores clave e informe. |
| `src/pedagogy/review-copy.ts`, `error-lesson.ts` (nuevos) | Textos y construcción de la mini lección. |
| `migrations/0005_cp_review.sql`, `worker/review.ts` | Partidas repasadas y endpoint de conceptos. |
| `web/src/engine/browser-engine.ts`, `scripts/copy-engine.mjs` | Motor en el navegador y copia de los archivos WASM. |
| `web/src/review/{cache,runner,useReview,lessonFlow}.ts(x)` | Datos y lógica de la pantalla. |
| `web/src/screens/ReviewScreen.tsx`, `ReportScreen.tsx`, `web/src/components/ErrorLessonPlayer.tsx`, `web/src/review.css` | Interfaz. |
| `web/src/dev/mock-review.ts`, `scripts/make-review-fixture.ts` | Pruebas sin red. |

Zonas paralelizables tras la Tarea 1: A = {2, 3}, B = {4, 5, 6}, C = {7}. Las tareas 8 a 11 (web) van en orden. La 13 es siempre la última antes de cerrar.

---

### Tarea 1: Análisis con motor inyectable

**Archivos:**
- Crear: `src/analysis/engine-like.ts`, `src/analysis/core.ts`, `src/pedagogy/train.ts`, `test/analysis/core.test.ts`, `test/web/no-node-imports.test.ts`
- Modificar: `src/analysis/engine.ts`, `src/analysis/analyze.ts`, `src/analysis/index.ts`, `src/pipeline.ts`

**Interfaces:**
- Produce:
  - `interface EngineLike { init(): Promise<void>; analyze(fen: string, opts?: { depth?: number }): Promise<EngineResult>; close(): Promise<void> }` (y `EngineResult` movido aquí; `engine.ts` lo reexporta).
  - `analyzeWith(engine: EngineLike, pgn: string, opts?: { depth?: number; onProgress?: (done: number, total: number) => void; signal?: AbortSignal }): Promise<AnalyzedMove[]>`. El que llama es dueño de `init()` y `close()`. Con `signal` abortada lanza un `Error` con `name === 'AbortError'` entre posiciones.
  - `trainFromMoves(moves: AnalyzedMove[], level: Level): TrainingItem[]`.

- [ ] **Paso 1: tests que fallan** en `test/analysis/core.test.ts` con un `FakeEngine` que devuelve resultados guionizados por FEN: `analyzeWith` calcula `cpLoss` y `classification` igual que hoy (copiar un caso de `test/analysis/analysis.test.ts`); una partida de mate en 2 jugadas no llama al motor para la posición terminal; `signal.abort()` a mitad lanza `AbortError` y no hace más llamadas; `onProgress` informa `total = jugadas + 1`.
- [ ] **Paso 2: test de guarda** `test/web/no-node-imports.test.ts`: lee como texto `src/analysis/{core,pgn,engine-like,uci}.ts`, `src/diagnosis/**`, `src/pedagogy/**`, `src/review/**`, `src/lichess/**` y falla si encuentra `from 'node:` o `require(`. Debe pasar ya salvo por los archivos aún no creados (ignorar rutas inexistentes).
- [ ] **Paso 3: ejecutar** `npx vitest run test/analysis test/web/no-node-imports.test.ts`. Esperado: FAIL por módulo `core` inexistente.
- [ ] **Paso 4: implementar** moviendo la lógica de `analyzeGame` a `core.ts` (sin `Engine`); `analyze.ts` conserva `analyzeGame(pgn, opts)` que crea `Engine`, `init`, llama a `analyzeWith` y `close` en `finally`. `analysis/index.ts` sigue exportando todo lo de antes. Extraer de `trainFromPgn` el bucle a `trainFromMoves` y que `pipeline.ts` lo use.
- [ ] **Paso 5: ejecutar** `npm test`. Esperado: todo en verde, incluidos los tests de validación existentes (el CLI no cambia de resultados).

### Tarea 2: Partidas de Lichess

**Archivos:** Crear `src/lichess/games.ts`, `src/lichess/fetch.ts`, `src/review/types.ts`, `test/lichess/games.test.ts`, `test/fixtures/lichess-games.ndjson`.

**Interfaces:**
- Produce (`src/review/types.ts`): `LichessGame { id: string; speed: string; variant: string; status: string; createdAt: number; moves: string; initialFen?: string; winner?: 'white' | 'black'; players: { white: { id?: string; rating?: number }; black: { id?: string; rating?: number } }; opening?: { name: string } }`; `ReviewGame { id: string; color: Color; result: 'win' | 'loss' | 'draw'; speed: string; createdAt: number; opening?: string; pgn: string }`.
- Produce (`games.ts`): `isValidUsername(u: string): boolean` (`/^[A-Za-z0-9_-]{2,30}$/`); `gamesUrl(username: string, max?: number): string` (por defecto `max=30`, `perfType=blitz,rapid,classical,correspondence`, `moves=true`, `opening=true`, `clocks=true`); `parseNdjson(text: string): LichessGame[]` (ignora líneas vacías o inválidas); `toReviewGame(g: LichessGame, username: string): ReviewGame | null`; `pickGames(games: LichessGame[], username: string, n?: number): ReviewGame[]` (n = 10, conserva el orden de Lichess, más reciente primero).
- Produce (`fetch.ts`): `class LichessError extends Error { kind: 'not_found' | 'rate_limited' | 'network' | 'bad_response' }`; `fetchRecentGames(username: string, opts?: { signal?: AbortSignal; fetchImpl?: typeof fetch }): Promise<LichessGame[]>` con cabecera `Accept: application/x-ndjson`.

- [ ] **Paso 1: fixture.** Descargar con `fetch` de Node 20 las 12 partidas públicas más recientes de un usuario público de Lichess con la URL de `gamesUrl` y guardar el NDJSON; si no hay red, escribir a mano 5 partidas que cubran los casos de los tests. Comprobar que no contiene datos privados (solo campos públicos de la API).
- [ ] **Paso 2: tests que fallan** en `test/lichess/games.test.ts`: `toReviewGame` devuelve `null` para variante distinta de `standard`, `status` `aborted` o `noStart`, partidas de menos de 10 jugadas (medio-jugadas) y usuario que no juega; devuelve `color: 'black'` cuando el usuario es negras (comparación en minúsculas); `result` coherente con `winner`; el PGN generado se parsea con `parseGame` de `src/analysis/pgn.ts`, incluso con `initialFen` (cabecera `FEN` y `SetUp`); `pickGames` devuelve como máximo 10 en el orden recibido; `parseNdjson('')` devuelve `[]`; `isValidUsername('a b')` es falso; `fetchRecentGames` con un `fetchImpl` falso mapea 404 a `not_found`, 429 a `rate_limited`, rechazo de red a `network`, cuerpo no NDJSON a `bad_response`, y con `AbortSignal` abortada propaga el aborto.
- [ ] **Paso 3: ejecutar** `npx vitest run test/lichess`. Esperado: FAIL.
- [ ] **Paso 4: implementar** las firmas anteriores. El PGN lleva `[White]`, `[Black]`, `[Result]` y la cadena `moves` de Lichess (SAN separado por espacios) más el resultado final.
- [ ] **Paso 5: ejecutar** `npx vitest run test/lichess test/web/no-node-imports.test.ts`. Esperado: PASS.

### Tarea 3: Motor en el navegador, cabeceras y créditos

**Archivos:**
- Crear: `src/analysis/uci.ts`, `web/src/engine/browser-engine.ts`, `scripts/copy-engine.mjs`, `test/analysis/uci.test.ts`
- Modificar: `src/analysis/engine.ts`, `package.json` (scripts `build:web` y `dev:web` ejecutan primero `node scripts/copy-engine.mjs`), `.gitignore` (`web/public/engine/`), `web/public/_headers`, `web/src/credits.ts`

**Interfaces:**
- Produce: `class UciSession { constructor(transport: { send(cmd: string): void }); onLine(line: string): void; init(): Promise<void>; analyze(fen: string, opts?: { depth?: number }): Promise<EngineResult>; quit(): void }` con exactamente la secuencia UCI actual de `Engine` (`uci`, `Threads 1`, `Hash 32`, `isready`, y por posición `ucinewgame`, `isready`, `position fen`, `go depth`).
- Produce: `class BrowserEngine implements EngineLike` (constructor `new BrowserEngine(workerUrl = '/engine/stockfish-nnue-16-single.js')`), crea `new Worker(workerUrl)`, envía y recibe líneas UCI como cadenas.
- Produce: `REVIEW_DEPTH` queda definida en la Tarea 4; aquí se mide.

- [ ] **Paso 1: tests que fallan** `test/analysis/uci.test.ts` con un transporte falso: la secuencia de comandos enviada para `init` y para un `analyze(fen, { depth: 12 })` es exactamente la listada; una línea `score mate -3` con negras al turno se devuelve con signo de blancas; `bestmove (none)` da `bestUci: ''`; un segundo `analyze` concurrente rechaza con «El motor ya está analizando…»; sin respuesta en el plazo rechaza con el mensaje de tiempo agotado actual.
- [ ] **Paso 2: ejecutar** `npx vitest run test/analysis/uci.test.ts`. Esperado: FAIL.
- [ ] **Paso 3: implementar `UciSession`** moviendo a ella el análisis de líneas UCI de `Engine`; `Engine` (Node) queda como transporte (`spawn`, stdin/stdout) que delega en `UciSession`. `npm test` debe seguir verde (mismos resultados de `test/validation`).
- [ ] **Paso 4: implementar `BrowserEngine`** y `scripts/copy-engine.mjs`, que copia `node_modules/stockfish/src/stockfish-nnue-16-single.{js,wasm}` a `web/public/engine/`.
- [ ] **Paso 5: cabeceras y créditos.** En `_headers`: `script-src 'self' 'wasm-unsafe-eval'`, `connect-src 'self' https://lichess.org`, añadir `worker-src 'self'`; nada más. Añadir a `LIBRARIES` la entrada de Stockfish (GPL-3.0-or-later, equipo de Stockfish, port WASM de Nathan Rugg).
- [ ] **Paso 6: verificación manual y medición.** `npm run dev:web`, abrir en el navegador integrado, y desde la consola crear `BrowserEngine`, `init()` y analizar 10 posiciones de medio juego a profundidad 12. Comprobar que no hay errores de CSP en consola y anotar el tiempo medio por posición en `docs/superpowers/specs/2026-11-13-analisis-de-partidas-design.md` (sección Riesgos). Si las 10 partidas (unas 800 posiciones) no caben en 5 minutos o la primera partida pasa de 40 s, cambiar `REVIEW_DEPTH` a 10 y repetir; la decisión queda anotada.

### Tarea 4: Errores clave e informe (lógica pura)

**Archivos:** Crear `src/review/config.ts`, `src/review/select.ts`, `src/review/report.ts`, `test/review/select.test.ts`, `test/review/report.test.ts`. Modificar `src/review/types.ts`.

**Interfaces:**
- Produce: `REVIEW_DEPTH` (12 salvo decisión de la Tarea 3), `ENGINE_TAG = 'sf16'`, `analysisKey(gameId: string): string` = `${gameId}:d${REVIEW_DEPTH}:${ENGINE_TAG}`.
- Produce (`types.ts`): `GameAnalysis { gameId: string; color: Color; moves: AnalyzedMove[] }`; `KeyError { gameId: string; move: AnalyzedMove; diagnosis: Diagnosis }`; `Strength { kind: 'phase' | 'accuracy' | 'trend'; phase?: 'opening' | 'middlegame' | 'endgame'; value: number }`; `Report { games: { id: string; result: 'win' | 'loss' | 'draw' }[]; counts: { wins: number; draws: number; losses: number }; strengths: Strength[]; weaknesses: { conceptId: string; games: number; occurrences: number }[]; starError?: KeyError; ruleConceptId?: string }`.
- Produce: `keyErrors(a: GameAnalysis, max?: number): KeyError[]` (máx 3 por defecto; solo jugadas del `color` del alumno con `classification` `mistake` o `blunder` y `diagnose(move) !== null`; ordenadas por `cpLoss` descendente para elegir y devueltas por `ply` ascendente); `buildReport(analyses: GameAnalysis[], games: ReviewGame[]): Report`.

- [ ] **Paso 1: tests que fallan** en `select.test.ts` (constructor de `AnalyzedMove` sintéticos): jugadas del rival no cuentan; sin diagnóstico no cuentan; con 5 candidatos se devuelven los 3 de mayor `cpLoss` en orden de `ply`. En `report.test.ts`: `weaknesses` cuenta cada concepto una vez por partida (`games`) aunque se repita, y ordena por `games` y luego `occurrences`; `starError` es el error de mayor `cpLoss` del concepto más repetido y `ruleConceptId` ese concepto; **elogios solo con datos**: fase fuerte solo si tiene al menos 15 jugadas del alumno y su tasa de errores (mistake+blunder) es la mitad o menos que la global; `accuracy` solo si la proporción de jugadas `best`/`good` es al menos 0,75; `trend` solo con 8 o más partidas y si la tasa de errores de las 5 últimas baja un 20 % relativo respecto a las 5 primeras (por `createdAt`); sin datos suficientes `strengths` es `[]`; con menos de 3 partidas `buildReport` lanza un error identificable.
- [ ] **Paso 2: ejecutar** `npx vitest run test/review`. Esperado: FAIL.
- [ ] **Paso 3: implementar.** Fases por `ply`: apertura 1 a 20, medio juego 21 a 60, final 61 en adelante.
- [ ] **Paso 4: ejecutar** `npx vitest run test/review test/web/no-node-imports.test.ts`. Esperado: PASS.

### Tarea 5: Mini lección del error (contenido y construcción)

**Archivos:** Crear `src/pedagogy/review-copy.ts`, `src/pedagogy/error-lesson.ts`, `test/pedagogy/error-lesson.test.ts`.

**Interfaces:**
- Consume: `KeyError`, `Level`, `CONCEPTS` y `Diagnosis.evidence` (leer cada `src/diagnosis/rules/*.ts` para saber qué significan `squares` y `pieces` en cada tipo).
- Produce: `ErrorLesson { gameId: string; ply: number; conceptId: string; fenBefore: string; yourMoveSan: string; pause?: { question: string; correctSquares: string[] }; happened: { text: string; arrows: { from: string; to: string; tone: 'bad' | 'good' }[]; circles: string[] }; why: string; best: { uci: string; san: string; text: string }; rule: string }`.
- Produce: `buildErrorLesson(err: KeyError, level: Level): ErrorLesson`; `ruleFor(conceptId: string): string` (una frase por cada uno de los 6 conceptos `tactics.*`); `lossInPieces(cp: number): string` («un alfil o un caballo», «una torre», «la dama», «un peón»…).

- [ ] **Paso 1: tests que fallan:** para cada uno de los 6 conceptos existen `why`, `rule` y pregunta de pausa no vacíos; en `beginner` e `initiation` ningún texto generado casa `/evaluaci[oó]n|centipe[oó]n|peones? de/i` (usar `lossInPieces`); `pause` se omite si de la evidencia no sale una casilla comprobable y `correctSquares` está siempre dentro de `evidence.squares`; `best.san` es una jugada legal desde `fenBefore`; `happened.arrows` incluye la jugada mejor en tono `good`; `ruleFor('tactics.hanging_piece')` es exactamente «Antes de mover, mira si tu pieza queda protegida.».
- [ ] **Paso 2: ejecutar** `npx vitest run test/pedagogy/error-lesson.test.ts`. Esperado: FAIL.
- [ ] **Paso 3: implementar.** Redactar en español llano y cercano las 6 reglas, 6 preguntas y 6 líneas «por qué importa», una sola idea por frase, sin jerga. `happened.text` reutiliza el hecho verificado `diagnosis.fact`.
- [ ] **Paso 4: ejecutar** `npx vitest run test/pedagogy test/web/no-node-imports.test.ts`. Esperado: PASS.

### Tarea 6: Enlace concepto a lección

**Archivos:** Modificar `src/content/index.ts`, `src/content/units/u04.ts` a `u05.ts` (campo `conceptIds` de las lecciones). Test: `test/content/concept-links.test.ts`.

**Interfaces:** Produce `lessonsForConcept(conceptId: string): { id: string; title: string }[]`.

- [ ] **Paso 1: test que falla:** cada uno de los 6 `tactics.*` devuelve al menos una lección.
- [ ] **Paso 2: implementar.** Mapeo previsto: `u05.l01` a `tactics.hanging_piece` y `tactics.bad_exchange`; `u05.l02` a `tactics.fork`; `u05.l03` a `tactics.pin`; `u05.l04` a `tactics.discovered_attack`; la lección de mates de `u04` a `tactics.mate_threat`. Comprobar los ids reales en los archivos.
- [ ] **Paso 3: ejecutar** `npx vitest run test/content`. Esperado: PASS.

### Tarea 7: Servidor: partidas repasadas y conceptos

**Archivos:** Crear `migrations/0005_cp_review.sql`, `worker/review.ts`. Modificar `src/shared/api.ts`, `worker/app.ts`, `test/worker/api.test.ts`.

**Interfaces:**
- Produce: `CompleteReviewBody { gameId: string; concepts: string[] }`, `CompleteReviewResponse { counted: boolean }`; `POST /api/review/complete` con sesión.
- Esquema: `cp_reviewed_games (user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE, game_id TEXT NOT NULL, reviewed_at TEXT NOT NULL, PRIMARY KEY (user_id, game_id))`, solo `CREATE TABLE IF NOT EXISTS`.

- [ ] **Paso 1: tests que fallan** (estilo `test/worker/api.test.ts` con `sqlite-db.ts`): 401 sin sesión; 400 si `gameId` no casa `/^[A-Za-z0-9]{8}$/`, si algún concepto no existe en `CONCEPTS` o si hay más de 6; un primer POST devuelve `counted: true` y suma 1 a cada concepto en `cp_weak_concepts`; repetir el mismo POST devuelve `counted: false` y no cambia los contadores; dos POST concurrentes de la misma partida suman una sola vez; conceptos duplicados en el cuerpo cuentan una vez; el test existente de migraciones (solo `IF NOT EXISTS`) sigue pasando.
- [ ] **Paso 2: ejecutar** `npx vitest run test/worker`. Esperado: FAIL.
- [ ] **Paso 3: implementar.** Un único `db.batch`: primero los `INSERT ... SELECT ... WHERE NOT EXISTS (SELECT 1 FROM cp_reviewed_games WHERE user_id = ? AND game_id = ?) ON CONFLICT ... DO UPDATE SET count = count + 1` de cada concepto, y después `INSERT OR IGNORE INTO cp_reviewed_games`. `counted` se decide leyendo antes si ya existía la fila y confirmando con el resultado del lote. Leer `worker/db.ts` para ver qué devuelve `batch`.
- [ ] **Paso 4: ejecutar** `npm test`. Esperado: PASS. Aplicar la migración en local con `npm run db:migrate:local`.

### Tarea 8: Datos y ejecución en el cliente

**Archivos:** Crear `web/src/review/cache.ts`, `web/src/review/runner.ts`, `web/src/review/useReview.ts`, `test/web/review-runner.test.ts`. Modificar `web/src/api.ts` (método `api.completeReview(body: CompleteReviewBody): Promise<CompleteReviewResponse>`).

**Interfaces:**
- Produce: `interface AnalysisStore { get(key: string): Promise<GameAnalysis | undefined>; put(key: string, v: GameAnalysis): Promise<void> }`; `memoryStore(): AnalysisStore`; `indexedDbStore(): AnalysisStore` (si IndexedDB falla o no existe, degrada a `memoryStore`).
- Produce: `type ReviewEvent = { type: 'games'; games: ReviewGame[] } | { type: 'progress'; gameIndex: number; done: number; total: number } | { type: 'game-ready'; gameIndex: number; analysis: GameAnalysis } | { type: 'error'; error: LichessError | Error } | { type: 'done' }`; `createReviewRunner(deps: { engine: EngineLike; store: AnalysisStore; fetchGames: () => Promise<ReviewGame[]>; depth: number }): { start(onEvent: (e: ReviewEvent) => void): Promise<void>; cancel(): void }`.
- Produce: `useReview(): { status: 'idle' | 'loading-games' | 'analyzing' | 'done' | 'error'; games: ReviewGame[]; ready: GameAnalysis[]; progress?: { gameIndex: number; done: number; total: number }; error?: Error; start(): void; cancel(): void }`.

- [ ] **Paso 1: tests que fallan** con `FakeEngine` y `memoryStore`: las partidas se analizan en orden y `game-ready` llega partida a partida; con la caché llena una segunda ejecución hace cero llamadas al motor; `cancel()` detiene el análisis sin emitir `done`; un error del motor emite `error` y conserva lo ya guardado; menos de 3 partidas válidas emite `error` identificable; dos ejecuciones simultáneas del mismo runner no solapan análisis.
- [ ] **Paso 2: ejecutar** `npx vitest run test/web/review-runner.test.ts`. Esperado: FAIL.
- [ ] **Paso 3: implementar** `runner.ts` con `analyzeWith(engine, game.pgn, { depth, signal, onProgress })`, `store.get`/`put` por `analysisKey(game.id)`, y `useReview` con el motor real (`BrowserEngine`) y `fetchRecentGames(user.username)` + `pickGames`. `engine.close()` al terminar o cancelar.
- [ ] **Paso 4: ejecutar** `npm test` y `npm run typecheck`. Esperado: PASS.

### Tarea 9: Pantalla `/partidas` (estados)

**Archivos:** Crear `web/src/screens/ReviewScreen.tsx`, `web/src/review.css`. Modificar `web/src/router.ts` (`PRIVATE_PREFIXES`), `web/src/App.tsx` (ruta y enlace de navegación), `test/web/router.test.ts`.

- [ ] **Paso 1: test que falla:** `isPrivatePath('/partidas')` y `isPrivatePath('/partidas/informe')` son verdaderos.
- [ ] **Paso 2: implementar** `ReviewScreen` con estos estados, cada uno con texto claro y salida: inicio (qué hará y botón «Analizar mis partidas»), buscando partidas, analizando (lista de las 10 con estado por fila y botón «Repasar la partida 1» en cuanto esté lista, más «Cancelar»), usuario no encontrado, límite de Lichess con cuenta atrás de un minuto y reintento, sin conexión, motor no disponible con «Reintentar», y menos de 3 partidas con cuántas faltan. Sin emojis; iconos de `Icon.tsx`; clases `t-*` del sistema táctil; `aria-live="polite"` para el progreso; botones de al menos 44 px.
- [ ] **Paso 3: verificar** con `npm run dev:web` en el navegador integrado (modo `?mock=1` tras la Tarea 12 o, antes, forzando cada estado): sin errores en consola.

### Tarea 10: Reproductor de la mini lección

**Archivos:** Crear `web/src/review/lessonFlow.ts`, `web/src/components/ErrorLessonPlayer.tsx`, `test/web/lesson-flow.test.ts`. Modificar `web/src/components/Board.tsx` (prop opcional `onSelectSquare?: (sq: string) => void` con el evento `select` de chessground).

**Interfaces:**
- Produce: reductor puro `lessonReducer(state: LessonState, action: LessonAction): LessonState` con pasos `look → pause → happened → why → best → done`, acciones `next`, `tap(square)` y `skip`; `LessonState.pauseResult: 'correct' | 'wrong' | 'skipped' | null`. Sin `pause` en la lección, el paso `pause` se salta. Un solo intento: un toque equivocado pasa a `wrong` y revela la respuesta; `skip` (botón «No lo sé, enséñamelo») pasa a `skipped`.
- Produce: `<ErrorLessonPlayer lesson={ErrorLesson} onFinish={() => void} />`.

- [ ] **Paso 1: tests que fallan** del reductor: orden de pasos; sin `pause` se salta; `tap` correcto marca `correct`; `tap` incorrecto marca `wrong` y avanza al paso `happened`; `skip` marca `skipped`; `tap` fuera del paso `pause` se ignora; `next` en `done` no cambia nada.
- [ ] **Paso 2: ejecutar** `npx vitest run test/web/lesson-flow.test.ts`. Esperado: FAIL.
- [ ] **Paso 3: implementar** el reductor, la prop del tablero y el componente: tablero antes de la jugada, pausa con pregunta y botón «No lo sé, enséñamelo», frase de lo ocurrido con flechas y círculos (`Board.shapes`), «por qué importa», jugada mejor animada sobre el tablero y la regla. El tono tras fallar la pausa es amable, sin tachar. Teclado: la pausa se puede resolver con el tablero o con el botón; foco visible; textos con `aria-live`.
- [ ] **Paso 4: ejecutar** `npm test` y `npm run typecheck`; revisar en el navegador a 320, 768 y 1280 px.

### Tarea 11: Informe final

**Archivos:** Crear `web/src/screens/ReportScreen.tsx`. Modificar `web/src/App.tsx` (ruta `/partidas/informe`), `web/src/review.css`, `web/src/screens/ReviewScreen.tsx` (enlace al informe y llamada a `api.completeReview` al terminar cada partida).

- [ ] **Paso 1: implementar** `ReportScreen` según la maqueta aprobada y este orden: resumen con titular y tira de las 10 partidas; «Lo que ya haces bien» (si `strengths` está vacío, una frase neutra honesta); «Lo que más te cuesta»; «Tu error más repetido» sobre un tablero con la casilla y la flecha marcadas; la regla de `ruleFor(ruleConceptId)` en un bloque destacado; «Para practicarla» con la lección de `lessonsForConcept` y hasta 5 posiciones propias (reutilizando `ErrorLessonPlayer` solo con pausa; si resulta caro, queda en la lección y la regla). Si no hay datos (recarga directa), redirigir a `/partidas`.
- [ ] **Paso 1b: nivel del texto.** `buildErrorLesson` recibe el nivel interno del alumno (el `level` que ya devuelve `/api/me`, calculado con `levelForXp`); si no está disponible, `initiation`. No se muestra nunca como «nivel» en la interfaz.
- [ ] **Paso 2: conectar el servidor.** Al terminar el repaso de una partida (el alumno recorre sus errores clave, saltando pausas incluido) llamar a `api.completeReview({ gameId, concepts })` con los conceptos únicos de sus errores clave; si falla la red, reintentar en silencio la próxima vez, sin bloquear el informe.
- [ ] **Paso 3: verificar** en el navegador integrado a 320, 375, 768, 1024 y 1280 px: nada se corta ni se solapa, el tablero se redimensiona, la tira de 10 no desborda.

### Tarea 12: Pruebas sin red y modo de desarrollo

**Archivos:** Crear `scripts/make-review-fixture.ts`, `web/src/dev/review-fixture.json`, `web/src/dev/mock-review.ts`. Modificar `web/src/dev/mock.ts` y `web/src/review/useReview.ts`.

- [ ] **Paso 1:** `scripts/make-review-fixture.ts` lee `test/fixtures/lichess-games.ndjson`, analiza las partidas con el `Engine` de Node a `REVIEW_DEPTH` y escribe los `GameAnalysis` reales en `review-fixture.json`. Ejecutar con `npx tsx scripts/make-review-fixture.ts`.
- [ ] **Paso 2:** con `?mock=1`, `useReview` usa `mock-review.ts` (reproduce el fixture con pequeños retardos y permite forzar errores con `?mockerror=not_found|rate_limited|network|engine`) y `api.completeReview` responde sin servidor. Sin `?mock` no se carga nada del mock.
- [ ] **Paso 3: verificar** en el navegador: flujo completo `/partidas` → repaso → `/partidas/informe` en modo mock y cada estado de error.

### Tarea 13: Revisión de calidad con agente independiente (arregla lo que encuentre)

**Archivos:** Crear `test/web/no-emoji.test.ts`. Modificar lo que la revisión detecte.

- [ ] **Paso 1: test de emojis:** recorre `web/src/**`, `src/pedagogy/**` y `src/review/**` y falla si hay `\p{Extended_Pictographic}` (permitiendo los símbolos de pieza de ajedrez U+2654 a U+265F si algún texto los usa). Ejecutarlo y arreglar lo que aparezca.
- [ ] **Paso 2: lanzar un agente de revisión distinto del que implementó**, con este encargo: abrir `/partidas` y `/partidas/informe` en el navegador integrado en modo `?mock=1`; a 320, 375, 768, 1024 y 1280 px comprobar que no hay desbordamiento horizontal (`document.documentElement.scrollWidth <= innerWidth`) ni cajas que se solapan entre elementos hermanos (script con `getBoundingClientRect` desde `javascript_tool`), y hacer capturas; pulsar todos los botones y recorrer todos los estados de error, la pausa correcta, incorrecta y saltada, cancelar, recargar a mitad y navegación por teclado; buscar emojis y jerga en los textos; revisar consola y red. El agente **corrige** cada fallo y repite hasta limpiar, y devuelve la lista de lo arreglado y lo que no pudo.
- [ ] **Paso 3: verificar** `npm test`, `npm run typecheck` y `npm run build`. Esperado: todo en verde.

### Tarea 14: Cierre

**Archivos:** Modificar `docs/estado-proyecto.md`.

- [ ] **Paso 1:** actualizar el estado: Fase 3 empezada con el análisis de las últimas 10 partidas; mover «Fase 3, empezando por analizar las partidas» de pendiente a hecho; añadir lo que quede por pulir (profundidad elegida y tiempos medidos, contenido sin validar por profesores).
- [ ] **Paso 2:** comprobar que `git status` solo muestra los cambios previstos y avisar al usuario de que no se ha hecho ningún commit.
- [ ] **Paso 3:** ofrecer al usuario hacer commit (separando el trabajo de `web/src/dev/mock.ts` anterior de esta funcionalidad).
