# Fase 4 · Contenido hasta 2000 Elo (diseño)

Fecha: 2026-11-14. Todo el contenido nuevo está **pendiente de validación de profesores**: solo está verificado por código.

## Punto de partida (comprobado en el código)
- `src/content/index.ts` tenía 6 unidades: u01-u03 `beginner` y u04-u06 `initiation` (24 lecciones, 0-800 Elo).
- `worker/level.ts` (`levelPlan`) marca `comingSoon` cualquier nivel sin una unidad con ese `level`; `/api/level` pone `available` por la misma regla. Por eso Básico, Intermedio, Avanzado y Competitivo salían «En preparación».
- Repasos: una lección fallada envía sus `conceptIds` como `mistakes` (`LessonPlayer`); el servidor solo agenda los que están en `CONCEPTS` (`worker/srs.ts`). La sesión diaria saca cada concepto de: error propio, puzle de Lichess (`THEME_BY_CONCEPT` en `src/review/srs.ts`) o banco `EXERCISES`.
- Conceptos existentes: `tactics.hanging_piece`, `bad_exchange`, `fork`, `pin`, `discovered_attack`, `mate_threat`.

## Regla para que una lección entre en repasos y sesión
Cada lección nueva lleva al menos un `conceptId` de `CONCEPTS`. Con un concepto existente no hay que tocar nada más. Un concepto nuevo exige, en el mismo cambio:
1. Entrada en `CONCEPTS` (definición y plantilla para los 6 niveles).
2. Tema de Lichess en `THEME_BY_CONCEPT` (1 a 1). Cada tema nuevo añade 5 combinaciones al depósito; el cron rellena una por minuto.
3. Al menos 2 ejercicios en `EXERCISES` (respaldo si el depósito está vacío), con su test.

## Plan por nivel (3 unidades por nivel, 3-4 lecciones cada una)
| Nivel | Unidades | Conceptos | Verificación posible |
|---|---|---|---|
| Básico 800-1100 | **u07 Ataques dobles y clavadas, u08 Descubiertas y cálculo de capturas, u09 Patrones de mate (hecho, 9 lecciones)**. Pendiente: u10 Finales de rey y peón (oposición, regla del cuadrado). | existentes; u10: nuevo `endgame.king_pawn` (tema `pawnEndgame`) | u07-u09: búsqueda de material y mates (helpers actuales). u10 necesita un resolvedor exacto de rey y peón contra rey (no existe aún). |
| Intermedio 1100-1400 | u11 Táctica II (enfilada, desviación, eliminar al defensor), u12 Finales de torre básicos, u13 Planes: columnas abiertas, casillas débiles, pieza mala | nuevos `tactics.skewer` (`skewer`), `tactics.deflection` (`deflection`), `tactics.remove_defender` (`capturingDefender`) | Táctica: helpers actuales. Finales y planes: no se pueden verificar con material; hace falta Stockfish en los tests. |
| Avanzado 1400-1700 | u14 Cálculo (jugada intermedia, jugadas tranquilas), u15 Ataque al rey (sacrificio en h7, rey en el centro), u16 Finales técnicos (Lucena, Philidor) | `tactics.intermezzo` (`intermezzo`), `tactics.attraction` (`attraction`), `endgame.rook` (`rookEndgame`) | Stockfish a profundidad fija con margen. |
| Competitivo 1700-2000 | u17 Estructuras de peones, u18 Profilaxis y prevención, u19 Finales prácticos y conversión de ventaja | `strategy.*` sin tema 1 a 1 en Lichess (la sesión usaría error propio y banco) | Stockfish; revisión de profesores imprescindible. |

Orden pedagógico dentro de cada nivel: táctica primero (se verifica y da resultados rápidos), luego finales, luego planes. Cada unidad exige la anterior (`requires`), igual que u01-u06.

## Formato y verificación (igual que u01-u06)
- `Unit`/`Lesson` de `src/content/schema.ts` sin cambios. 2 explicaciones, 3 prácticas, 3 evaluaciones nuevas por lección; español claro, sin emojis, notación N, B, R, Q, K.
- `test/content/lesson-checks.ts` (`describeLessons`) aplica a cada unidad: FEN legal, solución legal, `wrongByMove` legal, mate en 1 único, mate en 2 forzado con una sola primera jugada, o mejor jugada por material con al menos un peón de margen (profundidad 3). `unitsB` y `unitsC` lo usan.
- Límite conocido: la búsqueda de material no ve horizontes largos; las posiciones se construyen para que la idea se resuelva en 3 jugadas.

## Estado tras la segunda tanda (2026-11-15)

Decisiones 1 y 2 aprobadas por el usuario (conceptos nuevos y Stockfish para verificar). Todo lo nuevo sigue **pendiente de validación de profesores**.

Hecho (los ids de unidad cambian respecto a la tabla de arriba: la tabla reservaba u10 para finales de Básico, que siguen sin verificador exacto):
| Nivel | Unidad | Lecciones | Conceptos (tema de Lichess) |
|---|---|---|---|
| Intermedio | u10 «Táctica II: enfilada, desviación y eliminar al defensor» | 3 (18 ejercicios) | nuevos `tactics.skewer` (`skewer`), `tactics.deflection` (`deflection`), `tactics.remove_defender` (`capturingDefender`) |
| Avanzado | u11 «Cálculo: atracción, jugada intermedia y mates en tres» | 3 (18 ejercicios) | nuevos `tactics.attraction` (`attraction`), `tactics.intermezzo` (`intermezzo`); `tactics.mate_threat` |

- Temas de Lichess comprobados con `GET /api/puzzle/batch/{tema}` el 2026-11-14: 200 y cada puzle devuelto lleva ese tema. `overloading` no existe (404): la sobrecarga se enseña dentro de `deflection`.
- Banco: 20 ejercicios nuevos (4 por concepto, niveles `intermediate` y `advanced`), posiciones de u10-u11 reflejadas de izquierda a derecha, más sus espejos de negras.
- D1: ningún `CHECK` ni lista de ids de concepto en las migraciones (`concept_id TEXT`); el servidor valida contra `CONCEPTS`. **No hace falta migración.**
- Depósito de puzles: de 5 a 10 temas, de 25 a 50 combinaciones tema x dificultad. A una petición por minuto, el primer lote de cada combinación tarda unos 50 minutos tras desplegar (más si Lichess responde 429); mientras tanto, la sesión usa el banco.
- Verificación: `npx tsx scripts/verify-fase4.mts u10 u11 --bank` (Stockfish 16, profundidad 18, MultiPV 8) da 76/76: en cada jugada del alumno la solución es la mejor; las líneas sin mate dejan al menos +1,5 tras la primera jugada; toda jugada a 30 cp o menos está en `alt` (última jugada) o no existe (intermedias); los mates son el más corto y únicos salvo en la última jugada (allí vale cualquier mate); las respuestas del rival están a 30 cp o menos de su mejor defensa. Además, por código (`test/content/unitsD.test.ts`): legalidad, mate en 2 forzado y único, mejor jugada por material con un peón de margen y, en los 4 sacrificios de 5 medias jugadas que esa búsqueda no ve, balance final de al menos dos peones.
- Una alternativa aceptada: u10.l01 práctica 3 (Qc8+ o Qa8+, a 7 cp).

Planificado, no hecho:
- **Competitivo (1700+)**: hecha la primera unidad (u12, abajo). Las unidades de estrategia (estructuras de peones, profilaxis, conversión) no se pueden verificar con motor de forma fiable: solo con profesores.
- Intermedio: finales de torre básicos y planes (columnas abiertas, casillas débiles). Avanzado: finales técnicos (Lucena, Philidor). Necesitan criterio de corrección por plan, no por jugada única: con Stockfish casi siempre hay varias jugadas ganadoras equivalentes.
- Básico: finales de rey y peón (oposición, cuadrado). Siguen fuera: hace falta un verificador exacto (tablas de finales); cuando se haga necesita un id nuevo (p. ej. u20) con `order` entre 9 y 10 o reordenar sin cambiar ids persistidos.

## Tercera tanda (2026-11-15): Competitivo, u12

**Pendiente de validación de profesores.** u12 «Defensa precisa y cálculo largo» (`level: 'competitive'`, `requires: ['u11']`), 3 lecciones y 18 ejercicios:
| Lección | Conceptos (tema de Lichess) | Ejercicios |
|---|---|---|
| l01 La única jugada que salva | nuevo `tactics.defensive_move` (`defensiveMove`) | 6: salir del jaque a la casilla sin más jaques, evitar el perpetuo, cambiar y frenar un peón |
| l02 Interferencia y despeje | nuevos `tactics.interference` (`interference`) y `tactics.clearance` (`clearance`) | 6: alfil que corta la línea de una torre (Bb8), jaques que obligan al rey a taparse, piezas que se apartan con jaque |
| l03 Combinaciones de varios temas | `deflection`, `fork`, `mate_threat` (existentes) | 6: de 3 a 7 medias jugadas; dos mates en cuatro |

- Posiciones: puzles de la base de datos de Lichess (CC0), descargados con `GET /api/puzzle/batch/{tema}` el 2026-11-15 y filtrados por pocas piezas; el id va en un comentario junto a cada FEN. Textos propios. Temas comprobados contra la API: 200 y cada puzle devuelto lleva el tema.
- Banco: 12 ejercicios `competitive` (4 por concepto nuevo), más sus espejos. Dos son posiciones de u12 reflejadas de izquierda a derecha.
- Verificación (`npx tsx scripts/verify-fase4.mts u10 u11 u12 --bank`, profundidad 18, MultiPV 8): **118/118** (76 anteriores + 18 de u12 + 24 del banco con espejos). Criterio nuevo de defensa: en las posiciones de `tactics.defensive_move`, la primera jugada es la mejor y cualquier otra queda al menos 150 cp por debajo (sin exigir ventaja). Ninguna alternativa a 30 cp o menos: no hizo falta `alt`. Por código (`unitsD`): legalidad, mates en 2 forzados y únicos, balance final de dos peones o más en 7 líneas; 3 posiciones solo tienen motor (dos defensas de rey sin ganancia de material y la carrera del peón con Bb8). Dos remates admiten dos mates en la última jugada (Qh2# o Bh2#; Rgxg8# o Rfxg8#): la app acepta cualquier mate y el texto nombra los dos.
- Descartados por el verificador: interferencias con ventaja menor de +1,5 (VHazH, 715YM, 08TEy), líneas donde el rival tenía una defensa mejor que la del puzle (lGV8T, dEnDw y ERQqj completos; OlOre se usa solo con la primera jugada) y defensas poco instructivas.
- Auditor: `npm run audit:content -- --fase4` añade la pasada de `verify-fase4.mts` sobre las unidades desde u10 del alcance (y el banco). Sin `--fase4` no cambia nada.
- Depósito de puzles: de 10 a 13 temas, de 50 a 65 combinaciones (+15). Las 15 nuevas empiezan vacías y el cron las rellena primero (la de menos puzles sin usar): unos 15 minutos tras desplegar si Lichess no responde 429; desde cero, 65 minutos. La renovación semanal pasa de 50 a 65 peticiones. Sin migración.
- Web: la tarjeta Competitivo sale «Disponible ahora» (`levelPlan` y `/api/level` miran si hay unidades del nivel). La portada ya no tiene la lista fija de niveles disponibles: la saca del temario (`/api/outline`); antes decía solo los dos primeros aunque Básico-Avanzado ya tenían unidades. El mock muestra u12 en mapa, temario y niveles.

## Decisiones abiertas para el usuario
1. (Resuelta 2026-11-15: sí a conceptos nuevos.) Competitivo: ¿se publica u12 con la propuesta de arriba o se espera a profesores para todo el nivel?
2. (Resuelta: Stockfish sí, como script bajo demanda; los tests de Vitest no lo ejecutan.) ¿Se integra `scripts/verify-fase4.mts` en el auditor `npm run audit:content` que prepara otro agente?
3. Quién valida: u07-u12 necesitan revisión de profesores antes de presentarlos como validados.

## Cuarta tanda (2026-11-15): finales con tablebase, u13 y u14

**Pendiente de validación de profesores.** Los finales no se pueden verificar con material ni de forma fiable con motor, pero sí de forma exacta con la tablebase Syzygy de Lichess (`https://tablebase.lichess.ovh/standard?fen=`: categoría, DTZ, DTM y categoría de cada jugada). Solo se envían FEN de ejercicios, con pausa entre peticiones y reintento ante 429.

- u13 «Finales de rey y peón» (`basic`, `order` 10, `requires: ['u09']`): cuadrado, oposición, casillas clave/rey delante y peón de torre. u14 «Finales de torre» (`intermediate`, `order` 12, `requires: ['u10']`): cortar al rey, jaques por detrás (Philidor) y salir del jaque hacia el peón (Lucena). 3 lecciones cada una, con 2 explicaciones, 3 prácticas y 3 evaluaciones. `order` de u10, u11 y u12 pasa a 11, 13 y 14 (los ids no cambian); los órdenes son únicos.
- Conceptos nuevos: `endgame.king_pawn` (`pawnEndgame`) y `endgame.rook` (`rookEndgame`), con regla, porqué, nombre en el informe y 4 ejercicios de banco cada uno (con espejo de negras y `alt`).
- Criterio de corrección (`scripts/lib/tablebase.ts`, `checkLine`): en cada jugada del alumno la posición es ganada o tablas (nunca «cursed win») y se aceptan exactamente las jugadas que conservan ese resultado (la de la línea más `alt` en la última jugada; una jugada intermedia con varias válidas no se permite, por eso los pasos de torre son de una jugada); ninguna que lo degrade. Respuestas del rival: conservan su mejor resultado y, si pierde, son de las que más resisten (DTZ o DTM). Las explicaciones declaran su resultado y las afirmaciones sueltas de los textos están en `scripts/lib/finales-claims.ts`.
- Comandos: `npm run verify:finales` (usa la caché y pide lo que falte; `-- --refresh` repite todo y avisa de cambios; `probe "<fen>" ["<uci ...>"]` inspecciona una posición). Tests sin red con `test/fixtures/tablebase/positions.json` (95 posiciones) en `test/content/unitsE.test.ts`.
- Depósito de puzles: +2 temas (`pawnEndgame`, `rookEndgame`) por 5 dificultades = +10 combinaciones, 75 en total (unos 10 minutos más, con una petición por minuto).
- Límites: tablebase hasta 7 piezas y solo resultado teórico; no mide dificultad humana. Lucena y Philidor se enseñan en sus primeros pasos, no el método completo. No se ha hecho Avanzado de torre (u15): no se ha podido sostener la calidad verificada sin más iteración, y no se han hecho planes ni estrategia.

## Quinta tanda (2026-11-15): u15 torre Avanzado y u16 estrategia verificable

**Pendiente de validación de profesores.**

### u15 «Finales de torre: nivel Avanzado» (`advanced`, `order` 14, `requires: ['u14']`; u12 pasa a `order` 15)
- Lecciones: l01 Lucena completo (Rd1+ o Rc4, Rd4, salida del rey Kc7-Kb6 y Rb4), l02 Philidor en dos fases (torre en la sexta fila; con el peón en la sexta, jaques por detrás) y el paso de una a otra, l03 peón de torre y de alfil, torre detrás del peón pasado y regla de las columnas. Concepto `endgame.rook`.
- Criterio `optimal` (`scripts/lib/tablebase.ts`): en posiciones ganadas, solo las jugadas de menor DTM (DTZ si no hay DTM); empates en `alt` de la última jugada; en tablas, todas las que conservan el resultado; rival: máxima resistencia por DTM. Se eligió DTM y no DTZ porque con DTZ la tablebase prefiere salidas rápidas del peón que se alejan del puente (Ka6 en vez de Kc6); con DTM la línea óptima coincide con el método de manual.
- Mejora de `isExpectedMove`: no se hizo. Una jugada intermedia con varias ganadoras exigiría que el reproductor (`web/src/components/PracticeBoard.tsx`) siguiera una línea alternativa; el esquema solo permite `alt` en la última jugada. En su lugar, cada ejercicio se construye con jugadas intermedias únicas (la comprobación falla si hay otra jugada de DTM óptimo).
- Regla de las columnas: solo se afirma lo verificado en posiciones concretas (rey negro en b6 o b5 contra peón e4 y torre cortando: gana; en c6, d6 o c5: tablas). Es una regla orientativa, no un teorema general.
- Banco: `ex.rook.05` a `08`. Depósito de puzles: sin cambios.

### u16 «Estrategia verificable: actividad de las piezas» (`competitive`, `order` 16, `requires: ['u12']`)
- Lecciones: l01 torre a la columna abierta (`strategy.open_file`), l02 torre a la séptima fila (`strategy.seventh_rank`), l03 caballo en casilla de avanzada (`strategy.outpost`); 6 ejercicios de una jugada cada una (3 práctica, 3 evaluación), 2 explicaciones, banco de 4 por concepto con espejo.
- Posiciones: generadas con `scripts/gen-strategy.mts` (peones y piezas aleatorios con reyes enrocados, material igual o con un peón de diferencia) y filtradas: la mejor jugada a profundidad 18, MultiPV 8, es la del tema, no es captura ni jaque, supera en 60 cp o más a la segunda y la valoración queda entre 0 y +3 (jugadas con negativas se descartaron). Se probaron antes puzles de Lichess con temas `quietMove`, `advantage`, `endgame`, `middlegame`: salen casi siempre tácticas decisivas, no planes, y se descartaron.
- Verificación: `npx tsx scripts/verify-fase4.mts u16 --bank` (modo estrategia: solución mejor, el resto al menos 60 cp por debajo, sin `alt`); por código (`test/content/unitsF.test.ts`): legalidad, jugada única y hechos del concepto en lecciones, explicaciones, banco y espejos.
- **Lo que el motor no valida:** la pedagogía de explicar un plan, la representatividad de las posiciones y el orden de enseñanza. Las valoraciones de los textos se limitan a hechos comprobados por código y a «Stockfish la valora al menos 0,6 peones por encima de cualquier otra jugada».
- Depósito de puzles y cron: los conceptos `strategy.*` no tienen tema de Lichess 1 a 1 (`themeForConcept` devuelve `null`, como `tactics.bad_exchange`): +0 combinaciones. Sin migración (D1 no restringe ids de concepto).
