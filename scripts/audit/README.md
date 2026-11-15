# Auditor de contenido

> **Qué es y qué no es.** Es un auditor automático: Stockfish 16 NNUE (en táctica, fuerza muy por encima de 2500) más reglas de lint. **No es un maestro titulado ni valida la pedagogía.** Sus hallazgos son candidatos que revisa una persona. No se presenta en la web ni en la documentación como validación humana.

## Cómo se corre

```sh
npm run audit:content                       # todo: u01-u06 + banco EXERCISES y sus espejos de negras
npm run audit:content -- --unit u03,bank    # solo esas unidades ("bank" = banco de ejercicios)
npm run audit:content -- --changed          # solo lo modificado frente a main (git diff + cambios sin confirmar)
npm run audit:content -- --no-engine        # sin motor: legalidad, mates en 1 y lint (menos de 1 s)
npm run audit:content -- --depth 20 --multipv 5 --jobs 2 --out /tmp/informe.md
```

- Runner: `tsx` (ya está en devDependencies); el script es `scripts/audit-content.ts`.
- Por defecto: profundidad 16, MultiPV 4, hasta 4 procesos del motor en paralelo. El análisis completo tarda unos minutos.
- Salida: `docs/auditoria-contenido-<fecha>.md` y un resumen en consola.
- Código de salida 1 si hay hallazgos graves (ver tabla); 0 si no.
- No forma parte de `npm test` (es lento). Las funciones puras sí tienen prueba: `test/audit/lib.test.ts`.

## Qué comprueba

Para cada posición con solución (práctica y evaluación de las lecciones, ejercicios del banco y sus espejos), y en cada jugada del alumno de la línea:

| Tipo | Gravedad | Regla |
|---|---|---|
| FEN_ILEGAL, SOLUCION_ILEGAL | grave | chessops: la posición o una jugada de `solutionUci` no es legal |
| SOLUCION_NO_ES_LA_MEJOR | grave | la solución pierde más de 60 cp frente a la mejor jugada y ya no gana claramente (< +3) |
| SAN_ILEGAL | grave | el texto cita una jugada que no es legal en la posición del paso ni en su línea |
| SOLUCION_SUBOPTIMA_GANADORA | aviso | pierde más de 60 cp frente a la mejor, pero sigue ganando (p. ej. +33 frente a mate en 13) |
| ALTERNATIVA_IGUAL_O_MEJOR | importante | una jugada distinta de la solución, entre las MultiPV, está a 30 cp o menos: candidata a jugada aceptada |
| MATE_MULTIPLE | importante | hay más de un mate en 1 (la corrección acepta solo la jugada exacta) |
| AFIRMACION_FALSA | importante | el enunciado dice «mate (en N)» o «gana material» y la línea o el motor no lo confirman |
| SAN_MATE_FALSO, SAN_JAQUE_FALSO | importante | el texto da una jugada como mate o jaque («Ra8#», «Qh5 da jaque») y no lo es |
| NOTACION_MEZCLADA | aviso | jugada con letra española (C, A, T, D) cuando la app usa la inglesa |
| FRASE_LARGA | aviso | más de 30 palabras entre puntos |
| CULPA | aviso | palabras que pueden culpar al alumno («mal», «error tuyo», «fallaste»…); revisar a mano |
| EMOJI | aviso | emojis en el texto |

Escala: el motor puntúa desde el bando que mueve; mate en N = 20000 − 100·N cp, para que un mate más largo cuente como peor.

Jugadas citadas en el texto: solo cuentan las que llevan letra de pieza, captura, enroque, «+»/«#» o número de jugada; las casillas sueltas («la casilla e4») no. Una cita vale si es legal en la posición del paso, en su línea de solución, tras las jugadas citadas antes, con el turno cambiado (amenazas del rival), tras una jugada intermedia no citada o si ya está hecha (relatos de apertura). Por eso no da por ilegal una cita bien hecha, pero puede dejar pasar alguna mal hecha.

Las mini lecciones de error (`src/pedagogy/error-lesson.ts`) no entran: no tienen posiciones fijas, se generan de cada partida.

## Límites

- Profundidad 16 sin tablas de finales: puede valorar mal finales lentos. Para un caso dudoso, repetir con `--depth 22`.
- MultiPV 4: una alternativa buena que no esté entre las 4 primeras no aparece.
- ALTERNATIVA_IGUAL_O_MEJOR sale mucho en posiciones ya ganadas o en aperturas (varias jugadas igual de buenas). Es una señal para decidir si aceptar más jugadas o cambiar el enunciado, no un error.
- No juzga si el ejercicio enseña lo que dice, si el nivel es el adecuado ni si el texto se entiende. Para eso, la rúbrica de `docs/perfil-revisor-ajedrez.md` (y una persona).

## Archivos

- `scripts/audit-content.ts`: recorre el contenido, reparte el trabajo al motor y escribe el informe.
- `scripts/audit/lib.ts`: funciones puras (legalidad, comparación, afirmaciones, lint, citas SAN).
- `scripts/audit/engine.ts`: Stockfish con MultiPV; reutiliza `UciSession` de `src/analysis` e implementa `EngineLike`.
- `scripts/audit/stockfish-proc.cjs`: proceso UCI de Node para `stockfish-nnue-16-single.js` (el build de la web), cuyo modo CLI no funciona en Node. Usa `node_modules/stockfish/src/` (la copia de `web/public/engine/` falla en Node porque el repo es ESM).
