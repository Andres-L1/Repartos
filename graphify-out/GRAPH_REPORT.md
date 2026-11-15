# Graph Report - agent-ab729c3ac1b95013f  (2026-11-15)

## Corpus Check
- 199 files · ~170,062 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .pgn 12, .css 11, (none) 4)

## Summary
- 1357 nodes · 3836 edges · 69 communities (63 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 139 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `de5551a5`
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
- chess-utils.ts
- lesson-checks.ts
- Landing.tsx
- error-lesson.ts
- app.ts
- PracticeBoard.tsx
- Icon
- ReviewScreen.tsx
- auth.ts
- ReviewGameScreen.tsx
- navigate
- review/srs.ts
- ReportScreen.tsx
- d1-races.test.ts
- router.ts
- shared/api.ts
- createApp
- error-lesson.test.ts
- session.ts
- placement.ts
- puzzles.test.ts
- db.ts
- report.ts
- src/types.ts
- SessionScreen.tsx
- mock.ts
- compilerOptions
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan: analysis of last 10 Lichess games
- explain.ts
- api.test.ts
- ErrorLessonPlayer.tsx
- Estado del proyecto (handoff document)
- Phase 1 validation report (11 sample games)
- Repasos espaciados y sesión diaria — diseño
- completion.ts
- Shop and Chedex currency design
- sound.ts
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- engine.ts
- LessonPlayer
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- Board.tsx
- UciSession
- verify-fase4.mts
- validation.test.ts
- mirror.ts
- unitsA.test.ts
- src/api.ts
- cut-pieces.py
- golden.test.ts
- credits.ts
- Lesson
- playLine
- browser-engine.test.ts
- vitest

## God Nodes (most connected - your core abstractions)
1. `createApp()` - 54 edges
2. `Icon()` - 52 edges
3. `vitest` - 48 edges
4. `Level` - 40 edges
5. `navigate()` - 37 edges
6. `useSession()` - 32 edges
7. `Link()` - 31 edges
8. `react` - 29 edges
9. `App()` - 28 edges
10. `Unit` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Importante` --references--> `sanOfUci()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → web/src/chess.ts
- `Para el constructor` --references--> `judgeBestMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → web/src/review/lessonFlow.ts
- `Punto de partida (comprobado en el código)` --references--> `levelPlan()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → worker/level.ts
- `Restricciones globales` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/plans/2026-11-13-repasos-y-sesion-diaria.md → src/analysis/pgn.ts
- `Task 1: Calendario y puzles (módulo puro)` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/plans/2026-11-13-repasos-y-sesion-diaria.md → src/analysis/pgn.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (69 total, 6 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.14
Nodes (20): UNITS, Unit, unit, unit, unit, unit, unit, unit (+12 more)

### Community 1 - "core.ts"
Cohesion: 0.25
Nodes (14): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult() (+6 more)

### Community 2 - "games.test.ts"
Cohesion: 0.20
Nodes (14): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+6 more)

### Community 3 - "ShopScreen.tsx"
Cohesion: 0.10
Nodes (44): ShopItem, ResultView(), Coin(), MiniBoard(), PieceCode, ProtectorArt(), ROLE, SAMPLE_BOARD (+36 more)

### Community 4 - "useReview.ts"
Cohesion: 0.08
Nodes (26): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, GameAnalysis, ReviewGame, Color, games(), mk() (+18 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (46): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+38 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.14
Nodes (20): pieceName(), withArticle(), agree(), BEST, fem(), FEMININE, HAPPENED, MoveWords (+12 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.18
Nodes (31): Restricciones globales, Restricciones, balance(), buildCtx(), capitalize(), Ctx, describe(), DIAG (+23 more)

### Community 8 - "lesson-checks.ts"
Cohesion: 0.20
Nodes (23): chessops, CONCEPTS, Concept, CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1() (+15 more)

### Community 9 - "Landing.tsx"
Cohesion: 0.12
Nodes (27): HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing(), LessonParts(), LessonWindow(), LichessData() (+19 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.19
Nodes (24): canCaptureOn(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), describeMove() (+16 more)

### Community 11 - "app.ts"
Cohesion: 0.09
Nodes (27): BillingMode, LessonStatus, SubscriptionStatus, AppDeps, lessonAccess(), progressMap(), Ctx, Env (+19 more)

### Community 12 - "PracticeBoard.tsx"
Cohesion: 0.25
Nodes (15): applyUci(), canonicalUci(), Dests, ES_PIECES, legalDests(), needsPromotion(), parseTypedMove(), posFromFen() (+7 more)

### Community 13 - "Icon"
Cohesion: 0.14
Nodes (32): react, topWeakConcepts(), MapUnit, LEVELS, App(), ErrorBox(), Icon(), IconName (+24 more)

### Community 14 - "ReviewScreen.tsx"
Cohesion: 0.26
Nodes (10): MIN_GAMES, useReview(), Failure, failureOf(), GameRow(), Panel(), RateLimited(), RESULT_LABEL (+2 more)

### Community 15 - "auth.ts"
Cohesion: 0.20
Nodes (21): { puzzles }, SECRET, setup(), aesKey(), base64url(), cookieHeader(), cookieNames(), encoder (+13 more)

### Community 16 - "ReviewGameScreen.tsx"
Cohesion: 0.19
Nodes (18): keyErrors(), moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, clamp(), fenAt() (+10 more)

### Community 17 - "navigate"
Cohesion: 0.15
Nodes (21): Equipped, Shop, Subscription, User, setApiHandlers(), MockState, navigate(), replaceSearch() (+13 more)

### Community 18 - "review/srs.ts"
Cohesion: 0.14
Nodes (22): Foco de revisión, Repasos espaciados y sesión diaria — plan de implementación, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 4: API de la sesión, Task 6: Cierre, BOX_DAYS, conceptForThemes() (+14 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.21
Nodes (16): Report, Strength, CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline(), inGames(), NO_STRENGTHS (+8 more)

### Community 20 - "d1-races.test.ts"
Cohesion: 0.12
Nodes (18): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+10 more)

### Community 21 - "router.ts"
Cohesion: 0.20
Nodes (12): applyLegacyRedirect(), currentPath(), isPrivatePath(), legacyRedirect(), listeners, normalizePath(), notify(), PRIVATE_PREFIXES (+4 more)

### Community 22 - "shared/api.ts"
Cohesion: 0.10
Nodes (28): PipelineOptions, AnswerBody, CompleteLessonBody, CompleteLessonShopExtras, CompleteReviewResponse, FinishBody, LessonResponse, LevelCard (+20 more)

### Community 23 - "createApp"
Cohesion: 0.17
Nodes (26): getItem(), createApp(), chosenLevel(), levelEffect(), loadProfile(), profileFor(), isInt(), dayOf() (+18 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.15
Nodes (11): ALL, C, Case, CONCEPT_IDS, exchangeAnswers(), gain(), keyError(), lesson() (+3 more)

### Community 25 - "session.ts"
Cohesion: 0.16
Nodes (18): SessionItem, altFor(), answerItem(), dueConcepts(), evaluate(), isExpected(), ItemRow, nextDueAt() (+10 more)

### Community 26 - "placement.ts"
Cohesion: 0.17
Nodes (16): PlacementPerf, levelInfoFor(), describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), parseSeen() (+8 more)

### Community 27 - "puzzles.test.ts"
Cohesion: 0.21
Nodes (11): POOL_COMBOS, puzzleStart(), fillAllBut(), { puzzles }, seed(), TestDb, cleanupStmts(), fillPool() (+3 more)

### Community 28 - "db.ts"
Cohesion: 0.19
Nodes (5): MIGRATIONS_DIR, D1StatementLike, Db, SqlValue, Stmt

### Community 29 - "report.ts"
Cohesion: 0.17
Nodes (18): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), KeyError (+10 more)

### Community 30 - "src/types.ts"
Cohesion: 0.14
Nodes (14): args, depth, file, level, LEVELS, LEVEL_ORDER, priority(), recommend() (+6 more)

### Community 31 - "SessionScreen.tsx"
Cohesion: 0.17
Nodes (23): Task 5: Pantalla «Entrenar hoy», ruleFor(), AnswerResult, FinishResult, SessionStart, SessionStatus, lastMoveOf(), conceptName() (+15 more)

### Community 32 - "mock.ts"
Cohesion: 0.08
Nodes (36): CATALOG, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX, STREAK_DAYS_PER_CHEDEX, css, landing (+28 more)

### Community 33 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, noUncheckedIndexedAccess, resolveJsonModule (+5 more)

### Community 34 - "Phase 2 architecture (web, Hono Worker, D1)"
Cohesion: 0.28
Nodes (9): Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Chedex Pulse chess training platform, Learning path (units and lessons, 0-800 Elo), Lichess OAuth PKCE login, Repository structure (web, worker, migrations, src, docs) (+1 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.26
Nodes (12): Task 2: Datos del servidor y errores propios, ok, completeReview(), MAX_REVIEW_CONCEPTS, parseCompleteReview(), CONCEPT_IDS, legalMove(), MAX_POSITIONS (+4 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.17
Nodes (17): Known issues to polish, Phase 3: personalization (game analysis, weak points), EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent (+9 more)

### Community 37 - "explain.ts"
Cohesion: 0.14
Nodes (20): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Menor, buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine() (+12 more)

### Community 38 - "api.test.ts"
Cohesion: 0.16
Nodes (10): clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup(), units (+2 more)

### Community 39 - "ErrorLessonPlayer.tsx"
Cohesion: 0.13
Nodes (21): chessground, ErrorLesson, canonical(), isExpectedMove(), mates(), run(), BestPhase, ErrorLessonPlayer() (+13 more)

### Community 40 - "Estado del proyecto (handoff document)"
Cohesion: 0.25
Nodes (8): Chedex currency (1 per 5 streak days), Estado del proyecto (handoff document), Pending work list (ordered), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, User decisions changing the founding document, Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 41 - "Phase 1 validation report (11 sample games)"
Cohesion: 0.40
Nodes (5): Phase 1: pedagogical prototype (CLI), Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games), Pedagogical trainer (PGN, Stockfish, diagnosis)

### Community 42 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 43 - "completion.ts"
Cohesion: 0.29
Nodes (8): ReviewPosition, CompleteReviewBody, flush(), Pending, pending, reportReviewed(), save(), finish()

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.25
Nodes (7): D1 cp_* tables, CREATE IF NOT EXISTS only, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), Wallet ledger (cp_wallet_ledger), server-side prices, cburnett pieces (GPLv2+), Chedex own visual material (GPL-3.0-or-later)

### Community 45 - "sound.ts"
Cohesion: 0.13
Nodes (19): throwing, countPieces(), FILES, installUnlock(), isMuted(), listeners, moveSoundOf(), MUTE_KEY (+11 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.32
Nodes (7): Separate educational content from GPL, Decision: license whole repo GPL-3.0-or-later, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, src/content reserved educational content notice, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "engine.ts"
Cohesion: 0.16
Nodes (7): EngineLike, EngineResult, require_, HASH_MB, Score, FakeEngine, FakeEngine

### Community 49 - "LessonPlayer"
Cohesion: 0.43
Nodes (5): LessonPlayer(), finish(), toEval(), toExplain(), toPractice()

### Community 55 - "Board.tsx"
Cohesion: 0.22
Nodes (14): BoardMark, PracticeStep, isInCheck(), turnOf(), Board(), marksToShapes(), Props, ExplainStepView() (+6 more)

### Community 56 - "UciSession"
Cohesion: 0.17
Nodes (4): UciSession, UciTransport, fake(), BrowserEngine

### Community 57 - "verify-fase4.mts"
Cohesion: 0.07
Nodes (27): out, pkg, root, src, args, checkStep(), DEPTH, fmt() (+19 more)

### Community 58 - "validation.test.ts"
Cohesion: 0.15
Nodes (11): CLEAN, DIR, failures, files, load(), positionsOf(), results, ROLE_ES (+3 more)

### Community 59 - "mirror.ts"
Cohesion: 0.17
Nodes (17): Estado tras la corrección (2026-11-14, mismo día), Lo que NO pude verificar, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14, LESSONS, EXERCISES, COLOR (+9 more)

### Community 60 - "unitsA.test.ts"
Cohesion: 0.13
Nodes (14): getLesson(), ExplainStep, allMoves(), gain(), IDS, lessons, load(), mateInOneMoves() (+6 more)

### Community 61 - "src/api.ts"
Cohesion: 0.21
Nodes (13): LessonProgress, Profile, api, ApiError, CompleteResponse, Listener, onPaymentRequired(), onUnauthorized() (+5 more)

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "golden.test.ts"
Cohesion: 0.22
Nodes (9): diagnose(), MoveClass, mk(), Opts, analyzed, DIR, files, GOLDEN (+1 more)

### Community 64 - "credits.ts"
Cohesion: 0.29
Nodes (9): CatalogItem, ShopKind, catalogCredits(), CREDIT_GROUP_LABEL, creditRows(), LIBRARIES, Library, ORDER (+1 more)

### Community 65 - "Lesson"
Cohesion: 0.22
Nodes (8): Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Formato y verificación (igual que u01-u06), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Regla para que una lección entre en repasos y sesión, Lesson

### Community 66 - "playLine"
Cohesion: 0.50
Nodes (7): colorName(), playLine(), sanEs(), favors(), firstMateIndex(), mateThreat(), plural()

### Community 68 - "vitest"
Cohesion: 0.29
Nodes (4): vitest, lessonsForConcept(), KNOWN_PLACEHOLDERS, LEVELS

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 382 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `games.test.ts`, `ShopScreen.tsx`, `useReview.ts`, `package.json`, `lesson-checks.ts`, `PracticeBoard.tsx`, `Icon`, `auth.ts`, `ReviewGameScreen.tsx`, `review/srs.ts`, `ReportScreen.tsx`, `d1-races.test.ts`, `router.ts`, `shared/api.ts`, `error-lesson.test.ts`, `placement.ts`, `puzzles.test.ts`, `report.ts`, `src/types.ts`, `mock.ts`, `worker/srs.ts`, `explain.ts`, `api.test.ts`, `ErrorLessonPlayer.tsx`, `sound.ts`, `UciSession`, `verify-fase4.mts`, `validation.test.ts`, `mirror.ts`, `unitsA.test.ts`, `golden.test.ts`, `browser-engine.test.ts`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `content/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1371794871794872 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `lesson-checks.ts` to `core.ts`, `worker/srs.ts`, `package.json`, `explain.ts`, `chess-utils.ts`, `ErrorLessonPlayer.tsx`, `error-lesson.ts`, `PracticeBoard.tsx`, `review/srs.ts`, `error-lesson.test.ts`, `verify-fase4.mts`, `validation.test.ts`, `mirror.ts`, `unitsA.test.ts`, `golden.test.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `ShopScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09579100145137881 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `content/index.ts`, `mock.ts`, `vitest`, `explain.ts`, `Landing.tsx`, `error-lesson.ts`, `app.ts`, `Icon`, `navigate`, `review/srs.ts`, `ReportScreen.tsx`, `error-lesson.test.ts`, `session.ts`, `placement.ts`, `src/api.ts`, `src/types.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `useReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08456659619450317 - nodes in this community are weakly interconnected._