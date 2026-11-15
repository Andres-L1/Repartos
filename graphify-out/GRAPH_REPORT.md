# Graph Report - LUDEX  (2026-11-15)

## Corpus Check
- 243 files · ~249,452 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .pgn 12, .css 12, (none) 3)

## Summary
- 1680 nodes · 4587 edges · 85 communities (77 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 182 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `471607b0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Tests de contenido y temario
- Motor y analisis de partidas
- games.test.ts
- Tienda y moneda Chedex
- Ejecucion del analisis en el cliente
- package.json
- review-copy.ts
- Reglas de diagnostico
- ref_node_fs
- Landing
- Mini leccion del error
- Servidor Hono y progreso
- ref_node_fs
- SessionScreen.tsx
- ReviewScreen.tsx
- Acceso con Lichess
- shared/api.ts
- session.tsx
- session.ts
- ReportScreen.tsx
- d1-races.test.ts
- App.tsx
- shared/api.ts
- worker/shop.ts
- Tests de la mini leccion
- session.ts
- Colocacion por Elo (antigua)
- puzzles.test.ts
- D1StatementLike
- createContext
- Level
- SessionScreen.tsx
- worker/shop.test.ts
- Configuracion TypeScript
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan del analisis de partidas
- worker/index.ts
- GameViewer.tsx
- sound.ts
- ShopScreen.tsx
- Phase 1 validation report (11 sample games)
- mirror.ts
- api.test.ts
- Diseno de la tienda
- src/shop.ts
- Decision: license whole repo GPL-3.0-or-later
- Plan de nivel y puntos debiles
- vitest
- lib.test.ts
- Reglas de graphify
- Fuente DM Sans
- Licencias hono y react
- env.d.ts
- LessonPlayer.tsx
- exercises.ts
- completeReview
- chessops
- mirror.ts
- ReviewScreen.tsx
- unitsF.test.ts
- Repasos espaciados y sesión diaria — plan de implementación
- ShopVisuals.tsx
- worker/index.ts
- Hallazgos
- Repasos espaciados y sesión diaria — diseño
- FakeWorker
- gen-strategy.mts
- unitsB.test.ts
- d1-races.test.ts
- schema.ts
- Auditor de contenido
- context.ts
- Auditoría automática de contenido · 2026-11-15
- src/types.ts
- chess-utils.ts
- theme.test.ts
- Stockfish
- newSession
- AnalyzedMove
- Auditoría plena 02: diseño visual, UI y accesibilidad
- Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)
- LessonPlayer
- POST /api/review/complete and cp_reviewed_games

## God Nodes (most connected - your core abstractions)
1. `vitest` - 56 edges
2. `Icon()` - 52 edges
3. `Level` - 40 edges
4. `navigate()` - 36 edges
5. `useSession()` - 33 edges
6. `Unit` - 32 edges
7. `Link()` - 31 edges
8. `react` - 31 edges
9. `chessops` - 31 edges
10. `App()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Punto de partida (comprobado en el código)` --references--> `levelPlan()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → worker/level.ts
- `Tercera tanda (2026-11-15): Competitivo, u12` --references--> `levelPlan()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → worker/level.ts
- `u15 «Finales de torre: nivel Avanzado» (`advanced`, `order` 14, `requires: ['u14']`; u12 pasa a `order` 15)` --references--> `isExpectedMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/shared/moves.ts
- `u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`)` --references--> `themeForConcept()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/review/srs.ts
- `Importante` --references--> `sanOfUci()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → web/src/chess.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (85 total, 8 thin omitted)

### Community 0 - "Tests de contenido y temario"
Cohesion: 0.10
Nodes (23): LESSONS, lessonsForConcept(), UNITS, Unit, unit, unit, unit, unit (+15 more)

### Community 1 - "Motor y analisis de partidas"
Cohesion: 0.22
Nodes (16): Aclaraciones tras la revisión del constructor, Mis llamadas, analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify() (+8 more)

### Community 2 - "games.test.ts"
Cohesion: 0.20
Nodes (14): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+6 more)

### Community 3 - "Tienda y moneda Chedex"
Cohesion: 0.22
Nodes (23): hono, createApp(), AppContext, loadProfile(), profileFor(), Env, HttpError, isInt() (+15 more)

### Community 4 - "Ejecucion del analisis en el cliente"
Cohesion: 0.09
Nodes (25): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, GameAnalysis, ReviewGame, games(), mk() (+17 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (45): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+37 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.08
Nodes (38): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Menor, buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine() (+30 more)

### Community 7 - "Reglas de diagnostico"
Cohesion: 0.38
Nodes (14): Restricciones globales, Restricciones, capitalize(), describe(), lossOver(), sq(), VALUE, withArticle() (+6 more)

### Community 8 - "ref_node_fs"
Cohesion: 0.19
Nodes (21): CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor(), rankUci(), steps() (+13 more)

### Community 9 - "Landing"
Cohesion: 0.12
Nodes (29): Closing(), DemoScreen(), HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing(), LessonWindow() (+21 more)

### Community 10 - "Mini leccion del error"
Cohesion: 0.19
Nodes (22): findPins(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), discoveryBlockers() (+14 more)

### Community 11 - "Servidor Hono y progreso"
Cohesion: 0.11
Nodes (25): alreadyPlayed(), BLAME, checkSanMentions(), Claims, ES, expand(), FindingType, isForcing() (+17 more)

### Community 12 - "ref_node_fs"
Cohesion: 0.15
Nodes (8): out, pkg, root, src, text, collect(), root, targets

### Community 13 - "SessionScreen.tsx"
Cohesion: 0.12
Nodes (33): ruleFor(), topWeakConcepts(), LessonStatus, MapLesson, ApiError, ErrorBox(), Icon(), Loading() (+25 more)

### Community 14 - "ReviewScreen.tsx"
Cohesion: 0.08
Nodes (25): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+17 more)

### Community 15 - "Acceso con Lichess"
Cohesion: 0.24
Nodes (20): aesKey(), base64url(), clearedCookies(), cookieHeader(), cookieNames(), encoder, fromBase64url(), handleCallback() (+12 more)

### Community 16 - "shared/api.ts"
Cohesion: 0.06
Nodes (52): Task 5: Pantalla «Entrenar hoy», ReviewPosition, AnswerBody, AnswerResult, CompleteLessonBody, CompleteLessonShopExtras, CompleteReviewBody, CompleteReviewResponse (+44 more)

### Community 17 - "session.tsx"
Cohesion: 0.11
Nodes (25): api, setApiHandlers(), catalogCredits(), creditRows(), reportReviewed, setReviewUser, navigate(), replaceSearch() (+17 more)

### Community 18 - "session.ts"
Cohesion: 0.18
Nodes (17): SessionItem, altFor(), answerItem(), BANK, dueConcepts(), evaluate(), isExpected(), ItemRow (+9 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.12
Nodes (29): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), keyErrors() (+21 more)

### Community 20 - "d1-races.test.ts"
Cohesion: 0.07
Nodes (42): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Quinta tanda (2026-11-15): u15 torre Avanzado y u16 estrategia verificable, Regla para que una lección entre en repasos y sesión (+34 more)

### Community 21 - "App.tsx"
Cohesion: 0.09
Nodes (33): react, react-dom, App(), BillingScreen, CreditsScreen, LessonScreen, LevelScreen, MapScreen (+25 more)

### Community 22 - "shared/api.ts"
Cohesion: 0.17
Nodes (15): FASE4, args, checkStep(), DEPTH, fmt(), legalCount(), load(), makeFenOf() (+7 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.18
Nodes (20): ADMIN_IDS, isAdmin(), getItem(), dayOf(), yesterdayOf(), advanceStreak(), balanceOf(), buildShop() (+12 more)

### Community 24 - "Tests de la mini leccion"
Cohesion: 0.13
Nodes (16): chessops, buildCtx(), loadPosition(), diagnose(), mk(), ALL, C, Case (+8 more)

### Community 25 - "session.ts"
Cohesion: 0.13
Nodes (23): buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1, L2 (+15 more)

### Community 26 - "Colocacion por Elo (antigua)"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzles.test.ts"
Cohesion: 0.13
Nodes (13): POOL_COMBOS, puzzleStart(), { puzzles }, TestDb, fillAllBut(), { puzzles }, seed(), TestDb (+5 more)

### Community 29 - "createContext"
Cohesion: 0.35
Nodes (11): suggestLevel(), createContext(), chosenLevel(), levelEffect(), progressMap(), subscriptionFor(), levelPlan(), parseSeen() (+3 more)

### Community 30 - "Level"
Cohesion: 0.11
Nodes (17): args, depth, file, level, LEVELS, trainFromMoves(), PipelineOptions, trainFromPgn() (+9 more)

### Community 31 - "SessionScreen.tsx"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "worker/shop.test.ts"
Cohesion: 0.13
Nodes (19): CATALOG, CatalogItem, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX, ShopKind, STREAK_DAYS_PER_CHEDEX (+11 more)

### Community 33 - "Configuracion TypeScript"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 34 - "Phase 2 architecture (web, Hono Worker, D1)"
Cohesion: 0.16
Nodes (15): Separate educational content from GPL, Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, Chedex Pulse chess training platform (+7 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.17
Nodes (14): MIGRATIONS_DIR, Db, SqlValue, Stmt, MAX_REVIEW_CONCEPTS, parseCompleteReview(), CONCEPT_IDS, legalMove() (+6 more)

### Community 36 - "Plan del analisis de partidas"
Cohesion: 0.19
Nodes (14): Known issues to polish, EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent, Review runner, cache and useReview (+6 more)

### Community 37 - "worker/index.ts"
Cohesion: 0.11
Nodes (17): getLesson(), CONCEPTS, Concept, allMoves(), gain(), IDS, lessons, load() (+9 more)

### Community 38 - "GameViewer.tsx"
Cohesion: 0.20
Nodes (17): describeMove(), moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, Props, clamp() (+9 more)

### Community 39 - "sound.ts"
Cohesion: 0.05
Nodes (80): chessground, ErrorLesson, canonical(), isExpectedMove(), mates(), run(), throwing, applyUci() (+72 more)

### Community 40 - "ShopScreen.tsx"
Cohesion: 0.15
Nodes (21): Shop, ShopItem, BoardItem(), BuyAction(), CollectionPanel(), PanelProps, PiecesItem(), ProtectorItem() (+13 more)

### Community 41 - "Phase 1 validation report (11 sample games)"
Cohesion: 0.22
Nodes (9): Estado del proyecto (handoff document), Pending work list (ordered), Phase 1: pedagogical prototype (CLI), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games) (+1 more)

### Community 42 - "mirror.ts"
Cohesion: 0.23
Nodes (13): Estado tras la corrección (2026-11-14, mismo día), Lo que NO pude verificar, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14, COLOR, flipRank(), mirrorExercise() (+5 more)

### Community 43 - "api.test.ts"
Cohesion: 0.13
Nodes (15): clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup(), units (+7 more)

### Community 44 - "Diseno de la tienda"
Cohesion: 0.29
Nodes (6): Chedex currency (1 per 5 streak days), User decisions changing the founding document, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), cburnett pieces (GPLv2+)

### Community 45 - "src/shop.ts"
Cohesion: 0.19
Nodes (17): balanceAfter(), BOARD_IDS, BuyState, chedexText(), confirmText(), daysUntilChedex(), DEFAULT_EQUIPPED, KIND_LABEL (+9 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.40
Nodes (5): Decision: license whole repo GPL-3.0-or-later, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later), Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 47 - "Plan de nivel y puntos debiles"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "vitest"
Cohesion: 0.22
Nodes (8): vitest, EXERCISES, LEVEL_ORDER, priority(), recommend(), ALL, idx(), LEVELS

### Community 49 - "lib.test.ts"
Cohesion: 0.18
Nodes (17): add(), auditPractice(), runEngine(), sanOf(), AuditEngine, checkMateClaim(), checkMaterialClaim(), compareSolution() (+9 more)

### Community 55 - "LessonPlayer.tsx"
Cohesion: 0.29
Nodes (8): ENDGAME_UNITS, linePositions(), load(), probe, ROLE, sansNear(), textErrors(), units

### Community 56 - "exercises.ts"
Cohesion: 0.08
Nodes (9): Analyze, Archivos, EngineLike, EngineResult, UciSession, FakeEngine, fake(), FakeEngine (+1 more)

### Community 57 - "completeReview"
Cohesion: 0.23
Nodes (12): Foco de revisión, Repasos espaciados y sesión diaria — plan de implementación, Task 1: Calendario y puzles (módulo puro), Task 2: Datos del servidor y errores propios, Task 4: API de la sesión, Task 6: Cierre, dueAfter(), nextBox() (+4 more)

### Community 58 - "chessops"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "mirror.ts"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "ReviewScreen.tsx"
Cohesion: 0.26
Nodes (10): IconName, useReview(), Failure, failureOf(), GameRow(), Panel(), RateLimited(), RESULT_LABEL (+2 more)

### Community 61 - "unitsF.test.ts"
Cohesion: 0.33
Nodes (7): checkFact(), EXPLAIN_MOVE, Fact, factFor(), load(), load(), who()

### Community 62 - "Repasos espaciados y sesión diaria — plan de implementación"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "ShopVisuals.tsx"
Cohesion: 0.27
Nodes (9): MiniBoard(), PieceCode, ProtectorArt(), ROLE, SAMPLE_BOARD, SAMPLE_PIECES, appearanceClass(), boardClass() (+1 more)

### Community 64 - "worker/index.ts"
Cohesion: 0.38
Nodes (7): parseBillingMode(), d1Db(), D1Like, appFor(), Env, fetch(), scheduled()

### Community 65 - "Hallazgos"
Cohesion: 0.22
Nodes (8): Auditoría plena 01: código y estructura (2026-11-15), Cambios en archivos de pantalla (excepciones declaradas), Hallazgos, Lo que NO pude verificar, Métricas, Resumen, Revisado y correcto (sin hallazgo), Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor

### Community 66 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.25
Nodes (7): Antiobjetivos, Enfoques considerados, Intención, No objetivos, Objetivos, Para el constructor, Repasos espaciados y sesión diaria — diseño

### Community 68 - "gen-strategy.mts"
Cohesion: 0.36
Nodes (7): build(), kind, N, pick(), rnd(), seed, sf

### Community 69 - "unitsB.test.ts"
Cohesion: 0.36
Nodes (4): unit, unit, unit, UNITS_B

### Community 70 - "d1-races.test.ts"
Cohesion: 0.14
Nodes (10): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+2 more)

### Community 71 - "schema.ts"
Cohesion: 0.19
Nodes (13): Formato y verificación (igual que u01-u06), BoardMark, ExplainStep, Lesson, PracticeStep, GOOD, HINT, Kind (+5 more)

### Community 72 - "Auditor de contenido"
Cohesion: 0.33
Nodes (5): Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba

### Community 73 - "context.ts"
Cohesion: 0.15
Nodes (14): BillingMode, SubscriptionStatus, LEVELS, AuthConfig, BillingProvider, PERIOD_DAYS, SubscriptionRecord, AppDeps (+6 more)

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 76 - "src/types.ts"
Cohesion: 0.12
Nodes (15): enginePath(), PvLine, enginePath(), require_, HASH_MB, UciTransport, ErrorType, MoveClass (+7 more)

### Community 79 - "chess-utils.ts"
Cohesion: 0.14
Nodes (25): balance(), canCaptureOn(), colorName(), Ctx, DIAG, FEMININE, materialOf(), NAME (+17 more)

### Community 80 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 83 - "newSession"
Cohesion: 0.20
Nodes (14): Task 3: Depósito de puzles, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL, difficultyForLevel(), MAX_PUZZLE_RATING, maxRatingForLevel(), PuzzleDifficulty (+6 more)

### Community 84 - "AnalyzedMove"
Cohesion: 0.35
Nodes (8): AnalyzedMove, game(), mv(), rg(), err(), filler(), games3, noDiag

### Community 87 - "Auditoría plena 02: diseño visual, UI y accesibilidad"
Cohesion: 0.22
Nodes (8): Arreglos posteriores (2026-11-15): tablero bajo la cabecera y nombre de usuario, Auditoría plena 02: diseño visual, UI y accesibilidad, Cómo se midió y qué quedó fuera del repositorio, Datos de contraste y tamaño (muestras medidas), Hallazgos, Lo que no se arregló y por qué, No verificado, Resumen

### Community 88 - "Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)"
Cohesion: 0.22
Nodes (8): Arreglo de X1 (2026-11-15): la portada ya no espera a `/api/me`, Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15), Hallazgos, Método, Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión), No verificado, Resumen, Verificación

### Community 91 - "LessonPlayer"
Cohesion: 0.20
Nodes (11): LessonPlayer(), finish(), toEval(), toExplain(), toPractice(), Phase, ResultView(), STAGES (+3 more)

### Community 93 - "POST /api/review/complete and cp_reviewed_games"
Cohesion: 0.40
Nodes (5): Phase 3: personalization (game analysis, weak points), D1 cp_* tables, CREATE IF NOT EXISTS only, Wallet ledger (cp_wallet_ledger), server-side prices, POST /api/review/complete and cp_reviewed_games, topWeakConcepts and Profile weak points section

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 523 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Tests de contenido y temario`, `Motor y analisis de partidas`, `games.test.ts`, `Ejecucion del analisis en el cliente`, `package.json`, `review-copy.ts`, `ref_node_fs`, `ref_node_fs`, `SessionScreen.tsx`, `shared/api.ts`, `ReportScreen.tsx`, `App.tsx`, `worker/shop.ts`, `Tests de la mini leccion`, `Colocacion por Elo (antigua)`, `puzzles.test.ts`, `Level`, `worker/shop.test.ts`, `worker/index.ts`, `GameViewer.tsx`, `sound.ts`, `mirror.ts`, `api.test.ts`, `src/shop.ts`, `lib.test.ts`, `LessonPlayer.tsx`, `exercises.ts`, `unitsF.test.ts`, `unitsB.test.ts`, `d1-races.test.ts`, `src/types.ts`, `theme.test.ts`, `newSession`, `AnalyzedMove`, `LessonPlayer`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tests de contenido y temario` be split into smaller, more focused modules?**
  _Cohesion score 0.09619450317124736 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `Tests de la mini leccion` to `Motor y analisis de partidas`, `package.json`, `review-copy.ts`, `Reglas de diagnostico`, `ref_node_fs`, `Mini leccion del error`, `Servidor Hono y progreso`, `ReviewScreen.tsx`, `d1-races.test.ts`, `shared/api.ts`, `Level`, `worker/srs.ts`, `worker/index.ts`, `sound.ts`, `mirror.ts`, `vitest`, `LessonPlayer.tsx`, `unitsF.test.ts`, `gen-strategy.mts`, `chess-utils.ts`, `newSession`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Ejecucion del analisis en el cliente` be split into smaller, more focused modules?**
  _Cohesion score 0.08637873754152824 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `Tests de contenido y temario`, `Hallazgos`, `worker/index.ts`, `review-copy.ts`, `schema.ts`, `Landing`, `Mini leccion del error`, `context.ts`, `src/types.ts`, `SessionScreen.tsx`, `vitest`, `session.tsx`, `session.ts`, `newSession`, `ReportScreen.tsx`, `Tests de la mini leccion`, `session.ts`, `Level`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05217391304347826 - nodes in this community are weakly interconnected._