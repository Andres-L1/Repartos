# Graph Report - LUDEX  (2026-11-21)

## Corpus Check
- 269 files · ~294,443 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .css 13, .pgn 12, (none) 3)

## Summary
- 1847 nodes · 5109 edges · 87 communities (80 shown, 7 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 206 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `67028f52`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Tests de contenido y temario
- Motor y analisis de partidas
- games.test.ts
- Tienda y moneda Chedex
- useReview.ts
- package.json
- corpus.test.ts
- Reglas de diagnostico
- ref_node_fs
- Landing
- error-lesson.ts
- Servidor Hono y progreso
- ref_node_fs
- Icon
- ReviewScreen.tsx
- Acceso con Lichess
- shared/api.ts
- SessionValue
- session.ts
- ReportScreen.tsx
- d1-races.test.ts
- api.test.ts
- shared/api.ts
- worker/shop.ts
- Tests de la mini leccion
- session.ts
- Colocacion por Elo (antigua)
- puzzles.test.ts
- db.ts
- levels.ts
- Level
- SessionScreen.tsx
- SessionScreen.tsx
- Configuracion TypeScript
- Phase 2 architecture (web, Hono Worker, D1)
- worker/srs.ts
- Plan del analisis de partidas
- worker/index.ts
- GameViewer.tsx
- ErrorLessonPlayer.tsx
- ShopScreen.tsx
- Phase 1 validation report (11 sample games)
- Revisión pedagógica y de ajedrez · 2026-11-14
- api.test.ts
- Diseno de la tienda
- App.tsx
- Decision: license whole repo GPL-3.0-or-later
- Plan de nivel y puntos debiles
- branches.test.ts
- lib.test.ts
- Reglas de graphify
- Fuente DM Sans
- Licencias hono y react
- env.d.ts
- check-piece-bounds.mts
- createContext
- session.tsx
- chessops
- mirror.ts
- Fase 4 · Contenido hasta 2000 Elo (diseño)
- unitsF.test.ts
- Repasos espaciados y sesión diaria — plan de implementación
- worker/index.ts
- UciSession
- Calibración de niveles y puzles con datos reales de Lichess (2026-11-21)
- Hallazgos
- FakeWorker
- Auditor de contenido
- completion.ts
- d1-races.test.ts
- EngineResult
- context.ts
- Auditoría automática de contenido · 2026-11-15
- Lesson
- build.mts
- chess-utils.ts
- theme.test.ts
- Auditoría automática de contenido · 2026-11-20
- newSession
- src/types.ts
- playLine
- Auditoría plena 02: diseño visual, UI y accesibilidad
- Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)
- LessonPlayer
- navigate
- POST /api/review/complete and cp_reviewed_games

## God Nodes (most connected - your core abstractions)
1. `vitest` - 63 edges
2. `Icon()` - 52 edges
3. `Level` - 40 edges
4. `chessops` - 39 edges
5. `navigate()` - 36 edges
6. `useSession()` - 33 edges
7. `Unit` - 32 edges
8. `Link()` - 31 edges
9. `react` - 31 edges
10. `App()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14` --references--> `checkLine()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → scripts/lib/tablebase.ts
- `Qué sí verifiqué y cómo` --references--> `mirrorText()`  [INFERRED]
  docs/revision-pedagogica-2026-11-14.md → src/pedagogy/mirror.ts
- `Problema` --references--> `keyErrors()`  [INFERRED]
  docs/superpowers/specs/2026-11-21-analizador-sin-causa-design.md → src/review/select.ts
- `u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`)` --references--> `themeForConcept()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/review/srs.ts
- `Compatibilidad` --references--> `eloRange()`  [INFERRED]
  docs/calibracion-niveles-2026-11.md → src/shared/levels.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (87 total, 7 thin omitted)

### Community 0 - "Tests de contenido y temario"
Cohesion: 0.11
Nodes (24): lessonsForConcept(), Unit, unit, unit, unit, unit, unit, unit (+16 more)

### Community 1 - "Motor y analisis de partidas"
Cohesion: 0.21
Nodes (17): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, assembleMoves(), classify(), scoreToCp() (+9 more)

### Community 2 - "games.test.ts"
Cohesion: 0.15
Nodes (16): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+8 more)

### Community 3 - "Tienda y moneda Chedex"
Cohesion: 0.22
Nodes (22): hono, createApp(), AppContext, Env, HttpError, isInt(), isObj(), readJson() (+14 more)

### Community 4 - "useReview.ts"
Cohesion: 0.09
Nodes (23): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, ReviewGame, games(), mk(), setup() (+15 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (46): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description (+38 more)

### Community 6 - "corpus.test.ts"
Cohesion: 0.11
Nodes (26): analyses, chosen, club, ndjson, pick, seen, sides, tiersOf() (+18 more)

### Community 7 - "Reglas de diagnostico"
Cohesion: 0.11
Nodes (47): Repasos espaciados y sesión diaria — plan de implementación, Restricciones globales, Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos (+39 more)

### Community 8 - "ref_node_fs"
Cohesion: 0.15
Nodes (25): CONCEPTS, Concept, CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor() (+17 more)

### Community 9 - "Landing"
Cohesion: 0.12
Nodes (33): marksToShapes(), LichessLogin(), Closing(), HeroArt(), HeroDemo(), HeroFloat(), HeroKnight(), Landing() (+25 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.08
Nodes (53): Mini lección sin causa (`buildErrorLesson`, `kind: 'missed' | 'engine'`), after(), arrow(), buildCauseLesson(), buildErrorLesson(), buildGenericLesson(), buildPause(), capturersOn() (+45 more)

### Community 11 - "Servidor Hono y progreso"
Cohesion: 0.12
Nodes (23): alreadyPlayed(), BLAME, checkSanMentions(), Claims, ES, expand(), FindingType, legalMoves() (+15 more)

### Community 12 - "ref_node_fs"
Cohesion: 0.11
Nodes (11): vitest, out, pkg, root, src, DIR, NAMES, text (+3 more)

### Community 13 - "Icon"
Cohesion: 0.11
Nodes (31): react, topWeakConcepts(), eloRange(), Numbered, numberUnits(), ApiError, Icon(), IconName (+23 more)

### Community 14 - "ReviewScreen.tsx"
Cohesion: 0.08
Nodes (25): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+17 more)

### Community 15 - "Acceso con Lichess"
Cohesion: 0.24
Nodes (20): aesKey(), base64url(), clearedCookies(), cookieHeader(), cookieNames(), encoder, fromBase64url(), handleCallback() (+12 more)

### Community 16 - "shared/api.ts"
Cohesion: 0.12
Nodes (26): AnswerBody, BillingMode, CompleteLessonBody, CompleteLessonShopExtras, FinishBody, LessonProgress, LessonResponse, LevelCard (+18 more)

### Community 17 - "SessionValue"
Cohesion: 0.20
Nodes (8): Equipped, Shop, Subscription, User, MockState, act(), equip(), SessionValue

### Community 18 - "session.ts"
Cohesion: 0.18
Nodes (18): Task 5: Pantalla «Entrenar hoy», AnswerResult, FinishResult, SessionItem, SessionStart, SessionStatus, answerItem(), evaluate() (+10 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.17
Nodes (18): Report, lessonsForConcept(), CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline(), inaccuracySentence(), inGames() (+10 more)

### Community 20 - "d1-races.test.ts"
Cohesion: 0.11
Nodes (37): branchesFor(), cache, dist(), fenOf(), get(), rivalMove(), studentKeep(), CACHE_PATH (+29 more)

### Community 21 - "api.test.ts"
Cohesion: 0.15
Nodes (14): clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup(), units (+6 more)

### Community 22 - "shared/api.ts"
Cohesion: 0.13
Nodes (16): FASE4, args, checkStep(), DEPTH, fmt(), legalCount(), load(), makeFenOf() (+8 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.12
Nodes (30): DEFAULT_BOARD, DEFAULT_PIECES, getItem(), PROTECTOR_ID, PROTECTOR_MAX, STREAK_DAYS_PER_CHEDEX, css, landing (+22 more)

### Community 24 - "Tests de la mini leccion"
Cohesion: 0.12
Nodes (14): HAPPENED, Score, ALL, C, Case, CauseKE, CONCEPT_IDS, exchangeAnswers() (+6 more)

### Community 25 - "session.ts"
Cohesion: 0.13
Nodes (23): buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1, L2 (+15 more)

### Community 26 - "Colocacion por Elo (antigua)"
Cohesion: 0.19
Nodes (14): PlacementPerf, describePerf(), describePerfs(), isInt(), isReliable(), parsePerf(), PerfsInput, PerfsSeen (+6 more)

### Community 27 - "puzzles.test.ts"
Cohesion: 0.12
Nodes (14): POOL_COMBOS, puzzleStart(), { puzzles }, TestDb, fillAllBut(), { puzzles }, seed(), TestDb (+6 more)

### Community 29 - "levels.ts"
Cohesion: 0.22
Nodes (10): PlacementSeen, SeenPerf, hasRating(), HINT_MIN_GAMES, levelForRating(), LevelInfo, PERFS, PROVISIONAL_MIN_GAMES (+2 more)

### Community 30 - "Level"
Cohesion: 0.11
Nodes (17): args, depth, file, level, LEVELS, trainFromMoves(), PipelineOptions, trainFromPgn() (+9 more)

### Community 31 - "SessionScreen.tsx"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "SessionScreen.tsx"
Cohesion: 0.29
Nodes (11): conceptName(), dueText(), errMsg(), Fail, formatDay(), Intro(), Phase, Progress() (+3 more)

### Community 33 - "Configuracion TypeScript"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 34 - "Phase 2 architecture (web, Hono Worker, D1)"
Cohesion: 0.16
Nodes (15): Separate educational content from GPL, Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, Chedex Pulse chess training platform (+7 more)

### Community 35 - "worker/srs.ts"
Cohesion: 0.13
Nodes (22): Task 2: Datos del servidor y errores propios, ReviewPosition, MIGRATIONS_DIR, ok, Pending, SqlValue, Stmt, completeReview() (+14 more)

### Community 36 - "Plan del analisis de partidas"
Cohesion: 0.19
Nodes (14): Known issues to polish, EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent, Review runner, cache and useReview (+6 more)

### Community 37 - "worker/index.ts"
Cohesion: 0.07
Nodes (29): Formato y verificación (igual que u01-u06), getLesson(), LESSONS, BoardMark, ExplainStep, Lesson, PracticeStep, c() (+21 more)

### Community 38 - "GameViewer.tsx"
Cohesion: 0.21
Nodes (16): moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, Props, clamp(), fenAt() (+8 more)

### Community 39 - "ErrorLessonPlayer.tsx"
Cohesion: 0.06
Nodes (73): chessground, ErrorLesson, run(), throwing, applyUci(), canonicalUci(), Dests, ES_PIECES (+65 more)

### Community 40 - "ShopScreen.tsx"
Cohesion: 0.09
Nodes (46): ShopItem, CATALOG, ErrorBox(), Coin(), MiniBoard(), PieceCode, ProtectorArt(), ROLE (+38 more)

### Community 41 - "Phase 1 validation report (11 sample games)"
Cohesion: 0.22
Nodes (9): Estado del proyecto (handoff document), Pending work list (ordered), Phase 1: pedagogical prototype (CLI), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games) (+1 more)

### Community 42 - "Revisión pedagógica y de ajedrez · 2026-11-14"
Cohesion: 0.22
Nodes (8): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Lo que NO pude verificar, Menor, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14

### Community 43 - "api.test.ts"
Cohesion: 0.17
Nodes (18): buildValues(), capitalize(), ENGINE_ONLY_CONCEPT_ID, engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover() (+10 more)

### Community 44 - "Diseno de la tienda"
Cohesion: 0.29
Nodes (6): Chedex currency (1 per 5 streak days), User decisions changing the founding document, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), cburnett pieces (GPLv2+)

### Community 45 - "App.tsx"
Cohesion: 0.10
Nodes (31): USE_MOCK, App(), BillingScreen, CreditsScreen, LessonScreen, LevelScreen, MapScreen, PrivacyScreen (+23 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.40
Nodes (5): Decision: license whole repo GPL-3.0-or-later, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later), Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 47 - "Plan de nivel y puntos debiles"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "branches.test.ts"
Cohesion: 0.09
Nodes (35): Estado tras la corrección (2026-11-14, mismo día), leaksIn(), Target, targetOf(), targetsOf(), targetsOfLine(), per, rows (+27 more)

### Community 49 - "lib.test.ts"
Cohesion: 0.19
Nodes (18): add(), auditPractice(), runEngine(), sanOf(), checkMateClaim(), checkMaterialClaim(), compareSolution(), f() (+10 more)

### Community 55 - "check-piece-bounds.mts"
Cohesion: 0.13
Nodes (12): args, asJson, Box, chrome(), data, errs, LIMITS, measure() (+4 more)

### Community 56 - "createContext"
Cohesion: 0.24
Nodes (13): ADMIN_IDS, isAdmin(), createContext(), chosenLevel(), levelEffect(), loadProfile(), profileFor(), progressMap() (+5 more)

### Community 57 - "session.tsx"
Cohesion: 0.24
Nodes (10): Hallazgos, api, setApiHandlers(), setReviewUser, BillingScreen(), Ctx, SessionProvider(), DEFAULT_EQUIPPED (+2 more)

### Community 58 - "chessops"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "mirror.ts"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "Fase 4 · Contenido hasta 2000 Elo (diseño)"
Cohesion: 0.17
Nodes (11): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Quinta tanda (2026-11-15): u15 torre Avanzado y u16 estrategia verificable, Regla para que una lección entre en repasos y sesión (+3 more)

### Community 61 - "unitsF.test.ts"
Cohesion: 0.14
Nodes (22): chessops, build(), kind, N, pick(), rnd(), seed, sf (+14 more)

### Community 62 - "Repasos espaciados y sesión diaria — plan de implementación"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "worker/index.ts"
Cohesion: 0.38
Nodes (7): parseBillingMode(), d1Db(), D1Like, appFor(), Env, fetch(), scheduled()

### Community 64 - "UciSession"
Cohesion: 0.15
Nodes (4): UciSession, UciTransport, fake(), BrowserEngine

### Community 65 - "Calibración de niveles y puzles con datos reales de Lichess (2026-11-21)"
Cohesion: 0.22
Nodes (8): Calibración de niveles y puzles con datos reales de Lichess (2026-11-21), Compatibilidad, Decisión por corte (rápidas como referencia), Distribución real (2026-11-21), Fuentes, Límites, Por qué un jugador quedaba como principiante, Puzles por nivel

### Community 66 - "Hallazgos"
Cohesion: 0.25
Nodes (7): Auditoría plena 01: código y estructura (2026-11-15), Cambios en archivos de pantalla (excepciones declaradas), Hallazgos, Lo que NO pude verificar, Métricas, Resumen, Revisado y correcto (sin hallazgo)

### Community 68 - "Auditor de contenido"
Cohesion: 0.25
Nodes (7): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba

### Community 69 - "completion.ts"
Cohesion: 0.21
Nodes (7): CompleteReviewBody, CompleteReviewResponse, createReviewReporter(), flush(), isPermanent(), reporter, ReporterDeps

### Community 70 - "d1-races.test.ts"
Cohesion: 0.15
Nodes (10): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+2 more)

### Community 72 - "EngineResult"
Cohesion: 0.14
Nodes (5): EngineLike, EngineResult, FakeEngine, CorpusGame, FakeEngine

### Community 73 - "context.ts"
Cohesion: 0.12
Nodes (16): Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor, LessonStatus, SubscriptionStatus, LEVELS, AuthConfig, BillingProvider, PERIOD_DAYS, SubscriptionRecord (+8 more)

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "Lesson"
Cohesion: 0.21
Nodes (11): Claim, CLAIMS, EXPLAIN_RESULT, ENDGAME_UNITS, linePositions(), load(), probe, ROLE (+3 more)

### Community 78 - "build.mts"
Cohesion: 0.13
Nodes (11): AuditEngine, enginePath(), PvLine, have, JOBS, OUT, queue, sources (+3 more)

### Community 79 - "chess-utils.ts"
Cohesion: 0.29
Nodes (9): CatalogItem, ShopKind, catalogCredits(), CREDIT_GROUP_LABEL, creditRows(), LIBRARIES, Library, ORDER (+1 more)

### Community 80 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 81 - "Auditoría automática de contenido · 2026-11-20"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-20, Aviso, Importante, Resumen

### Community 83 - "newSession"
Cohesion: 0.15
Nodes (21): Foco de revisión, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 4: API de la sesión, Task 6: Cierre, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL (+13 more)

### Community 84 - "src/types.ts"
Cohesion: 0.13
Nodes (28): V, buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves() (+20 more)

### Community 85 - "playLine"
Cohesion: 0.10
Nodes (26): Analizador de partidas: errores graves sin causa tipificada (2026-11-21), Diseño, Informe y entrenamiento, Límites conocidos, Medición previa (corpus guardado, sin motor), Problema, buildCtx(), loadPosition() (+18 more)

### Community 87 - "Auditoría plena 02: diseño visual, UI y accesibilidad"
Cohesion: 0.20
Nodes (9): Arreglo posterior (2026-11-21): maquetación horizontal real en móvil apaisado, Arreglos posteriores (2026-11-15): tablero bajo la cabecera y nombre de usuario, Auditoría plena 02: diseño visual, UI y accesibilidad, Cómo se midió y qué quedó fuera del repositorio, Datos de contraste y tamaño (muestras medidas), Hallazgos, Lo que no se arregló y por qué, No verificado (+1 more)

### Community 88 - "Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)"
Cohesion: 0.25
Nodes (7): Arreglo de X1 (2026-11-15): la portada ya no espera a `/api/me`, Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15), Método, Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión), No verificado, Resumen, Verificación

### Community 91 - "LessonPlayer"
Cohesion: 0.18
Nodes (12): ExplainStepView(), LessonPlayer(), finish(), toEval(), toExplain(), toPractice(), Phase, ResultView() (+4 more)

### Community 92 - "navigate"
Cohesion: 0.24
Nodes (14): Link(), handle(), reportReviewed, emptyMessage(), isPlainClick(), navigate(), mock(), LevelScreen() (+6 more)

### Community 93 - "POST /api/review/complete and cp_reviewed_games"
Cohesion: 0.40
Nodes (5): Phase 3: personalization (game analysis, weak points), D1 cp_* tables, CREATE IF NOT EXISTS only, Wallet ledger (cp_wallet_ledger), server-side prices, POST /api/review/complete and cp_reviewed_games, topWeakConcepts and Profile weak points section

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 589 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `ref_node_fs` to `Tests de contenido y temario`, `Motor y analisis de partidas`, `games.test.ts`, `useReview.ts`, `package.json`, `corpus.test.ts`, `ref_node_fs`, `Icon`, `ReportScreen.tsx`, `api.test.ts`, `worker/shop.ts`, `Tests de la mini leccion`, `Colocacion por Elo (antigua)`, `puzzles.test.ts`, `levels.ts`, `Level`, `worker/srs.ts`, `worker/index.ts`, `GameViewer.tsx`, `ErrorLessonPlayer.tsx`, `ShopScreen.tsx`, `api.test.ts`, `App.tsx`, `branches.test.ts`, `lib.test.ts`, `createContext`, `unitsF.test.ts`, `UciSession`, `completion.ts`, `d1-races.test.ts`, `Lesson`, `theme.test.ts`, `newSession`, `src/types.ts`, `playLine`, `LessonPlayer`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tests de contenido y temario` be split into smaller, more focused modules?**
  _Cohesion score 0.11081560283687943 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `unitsF.test.ts` to `Motor y analisis de partidas`, `package.json`, `corpus.test.ts`, `Reglas de diagnostico`, `ref_node_fs`, `error-lesson.ts`, `Servidor Hono y progreso`, `ReviewScreen.tsx`, `d1-races.test.ts`, `shared/api.ts`, `Tests de la mini leccion`, `Level`, `worker/srs.ts`, `worker/index.ts`, `ErrorLessonPlayer.tsx`, `api.test.ts`, `branches.test.ts`, `Lesson`, `newSession`, `src/types.ts`, `playLine`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `useReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08961593172119488 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `Tests de contenido y temario`, `ref_node_fs`, `Landing`, `error-lesson.ts`, `Icon`, `SessionValue`, `session.ts`, `ReportScreen.tsx`, `Tests de la mini leccion`, `session.ts`, `levels.ts`, `Level`, `api.test.ts`, `branches.test.ts`, `session.tsx`, `Hallazgos`, `context.ts`, `newSession`, `src/types.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05180388529139685 - nodes in this community are weakly interconnected._