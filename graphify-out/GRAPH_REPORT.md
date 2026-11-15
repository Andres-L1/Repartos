# Graph Report - agent-aec32d316087743d6  (2026-11-15)

## Corpus Check
- 211 files · ~198,108 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .pgn 12, .css 11, (none) 4)

## Summary
- 1508 nodes · 4129 edges · 89 communities (81 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 155 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a8b68cd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- content/index.ts
- core.ts
- games.test.ts
- ShopScreen.tsx
- useReview.ts
- package.json
- review-copy.ts
- diagnosis/index.ts
- lesson-checks.ts
- Landing.tsx
- error-lesson.ts
- lib.ts
- EngineResult
- Icon
- audit-content.ts
- auth.ts
- GameViewer.tsx
- src/api.ts
- ref_node_fs
- ReportScreen.tsx
- d1-races.test.ts
- router.ts
- verify-fase4.mts
- worker/shop.ts
- error-lesson.test.ts
- AppDeps
- placement.ts
- review/srs.ts
- D1StatementLike
- review/types.ts
- validation.test.ts
- Rúbrica
- mock.ts
- compilerOptions
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan: analysis of last 10 Lichess games
- unitsA.test.ts
- api.test.ts
- sound.ts
- Estado del proyecto (handoff document)
- Phase 1 validation report (11 sample games)
- Revisión pedagógica y de ajedrez · 2026-11-14
- session.ts
- Shop and Chedex currency design
- PracticeBoard
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- EngineLike
- schema.ts
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- env.d.ts
- LessonPlayer
- UciSession
- session.tsx
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- lib.test.ts
- app.ts
- cut-pieces.py
- src/types.ts
- ErrorLessonPlayer.tsx
- theme.test.ts
- Repasos espaciados y sesión diaria — diseño
- browser-engine.test.ts
- explain.ts
- shared/api.ts
- completion.ts
- Lesson
- Auditor de contenido
- GameAnalysis
- Auditoría automática de contenido · 2026-11-15
- chess-utils.ts
- SessionScreen.tsx
- LessonPlayer.tsx
- App.tsx
- golden.test.ts
- SessionValue
- levels.ts
- ReviewScreen.tsx
- vitest
- mirror.ts
- Link
- playLine
- Stockfish
- isExpectedMove

## God Nodes (most connected - your core abstractions)
1. `createApp()` - 55 edges
2. `Icon()` - 52 edges
3. `vitest` - 49 edges
4. `Level` - 40 edges
5. `navigate()` - 37 edges
6. `useSession()` - 32 edges
7. `Link()` - 31 edges
8. `react` - 29 edges
9. `App()` - 28 edges
10. `Unit` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Qué sí verifiqué y cómo` --references--> `mirrorText()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → src/pedagogy/mirror.ts
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

## Communities (89 total, 8 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.13
Nodes (13): LESSONS, lessonsForConcept(), UNITS, unit, unit, unit, unit, unit (+5 more)

### Community 1 - "core.ts"
Cohesion: 0.27
Nodes (13): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult() (+5 more)

### Community 2 - "games.test.ts"
Cohesion: 0.20
Nodes (14): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+6 more)

### Community 3 - "ShopScreen.tsx"
Cohesion: 0.06
Nodes (60): Shop, ShopItem, CATALOG, CatalogItem, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, ShopKind (+52 more)

### Community 4 - "useReview.ts"
Cohesion: 0.11
Nodes (19): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, games(), mk(), setup(), indexedDbStore() (+11 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (45): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+37 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.15
Nodes (19): pieceName(), withArticle(), agree(), BEST, fem(), FEMININE, MoveWords, NUMBER (+11 more)

### Community 7 - "diagnosis/index.ts"
Cohesion: 0.32
Nodes (15): Repasos espaciados y sesión diaria — plan de implementación, Restricciones globales, Restricciones, capitalize(), describe(), lossOver(), sq(), VALUE (+7 more)

### Community 8 - "lesson-checks.ts"
Cohesion: 0.20
Nodes (23): chessops, ALL, CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor() (+15 more)

### Community 9 - "Landing.tsx"
Cohesion: 0.12
Nodes (27): HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing(), LessonWindow(), LichessData(), STAGES (+19 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.18
Nodes (25): findPins(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), describeMove() (+17 more)

### Community 11 - "lib.ts"
Cohesion: 0.12
Nodes (23): alreadyPlayed(), BLAME, checkSanMentions(), Claims, ES, expand(), FindingType, legalMoves() (+15 more)

### Community 12 - "EngineResult"
Cohesion: 0.28
Nodes (6): PvLine, enginePath(), EngineResult, require_, HASH_MB, Score

### Community 13 - "Icon"
Cohesion: 0.17
Nodes (19): topWeakConcepts(), ApiError, ErrorBox(), Icon(), IconName, Loading(), PATHS, LessonScreen() (+11 more)

### Community 14 - "audit-content.ts"
Cohesion: 0.08
Nodes (25): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+17 more)

### Community 15 - "auth.ts"
Cohesion: 0.22
Nodes (20): hono, aesKey(), AuthConfig, base64url(), cookieHeader(), cookieNames(), encoder, fromBase64url() (+12 more)

### Community 16 - "GameViewer.tsx"
Cohesion: 0.21
Nodes (16): moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, Props, clamp(), fenAt() (+8 more)

### Community 17 - "src/api.ts"
Cohesion: 0.15
Nodes (15): AnswerBody, AnswerResult, CompleteLessonBody, CompleteReviewResponse, FinishResult, LessonProgress, Profile, SessionStart (+7 more)

### Community 18 - "ref_node_fs"
Cohesion: 0.18
Nodes (7): out, pkg, root, src, collect(), root, targets

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.18
Nodes (17): Report, lessonsForConcept(), CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline(), inGames(), NO_STRENGTHS (+9 more)

### Community 20 - "d1-races.test.ts"
Cohesion: 0.12
Nodes (17): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+9 more)

### Community 21 - "router.ts"
Cohesion: 0.20
Nodes (11): applyLegacyRedirect(), currentPath(), isPrivatePath(), legacyRedirect(), listeners, normalizePath(), PRIVATE_PREFIXES, RENAMED (+3 more)

### Community 22 - "verify-fase4.mts"
Cohesion: 0.17
Nodes (15): FASE4, args, checkStep(), DEPTH, fmt(), legalCount(), load(), makeFenOf() (+7 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.14
Nodes (25): ADMIN_IDS, isAdmin(), getItem(), profileFor(), dayOf(), NO_PLACEMENT, PlacementEffect, REPEAT_XP (+17 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.14
Nodes (12): HAPPENED, ALL, C, Case, CONCEPT_IDS, exchangeAnswers(), gain(), keyError() (+4 more)

### Community 25 - "AppDeps"
Cohesion: 0.40
Nodes (3): AppDeps, BillingProvider, ContentSource

### Community 26 - "placement.ts"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "review/srs.ts"
Cohesion: 0.13
Nodes (20): Task 1: Calendario y puzles (módulo puro), BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL, MAX_PUZZLE_RATING, nextBox(), POOL_COMBOS, PuzzleDifficulty (+12 more)

### Community 29 - "review/types.ts"
Cohesion: 0.17
Nodes (19): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), keyErrors() (+11 more)

### Community 30 - "validation.test.ts"
Cohesion: 0.11
Nodes (17): args, depth, file, level, LEVELS, trainFromMoves(), PipelineOptions, trainFromPgn() (+9 more)

### Community 31 - "Rúbrica"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "mock.ts"
Cohesion: 0.13
Nodes (23): buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1, L2 (+15 more)

### Community 33 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, noUncheckedIndexedAccess, resolveJsonModule (+5 more)

### Community 34 - "Phase 2 architecture (web, Hono Worker, D1)"
Cohesion: 0.28
Nodes (9): Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Chedex Pulse chess training platform, Learning path (units and lessons, 0-800 Elo), Lichess OAuth PKCE login, Repository structure (web, worker, migrations, src, docs) (+1 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.14
Nodes (20): Foco de revisión, Task 2: Datos del servidor y errores propios, Task 4: API de la sesión, Task 6: Cierre, dueAfter(), MIGRATIONS_DIR, ok, Db (+12 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.17
Nodes (17): Known issues to polish, Phase 3: personalization (game analysis, weak points), EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent (+9 more)

### Community 37 - "unitsA.test.ts"
Cohesion: 0.14
Nodes (13): getLesson(), allMoves(), gain(), IDS, lessons, load(), mateInOneMoves(), Move (+5 more)

### Community 38 - "api.test.ts"
Cohesion: 0.09
Nodes (24): SubscriptionStatus, PROTECTOR_MAX, STREAK_DAYS_PER_CHEDEX, clock, lesson(), LichessMock, placementUnits, pu() (+16 more)

### Community 39 - "sound.ts"
Cohesion: 0.12
Nodes (24): throwing, countPieces(), EAGER, FILES, installUnlock(), isMuted(), listeners, load() (+16 more)

### Community 40 - "Estado del proyecto (handoff document)"
Cohesion: 0.25
Nodes (8): Chedex currency (1 per 5 streak days), Estado del proyecto (handoff document), Pending work list (ordered), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, User decisions changing the founding document, Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 41 - "Phase 1 validation report (11 sample games)"
Cohesion: 0.40
Nodes (5): Phase 1: pedagogical prototype (CLI), Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games), Pedagogical trainer (PGN, Stockfish, diagnosis)

### Community 42 - "Revisión pedagógica y de ajedrez · 2026-11-14"
Cohesion: 0.20
Nodes (9): Crítico (enseña algo falso o da por mala una solución correcta), Estado tras la corrección (2026-11-14, mismo día), Hallazgos, Importante, Lo que NO pude verificar, Menor, Qué sí verifiqué y cómo, Resumen (+1 more)

### Community 43 - "session.ts"
Cohesion: 0.16
Nodes (21): Task 3: Depósito de puzles, difficultyForLevel(), maxRatingForLevel(), themeForConcept(), SessionItem, takePuzzle(), altFor(), dueConcepts() (+13 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.25
Nodes (7): D1 cp_* tables, CREATE IF NOT EXISTS only, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), Wallet ledger (cp_wallet_ledger), server-side prices, cburnett pieces (GPLv2+), Chedex own visual material (GPL-3.0-or-later)

### Community 45 - "PracticeBoard"
Cohesion: 0.22
Nodes (21): applyUci(), canonicalUci(), Dests, ES_PIECES, isInCheck(), lastMoveOf(), legalDests(), needsPromotion() (+13 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.32
Nodes (7): Separate educational content from GPL, Decision: license whole repo GPL-3.0-or-later, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, src/content reserved educational content notice, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "EngineLike"
Cohesion: 0.12
Nodes (4): AuditEngine, EngineLike, FakeEngine, FakeEngine

### Community 49 - "schema.ts"
Cohesion: 0.21
Nodes (11): BoardMark, ExplainStep, PracticeStep, Unit, unit, unit, unit, UNITS_C (+3 more)

### Community 55 - "LessonPlayer"
Cohesion: 0.36
Nodes (6): LessonPlayer(), finish(), toEval(), toExplain(), toPractice(), ResultView()

### Community 56 - "UciSession"
Cohesion: 0.16
Nodes (5): enginePath(), UciSession, UciTransport, fake(), BrowserEngine

### Community 57 - "session.tsx"
Cohesion: 0.15
Nodes (23): api, setApiHandlers(), USE_MOCK, catalogCredits(), creditRows(), navigate(), notify(), replaceSearch() (+15 more)

### Community 58 - "stockfish-proc.cjs"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "Auditoría automática de contenido · 2026-11-14"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "lib.test.ts"
Cohesion: 0.20
Nodes (18): add(), auditPractice(), runEngine(), sanOf(), checkMateClaim(), checkMaterialClaim(), compareSolution(), f() (+10 more)

### Community 61 - "app.ts"
Cohesion: 0.11
Nodes (28): createApp(), chosenLevel(), lessonAccess(), levelEffect(), levelInfoFor(), loadProfile(), progressMap(), Ctx (+20 more)

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "src/types.ts"
Cohesion: 0.19
Nodes (12): CONCEPTS, EXERCISES, LEVEL_ORDER, priority(), recommend(), Concept, ErrorType, Exercise (+4 more)

### Community 64 - "ErrorLessonPlayer.tsx"
Cohesion: 0.16
Nodes (17): ErrorLesson, run(), BestPhase, ErrorLessonPlayer(), onBestMove(), MOMENTS, Props, TONE_BRUSH (+9 more)

### Community 65 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 66 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 68 - "explain.ts"
Cohesion: 0.18
Nodes (16): buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover() (+8 more)

### Community 69 - "shared/api.ts"
Cohesion: 0.16
Nodes (17): CompleteLessonShopExtras, FinishBody, LessonResponse, LessonStatus, LevelCard, LevelInfo, MapLesson, MapUnit (+9 more)

### Community 70 - "completion.ts"
Cohesion: 0.33
Nodes (7): ReviewPosition, CompleteReviewBody, flush(), Pending, pending, reportReviewed(), save()

### Community 71 - "Lesson"
Cohesion: 0.20
Nodes (10): Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Formato y verificación (igual que u01-u06), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Regla para que una lección entre en repasos y sesión, Tercera tanda (2026-11-15): Competitivo, u12 (+2 more)

### Community 72 - "Auditor de contenido"
Cohesion: 0.25
Nodes (7): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba

### Community 73 - "GameAnalysis"
Cohesion: 0.22
Nodes (7): GameAnalysis, ReviewGame, Color, AnalysisStore, LoadedGames, UseReview, Props

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "chess-utils.ts"
Cohesion: 0.19
Nodes (15): balance(), canCaptureOn(), Ctx, DIAG, FEMININE, materialOf(), NAME, ORTHO (+7 more)

### Community 76 - "SessionScreen.tsx"
Cohesion: 0.21
Nodes (15): Task 5: Pantalla «Entrenar hoy», ruleFor(), PROMO_ROLES, conceptName(), dueText(), errMsg(), Fail, formatDay() (+7 more)

### Community 77 - "LessonPlayer.tsx"
Cohesion: 0.28
Nodes (12): chessground, turnOf(), Board(), marksToShapes(), prefersReducedMotion(), Props, ExplainStepView(), Phase (+4 more)

### Community 78 - "App.tsx"
Cohesion: 0.27
Nodes (12): App(), BillingScreen, LessonScreen, LevelScreen, MapScreen, ProfileScreen, ReviewScreen, SessionScreen (+4 more)

### Community 79 - "golden.test.ts"
Cohesion: 0.21
Nodes (11): buildCtx(), loadPosition(), diagnose(), MoveClass, mk(), Opts, analyzed, DIR (+3 more)

### Community 80 - "SessionValue"
Cohesion: 0.23
Nodes (7): BillingMode, Equipped, Subscription, User, MockState, act(), SessionValue

### Community 81 - "levels.ts"
Cohesion: 0.26
Nodes (9): PlacementSeen, SeenPerf, hasRating(), HINT_MIN_GAMES, levelForRating(), LEVELS, PERFS, suggestLevel() (+1 more)

### Community 82 - "ReviewScreen.tsx"
Cohesion: 0.27
Nodes (10): useReview(), ReviewGameScreen(), Failure, failureOf(), GameRow(), Panel(), RateLimited(), RESULT_LABEL (+2 more)

### Community 83 - "vitest"
Cohesion: 0.27
Nodes (5): vitest, unit, unit, unit, UNITS_B

### Community 84 - "mirror.ts"
Cohesion: 0.44
Nodes (8): COLOR, flipRank(), mirrorExercise(), mirrorFen(), mirrorText(), mirrorUci(), swapCase(), BANK

### Community 85 - "Link"
Cohesion: 0.46
Nodes (5): react, Link(), handle(), isPlainClick(), PrivacyScreen()

### Community 86 - "playLine"
Cohesion: 0.50
Nodes (7): colorName(), playLine(), sanEs(), favors(), firstMateIndex(), mateThreat(), plural()

### Community 88 - "isExpectedMove"
Cohesion: 0.83
Nodes (3): canonical(), isExpectedMove(), mates()

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 454 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `games.test.ts`, `ShopScreen.tsx`, `useReview.ts`, `package.json`, `lesson-checks.ts`, `Icon`, `GameViewer.tsx`, `ref_node_fs`, `ReportScreen.tsx`, `d1-races.test.ts`, `router.ts`, `error-lesson.test.ts`, `placement.ts`, `review/srs.ts`, `review/types.ts`, `validation.test.ts`, `worker/srs.ts`, `unitsA.test.ts`, `api.test.ts`, `sound.ts`, `PracticeBoard`, `schema.ts`, `UciSession`, `lib.test.ts`, `src/types.ts`, `ErrorLessonPlayer.tsx`, `theme.test.ts`, `browser-engine.test.ts`, `explain.ts`, `golden.test.ts`, `levels.ts`, `mirror.ts`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `content/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `lesson-checks.ts` to `core.ts`, `worker/srs.ts`, `explain.ts`, `package.json`, `unitsA.test.ts`, `diagnosis/index.ts`, `error-lesson.ts`, `lib.ts`, `chess-utils.ts`, `PracticeBoard`, `audit-content.ts`, `golden.test.ts`, `mirror.ts`, `verify-fase4.mts`, `isExpectedMove`, `error-lesson.test.ts`, `review/srs.ts`, `validation.test.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `ShopScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06468797564687975 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `mock.ts`, `explain.ts`, `Landing.tsx`, `error-lesson.ts`, `session.ts`, `Icon`, `SessionValue`, `schema.ts`, `src/api.ts`, `levels.ts`, `ReportScreen.tsx`, `error-lesson.test.ts`, `session.tsx`, `placement.ts`, `review/srs.ts`, `app.ts`, `validation.test.ts`, `src/types.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `useReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10967741935483871 - nodes in this community are weakly interconnected._