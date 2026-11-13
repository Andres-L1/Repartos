# Validación Fase 1 (pipeline PGN -> motor -> diagnóstico -> explicación)

Alcance: 11 partidas en `samples/v01..v11_*.pgn`, analizadas con `trainFromPgn` a profundidad 10 (nivel `initiation`).
Tests: `test/validation/validation.test.ts` (coherencia; vuelca el detalle a `test/validation/last-run.json`) y
`test/validation/golden.test.ts` (tipo de diagnóstico esperado por jugada, `golden.json`).
Estado: `npx vitest run` 156/156 verdes, `npx tsc --noEmit` limpio, `npm audit` 0 vulnerabilidades.
Última actualización: 2026-11-13.

Método: aperturas y trampas escritas a mano (v01, v02, v03, v07, v09) y partidas "mineras": prefijo de apertura +
una jugada mala elegida a propósito (comprobada con Stockfish) + resto jugado por el motor a profundidad baja. Las
colas de v04-v08 y v11 contienen imprecisiones incidentales que también se reportan. v02, v03 y v09 son
miniaturas (5-10 jugadas); el resto tiene ~22 jugadas.

## Resultados por partida (última ejecución, `last-run.json`)

Error deliberado = el que se puso a propósito. Todos los hechos citados se revisaron contra el tablero.

| Partida | Error deliberado | Motor | Diagnóstico emitido | Correcto |
|---|---|---|---|---|
| v01_limpia | ninguno | 0 items | ninguno | OK |
| v02_mate_perdido | 3...Nf6?? y 4.Qd1?? | 2 blunders (1000 cp) | `mate_threat` x2 (Qxf7#; mate no jugado) | Sí |
| v03_mate_recibido | 5...Bxd1?? | blunder 878 | `mate_threat` "mate en 2: Bxf7+ Ke7 Nd5#" | Sí |
| v04_pieza_colgada | 7...Nd5?? | blunder 274 | `hanging_piece` Nd5 capturado por Axd5 | Sí |
| v05_dama_colgada | 9.Qg4?? | blunder 785 | `hanging_piece` dama en g4 capturada por Cxg4 | Sí |
| v06_cambio_malo | 9.Bxh7+ | mistake 212 | `bad_exchange` "se entrega alfil (3) y se recibe peón (1)" | Sí |
| v07_trampa_petroff | 4...Nf6?? | blunder 441 | `discovered_attack` Nc6+ descubre jaque de la dama | Sí |
| v08_horquilla_dama | 9.Bh3?? | blunder 277 | `fork` Qh4+ ataca rey y alfil | Sí |
| v09_mate_pastor | 3...Nf6?? | blunder 1000 | `mate_threat` Qxf7# | Sí |
| v10_limpia_qgd | ninguno | 0 items | ninguno | OK |
| v11_clavada | 9.Rf1?? | mistake 219 | `pin` caballo c3 clavado, ...d4 y dxc3 | Sí |

Sin diagnóstico (no se afirma ninguna causa, correcto): 3 mistakes incidentales en colas (v05 `h5`, v11 `Ng5` y `h3`)
y 18 imprecisiones (`inaccuracy`).

## Tasas

- Errores deliberados: 10. Detectados por el motor como mistake/blunder: 10/10.
- **Diagnosticados: 10/10 (antes 8/10), todos con hecho verdadero y tipo correcto** (antes 7/8).
- Falsos positivos duros (afirman algo falso): 0. Partidas limpias: 0 diagnósticos.
- Mistakes/blunders del motor (incluidas incidentales): 13, diagnosticados 10 (77 %; antes 57 %).
- Jugadas peores que `good`: 31, diagnosticadas 10 (32 %). El resto son imprecisiones o errores sin causa verificable.
- Cobertura por tipo en la muestra: `mate_threat` 4, `hanging_piece` 2, `bad_exchange` 1, `fork` 1, `pin` 1, `discovered_attack` 1.

Aviso: la muestra es pequeña y las partidas las escribimos nosotros; estas tasas no se pueden extrapolar a partidas
reales de alumnos. Falta una validación con partidas reales y con revisión de profesores (spec §13).

## Qué comprueba el test de coherencia

(b) Para cada explicación `verified=true`: el diagnóstico existe y coincide en ply/color; las casillas del hecho existen
y figuran en la evidencia o en las líneas del motor; cada "pieza en casilla" citada estuvo ahí en `fenBefore`,
`fenAfter` o en la línea reproducida; la refutación es legal; `conceptIds` contiene el `conceptId` de la explicación.
(c) Sin diagnóstico: `verified=false`, concepto `engine.analysis`, sin ejercicios y sin vocabulario causal.
(d) Las partidas limpias no generan diagnósticos. El golden test fija además el tipo esperado por jugada.

## Límites conocidos y siguientes mejoras

1. `discovered_attack` solo mira la primera jugada del rival y exige ganancia de material; no cubre descubiertas
   posteriores ni dobles jaques.
2. En `pin`, si la línea acaba en cambios compensados, la pérdida sale del `cpLoss` del motor y no de una cuenta
   de piezas.
3. 68 % de las jugadas peores que `good` siguen sin causa: faltan conceptos posicionales (estructura de peones,
   actividad de piezas), previstos para fases posteriores.
4. Banco de ejercicios pequeño (26 ejercicios) y casi sin niveles `advanced`/`competitive`; sin clavadas relativas.
5. Los golden tests dependen de la versión de Stockfish instalada: al actualizar el motor hay que regenerarlos
   (`UPDATE_GOLDEN=1 npx vitest run test/validation/golden.test.ts`) y revisar el diff a mano.

Notación: las jugadas se muestran en SAN con letras inglesas (N, B, R, Q, K), como Lichess.
