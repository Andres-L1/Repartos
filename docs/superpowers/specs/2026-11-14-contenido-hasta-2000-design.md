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
- **Competitivo (1700+)**: sigue «En preparación». Propuesta de primera unidad verificable: u12 «Defensa y cálculo largo»: (1) la única jugada que salva (Stockfish: la solución a 30 cp o menos de la mejor y todas las demás al menos 1,5 peores), (2) combinaciones mixtas de 5 a 7 medias jugadas con varios temas a la vez, (3) interferencia y despeje (temas `interference`, `clearance`, comprobados con 200). Las unidades de estrategia (estructuras de peones, profilaxis, conversión) no se pueden verificar con motor de forma fiable: solo con profesores.
- Intermedio: finales de torre básicos y planes (columnas abiertas, casillas débiles). Avanzado: finales técnicos (Lucena, Philidor). Necesitan criterio de corrección por plan, no por jugada única: con Stockfish casi siempre hay varias jugadas ganadoras equivalentes.
- Básico: finales de rey y peón (oposición, cuadrado). Siguen fuera: hace falta un verificador exacto (tablas de finales); cuando se haga necesita un id nuevo (p. ej. u20) con `order` entre 9 y 10 o reordenar sin cambiar ids persistidos.

## Decisiones abiertas para el usuario
1. (Resuelta 2026-11-15: sí a conceptos nuevos.) Competitivo: ¿se publica u12 con la propuesta de arriba o se espera a profesores para todo el nivel?
2. (Resuelta: Stockfish sí, como script bajo demanda; los tests de Vitest no lo ejecutan.) ¿Se integra `scripts/verify-fase4.mts` en el auditor `npm run audit:content` que prepara otro agente?
3. Quién valida: u07-u11 necesitan revisión de profesores antes de presentarlos como validados.
