# Revisión pedagógica y de ajedrez · 2026-11-14

Revisor automático (Claude). No sustituye a un profesor titulado: los puntos marcados «para un humano» necesitan su criterio.

## Resumen

1. Las 216 posiciones con solución (164 de lecciones u01-u06, 26 ejercicios del banco y sus 26 espejos) son legales y la línea de solución es legal. Ninguna solución es mala jugada: donde el texto dice «mate» es mate, y donde dice «gana material» lo gana (Stockfish 16, profundidad 16-20).
2. El fallo grave está en la corrección, no en las soluciones. La lección solo acepta la jugada exacta, también en «Mate en 1». Por eso en 9 ejercicios una jugada igual de buena, que a veces el propio texto llama buena, se marca como error con un mensaje que no es verdad.
3. Hay 4 errores de concepto: la «oposición» de u04 no es oposición; un consejo de prevención de horquillas es falso; «contra un rey no se puede interponer» da a entender que un rey puede dar jaque; y una regla de cambios de u05 es falsa tal como está escrita.
4. La notación cambia de una unidad a otra (Cxd5/Ta8/Dg8 en u02-u03, Nf7/Qxf7/Ra8 en u04-u06 y en el tablero) y ninguna lección la enseña.
5. La progresión dentro de u01-u06 es razonable y el tono no culpa al alumno. El banco de ejercicios pone niveles que no corresponden a su dificultad (mates en 1 marcados como «avanzado»), y el concepto «Amenaza de mate» se usa para ejercicios de dar mate.

Recuento: **7 críticos (6 visibles hoy en la web), 15 importantes, 17 menores**.

## Hallazgos

Las jugadas van en notación inglesa (la del tablero de la app).

### Crítico (enseña algo falso o da por mala una solución correcta)

| # | Archivo:línea | Qué está mal | Evidencia verificada | Corrección propuesta |
|---|---|---|---|---|
| C1 | src/content/units/u03.ts:383-391 (u03.l04 práctica 1) | El enunciado dice «hay varias formas de dar mate», pero solo se acepta Qh2#. Con Qh1#, Qh3#, Qg7# o Qg8# el alumno ve «Cuidado con dejar al rey sin movimientos sin darle jaque: eso es ahogado», que es falso. | chessops: las 5 jugadas dan jaque mate. PracticeBoard.tsx:78 compara `uci === expected` sin excepción para mates. | En PracticeBoard.tsx, aceptar cualquier jugada que dé mate cuando la esperada da mate, igual que ya hace worker/session.ts:50-57 (`isExpected`). Sin cambiar código: quitar «(hay varias formas de dar mate)» no basta, porque las demás seguirían marcadas como error. |
| C2 | src/content/units/u04.ts:444-449 (u04.l04 práctica 4, 2.ª jugada) | Tras 1.Qg1 Kh4 se acepta solo Qh2#. Con Qg4# (también mate, la dama queda protegida por el rey de f5) el alumno ve «Esa jugada no fuerza el mate». | chessops: 2.Qg4 es jaque mate. | La misma regla de C1. |
| C3 | src/content/units/u04.ts:312-324 (u04.l03 práctica 3) | El texto dice «Qf6 también servía» y «Las defensas buenas son Qe7 y Qf6», pero Qf6 se marca como error y el alumno lee justo ese mensaje genérico. | Stockfish d20: 3...Qe7 +0,08 y 3...Qf6 −0,30 para negras. Las dos defienden f7 y son teoría normal. | Añadir `d8f6` como respuesta aceptada. El esquema necesita poder aceptar varias jugadas (p. ej. `alsoAcceptUci?: string[]`). Mientras tanto, añadir `wrongByMove.d8f6: 'Qf6 también defiende f7; aquí practicamos Qe7. Las dos sirven.'` |
| C4 | src/content/units/u06.ts:63, 90, 193, 334, 347 (u06.l01 p1 y p3, u06.l02 p1, u06.l03 p2 y p3) | La explicación del acierto dice que otras jugadas son igual de buenas (1.d4; 1...d5 y 1...c5; 3.Bb5 y 3.Nc3; 4.d3 y 4.O-O; 3...Nf6), pero esas jugadas reciben el mensaje de fallo. Algunos mensajes son además falsos para ellas: a 3.Nc3 le dice «Esa jugada no desarrolla una pieza menor» y a 1.d4 «no hace nada por el centro». En u06.l03 p3, Stockfish prefiere 3...Nf6 a la solución 3...Bc5. | Stockfish d16: todas a menos de 0,3 de la solución. Coincidencia exacta en PracticeBoard.tsx:78. | Aceptar varias soluciones en los ejercicios de principios (lecciones 1-3 de u06). Si no, cambiar el enunciado para que pida una jugada concreta («Avanza el peón del rey dos casillas»). |
| C5 | src/content/units/u04.ts:142 | «los dos reyes están en «oposición» (separados por una casilla)». En la posición (rey blanco g6, negro h8) los reyes NO están en oposición, que exige misma columna o fila con un número impar de casillas entre ellos. La definición entre paréntesis también está incompleta. | FEN `7k/8/6K1/8/8/8/8/R7 w`: g6 y h8 no comparten columna ni fila. Lo que da el mate es que el rey de g6 cubre g7 y h7, no la oposición. | Usar `6k1/8/6K1/8/8/8/8/R7 w - - 0 1` (Ra8#, reyes de verdad en oposición en la columna g) y escribir: «…los dos reyes están en oposición: en la misma columna, con una casilla entre ellos. Así tu rey quita f7, g7 y h7». |
| C6 | src/pedagogy/exercises.ts:120-126 (ex.fork.03 y su espejo) | Solo se acepta Qd5+. Pero Qg2+ cumple el enunciado al pie de la letra («Da jaque con la dama de modo que también ataque la torre»: jaque por la columna g y ataque a h1) y es incluso mejor. En «Entrenar hoy» se marca como fallo. | Stockfish d20: Qg2+ es mate en 13; Qd5+ vale +33. worker/session.ts solo acepta alternativas si la esperada es mate. | Cambiar la posición para que solo funcione Qd5+ (por ejemplo, con un peón negro en g3), o aceptar las dos. |
| C7* | src/pedagogy/concepts.ts:114 | Prevención de la horquilla para el nivel Básico: «no dejes piezas a un salto de caballo de distancia entre sí». Es falso: dos casillas separadas por un salto de caballo son de distinto color, y un caballo solo ataca casillas de un color, así que nunca puede atacar las dos a la vez. | Es aritmética del tablero. | «Prevención: no dejes dos piezas sin defensa en casillas a las que un mismo caballo rival pueda saltar a la vez, y vigila los jaques que atacan además otra pieza.» |

\* C7 cuenta como crítico por el contenido, pero hoy esas plantillas (`explanations`) solo se ven en la CLI (`src/pipeline.ts` → `explain()`). No encontré la web usándolas. Si se cuenta por lo que ve el alumno en la web, quedan 6 críticos.

### Importante

| # | Archivo:línea | Qué está mal | Evidencia | Corrección propuesta |
|---|---|---|---|---|
| I1 | u02.ts:364; u03.ts:137, 145, 151, 439 frente a u04-u06 (p. ej. u04.ts:30, 57) y PracticeBoard (`sanOfUci`) | Mezcla de notaciones: la española (Cxd5, Ta8, Dg8, Dg7) en u02-u03 y la inglesa (Ra8, Qg8, Nf7#, O-O) en u04-u06, en el repaso y en la solución que enseña el tablero. Ninguna lección explica la notación: aparece por primera vez sin explicar en u02.l04. | `grep` de los textos; chess-utils.ts:43 fija la inglesa como la de la app. | Pasar u02/u03 a la inglesa (Nxd5, Ra8, Qg8, Qg7), que es la que usa la app, y añadir en u03 o u04 un paso «Cómo se escriben las jugadas» (letra de pieza N, B, R, Q, K; x = captura; + jaque; # mate; O-O). |
| I2 | u03.ts:47 | «Contra un caballo, un peón o un rey no se puede interponer». Un rey nunca puede dar jaque, así que la frase da a entender algo imposible. | Reglas FIDE 3.9. | «Contra un caballo o un peón no se puede interponer: hay que capturar o mover el rey.» |
| I3 | u05.ts:45 | «Si defienden más que atacan, o si tu primera pieza vale más que la suya, no captures». Tal como está escrito es falso: la dama puede tomar un caballo sin defensa, y un peón puede tomar una torre defendida dos veces. Además contradice el ejercicio de u05.ts:90 (exd5 con el caballo defendido). | Ejemplo: u02.l03 «Cuando todo es gratis, coge lo que más vale». | «Si la pieza está defendida, no la captures con una pieza que valga más que ella. Y si la defienden más piezas de las que la atacan, normalmente no compensa.» |
| I4 | u05.ts:352 y u05.ts:380 | La explicación del acierto describe mal lo que se gana: «Si el rey se aparta, Nxd7 gana una torre por un caballo» y «Ganas torre por caballo». En realidad se gana la torre gratis, porque el caballo que captura queda protegido por el alfil. Y la jugada rechazada (Bxd7+ / Bxd2+) no es «algo peor»: deja rey y caballo contra rey, que son tablas. | Stockfish d20: 1.Ne5 Ke7 2.Nxd7 (no se puede recapturar), +37,7; 1.Bxd7+ Kxd7, 0,00 (material insuficiente). Lo mismo con negras: 1...Ne4 2.Kf1 Nxd2+, frente a 1...Bxd2+ 2.Kxd2, 0,00. | 352: «Correcto: Ne5. La torre clavada no puede huir; cuando la captures, tu alfil protegerá al caballo y el rey no podrá recapturar: ganas la torre entera.» wrongByMove: «Bxd7+ Kxd7 te deja solo con un caballo contra el rey: no se puede dar mate y la partida es tablas.» Aplicar lo mismo en 380/384. |
| I5 | u03.ts:426-431 (u03.l04 evaluación 2) | «Salva la partida» en una posición de rey y alfil contra rey. Esa posición ya es tablas por material insuficiente, como enseña la misma lección en u03.ts:374. Cualquier jugada de rey salva la partida. | La explicación de la propia lección. | Dar a las blancas un peón más (p. ej. peón en h2) para que capturar sea lo único que salva, o cambiar el enunciado: «La partida ya es tablas por material insuficiente. Sal del jaque capturando el alfil». |
| I6 | u06.ts:297 frente a u06.ts:325 | La explicación presenta 2...Nf6 contra 2.Qh5 como buen desarrollo con ganancia de tiempo («la dama tiene que huir»). Pero la práctica de la misma lección dice, con razón, que tras Nf6 viene Qxe5+ y se gana un peón con jaque. | Stockfish d20: 3.Qxe5+ Be7, las blancas recuperan el peón y algo más (+0,17). | Usar la posición tras 2...Nc6 3.Bc4 g6 (la dama atacada por un peón) o decir: «…con ...Nf6? las negras desarrollan, pero dejan e5: Qxe5+. Mejor ...Nc6 primero». |
| I7 | u06.ts:128 y u06.ts:134 | El enunciado dice «Gana un peón» y tras 2...Qxd5 el material queda igual. El mensaje de fallo dice «Si no capturas… pierdes un peón», pero 2.Nc3 o 2.d3 defienden e4. | Material antes y después; la posición. | Enunciado: «Captura el peón que ataca al tuyo». Fallo: «Si no capturas ni defiendes, las negras capturan en e4. Lo más sencillo es exd5». |
| I8 | u04.ts:261 frente a u03.ts:222 y exercises.ts:220 | El mismo mate se llama «mate ahogado» en u03 y en el banco, y «mate de la coz (o ahogado del caballo)» en u04, justo después de que u03.l04 enseñe que «ahogado» = tablas. Puede confundir. | Textos citados. | Usar un solo nombre. Propuesta: «mate de la coz (también llamado mate ahogado)», y en u03 y en el banco el mismo. Para un humano: elegir el término de la escuela. |
| I9 | src/pedagogy/exercises.ts (niveles) | El nivel de dificultad no corresponde a la posición: ex.pin.04 y ex.disc.04 están marcados como «advanced» y ex.fork.04 y ex.mate.05 como «intermediate», pero todos son tácticas de una jugada evidente. worker/session.ts:180 elige el banco por nivel, así que un alumno de 1400-1700 recibe ejercicios de 400. | Lectura de las posiciones (las soluciones están bien, ver «Verificado»). | Bajar esos niveles a beginner/initiation o crear ejercicios de 2-3 jugadas para los niveles altos. |
| I10 | concepts.ts:165-175; SessionScreen.tsx:332 | El concepto se llama «Amenaza de mate» y su definición mezcla dos ideas (la amenaza del rival y el mate propio desaprovechado). En «Entrenar hoy» el título «Amenaza de mate» aparece sobre «Da jaque mate en una jugada». | Textos citados. | Renombrar a «Mate y amenazas de mate» o separar «Mate en 1» de «Amenaza de mate del rival». |
| I11 | web/src/review/lessonFlow.ts:45-52; worker/session.ts:57 (posiciones `own`) | En la mini lección del error («Juega tú la jugada mejor») y en las posiciones de la partida del alumno en «Entrenar hoy», solo vale la jugada del motor. Una jugada casi igual de buena (o otro mate, en la mini lección) se marca como fallo. | Código citado. | Aceptar las jugadas a menos de X centipeones de la mejor (hace falta guardar el multipv) o, como mínimo, cualquier mate cuando la mejor es mate. |
| I12 | src/shared/levels.ts:18-25, 47-64; LevelScreen.tsx:127, 141 | La pantalla muestra «Elo» y «Sugerido por Lichess», pero lo que se compara es el rating de Lichess (Glicko-2). En niveles bajos suele estar muy por encima del Elo FIDE, y Lichess empieza en 1500, así que es probable que la sugerencia coloque alto a los principiantes, en niveles que además están «En preparación». | No verificado con datos: es una sospecha razonable. | Para un humano: calibrar la tabla con ratings reales de Lichess o rotular «rating de Lichess» y desplazar los rangos. |
| I13 | u05.ts:321-327 | «amenazas Nxc6+ y Bxc6+»: con el rey en e8, Nxc6 no es jaque. | La posición tras 1.Nxe5. | «…y ahora el caballo de c6 está atacado dos veces: amenazas Bxc6+ o Nxc6.» |
| I14 | concepts.ts:145 (tactics.pin, nivel Principiante) | «no puede moverse porque dejaría a otra más importante… sin protección». Lo correcto es que la dejaría atacada (expuesta), no sin protección. Hoy solo se ve en la CLI. | Definición del propio concepto en concepts.ts:134. | «…porque dejaría a otra más importante (a veces el rey) expuesta a un ataque.» |
| I15 | u06.ts:147 | «Si no capturas en d4, las blancas capturan en e5 y ganan un peón central». Es falso: 2...Nc6 o 2...d6 mantienen el equilibrio. | Stockfish d16: d6 −0,36 y Nc6 −0,40, frente a exd4 −0,15 (no pierden peón). | «Si no capturas ni defiendes e5, las blancas capturan dxe5. Lo más directo es exd4.» |

### Menor

| # | Archivo:línea | Qué | Propuesta |
|---|---|---|---|
| M1 | u01.ts:238 | «completas las seis que se mueven distinto…, salvo el peón» es contradictorio (son cinco sin el peón). | «Con estas dos ya conoces cinco de las seis piezas; solo falta el peón.» |
| M2 | u01.ts:454 | «del g2 al g3»: casilla es femenino. | «de g2 a g3». |
| M3 | u02.ts:147 | Propone «interponer algo» contra el ataque de un caballo, que no se puede tapar. | «…o, si ataca una torre, alfil o dama, interponer algo.» |
| M4 | u04.ts:267, 304 | «e7 y e8 las cubre la dama»: e8 es la casilla del rey. | «e7 la cubre la dama; d8 y f8 están ocupadas por sus propias piezas.» |
| M5 | u04.ts:267 | La secuencia «1.e4 e5 2.Bc4 Nc6 3.Qh5» da una posición con turno de negras, pero el diagrama tiene turno de blancas. | Poner turno `b` y «amenaza Qxf7#», o añadir una jugada negra. |
| M6 | u04.ts:453 | «ya no hay mate forzado» es falso: dama y rey contra rey siempre tiene mate forzado. | «…y ya no hay mate en la siguiente jugada.» |
| M7 | u05.ts:422 | El caballo de d6 también da jaque (ataca e8): es un jaque doble y el texto no lo dice. | Añadir: «Es un jaque doble: torre y caballo atacan al rey; solo vale mover el rey.» |
| M8 | u05.ts:292 | «La clavada relativa protege menos que la absoluta»: el verbo no es el adecuado. | «La clavada relativa obliga menos que la absoluta…» |
| M9 | exercises.ts:134, 231, 249, 211 | Pistas imprecisas: «deja la dama sin protección» (nunca la tuvo); «El caballo debe dar jaque (al descubrir la dama)» (el jaque lo da la dama); «impide que el rival la salve» (ya se ha capturado); «ataca la primera fila» para blancas (se ataca la fila 8). | Reescribir: «El jaque obliga a responder y después capturas la dama»; «Mueve el caballo: la dama dará jaque y el caballo atacará la dama negra»; «Captúrala: el jaque de la torre no deja recapturar»; «ataca la última fila». |
| M10 | u06.ts:518 | «Se evita con ...Qe7 o ...Qf6 antes de que llegue la dama»: se juega cuando la dama ya ha llegado a h5. | «…antes de que la dama capture en f7.» |
| M11 | u06.ts:214-225 (u06.l02 p3) | El peón de e4 blanco está sin defensa y 4...Nxe4 es mejor que enrocar (Stockfish d20: +0,78 frente a +0,17). Se enseña a enrocar con un peón central regalado. | Añadir d3 blanco al FEN. |
| M12 | u06.ts:416 | Légal: «si las negras hubieran… desarrollado en lugar de clavar»: ...Bg4 también es desarrollo. La lección real es no fiarse de una clavada que no es absoluta. | «…la clavada no era absoluta: el caballo de f3 podía moverse.» |
| M13 | u02 l01 e2; u05 l02 todos los ejercicios; ex.fork.02/04 | Tras «ganar» la pieza queda rey y caballo contra rey, que son tablas (Stockfish 0,00). Choca con lo que se enseña en u03.l04. | Añadir un peón a cada bando para que la ventaja sea real. |
| M14 | ex.exchange.01-03 | Posiciones con el bando del alumno ya perdido (rey y peón contra dos torres). El motor prefiere otra jugada, aunque el enunciado pide solo la «captura rentable». | Equilibrar el material. |
| M15 | error-lesson.ts:62; SessionScreen.tsx:377 | «coronar» frente a «promocionar» en las lecciones. | Usar uno solo o explicar los dos en u03.l03. |
| M16 | ReportScreen.tsx:187 | «Es la única regla que necesitas para tus próximas partidas» promete demasiado. | «Es la regla que más te va a ayudar en tus próximas partidas.» |
| M17 | levels.ts:24, LevelScreen.tsx:127 | Un jugador de 2000 o más ve «1700 a 2000 Elo». Además, la mini lección usa el mismo texto de principiante en todos los niveles (error-lesson.ts:403). | «1700 Elo o más»; para un humano: decidir si los niveles altos necesitan otro tono. |

## Qué sí verifiqué y cómo

- **Legalidad y soluciones** (script `verify.mts` en el scratchpad, con chessops del repo y Stockfish 16 de `node_modules/stockfish`): las 216 posiciones con solución (164 de practice/evaluation de u01-u06, 26 de EXERCISES y 26 espejos) y las 79 de explicación. Todas las FEN son legales y todas las líneas `solutionUci` lo son. Para cada jugada del alumno comprobé si da mate, si hay otros mates, si deja al rival ahogado, y el análisis multipv 5 a profundidad 16, comparando la jugada esperada con la mejor.
- **Líneas concretas a profundidad 20** (`pv.mts`): u05.l03 p4 y e2, u04.l03 p3, ex.disc.01 (Nxf7+ falla, −2,0: la solución Nc6+ es correcta), ex.fork.03, u06.l03 explicación 1, u06.l04 p3 (Nxh4 7,2 frente a Bxf7+ 5,4: la solución es correcta), u06.l02 p3.
- **A mano**, casilla por casilla: todos los mates de u03/u04 (escalera, pasillo, coz, pastor, mates en 2 y unicidad de la defensa), los ahogados que citan los `wrongByMove`, las clavadas (son reales en las 7 posiciones de u05.l03 y ex.pin.*), las horquillas (los objetivos no pueden capturar a la pieza que hace la horquilla) y las descubiertas.
- **Reglas**: movimiento de cada pieza, enroque (condiciones completas), captura al paso, promoción, ahogado, triple repetición, material insuficiente y 50 jugadas. Están bien explicadas salvo I2.
- **Espejos**: `mirrorText` voltea bien colores y casillas en los 26 textos (por ejemplo «a4-e8» pasa a «a5-e1»).
- **Corrección en la app**: PracticeBoard.tsx:78 (solo la jugada exacta), worker/session.ts:50-57 (acepta cualquier mate y el enroque) y lessonFlow.ts:45 (solo la jugada exacta).
- **Carga de texto**: introducciones de 42 a 79 palabras y pasos de 34 a 94 (el máximo es el primer paso de u01). La frase más larga tiene 33 palabras. Es razonable. Ningún mensaje culpa al alumno («No pasa nada: así se aprende»).

## Lo que NO pude verificar

- Cómo se ven los textos en la app (no la abrí) ni los textos de Fase 4 de otros worktrees (excluidos, como pediste).
- Los puzles de Lichess de «Entrenar hoy» (vienen de la base de datos D1, no del repo) ni las frases de diagnóstico (`d.fact`, en src/diagnosis, fuera del alcance). De paso vi un fallo de concordancia allí: «la torre… es capturado» en src/diagnosis/rules/hanging_piece.ts:30-33 (solo en la CLI).
- La calibración de niveles frente al rating de Lichess (I12): conviene mirarla con datos.
- La profundidad 16-20 sin tablas de finales puede valorar mal algunos finales (por ejemplo, torre y alfil contra caballo). Solo di por buenas las conclusiones que comprobé también a mano.
- **Para un humano** (profesor): nombres de los mates (I8), si los niveles altos necesitan textos propios (M17) y si conviene aceptar varias jugadas en los ejercicios de principios (C4) o mejor reformular los enunciados.

## Estado tras la corrección (2026-11-14, mismo día)

Cada hallazgo se comprobó otra vez antes de tocarlo: chessops para legalidad y mates, Stockfish 16 (profundidad 16-18) para las valoraciones. Ninguno resultó falso. Tras los cambios, las 216 posiciones con solución siguen siendo legales y sin otros mates que los ya aceptados (script `verify.mts` contra el contenido nuevo).

Cambio de código común a C1-C4, C6 e I11: regla única `isExpectedMove` en `src/shared/moves.ts` (enroque canónico, cualquier mate si la solución da mate, y alternativas `alt` en la última jugada del alumno). La usan `PracticeBoard.tsx`, `lessonFlow.ts` (mini lección) y `worker/session.ts`. Campo opcional `alt?: string[]` en `PracticeStep` y `Exercise` (retrocompatible; `mirrorExercise` lo voltea). El servidor lee las alternativas del banco por `source_id`; `GET /api/session` no las envía (test). Tests: `test/content/alternatives.test.ts` (cada `alt` legal, no figura en `wrongByMove`, mate si la solución es mate, nunca ahogado, no gana menos material que la solución en búsqueda de 3 medias jugadas), `test/worker/session.test.ts` (alternativa del banco, original y espejo) y `test/web/lesson-flow.test.ts`.

| # | Estado | Qué se hizo / motivo |
|---|---|---|
| C1 | Corregido | Vale cualquier mate (regla común). Textos de acierto y fallo reescritos sin nombrar una sola jugada. Verificado en el navegador: Qg6 se rechaza (ahogado) y Qg7# se acepta. |
| C2 | Corregido | Regla de mate; el texto nombra Qh2# y Qg4#. |
| C3 | Corregido | `alt: ['d8f6']` (Stockfish: Qe7 0,00, Qf6 −0,31). Texto de acierto válido para las dos. |
| C4 | Corregido | Alternativas: l01 p1 d4; l01 p3 d5 y c5; l02 p1 Bb5 y Nc3; l03 p2 d3, O-O y Nc3 (Nc3 añadida: −0,27 frente a c3, desarrolla pieza nueva); l03 p3 Nf6. Todas a menos de 0,3 de la solución. Textos de acierto genéricos; mensajes de fallo falsos cambiados. |
| C5 | Corregido | FEN `6k1/8/6K1/8/8/8/8/R7 w` (Ra8# comprobado) y texto con la definición correcta de oposición. |
| C6 | Corregido | `alt: ['d2g2']` (Qg2+ también da jaque y ataca h1; Stockfish +33,6 frente a +34,0). Qg5+ y Qd8+ no se aceptan (no atacan la torre). |
| C7 | Corregido | Texto propuesto. |
| I1 | Corregido | Cxd5/Ta8/Dg8/Dg7 pasan a Nxd5/Ra8/Qg8/Qg7. Frase de notación en el primer paso de u01.l01 (letras de pieza), la x en u02.l04 y + / # en el primer paso de u04. La ayuda de «Escribir la jugada» ya muestra N, B, R, Q, K (sigue aceptando las letras españolas). |
| I2 | Corregido | Texto propuesto. |
| I3 | Corregido | Texto propuesto. |
| I4 | Corregido | Stockfish: Ne5 +36,99 y Bxd7+ 0,00; Ne4 +37,14 y Bxd2+ 0,00. Textos de acierto y de `wrongByMove` reescritos (torre entera; rey y caballo contra rey es tablas). |
| I5 | Corregido | Nueva posición `8/8/8/8/8/8/1k6/Q6K b` (jaque de dama sin protección): Kxa1 0,00, cualquier otra jugada recibe mate (Stockfish). |
| I6 | Corregido | Explicación con la posición tras 2.Qh5 Nc6 3.Bc4 g6 (la dama atacada por un peón; Stockfish 0,00). |
| I7 | Corregido | Enunciado «Captura el peón que ataca al tuyo» y mensaje de fallo propuesto (Stockfish: Nc3 y d3 no pierden peón). |
| I8 | Corregido (confirmar término) | «Mate de la coz (también llamado mate ahogado)» en u03, u04, banco y conceptos, aclarando que no es el ahogado de tablas. **Para un humano:** confirmar el nombre que usa la escuela. |
| I9 | Corregido | Niveles: ex.pin.04 y ex.disc.04 de advanced a basic; ex.fork.04 de intermediate a initiation; ex.mate.05 de intermediate a basic. Los niveles no se guardan en D1. Efecto: Avanzado y Competitivo reciben ahora ejercicios de Intermedio o Básico (el más cercano); faltan ejercicios de 2-3 jugadas para esos niveles (contenido nuevo, fuera de esta corrección). |
| I10 | Corregido (solo el nombre) | Se muestra «Mate y amenazas de mate» y la definición separa las dos ideas. El id `tactics.mate_threat` no cambia porque está guardado en D1 (`cp_weak_concepts`, `cp_review_schedule`, `cp_session_items`); separarlo en dos conceptos exige migración con mapa de compatibilidad y no es seguro aquí. |
| I11 | En parte | La mini lección acepta ahora cualquier mate si la mejor es mate (la sesión ya lo hacía). Aceptar jugadas casi iguales requiere guardar el multipv del análisis: no hecho. |
| I12 | No corregido | Necesita datos reales de ratings de Lichess; cambiar rangos o rótulos sin ellos es adivinar. Para un humano. |
| I13 | Corregido | Texto propuesto. |
| I14 | Corregido | Texto propuesto. |
| I15 | Corregido | Mensaje y pista cambiados (Stockfish: Nc6 −0,48 y d6 −0,39 recuperan el peón). |

Menores corregidos (texto o cambio trivial): M1, M2, M3, M4, M5 (texto: «si las negras no defienden f7»), M6, M7, M8, M9, M10, M11 (peón blanco en d3: Stockfish O-O −0,10, Nxe4 −2,06), M12, M16, M17 («1700 Elo o más»).

Menores sin corregir:
- M13 y M14: cambian posiciones y material de varias lecciones y del banco; conviene hacerlo con un profesor y volver a verificar con motor.
- M15 («coronar» frente a «promocionar»): decidir un término; afecta a textos generados de la mini lección y la sesión.
- La concordancia de `src/diagnosis/rules/hanging_piece.ts` (solo CLI, fuera de alcance).

No verificado: textos en un móvil real; la sesión en el navegador se probó con una respuesta simulada temporal (ya retirada) que usa la misma función que el servidor; el servidor se prueba en `test/worker/session.test.ts`, no en producción.
