# Graph Report - agent-ade82c4365d120b48  (2026-11-21)

## Corpus Check
- 254 files · ~276,832 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .pgn 12, .css 12, (none) 4)

## Summary
- 1745 nodes · 4771 edges · 95 communities (86 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 185 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8cca054`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- content/index.ts
- core.ts
- games.test.ts
- lessons.ts
- runner.ts
- package.json
- review-copy.ts
- chess-utils.ts
- lesson-checks.ts
- Landing.tsx
- error-lesson.ts
- lib.ts
- ref_node_fs
- Icon
- audit-content.ts
- api.test.ts
- shared/api.ts
- src/api.ts
- ErrorLessonPlayer.tsx
- ReportScreen.tsx
- tablebase.ts
- router.ts
- verify-fase4.mts
- worker/shop.ts
- error-lesson.test.ts
- mock.ts
- placement.ts
- puzzle-stats.test.ts
- D1StatementLike
- levels.ts
- validation.test.ts
- Rúbrica
- SessionScreen.tsx
- compilerOptions
- Chedex Pulse chess training platform
- worker/srs.ts
- Plan: analysis of last 10 Lichess games
- unitsA.test.ts
- GameViewer.tsx
- sound.ts
- ShopScreen.tsx
- Estado del proyecto (handoff document)
- Revisión pedagógica y de ajedrez · 2026-11-14
- src/types.ts
- Shop and Chedex currency design
- App.tsx
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- mirror.ts
- auditPractice
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- env.d.ts
- check-piece-bounds.mts
- EngineResult
- Repasos espaciados y sesión diaria — plan de implementación
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- Board.tsx
- chessops
- cut-pieces.py
- GameAnalysis
- UciSession
- PracticeBoard
- Repasos espaciados y sesión diaria — diseño
- FakeWorker
- Stockfish
- completion.ts
- d1-races.test.ts
- Lesson
- EngineLike
- context.ts
- Auditoría automática de contenido · 2026-11-15
- unitsE.test.ts
- useReview.ts
- review/types.ts
- runEngine
- credits.ts
- theme.test.ts
- Auditoría automática de contenido · 2026-11-20
- hint-leaks.ts
- session.ts
- AnalyzedMove
- vitest
- cli.ts
- Auditoría plena 02: diseño visual, UI y accesibilidad
- Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)
- recommend.ts
- mate_threat.ts
- LessonPlayer.tsx
- LevelScreen
- POST /api/review/complete and cp_reviewed_games
- TypedMove

## God Nodes (most connected - your core abstractions)
1. `vitest` - 60 edges
2. `Icon()` - 52 edges
3. `Level` - 40 edges
4. `navigate()` - 36 edges
5. `chessops` - 35 edges
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
- `Punto de partida (comprobado en el código)` --references--> `levelPlan()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → worker/level.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (95 total, 9 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.11
Nodes (23): lessonsForConcept(), UNITS, Unit, unit, unit, unit, unit, unit (+15 more)

### Community 1 - "core.ts"
Cohesion: 0.23
Nodes (15): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, classify(), scoreToCp(), terminalResult() (+7 more)

### Community 2 - "games.test.ts"
Cohesion: 0.19
Nodes (15): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+7 more)

### Community 3 - "lessons.ts"
Cohesion: 0.15
Nodes (35): Hallazgos, hono, AppContext, createContext(), chosenLevel(), levelEffect(), loadProfile(), profileFor() (+27 more)

### Community 4 - "runner.ts"
Cohesion: 0.17
Nodes (12): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, games(), mk(), setup(), AnalyzeEvent (+4 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (46): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+38 more)

### Community 6 - "review-copy.ts"
Cohesion: 0.13
Nodes (23): buildValues(), capitalize(), joinList(), pieceName(), refutationSan(), withArticle(), agree(), BEST (+15 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.20
Nodes (29): Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), Ctx, describe(), DIAG (+21 more)

### Community 8 - "lesson-checks.ts"
Cohesion: 0.19
Nodes (21): CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor(), rankUci(), steps() (+13 more)

### Community 9 - "Landing.tsx"
Cohesion: 0.11
Nodes (31): OutlineUnit, Closing(), HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing(), LessonWindow() (+23 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.18
Nodes (25): findPins(), after(), arrow(), buildErrorLesson(), buildPause(), capturersOn(), circlesFor(), describeMove() (+17 more)

### Community 11 - "lib.ts"
Cohesion: 0.11
Nodes (29): alreadyPlayed(), BLAME, checkMaterialClaim(), checkSanMentions(), Claims, compareSolution(), ES, f() (+21 more)

### Community 12 - "ref_node_fs"
Cohesion: 0.11
Nodes (11): PvLine, out, pkg, root, src, DIR, NAMES, text (+3 more)

### Community 13 - "Icon"
Cohesion: 0.19
Nodes (18): topWeakConcepts(), MapUnit, Numbered, numberUnits(), ErrorBox(), Icon(), Link(), dayWord() (+10 more)

### Community 14 - "audit-content.ts"
Cohesion: 0.08
Nodes (25): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+17 more)

### Community 15 - "api.test.ts"
Cohesion: 0.12
Nodes (29): clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup(), units (+21 more)

### Community 16 - "shared/api.ts"
Cohesion: 0.13
Nodes (18): PipelineOptions, AnswerBody, CompleteLessonBody, CompleteLessonShopExtras, FinishBody, LessonResponse, LessonStatus, LevelCard (+10 more)

### Community 17 - "src/api.ts"
Cohesion: 0.10
Nodes (23): BillingMode, Equipped, Shop, Subscription, User, api, ApiError, Listener (+15 more)

### Community 18 - "ErrorLessonPlayer.tsx"
Cohesion: 0.14
Nodes (19): chessground, ErrorLesson, run(), BestPhase, ErrorLessonPlayer(), onBestMove(), MOMENTS, Props (+11 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.15
Nodes (20): buildReport(), ReportError, keyErrors(), Report, lessonsForConcept(), CONCEPT_PHRASE, conceptShort(), conceptTitle() (+12 more)

### Community 20 - "tablebase.ts"
Cohesion: 0.06
Nodes (61): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Quinta tanda (2026-11-15): u15 torre Avanzado y u16 estrategia verificable, Regla para que una lección entre en repasos y sesión (+53 more)

### Community 21 - "router.ts"
Cohesion: 0.15
Nodes (15): react, applyLegacyRedirect(), currentPath(), isPlainClick(), isPrivatePath(), legacyRedirect(), listeners, normalizePath() (+7 more)

### Community 22 - "verify-fase4.mts"
Cohesion: 0.16
Nodes (17): expand(), FASE4, legalMoves(), matesInOne(), args, checkStep(), DEPTH, fmt() (+9 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.12
Nodes (30): DEFAULT_BOARD, DEFAULT_PIECES, getItem(), PROTECTOR_ID, PROTECTOR_MAX, STREAK_DAYS_PER_CHEDEX, css, landing (+22 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.12
Nodes (18): buildCtx(), loadPosition(), playLine(), HAPPENED, MoveClass, mk(), Opts, ALL (+10 more)

### Community 25 - "mock.ts"
Cohesion: 0.13
Nodes (23): buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1, L2 (+15 more)

### Community 26 - "placement.ts"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzle-stats.test.ts"
Cohesion: 0.10
Nodes (16): POOL_COMBOS, { puzzles }, TestDb, fillAllBut(), { puzzles }, seed(), TestDb, MIGRATIONS_DIR (+8 more)

### Community 29 - "levels.ts"
Cohesion: 0.26
Nodes (9): PlacementSeen, SeenPerf, hasRating(), HINT_MIN_GAMES, levelForRating(), LEVELS, PERFS, suggestLevel() (+1 more)

### Community 30 - "validation.test.ts"
Cohesion: 0.21
Nodes (11): trainFromMoves(), trainFromPgn(), TrainingItem, CLEAN, DIR, failures, files, load() (+3 more)

### Community 31 - "Rúbrica"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "SessionScreen.tsx"
Cohesion: 0.19
Nodes (18): Task 5: Pantalla «Entrenar hoy», ruleFor(), AnswerResult, FinishResult, SessionStart, SessionStatus, conceptName(), dueText() (+10 more)

### Community 33 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 34 - "Chedex Pulse chess training platform"
Cohesion: 0.16
Nodes (15): Separate educational content from GPL, Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, Chedex Pulse chess training platform (+7 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.18
Nodes (18): Task 2: Datos del servidor y errores propios, Task 4: API de la sesión, dueAfter(), ok, completeReview(), MAX_REVIEW_CONCEPTS, parseCompleteReview(), CONCEPT_IDS (+10 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.19
Nodes (14): Known issues to polish, EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent, Review runner, cache and useReview (+6 more)

### Community 37 - "unitsA.test.ts"
Cohesion: 0.09
Nodes (19): getLesson(), LESSONS, BoardMark, ExplainStep, PracticeStep, allMoves(), gain(), IDS (+11 more)

### Community 38 - "GameViewer.tsx"
Cohesion: 0.21
Nodes (16): moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, Props, clamp(), fenAt() (+8 more)

### Community 39 - "sound.ts"
Cohesion: 0.12
Nodes (24): throwing, countPieces(), EAGER, FILES, installUnlock(), isMuted(), listeners, load() (+16 more)

### Community 40 - "ShopScreen.tsx"
Cohesion: 0.09
Nodes (46): ShopItem, CATALOG, Coin(), MiniBoard(), PieceCode, ProtectorArt(), ROLE, SAMPLE_BOARD (+38 more)

### Community 41 - "Estado del proyecto (handoff document)"
Cohesion: 0.22
Nodes (9): Estado del proyecto (handoff document), Pending work list (ordered), Phase 1: pedagogical prototype (CLI), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games) (+1 more)

### Community 42 - "Revisión pedagógica y de ajedrez · 2026-11-14"
Cohesion: 0.22
Nodes (8): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Lo que NO pude verificar, Menor, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14

### Community 43 - "src/types.ts"
Cohesion: 0.15
Nodes (16): CONCEPTS, ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), mateAgainstMover(), pawnsText(), PIECE_ES (+8 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.29
Nodes (6): Chedex currency (1 per 5 streak days), User decisions changing the founding document, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), cburnett pieces (GPLv2+)

### Community 45 - "App.tsx"
Cohesion: 0.10
Nodes (37): USE_MOCK, App(), BillingScreen, CreditsScreen, LessonScreen, LevelScreen, MapScreen, PrivacyScreen (+29 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.40
Nodes (5): Decision: license whole repo GPL-3.0-or-later, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later), Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "mirror.ts"
Cohesion: 0.23
Nodes (14): Estado tras la corrección (2026-11-14, mismo día), EXERCISES, COLOR, flipRank(), mirrorExercise(), mirrorFen(), mirrorText(), mirrorUci() (+6 more)

### Community 49 - "auditPractice"
Cohesion: 0.52
Nodes (7): auditPractice(), sanOf(), checkMateClaim(), followToStable(), isForcing(), loadPos(), uciMove()

### Community 55 - "check-piece-bounds.mts"
Cohesion: 0.13
Nodes (12): args, asJson, Box, chrome(), data, errs, LIMITS, measure() (+4 more)

### Community 56 - "EngineResult"
Cohesion: 0.20
Nodes (5): EngineResult, HASH_MB, UciTransport, Score, FakeEngine

### Community 58 - "stockfish-proc.cjs"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "Auditoría automática de contenido · 2026-11-14"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "Board.tsx"
Cohesion: 0.23
Nodes (15): Dests, ES_PIECES, isInCheck(), legalDests(), posFromFen(), PROMO_ROLES, turnOf(), Board() (+7 more)

### Community 61 - "chessops"
Cohesion: 0.14
Nodes (22): chessops, build(), kind, N, pick(), rnd(), seed, sf (+14 more)

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "GameAnalysis"
Cohesion: 0.22
Nodes (7): GameAnalysis, ReviewGame, Color, AnalysisStore, LoadedGames, UseReview, Props

### Community 64 - "UciSession"
Cohesion: 0.16
Nodes (4): Revisado y correcto (sin hallazgo), UciSession, fake(), BrowserEngine

### Community 65 - "PracticeBoard"
Cohesion: 0.30
Nodes (14): applyUci(), canonicalUci(), lastMoveOf(), needsPromotion(), sanOfUci(), PracticeBoard(), attempt(), finishCorrect() (+6 more)

### Community 66 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 69 - "completion.ts"
Cohesion: 0.20
Nodes (9): ReviewPosition, CompleteReviewBody, CompleteReviewResponse, createReviewReporter(), flush(), isPermanent(), Pending, reporter (+1 more)

### Community 70 - "d1-races.test.ts"
Cohesion: 0.11
Nodes (23): SubscriptionStatus, clock, due(), exec(), lesson, SECRET, streak4(), today (+15 more)

### Community 71 - "Lesson"
Cohesion: 0.17
Nodes (11): Formato y verificación (igual que u01-u06), Lesson, c(), ClaimLike, lesson(), Row, step(), t() (+3 more)

### Community 72 - "EngineLike"
Cohesion: 0.12
Nodes (9): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba, EngineLike (+1 more)

### Community 73 - "context.ts"
Cohesion: 0.10
Nodes (16): Auditoría plena 01: código y estructura (2026-11-15), Cambios en archivos de pantalla (excepciones declaradas), Hallazgos, Lo que NO pude verificar, Métricas, Resumen, Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor, ADMIN_IDS (+8 more)

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "unitsE.test.ts"
Cohesion: 0.21
Nodes (10): ENDGAME_UNITS, linePositions(), load(), probe, ROLE, sansNear(), textErrors(), units (+2 more)

### Community 76 - "useReview.ts"
Cohesion: 0.21
Nodes (7): indexedDbStore(), memoryStore(), openDb(), ReviewRunner, GameStatus, ReviewStatus, store

### Community 77 - "review/types.ts"
Cohesion: 0.39
Nodes (7): computeStrengths(), errorRate(), isError(), phaseOf(), studentMoves(), Phase, Strength

### Community 78 - "runEngine"
Cohesion: 0.43
Nodes (4): add(), runEngine(), AuditEngine, enginePath()

### Community 79 - "credits.ts"
Cohesion: 0.29
Nodes (9): CatalogItem, ShopKind, catalogCredits(), CREDIT_GROUP_LABEL, creditRows(), LIBRARIES, Library, ORDER (+1 more)

### Community 80 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 81 - "Auditoría automática de contenido · 2026-11-20"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-20, Aviso, Importante, Resumen

### Community 82 - "hint-leaks.ts"
Cohesion: 0.33
Nodes (7): leaksIn(), Target, targetOf(), targetsOf(), targetsOfLine(), per, rows

### Community 83 - "session.ts"
Cohesion: 0.10
Nodes (35): Foco de revisión, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 6: Cierre, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL, difficultyForLevel() (+27 more)

### Community 84 - "AnalyzedMove"
Cohesion: 0.27
Nodes (10): KeyError, AnalyzedMove, Diagnosis, game(), mv(), rg(), err(), filler() (+2 more)

### Community 85 - "vitest"
Cohesion: 0.25
Nodes (7): vitest, diagnose(), analyzed, DIR, files, GOLDEN, snapshot()

### Community 86 - "cli.ts"
Cohesion: 0.25
Nodes (5): args, depth, file, level, LEVELS

### Community 87 - "Auditoría plena 02: diseño visual, UI y accesibilidad"
Cohesion: 0.22
Nodes (8): Arreglos posteriores (2026-11-15): tablero bajo la cabecera y nombre de usuario, Auditoría plena 02: diseño visual, UI y accesibilidad, Cómo se midió y qué quedó fuera del repositorio, Datos de contraste y tamaño (muestras medidas), Hallazgos, Lo que no se arregló y por qué, No verificado, Resumen

### Community 88 - "Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)"
Cohesion: 0.25
Nodes (7): Arreglo de X1 (2026-11-15): la portada ya no espera a `/api/me`, Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15), Método, Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión), No verificado, Resumen, Verificación

### Community 89 - "recommend.ts"
Cohesion: 0.32
Nodes (5): LEVEL_ORDER, priority(), recommend(), idx(), LEVELS

### Community 90 - "mate_threat.ts"
Cohesion: 0.48
Nodes (6): colorName(), Step, favors(), firstMateIndex(), mateThreat(), plural()

### Community 91 - "LessonPlayer.tsx"
Cohesion: 0.16
Nodes (15): LessonProgress, Profile, CompleteResponse, LessonPlayer(), finish(), toEval(), toExplain(), toPractice() (+7 more)

### Community 92 - "LevelScreen"
Cohesion: 0.50
Nodes (4): LevelScreen(), confirm(), move(), onKey()

### Community 93 - "POST /api/review/complete and cp_reviewed_games"
Cohesion: 0.40
Nodes (5): Phase 3: personalization (game analysis, weak points), D1 cp_* tables, CREATE IF NOT EXISTS only, Wallet ledger (cp_wallet_ledger), server-side prices, POST /api/review/complete and cp_reviewed_games, topWeakConcepts and Profile weak points section

### Community 94 - "TypedMove"
Cohesion: 0.83
Nodes (3): parseTypedMove(), TypedMove(), submit()

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 546 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `games.test.ts`, `runner.ts`, `package.json`, `lesson-checks.ts`, `lib.ts`, `ref_node_fs`, `Icon`, `api.test.ts`, `ErrorLessonPlayer.tsx`, `ReportScreen.tsx`, `tablebase.ts`, `router.ts`, `worker/shop.ts`, `error-lesson.test.ts`, `placement.ts`, `puzzle-stats.test.ts`, `levels.ts`, `validation.test.ts`, `worker/srs.ts`, `unitsA.test.ts`, `GameViewer.tsx`, `sound.ts`, `ShopScreen.tsx`, `src/types.ts`, `mirror.ts`, `chessops`, `UciSession`, `PracticeBoard`, `completion.ts`, `d1-races.test.ts`, `context.ts`, `unitsE.test.ts`, `theme.test.ts`, `hint-leaks.ts`, `session.ts`, `AnalyzedMove`, `recommend.ts`, `LessonPlayer.tsx`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `content/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11400966183574879 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `chessops` to `core.ts`, `package.json`, `chess-utils.ts`, `lesson-checks.ts`, `error-lesson.ts`, `lib.ts`, `audit-content.ts`, `tablebase.ts`, `verify-fase4.mts`, `error-lesson.test.ts`, `validation.test.ts`, `worker/srs.ts`, `unitsA.test.ts`, `src/types.ts`, `mirror.ts`, `Board.tsx`, `unitsE.test.ts`, `hint-leaks.ts`, `session.ts`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Should `lessons.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14693446088794926 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `content/index.ts`, `context.ts`, `error-lesson.ts`, `src/types.ts`, `Landing.tsx`, `Icon`, `unitsE.test.ts`, `src/api.ts`, `session.ts`, `ReportScreen.tsx`, `cli.ts`, `mock.ts`, `error-lesson.test.ts`, `recommend.ts`, `LessonPlayer.tsx`, `LevelScreen`, `levels.ts`, `validation.test.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05180388529139685 - nodes in this community are weakly interconnected._