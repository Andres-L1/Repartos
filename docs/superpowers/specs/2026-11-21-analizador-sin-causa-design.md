# Analizador de partidas: errores graves sin causa tipificada (2026-11-21)

## Problema
`keyErrors` solo enseñaba un error si el motor lo marcaba `mistake`/`blunder` (pérdida > 100 cp) **y** una de las 6 reglas de `diagnose` lo explicaba. Si ninguna encajaba, el error se descartaba en silencio y la partida salía «nada que aprender». Tampoco se enseñaba la táctica perdida (no jugar una captura o un jaque ganador), que las reglas no ven porque diagnostican lo malo de la jugada hecha, no la que se dejó de hacer.

## Medición previa (corpus guardado, sin motor)
Corpus: partidas de club de Lichess (torneo arena ≤1300 blitz, sin nombres de usuario), partidas históricas escritas a mano y `samples/`, analizadas con Stockfish 16 a profundidad 12 (`scripts/corpus/build.mts`), cada partida vista desde los dos bandos. Resultados en `test/fixtures/corpus/analyses.json`; las cifras salen de `npx tsx scripts/corpus/measure.mts` y están en `docs/estado-proyecto.md`.

## Diseño
Prioridad de un error grave del alumno, con tope 3 por partida y, dentro de cada grupo, mayor pérdida primero (`src/review/select.ts`):
1. **Causa tipificada** (`diagnose`, sin cambios).
2. **Táctica perdida** (`src/diagnosis/rules/missed_tactic.ts`, `diagnoseMissedTactic`). Se emite solo si, reproduciendo la línea del motor con chessops: la mejor jugada es una captura que gana al menos 2 de valor neto (peón 1, pieza menor 3, torre 5, dama 9) al cerrar el último cambio de capturas de las primeras 6 medias jugadas, o un jaque que lleva a mate o a esa misma ganancia. Si la ventana corta una captura mía con recaptura posible, no se emite (resultado sin comprobar). Variantes: `free_capture` (sin recaptura posible), `winning_exchange`, `check_mate`, `check_wins`. Sin concepto (`conceptIds: []`): no hay nada que repasar por calendario.
3. **`engine.analysis`**: cualquier otro error grave cuya mejor jugada sea legal y distinta de la jugada hecha. `KeyError.diagnosis` es `null`.

Los errores sin mejor jugada legal que enseñar se descartan (nunca se inventa). Las **imprecisiones** (50-100 cp) no se repasan, pero `Report.inaccuracies` las cuenta («N imprecisiones») y la pantalla de partida limpia las nombra: «Partida limpia: N imprecisiones, ninguna grave».

### Mini lección sin causa (`buildErrorLesson`, `kind: 'missed' | 'engine'`)
- Sin pausa (no hay una casilla única y comprobable que preguntar).
- **missed**: qué se ganaba, con hechos comprobados (la pieza capturada y la casilla, o «jaque que termina en mate», o el valor ganado con `lossInPieces`); «por qué» de una frase por variante; regla: mirar capturas y jaques.
- **engine**: tu jugada, la mejor del motor y cuánto cambia la partida en palabras (`evalState`/`evalChange`: «tenías ventaja clara» → «la partida pasa a estar igualada»; nunca cifras de motor); aviso explícito de que no se pudo comprobar una causa; el momento «Por qué importa» se salta (`why: ''`), porque no se inventa el porqué estratégico.
- Ambas muestran la **línea principal corta del motor** (hasta 5 medias jugadas desde `fenBefore`, prefijo legal que empieza por la mejor jugada) con botones para recorrerla en el tablero.
- **Política de avisos** (`docs/estado-proyecto.md`): primer fallo al buscar la mejor jugada = pista que no nombra la jugada ni su casilla (missed: «mira primero las capturas/los jaques»; engine: la pieza que la hace); después, «Muéstramelo». Las lecciones con causa no cambian.

### Informe y entrenamiento
- `buildReport`: `engine.analysis` y táctica perdida no suman a `weaknesses`, `starError` ni `ruleConceptId`. Nuevos campos `inaccuracies` y `serious`; el titular dice «Hubo N errores graves sin una causa que pueda comprobar» en vez de «no encontré errores graves» cuando los hay.
- «Entrenar hoy»: la posición se guarda con `positionConcept`: concepto de la causa; si no hay concepto, `engine.analysis` solo si la mejor jugada es clara (táctica perdida comprobada o `blunder`, > 250 cp; sin MultiPV no se puede asegurar que sea única, así que un `mistake` sin causa no se guarda). Misma validación de legalidad del servidor.
- Servidor: `worker/srs.ts` añade `POSITION_CONCEPT_IDS` (conceptos del temario + `engine.analysis`) **solo para `positions`**; `concepts` de `/api/review/complete` sigue rechazando `engine.analysis` (no suma a débiles ni calendario). Sin migración: D1 no restringe `concept_id` y la tabla ya tiene `UNIQUE(user_id, game_id, ply)`. La sesión (`dueConcepts`) añade `engine.analysis` como seudo-concepto mientras haya posiciones sin resolver; `finishPlan` no escribe calendario para él.

## Límites conocidos
- Con un solo MultiPV, «mejor jugada clara» es una heurística (táctica comprobada o blunder); puede haber otra jugada igual de buena y la sesión solo acepta la guardada (o cualquier mate si la mejor da mate).
- La táctica perdida solo cubre capturas y jaques; una jugada tranquila ganadora (horquilla sin jaque, clavada) cae en `engine.analysis`.
- Lo que se muestra del motor es profundidad 12: puede equivocarse en posiciones muy tácticas. La revisión con profundidad 20 de una muestra está en `docs/estado-proyecto.md`.
- El texto «Hoy toca repasar N conceptos» cuenta `engine.analysis` como un concepto.
