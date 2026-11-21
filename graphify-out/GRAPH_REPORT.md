# Graph Report - agent-afa0bed555e893ccd  (2026-11-21)

## Corpus Check
- 253 files · ~260,809 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .pgn 12, .css 12, (none) 4)

## Summary
- 1738 nodes · 4712 edges · 94 communities (86 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 187 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3eb513de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- content/index.ts
- core.ts
- games.test.ts
- app.ts
- useReview.ts
- package.json
- review-copy.ts
- chess-utils.ts
- lesson-checks.ts
- Landing.tsx
- error-lesson.ts
- lib.ts
- vitest
- Icon
- audit-content.ts
- auth.ts
- shared/api.ts
- SessionValue
- session.ts
- ReportScreen.tsx
- unitsE.test.ts
- sound.ts
- verify-fase4.mts
- worker/shop.ts
- error-lesson.test.ts
- mock.ts
- placement.ts
- puzzle-stats.test.ts
- db.ts
- levels.ts
- chessops
- Rúbrica
- SessionScreen.tsx
- compilerOptions
- Chedex Pulse chess training platform
- worker/srs.ts
- Plan: analysis of last 10 Lichess games
- unitsA.test.ts
- GameViewer.tsx
- react
- ShopScreen.tsx
- Estado del proyecto (handoff document)
- Revisión pedagógica y de ajedrez · 2026-11-14
- api.test.ts
- Shop and Chedex currency design
- App.tsx
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- exercises.ts
- lib.test.ts
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- env.d.ts
- check-piece-bounds.mts
- EngineLike
- lessons.ts
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- ReviewScreen.tsx
- unitsF.test.ts
- cut-pieces.py
- GameAnalysis
- UciSession
- createContext
- Repasos espaciados y sesión diaria — diseño
- FakeWorker
- Stockfish
- completion.ts
- d1-races.test.ts
- schema.ts
- Auditor de contenido
- context.ts
- Auditoría automática de contenido · 2026-11-15
- Fase 4 · Contenido hasta 2000 Elo (diseño)
- EngineResult
- src/types.ts
- runEngine
- tablebase.ts
- theme.test.ts
- Auditoría automática de contenido · 2026-11-20
- verify-finales.mts
- review/srs.ts
- mirror.ts
- unitsD.test.ts
- Calibración de niveles y puzles con datos reales de Lichess (2026-11-21)
- Auditoría plena 02: diseño visual, UI y accesibilidad
- Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)
- Auditoría plena 01: código y estructura (2026-11-15)
- isExpectedMove
- src/api.ts
- vite.config.ts
- POST /api/review/complete and cp_reviewed_games

## God Nodes (most connected - your core abstractions)
1. `vitest` - 59 edges
2. `Icon()` - 52 edges
3. `Level` - 40 edges
4. `navigate()` - 36 edges
5. `chessops` - 33 edges
6. `useSession()` - 33 edges
7. `Unit` - 32 edges
8. `react` - 31 edges
9. `Link()` - 31 edges
10. `App()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14` --references--> `checkLine()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → scripts/lib/tablebase.ts
- `Qué sí verifiqué y cómo` --references--> `mirrorText()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → src/pedagogy/mirror.ts
- `u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`)` --references--> `themeForConcept()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/review/srs.ts
- `Compatibilidad` --references--> `eloRange()`  [INFERRED]
  docs/calibracion-niveles-2026-11.md → src/shared/levels.ts
- `Importante` --references--> `sanOfUci()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → web/src/chess.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (94 total, 8 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.12
Nodes (17): lessonsForConcept(), UNITS, Unit, unit, unit, unit, unit, unit (+9 more)

### Community 1 - "core.ts"
Cohesion: 0.25
Nodes (14): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult() (+6 more)

### Community 2 - "games.test.ts"
Cohesion: 0.20
Nodes (14): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+6 more)

### Community 3 - "app.ts"
Cohesion: 0.32
Nodes (12): hono, AppContext, Env, HttpError, isObj(), readJson(), parseSeen(), buildMap() (+4 more)

### Community 4 - "useReview.ts"
Cohesion: 0.11
Nodes (19): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, games(), mk(), setup(), indexedDbStore() (+11 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (46): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+38 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.11
Nodes (31): buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover() (+23 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.16
Nodes (35): Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), colorName(), Ctx, describe() (+27 more)

### Community 8 - "lesson-checks.ts"
Cohesion: 0.19
Nodes (21): CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor(), rankUci(), steps() (+13 more)

### Community 9 - "Landing.tsx"
Cohesion: 0.11
Nodes (32): OutlineUnit, marksToShapes(), Closing(), HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing() (+24 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.17
Nodes (25): findPins(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), discoveryBlockers() (+17 more)

### Community 11 - "lib.ts"
Cohesion: 0.10
Nodes (26): alreadyPlayed(), BLAME, checkSanMentions(), Claims, ES, expand(), FindingType, isForcing() (+18 more)

### Community 12 - "vitest"
Cohesion: 0.09
Nodes (17): vitest, PvLine, out, pkg, root, src, analyzed, DIR (+9 more)

### Community 13 - "Icon"
Cohesion: 0.14
Nodes (22): topWeakConcepts(), MapUnit, eloRange(), Numbered, numberUnits(), ErrorBox(), Icon(), Link() (+14 more)

### Community 14 - "audit-content.ts"
Cohesion: 0.08
Nodes (25): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+17 more)

### Community 15 - "auth.ts"
Cohesion: 0.24
Nodes (20): aesKey(), base64url(), clearedCookies(), cookieHeader(), cookieNames(), encoder, fromBase64url(), handleCallback() (+12 more)

### Community 16 - "shared/api.ts"
Cohesion: 0.17
Nodes (15): AnswerBody, CompleteLessonShopExtras, FinishBody, LessonResponse, LevelCard, LevelInfo, MapLesson, MeShopExtras (+7 more)

### Community 17 - "SessionValue"
Cohesion: 0.23
Nodes (6): Equipped, Subscription, User, MockState, act(), SessionValue

### Community 18 - "session.ts"
Cohesion: 0.18
Nodes (21): FinishResult, SessionItem, registerReviewRoutes(), altFor(), answerItem(), dueConcepts(), evaluate(), finishPlan() (+13 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.22
Nodes (16): Report, CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline(), inGames(), NO_STRENGTHS, PHASE_NAME (+8 more)

### Community 20 - "unitsE.test.ts"
Cohesion: 0.17
Nodes (13): Claim, CLAIMS, EXPLAIN_RESULT, loadCache(), modeFor(), ENDGAME_UNITS, linePositions(), load() (+5 more)

### Community 21 - "sound.ts"
Cohesion: 0.13
Nodes (21): throwing, SoundToggle(), countPieces(), EAGER, FILES, isMuted(), listeners, loaded (+13 more)

### Community 22 - "verify-fase4.mts"
Cohesion: 0.17
Nodes (15): FASE4, args, checkStep(), DEPTH, fmt(), legalCount(), load(), makeFenOf() (+7 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.24
Nodes (18): getItem(), dayOf(), yesterdayOf(), advanceStreak(), balanceOf(), buildShop(), buyItem(), BuyResult (+10 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.14
Nodes (16): buildCtx(), loadPosition(), playLine(), diagnose(), mk(), ALL, C, Case (+8 more)

### Community 25 - "mock.ts"
Cohesion: 0.13
Nodes (23): buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1, L2 (+15 more)

### Community 26 - "placement.ts"
Cohesion: 0.18
Nodes (15): Por qué un jugador quedaba como principiante, PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput (+7 more)

### Community 27 - "puzzle-stats.test.ts"
Cohesion: 0.13
Nodes (13): POOL_COMBOS, puzzleStart(), { puzzles }, TestDb, fillAllBut(), { puzzles }, seed(), TestDb (+5 more)

### Community 28 - "db.ts"
Cohesion: 0.18
Nodes (5): MIGRATIONS_DIR, D1StatementLike, Db, SqlValue, Stmt

### Community 29 - "levels.ts"
Cohesion: 0.22
Nodes (10): PlacementSeen, SeenPerf, hasRating(), HINT_MIN_GAMES, levelForRating(), LevelInfo, PERFS, PROVISIONAL_MIN_GAMES (+2 more)

### Community 30 - "chessops"
Cohesion: 0.10
Nodes (21): chessops, args, depth, file, level, LEVELS, LEVEL_ORDER, priority() (+13 more)

### Community 31 - "Rúbrica"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "SessionScreen.tsx"
Cohesion: 0.17
Nodes (18): Task 5: Pantalla «Entrenar hoy», ruleFor(), AnswerResult, SessionStart, SessionStatus, PROMO_ROLES, conceptName(), dueText() (+10 more)

### Community 33 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 34 - "Chedex Pulse chess training platform"
Cohesion: 0.16
Nodes (15): Separate educational content from GPL, Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, Chedex Pulse chess training platform (+7 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.18
Nodes (17): Task 2: Datos del servidor y errores propios, Task 4: API de la sesión, dueAfter(), ok, completeReview(), MAX_REVIEW_CONCEPTS, parseCompleteReview(), CONCEPT_IDS (+9 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.19
Nodes (14): Known issues to polish, EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent, Review runner, cache and useReview (+6 more)

### Community 37 - "unitsA.test.ts"
Cohesion: 0.11
Nodes (17): getLesson(), CONCEPTS, Concept, allMoves(), gain(), IDS, lessons, load() (+9 more)

### Community 38 - "GameViewer.tsx"
Cohesion: 0.21
Nodes (16): describeMove(), moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, clamp(), fenAt() (+8 more)

### Community 39 - "react"
Cohesion: 0.09
Nodes (52): chessground, react, ErrorLesson, run(), applyUci(), canonicalUci(), Dests, ES_PIECES (+44 more)

### Community 40 - "ShopScreen.tsx"
Cohesion: 0.05
Nodes (70): Shop, ShopItem, CATALOG, CatalogItem, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX (+62 more)

### Community 41 - "Estado del proyecto (handoff document)"
Cohesion: 0.22
Nodes (9): Estado del proyecto (handoff document), Pending work list (ordered), Phase 1: pedagogical prototype (CLI), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games) (+1 more)

### Community 42 - "Revisión pedagógica y de ajedrez · 2026-11-14"
Cohesion: 0.22
Nodes (8): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Lo que NO pude verificar, Menor, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14

### Community 43 - "api.test.ts"
Cohesion: 0.11
Nodes (25): Hallazgos, Revisado y correcto (sin hallazgo), clock, lesson(), LichessMock, placementUnits, pu(), SECRET (+17 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.29
Nodes (6): Chedex currency (1 per 5 streak days), User decisions changing the founding document, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), cburnett pieces (GPLv2+)

### Community 45 - "App.tsx"
Cohesion: 0.09
Nodes (48): api, setApiHandlers(), USE_MOCK, App(), BillingScreen, CreditsScreen, LessonScreen, LevelScreen (+40 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.40
Nodes (5): Decision: license whole repo GPL-3.0-or-later, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later), Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "exercises.ts"
Cohesion: 0.19
Nodes (10): leaksIn(), Target, targetOf(), targetsOf(), per, rows, EXERCISES, ALL (+2 more)

### Community 49 - "lib.test.ts"
Cohesion: 0.26
Nodes (13): add(), auditPractice(), sanOf(), checkMateClaim(), checkMaterialClaim(), compareSolution(), f(), fmtScore() (+5 more)

### Community 55 - "check-piece-bounds.mts"
Cohesion: 0.13
Nodes (12): args, asJson, Box, chrome(), data, errs, LIMITS, measure() (+4 more)

### Community 56 - "EngineLike"
Cohesion: 0.15
Nodes (3): EngineLike, FakeEngine, FakeEngine

### Community 57 - "lessons.ts"
Cohesion: 0.23
Nodes (14): CompleteLessonBody, LessonStatus, isInt(), computeStatuses(), findLesson(), NO_PLACEMENT, passMarkFor(), PlacementEffect (+6 more)

### Community 58 - "stockfish-proc.cjs"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "Auditoría automática de contenido · 2026-11-14"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "ReviewScreen.tsx"
Cohesion: 0.21
Nodes (13): IconName, reportReviewed, useReview(), ReviewGameScreen(), finish(), Failure, failureOf(), GameRow() (+5 more)

### Community 61 - "unitsF.test.ts"
Cohesion: 0.14
Nodes (21): build(), kind, N, pick(), rnd(), seed, sf, checkClaim() (+13 more)

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "GameAnalysis"
Cohesion: 0.20
Nodes (8): GameAnalysis, ReviewGame, Color, Props, AnalysisStore, LoadedGames, UseReview, Props

### Community 64 - "UciSession"
Cohesion: 0.16
Nodes (4): UciSession, UciTransport, fake(), BrowserEngine

### Community 65 - "createContext"
Cohesion: 0.27
Nodes (9): ADMIN_IDS, isAdmin(), createContext(), chosenLevel(), levelEffect(), loadProfile(), profileFor(), progressMap() (+1 more)

### Community 66 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 69 - "completion.ts"
Cohesion: 0.20
Nodes (9): ReviewPosition, CompleteReviewBody, CompleteReviewResponse, createReviewReporter(), flush(), isPermanent(), Pending, reporter (+1 more)

### Community 70 - "d1-races.test.ts"
Cohesion: 0.15
Nodes (9): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+1 more)

### Community 71 - "schema.ts"
Cohesion: 0.14
Nodes (15): Formato y verificación (igual que u01-u06), BoardMark, ExplainStep, Lesson, PracticeStep, c(), ClaimLike, lesson() (+7 more)

### Community 72 - "Auditor de contenido"
Cohesion: 0.25
Nodes (7): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba

### Community 73 - "context.ts"
Cohesion: 0.15
Nodes (14): BillingMode, SubscriptionStatus, LEVELS, content, AuthConfig, BillingProvider, PERIOD_DAYS, SubscriptionRecord (+6 more)

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "Fase 4 · Contenido hasta 2000 Elo (diseño)"
Cohesion: 0.22
Nodes (8): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Regla para que una lección entre en repasos y sesión, Tercera tanda (2026-11-15): Competitivo, u12

### Community 76 - "EngineResult"
Cohesion: 0.30
Nodes (5): EngineResult, require_, HASH_MB, Score, Opts

### Community 77 - "src/types.ts"
Cohesion: 0.13
Nodes (25): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), keyErrors() (+17 more)

### Community 78 - "runEngine"
Cohesion: 0.43
Nodes (4): runEngine(), AuditEngine, enginePath(), isDirected()

### Community 79 - "tablebase.ts"
Cohesion: 0.22
Nodes (14): CACHE_PATH, checkLine(), describeEntry(), distance(), FLIP, lineFens(), load(), Mode (+6 more)

### Community 80 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 81 - "Auditoría automática de contenido · 2026-11-20"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-20, Aviso, Importante, Resumen

### Community 82 - "verify-finales.mts"
Cohesion: 0.21
Nodes (12): cacheProbe(), fetchEntry(), saveCache(), sleep(), tbKey(), args, cache, ensure() (+4 more)

### Community 83 - "review/srs.ts"
Cohesion: 0.14
Nodes (19): Foco de revisión, Repasos espaciados y sesión diaria — plan de implementación, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 6: Cierre, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL (+11 more)

### Community 84 - "mirror.ts"
Cohesion: 0.35
Nodes (10): Estado tras la corrección (2026-11-14, mismo día), COLOR, flipRank(), mirrorExercise(), mirrorFen(), mirrorText(), mirrorUci(), swapCase() (+2 more)

### Community 85 - "unitsD.test.ts"
Cohesion: 0.27
Nodes (6): unit, unit, unit, CALCULATION, ENGINE, UNITS_D

### Community 86 - "Calibración de niveles y puzles con datos reales de Lichess (2026-11-21)"
Cohesion: 0.25
Nodes (7): Calibración de niveles y puzles con datos reales de Lichess (2026-11-21), Compatibilidad, Decisión por corte (rápidas como referencia), Distribución real (2026-11-21), Fuentes, Límites, Puzles por nivel

### Community 87 - "Auditoría plena 02: diseño visual, UI y accesibilidad"
Cohesion: 0.22
Nodes (8): Arreglos posteriores (2026-11-15): tablero bajo la cabecera y nombre de usuario, Auditoría plena 02: diseño visual, UI y accesibilidad, Cómo se midió y qué quedó fuera del repositorio, Datos de contraste y tamaño (muestras medidas), Hallazgos, Lo que no se arregló y por qué, No verificado, Resumen

### Community 88 - "Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)"
Cohesion: 0.22
Nodes (8): Arreglo de X1 (2026-11-15): la portada ya no espera a `/api/me`, Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15), Hallazgos, Método, Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión), No verificado, Resumen, Verificación

### Community 89 - "Auditoría plena 01: código y estructura (2026-11-15)"
Cohesion: 0.29
Nodes (6): Auditoría plena 01: código y estructura (2026-11-15), Cambios en archivos de pantalla (excepciones declaradas), Lo que NO pude verificar, Métricas, Resumen, Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor

### Community 90 - "isExpectedMove"
Cohesion: 0.38
Nodes (6): Quinta tanda (2026-11-15): u15 torre Avanzado y u16 estrategia verificable, u15 «Finales de torre: nivel Avanzado» (`advanced`, `order` 14, `requires: ['u14']`; u12 pasa a `order` 15), u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`), canonical(), isExpectedMove(), mates()

### Community 91 - "src/api.ts"
Cohesion: 0.11
Nodes (21): LessonProgress, Profile, ApiError, CompleteResponse, Listener, onPaymentRequired(), onUnauthorized(), request() (+13 more)

### Community 93 - "POST /api/review/complete and cp_reviewed_games"
Cohesion: 0.40
Nodes (5): Phase 3: personalization (game analysis, weak points), D1 cp_* tables, CREATE IF NOT EXISTS only, Wallet ledger (cp_wallet_ledger), server-side prices, POST /api/review/complete and cp_reviewed_games, topWeakConcepts and Profile weak points section

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 550 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `games.test.ts`, `useReview.ts`, `package.json`, `lesson-checks.ts`, `Icon`, `ReportScreen.tsx`, `unitsE.test.ts`, `sound.ts`, `error-lesson.test.ts`, `placement.ts`, `puzzle-stats.test.ts`, `levels.ts`, `chessops`, `worker/srs.ts`, `unitsA.test.ts`, `GameViewer.tsx`, `react`, `ShopScreen.tsx`, `api.test.ts`, `App.tsx`, `exercises.ts`, `lib.test.ts`, `unitsF.test.ts`, `UciSession`, `createContext`, `completion.ts`, `d1-races.test.ts`, `context.ts`, `src/types.ts`, `theme.test.ts`, `review/srs.ts`, `mirror.ts`, `unitsD.test.ts`, `src/api.ts`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `content/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12436974789915967 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `chessops` to `core.ts`, `package.json`, `review-copy.ts`, `chess-utils.ts`, `lesson-checks.ts`, `error-lesson.ts`, `lib.ts`, `audit-content.ts`, `unitsE.test.ts`, `verify-fase4.mts`, `error-lesson.test.ts`, `worker/srs.ts`, `unitsA.test.ts`, `react`, `exercises.ts`, `unitsF.test.ts`, `tablebase.ts`, `verify-finales.mts`, `review/srs.ts`, `mirror.ts`, `isExpectedMove`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `useReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10967741935483871 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `content/index.ts`, `review-copy.ts`, `Landing.tsx`, `error-lesson.ts`, `Icon`, `SessionValue`, `session.ts`, `ReportScreen.tsx`, `error-lesson.test.ts`, `mock.ts`, `levels.ts`, `chessops`, `unitsA.test.ts`, `api.test.ts`, `App.tsx`, `exercises.ts`, `schema.ts`, `context.ts`, `src/types.ts`, `review/srs.ts`, `src/api.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05180388529139685 - nodes in this community are weakly interconnected._