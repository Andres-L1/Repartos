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

## Decisiones abiertas para el usuario
1. ¿Se aceptan conceptos nuevos (con su tema de Lichess, que alarga el relleno del depósito) o se limita el temario a los 6 actuales hasta Intermedio?
2. ¿Se añade Stockfish (ya es dependencia, WASM) a los tests de contenido para verificar finales y planes? Sin él, solo se puede publicar táctica y mates verificados.
3. Quién valida: el contenido u07-u09 necesita revisión de profesores antes de presentarlo como validado.
