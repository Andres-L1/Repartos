# Graph Report - agent-afb3cd889b02b4fc1  (2026-11-23)

## Corpus Check
- 311 files · ~403,445 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 39 file(s) not represented in the graph (top: .css 16, .pgn 12, (none) 4)

## Summary
- 2207 nodes · 6082 edges · 90 communities (84 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 236 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a14d663c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- content/index.ts
- core.ts
- games.test.ts
- app.ts
- useReview.ts
- package.json
- select.ts
- chess-utils.ts
- unitsRusoB.facts.ts
- LandingSections.tsx
- error-lesson.ts
- lib.ts
- ref_node_fs
- Icon
- audit-content.ts
- d1-races.test.ts
- shared/api.ts
- review-copy.ts
- access.test.ts
- ReportScreen.tsx
- tablebase.ts
- api.test.ts
- verify-fase4.mts
- context.ts
- error-lesson.test.ts
- vitest
- placement.ts
- review/srs.ts
- unitsRusoA.test.ts
- why.ts
- src/types.ts
- Rúbrica
- unitsRusoC.test.ts
- compilerOptions
- Chedex Pulse chess training platform
- session.ts
- Plan: analysis of last 10 Lichess games
- PracticeBoard.tsx
- ReviewGameScreen.tsx
- sound.ts
- ShopScreen.tsx
- Estado del proyecto (handoff document)
- ai.ts
- ErrorLessonPlayer.tsx
- Shop and Chedex currency design
- App.tsx
- Decision: license whole repo GPL-3.0-or-later
- Plan: student level and weak points
- branches.test.ts
- openings/index.ts
- graphify skill trigger (/graphify)
- DM Sans font (SIL OFL 1.1)
- hono and react (MIT)
- env.d.ts
- check-piece-bounds.mts
- worker/openings.ts
- u16.ts
- stockfish-proc.cjs
- Auditoría automática de contenido · 2026-11-14
- Repasos espaciados y sesión diaria — diseño
- chessops
- cut-pieces.py
- db.ts
- UciSession
- SessionScreen.tsx
- PracticeBoard
- EngineLike
- Auditor de contenido
- Fase 4 · Contenido hasta 2000 Elo (diseño)
- ReviewScreen.tsx
- gen-strategy.mts
- EngineResult
- report.ts
- Auditoría automática de contenido · 2026-11-15
- unitsE.test.ts
- Analizador de partidas: errores graves sin causa tipificada (2026-11-21)
- analysis/engine.ts
- runEngine
- Método ruso: nueva parte inicial de la ruta — diseño
- D1StatementLike
- Auditoría automática de contenido · 2026-11-20
- Hallazgos
- select.test.ts
- playLine
- Auditoría plena 02: diseño visual, UI y accesibilidad
- Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)
- LessonPlayer.tsx
- session.tsx
- POST /api/review/complete and cp_reviewed_games

## God Nodes (most connected - your core abstractions)
1. `vitest` - 71 edges
2. `Icon()` - 55 edges
3. `chessops` - 52 edges
4. `Unit` - 45 edges
5. `Level` - 40 edges
6. `react` - 32 edges
7. `Link()` - 32 edges
8. `App()` - 31 edges
9. `navigate()` - 31 edges
10. `useSession()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14` --references--> `checkLine()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → scripts/lib/tablebase.ts
- `Problema` --references--> `keyErrors()`  [INFERRED]
  docs/superpowers/specs/2026-11-21-analizador-sin-causa-design.md → src/review/select.ts
- `u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`)` --references--> `themeForConcept()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/review/srs.ts
- `Compatibilidad` --references--> `eloRange()`  [INFERRED]
  docs/calibracion-niveles-2026-11.md → src/shared/levels.ts
- `u15 «Finales de torre: nivel Avanzado» (`advanced`, `order` 14, `requires: ['u14']`; u12 pasa a `order` 15)` --references--> `isExpectedMove()`  [INFERRED]
  docs/superpowers/specs/2026-11-14-contenido-hasta-2000-design.md → src/shared/moves.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game review pipeline (fetch, analyze, key errors, mini lesson, report)** — docs_superpowers_plans_2026_11_13_analisis_de_partidas_lichess_games, docs_superpowers_plans_2026_11_13_analisis_de_partidas_engine_like, docs_superpowers_plans_2026_11_13_analisis_de_partidas_key_errors_report, docs_superpowers_plans_2026_11_13_analisis_de_partidas_error_lesson, docs_superpowers_plans_2026_11_13_analisis_de_partidas_ui_screens [EXTRACTED 1.00]
- **Student level flow (suggestion, choice, map effect, weak points)** — docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_levels_module, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_server, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_level_screen, docs_superpowers_plans_2026_11_13_nivel_del_alumno_y_puntos_debiles_weak_concepts [EXTRACTED 1.00]
- **Third-party components and license texts bundled in Chedex Pulse** — third_party_notices_chessground, third_party_notices_chessops, third_party_notices_stockfish, third_party_notices_cburnett_pieces, third_party_notices_sfx_sounds, third_party_notices_dm_sans, third_party_notices_hono_react [EXTRACTED 1.00]

## Communities (90 total, 6 thin omitted)

### Community 0 - "content/index.ts"
Cohesion: 0.07
Nodes (38): Formato y verificación (igual que u01-u06), isTb(), stepsOf(), TB_SINGLE, TbStep, tbSteps(), lessonsForConcept(), Lesson (+30 more)

### Community 1 - "core.ts"
Cohesion: 0.17
Nodes (19): have, JOBS, OUT, queue, sources, abortError(), analyzeWith(), AnalyzeWithOptions (+11 more)

### Community 2 - "games.test.ts"
Cohesion: 0.22
Nodes (13): fetchRecentGames(), LichessError, LichessErrorKind, BAD_STATUS, gamesUrl(), parseNdjson(), pickGames(), player() (+5 more)

### Community 3 - "app.ts"
Cohesion: 0.23
Nodes (20): hono, isValidUsername(), cacheKey(), createApp(), AppContext, Ctx, Env, HttpError (+12 more)

### Community 4 - "useReview.ts"
Cohesion: 0.08
Nodes (26): analysisKey(), ENGINE_TAG, REVIEW_DEPTH, MIN_GAMES, GameAnalysis, ReviewGame, games(), mk() (+18 more)

### Community 5 - "package.json"
Cohesion: 0.05
Nodes (46): dependencies, chessops@^0.14.0, hono@^4.13.18, react@^19.3.1, react-dom@^19.3.1, stockfish@^16.0.0, description, devDependencies (+38 more)

### Community 6 - "select.ts"
Cohesion: 0.12
Nodes (31): analyses, chosen, club, ndjson, pick, seen, sides, tiersOf() (+23 more)

### Community 7 - "chess-utils.ts"
Cohesion: 0.16
Nodes (35): Repasos espaciados y sesión diaria — plan de implementación, Restricciones globales, Restricciones, balance(), canCaptureOn(), capitalize(), colorName(), Ctx (+27 more)

### Community 8 - "unitsRusoB.facts.ts"
Cohesion: 0.06
Nodes (62): RUSO_B, CONCEPTS, Concept, CONCEPT_IDS, describeLessons(), forcedMateIn2(), LessonCheckOptions, mate1() (+54 more)

### Community 9 - "LandingSections.tsx"
Cohesion: 0.13
Nodes (27): Coin(), Closing(), HeroArt(), HeroVisual(), Landing(), LichessData(), PrimaryCta(), AVAILABLE_FALLBACK (+19 more)

### Community 10 - "error-lesson.ts"
Cohesion: 0.15
Nodes (32): Mini lección sin causa (`buildErrorLesson`, `kind: 'missed' | 'engine'`), after(), arrow(), buildCauseLesson(), buildErrorLesson(), buildGenericLesson(), buildPause(), capturersOn() (+24 more)

### Community 11 - "lib.ts"
Cohesion: 0.11
Nodes (35): auditPractice(), sanOf(), alreadyPlayed(), BLAME, checkMateClaim(), checkMaterialClaim(), checkSanMentions(), Claims (+27 more)

### Community 12 - "ref_node_fs"
Cohesion: 0.08
Nodes (17): PvLine, out, out, pkg, root, src, analyzed, DIR (+9 more)

### Community 13 - "Icon"
Cohesion: 0.11
Nodes (33): react, topWeakConcepts(), MapUnit, OpeningsStats, eloRange(), Numbered, numberUnits(), api (+25 more)

### Community 14 - "audit-content.ts"
Cohesion: 0.08
Nodes (26): argv, count, cursors, date, depth, DISCLAIMER, esc(), fileText() (+18 more)

### Community 15 - "d1-races.test.ts"
Cohesion: 0.11
Nodes (32): N(), all(), clock, due(), exec(), lesson, SECRET, streak4() (+24 more)

### Community 16 - "shared/api.ts"
Cohesion: 0.06
Nodes (51): Task 5: Pantalla «Entrenar hoy», ReviewPosition, AccessOverview, AccessRequest, AiUsage, AllowedUser, AnswerBody, AnswerResult (+43 more)

### Community 17 - "review-copy.ts"
Cohesion: 0.09
Nodes (35): buildValues(), capitalize(), engineLine(), explain(), fillTemplate(), joinList(), mateAgainstMover(), pawnsText() (+27 more)

### Community 18 - "access.test.ts"
Cohesion: 0.21
Nodes (9): NOW, own, SECRET, setup(), units, MAX_ALLOWED, MAX_REQUESTS, recordDenied() (+1 more)

### Community 19 - "ReportScreen.tsx"
Cohesion: 0.17
Nodes (18): Report, Strength, lessonsForConcept(), CONCEPT_PHRASE, conceptShort(), conceptTitle(), headline(), inaccuracySentence() (+10 more)

### Community 20 - "tablebase.ts"
Cohesion: 0.07
Nodes (56): f(), branchesFor(), cache, dist(), fenOf(), get(), rivalMove(), studentKeep() (+48 more)

### Community 21 - "api.test.ts"
Cohesion: 0.12
Nodes (18): setup(), clock, lesson(), LichessMock, placementUnits, pu(), SECRET, setup() (+10 more)

### Community 22 - "verify-fase4.mts"
Cohesion: 0.17
Nodes (16): expand(), FASE4, legalMoves(), matesInOne(), args, checkStep(), DEPTH, fmt() (+8 more)

### Community 23 - "context.ts"
Cohesion: 0.07
Nodes (49): Auditoría plena 01: código y estructura (2026-11-15), Cambios en archivos de pantalla (excepciones declaradas), Hallazgos, Lo que NO pude verificar, Métricas, Resumen, Seguimiento (2026-11-15): lo que quedó sin arreglar en servidor, Hallazgos (+41 more)

### Community 24 - "error-lesson.test.ts"
Cohesion: 0.11
Nodes (17): HAPPENED, KeyError, AnalyzedMove, Diagnosis, ALL, C, CauseKE, CONCEPT_IDS (+9 more)

### Community 25 - "vitest"
Cohesion: 0.05
Nodes (52): vitest, PlacementSeen, SeenPerf, hasRating(), HINT_MIN_GAMES, levelForRating(), LevelInfo, LEVELS (+44 more)

### Community 26 - "placement.ts"
Cohesion: 0.11
Nodes (21): Calibración de niveles y puzles con datos reales de Lichess (2026-11-21), Compatibilidad, Decisión por corte (rápidas como referencia), Distribución real (2026-11-21), Fuentes, Límites, Por qué un jugador quedaba como principiante, Puzles por nivel (+13 more)

### Community 27 - "review/srs.ts"
Cohesion: 0.08
Nodes (32): Foco de revisión, Task 1: Calendario y puzles (módulo puro), Task 3: Depósito de puzles, Task 4: API de la sesión, Task 6: Cierre, BOX_DAYS, conceptForThemes(), DIFFICULTY_BY_LEVEL (+24 more)

### Community 28 - "unitsRusoA.test.ts"
Cohesion: 0.06
Nodes (51): acceptedAt(), ANTI, attackedBy(), boardOf(), capture(), captureUnprotected(), castle(), checkClaim() (+43 more)

### Community 29 - "why.ts"
Cohesion: 0.09
Nodes (45): findPins(), Step, withTurnFlipped(), a(), ado(), assemble(), at(), atA() (+37 more)

### Community 30 - "src/types.ts"
Cohesion: 0.08
Nodes (28): args, depth, file, level, LEVELS, LEVEL_ORDER, priority(), recommend() (+20 more)

### Community 31 - "Rúbrica"
Cohesion: 0.18
Nodes (10): 1. Corrección (ajedrez), 2. Progresión, 3. Carga de texto, 4. Tono por nivel, 5. Claridad, 6. Accesibilidad del lenguaje, Cómo trabajar, Formato del informe (+2 more)

### Community 32 - "unitsRusoC.test.ts"
Cohesion: 0.09
Nodes (33): accepted(), attackedBy(), attacksFrom(), canCastle(), CENTER, centerControlled(), HOME, load() (+25 more)

### Community 33 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 34 - "Chedex Pulse chess training platform"
Cohesion: 0.16
Nodes (15): Separate educational content from GPL, Phase 2 architecture (web, Hono Worker, D1), BILLING_MODE beta_open (payments disabled), Manual deployment steps, Lichess OAuth PKCE and sealed session cookie, Educational content reserved (c) Chedex, Chedex Pulse GPL-3.0-or-later notice, Chedex Pulse chess training platform (+7 more)

### Community 35 - "session.ts"
Cohesion: 0.08
Nodes (49): Task 2: Datos del servidor y errores propios, ENGINE_ONLY_CONCEPT_ID, dueAfter(), SessionItem, ok, loadProfile(), profileFor(), isInt() (+41 more)

### Community 36 - "Plan: analysis of last 10 Lichess games"
Cohesion: 0.19
Nodes (14): Known issues to polish, EngineLike and analyzeWith (injectable engine), ErrorLesson and buildErrorLesson, keyErrors and buildReport, Lichess games fetch and filtering, Plan: analysis of last 10 Lichess games, Independent quality review agent, Review runner, cache and useReview (+6 more)

### Community 37 - "PracticeBoard.tsx"
Cohesion: 0.16
Nodes (18): chessground@^9.2.1, chessground, Dests, ES_PIECES, isInCheck(), legalDests(), PROMO_ROLES, threatenedPawns() (+10 more)

### Community 38 - "ReviewGameScreen.tsx"
Cohesion: 0.17
Nodes (21): positionConcept(), moves, GameViewer(), onKey(), isTextField(), KEY_ACTION, reportReviewed, clamp() (+13 more)

### Community 39 - "sound.ts"
Cohesion: 0.11
Nodes (25): throwing, onBestMove(), countPieces(), EAGER, FILES, installUnlock(), isMuted(), listeners (+17 more)

### Community 40 - "ShopScreen.tsx"
Cohesion: 0.09
Nodes (45): Shop, ShopItem, MiniBoard(), PieceCode, ProtectorArt(), ROLE, SAMPLE_BOARD, SAMPLE_PIECES (+37 more)

### Community 41 - "Estado del proyecto (handoff document)"
Cohesion: 0.22
Nodes (9): Estado del proyecto (handoff document), Pending work list (ordered), Phase 1: pedagogical prototype (CLI), Phase 4: content up to 2000 Elo (pending), Stack: React 19 + Vite, Hono Worker, D1, Vitest, Golden and coherence tests, Known limits of diagnosis (68% without cause), Phase 1 validation report (11 sample games) (+1 more)

### Community 42 - "ai.ts"
Cohesion: 0.10
Nodes (30): lesson, NOW, SECRET, units, aiCleanupStmts(), AiRuntime, AiTransport, bump() (+22 more)

### Community 43 - "ErrorLessonPlayer.tsx"
Cohesion: 0.11
Nodes (19): ErrorLesson, run(), BestPhase, ErrorLessonPlayer(), MOMENTS, Props, TONE_BRUSH, TypedMove() (+11 more)

### Community 44 - "Shop and Chedex currency design"
Cohesion: 0.29
Nodes (6): Chedex currency (1 per 5 streak days), User decisions changing the founding document, Single shop catalog (src/shop/catalog.ts), Shop and Chedex currency design, Streak protector (max 2), cburnett pieces (GPLv2+)

### Community 45 - "App.tsx"
Cohesion: 0.08
Nodes (49): CatalogItem, ShopKind, USE_MOCK, AdminScreen, App(), CreditsScreen, LessonScreen, LevelScreen (+41 more)

### Community 46 - "Decision: license whole repo GPL-3.0-or-later"
Cohesion: 0.40
Nodes (5): Decision: license whole repo GPL-3.0-or-later, chessground (GPL-3.0-or-later), chessops (GPL-3.0-or-later), Lichess sfx sounds (AGPL-3.0-or-later), Lichess sfx sound files license (Enigmahack, AGPLv3+)

### Community 47 - "Plan: student level and weak points"
Cohesion: 0.33
Nodes (7): Phase 2: initial platform with student-chosen level, Initial placement by Lichess Elo (replaced by chosen level), LevelScreen at /bienvenida, cp_user_level, /api/level and levelPlan, levels.ts (LEVELS, levelForRating, suggestLevel), Plan: student level and weak points, Spec: student level and weak points design

### Community 48 - "branches.test.ts"
Cohesion: 0.09
Nodes (36): Estado tras la corrección (2026-11-14, mismo día), Lo que NO pude verificar, Qué sí verifiqué y cómo, Resumen, Revisión pedagógica y de ajedrez · 2026-11-14, leaksIn(), Target, targetOf() (+28 more)

### Community 49 - "openings/index.ts"
Cohesion: 0.14
Nodes (22): BookMove, bookMoves(), buildIndex(), keyOfFen(), keyOfPos(), Node, Opening, openingAt() (+14 more)

### Community 55 - "check-piece-bounds.mts"
Cohesion: 0.13
Nodes (12): args, asJson, Box, chrome(), data, errs, LIMITS, measure() (+4 more)

### Community 56 - "worker/openings.ts"
Cohesion: 0.13
Nodes (17): ON, REPLY, SECRET, T0, dayOf(), MAX_CACHE_ROWS, MAX_FEN_LEN, openingsCleanupStmts() (+9 more)

### Community 57 - "u16.ts"
Cohesion: 0.17
Nodes (10): BoardMark, ExplainStep, c(), ClaimLike, lesson(), Row, step(), Text (+2 more)

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

### Community 63 - "db.ts"
Cohesion: 0.21
Nodes (10): MIGRATIONS_DIR, Limiter, d1Db(), D1Like, SqlValue, Stmt, appFor(), Env (+2 more)

### Community 64 - "UciSession"
Cohesion: 0.22
Nodes (3): Revisado y correcto (sin hallazgo), UciSession, fake()

### Community 65 - "SessionScreen.tsx"
Cohesion: 0.22
Nodes (17): lastMoveOf(), conceptName(), dueText(), errMsg(), Fail, formatDay(), Intro(), ItemView() (+9 more)

### Community 66 - "PracticeBoard"
Cohesion: 0.27
Nodes (15): applyUci(), canonicalUci(), needsPromotion(), parseTypedMove(), posFromFen(), sanOfUci(), PracticeBoard(), attempt() (+7 more)

### Community 67 - "EngineLike"
Cohesion: 0.16
Nodes (3): EngineLike, FakeWorker, BrowserEngine

### Community 68 - "Auditor de contenido"
Cohesion: 0.25
Nodes (7): Analyze, Archivos, Auditor de contenido, Cómo se corre, Límites, Pasada estricta de Fase 4 (`--fase4`), Qué comprueba

### Community 69 - "Fase 4 · Contenido hasta 2000 Elo (diseño)"
Cohesion: 0.17
Nodes (11): Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14, Decisiones abiertas para el usuario, Estado tras la segunda tanda (2026-11-15), Fase 4 · Contenido hasta 2000 Elo (diseño), Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una), Punto de partida (comprobado en el código), Quinta tanda (2026-11-15): u15 torre Avanzado y u16 estrategia verificable, Regla para que una lección entre en repasos y sesión (+3 more)

### Community 70 - "ReviewScreen.tsx"
Cohesion: 0.29
Nodes (9): useReview(), Failure, failureOf(), GameRow(), Panel(), RateLimited(), RESULT_LABEL, ReviewScreen() (+1 more)

### Community 71 - "gen-strategy.mts"
Cohesion: 0.16
Nodes (10): build(), kind, N, pick(), rnd(), seed, sf, Line (+2 more)

### Community 72 - "EngineResult"
Cohesion: 0.16
Nodes (5): cpFor(), EngineResult, FakeEngine, CorpusGame, FakeEngine

### Community 73 - "report.ts"
Cohesion: 0.33
Nodes (8): buildReport(), computeStrengths(), errorRate(), isError(), phaseOf(), ReportError, studentMoves(), Phase

### Community 74 - "Auditoría automática de contenido · 2026-11-15"
Cohesion: 0.33
Nodes (5): Auditoría automática de contenido · 2026-11-15, Aviso, Importante, Resumen, Revisión de los hallazgos (a mano, 2026-11-15, actualizada tras corregir el auditor)

### Community 75 - "unitsE.test.ts"
Cohesion: 0.25
Nodes (9): ENDGAME_UNITS, linePositions(), load(), probe, ROLE, sansNear(), textErrors(), units (+1 more)

### Community 76 - "Analizador de partidas: errores graves sin causa tipificada (2026-11-21)"
Cohesion: 0.25
Nodes (7): Analizador de partidas: errores graves sin causa tipificada (2026-11-21), Diseño, Informe y entrenamiento, Límites conocidos, Medición previa (corpus guardado, sin motor), Problema, dueConcepts()

### Community 77 - "analysis/engine.ts"
Cohesion: 0.26
Nodes (7): analyzeGame(), AnalyzeOptions, Engine, enginePath(), require_, HASH_MB, UciTransport

### Community 78 - "runEngine"
Cohesion: 0.43
Nodes (5): add(), runEngine(), AuditEngine, enginePath(), worker()

### Community 79 - "Método ruso: nueva parte inicial de la ruta — diseño"
Cohesion: 0.33
Nodes (5): Estilo del método ruso, Método ruso: nueva parte inicial de la ruta — diseño, Orden pedagógico (decisión del usuario), Unidades nuevas (ids sin colisión con las existentes u07 a u16), Verificación (todo por código, sin inventar)

### Community 81 - "Auditoría automática de contenido · 2026-11-20"
Cohesion: 0.40
Nodes (4): Auditoría automática de contenido · 2026-11-20, Aviso, Importante, Resumen

### Community 82 - "Hallazgos"
Cohesion: 0.50
Nodes (4): Crítico (enseña algo falso o da por mala una solución correcta), Hallazgos, Importante, Menor

### Community 84 - "select.test.ts"
Cohesion: 0.29
Nodes (8): game(), mv(), rg(), err(), filler(), games3, kind, real()

### Community 85 - "playLine"
Cohesion: 0.18
Nodes (19): buildCtx(), loadPosition(), playLine(), diagnoseMissedTactic(), EvalState, play(), mk(), mk() (+11 more)

### Community 87 - "Auditoría plena 02: diseño visual, UI y accesibilidad"
Cohesion: 0.20
Nodes (9): Arreglo posterior (2026-11-21): maquetación horizontal real en móvil apaisado, Arreglos posteriores (2026-11-15): tablero bajo la cabecera y nombre de usuario, Auditoría plena 02: diseño visual, UI y accesibilidad, Cómo se midió y qué quedó fuera del repositorio, Datos de contraste y tamaño (muestras medidas), Hallazgos, Lo que no se arregló y por qué, No verificado (+1 more)

### Community 88 - "Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)"
Cohesion: 0.25
Nodes (7): Arreglo de X1 (2026-11-15): la portada ya no espera a `/api/me`, Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15), Método, Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión), No verificado, Resumen, Verificación

### Community 91 - "LessonPlayer.tsx"
Cohesion: 0.16
Nodes (15): LessonProgress, Profile, CompleteResponse, LessonPlayer(), finish(), toEval(), toExplain(), toPractice() (+7 more)

### Community 92 - "session.tsx"
Cohesion: 0.13
Nodes (10): User, setApiHandlers(), setReviewUser, confirm(), Ctx, SessionProvider(), SessionValue, DEFAULT_EQUIPPED (+2 more)

### Community 93 - "POST /api/review/complete and cp_reviewed_games"
Cohesion: 0.40
Nodes (5): Phase 3: personalization (game analysis, weak points), D1 cp_* tables, CREATE IF NOT EXISTS only, Wallet ledger (cp_wallet_ledger), server-side prices, POST /api/review/complete and cp_reviewed_games, topWeakConcepts and Profile weak points section

## Knowledge Gaps
- **18 isolated node(s):** `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)`, `Repository structure (web, worker, migrations, src, docs)`, `Lichess games fetch and filtering` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 714 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `content/index.ts`, `core.ts`, `games.test.ts`, `useReview.ts`, `package.json`, `select.ts`, `unitsRusoB.facts.ts`, `lib.ts`, `ref_node_fs`, `Icon`, `d1-races.test.ts`, `shared/api.ts`, `access.test.ts`, `ReportScreen.tsx`, `api.test.ts`, `context.ts`, `error-lesson.test.ts`, `placement.ts`, `review/srs.ts`, `unitsRusoA.test.ts`, `why.ts`, `src/types.ts`, `unitsRusoC.test.ts`, `session.ts`, `ReviewGameScreen.tsx`, `sound.ts`, `ShopScreen.tsx`, `ai.ts`, `ErrorLessonPlayer.tsx`, `App.tsx`, `branches.test.ts`, `openings/index.ts`, `worker/openings.ts`, `chessops`, `UciSession`, `PracticeBoard`, `EngineLike`, `unitsE.test.ts`, `analysis/engine.ts`, `select.test.ts`, `playLine`, `LessonPlayer.tsx`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **What connects `Web app HTML shell (dark theme, React root)`, `BILLING_MODE beta_open (payments disabled)`, `Learning path (units and lessons, 0-800 Elo)` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `content/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07034431691965938 - nodes in this community are weakly interconnected._
- **Why does `chessops` connect `chessops` to `core.ts`, `package.json`, `select.ts`, `chess-utils.ts`, `unitsRusoB.facts.ts`, `error-lesson.ts`, `lib.ts`, `ref_node_fs`, `audit-content.ts`, `review-copy.ts`, `tablebase.ts`, `verify-fase4.mts`, `error-lesson.test.ts`, `review/srs.ts`, `unitsRusoA.test.ts`, `why.ts`, `src/types.ts`, `unitsRusoC.test.ts`, `session.ts`, `PracticeBoard.tsx`, `branches.test.ts`, `openings/index.ts`, `worker/openings.ts`, `gen-strategy.mts`, `unitsE.test.ts`, `playLine`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Should `useReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08350951374207188 - nodes in this community are weakly interconnected._
- **Why does `Level` connect `shared/api.ts` to `content/index.ts`, `session.ts`, `LandingSections.tsx`, `error-lesson.ts`, `LessonPlayer.tsx`, `Icon`, `branches.test.ts`, `review-copy.ts`, `ReportScreen.tsx`, `context.ts`, `error-lesson.test.ts`, `vitest`, `review/srs.ts`, `session.tsx`, `src/types.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.050170068027210885 - nodes in this community are weakly interconnected._