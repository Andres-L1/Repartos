# Nivel del alumno y puntos débiles — plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans. Pasos con casillas `- [ ]`.

**Objetivo:** el alumno elige su nivel entre 6 tarjetas (Lichess solo sugiere), ese nivel gobierna mapa y textos, y el Perfil muestra sus 3 puntos débiles con salida a practicarlos.

**Arquitectura:** módulo puro compartido de niveles (`src/shared/levels.ts`) → tabla `cp_user_level` + endpoints en el Worker (una sola vía para el efecto en el mapa) → pantalla de nivel en `/bienvenida` y sección de puntos débiles en el Perfil.

**Stack:** TypeScript, Hono + D1 (`worker/`), React 19 + Vite (`web/`), Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-nivel-del-alumno-y-puntos-debiles-design.md`

## Restricciones globales

- D1: solo `CREATE TABLE IF NOT EXISTS`, tablas `cp_*` (hay un test que lo exige). Ninguna clave en el repo.
- Sugerencia calculada con `cp_placement_seen` (sin llamadas nuevas a Lichess); reutiliza `isReliable`/estados existentes.
- Bandas con límite inferior incluido: Principiante 0–400, Iniciación 400–800, Básico 800–1100, Intermedio 1100–1400, Avanzado 1400–1700, Competitivo 1700–2000; 2000 o más es Competitivo.
- Qué niveles tienen contenido se deduce de `unit.level` del temario, no se escribe a mano.
- Una sola vía de efecto en el mapa: el nivel elegido sustituye a `placementEffect`/`PLACEMENT_BANDS`; se eliminan `POST /api/placement`, el campo `mode` y los tests de bandas obsoletos; `cp_placement` y `cp_placement_seen` se conservan.
- `/api/me` devuelve `level` (el elegido; sin elección `initiation`, nunca `levelForXp`) y `levelChosen: boolean`.
- Español claro, sin emojis (iconos SVG), responsive desde 320 px, toques de 44 px, nunca mostrar ids crudos al alumno.
- Sin nivel elegido: el mapa funciona sin efecto de colocación y los textos usan iniciación; el progreso existente no cambia.
- Commits directos en `main` con `git add <rutas>` explícitas y la línea final `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. No hacer push ni desplegar sin orden del usuario.

## Foco de revisión

1. Sin datos de Lichess (`seen` nulo, todo ausente o inválido): sin sugerencia, las tarjetas siguen eligiéndose. (T1, T3)
2. Elo en una frontera (400, 800, 1100, 1400, 1700) y 2000 o más. (T1)
3. Usuario existente con `cp_placement.mode = 'lichess'` y progreso: no pierde progreso; pasa una vez por la pantalla de nivel. (T2, T3)
4. Elegir un nivel sin contenido: se abre todo lo actual, sin recomendada y con aviso. (T2, T3)
5. Cambiar de nivel varias veces y recargar a mitad: el último gana, sin duplicados. (T2)

---

### Task 1: Niveles y sugerencia (módulo puro)

**Archivos:** Crear `src/shared/levels.ts`, `test/shared/levels.test.ts`.

**Interfaces:**
- Produce: `LEVELS: readonly LevelInfo[]` en orden (`{ id: Level; label: string; minElo: number; maxElo: number; blurb: string }` con las etiquetas y subtítulos «Reglas y fundamentos», «Tácticas y principios básicos», «Cálculo y comprensión», «Estrategia y planificación», «Profundización técnica», «Rendimiento y preparación»); `levelForRating(rating: number): Level`; `interface LevelHint { perf: 'rapid' | 'classical' | 'blitz'; rating: number; games: number; level: Level }`; `suggestLevel(seen: PlacementSeen | null): { level: Level | null; hint: LevelHint | null }` (nivel del mayor Elo con estado `reliable` entre rapid, classical y blitz; pista = el mayor Elo con estado `provisional` y al menos 30 partidas que supere al sugerido; sin datos fiables: `level: null`).
- Consume: tipos `PlacementSeen`/`SeenPerf` de `src/shared/api.ts`, `Level` de `src/types.ts`.

- [ ] **Paso 1: tests que fallan** en `levels.test.ts`: `levelForRating` en 0, 399, 400, 799, 800, 1099, 1100, 1399, 1400, 1699, 1700, 1999 y 2400; **caso real del usuario**: rápida `{state:'provisional', rating:1749, games:43}`, clásica `{state:'few_games', rating:1500, games:6}`, blitz `{state:'reliable', rating:1125, games:1177}` → `{ level: 'intermediate', hint: { perf: 'rapid', rating: 1749, games: 43, level: 'advanced' } }`; `seen` nulo y todo `absent`/`invalid` → `{ level: null, hint: null }`; provisional con 29 partidas no da pista; si el provisional es menor que el sugerido no hay pista; varios fiables → gana el mayor.
- [ ] **Paso 2: ejecutar** `npx vitest run test/shared/levels.test.ts`. Esperado: FAIL.
- [ ] **Paso 3: implementar** las firmas anteriores sin imports de `node:`.
- [ ] **Paso 4: ejecutar** el mismo test y `npx tsc --noEmit`. Esperado: PASS.

### Task 2: Servidor: nivel elegido y efecto en el mapa

**Archivos:** Crear `migrations/0006_cp_user_level.sql`, `worker/level.ts`. Modificar `worker/app.ts`, `worker/placement.ts`, `src/shared/api.ts`, `worker/progress.ts` (si `levelForXp` queda sin uso, eliminarlo con sus tests), `test/worker/api.test.ts`, `test/worker/placement.test.ts`.

**Interfaces:**
- Esquema: `cp_user_level (user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE, level TEXT NOT NULL, chosen_at TEXT NOT NULL)`.
- Produce (`worker/level.ts`): `levelPlan(level: Level, content: { units: Unit[] }): { openUnitIds: string[]; recommendedUnitId: string | null; comingSoon: boolean }` (abre las unidades de niveles anteriores al elegido; recomienda la primera unidad del nivel elegido; si ese nivel no tiene unidades: abre todo, sin recomendada y `comingSoon: true`).
- Produce (`src/shared/api.ts`): `LevelCard { id: Level; label: string; minElo: number; maxElo: number; blurb: string; available: boolean }`, `LevelInfo { chosen: Level | null; suggested: Level | null; hint: LevelHint | null; levels: LevelCard[]; comingSoon: boolean }`, `SetLevelBody { level: Level }`.
- Endpoints: `GET /api/level` → `LevelInfo` (sugerencia con `suggestLevel` sobre `cp_placement_seen`; `available` = existe alguna unidad con ese `level`); `PUT /api/level` (`SetLevelBody`, 400 si el nivel no es uno de los 6, upsert por usuario, devuelve `LevelInfo`); `/api/me` añade `level` y `levelChosen`; `/api/map` usa `levelPlan` del nivel elegido (sin elección: sin efecto); `profileFor().level` pasa a ser el nivel elegido o `initiation`.

- [ ] **Paso 1: tests que fallan:** `levelPlan` con un temario sintético (nivel con contenido: abre los inferiores y recomienda su primera unidad; Principiante: no abre nada y recomienda la primera; nivel sin contenido: abre todo, sin recomendada, `comingSoon`); API: 401 sin sesión en `GET/PUT /api/level`; `PUT` con nivel inválido → 400; `PUT` dos veces con niveles distintos deja el último y una sola fila; `GET` con seen real devuelve `suggested` y `hint`; `/api/me` devuelve `level: 'initiation'` y `levelChosen: false` sin elección y el elegido tras `PUT`; usuario con `cp_placement.mode = 'lichess'` y progreso: `/api/map` sin elección no abre unidades y conserva su progreso; el mapa tras `PUT` refleja `placedOpen` y `recommended`; la migración respeta el test de «solo `IF NOT EXISTS`».
- [ ] **Paso 2: ejecutar** `npx vitest run test/worker`. Esperado: FAIL.
- [ ] **Paso 3: implementar** migración, `levelPlan`, endpoints y la sustitución de `placementEffect` (una sola vía); eliminar `POST /api/placement`, `GET /api/placement`, el campo `mode` y lo que quede sin uso (tipos `Placement*`, `PLACEMENT_BANDS`, `planForRating`, `bandFor`); conservar `parsePerf`, `describePerfs`, `selectPerf`, `parseSeen` y los tests de esas funciones; reescribir o borrar los tests de bandas y de `/api/placement` que dejan de aplicar.
- [ ] **Paso 4: ejecutar** `npx vitest run test/worker test/shared` y `npx tsc --noEmit`. Esperado: PASS. Aplicar la migración en local con `npm run db:migrate:local`.

### Task 3: Pantalla de nivel y cableado de la web

**Archivos:** Crear `web/src/screens/LevelScreen.tsx`, `web/src/level.css`. Modificar `web/src/App.tsx`, `web/src/api.ts`, `web/src/session.tsx`, `web/src/screens/MapScreen.tsx`, `web/src/screens/ProfileScreen.tsx` (sección «Punto de partida» sustituida por «Tu nivel» con el nivel actual y un enlace «Cambiar nivel» a `/bienvenida`). Eliminar `web/src/screens/WelcomeScreen.tsx` y lo que quede sin uso.

**Interfaces:**
- Consume: `LevelInfo`/`SetLevelBody` (T2), `GET/PUT /api/level`, `level`/`levelChosen` de `/api/me`.
- Produce: `api.level(): Promise<LevelInfo>`, `api.setLevel(level: Level): Promise<LevelInfo>`; la sesión expone `level: Level` y `levelChosen: boolean` (y `setLevel` para actualizarlos tras elegir).

- [ ] **Paso 1: implementar `LevelScreen` en `/bienvenida`:** rejilla de 6 tarjetas como la referencia (insignia numerada, nombre, «{min} a {max} Elo · {blurb}.», etiqueta «Disponible ahora» o «En preparación»), `role="radiogroup"` con tarjetas seleccionables por teclado y toque, la sugerida marcada «Sugerido por Lichess» y preseleccionada, la pista debajo («También vemos {rating} en {ritmo}, aún provisional»), botón primario «Empezar en {nivel}» que hace `PUT` y navega a `/aprender`; sin sugerencia ni datos de Lichess no se preselecciona nada y el botón queda desactivado hasta elegir; 1 columna en móvil y 2 desde 700 px, sin desbordes desde 320 px, toques de 44 px, sin emojis.
- [ ] **Paso 2: redirección de primer acceso:** si hay sesión y `levelChosen` es falso, cualquier ruta privada excepto `/bienvenida` redirige a `/bienvenida` (sustituye a la condición actual basada en `placement.chosen`; localizarla y retirarla).
- [ ] **Paso 3: aviso en el mapa:** con `comingSoon`, banner «Tus lecciones de {nivel} llegan pronto. Mientras tanto puedes repasar lo anterior y analizar tus partidas» con enlace a `/partidas`; las unidades abiertas como repaso se ven como hoy.
- [ ] **Paso 4: textos del repaso:** comprobar que `ReviewGameScreen` y `ReportScreen` leen `level` de la sesión y no un valor fijo; corregir si no.
- [ ] **Paso 5: verificar:** `npx tsc --noEmit`, `npx vitest run test/web`, y una pasada de capturas a 320 y 1280 px de la pantalla de nivel con un arnés temporal que no se sube al repositorio y se borra.

### Task 4: Puntos débiles en el Perfil

**Archivos:** Crear `src/review/weak.ts`, `test/review/weak.test.ts`. Modificar `web/src/screens/ProfileScreen.tsx`, `web/src/review.css` o un CSS propio nuevo.

**Interfaces:**
- Produce: `topWeakConcepts(weak: Record<string, number>, n?: number): { conceptId: string; count: number }[]` (n = 3; orden por recuento descendente y, en empate, por `conceptId`; ignora recuentos no positivos).
- Consume: `ruleFor` (`src/pedagogy/review-copy.ts`), `lessonsForConcept` (`src/content/index.ts`), `CONCEPTS`, `profile.weakConcepts`.

- [ ] **Paso 1: tests que fallan** de `topWeakConcepts`: orden, desempate por id, tope de 3, vacío, recuentos 0 o negativos ignorados.
- [ ] **Paso 2: ejecutar** `npx vitest run test/review/weak.test.ts`. Esperado: FAIL.
- [ ] **Paso 3: implementar** `topWeakConcepts` y la sección «Tus puntos débiles» en el Perfil: por concepto un nombre en lenguaje llano (el `name` de `CONCEPTS`; si el id no existe ahí, el título de la primera lección que lo trabaja; nunca el id crudo), «{n} veces», la regla si existe y un botón «Practicar» a `/leccion/:id` de la primera lección de `lessonsForConcept`; estado vacío «Aún no hay puntos débiles: analiza una partida o completa una lección».
- [ ] **Paso 4: ejecutar** `npx vitest run test/review test/web` y `npx tsc --noEmit`. Esperado: PASS.

### Task 5: Cierre

- [ ] **Paso 1:** una sola pasada de `npm run typecheck`, `npm test` y `npm run build`.
- [ ] **Paso 2:** actualizar `docs/estado-proyecto.md` (leerlo antes): nivel elegido por el alumno con sugerencia de Lichess, puntos débiles en el Perfil, bandas por calibrar, y pendientes de la Fase 3 (repasos espaciados, sesión diaria).
- [ ] **Paso 3:** revisión de calidad móvil de la pantalla de nivel y del Perfil por un agente independiente que arregla lo que encuentre (320, 375, 414, 768 px; desbordes, solapes, toques de 44 px, emojis, consola).
- [ ] **Paso 4:** avisar al usuario de que la migración `0006` hay que aplicarla en producción al publicar; no publicar sin su orden.
