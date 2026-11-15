# Graph Report - LUDEX  (2026-11-15)

## Corpus Check
- 236 files · ~230,262 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .pgn 12, .css 12, (none) 3)

## Summary
- 1635 nodes · 4488 edges · 95 communities (84 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 179 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a58b545`
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
- Icon
- ReviewScreen.tsx
- Acceso con Lichess
- Repaso de partida y visor
- src/api.ts
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
- report.test.ts
- Level
- SessionScreen.tsx
- shared/api.ts
- Configuracion TypeScript
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan del analisis de partidas
- worker/index.ts
- api.test.ts
- PracticeBoard.tsx
- src/shop.ts
- Phase 1 validation report (11 sample games)
- mirror.ts
- completion.ts
- Diseno de la tienda
- ShopScreen.tsx
- Decision: license whole repo GPL-3.0-or-later
- Plan de nivel y puntos debiles
- EngineLike
- LessonPlayer
- Reglas de graphify
- Fuente DM Sans
- Licencias hono y react
- env.d.ts
- LessonPlayer.tsx
- exercises.ts
- catalog.ts
- chessops
- mirror.ts
- lessonFlow.ts
- worker/shop.test.ts
- Repasos espaciados y sesión diaria — plan de implementación
- sound.ts
- navigate
- GameAnalysis
- Repasos espaciados y sesión diaria — diseño
- FakeWorker
- EngineResult
- ErrorLessonPlayer.tsx
- d1-races.test.ts
- Lesson
- Auditor de contenido
- context.ts
- Auditoría automática de contenido · 2026-11-15
- explain.ts
- audit/engine.ts
- worker/index.ts
- Hallazgos
- chess-utils.ts
- theme.test.ts
- Stockfish
- mate_threat.ts
- Restricciones globales
- vitest
- validation.test.ts
- Revisión pedagógica y de ajedrez · 2026-11-14
- Auditoría plena 02: diseño visual, UI y accesibilidad
- Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)
- src/types.ts
- ErrorLessonPlayer
- LessonPlayer
- react
- POST /api/review/complete and cp_reviewed_games
- ShopVisuals.tsx

## God Nodes (most connected - your core abstractions)
1. `vitest` - 54 edges
2. `Icon()` - 52 edges
3. `Level` - 40 edges
4. `navigate()` - 37 edges
5. `useSession()` - 32 edges
6. `Link()` - 31 edges
7. `react` - 30 edges
8. `Unit` - 30 edges
9. `App()` - 29 edges
10. `chessops` - 28 edges

## Surprising Connections (you probably didn't know these)
- `Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14` --references--> `checkLine()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → scripts/lib/tablebase.ts
- `Qué sí verifiqué y cómo` --references--> `mirrorText()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → src/pedagogy/mirror.ts
- `Importante` --references--> `sanOfUci()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → web/src/chess.ts
- `Para el constructor` --references--> `judgeBestMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → web/src/review/lessonFlow.ts
- `Punto de partida (comprobado en el código)` --references--> `levelPlan()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → worker/level.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (95 total, 11 thin omitted)

### Community 0 - "Tests de contenido y temario"
Cohesion: 0.12
Nodes (22): lessonsForConcept(), UNITS, Unit, unit, unit, unit, unit, unit (+14 more)

### Community 1 - "Motor y analisis de partidas"
Cohesion: 0.22
Nodes (16): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult() (+8 more)

### Community 2 - "games.test.ts"
Cohesion: 0.19
Nodes (15): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+7 more)

### Community 3 - "Tienda y moneda Chedex"
Cohesion: 0.16
Nodes (33): hono, AppContext, createContext(), chosenLevel(), levelEffect(), loadProfile(), profileFor(), progressMap() (+25 more)

### Community 4 - "Ejecucion del analisis en el cliente"
Cohesion: 0.12
Nodes (18): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, games(), mk(), setup(), indexedDbStore() (+10 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (46): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+38 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.14
Nodes (20): pieceName(), withArticle(), agree(), BEST, fem(), FEMININE, HAPPENED, MoveWords (+12 more)

### Community 7 - "Reglas de diagnostico"
Cohesion: 0.34
Nodes (17): Restricciones, canCaptureOn(), capitalize(), describe(), lossOver(), roleName(), sanEs(), sq() (+9 more)

### Community 8 - "ref_node_fs"
Cohesion: 0.21
Nodes (21): CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor(), rankUci(), steps() (+13 more)

### Community 9 - "Landing"
Cohesion: 0.12
Nodes (28): DemoScreen(), HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing(), LessonWindow(), LichessData() (+20 more)

### Community 10 - "Mini leccion del error"
Cohesion: 0.19
Nodes (22): findPins(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), describeMove() (+14 more)

### Community 11 - "Servidor Hono y progreso"
Cohesion: 0.12
Nodes (23): alreadyPlayed(), BLAME, checkSanMentions(), Claims, ES, expand(), FindingType, legalMoves() (+15 more)

### Community 12 - "ref_node_fs"
Cohesion: 0.10
Nodes (13): out, pkg, root, src, analyzed, DIR, files, GOLDEN (+5 more)

### Community 13 - "Icon"
Cohesion: 0.12
Nodes (29): topWeakConcepts(), ErrorBox(), Icon(), IconName, Loading(), PATHS, lessonsForConcept(), LessonScreen() (+21 more)

### Community 14 - "ReviewScreen.tsx"
Cohesion: 0.08
Nodes (25): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+17 more)

### Community 15 - "Acceso con Lichess"
Cohesion: 0.22
Nodes (20): aesKey(), AuthConfig, base64url(), clearedCookies(), cookieHeader(), cookieNames(), encoder, fromBase64url() (+12 more)

### Community 16 - "Repaso de partida y visor"
Cohesion: 0.23
Nodes (15): moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, clamp(), fenAt(), indexBeforePly() (+7 more)

### Community 17 - "src/api.ts"
Cohesion: 0.11
Nodes (24): Equipped, LessonProgress, MapUnit, OutlineUnit, Profile, Subscription, User, ApiError (+16 more)

### Community 18 - "session.ts"
Cohesion: 0.10
Nodes (39): Foco de revisión, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 4: API de la sesión, Task 6: Cierre, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL (+31 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.15
Nodes (23): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), keyErrors() (+15 more)

### Community 20 - "d1-races.test.ts"
Cohesion: 0.10
Nodes (30): Claim, CLAIMS, EXPLAIN_RESULT, CACHE_PATH, cacheProbe(), checkLine(), describeEntry(), fetchEntry() (+22 more)

### Community 21 - "App.tsx"
Cohesion: 0.12
Nodes (32): App(), BillingScreen, CreditsScreen, LessonScreen, LevelScreen, MapScreen, PrivacyScreen, ProfileScreen (+24 more)

### Community 22 - "shared/api.ts"
Cohesion: 0.19
Nodes (14): FASE4, args, checkStep(), DEPTH, fmt(), legalCount(), load(), makeFenOf() (+6 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.19
Nodes (20): ADMIN_IDS, isAdmin(), getItem(), dayOf(), yesterdayOf(), advanceStreak(), balanceOf(), buildShop() (+12 more)

### Community 24 - "Tests de la mini leccion"
Cohesion: 0.11
Nodes (22): chessops, buildCtx(), loadPosition(), playLine(), replayAsThreat(), withTurnFlipped(), diagnose(), exchangeChain() (+14 more)

### Community 25 - "session.ts"
Cohesion: 0.13
Nodes (23): buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1, L2 (+15 more)

### Community 26 - "Colocacion por Elo (antigua)"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzles.test.ts"
Cohesion: 0.11
Nodes (14): Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor, POOL_COMBOS, { puzzles }, TestDb, fillAllBut(), { puzzles }, seed(), TestDb (+6 more)

### Community 29 - "report.test.ts"
Cohesion: 0.33
Nodes (8): Diagnosis, game(), mv(), rg(), err(), filler(), games3, noDiag

### Community 30 - "Level"
Cohesion: 0.17
Nodes (13): args, depth, file, level, LEVELS, LEVEL_ORDER, priority(), recommend() (+5 more)

### Community 31 - "SessionScreen.tsx"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "shared/api.ts"
Cohesion: 0.07
Nodes (32): ReviewPosition, AnswerBody, CompleteLessonBody, CompleteLessonShopExtras, CompleteReviewBody, CompleteReviewResponse, FinishBody, LessonResponse (+24 more)

### Community 33 - "Configuracion TypeScript"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 34 - "Phase 2 architecture (web, Hono Worker, D1)"
Cohesion: 0.16
Nodes (15): Separate educational content from GPL, Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, Chedex Pulse chess training platform (+7 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.16
Nodes (17): Task 2: Datos del servidor y errores propios, MIGRATIONS_DIR, ok, SqlValue, Stmt, completeReview(), MAX_REVIEW_CONCEPTS, CONCEPT_IDS (+9 more)

### Community 36 - "Plan del analisis de partidas"
Cohesion: 0.19
Nodes (14): Known issues to polish, EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent, Review runner, cache and useReview (+6 more)

### Community 37 - "worker/index.ts"
Cohesion: 0.13
Nodes (16): getLesson(), BoardMark, ExplainStep, PracticeStep, allMoves(), gain(), IDS, lessons (+8 more)

### Community 38 - "api.test.ts"
Cohesion: 0.20
Nodes (7): clock, lesson(), LichessMock, placementUnits, pu(), SECRET, units

### Community 39 - "PracticeBoard.tsx"
Cohesion: 0.19
Nodes (19): applyUci(), canonicalUci(), Dests, ES_PIECES, legalDests(), needsPromotion(), parseTypedMove(), posFromFen() (+11 more)

### Community 40 - "src/shop.ts"
Cohesion: 0.15
Nodes (22): StreakProgress(), appearanceClass(), balanceAfter(), BOARD_IDS, boardClass(), BuyState, daysUntilChedex(), dayText() (+14 more)

### Community 41 - "Phase 1 validation report (11 sample games)"
Cohesion: 0.22
Nodes (9): Estado del proyecto (handoff document), Pending work list (ordered), Phase 1: pedagogical prototype (CLI), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games) (+1 more)

### Community 42 - "mirror.ts"
Cohesion: 0.27
Nodes (12): Estado tras la corrección (2026-11-14, mismo día), EXERCISES, COLOR, flipRank(), mirrorExercise(), mirrorFen(), mirrorText(), mirrorUci() (+4 more)

### Community 43 - "completion.ts"
Cohesion: 0.16
Nodes (22): Task 5: Pantalla «Entrenar hoy», ruleFor(), AnswerResult, FinishResult, SessionStart, SessionStatus, conceptName(), dueText() (+14 more)

### Community 44 - "Diseno de la tienda"
Cohesion: 0.29
Nodes (6): Chedex currency (1 per 5 streak days), User decisions changing the founding document, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), cburnett pieces (GPLv2+)

### Community 45 - "ShopScreen.tsx"
Cohesion: 0.16
Nodes (21): Shop, ShopItem, MiniBoard(), ProtectorArt(), BoardItem(), BuyAction(), CollectionPanel(), PanelProps (+13 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.40
Nodes (5): Decision: license whole repo GPL-3.0-or-later, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later), Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 47 - "Plan de nivel y puntos debiles"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "EngineLike"
Cohesion: 0.18
Nodes (3): AuditEngine, EngineLike, FakeEngine

### Community 49 - "LessonPlayer"
Cohesion: 0.20
Nodes (18): add(), auditPractice(), runEngine(), sanOf(), checkMateClaim(), checkMaterialClaim(), compareSolution(), f() (+10 more)

### Community 55 - "LessonPlayer.tsx"
Cohesion: 0.19
Nodes (11): ENDGAME_UNITS, linePositions(), load(), probe, ROLE, sansNear(), textErrors(), units (+3 more)

### Community 56 - "exercises.ts"
Cohesion: 0.16
Nodes (3): UciSession, fake(), BrowserEngine

### Community 57 - "catalog.ts"
Cohesion: 0.15
Nodes (17): CATALOG, CatalogItem, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX, ShopKind, STREAK_DAYS_PER_CHEDEX (+9 more)

### Community 58 - "chessops"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "mirror.ts"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "lessonFlow.ts"
Cohesion: 0.16
Nodes (14): ErrorLesson, canonical(), isExpectedMove(), mates(), run(), Props, AFTER, BestAttempt (+6 more)

### Community 61 - "worker/shop.test.ts"
Cohesion: 0.21
Nodes (14): setup(), user(), { puzzles }, SECRET, setup(), advance(), clock, SECRET (+6 more)

### Community 62 - "Repasos espaciados y sesión diaria — plan de implementación"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "sound.ts"
Cohesion: 0.12
Nodes (24): throwing, countPieces(), EAGER, FILES, installUnlock(), isMuted(), listeners, load() (+16 more)

### Community 64 - "navigate"
Cohesion: 0.15
Nodes (19): LevelInfo, api, reportReviewed, navigate(), replaceSearch(), AuthScreen(), LichessLogin(), mock() (+11 more)

### Community 65 - "GameAnalysis"
Cohesion: 0.16
Nodes (8): GameAnalysis, ReviewGame, Props, AnalysisStore, LoadedGames, ReviewRunner, UseReview, Props

### Community 66 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 69 - "ErrorLessonPlayer.tsx"
Cohesion: 0.25
Nodes (12): chessground, isInCheck(), turnOf(), Board(), marksToShapes(), prefersReducedMotion(), Props, BestPhase (+4 more)

### Community 70 - "d1-races.test.ts"
Cohesion: 0.14
Nodes (9): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+1 more)

### Community 71 - "Lesson"
Cohesion: 0.18
Nodes (10): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Formato y verificación (igual que u01-u06), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Regla para que una lección entre en repasos y sesión (+2 more)

### Community 72 - "Auditor de contenido"
Cohesion: 0.25
Nodes (7): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba

### Community 73 - "context.ts"
Cohesion: 0.18
Nodes (10): BillingMode, LessonStatus, BillingProvider, AppDeps, ProfileRow, Ctx, ContentSource, NO_PLACEMENT (+2 more)

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "explain.ts"
Cohesion: 0.25
Nodes (13): buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover() (+5 more)

### Community 76 - "audit/engine.ts"
Cohesion: 0.24
Nodes (7): enginePath(), PvLine, HASH_MB, UciTransport, MoveClass, Score, Opts

### Community 77 - "worker/index.ts"
Cohesion: 0.25
Nodes (10): SubscriptionStatus, parseBillingMode(), PERIOD_DAYS, SubscriptionRecord, d1Db(), D1Like, appFor(), Env (+2 more)

### Community 78 - "Hallazgos"
Cohesion: 0.25
Nodes (7): Auditoría plena 01: código y estructura (2026-11-15), Cambios en archivos de pantalla (excepciones declaradas), Hallazgos, Lo que NO pude verificar, Métricas, Resumen, Revisado y correcto (sin hallazgo)

### Community 79 - "chess-utils.ts"
Cohesion: 0.24
Nodes (10): balance(), Ctx, DIAG, FEMININE, materialOf(), NAME, ORTHO, PinInfo (+2 more)

### Community 80 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 82 - "mate_threat.ts"
Cohesion: 0.48
Nodes (6): colorName(), Step, favors(), firstMateIndex(), mateThreat(), plural()

### Community 84 - "vitest"
Cohesion: 0.20
Nodes (6): vitest, diagnosis, LEVELS, move, idx(), LEVELS

### Community 85 - "validation.test.ts"
Cohesion: 0.25
Nodes (8): CLEAN, DIR, failures, files, load(), positionsOf(), results, ROLE_ES

### Community 86 - "Revisión pedagógica y de ajedrez · 2026-11-14"
Cohesion: 0.22
Nodes (8): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Lo que NO pude verificar, Menor, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14

### Community 87 - "Auditoría plena 02: diseño visual, UI y accesibilidad"
Cohesion: 0.25
Nodes (7): Auditoría plena 02: diseño visual, UI y accesibilidad, Cómo se midió y qué quedó fuera del repositorio, Datos de contraste y tamaño (muestras medidas), Hallazgos, Lo que no se arregló y por qué, No verificado, Resumen

### Community 88 - "Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)"
Cohesion: 0.25
Nodes (7): Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15), Hallazgos, Método, Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión), No verificado, Resumen, Verificación

### Community 89 - "src/types.ts"
Cohesion: 0.36
Nodes (5): CONCEPTS, Concept, ErrorType, KNOWN_PLACEHOLDERS, LEVELS

### Community 90 - "ErrorLessonPlayer"
Cohesion: 0.38
Nodes (6): lastMoveOf(), ErrorLessonPlayer(), onBestMove(), TypedSquare(), judgeBestMove(), LessonParts()

### Community 91 - "LessonPlayer"
Cohesion: 0.43
Nodes (6): LessonPlayer(), finish(), toEval(), toExplain(), toPractice(), ResultView()

### Community 93 - "POST /api/review/complete and cp_reviewed_games"
Cohesion: 0.40
Nodes (5): Phase 3: personalization (game analysis, weak points), D1 cp_* tables, CREATE IF NOT EXISTS only, Wallet ledger (cp_wallet_ledger), server-side prices, POST /api/review/complete and cp_reviewed_games, topWeakConcepts and Profile weak points section

### Community 94 - "ShopVisuals.tsx"
Cohesion: 0.40
Nodes (4): PieceCode, ROLE, SAMPLE_BOARD, SAMPLE_PIECES

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 508 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Tests de contenido y temario`, `Motor y analisis de partidas`, `games.test.ts`, `Ejecucion del analisis en el cliente`, `package.json`, `ref_node_fs`, `ref_node_fs`, `Icon`, `Repaso de partida y visor`, `session.ts`, `ReportScreen.tsx`, `App.tsx`, `worker/shop.ts`, `Tests de la mini leccion`, `Colocacion por Elo (antigua)`, `puzzles.test.ts`, `report.test.ts`, `shared/api.ts`, `worker/srs.ts`, `worker/index.ts`, `api.test.ts`, `PracticeBoard.tsx`, `src/shop.ts`, `mirror.ts`, `LessonPlayer`, `LessonPlayer.tsx`, `exercises.ts`, `catalog.ts`, `lessonFlow.ts`, `worker/shop.test.ts`, `sound.ts`, `d1-races.test.ts`, `theme.test.ts`, `validation.test.ts`, `src/types.ts`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tests de contenido y temario` be split into smaller, more focused modules?**
  _Cohesion score 0.12292358803986711 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `Tests de la mini leccion` to `Motor y analisis de partidas`, `package.json`, `Reglas de diagnostico`, `ref_node_fs`, `Mini leccion del error`, `Servidor Hono y progreso`, `ReviewScreen.tsx`, `session.ts`, `d1-races.test.ts`, `shared/api.ts`, `worker/srs.ts`, `worker/index.ts`, `PracticeBoard.tsx`, `mirror.ts`, `LessonPlayer.tsx`, `lessonFlow.ts`, `explain.ts`, `chess-utils.ts`, `validation.test.ts`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `Ejecucion del analisis en el cliente` be split into smaller, more focused modules?**
  _Cohesion score 0.12433862433862433 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `Level` to `Tests de contenido y temario`, `shared/api.ts`, `navigate`, `Landing`, `Mini leccion del error`, `explain.ts`, `context.ts`, `Icon`, `Hallazgos`, `src/api.ts`, `session.ts`, `ReportScreen.tsx`, `vitest`, `LessonPlayer.tsx`, `Tests de la mini leccion`, `src/types.ts`, `session.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05180388529139685 - nodes in this community are weakly interconnected._