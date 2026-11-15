# Graph Report - agent-ac86cfaa4317451ec  (2026-11-15)

## Corpus Check
- 208 files · ~188,921 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .pgn 12, .css 11, (none) 4)

## Summary
- 1472 nodes · 4067 edges · 64 communities (56 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba7b5567`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- vitest
- core.ts
- games.test.ts
- ShopScreen.tsx
- useReview.ts
- devDependencies
- review-copy.ts
- chess-utils.ts
- lesson-checks.ts
- Landing.tsx
- error-lesson.ts
- audit-content.ts
- EngineResult
- Icon
- ReviewScreen.tsx
- auth.ts
- ReviewGameScreen.tsx
- src/api.ts
- session.ts
- ReportScreen.tsx
- d1-races.test.ts
- App.tsx
- shared/api.ts
- app.ts
- error-lesson.test.ts
- levels.ts
- placement.ts
- puzzles.test.ts
- D1StatementLike
- src/types.ts
- ref_node_fs
- Rúbrica
- mock.ts
- compilerOptions
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan: analysis of last 10 Lichess games
- package.json
- api.test.ts
- ErrorLessonPlayer.tsx
- Estado del proyecto (handoff document)
- Phase 1 validation report (11 sample games)
- dependencies
- scripts
- Shop and Chedex currency design
- sound.ts
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- EngineLike
- ref_node_url
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- LessonPlayer.tsx
- UciSession
- copy-engine.mjs
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- AuditEngine
- cut-pieces.py
- mate_threat.ts
- browser-engine.test.ts

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
- `Restricciones globales` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/plans/2026-11-13-repasos-y-sesion-diaria.md → src/analysis/pgn.ts
- `Task 1: Calendario y puzles (módulo puro)` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/plans/2026-11-13-repasos-y-sesion-diaria.md → src/analysis/pgn.ts
- `Aclaraciones tras la revisión del constructor` --references--> `parseGame()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → src/analysis/pgn.ts
- `Archivos` --references--> `UciSession`  [INFERRED]
  scripts/audit/README.md → src/analysis/uci.ts
- `Estado tras la corrección (2026-11-14, mismo día)` --references--> `PracticeStep`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → src/content/schema.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (64 total, 8 thin omitted)

### Community 0 - "vitest"
Cohesion: 0.06
Nodes (46): Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Formato y verificación (igual que u01-u06), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Regla para que una lección entre en repasos y sesión, Tercera tanda (2026-11-15): Competitivo, u12 (+38 more)

### Community 1 - "core.ts"
Cohesion: 0.27
Nodes (13): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult() (+5 more)

### Community 2 - "games.test.ts"
Cohesion: 0.20
Nodes (14): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+6 more)

### Community 3 - "ShopScreen.tsx"
Cohesion: 0.06
Nodes (59): ShopItem, CATALOG, CatalogItem, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX, ShopKind (+51 more)

### Community 4 - "useReview.ts"
Cohesion: 0.08
Nodes (26): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, GameAnalysis, ReviewGame, games(), mk() (+18 more)

### Community 5 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, @types/node@^22.0.0, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@^5.6.0, vitest@^5.1.0, wrangler@^4.161.0, @types/node (+4 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.11
Nodes (32): buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover() (+24 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.20
Nodes (29): Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), Ctx, describe(), DIAG (+21 more)

### Community 8 - "lesson-checks.ts"
Cohesion: 0.05
Nodes (62): Estado tras la corrección (2026-11-14, mismo día), Lo que NO pude verificar, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14, chessops, args, checkStep() (+54 more)

### Community 9 - "Landing.tsx"
Cohesion: 0.10
Nodes (43): OutlineUnit, App(), Coin(), navigate(), replaceSearch(), AuthScreen(), LichessLogin(), mock() (+35 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.18
Nodes (25): findPins(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), describeMove() (+17 more)

### Community 11 - "audit-content.ts"
Cohesion: 0.06
Nodes (63): add(), argv, auditPractice(), count, cursors, date, depth, DISCLAIMER (+55 more)

### Community 12 - "EngineResult"
Cohesion: 0.28
Nodes (6): PvLine, enginePath(), EngineResult, require_, HASH_MB, Score

### Community 13 - "Icon"
Cohesion: 0.11
Nodes (35): Lesson, topWeakConcepts(), MapUnit, api, ApiError, PROMO_ROLES, ErrorBox(), Icon() (+27 more)

### Community 14 - "ReviewScreen.tsx"
Cohesion: 0.29
Nodes (9): useReview(), Failure, failureOf(), GameRow(), Panel(), RateLimited(), RESULT_LABEL, ReviewScreen() (+1 more)

### Community 15 - "auth.ts"
Cohesion: 0.24
Nodes (19): aesKey(), AuthConfig, base64url(), cookieHeader(), cookieNames(), encoder, fromBase64url(), handleCallback() (+11 more)

### Community 16 - "ReviewGameScreen.tsx"
Cohesion: 0.15
Nodes (22): keyErrors(), moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, flush(), pending (+14 more)

### Community 17 - "src/api.ts"
Cohesion: 0.11
Nodes (24): Equipped, LessonProgress, Profile, Shop, Subscription, User, CompleteResponse, Listener (+16 more)

### Community 18 - "session.ts"
Cohesion: 0.08
Nodes (44): Foco de revisión, Repasos espaciados y sesión diaria — plan de implementación, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 5: Pantalla «Entrenar hoy», Task 6: Cierre, BOX_DAYS, conceptForThemes() (+36 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.17
Nodes (19): lessonsForConcept(), buildReport(), ReportError, Report, CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline() (+11 more)

### Community 20 - "d1-races.test.ts"
Cohesion: 0.12
Nodes (17): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+9 more)

### Community 21 - "App.tsx"
Cohesion: 0.13
Nodes (19): react, handle(), catalogCredits(), creditRows(), applyLegacyRedirect(), currentPath(), isPlainClick(), isPrivatePath() (+11 more)

### Community 22 - "shared/api.ts"
Cohesion: 0.13
Nodes (18): AnswerBody, CompleteLessonBody, CompleteLessonShopExtras, CompleteReviewResponse, FinishBody, LessonResponse, LevelCard, LevelInfo (+10 more)

### Community 23 - "app.ts"
Cohesion: 0.09
Nodes (50): BillingMode, LessonStatus, getItem(), AppDeps, createApp(), chosenLevel(), lessonAccess(), levelEffect() (+42 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.12
Nodes (18): buildCtx(), loadPosition(), playLine(), HAPPENED, MoveClass, mk(), Opts, ALL (+10 more)

### Community 25 - "levels.ts"
Cohesion: 0.26
Nodes (9): PlacementSeen, SeenPerf, hasRating(), HINT_MIN_GAMES, levelForRating(), LEVELS, PERFS, suggestLevel() (+1 more)

### Community 26 - "placement.ts"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzles.test.ts"
Cohesion: 0.22
Nodes (10): POOL_COMBOS, fillAllBut(), { puzzles }, seed(), TestDb, cleanupStmts(), fillPool(), refill() (+2 more)

### Community 29 - "src/types.ts"
Cohesion: 0.15
Nodes (22): computeStrengths(), errorRate(), isError(), phaseOf(), studentMoves(), KeyError, Phase, Strength (+14 more)

### Community 30 - "ref_node_fs"
Cohesion: 0.06
Nodes (35): args, depth, file, level, LEVELS, diagnose(), recommend(), trainFromMoves() (+27 more)

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
Nodes (21): Task 2: Datos del servidor y errores propios, Task 4: API de la sesión, dueAfter(), ReviewPosition, CompleteReviewBody, MIGRATIONS_DIR, ok, Pending (+13 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.17
Nodes (17): Known issues to polish, Phase 3: personalization (game analysis, weak points), EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent (+9 more)

### Community 37 - "package.json"
Cohesion: 0.18
Nodes (10): description, tsx@^4.19.0, engines, node, license, name, private, type (+2 more)

### Community 38 - "api.test.ts"
Cohesion: 0.11
Nodes (18): SubscriptionStatus, clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup() (+10 more)

### Community 39 - "ErrorLessonPlayer.tsx"
Cohesion: 0.07
Nodes (52): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Menor, Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención (+44 more)

### Community 40 - "Estado del proyecto (handoff document)"
Cohesion: 0.25
Nodes (8): Chedex currency (1 per 5 streak days), Estado del proyecto (handoff document), Pending work list (ordered), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, User decisions changing the founding document, Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 41 - "Phase 1 validation report (11 sample games)"
Cohesion: 0.40
Nodes (5): Phase 1: pedagogical prototype (CLI), Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games), Pedagogical trainer (PGN, Stockfish, diagnosis)

### Community 42 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, chessground (+3 more)

### Community 43 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, audit:content, build, build:web, chedex, db:migrate:local, dev, dev:web (+2 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.25
Nodes (7): D1 cp_* tables, CREATE IF NOT EXISTS only, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), Wallet ledger (cp_wallet_ledger), server-side prices, cburnett pieces (GPLv2+), Chedex own visual material (GPL-3.0-or-later)

### Community 45 - "sound.ts"
Cohesion: 0.13
Nodes (20): throwing, SoundToggle(), countPieces(), FILES, installUnlock(), isMuted(), listeners, moveSoundOf() (+12 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.32
Nodes (7): Separate educational content from GPL, Decision: license whole repo GPL-3.0-or-later, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, src/content reserved educational content notice, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "EngineLike"
Cohesion: 0.10
Nodes (9): Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba, EngineLike, FakeEngine (+1 more)

### Community 49 - "ref_node_url"
Cohesion: 0.29
Nodes (5): vite@^8.3.8, @vitejs/plugin-react@^6.3.0, vite, @vitejs/plugin-react, root

### Community 55 - "LessonPlayer.tsx"
Cohesion: 0.16
Nodes (23): BoardMark, PracticeStep, turnOf(), Board(), marksToShapes(), Props, ExplainStepView(), LessonPlayer() (+15 more)

### Community 56 - "UciSession"
Cohesion: 0.16
Nodes (5): enginePath(), UciSession, UciTransport, fake(), BrowserEngine

### Community 57 - "copy-engine.mjs"
Cohesion: 0.40
Nodes (4): out, pkg, root, src

### Community 58 - "stockfish-proc.cjs"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "Auditoría automática de contenido · 2026-11-14"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 66 - "mate_threat.ts"
Cohesion: 0.48
Nodes (6): colorName(), Step, favors(), firstMateIndex(), mateThreat(), plural()

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 439 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `core.ts`, `games.test.ts`, `ShopScreen.tsx`, `useReview.ts`, `devDependencies`, `lesson-checks.ts`, `audit-content.ts`, `Icon`, `ReviewGameScreen.tsx`, `session.ts`, `ReportScreen.tsx`, `d1-races.test.ts`, `App.tsx`, `error-lesson.test.ts`, `levels.ts`, `placement.ts`, `puzzles.test.ts`, `src/types.ts`, `ref_node_fs`, `worker/srs.ts`, `package.json`, `api.test.ts`, `ErrorLessonPlayer.tsx`, `sound.ts`, `UciSession`, `browser-engine.test.ts`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `vitest` be split into smaller, more focused modules?**
  _Cohesion score 0.06034801925212884 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `lesson-checks.ts` to `vitest`, `core.ts`, `worker/srs.ts`, `package.json`, `review-copy.ts`, `chess-utils.ts`, `ErrorLessonPlayer.tsx`, `dependencies`, `audit-content.ts`, `error-lesson.ts`, `session.ts`, `error-lesson.test.ts`, `ref_node_fs`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `ShopScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06259780907668232 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `vitest`, `mock.ts`, `review-copy.ts`, `lesson-checks.ts`, `Landing.tsx`, `error-lesson.ts`, `Icon`, `src/api.ts`, `session.ts`, `ReportScreen.tsx`, `app.ts`, `error-lesson.test.ts`, `levels.ts`, `placement.ts`, `src/types.ts`, `ref_node_fs`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `useReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08350951374207188 - nodes in this community are weakly interconnected._