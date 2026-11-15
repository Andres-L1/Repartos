# Graph Report - agent-a11e5d922a8375ac2  (2026-11-15)

## Corpus Check
- 209 files · ~197,006 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .pgn 12, .css 11, (none) 4)

## Summary
- 1483 nodes · 4091 edges · 78 communities (68 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 155 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `12bfc9b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- content/index.ts
- core.ts
- useReview.ts
- ShopScreen.tsx
- runner.ts
- package.json
- review-copy.ts
- chess-utils.ts
- lesson-checks.ts
- Landing.tsx
- error-lesson.ts
- lib.ts
- analysis/engine.ts
- Icon
- audit-content.ts
- auth.ts
- GameViewer.tsx
- src/api.ts
- review/srs.ts
- ReportScreen.tsx
- d1-races.test.ts
- navigate
- verify-fase4.mts
- worker/shop.ts
- src/types.ts
- app.ts
- placement.ts
- puzzles.test.ts
- db.ts
- review/types.ts
- validation.test.ts
- Rúbrica
- shared/api.ts
- compilerOptions
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan: analysis of last 10 Lichess games
- unitsA.test.ts
- api.test.ts
- SessionScreen.tsx
- Estado del proyecto (handoff document)
- Phase 1 validation report (11 sample games)
- mirror.ts
- session.ts
- Shop and Chedex currency design
- worker/shop.test.ts
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- EngineLike
- vitest
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- LessonPlayer.tsx
- UciSession
- session.tsx
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- runEngine
- createApp
- cut-pieces.py
- exercises.ts
- credits.ts
- theme.test.ts
- Repasos espaciados y sesión diaria — diseño
- browser-engine.test.ts
- EngineResult
- worker/index.ts
- completion.ts
- Lesson
- Auditor de contenido
- cache.ts
- Auditoría automática de contenido · 2026-11-15
- concepts.ts
- analyzeGame
- LevelScreen

## God Nodes (most connected - your core abstractions)
1. `createApp()` - 54 edges
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
- `Importante` --references--> `sanOfUci()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → web/src/chess.ts
- `Para el constructor` --references--> `judgeBestMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → web/src/review/lessonFlow.ts
- `Archivos` --references--> `EngineLike`  [INFERRED]
  scripts/audit/README.md → src/analysis/engine-like.ts
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

## Communities (78 total, 10 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.17
Nodes (15): Unit, unit, unit, unit, unit, unit, unit, unit (+7 more)

### Community 1 - "core.ts"
Cohesion: 0.32
Nodes (11): AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult(), ParsedGame (+3 more)

### Community 2 - "useReview.ts"
Cohesion: 0.13
Nodes (19): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+11 more)

### Community 3 - "ShopScreen.tsx"
Cohesion: 0.10
Nodes (42): ShopItem, CATALOG, ErrorBox(), MiniBoard(), PieceCode, ProtectorArt(), ROLE, SAMPLE_BOARD (+34 more)

### Community 4 - "runner.ts"
Cohesion: 0.13
Nodes (13): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, games(), mk(), setup(), AnalyzeEvent (+5 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (45): dependencies, chessground@^9.2.1, chessops@^0.14.0, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description, devDependencies (+37 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.09
Nodes (35): buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover() (+27 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.16
Nodes (36): Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), colorName(), Ctx, describe() (+28 more)

### Community 8 - "lesson-checks.ts"
Cohesion: 0.20
Nodes (23): chessops, ALL, CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor() (+15 more)

### Community 9 - "Landing.tsx"
Cohesion: 0.12
Nodes (29): OutlineUnit, LichessLogin(), Closing(), HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing() (+21 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.18
Nodes (25): findPins(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), describeMove() (+17 more)

### Community 11 - "lib.ts"
Cohesion: 0.10
Nodes (37): add(), auditPractice(), sanOf(), alreadyPlayed(), BLAME, checkMateClaim(), checkMaterialClaim(), checkSanMentions() (+29 more)

### Community 12 - "analysis/engine.ts"
Cohesion: 0.12
Nodes (13): enginePath(), PvLine, out, pkg, root, src, enginePath(), require_ (+5 more)

### Community 13 - "Icon"
Cohesion: 0.19
Nodes (26): App(), Icon(), IconName, Loading(), PATHS, Link(), SoundToggle(), DemoScreen() (+18 more)

### Community 14 - "audit-content.ts"
Cohesion: 0.08
Nodes (25): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+17 more)

### Community 15 - "auth.ts"
Cohesion: 0.20
Nodes (20): hono@^4.13.18, hono, aesKey(), AuthConfig, base64url(), cookieHeader(), cookieNames(), encoder (+12 more)

### Community 16 - "GameViewer.tsx"
Cohesion: 0.21
Nodes (16): moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, Props, clamp(), fenAt() (+8 more)

### Community 17 - "src/api.ts"
Cohesion: 0.13
Nodes (19): topWeakConcepts(), LessonProgress, MapUnit, Profile, api, ApiError, CompleteResponse, Listener (+11 more)

### Community 18 - "review/srs.ts"
Cohesion: 0.13
Nodes (22): Foco de revisión, Repasos espaciados y sesión diaria — plan de implementación, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 4: API de la sesión, Task 6: Cierre, BOX_DAYS, conceptForThemes() (+14 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.17
Nodes (20): lessonsForConcept(), buildReport(), ReportError, keyErrors(), Report, CONCEPT_PHRASE, conceptShort(), conceptTitle() (+12 more)

### Community 20 - "d1-races.test.ts"
Cohesion: 0.15
Nodes (9): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+1 more)

### Community 21 - "navigate"
Cohesion: 0.12
Nodes (27): react, handle(), applyLegacyRedirect(), currentPath(), isPlainClick(), isPrivatePath(), legacyRedirect(), listeners (+19 more)

### Community 22 - "verify-fase4.mts"
Cohesion: 0.11
Nodes (20): expand(), FASE4, legalMoves(), matesInOne(), args, checkStep(), DEPTH, fmt() (+12 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.19
Nodes (22): getItem(), loadProfile(), profileFor(), dayOf(), yesterdayOf(), advanceStreak(), balanceOf(), buildShop() (+14 more)

### Community 24 - "src/types.ts"
Cohesion: 0.09
Nodes (26): buildCtx(), loadPosition(), diagnose(), HAPPENED, ErrorType, Explanation, MoveClass, Score (+18 more)

### Community 25 - "app.ts"
Cohesion: 0.11
Nodes (22): BillingMode, LessonStatus, SubscriptionStatus, AppDeps, Ctx, Env, isInt(), ProfileRow (+14 more)

### Community 26 - "placement.ts"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzles.test.ts"
Cohesion: 0.21
Nodes (11): POOL_COMBOS, puzzleStart(), fillAllBut(), { puzzles }, seed(), TestDb, cleanupStmts(), fillPool() (+3 more)

### Community 28 - "db.ts"
Cohesion: 0.18
Nodes (5): MIGRATIONS_DIR, D1StatementLike, Db, SqlValue, Stmt

### Community 29 - "review/types.ts"
Cohesion: 0.17
Nodes (21): computeStrengths(), errorRate(), isError(), phaseOf(), studentMoves(), GameAnalysis, KeyError, Phase (+13 more)

### Community 30 - "validation.test.ts"
Cohesion: 0.12
Nodes (16): args, depth, file, level, LEVELS, trainFromMoves(), trainFromPgn(), TrainingItem (+8 more)

### Community 31 - "Rúbrica"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "shared/api.ts"
Cohesion: 0.05
Nodes (57): PipelineOptions, AnswerBody, CompleteLessonBody, CompleteLessonShopExtras, CompleteReviewResponse, Equipped, FinishBody, LessonResponse (+49 more)

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

### Community 37 - "unitsA.test.ts"
Cohesion: 0.11
Nodes (18): getLesson(), LESSONS, BoardMark, ExplainStep, PracticeStep, allMoves(), gain(), IDS (+10 more)

### Community 38 - "api.test.ts"
Cohesion: 0.14
Nodes (16): clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup(), units (+8 more)

### Community 39 - "SessionScreen.tsx"
Cohesion: 0.05
Nodes (84): Task 5: Pantalla «Entrenar hoy», chessground, ErrorLesson, AnswerResult, FinishResult, SessionStart, SessionStatus, canonical() (+76 more)

### Community 40 - "Estado del proyecto (handoff document)"
Cohesion: 0.25
Nodes (8): Chedex currency (1 per 5 streak days), Estado del proyecto (handoff document), Pending work list (ordered), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, User decisions changing the founding document, Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 41 - "Phase 1 validation report (11 sample games)"
Cohesion: 0.40
Nodes (5): Phase 1: pedagogical prototype (CLI), Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games), Pedagogical trainer (PGN, Stockfish, diagnosis)

### Community 42 - "mirror.ts"
Cohesion: 0.16
Nodes (17): Crítico (enseña algo falso o da por mala una solución correcta), Estado tras la corrección (2026-11-14, mismo día), Hallazgos, Importante, Lo que NO pude verificar, Menor, Qué sí verifiqué y cómo, Resumen (+9 more)

### Community 43 - "session.ts"
Cohesion: 0.19
Nodes (17): SessionItem, altFor(), answerItem(), dueConcepts(), evaluate(), isExpected(), ItemRow, nextDueAt() (+9 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.25
Nodes (7): D1 cp_* tables, CREATE IF NOT EXISTS only, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), Wallet ledger (cp_wallet_ledger), server-side prices, cburnett pieces (GPLv2+), Chedex own visual material (GPL-3.0-or-later)

### Community 45 - "worker/shop.test.ts"
Cohesion: 0.18
Nodes (12): DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX, STREAK_DAYS_PER_CHEDEX, css, landing, advance() (+4 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.32
Nodes (7): Separate educational content from GPL, Decision: license whole repo GPL-3.0-or-later, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, src/content reserved educational content notice, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 49 - "vitest"
Cohesion: 0.18
Nodes (10): Punto de partida (comprobado en el código), Tercera tanda (2026-11-15): Competitivo, u12, vitest, UNITS, CALCULATION, ENGINE, UNITS_D, content (+2 more)

### Community 55 - "LessonPlayer.tsx"
Cohesion: 0.24
Nodes (9): LessonPlayer(), finish(), toEval(), toExplain(), toPractice(), Phase, ResultView(), STAGES (+1 more)

### Community 56 - "UciSession"
Cohesion: 0.22
Nodes (3): UciSession, fake(), BrowserEngine

### Community 57 - "session.tsx"
Cohesion: 0.21
Nodes (7): Shop, setApiHandlers(), equip(), Ctx, SessionProvider(), DEFAULT_EQUIPPED, sanitizeEquipped()

### Community 58 - "stockfish-proc.cjs"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "Auditoría automática de contenido · 2026-11-14"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 61 - "createApp"
Cohesion: 0.26
Nodes (11): createApp(), chosenLevel(), lessonAccess(), levelEffect(), levelInfoFor(), progressMap(), HttpError, isObj() (+3 more)

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "exercises.ts"
Cohesion: 0.29
Nodes (7): EXERCISES, LEVEL_ORDER, priority(), recommend(), Exercise, idx(), LEVELS

### Community 64 - "credits.ts"
Cohesion: 0.29
Nodes (9): CatalogItem, ShopKind, catalogCredits(), CREDIT_GROUP_LABEL, creditRows(), LIBRARIES, Library, ORDER (+1 more)

### Community 65 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 66 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 69 - "worker/index.ts"
Cohesion: 0.38
Nodes (7): parseBillingMode(), d1Db(), D1Like, appFor(), Env, fetch(), scheduled()

### Community 70 - "completion.ts"
Cohesion: 0.33
Nodes (7): ReviewPosition, CompleteReviewBody, flush(), Pending, pending, reportReviewed(), save()

### Community 71 - "Lesson"
Cohesion: 0.25
Nodes (7): Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Formato y verificación (igual que u01-u06), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Regla para que una lección entre en repasos y sesión, Lesson

### Community 72 - "Auditor de contenido"
Cohesion: 0.25
Nodes (7): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba

### Community 73 - "cache.ts"
Cohesion: 0.32
Nodes (4): AnalysisStore, indexedDbStore(), memoryStore(), openDb()

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "concepts.ts"
Cohesion: 0.40
Nodes (4): CONCEPTS, Concept, KNOWN_PLACEHOLDERS, LEVELS

### Community 77 - "LevelScreen"
Cohesion: 0.67
Nodes (4): LevelScreen(), confirm(), move(), onKey()

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 444 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `useReview.ts`, `ShopScreen.tsx`, `runner.ts`, `package.json`, `review-copy.ts`, `lesson-checks.ts`, `lib.ts`, `analysis/engine.ts`, `GameViewer.tsx`, `src/api.ts`, `review/srs.ts`, `ReportScreen.tsx`, `d1-races.test.ts`, `navigate`, `src/types.ts`, `placement.ts`, `puzzles.test.ts`, `review/types.ts`, `validation.test.ts`, `shared/api.ts`, `worker/srs.ts`, `unitsA.test.ts`, `api.test.ts`, `SessionScreen.tsx`, `mirror.ts`, `worker/shop.test.ts`, `UciSession`, `exercises.ts`, `theme.test.ts`, `browser-engine.test.ts`, `concepts.ts`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `lesson-checks.ts` to `core.ts`, `worker/srs.ts`, `package.json`, `review-copy.ts`, `chess-utils.ts`, `SessionScreen.tsx`, `unitsA.test.ts`, `error-lesson.ts`, `lib.ts`, `mirror.ts`, `audit-content.ts`, `review/srs.ts`, `verify-fase4.mts`, `src/types.ts`, `validation.test.ts`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `ShopScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09959183673469388 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `content/index.ts`, `review-copy.ts`, `Landing.tsx`, `error-lesson.ts`, `concepts.ts`, `session.ts`, `Icon`, `src/api.ts`, `review/srs.ts`, `ReportScreen.tsx`, `vitest`, `app.ts`, `src/types.ts`, `session.tsx`, `placement.ts`, `validation.test.ts`, `exercises.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._