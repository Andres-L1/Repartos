# Graph Report - agent-a65e2ebc9e6b93657  (2026-11-21)

## Corpus Check
- 272 files · ~296,478 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 36 file(s) not represented in the graph (top: .css 14, .pgn 12, (none) 4)

## Summary
- 1855 nodes · 5092 edges · 89 communities (83 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 206 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab70339e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- content/index.ts
- core.ts
- review/types.ts
- context.ts
- ReviewScreen.tsx
- devDependencies
- select.ts
- chess-utils.ts
- lesson-checks.ts
- LandingSections.tsx
- error-lesson.ts
- lib.ts
- ref_node_fs
- Icon
- audit-content.ts
- auth.ts
- shared/api.ts
- review-copy.ts
- access.test.ts
- ReportScreen.tsx
- tablebase.ts
- api.test.ts
- verify-fase4.mts
- worker/shop.ts
- error-lesson.test.ts
- mock.ts
- placement.ts
- session.ts
- package.json
- levels.ts
- validation.test.ts
- Rúbrica
- scripts
- compilerOptions
- Chedex Pulse chess training platform
- lessons.ts
- Plan: analysis of last 10 Lichess games
- unitsA.test.ts
- ReviewGameScreen.tsx
- ErrorLessonPlayer.tsx
- ShopScreen.tsx
- Estado del proyecto (handoff document)
- mirror.ts
- src/types.ts
- Shop and Chedex currency design
- App.tsx
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- vitest
- lib.test.ts
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- env.d.ts
- check-piece-bounds.mts
- createContext
- u16.ts
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- Repasos espaciados y sesión diaria — diseño
- chessops
- cut-pieces.py
- worker/index.ts
- UciSession
- dependencies
- Hallazgos
- FakeWorker
- EngineLike
- vite.config.ts
- d1-races.test.ts
- gen-strategy.mts
- EngineResult
- cli.ts
- Auditoría automática de contenido · 2026-11-15
- unitsE.test.ts
- Analizador de partidas: errores graves sin causa tipificada (2026-11-21)
- analysis/engine.ts
- build.mts
- copy-engine.mjs
- theme.test.ts
- Auditoría automática de contenido · 2026-11-20
- report.ts
- playLine
- Auditoría plena 02: diseño visual, UI y accesibilidad
- Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)
- LessonPlayer.tsx
- navigate
- POST /api/review/complete and cp_reviewed_games

## God Nodes (most connected - your core abstractions)
1. `vitest` - 64 edges
2. `Icon()` - 53 edges
3. `Level` - 40 edges
4. `chessops` - 39 edges
5. `Unit` - 33 edges
6. `Link()` - 32 edges
7. `navigate()` - 31 edges
8. `react` - 30 edges
9. `App()` - 30 edges
10. `useSession()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Problema` --references--> `keyErrors()`  [INFERRED]
  docs/superpowers/specs/2026-11-21-analizador-sin-causa-design.md → src/review/select.ts
- `u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`)` --references--> `themeForConcept()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/review/srs.ts
- `Compatibilidad` --references--> `eloRange()`  [INFERRED]
  docs/calibracion-niveles-2026-11.md → src/shared/levels.ts
- `u15 «Finales de torre: nivel Avanzado» (`advanced`, `order` 14, `requires: ['u14']`; u12 pasa a `order` 15)` --references--> `isExpectedMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/shared/moves.ts
- `Para el constructor` --references--> `judgeBestMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-13-repasos-y-sesion-diaria-design.md → web/src/review/lessonFlow.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (89 total, 6 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.11
Nodes (25): lessonsForConcept(), UNITS, Unit, unit, unit, unit, unit, unit (+17 more)

### Community 1 - "core.ts"
Cohesion: 0.24
Nodes (14): analyzeGame(), AnalyzeOptions, abortError(), analyzeWith(), AnalyzeWithOptions, assembleMoves(), classify(), scoreToCp() (+6 more)

### Community 2 - "review/types.ts"
Cohesion: 0.18
Nodes (16): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), isValidUsername(), parseNdjson(), pickGames() (+8 more)

### Community 3 - "context.ts"
Cohesion: 0.19
Nodes (19): hono, ADMIN_IDS, isAdmin(), LEVELS, AccessMode, AuthConfig, AppContext, AppDeps (+11 more)

### Community 4 - "ReviewScreen.tsx"
Cohesion: 0.07
Nodes (35): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, GameAnalysis, ReviewGame, games(), mk() (+27 more)

### Community 5 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, tsx@^4.19.0, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@^5.6.0, vitest@^5.1.0, wrangler@^4.161.0, tsx (+4 more)

### Community 6 - "select.ts"
Cohesion: 0.11
Nodes (33): analyses, chosen, club, ndjson, pick, seen, sides, tiersOf() (+25 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.17
Nodes (36): Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), colorName(), Ctx, describe() (+28 more)

### Community 8 - "lesson-checks.ts"
Cohesion: 0.17
Nodes (23): CONCEPTS, Concept, CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1(), materialFor() (+15 more)

### Community 9 - "LandingSections.tsx"
Cohesion: 0.15
Nodes (24): Closing(), HeroArt(), HeroVisual(), Landing(), LichessData(), AVAILABLE_FALLBACK, CYCLE, Cycle() (+16 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.14
Nodes (33): Mini lección sin causa (`buildErrorLesson`, `kind: 'missed' | 'engine'`), findPins(), after(), arrow(), buildCauseLesson(), buildErrorLesson(), buildGenericLesson(), buildPause() (+25 more)

### Community 11 - "lib.ts"
Cohesion: 0.13
Nodes (21): alreadyPlayed(), BLAME, checkSanMentions(), Claims, ES, expand(), FindingType, lintText() (+13 more)

### Community 12 - "ref_node_fs"
Cohesion: 0.12
Nodes (11): analyzed, DIR, files, GOLDEN, snapshot(), DIR, NAMES, text (+3 more)

### Community 13 - "Icon"
Cohesion: 0.14
Nodes (31): topWeakConcepts(), MapUnit, Numbered, numberUnits(), ErrorBox(), Icon(), Loading(), Link() (+23 more)

### Community 14 - "audit-content.ts"
Cohesion: 0.08
Nodes (26): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+18 more)

### Community 15 - "auth.ts"
Cohesion: 0.24
Nodes (20): aesKey(), base64url(), clearedCookies(), cookieHeader(), cookieNames(), encoder, fromBase64url(), handleCallback() (+12 more)

### Community 16 - "shared/api.ts"
Cohesion: 0.05
Nodes (56): Task 5: Pantalla «Entrenar hoy», ReviewPosition, AccessOverview, AccessRequest, AllowedUser, AnswerBody, AnswerResult, CompleteLessonBody (+48 more)

### Community 17 - "review-copy.ts"
Cohesion: 0.11
Nodes (24): pieceName(), withArticle(), AFTER, agree(), BEFORE, BEST, ENGINE_COPY, fem() (+16 more)

### Community 18 - "access.test.ts"
Cohesion: 0.21
Nodes (9): NOW, own, SECRET, setup(), units, MAX_ALLOWED, MAX_REQUESTS, recordDenied() (+1 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.17
Nodes (18): Report, lessonsForConcept(), CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline(), inaccuracySentence(), inGames() (+10 more)

### Community 20 - "tablebase.ts"
Cohesion: 0.07
Nodes (52): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Formato y verificación (igual que u01-u06), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Quinta tanda (2026-11-15): u15 torre Avanzado y u16 estrategia verificable (+44 more)

### Community 21 - "api.test.ts"
Cohesion: 0.13
Nodes (15): clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup(), units (+7 more)

### Community 22 - "verify-fase4.mts"
Cohesion: 0.12
Nodes (18): FASE4, legalMoves(), args, checkStep(), DEPTH, fmt(), legalCount(), load() (+10 more)

### Community 23 - "worker/shop.ts"
Cohesion: 0.10
Nodes (37): CATALOG, CatalogItem, DEFAULT_BOARD, DEFAULT_PIECES, getItem(), PROTECTOR_ID, PROTECTOR_MAX, ShopKind (+29 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.14
Nodes (11): HAPPENED, ALL, C, CauseKE, CONCEPT_IDS, exchangeAnswers(), gain(), keyError() (+3 more)

### Community 25 - "mock.ts"
Cohesion: 0.12
Nodes (25): ADMIN, buildMap(), buildShop(), err(), fase4(), fase4Map(), json(), L1 (+17 more)

### Community 26 - "placement.ts"
Cohesion: 0.11
Nodes (22): Calibración de niveles y puzles con datos reales de Lichess (2026-11-21), Compatibilidad, Decisión por corte (rápidas como referencia), Distribución real (2026-11-21), Fuentes, Límites, Por qué un jugador quedaba como principiante, Puzles por nivel (+14 more)

### Community 27 - "session.ts"
Cohesion: 0.06
Nodes (49): Foco de revisión, Repasos espaciados y sesión diaria — plan de implementación, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 6: Cierre, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL (+41 more)

### Community 28 - "package.json"
Cohesion: 0.18
Nodes (10): description, @types/node@^22.0.0, engines, node, license, name, private, type (+2 more)

### Community 29 - "levels.ts"
Cohesion: 0.14
Nodes (13): PlacementSeen, SeenPerf, eloRange(), hasRating(), HINT_MIN_GAMES, levelForRating(), LevelInfo, PERFS (+5 more)

### Community 30 - "validation.test.ts"
Cohesion: 0.19
Nodes (11): PipelineOptions, trainFromPgn(), TrainingItem, CLEAN, DIR, failures, files, load() (+3 more)

### Community 31 - "Rúbrica"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, audit:content, build, build:web, chedex, db:migrate:local, dev, dev:web (+3 more)

### Community 33 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 34 - "Chedex Pulse chess training platform"
Cohesion: 0.16
Nodes (15): Separate educational content from GPL, Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, Chedex Pulse chess training platform (+7 more)

### Community 35 - "lessons.ts"
Cohesion: 0.08
Nodes (40): Task 2: Datos del servidor y errores propios, Task 4: API de la sesión, ENGINE_ONLY_CONCEPT_ID, dueAfter(), MIGRATIONS_DIR, D1StatementLike, Db, SqlValue (+32 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.19
Nodes (14): Known issues to polish, EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent, Review runner, cache and useReview (+6 more)

### Community 37 - "unitsA.test.ts"
Cohesion: 0.11
Nodes (17): getLesson(), BoardMark, ExplainStep, PracticeStep, allMoves(), gain(), IDS, lessons (+9 more)

### Community 38 - "ReviewGameScreen.tsx"
Cohesion: 0.18
Nodes (20): positionConcept(), moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, reportReviewed, clamp() (+12 more)

### Community 39 - "ErrorLessonPlayer.tsx"
Cohesion: 0.05
Nodes (78): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Menor, chessground, ErrorLesson, run(), throwing (+70 more)

### Community 40 - "ShopScreen.tsx"
Cohesion: 0.09
Nodes (46): Shop, ShopItem, Coin(), MiniBoard(), PieceCode, ProtectorArt(), ROLE, SAMPLE_BOARD (+38 more)

### Community 41 - "Estado del proyecto (handoff document)"
Cohesion: 0.22
Nodes (9): Estado del proyecto (handoff document), Pending work list (ordered), Phase 1: pedagogical prototype (CLI), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games) (+1 more)

### Community 42 - "mirror.ts"
Cohesion: 0.23
Nodes (13): Estado tras la corrección (2026-11-14, mismo día), Lo que NO pude verificar, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14, COLOR, flipRank(), mirrorExercise() (+5 more)

### Community 43 - "src/types.ts"
Cohesion: 0.13
Nodes (24): buildValues(), capitalize(), engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover(), pawnsText() (+16 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.29
Nodes (6): Chedex currency (1 per 5 streak days), User decisions changing the founding document, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), cburnett pieces (GPLv2+)

### Community 45 - "App.tsx"
Cohesion: 0.10
Nodes (29): AdminScreen, App(), CreditsScreen, LessonScreen, LevelScreen, MapScreen, NotFound(), PrivacyScreen (+21 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.40
Nodes (5): Decision: license whole repo GPL-3.0-or-later, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later), Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "vitest"
Cohesion: 0.13
Nodes (21): vitest, leaksIn(), Target, targetOf(), targetsOf(), targetsOfLine(), per, rows (+13 more)

### Community 49 - "lib.test.ts"
Cohesion: 0.18
Nodes (19): add(), auditPractice(), runEngine(), sanOf(), checkMateClaim(), checkMaterialClaim(), compareSolution(), f() (+11 more)

### Community 55 - "check-piece-bounds.mts"
Cohesion: 0.13
Nodes (12): args, asJson, Box, chrome(), data, errs, LIMITS, measure() (+4 more)

### Community 56 - "createContext"
Cohesion: 0.36
Nodes (11): suggestLevel(), createContext(), chosenLevel(), levelEffect(), loadProfile(), profileFor(), progressMap(), levelPlan() (+3 more)

### Community 57 - "u16.ts"
Cohesion: 0.20
Nodes (8): c(), ClaimLike, lesson(), Row, step(), Text, U16_TEXTS, unit

### Community 58 - "stockfish-proc.cjs"
Cohesion: 0.29
Nodes (5): js, path, queue, readline, wasm

### Community 59 - "Auditoría automática de contenido · 2026-11-14"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-14, Aviso, Importante, Resumen

### Community 60 - "Repasos espaciados y sesión diaria — diseño"
Cohesion: 0.20
Nodes (9): Aclaraciones tras la revisión del constructor, Antiobjetivos, Enfoques considerados, Intención, Mis llamadas, No objetivos, Objetivos, Para el constructor (+1 more)

### Community 61 - "chessops"
Cohesion: 0.21
Nodes (15): chessops, checkClaim(), Claim, describeStrategy(), load(), parseSquareName(), sq(), StrategyFacts (+7 more)

### Community 62 - "cut-pieces.py"
Cohesion: 0.20
Nodes (4): main(), pieces_of(), render(), targets()

### Community 63 - "worker/index.ts"
Cohesion: 0.42
Nodes (6): d1Db(), D1Like, appFor(), Env, fetch(), scheduled()

### Community 64 - "UciSession"
Cohesion: 0.17
Nodes (3): UciSession, fake(), BrowserEngine

### Community 65 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, chessground@^9.2.1, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, react-dom (+1 more)

### Community 66 - "Hallazgos"
Cohesion: 0.22
Nodes (8): Auditoría plena 01: código y estructura (2026-11-15), Cambios en archivos de pantalla (excepciones declaradas), Hallazgos, Lo que NO pude verificar, Métricas, Resumen, Revisado y correcto (sin hallazgo), Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor

### Community 68 - "EngineLike"
Cohesion: 0.13
Nodes (9): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba, EngineLike (+1 more)

### Community 69 - "vite.config.ts"
Cohesion: 0.22
Nodes (6): vite@^8.3.8, @vitejs/plugin-react@^6.3.0, vite, @vitejs/plugin-react, LESSONS, root

### Community 70 - "d1-races.test.ts"
Cohesion: 0.15
Nodes (10): clock, due(), exec(), lesson, SECRET, streak4(), today, units (+2 more)

### Community 71 - "gen-strategy.mts"
Cohesion: 0.36
Nodes (7): build(), kind, N, pick(), rnd(), seed, sf

### Community 72 - "EngineResult"
Cohesion: 0.23
Nodes (4): cpFor(), EngineResult, FakeEngine, CorpusGame

### Community 73 - "cli.ts"
Cohesion: 0.25
Nodes (5): args, depth, file, level, LEVELS

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "unitsE.test.ts"
Cohesion: 0.29
Nodes (8): ENDGAME_UNITS, linePositions(), load(), probe, ROLE, sansNear(), textErrors(), units

### Community 76 - "Analizador de partidas: errores graves sin causa tipificada (2026-11-21)"
Cohesion: 0.29
Nodes (6): Analizador de partidas: errores graves sin causa tipificada (2026-11-21), Diseño, Informe y entrenamiento, Límites conocidos, Medición previa (corpus guardado, sin motor), Problema

### Community 77 - "analysis/engine.ts"
Cohesion: 0.38
Nodes (4): enginePath(), require_, HASH_MB, UciTransport

### Community 78 - "build.mts"
Cohesion: 0.17
Nodes (10): AuditEngine, enginePath(), PvLine, have, JOBS, OUT, queue, sources (+2 more)

### Community 79 - "copy-engine.mjs"
Cohesion: 0.33
Nodes (4): out, pkg, root, src

### Community 80 - "theme.test.ts"
Cohesion: 0.25
Nodes (8): contrast(), lin(), luminance(), Pair, PAIRS, cssFiles, SRC, walk()

### Community 81 - "Auditoría automática de contenido · 2026-11-20"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-20, Aviso, Importante, Resumen

### Community 84 - "report.ts"
Cohesion: 0.18
Nodes (15): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), Color (+7 more)

### Community 85 - "playLine"
Cohesion: 0.18
Nodes (16): buildCtx(), loadPosition(), playLine(), diagnoseMissedTactic(), EvalState, MoveClass, Score, mk() (+8 more)

### Community 87 - "Auditoría plena 02: diseño visual, UI y accesibilidad"
Cohesion: 0.20
Nodes (9): Arreglo posterior (2026-11-21): maquetación horizontal real en móvil apaisado, Arreglos posteriores (2026-11-15): tablero bajo la cabecera y nombre de usuario, Auditoría plena 02: diseño visual, UI y accesibilidad, Cómo se midió y qué quedó fuera del repositorio, Datos de contraste y tamaño (muestras medidas), Hallazgos, Lo que no se arregló y por qué, No verificado (+1 more)

### Community 88 - "Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)"
Cohesion: 0.22
Nodes (8): Arreglo de X1 (2026-11-15): la portada ya no espera a `/api/me`, Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15), Hallazgos, Método, Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión), No verificado, Resumen, Verificación

### Community 91 - "LessonPlayer.tsx"
Cohesion: 0.12
Nodes (21): react, Lesson, api, IconName, PATHS, LessonPlayer(), finish(), toEval() (+13 more)

### Community 92 - "navigate"
Cohesion: 0.23
Nodes (14): catalogCredits(), creditRows(), navigate(), replaceSearch(), AuthScreen(), LichessLogin(), mock(), CreditsScreen() (+6 more)

### Community 93 - "POST /api/review/complete and cp_reviewed_games"
Cohesion: 0.40
Nodes (5): Phase 3: personalization (game analysis, weak points), D1 cp_* tables, CREATE IF NOT EXISTS only, Wallet ledger (cp_wallet_ledger), server-side prices, POST /api/review/complete and cp_reviewed_games, topWeakConcepts and Profile weak points section

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 595 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `review/types.ts`, `context.ts`, `ReviewScreen.tsx`, `devDependencies`, `select.ts`, `lesson-checks.ts`, `ref_node_fs`, `Icon`, `shared/api.ts`, `access.test.ts`, `ReportScreen.tsx`, `api.test.ts`, `worker/shop.ts`, `error-lesson.test.ts`, `placement.ts`, `session.ts`, `package.json`, `levels.ts`, `validation.test.ts`, `unitsA.test.ts`, `ReviewGameScreen.tsx`, `ErrorLessonPlayer.tsx`, `ShopScreen.tsx`, `mirror.ts`, `src/types.ts`, `App.tsx`, `lib.test.ts`, `chessops`, `UciSession`, `d1-races.test.ts`, `unitsE.test.ts`, `theme.test.ts`, `report.ts`, `playLine`, `LessonPlayer.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `content/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10612244897959183 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `chessops` to `core.ts`, `select.ts`, `chess-utils.ts`, `lesson-checks.ts`, `error-lesson.ts`, `lib.ts`, `audit-content.ts`, `tablebase.ts`, `verify-fase4.mts`, `error-lesson.test.ts`, `session.ts`, `package.json`, `validation.test.ts`, `lessons.ts`, `unitsA.test.ts`, `ErrorLessonPlayer.tsx`, `mirror.ts`, `src/types.ts`, `vitest`, `dependencies`, `gen-strategy.mts`, `unitsE.test.ts`, `playLine`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Should `ReviewScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06936026936026936 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `content/index.ts`, `Hallazgos`, `context.ts`, `cli.ts`, `error-lesson.ts`, `src/types.ts`, `LandingSections.tsx`, `Icon`, `vitest`, `ReportScreen.tsx`, `error-lesson.test.ts`, `mock.ts`, `session.ts`, `navigate`, `levels.ts`, `validation.test.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `select.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10852713178294573 - nodes in this community are weakly interconnected._