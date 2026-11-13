# Repasos espaciados y sesión diaria — diseño

Fecha: 2026-11-13. Fase 3 (resto). Estado: pendiente de aprobación.

## Intención

El alumno vuelve a ver lo que falla justo antes de olvidarlo. Un botón «Entrenar hoy» arma una sesión corta con sus propios errores primero y Lichess como recurso siempre disponible. Sin XP ni meta diaria (decisión del usuario).

## Objetivos

1. **Calendario por concepto** con 5 cajas (esperas de 1, 2, 4, 8 y 16 días): acertar sube de caja; fallar vuelve a la primera. Tabla `cp_review_schedule (user_id, concept_id, box, due_at, last_at)`.
2. **Sesión «Entrenar hoy»:** hasta 5 posiciones de los conceptos vencidos (primero los más fallados en `cp_weak_concepts`), a un ritmo corto. Si no toca nada: «Hoy no toca repasar» y la fecha del próximo repaso.
3. **De dónde sale cada posición (prioridad):**
   1. Un error propio sin resolver de ese concepto (guardado al terminar el repaso de una partida).
   2. Un puzle de Lichess del tema equivalente y de dificultad según el nivel elegido, tomado de un depósito del servidor (`cp_puzzle_pool`) que se rellena con lotes de Lichess.
   3. Un ejercicio del banco propio (26), si Lichess falla o no responde.
4. **Errores propios en el servidor:** al terminar el repaso de una partida se guardan sus errores clave (hasta 3): partida, jugada, concepto, FEN antes de la jugada y mejor jugada. Tabla `cp_review_positions`. Misma operación atómica e idempotente que ya cuenta los conceptos. Tope de 100 sin resolver por usuario (se descartan los más antiguos).
5. **Racha:** terminar una sesión cuenta como actividad del día igual que una lección (misma regla de días UTC y de protectores).

## No objetivos

- XP, objetivo diario visible, notificaciones o recordatorios.
- Inicio de sesión con permisos de puzles de Lichess: se usa la API anónima.
- Guardar puzles de Lichess en el servidor.
- Contenido nuevo (Fase 4).

## Antiobjetivos

- Presionar al alumno (contadores en rojo, culpa por no entrar).
- Que la sesión se rompa si Lichess no responde.
- Repetir el mismo ejercicio varias veces en una sesión.
- Guardar datos que no hacen falta.

## Restricciones

- D1: solo `CREATE TABLE IF NOT EXISTS`, tablas `cp_*`, migración `0007`. Ninguna clave en el repo.
- Lichess: las peticiones de puzles las hace **el Worker, no el navegador** (`/api/puzzle/batch/{tema}?nb=50&difficulty=...`, API anónima), y el servidor las guarda en un depósito por tema y dificultad. Se rellena de forma perezosa cuando quedan menos de 10 o tiene más de 7 días. Así el tráfico a Lichess es de unas pocas peticiones al día para todos los usuarios y el servidor conserva las soluciones. Con 429 o error, la sesión cae al banco propio.
- Temas de Lichess a conceptos: `hangingPiece` → `tactics.hanging_piece`, `fork` → `tactics.fork`, `pin` → `tactics.pin`, `discoveredAttack` → `tactics.discovered_attack`, `mate` → `tactics.mate_threat`; `tactics.bad_exchange` no tiene tema equivalente y usa el banco.
- La dificultad de Lichess (`easiest` a `hardest`) sale de una constante por nivel elegido, marcada como calibración pendiente.
- Español claro, sin emojis, responsive desde 320 px, toques de 44 px, piezas movibles de verdad y sonidos como en el repaso.
- `/privacidad` pasa a decir que se guardan las posiciones de los errores.

## Enfoques considerados

- **Calendario por concepto (elegido):** un solo sistema; las posiciones son solo contenido y se pueden cambiar de fuente sin tocar el calendario.
- **Una caja por posición (tarjetas):** más preciso, pero obliga a guardar cada puzle y a gestionar cientos de elementos.
- **Solo banco propio:** descartado: 26 ejercicios se agotan pronto.

## Mis llamadas

- Una posición propia se marca resuelta con un acierto; los puzles y el banco no se guardan.
- Un fallo no repite la posición el mismo día: baja a la caja 1 y vuelve mañana.
- Con varios conceptos vencidos, una posición por concepto hasta 5; si hay menos de 5 conceptos, se repite concepto con otra posición.
- El puzle se juega con la línea completa (el rival responde solo); un movimiento equivocado da un aviso amable y un segundo intento.
- Entrada: botón «Entrenar hoy» en el mapa y en el Perfil, que muestra cuántos conceptos tocan.
- El nivel para textos y dificultad es el elegido por el alumno.

### Aclaraciones tras la revisión del constructor

- **Formato del puzle (comprobado en vivo con 75 puzles de 5 temas, 2026-11-13):** `/api/puzzle/batch/{tema}` devuelve `game.pgn`, `puzzle.initialPly`, `puzzle.solution` (UCI), `rating` y `themes`, sin `fen`. Tras reproducir el PGN completo con `parseGame`, `solution[0]` fue legal en los 75 y siempre es el movimiento **del alumno** (el que mueve en esa posición); el rival responde con `solution[1]`, y así sucesivamente. Con `difficulty=normal` las valoraciones fueron de 1261 a 1594. El servidor reproduce el PGN al guardar cada puzle en el depósito y descarta los que no cumplan esa comprobación.
- **Verificación en el servidor (decisión tras la revisión del usuario):** el navegador no declara resultados. `GET /api/session` crea hasta 5 elementos de sesión en `cp_session_items (id, user_id, concept_id, kind, fen, solution_json, step, attempts, status, created_at)` y devuelve solo `{ itemId, kind, conceptId, fen }`, sin soluciones. Cada jugada del alumno va a `POST /api/session/answer { itemId, uci }`; el servidor compara con la solución que guarda y responde `{ correct, reply?, done, solution? }` (el rival responde con su movimiento; la solución solo se revela al terminar o al fallar el segundo intento). Esto vale para errores propios (solución = `best_uci` guardado), puzles y banco.
- **Cierre de la sesión (decisión tras la revisión del usuario):** `POST /api/session/finish` calcula en el servidor, a partir de los elementos guardados, el resultado por concepto (primer intento de la primera posición de cada concepto) y mueve las cajas; avanza la racha con la regla actual. No hay carga declarada por el cliente.
- **Cuándo entra un concepto en el calendario (mi llamada):** con los mismos eventos que ya suman a `cp_weak_concepts` (fallo en una lección o repaso de partida). Si no tiene fila: caja 1, `due_at` = ahora + 1 día. Si ya tiene fila en una caja superior, un fallo nuevo la devuelve a la caja 1. Sin migración de datos: un concepto de `cp_weak_concepts` sin fila se trata como caja 1 y vencido.
- **Resultado por concepto (mi llamada):** la caja se mueve una vez por sesión y concepto, con el resultado de la primera posición de ese concepto a la primera. Un acierto en el segundo intento marca la posición propia como resuelta, pero cuenta como fallo para la caja. Las posiciones extra del mismo concepto son solo práctica.
- **Premios (mi llamada):** una sesión solo avanza la racha con la regla actual (puede dar el Chedex de hito, igual que una lección), sin XP. Se considera completada al llegar a la pantalla final con al menos una posición intentada.
- **Idempotencia (mi llamada):** `finish` solo procesa una sesión una vez (estado de los elementos) y el servidor mueve una caja solo si el concepto está vencido (`due_at` ≤ ahora), así que un doble envío no mueve nada dos veces. Una sesión sin terminar caduca a las 24 h.
- **Errores propios (mi llamada):** `completeReview` añade `positions: { ply, conceptId, fen, bestUci }[]` (máx. 3, los errores clave de `keyErrors`). El servidor valida el concepto, que el FEN sea legal y que `bestUci` sea una jugada legal en él. Tope de 100 sin resolver por usuario: se borran los más antiguos por `created_at`.

## Para el constructor

Esquema final de las tablas (`cp_review_schedule`, `cp_review_positions`, `cp_puzzle_pool`, `cp_session_items`, migración `0007`), formato exacto de `GET /api/session`, `POST /api/session/answer` y `POST /api/session/finish`, estrategia de relleno y caducidad del depósito, reutilización de `PracticeBoard`/`judgeBestMove` en la interfaz, y el orden de las tareas.
