# Graph Report - LUDEX  (2026-11-14)

## Corpus Check
- 184 files · ~143,322 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .pgn 12, .css 11, (none) 3)

## Summary
- 1278 nodes · 3636 edges · 63 communities (56 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 124 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dfc757c3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Tests de contenido y temario
- Motor y analisis de partidas
- games.test.ts
- Tienda y moneda Chedex
- Ejecucion del analisis en el cliente
- Configuracion y dependencias
- review-copy.ts
- Reglas de diagnostico
- ref_node_fs
- Landing
- Mini leccion del error
- Servidor Hono y progreso
- PracticeBoard.tsx
- Icon
- ReviewScreen.tsx
- Acceso con Lichess
- Repaso de partida y visor
- App.tsx
- review/srs.ts
- ReportScreen.tsx
- d1-races.test.ts
- router.ts
- shared/api.ts
- worker/shop.ts
- Tests de la mini leccion
- session.ts
- Colocacion por Elo (antigua)
- puzzles.test.ts
- D1StatementLike
- review/types.ts
- src/types.ts
- SessionScreen.tsx
- worker/shop.ts
- Configuracion TypeScript
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan del analisis de partidas
- worker/index.ts
- api.test.ts
- ErrorLessonPlayer.tsx
- Estado del proyecto (handoff document)
- Phase 1 validation report (11 sample games)
- Repasos espaciados y sesión diaria — diseño
- completion.ts
- Diseno de la tienda
- sound.ts
- Decision: license whole repo GPL-3.0-or-later
- Plan de nivel y puntos debiles
- runner.ts
- LessonPlayer
- Reglas de graphify
- Fuente DM Sans
- Licencias hono y react
- LessonPlayer.tsx
- exercises.ts
- theme.test.ts
- chessops
- mirror.ts
- session.test.ts
- LevelScreen
- Repasos espaciados y sesión diaria — plan de implementación

## God Nodes (most connected - your core abstractions)
1. `createApp()` - 54 edges
2. `Icon()` - 52 edges
3. `vitest` - 44 edges
4. `Level` - 40 edges
5. `navigate()` - 37 edges
6. `useSession()` - 32 edges
7. `Link()` - 31 edges
8. `react` - 29 edges
9. `App()` - 28 edges
10. `Board()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Para el constructor` --references--> `judgeBestMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → web/src/review/lessonFlow.ts
- `Task 5: Pantalla «Entrenar hoy»` --references--> `sessionStatus()`  [INFERRED]
  docs/superpowers/plans/2026-11-13-repasos-y-sesion-diaria.md → worker/session.ts
- `Restricciones globales` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/plans/2026-11-13-repasos-y-sesion-diaria.md → src/analysis/pgn.ts
- `Task 1: Calendario y puzles (módulo puro)` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/plans/2026-11-13-repasos-y-sesion-diaria.md → src/analysis/pgn.ts
- `Aclaraciones tras la revisión del constructor` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → src/analysis/pgn.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (63 total, 7 thin omitted)

### Community 0 - "Tests de contenido y temario"
Cohesion: 0.06
Nodes (49): getLesson(), LESSONS, BoardMark, ExplainStep, Lesson, PracticeStep, Unit, unit (+41 more)

### Community 1 - "Motor y analisis de partidas"
Cohesion: 0.06
Nodes (27): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult() (+19 more)

### Community 2 - "games.test.ts"
Cohesion: 0.19
Nodes (15): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+7 more)

### Community 3 - "Tienda y moneda Chedex"
Cohesion: 0.09
Nodes (47): Shop, ShopItem, ResultView(), Coin(), MiniBoard(), PieceCode, ProtectorArt(), ROLE (+39 more)

### Community 4 - "Ejecucion del analisis en el cliente"
Cohesion: 0.13
Nodes (13): GameAnalysis, ReviewGame, AnalysisStore, indexedDbStore(), memoryStore(), openDb(), LoadedGames, ReviewRunner (+5 more)

### Community 5 - "Configuracion y dependencias"
Cohesion: 0.05
Nodes (46): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+38 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.11
Nodes (31): buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover() (+23 more)

### Community 7 - "Reglas de diagnostico"
Cohesion: 0.16
Nodes (36): Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), colorName(), Ctx, describe() (+28 more)

### Community 8 - "ref_node_fs"
Cohesion: 0.18
Nodes (7): out, pkg, root, src, collect(), root, targets

### Community 9 - "Landing"
Cohesion: 0.12
Nodes (28): DemoScreen(), HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing(), LessonWindow(), LichessData() (+20 more)

### Community 10 - "Mini leccion del error"
Cohesion: 0.18
Nodes (25): loadPosition(), playLine(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor() (+17 more)

### Community 11 - "Servidor Hono y progreso"
Cohesion: 0.10
Nodes (32): BillingMode, SubscriptionStatus, AppDeps, createApp(), chosenLevel(), lessonAccess(), levelEffect(), levelInfoFor() (+24 more)

### Community 12 - "PracticeBoard.tsx"
Cohesion: 0.22
Nodes (19): applyUci(), canonicalUci(), Dests, ES_PIECES, lastMoveOf(), legalDests(), needsPromotion(), parseTypedMove() (+11 more)

### Community 13 - "Icon"
Cohesion: 0.16
Nodes (22): react, topWeakConcepts(), LessonStatus, MapLesson, LEVELS, ErrorBox(), Icon(), IconName (+14 more)

### Community 14 - "ReviewScreen.tsx"
Cohesion: 0.31
Nodes (8): Failure, failureOf(), GameRow(), Panel(), RateLimited(), RESULT_LABEL, ReviewScreen(), SPEED_LABEL

### Community 15 - "Acceso con Lichess"
Cohesion: 0.24
Nodes (19): aesKey(), AuthConfig, base64url(), cookieHeader(), cookieNames(), encoder, fromBase64url(), handleCallback() (+11 more)

### Community 16 - "Repaso de partida y visor"
Cohesion: 0.21
Nodes (16): moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, Props, clamp(), fenAt() (+8 more)

### Community 17 - "App.tsx"
Cohesion: 0.17
Nodes (20): USE_MOCK, App(), Link(), handle(), catalogCredits(), creditRows(), isPlainClick(), navigate() (+12 more)

### Community 18 - "review/srs.ts"
Cohesion: 0.16
Nodes (22): Foco de revisión, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 4: API de la sesión, Task 6: Cierre, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL (+14 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.20
Nodes (17): lessonsForConcept(), Report, CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline(), inGames(), NO_STRENGTHS (+9 more)

### Community 20 - "d1-races.test.ts"
Cohesion: 0.15
Nodes (10): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+2 more)

### Community 21 - "router.ts"
Cohesion: 0.20
Nodes (11): applyLegacyRedirect(), currentPath(), isPrivatePath(), legacyRedirect(), listeners, normalizePath(), PRIVATE_PREFIXES, RENAMED (+3 more)

### Community 22 - "shared/api.ts"
Cohesion: 0.10
Nodes (36): AnswerBody, CompleteLessonBody, CompleteLessonShopExtras, CompleteReviewResponse, Equipped, FinishBody, LessonProgress, LessonResponse (+28 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.18
Nodes (22): getItem(), loadProfile(), profileFor(), dayOf(), yesterdayOf(), advanceStreak(), balanceOf(), buildShop() (+14 more)

### Community 24 - "Tests de la mini leccion"
Cohesion: 0.10
Nodes (19): buildCtx(), diagnose(), HAPPENED, ALL, C, Case, CONCEPT_IDS, exchangeAnswers() (+11 more)

### Community 25 - "session.ts"
Cohesion: 0.17
Nodes (19): SessionItem, answerItem(), canonical(), dueConcepts(), evaluate(), isExpected(), ItemRow, mates() (+11 more)

### Community 26 - "Colocacion por Elo (antigua)"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzles.test.ts"
Cohesion: 0.15
Nodes (14): POOL_COMBOS, fillAllBut(), { puzzles }, seed(), TestDb, MIGRATIONS_DIR, Db, SqlValue (+6 more)

### Community 29 - "review/types.ts"
Cohesion: 0.26
Nodes (11): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), keyErrors() (+3 more)

### Community 30 - "src/types.ts"
Cohesion: 0.10
Nodes (26): args, depth, file, level, LEVELS, trainFromMoves(), PipelineOptions, trainFromPgn() (+18 more)

### Community 31 - "SessionScreen.tsx"
Cohesion: 0.17
Nodes (22): Task 5: Pantalla «Entrenar hoy», ruleFor(), AnswerResult, FinishResult, SessionStart, SessionStatus, conceptName(), dueText() (+14 more)

### Community 32 - "worker/shop.ts"
Cohesion: 0.05
Nodes (50): vitest, PlacementSeen, SeenPerf, hasRating(), HINT_MIN_GAMES, levelForRating(), LevelInfo, PERFS (+42 more)

### Community 33 - "Configuracion TypeScript"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, noUncheckedIndexedAccess, resolveJsonModule (+5 more)

### Community 34 - "Phase 2 architecture (web, Hono Worker, D1)"
Cohesion: 0.28
Nodes (9): Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Chedex Pulse chess training platform, Learning path (units and lessons, 0-800 Elo), Lichess OAuth PKCE login, Repository structure (web, worker, migrations, src, docs) (+1 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.21
Nodes (15): Task 2: Datos del servidor y errores propios, ReviewPosition, CompleteReviewBody, ok, Pending, completeReview(), MAX_REVIEW_CONCEPTS, parseCompleteReview() (+7 more)

### Community 36 - "Plan del analisis de partidas"
Cohesion: 0.17
Nodes (17): Known issues to polish, Phase 3: personalization (game analysis, weak points), EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent (+9 more)

### Community 37 - "worker/index.ts"
Cohesion: 0.33
Nodes (8): UNITS, parseBillingMode(), d1Db(), D1Like, appFor(), Env, fetch(), scheduled()

### Community 38 - "api.test.ts"
Cohesion: 0.20
Nodes (7): clock, lesson(), LichessMock, placementUnits, pu(), SECRET, units

### Community 39 - "ErrorLessonPlayer.tsx"
Cohesion: 0.15
Nodes (18): chessground, ErrorLesson, run(), BestPhase, ErrorLessonPlayer(), onBestMove(), MOMENTS, Props (+10 more)

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
Cohesion: 0.39
Nodes (6): flush(), pending, reportReviewed(), save(), ReviewGameScreen(), finish()

### Community 44 - "Diseno de la tienda"
Cohesion: 0.25
Nodes (7): D1 cp_* tables, CREATE IF NOT EXISTS only, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), Wallet ledger (cp_wallet_ledger), server-side prices, cburnett pieces (GPLv2+), Chedex own visual material (GPL-3.0-or-later)

### Community 45 - "sound.ts"
Cohesion: 0.13
Nodes (19): throwing, countPieces(), FILES, installUnlock(), isMuted(), listeners, moveSoundOf(), MUTE_KEY (+11 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.32
Nodes (7): Separate educational content from GPL, Decision: license whole repo GPL-3.0-or-later, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, src/content reserved educational content notice, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later)

### Community 47 - "Plan de nivel y puntos debiles"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "runner.ts"
Cohesion: 0.17
Nodes (12): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, games(), mk(), setup(), AnalyzeEvent (+4 more)

### Community 49 - "LessonPlayer"
Cohesion: 0.53
Nodes (5): LessonPlayer(), finish(), toEval(), toExplain(), toPractice()

### Community 55 - "LessonPlayer.tsx"
Cohesion: 0.30
Nodes (12): isInCheck(), turnOf(), Board(), marksToShapes(), Props, ExplainStepView(), Phase, STAGES (+4 more)

### Community 56 - "exercises.ts"
Cohesion: 0.29
Nodes (6): EXERCISES, LEVEL_ORDER, priority(), recommend(), Exercise, LEVELS

### Community 57 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 58 - "chessops"
Cohesion: 0.22
Nodes (9): chessops, CLEAN, DIR, failures, files, load(), positionsOf(), results (+1 more)

### Community 59 - "mirror.ts"
Cohesion: 0.44
Nodes (8): COLOR, flipRank(), mirrorExercise(), mirrorFen(), mirrorText(), mirrorUci(), swapCase(), BANK

### Community 60 - "session.test.ts"
Cohesion: 0.39
Nodes (7): setup(), { puzzles }, SECRET, setup(), setup(), openTestDb(), devBilling()

### Community 61 - "LevelScreen"
Cohesion: 0.50
Nodes (4): LevelScreen(), confirm(), move(), onKey()

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 356 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `worker/shop.ts` to `Tests de contenido y temario`, `Motor y analisis de partidas`, `games.test.ts`, `Tienda y moneda Chedex`, `Configuracion y dependencias`, `ref_node_fs`, `PracticeBoard.tsx`, `Icon`, `Repaso de partida y visor`, `review/srs.ts`, `ReportScreen.tsx`, `d1-races.test.ts`, `router.ts`, `Tests de la mini leccion`, `Colocacion por Elo (antigua)`, `puzzles.test.ts`, `src/types.ts`, `worker/srs.ts`, `api.test.ts`, `ErrorLessonPlayer.tsx`, `sound.ts`, `runner.ts`, `exercises.ts`, `theme.test.ts`, `chessops`, `mirror.ts`, `session.test.ts`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tests de contenido y temario` be split into smaller, more focused modules?**
  _Cohesion score 0.0594679186228482 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `Tests de contenido y temario`, `worker/shop.ts`, `review-copy.ts`, `Landing`, `Mini leccion del error`, `Servidor Hono y progreso`, `Icon`, `review/srs.ts`, `ReportScreen.tsx`, `session.ts`, `exercises.ts`, `Tests de la mini leccion`, `Colocacion por Elo (antigua)`, `LevelScreen`, `src/types.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `Motor y analisis de partidas` be split into smaller, more focused modules?**
  _Cohesion score 0.06430745814307458 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `chessops` to `Tests de contenido y temario`, `Motor y analisis de partidas`, `worker/srs.ts`, `Configuracion y dependencias`, `review-copy.ts`, `Reglas de diagnostico`, `Mini leccion del error`, `PracticeBoard.tsx`, `review/srs.ts`, `Tests de la mini leccion`, `session.ts`, `mirror.ts`, `src/types.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `Tienda y moneda Chedex` be split into smaller, more focused modules?**
  _Cohesion score 0.08834586466165413 - nodes in this community are weakly interconnected._