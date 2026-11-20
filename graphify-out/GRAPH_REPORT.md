# Graph Report - agent-a777600492e9b2b91  (2026-11-21)

## Corpus Check
- 266 files · ~273,883 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .css 13, .pgn 12, (none) 4)

## Summary
- 1817 nodes · 4999 edges · 85 communities (77 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 200 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `36a358c5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- content/index.ts
- core.ts
- chessops
- lessons.ts
- useReview.ts
- package.json
- src/types.ts
- chess-utils.ts
- lesson-checks.ts
- Landing.tsx
- error-lesson.ts
- lib.ts
- ref_node_fs
- Icon
- audit-content.ts
- auth.ts
- shared/api.ts
- src/api.ts
- session.ts
- ReportScreen.tsx
- verify-finales.mts
- App.tsx
- verify-fase4.mts
- worker/shop.ts
- error-lesson.test.ts
- mock.ts
- placement.ts
- puzzle-stats.test.ts
- sound.ts
- levels.ts
- cli.ts
- Rúbrica
- SessionScreen.tsx
- compilerOptions
- Chedex Pulse chess training platform
- worker/srs.ts
- Plan: analysis of last 10 Lichess games
- unitsA.test.ts
- GameViewer.tsx
- LessonPlayer.tsx
- ShopScreen.tsx
- Estado del proyecto (handoff document)
- Revisión pedagógica y de ajedrez · 2026-11-14
- d1-races.test.ts
- Shop and Chedex currency design
- SessionValue
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- vitest
- lib.test.ts
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- env.d.ts
- check-piece-bounds.mts
- EngineResult
- worker/shop.test.ts
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- navigate
- unitsF.test.ts
- cut-pieces.py
- credits.ts
- UciSession
- Stockfish
- Repasos espaciados y sesión diaria — diseño
- FakeWorker
- gen-strategy.mts
- completion.ts
- u16.ts
- EngineLike
- context.ts
- Auditoría automática de contenido · 2026-11-15
- unitsE.test.ts
- playLine
- review/types.ts
- corpus.ts
- theme.test.ts
- Auditoría automática de contenido · 2026-11-20
- lessonFlow.ts
- Auditoría plena 02: diseño visual, UI y accesibilidad
- Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)
- LessonPlayer
- POST /api/review/complete and cp_reviewed_games

## God Nodes (most connected - your core abstractions)
1. `vitest` - 62 edges
2. `Icon()` - 52 edges
3. `Level` - 40 edges
4. `chessops` - 37 edges
5. `navigate()` - 36 edges
6. `useSession()` - 33 edges
7. `Unit` - 32 edges
8. `react` - 31 edges
9. `Link()` - 31 edges
10. `App()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Qué sí verifiqué y cómo` --references--> `mirrorText()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → src/pedagogy/mirror.ts
- `u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`)` --references--> `themeForConcept()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/review/srs.ts
- `Importante` --references--> `sanOfUci()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → web/src/chess.ts
- `Para el constructor` --references--> `judgeBestMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → web/src/review/lessonFlow.ts
- `Crítico (enseña algo falso o da por mala una solución correcta)` --references--> `isExpected()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → worker/session.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (85 total, 8 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.11
Nodes (24): lessonsForConcept(), Unit, unit, unit, unit, unit, unit, unit (+16 more)

### Community 1 - "core.ts"
Cohesion: 0.23
Nodes (16): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, assembleMoves(), classify(), scoreToCp() (+8 more)

### Community 2 - "chessops"
Cohesion: 0.09
Nodes (33): Analizador de partidas: errores graves sin causa tipificada (2026-11-21), Diseño, Informe y entrenamiento, Límites conocidos, Medición previa (corpus guardado, sin motor), Problema, chessops, analyses (+25 more)

### Community 3 - "lessons.ts"
Cohesion: 0.14
Nodes (32): hono, LessonStatus, AppContext, createContext(), chosenLevel(), levelEffect(), loadProfile(), profileFor() (+24 more)

### Community 4 - "useReview.ts"
Cohesion: 0.06
Nodes (41): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+33 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (46): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+38 more)

### Community 6 - "src/types.ts"
Cohesion: 0.10
Nodes (29): buildValues(), capitalize(), engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover(), pawnsText() (+21 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.16
Nodes (37): Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), colorName(), Ctx, describe() (+29 more)

### Community 8 - "lesson-checks.ts"
Cohesion: 0.17
Nodes (23): CONCEPTS, Concept, CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor() (+15 more)

### Community 9 - "Landing.tsx"
Cohesion: 0.13
Nodes (27): HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing(), LessonParts(), LessonWindow(), LichessData() (+19 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.08
Nodes (52): Mini lección sin causa (`buildErrorLesson`, `kind: 'missed' | 'engine'`), after(), arrow(), buildCauseLesson(), buildErrorLesson(), buildGenericLesson(), buildPause(), capturersOn() (+44 more)

### Community 11 - "lib.ts"
Cohesion: 0.12
Nodes (21): alreadyPlayed(), Analyze, BLAME, checkSanMentions(), Claims, ES, FindingType, lintText() (+13 more)

### Community 12 - "ref_node_fs"
Cohesion: 0.08
Nodes (17): PvLine, out, pkg, root, src, require_, analyzed, DIR (+9 more)

### Community 13 - "Icon"
Cohesion: 0.14
Nodes (27): react, topWeakConcepts(), MapUnit, Numbered, numberUnits(), api, ErrorBox(), Icon() (+19 more)

### Community 14 - "audit-content.ts"
Cohesion: 0.08
Nodes (26): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+18 more)

### Community 15 - "auth.ts"
Cohesion: 0.24
Nodes (20): aesKey(), base64url(), clearedCookies(), cookieHeader(), cookieNames(), encoder, fromBase64url(), handleCallback() (+12 more)

### Community 16 - "shared/api.ts"
Cohesion: 0.12
Nodes (22): PipelineOptions, AnswerBody, CompleteLessonBody, CompleteLessonShopExtras, FinishBody, LessonProgress, LessonResponse, LevelCard (+14 more)

### Community 17 - "src/api.ts"
Cohesion: 0.18
Nodes (13): ApiError, Listener, onPaymentRequired(), onUnauthorized(), request(), setApiHandlers(), USE_MOCK, setReviewUser (+5 more)

### Community 18 - "session.ts"
Cohesion: 0.10
Nodes (38): Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL, difficultyForLevel(), MAX_PUZZLE_RATING, maxRatingForLevel() (+30 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.17
Nodes (18): Report, lessonsForConcept(), CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline(), inaccuracySentence(), inGames() (+10 more)

### Community 20 - "verify-finales.mts"
Cohesion: 0.10
Nodes (32): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Claim, CLAIMS, EXPLAIN_RESULT, CACHE_PATH, cacheProbe(), checkLine(), describeEntry() (+24 more)

### Community 21 - "App.tsx"
Cohesion: 0.09
Nodes (33): react-dom, App(), BillingScreen, CreditsScreen, LessonScreen, LevelScreen, MapScreen, PrivacyScreen (+25 more)

### Community 22 - "verify-fase4.mts"
Cohesion: 0.15
Nodes (18): expand(), FASE4, legalMoves(), matesInOne(), args, checkStep(), DEPTH, fmt() (+10 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.19
Nodes (20): ADMIN_IDS, isAdmin(), getItem(), dayOf(), yesterdayOf(), advanceStreak(), balanceOf(), buildShop() (+12 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.12
Nodes (13): ErrorLesson, HAPPENED, ALL, C, CauseKE, CONCEPT_IDS, exchangeAnswers(), gain() (+5 more)

### Community 25 - "mock.ts"
Cohesion: 0.13
Nodes (23): buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1, L2 (+15 more)

### Community 26 - "placement.ts"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzle-stats.test.ts"
Cohesion: 0.09
Nodes (17): POOL_COMBOS, { puzzles }, TestDb, fillAllBut(), { puzzles }, seed(), TestDb, MIGRATIONS_DIR (+9 more)

### Community 28 - "sound.ts"
Cohesion: 0.12
Nodes (23): throwing, countPieces(), EAGER, FILES, installUnlock(), isMuted(), listeners, load() (+15 more)

### Community 29 - "levels.ts"
Cohesion: 0.23
Nodes (10): PlacementSeen, SeenPerf, hasRating(), HINT_MIN_GAMES, levelForRating(), LevelInfo, LEVELS, PERFS (+2 more)

### Community 30 - "cli.ts"
Cohesion: 0.25
Nodes (5): args, depth, file, level, LEVELS

### Community 31 - "Rúbrica"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "SessionScreen.tsx"
Cohesion: 0.18
Nodes (17): Task 5: Pantalla «Entrenar hoy», ruleFor(), AnswerResult, SessionStart, SessionStatus, conceptName(), dueText(), errMsg() (+9 more)

### Community 33 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 34 - "Chedex Pulse chess training platform"
Cohesion: 0.16
Nodes (15): Separate educational content from GPL, Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, Chedex Pulse chess training platform (+7 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.14
Nodes (21): Foco de revisión, Repasos espaciados y sesión diaria — plan de implementación, Task 2: Datos del servidor y errores propios, Task 4: API de la sesión, Task 6: Cierre, dueAfter(), ok, completeReview() (+13 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.19
Nodes (14): Known issues to polish, EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent, Review runner, cache and useReview (+6 more)

### Community 37 - "unitsA.test.ts"
Cohesion: 0.10
Nodes (18): getLesson(), LESSONS, BoardMark, ExplainStep, PracticeStep, allMoves(), gain(), IDS (+10 more)

### Community 38 - "GameViewer.tsx"
Cohesion: 0.23
Nodes (15): moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, clamp(), fenAt(), indexBeforePly() (+7 more)

### Community 39 - "LessonPlayer.tsx"
Cohesion: 0.11
Nodes (43): applyUci(), canonicalUci(), Dests, ES_PIECES, isInCheck(), lastMoveOf(), legalDests(), needsPromotion() (+35 more)

### Community 40 - "ShopScreen.tsx"
Cohesion: 0.09
Nodes (46): Shop, ShopItem, Coin(), MiniBoard(), PieceCode, ProtectorArt(), ROLE, SAMPLE_BOARD (+38 more)

### Community 41 - "Estado del proyecto (handoff document)"
Cohesion: 0.22
Nodes (9): Estado del proyecto (handoff document), Pending work list (ordered), Phase 1: pedagogical prototype (CLI), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games) (+1 more)

### Community 42 - "Revisión pedagógica y de ajedrez · 2026-11-14"
Cohesion: 0.22
Nodes (8): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Lo que NO pude verificar, Menor, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14

### Community 43 - "d1-races.test.ts"
Cohesion: 0.07
Nodes (34): Hallazgos, Revisado y correcto (sin hallazgo), clock, lesson(), LichessMock, placementUnits, pu(), SECRET (+26 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.29
Nodes (6): Chedex currency (1 per 5 streak days), User decisions changing the founding document, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), cburnett pieces (GPLv2+)

### Community 45 - "SessionValue"
Cohesion: 0.22
Nodes (7): Equipped, Subscription, User, MockState, BillingScreen(), act(), SessionValue

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.40
Nodes (5): Decision: license whole repo GPL-3.0-or-later, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later), Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "vitest"
Cohesion: 0.10
Nodes (27): Estado tras la corrección (2026-11-14, mismo día), vitest, leaksIn(), Target, targetOf(), targetsOf(), per, rows (+19 more)

### Community 49 - "lib.test.ts"
Cohesion: 0.20
Nodes (18): add(), auditPractice(), runEngine(), sanOf(), checkMateClaim(), checkMaterialClaim(), compareSolution(), f() (+10 more)

### Community 55 - "check-piece-bounds.mts"
Cohesion: 0.13
Nodes (12): args, asJson, Box, chrome(), data, errs, LIMITS, measure() (+4 more)

### Community 57 - "worker/shop.test.ts"
Cohesion: 0.18
Nodes (13): CATALOG, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX, STREAK_DAYS_PER_CHEDEX, css, landing (+5 more)

### Community 58 - "stockfish-proc.cjs"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "Auditoría automática de contenido · 2026-11-14"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "navigate"
Cohesion: 0.18
Nodes (20): reportReviewed, emptyMessage(), navigate(), replaceSearch(), AuthScreen(), LichessLogin(), mock(), Closing() (+12 more)

### Community 61 - "unitsF.test.ts"
Cohesion: 0.22
Nodes (14): checkClaim(), Claim, describeStrategy(), load(), parseSquareName(), sq(), StrategyFacts, checkFact() (+6 more)

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "credits.ts"
Cohesion: 0.29
Nodes (9): CatalogItem, ShopKind, catalogCredits(), CREDIT_GROUP_LABEL, creditRows(), LIBRARIES, Library, ORDER (+1 more)

### Community 64 - "UciSession"
Cohesion: 0.14
Nodes (6): enginePath(), HASH_MB, UciSession, UciTransport, fake(), BrowserEngine

### Community 66 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 68 - "gen-strategy.mts"
Cohesion: 0.36
Nodes (7): build(), kind, N, pick(), rnd(), seed, sf

### Community 69 - "completion.ts"
Cohesion: 0.20
Nodes (9): ReviewPosition, CompleteReviewBody, CompleteReviewResponse, createReviewReporter(), flush(), isPermanent(), Pending, reporter (+1 more)

### Community 71 - "u16.ts"
Cohesion: 0.20
Nodes (8): c(), ClaimLike, lesson(), Row, step(), Text, U16_TEXTS, unit

### Community 72 - "EngineLike"
Cohesion: 0.13
Nodes (8): Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba, EngineLike, FakeEngine

### Community 73 - "context.ts"
Cohesion: 0.12
Nodes (16): Auditoría plena 01: código y estructura (2026-11-15), Cambios en archivos de pantalla (excepciones declaradas), Lo que NO pude verificar, Métricas, Resumen, Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor, BillingMode, SubscriptionStatus (+8 more)

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "unitsE.test.ts"
Cohesion: 0.12
Nodes (18): Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Formato y verificación (igual que u01-u06), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Regla para que una lección entre en repasos y sesión, Tercera tanda (2026-11-15): Competitivo, u12 (+10 more)

### Community 76 - "playLine"
Cohesion: 0.18
Nodes (17): buildCtx(), loadPosition(), playLine(), diagnoseMissedTactic(), EvalState, bestIsPlayable(), MoveClass, Score (+9 more)

### Community 77 - "review/types.ts"
Cohesion: 0.15
Nodes (21): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), countInaccuracies() (+13 more)

### Community 78 - "corpus.ts"
Cohesion: 0.11
Nodes (16): AuditEngine, have, JOBS, OUT, queue, sources, worker(), cpFor() (+8 more)

### Community 80 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 81 - "Auditoría automática de contenido · 2026-11-20"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-20, Aviso, Importante, Resumen

### Community 83 - "lessonFlow.ts"
Cohesion: 0.15
Nodes (14): Quinta tanda (2026-11-15): u15 torre Avanzado y u16 estrategia verificable, u15 «Finales de torre: nivel Avanzado» (`advanced`, `order` 14, `requires: ['u14']`; u12 pasa a `order` 15), u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`), canonical(), isExpectedMove(), mates(), run(), AFTER (+6 more)

### Community 87 - "Auditoría plena 02: diseño visual, UI y accesibilidad"
Cohesion: 0.22
Nodes (8): Arreglos posteriores (2026-11-15): tablero bajo la cabecera y nombre de usuario, Auditoría plena 02: diseño visual, UI y accesibilidad, Cómo se midió y qué quedó fuera del repositorio, Datos de contraste y tamaño (muestras medidas), Hallazgos, Lo que no se arregló y por qué, No verificado, Resumen

### Community 88 - "Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)"
Cohesion: 0.22
Nodes (8): Arreglo de X1 (2026-11-15): la portada ya no espera a `/api/me`, Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15), Hallazgos, Método, Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión), No verificado, Resumen, Verificación

### Community 91 - "LessonPlayer"
Cohesion: 0.23
Nodes (9): LessonPlayer(), finish(), toEval(), toExplain(), toPractice(), ResultView(), coveredHeight(), stepStartVisible() (+1 more)

### Community 93 - "POST /api/review/complete and cp_reviewed_games"
Cohesion: 0.40
Nodes (5): Phase 3: personalization (game analysis, weak points), D1 cp_* tables, CREATE IF NOT EXISTS only, Wallet ledger (cp_wallet_ledger), server-side prices, POST /api/review/complete and cp_reviewed_games, topWeakConcepts and Profile weak points section

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 582 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `chessops`, `useReview.ts`, `package.json`, `src/types.ts`, `lesson-checks.ts`, `ref_node_fs`, `Icon`, `session.ts`, `ReportScreen.tsx`, `App.tsx`, `worker/shop.ts`, `error-lesson.test.ts`, `placement.ts`, `puzzle-stats.test.ts`, `sound.ts`, `levels.ts`, `worker/srs.ts`, `unitsA.test.ts`, `GameViewer.tsx`, `LessonPlayer.tsx`, `ShopScreen.tsx`, `d1-races.test.ts`, `lib.test.ts`, `worker/shop.test.ts`, `unitsF.test.ts`, `UciSession`, `completion.ts`, `unitsE.test.ts`, `playLine`, `review/types.ts`, `theme.test.ts`, `lessonFlow.ts`, `LessonPlayer`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `content/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11081560283687943 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `chessops` to `core.ts`, `package.json`, `src/types.ts`, `chess-utils.ts`, `lesson-checks.ts`, `error-lesson.ts`, `lib.ts`, `audit-content.ts`, `session.ts`, `verify-finales.mts`, `verify-fase4.mts`, `error-lesson.test.ts`, `worker/srs.ts`, `unitsA.test.ts`, `LessonPlayer.tsx`, `vitest`, `unitsF.test.ts`, `gen-strategy.mts`, `unitsE.test.ts`, `playLine`, `corpus.ts`, `lessonFlow.ts`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `chessops` be split into smaller, more focused modules?**
  _Cohesion score 0.09230769230769231 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `content/index.ts`, `src/types.ts`, `Landing.tsx`, `error-lesson.ts`, `d1-races.test.ts`, `context.ts`, `Icon`, `SessionValue`, `vitest`, `src/api.ts`, `session.ts`, `ReportScreen.tsx`, `error-lesson.test.ts`, `mock.ts`, `levels.ts`, `cli.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `lessons.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14102564102564102 - nodes in this community are weakly interconnected._