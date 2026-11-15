# Graph Report - agent-a808915267a84cef6  (2026-11-15)

## Corpus Check
- 217 files · ~217,944 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .pgn 12, .css 11, (none) 4)

## Summary
- 1535 nodes · 4218 edges · 88 communities (78 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 159 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `53e894ab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- content/index.ts
- core.ts
- games.test.ts
- ShopScreen.tsx
- useReview.ts
- devDependencies
- review-copy.ts
- chess-utils.ts
- chessops
- Landing.tsx
- error-lesson.ts
- lib.ts
- audit/engine.ts
- Icon
- audit-content.ts
- auth.ts
- GameViewer.tsx
- src/api.ts
- session.ts
- ReportScreen.tsx
- verify-finales.mts
- router.ts
- verify-fase4.mts
- app.ts
- error-lesson.test.ts
- mock.ts
- placement.ts
- puzzles.test.ts
- D1StatementLike
- review/types.ts
- src/types.ts
- Rúbrica
- shared/api.ts
- compilerOptions
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan: analysis of last 10 Lichess games
- unitsA.test.ts
- d1-races.test.ts
- SessionScreen.tsx
- Estado del proyecto (handoff document)
- Phase 1 validation report (11 sample games)
- mirror.ts
- src/shop.ts
- Shop and Chedex currency design
- worker/shop.test.ts
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- EngineLike
- lib.test.ts
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- unitsE.test.ts
- UciSession
- session.tsx
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- runEngine
- package.json
- cut-pieces.py
- vitest
- Link
- theme.test.ts
- Repasos espaciados y sesión diaria — diseño
- FakeWorker
- EngineResult
- scripts
- completion.ts
- Lesson
- Auditor de contenido
- GameAnalysis
- Auditoría automática de contenido · 2026-11-15
- ReviewScreen.tsx
- analysis/engine.ts
- dependencies
- Shop
- validation.test.ts
- ref_node_url
- Stockfish
- mate_threat.ts
- golden.test.ts
- report.ts
- ref_node_fs
- Hallazgos
- explain.test.ts

## God Nodes (most connected - your core abstractions)
1. `createApp()` - 55 edges
2. `Icon()` - 52 edges
3. `vitest` - 50 edges
4. `Level` - 40 edges
5. `navigate()` - 37 edges
6. `useSession()` - 32 edges
7. `Link()` - 31 edges
8. `Unit` - 30 edges
9. `react` - 29 edges
10. `chessops` - 28 edges

## Surprising Connections (you probably didn't know these)
- `Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14` --references--> `checkLine()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → scripts/lib/tablebase.ts
- `Importante` --references--> `sanOfUci()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → web/src/chess.ts
- `Para el constructor` --references--> `judgeBestMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → web/src/review/lessonFlow.ts
- `Archivos` --references--> `EngineLike`  [INFERRED]
  scripts/audit/README.md → src/analysis/engine-like.ts
- `Restricciones globales` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/plans/2026-11-13-repasos-y-sesion-diaria.md → src/analysis/pgn.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (88 total, 10 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.12
Nodes (23): UNITS, Unit, unit, unit, unit, unit, unit, unit (+15 more)

### Community 1 - "core.ts"
Cohesion: 0.33
Nodes (11): AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult(), ParsedGame (+3 more)

### Community 2 - "games.test.ts"
Cohesion: 0.20
Nodes (14): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+6 more)

### Community 3 - "ShopScreen.tsx"
Cohesion: 0.16
Nodes (22): Coin(), MiniBoard(), PieceCode, ProtectorArt(), ROLE, SAMPLE_BOARD, SAMPLE_PIECES, BoardItem() (+14 more)

### Community 4 - "useReview.ts"
Cohesion: 0.11
Nodes (19): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, games(), mk(), setup(), indexedDbStore() (+11 more)

### Community 5 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, tsx@^4.19.0, @types/node@^22.0.0, @types/react@^19.3.0, typescript@^5.6.0, vitest@^5.1.0, wrangler@^4.161.0, tsx (+4 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.11
Nodes (32): buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover() (+24 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.20
Nodes (29): Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), Ctx, describe(), DIAG (+21 more)

### Community 8 - "chessops"
Cohesion: 0.14
Nodes (27): chessops, CONCEPTS, canonical(), mates(), Concept, ALL, CONCEPT_IDS, describeLessons() (+19 more)

### Community 9 - "Landing.tsx"
Cohesion: 0.13
Nodes (27): Closing(), HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing(), LessonWindow(), LichessData() (+19 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.18
Nodes (24): findPins(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), describeMove() (+16 more)

### Community 11 - "lib.ts"
Cohesion: 0.11
Nodes (22): alreadyPlayed(), BLAME, checkSanMentions(), Claims, ES, FindingType, isForcing(), lintText() (+14 more)

### Community 12 - "audit/engine.ts"
Cohesion: 0.24
Nodes (5): PvLine, out, pkg, root, src

### Community 13 - "Icon"
Cohesion: 0.18
Nodes (29): App(), ErrorBox(), Icon(), IconName, Loading(), PATHS, LessonPlayer(), toEval() (+21 more)

### Community 14 - "audit-content.ts"
Cohesion: 0.08
Nodes (25): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+17 more)

### Community 15 - "auth.ts"
Cohesion: 0.26
Nodes (18): aesKey(), base64url(), cookieHeader(), cookieNames(), encoder, fromBase64url(), handleCallback(), handleLogin() (+10 more)

### Community 16 - "GameViewer.tsx"
Cohesion: 0.21
Nodes (16): moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, Props, clamp(), fenAt() (+8 more)

### Community 17 - "src/api.ts"
Cohesion: 0.15
Nodes (15): topWeakConcepts(), AnswerBody, CompleteReviewResponse, LessonProgress, MapUnit, Profile, api, ApiError (+7 more)

### Community 18 - "session.ts"
Cohesion: 0.09
Nodes (41): Foco de revisión, Repasos espaciados y sesión diaria — plan de implementación, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 4: API de la sesión, Task 6: Cierre, BOX_DAYS, conceptForThemes() (+33 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.16
Nodes (21): lessonsForConcept(), buildReport(), ReportError, keyErrors(), Report, Strength, CONCEPT_PHRASE, conceptShort() (+13 more)

### Community 20 - "verify-finales.mts"
Cohesion: 0.13
Nodes (26): CACHE_PATH, cacheProbe(), checkLine(), describeEntry(), fetchEntry(), FLIP, lineFens(), load() (+18 more)

### Community 21 - "router.ts"
Cohesion: 0.15
Nodes (15): react, USE_MOCK, applyLegacyRedirect(), currentPath(), isPrivatePath(), legacyRedirect(), listeners, normalizePath() (+7 more)

### Community 22 - "verify-fase4.mts"
Cohesion: 0.15
Nodes (18): expand(), FASE4, legalMoves(), matesInOne(), args, checkStep(), DEPTH, fmt() (+10 more)

### Community 23 - "app.ts"
Cohesion: 0.08
Nodes (54): ADMIN_IDS, isAdmin(), BillingMode, suggestLevel(), getItem(), AppDeps, createApp(), chosenLevel() (+46 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.12
Nodes (18): buildCtx(), loadPosition(), playLine(), HAPPENED, MoveClass, mk(), Opts, ALL (+10 more)

### Community 25 - "mock.ts"
Cohesion: 0.13
Nodes (23): buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1, L2 (+15 more)

### Community 26 - "placement.ts"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzles.test.ts"
Cohesion: 0.20
Nodes (10): POOL_COMBOS, fillAllBut(), { puzzles }, seed(), TestDb, cleanupStmts(), fillPool(), refill() (+2 more)

### Community 29 - "review/types.ts"
Cohesion: 0.29
Nodes (10): KeyError, AnalyzedMove, Diagnosis, game(), mv(), rg(), err(), filler() (+2 more)

### Community 30 - "src/types.ts"
Cohesion: 0.17
Nodes (12): args, depth, file, level, LEVELS, LEVEL_ORDER, priority(), recommend() (+4 more)

### Community 31 - "Rúbrica"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "shared/api.ts"
Cohesion: 0.08
Nodes (33): PipelineOptions, CompleteLessonBody, CompleteLessonShopExtras, FinishBody, LessonResponse, LessonStatus, LevelCard, LevelInfo (+25 more)

### Community 33 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, noUncheckedIndexedAccess, resolveJsonModule (+5 more)

### Community 34 - "Phase 2 architecture (web, Hono Worker, D1)"
Cohesion: 0.28
Nodes (9): Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Chedex Pulse chess training platform, Learning path (units and lessons, 0-800 Elo), Lichess OAuth PKCE login, Repository structure (web, worker, migrations, src, docs) (+1 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.17
Nodes (16): Task 2: Datos del servidor y errores propios, MIGRATIONS_DIR, ok, Db, SqlValue, Stmt, completeReview(), MAX_REVIEW_CONCEPTS (+8 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.17
Nodes (17): Known issues to polish, Phase 3: personalization (game analysis, weak points), EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent (+9 more)

### Community 37 - "unitsA.test.ts"
Cohesion: 0.11
Nodes (17): getLesson(), BoardMark, ExplainStep, PracticeStep, allMoves(), gain(), IDS, lessons (+9 more)

### Community 38 - "d1-races.test.ts"
Cohesion: 0.07
Nodes (32): SubscriptionStatus, clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup() (+24 more)

### Community 39 - "SessionScreen.tsx"
Cohesion: 0.05
Nodes (91): Task 5: Pantalla «Entrenar hoy», chessground, ErrorLesson, ruleFor(), AnswerResult, FinishResult, SessionStart, SessionStatus (+83 more)

### Community 40 - "Estado del proyecto (handoff document)"
Cohesion: 0.25
Nodes (8): Chedex currency (1 per 5 streak days), Estado del proyecto (handoff document), Pending work list (ordered), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, User decisions changing the founding document, Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 41 - "Phase 1 validation report (11 sample games)"
Cohesion: 0.40
Nodes (5): Phase 1: pedagogical prototype (CLI), Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games), Pedagogical trainer (PGN, Stockfish, diagnosis)

### Community 42 - "mirror.ts"
Cohesion: 0.21
Nodes (14): Estado tras la corrección (2026-11-14, mismo día), Lo que NO pude verificar, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14, COLOR, flipRank(), mirrorExercise() (+6 more)

### Community 43 - "src/shop.ts"
Cohesion: 0.19
Nodes (19): appearanceClass(), balanceAfter(), BOARD_IDS, boardClass(), BuyState, chedexText(), confirmText(), daysUntilChedex() (+11 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.25
Nodes (7): D1 cp_* tables, CREATE IF NOT EXISTS only, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), Wallet ledger (cp_wallet_ledger), server-side prices, cburnett pieces (GPLv2+), Chedex own visual material (GPL-3.0-or-later)

### Community 45 - "worker/shop.test.ts"
Cohesion: 0.13
Nodes (19): CATALOG, CatalogItem, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX, ShopKind, STREAK_DAYS_PER_CHEDEX (+11 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.32
Nodes (7): Separate educational content from GPL, Decision: license whole repo GPL-3.0-or-later, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, src/content reserved educational content notice, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 49 - "lib.test.ts"
Cohesion: 0.24
Nodes (14): auditPractice(), sanOf(), checkMateClaim(), checkMaterialClaim(), compareSolution(), f(), fmtScore(), followToStable() (+6 more)

### Community 55 - "unitsE.test.ts"
Cohesion: 0.21
Nodes (11): Claim, CLAIMS, EXPLAIN_RESULT, ENDGAME_UNITS, linePositions(), load(), probe, ROLE (+3 more)

### Community 57 - "session.tsx"
Cohesion: 0.19
Nodes (11): Equipped, Subscription, User, setApiHandlers(), finish(), MockState, BillingScreen(), act() (+3 more)

### Community 58 - "stockfish-proc.cjs"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "Auditoría automática de contenido · 2026-11-14"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "runEngine"
Cohesion: 0.36
Nodes (4): add(), runEngine(), AuditEngine, enginePath()

### Community 61 - "package.json"
Cohesion: 0.18
Nodes (10): description, @types/react-dom@^19.3.0, engines, node, license, name, private, type (+2 more)

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "vitest"
Cohesion: 0.18
Nodes (8): vitest, EXERCISES, KNOWN_PLACEHOLDERS, LEVELS, idx(), LEVELS, { puzzles }, SECRET

### Community 64 - "Link"
Cohesion: 0.38
Nodes (7): Link(), handle(), catalogCredits(), creditRows(), isPlainClick(), CreditsScreen(), PrivacyScreen()

### Community 65 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 66 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 68 - "EngineResult"
Cohesion: 0.19
Nodes (3): EngineResult, FakeEngine, FakeEngine

### Community 69 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, audit:content, build, build:web, chedex, db:migrate:local, dev, dev:web (+3 more)

### Community 70 - "completion.ts"
Cohesion: 0.33
Nodes (7): ReviewPosition, CompleteReviewBody, flush(), Pending, pending, reportReviewed(), save()

### Community 71 - "Lesson"
Cohesion: 0.18
Nodes (11): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Formato y verificación (igual que u01-u06), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Regla para que una lección entre en repasos y sesión (+3 more)

### Community 72 - "Auditor de contenido"
Cohesion: 0.25
Nodes (7): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba

### Community 73 - "GameAnalysis"
Cohesion: 0.22
Nodes (7): GameAnalysis, ReviewGame, Color, AnalysisStore, LoadedGames, UseReview, Props

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "ReviewScreen.tsx"
Cohesion: 0.29
Nodes (9): useReview(), Failure, failureOf(), GameRow(), Panel(), RateLimited(), RESULT_LABEL, ReviewScreen() (+1 more)

### Community 76 - "analysis/engine.ts"
Cohesion: 0.27
Nodes (7): analyzeGame(), Engine, enginePath(), require_, HASH_MB, UciTransport, Score

### Community 77 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, hono (+2 more)

### Community 78 - "Shop"
Cohesion: 0.28
Nodes (5): Shop, ShopItem, PanelProps, buy(), equip()

### Community 79 - "validation.test.ts"
Cohesion: 0.25
Nodes (8): CLEAN, DIR, failures, files, load(), positionsOf(), results, ROLE_ES

### Community 80 - "ref_node_url"
Cohesion: 0.29
Nodes (5): vite@^8.3.8, @vitejs/plugin-react@^6.3.0, vite, @vitejs/plugin-react, root

### Community 82 - "mate_threat.ts"
Cohesion: 0.48
Nodes (6): colorName(), Step, favors(), firstMateIndex(), mateThreat(), plural()

### Community 83 - "golden.test.ts"
Cohesion: 0.33
Nodes (6): diagnose(), analyzed, DIR, files, GOLDEN, snapshot()

### Community 84 - "report.ts"
Cohesion: 0.48
Nodes (6): computeStrengths(), errorRate(), isError(), phaseOf(), studentMoves(), Phase

### Community 85 - "ref_node_fs"
Cohesion: 0.40
Nodes (3): collect(), root, targets

### Community 86 - "Hallazgos"
Cohesion: 0.50
Nodes (4): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Menor

### Community 87 - "explain.test.ts"
Cohesion: 0.50
Nodes (3): diagnosis, LEVELS, move

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 464 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `games.test.ts`, `useReview.ts`, `devDependencies`, `chessops`, `GameViewer.tsx`, `src/api.ts`, `session.ts`, `ReportScreen.tsx`, `router.ts`, `error-lesson.test.ts`, `placement.ts`, `puzzles.test.ts`, `review/types.ts`, `shared/api.ts`, `worker/srs.ts`, `unitsA.test.ts`, `d1-races.test.ts`, `SessionScreen.tsx`, `mirror.ts`, `src/shop.ts`, `worker/shop.test.ts`, `EngineLike`, `lib.test.ts`, `unitsE.test.ts`, `UciSession`, `package.json`, `theme.test.ts`, `analysis/engine.ts`, `validation.test.ts`, `golden.test.ts`, `ref_node_fs`, `explain.test.ts`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `content/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `chessops` to `core.ts`, `worker/srs.ts`, `unitsA.test.ts`, `review-copy.ts`, `chess-utils.ts`, `SessionScreen.tsx`, `error-lesson.ts`, `lib.ts`, `mirror.ts`, `dependencies`, `audit-content.ts`, `validation.test.ts`, `session.ts`, `verify-finales.mts`, `verify-fase4.mts`, `unitsE.test.ts`, `error-lesson.test.ts`, `package.json`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `useReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10967741935483871 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `content/index.ts`, `review-copy.ts`, `Landing.tsx`, `error-lesson.ts`, `Icon`, `src/api.ts`, `session.ts`, `ReportScreen.tsx`, `app.ts`, `explain.test.ts`, `error-lesson.test.ts`, `mock.ts`, `placement.ts`, `session.tsx`, `src/types.ts`, `vitest`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `review-copy.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1051693404634581 - nodes in this community are weakly interconnected._