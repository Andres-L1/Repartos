# Calibración de niveles y puzles con datos reales de Lichess (2026-11-21)

## Fuentes
- Distribución de Elo: `https://lichess.org/stat/rating/distribution/{blitz,rapid,classical}` (página pública; el JSON `freq` viene incrustado: 97 cubos de 25 puntos, de 400 a 2800; el mínimo de Lichess es 400 según `Glicko.minRating` en el código abierto de lila). Es la distribución **semanal**: jugadores que jugaron esa semana. Descargada el 2026-11-21, tres peticiones.
- Muestras de puzles: `GET https://lichess.org/api/puzzle/batch/{tema}?nb=50&difficulty={dificultad}`, sin sesión, 2026-11-21.
- Escala: FAQ de Lichess (https://lichess.org/faq#ratings): usa Glicko-2; marca un Elo como provisional con desviación mayor de 110 (sube con el tiempo sin jugar); y dice que no conviene comparar el Elo con el de FIDE u otras organizaciones, porque cambia la población y el sistema. **No hay fuente fiable de Lichess a FIDE** que citar, así que no se da ninguna conversión: todo el documento y los textos hablan de Elo de Lichess.

## Distribución real (2026-11-21)
| Ritmo | Jugadores esa semana | P10 | P25 | P50 | P75 | P90 | P95 | P99 |
|---|---|---|---|---|---|---|---|---|
| Blitz | 760.470 | 930 | 1150 | 1449 | 1743 | 1982 | 2116 | 2369 |
| Rápidas | 582.030 | 854 | 1072 | 1355 | 1645 | 1882 | 2010 | 2234 |
| Clásicas | 47.051 | 1069 | 1269 | 1516 | 1739 | 1925 | 2033 | 2230 |

Percentil de cada corte actual (% de jugadores por debajo, interpolando dentro del cubo):
| Corte | Blitz | Rápidas | Clásicas |
|---|---|---|---|
| 800 | 4,6 | 7,4 | 1,2 |
| 1100 | 21,1 | 27,4 | 12,0 |
| 1400 | 45,6 | 54,0 | 37,1 |
| 1700 | 71,6 | 79,0 | 71,0 |
| 2000 | 90,8 | 94,7 | 93,6 |

Peso de cada nivel (% de jugadores): Principiante (menos de 400) 0 en todos, porque 400 es el mínimo de Lichess.
| Nivel | Blitz | Rápidas | Clásicas |
|---|---|---|---|
| Iniciación 400-800 | 4,6 | 7,4 | 1,2 |
| Básico 800-1100 | 16,5 | 19,9 | 10,8 |
| Intermedio 1100-1400 | 24,5 | 26,6 | 25,1 |
| Avanzado 1400-1700 | 26,0 | 25,0 | 33,9 |
| Competitivo 1700 o más | 28,4 | 21,0 | 29,0 |

Rating equivalente por percentil (el de rápidas en cada corte, buscado en la misma posición de blitz y clásicas):
| Corte (rápidas) | Percentil | Mismo percentil en blitz | Mismo percentil en clásicas |
|---|---|---|---|
| 800 | 7,4 | 876 | 1019 |
| 1100 | 27,4 | 1180 | 1297 |
| 1400 | 54,0 | 1496 | 1550 |
| 1700 | 79,0 | 1797 | 1782 |
| 2000 | 94,7 | 2106 | 2024 |

## Decisión por corte (rápidas como referencia)
Los cortes 800, 1100, 1400, 1700 y 2000 caen en los percentiles 7, 27, 54, 79 y 95 de rápidas: cuatro niveles centrales con un 20-27 % cada uno y el último con un 21 %. Es un reparto razonable y no hay dato que pida moverlos, así que **no se mueve ninguno** (límite inferior incluido, igual que antes). Mover un corte por intuición cambiaría el nivel que se sugiere a gente real sin evidencia.
- **Principiante (menos de 400)** no existe en Lichess (mínimo 400): por Elo nunca se sugiere. Se queda como opción a elegir y para quien aún no tiene Elo. El texto ya no dice «0 a 400 Elo» sino «sin Elo todavía».
- **2000 o más** es Competitivo, 5 % de rápidas; no se separa un séptimo nivel.
- **Ritmo.** La referencia son las rápidas (los cortes coinciden con sus percentiles). Blitz y clásicas salen desplazadas del mismo percentil: blitz entre 76 y 106 puntos por encima, clásicas entre 24 y 219 (tabla de arriba), pero **no se corrige por percentil**: la población de clásicas son 47.000 jugadores, más dedicados, y no hay fuente que diga que a igual percentil igual nivel de ajedrez. Se mantiene la regla actual: el mejor Elo entre rápidas, clásicas y blitz (bullet no cuenta). Límite: un blitz o una clásica altos pueden sugerir un nivel por encima del que daría el mismo jugador en rápidas; por eso el alumno elige siempre.

## Por qué un jugador quedaba como principiante
Tres causas posibles medidas contra el código, ninguna a base de cortes:
1. `suggestLevel` solo contaba Elos **fiables** (no provisionales y 10 partidas o más). Lichess marca provisional con desviación > 110, y eso le pasa también a quien vuelve tras tiempo sin jugar aunque tenga cientos de partidas. Un jugador con rápidas 1749 provisional (43 partidas) y blitz 1125 fiable recibía Intermedio y una pista pequeña; con solo provisionales no recibía sugerencia.
2. Como Lichess no baja de 400, Principiante no es alcanzable por Elo: quien aparece como Principiante lo hizo a mano o por la tarjeta número 1.
3. `worker/placement.ts` (`selectPerf`) elige rápidas y clásicas y solo usa blitz como último recurso, pero solo escribe `cp_placement`, que nadie lee: la sugerencia real sale de `src/shared/levels.ts`. Se deja así, es solo informativo.

**Cambio:** un Elo provisional con 30 partidas o más cuenta para la sugerencia (`PROVISIONAL_MIN_GAMES = 30`; con 30 partidas el intervalo del 95 % ronda ±220 puntos, así que como mucho se sobreestima un nivel); de 10 a 29 partidas solo da la pista, ahora con el nombre del nivel. Tests en `test/shared/levels.test.ts` y `test/worker/api.test.ts` (sin datos personales).

## Puzles por nivel
Valoraciones reales de puzles de Lichess por dificultad (sin sesión; la dificultad es relativa a la valoración de quien pide, que sin sesión queda cerca de 1500: sale de las propias medidas, `easiest` ~900 y `hardest` ~2100, no de documentación citada):
| Dificultad | Rango medido | Mediana | Muestra |
|---|---|---|---|
| easiest | 680 a 1082 | sin recalcular | 2026-11-14 (`docs/estado-proyecto.md`) |
| easier | 964 a 1173 | sin recalcular | 2026-11-14 |
| normal | 1297 a 1667 | sin recalcular | 2026-11-14 |
| **harder** | **1527 a 1878** | **1738** | **2026-11-21, 50 puzles de fork** (36 % valen hasta 1700, 74 % hasta 1800) |
| hardest | 1801 a 2327 | sin recalcular | 2026-11-14 |

**Límite importante.** El 2026-11-21 la API devolvió 429 en todas las peticiones salvo una (la de `harder`) durante más de una hora, incluso esperando 65-70 s entre intentos, por lo que no se pudo ampliar la muestra por tema ni repetir las demás dificultades. Un script con esperas (`GET /api/puzzle/batch/...`) sigue sin éxito; se debe repetir otro día.

**Decisión: no se cambian `DIFFICULTY_BY_LEVEL` ni `MAX_PUZZLE_RATING`.** Para elegir tramo hace falta saber cómo se relaciona la valoración de un puzle con el Elo de partidas y no hay fuente fiable que lo diga (la FAQ solo dice que cada escala es relativa a su población). Si se supusiera 1:1, Avanzado (1400-1700, centro 1550) iría mejor con `normal` (centro ~1480) que con `harder` (1738) y Competitivo con `harder` que con `hardest`; si los puzles puntúan más alto que las partidas, como se suele creer pero no está citado, el reparto actual es el correcto. Con una sola muestra de `harder` y sin la relación no hay evidencia para decidir, así que queda **provisional** y documentado. Los topes (800, 1000, 1200, 1500, 1800, sin tope) siguen el patrón «máximo del nivel + 100» (800 en Principiante porque `easiest` no baja de 680).

## Compatibilidad
Los ids de nivel no cambian y `cp_user_level` guarda ids; los cortes no se han movido, así que ningún alumno cambia de nivel. No hay migración. Sí cambian: el rango mostrado (ahora «Elo de Lichess en rápidas: X a Y», de una sola fuente en `LEVELS` + `eloRange`), la sugerencia con provisionales.

## Límites
- La distribución es semanal y cambia; hay que repetirla de vez en cuando.
- Clásicas es una población pequeña (47.000).
- Muestra de puzles: solo `harder` con 50 puzles de un tema (fork); el resto son las medidas del 2026-11-14. Lichess limitó con 429.
- No se ha medido si un alumno de cada nivel resuelve de verdad los puzles que se le asignan (falta uso real).
