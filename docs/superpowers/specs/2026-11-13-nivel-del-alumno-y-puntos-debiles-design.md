# Nivel del alumno y perfil de puntos débiles — diseño

Fecha: 2026-11-13. Fase 3 de Chedex Pulse. Estado: pendiente de aprobación.

## Intención

Hoy el nivel lo decide en silencio el Elo de Lichess y deja a un jugador de ~1100–1750 en «principiante». Pasa a ser una elección clara y editable del alumno, con Lichess solo como sugerencia. Todo se adapta a ese nivel: el mapa y los textos del repaso. Además, el Perfil muestra sus puntos débiles con una salida directa a practicarlos.

## Objetivos

1. Pantalla de nivel con las 6 tarjetas de la referencia (Principiante 0–400, Iniciación 400–800, Básico 800–1100, Intermedio 1100–1400, Avanzado 1400–1700, Competitivo 1700–2000), cada una con «Disponible ahora» o «En preparación» según el contenido real.
2. Sugerencia de Lichess: el mejor Elo fiable entre rápida, clásica y blitz, convertido a nivel por esas bandas (2000 o más: Competitivo). Si hay un Elo provisional más alto con al menos 30 partidas, se muestra como pista («También vemos 1749 en rápida, aún provisional»), sin cambiar la sugerencia.
3. El alumno acepta la sugerencia o elige otra tarjeta. Se pide una vez al entrar y se cambia desde el Perfil.
4. El nivel elegido gobierna:
   - **Mapa:** las unidades de niveles inferiores al elegido se abren como repaso; se recomienda la primera unidad del nivel elegido si existe. Si ese nivel no tiene contenido, se abre todo el contenido actual como repaso y se avisa «Tus lecciones de {nivel} llegan pronto».
   - **Textos del repaso de partidas:** el `level` que recibe `buildErrorLesson`, hoy siempre «iniciación».
5. Perfil: sección «Tus puntos débiles» con los 3 conceptos más fallados de `cp_weak_concepts` (lecciones y repasos), en lenguaje llano, con el recuento, la regla del concepto (`ruleFor`) y un enlace a la lección que lo trabaja (`lessonsForConcept`).

## No objetivos

- Contenido nuevo para Básico y superiores; repasos espaciados; sesión diaria.
- Borrar `cp_placement` ni `cp_placement_seen`: se conservan como origen de la sugerencia.
- Bloquear a nadie por no tener contenido de su nivel.

## Antiobjetivos

- Decirle «principiante» a quien no lo es.
- Dos fuentes de verdad del nivel (queda una: el nivel elegido).
- Preguntar el nivel en cada visita.
- Perder el progreso o el mapa de los usuarios existentes.

## Restricciones

- D1: solo `CREATE TABLE IF NOT EXISTS`, tablas `cp_*` (hay un test que lo exige).
- La sugerencia sale de lo ya guardado en el login (`cp_placement_seen`): sin llamadas nuevas a Lichess.
- Los niveles son los de `Level` en `src/types.ts`. Qué niveles tienen contenido se deduce de `unit.level` en el temario, no se escribe a mano.
- Español claro, sin emojis, responsive desde 320 px, toques de 44 px.
- Usuarios existentes: su progreso no cambia. Sin nivel elegido, el mapa funciona como hoy y los textos usan iniciación hasta que elijan.

## Enfoques considerados

- **Elegido: Lichess sugiere, el alumno confirma.** Un clic corrige cualquier fallo de la heurística.
- **Solo selector manual:** descartado: pierde la ayuda de Lichess que el usuario quiere conservar.
- **Solo Lichess, mejorado:** descartado: una heurística siempre falla en algún caso (aquí Blitz 1125 frente a Rápida 1749 provisional) y el alumno no podría corregirla.

## Mis llamadas

- Tabla nueva `cp_user_level (user_id, level, chosen_at)` en la migración `0006`. Endpoints `GET /api/level` (nivel elegido o null, sugerencia, pista, niveles con su disponibilidad) y `PUT /api/level`.
- `/bienvenida` se reutiliza para la pantalla de nivel y deja de ser la de colocación por Elo; el redireccionamiento al primer acceso se mantiene con la condición «no hay nivel elegido».
- Las bandas Elo a nivel viven en una sola constante y se marcan como calibración pendiente (los Elo de Lichess no equivalen a los de FIDE).
- Los textos usan el nivel elegido; `levelForXp` deja de alimentar a la interfaz.
- Criterio de aceptación con datos reales del usuario: Blitz 1125 (fiable), Rápida 1749 (provisional, 43 partidas), Clásica 6 partidas → sugerencia Intermedio y pista de Rápida 1749.

### Aclaraciones tras la revisión del constructor

- **Una sola vía para el mapa (mi llamada):** el efecto sobre el mapa sale solo del nivel elegido y sustituye a `placementEffect`/`PLACEMENT_BANDS`. Los usuarios que antes eligieron «Lichess» pasan por la pantalla de nivel una vez, con su sugerencia ya calculada; su progreso no cambia. `POST /api/placement` y el campo `mode` se eliminan, y se reescriben los tests de colocación afectados. `cp_placement` y `cp_placement_seen` se conservan y no se migra `mode`.
- **Qué significa «abrir como repaso» (respondido por el código):** es el mecanismo actual `placedOpen`: lecciones disponibles sin XP ni progreso, y el bloqueo secuencial dentro del nivel elegido se mantiene. `lessonAccess` ya lo respeta porque usa el mismo cálculo. Para Básico o superior: todo abierto y nada recomendado; la rama «primera unidad del nivel elegido» se prueba con un temario sintético.
- **«Fiable» y pista (respondido por el código):** se reutiliza `isReliable`. `seen_json` ya guarda por ritmo `state` (reliable, provisional, few_games…), `rating` y `games`, así que alcanza para la sugerencia y para la pista (estado provisional y al menos 30 partidas). No hacen falta llamadas nuevas.
- **Fronteras (mi llamada):** bandas con límite inferior incluido (400, 800, 1100, 1400, 1700); 2000 o más es Competitivo.
- **Texto por nivel (mi llamada):** se pasa el nivel elegido a `buildErrorLesson` y a las pantallas, pero no se adapta aún el tono: hoy el parámetro se ignora y los textos ya son para principiantes. La adaptación por nivel queda para cuando haya contenido de Básico en adelante.
- **Dónde vive el nivel (mi llamada):** `/api/me` devuelve el nivel elegido en `level`; sin elección, `initiation` (ya no `levelForXp`). `GET /api/level` aporta la sugerencia y las tarjetas.
- **Puntos débiles sin datos (mi llamada):** se muestra un estado vacío amable («Aún no hay puntos débiles: analiza una partida o completa una lección»). Orden por recuento descendente y, en empate, por id de concepto.

## Para el constructor

Estructura de archivos, forma exacta de los endpoints y tipos, diseño de las tarjetas con el sistema táctil existente, orden de tareas y migración de la lógica de `placementEffect`.
