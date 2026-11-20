# Auditoría automática de contenido · 2026-11-20

> **Aviso.** Auditor automático: Stockfish 16 NNUE (en táctica, muy por encima de 2500) más reglas de lint. No es un maestro titulado ni valida la pedagogía; sus hallazgos son candidatos que revisa una persona. No presentar este informe como validación humana.

- Alcance: u16, bank. Las mini lecciones de error (error-lesson) no tienen posiciones fijas: se generan de cada partida y no entran.
- Posiciones con solución: 182; jugadas del alumno analizadas: 236.
- Motor: Stockfish 16 NNUE de un hilo, profundidad 16, MultiPV 4, hash limpio por posición (199 s).
- Umbrales: solución peor que la mejor en más de 60 cp; alternativa a 30 cp o menos de la solución; «sigue ganando» desde +3. Mate en N = 20000 − 100·N cp.
- «Gana material»: profundidad 18, línea principal seguida hasta una posición estable (tope 16 medias jugadas); falsa si ni el balance neto sube ni la evaluación supera en +1 al material de antes.

## Resumen

| Tipo | Gravedad | Hallazgos |
|---|---|---|
| ALTERNATIVA_IGUAL_O_MEJOR | importante | 41 |
| MATE_MULTIPLE | importante | 2 |
| ALTERNATIVA_EN_POSICION_GANADA | aviso | 20 |
| SOLUCION_DIRIGIDA_NO_OPTIMA | aviso | 2 |
| SOLUCION_EN_POSICION_PERDIDA | aviso | 2 |
| SOLUCION_SUBOPTIMA_GANADORA | aviso | 2 |
| **Total** | | **69** |

## Importante

| Tipo | Dónde | Archivo | Detalle |
|---|---|---|---|
| MATE_MULTIPLE | ex.clearance.04 | src/pedagogy/exercises.ts:554 | 2 mates en 1: Rgxg8#, Rfxg8# (solución Rgxg8#) |
| MATE_MULTIPLE | ex.clearance.04.m (espejo) | src/pedagogy/exercises.ts:554 | 2 mates en 1: Rfxg1#, Rgxg1# (solución Rgxg1#) |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03.m (espejo) | src/pedagogy/exercises.ts:31 | Ba4 (+0.00) frente a la solución Bxf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03.m (espejo) | src/pedagogy/exercises.ts:31 | Be4 (+0.00) frente a la solución Bxf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03.m (espejo) | src/pedagogy/exercises.ts:31 | Bb5 (+0.00) frente a la solución Bxf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03 | src/pedagogy/exercises.ts:31 | Ba1 (+0.00) frente a la solución Bxf6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03 | src/pedagogy/exercises.ts:31 | Bb2 (+0.00) frente a la solución Bxf6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03 | src/pedagogy/exercises.ts:31 | Bd2 (+0.00) frente a la solución Bxf6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03 | src/pedagogy/exercises.ts:31 | Bb4 (+0.00) frente a la solución Bxf6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.exchange.03 | src/pedagogy/exercises.ts:82 | Ra3 (-34.85) frente a la solución exd5 (-37.56): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.exchange.03.m (espejo) | src/pedagogy/exercises.ts:82 | Ra7 (-36.58) frente a la solución exd4 (-40.12): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.exchange.03.m (espejo) | src/pedagogy/exercises.ts:82 | Ke7 (-40.00) frente a la solución exd4 (-40.12): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.exchange.03.m (espejo) | src/pedagogy/exercises.ts:82 | Ra5 (-40.05) frente a la solución exd4 (-40.12): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.fork.02 | src/pedagogy/exercises.ts:113 | Nc3 (-0.14) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.fork.02 | src/pedagogy/exercises.ts:113 | Ke2 (-0.14) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.fork.02 | src/pedagogy/exercises.ts:113 | Kf2 (-0.14) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.fork.02.m (espejo) | src/pedagogy/exercises.ts:113 | Ke7 (-0.11) frente a la solución Nc2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.fork.02.m (espejo) | src/pedagogy/exercises.ts:113 | Kf7 (-0.12) frente a la solución Nc2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.fork.02.m (espejo) | src/pedagogy/exercises.ts:113 | Nc6 (-0.14) frente a la solución Nc2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01.m (espejo) | src/pedagogy/exercises.ts:143 | Ba3 (+0.00) frente a la solución Bb4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01.m (espejo) | src/pedagogy/exercises.ts:143 | Bc5 (+0.00) frente a la solución Bb4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01.m (espejo) | src/pedagogy/exercises.ts:143 | Bd6 (+0.00) frente a la solución Bb4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01 | src/pedagogy/exercises.ts:143 | Be2 (+0.00) frente a la solución Bb5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01 | src/pedagogy/exercises.ts:143 | Bg2 (+0.00) frente a la solución Bb5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01 | src/pedagogy/exercises.ts:143 | Bd3 (+0.00) frente a la solución Bb5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01 | src/pedagogy/exercises.ts:143 | Bh3 (+0.00) frente a la solución Bb5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02 | src/pedagogy/exercises.ts:152 | Kg2 (+0.15) frente a la solución Re1 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02 | src/pedagogy/exercises.ts:152 | Kf2 (+0.15) frente a la solución Re1 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02 | src/pedagogy/exercises.ts:152 | Ra6 (+0.14) frente a la solución Re1 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02 | src/pedagogy/exercises.ts:152 | Kh2 (+0.11) frente a la solución Re1 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02.m (espejo) | src/pedagogy/exercises.ts:152 | Kf7 (+0.15) frente a la solución Re8 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02.m (espejo) | src/pedagogy/exercises.ts:152 | Kg7 (+0.15) frente a la solución Re8 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02.m (espejo) | src/pedagogy/exercises.ts:152 | Ra3 (+0.14) frente a la solución Re8 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02.m (espejo) | src/pedagogy/exercises.ts:152 | Rd8 (+0.11) frente a la solución Re8 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.clearance.04 (jugada 3) | src/pedagogy/exercises.ts:554 | Rfxg8# (#1) frente a la solución Rgxg8# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.clearance.04.m (espejo) (jugada 3) | src/pedagogy/exercises.ts:554 | Rfxg1# (#1) frente a la solución Rgxg1# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.kp.02 | src/pedagogy/exercises.ts:576 | Kc5 (-34.86) frente a la solución Ke6 (-35.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.kp.02 | src/pedagogy/exercises.ts:576 | Kc6 (-34.98) frente a la solución Ke6 (-35.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.kp.02 | src/pedagogy/exercises.ts:576 | Kc7 (-35.00) frente a la solución Ke6 (-35.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.rook.06 | src/pedagogy/exercises.ts:651 | Rh4 (+0.00) frente a la solución Rh1 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.rook.06 | src/pedagogy/exercises.ts:651 | Rh3 (+0.00) frente a la solución Rh1 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.rook.06.m (espejo) | src/pedagogy/exercises.ts:651 | Rh6 (+0.00) frente a la solución Rh8 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.rook.06.m (espejo) | src/pedagogy/exercises.ts:651 | Rh5 (+0.00) frente a la solución Rh8 (+0.00): candidata a jugada aceptada |

## Aviso

| Tipo | Dónde | Archivo | Detalle |
|---|---|---|---|
| SOLUCION_DIRIGIDA_NO_OPTIMA | ex.exchange.02.m (espejo) | src/pedagogy/exercises.ts:72 | Nxd4 (-30.38) pierde 131 cp frente a Kf7 (-29.07) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | ex.exchange.02 | src/pedagogy/exercises.ts:72 | Nxd5 (-30.12) pierde 230 cp frente a Na4 (-27.82) |
| SOLUCION_EN_POSICION_PERDIDA | ex.exchange.03 | src/pedagogy/exercises.ts:82 | exd5 (-37.56) pierde 271 cp frente a Ra3 (-34.85) |
| SOLUCION_EN_POSICION_PERDIDA | ex.exchange.03.m (espejo) | src/pedagogy/exercises.ts:82 | exd4 (-40.12) pierde 354 cp frente a Ra7 (-36.58) |
| ALTERNATIVA_EN_POSICION_GANADA | ex.fork.03 | src/pedagogy/exercises.ts:122 | Qg2+ (+34.35) frente a la solución Qd5+ (+34.25): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.fork.03.m (espejo) | src/pedagogy/exercises.ts:122 | Qd1+ (+33.74) frente a la solución Qd4+ (+33.55): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.fork.03.m (espejo) | src/pedagogy/exercises.ts:122 | Qg7+ (+33.55) frente a la solución Qd4+ (+33.55): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.fork.03.m (espejo) | src/pedagogy/exercises.ts:122 | Qg4+ (+33.53) frente a la solución Qd4+ (+33.55): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | ex.pin.03 | src/pedagogy/exercises.ts:161 | Qa4 (+3.02) pierde 3275 cp frente a Qd6 (+35.77) |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03 | src/pedagogy/exercises.ts:161 | Qd6 (+35.77) frente a la solución Qa4 (+3.02): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03 | src/pedagogy/exercises.ts:161 | Kf2 (+3.57) frente a la solución Qa4 (+3.02): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03 | src/pedagogy/exercises.ts:161 | Qe2+ (+3.27) frente a la solución Qa4 (+3.02): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03 | src/pedagogy/exercises.ts:161 | Qd5 (+3.17) frente a la solución Qa4 (+3.02): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:161 | Qa5 (+3.03) pierde 3235 cp frente a Ke7 (+35.38) |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:161 | Ke7 (+35.38) frente a la solución Qa5 (+3.03): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:161 | Qd3 (+3.36) frente a la solución Qa5 (+3.03): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:161 | Kf7 (+3.28) frente a la solución Qa5 (+3.03): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:161 | Qd4 (+3.26) frente a la solución Qa5 (+3.03): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.kp.03 | src/pedagogy/exercises.ts:585 | Kd4 (+29.09) frente a la solución Ke4 (+29.09): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.kp.03.m (espejo) | src/pedagogy/exercises.ts:585 | Kd5 (+28.94) frente a la solución Ke5 (+29.09): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.rook.05 | src/pedagogy/exercises.ts:641 | Rf8+ (+3.88) frente a la solución Re1+ (+3.86): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.rook.05 | src/pedagogy/exercises.ts:641 | Rf6 (+3.87) frente a la solución Re1+ (+3.86): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.rook.05 | src/pedagogy/exercises.ts:641 | Rg1 (+3.87) frente a la solución Re1+ (+3.86): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.rook.05.m (espejo) | src/pedagogy/exercises.ts:641 | Rf1+ (+3.90) frente a la solución Re8+ (+3.90): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.rook.05.m (espejo) | src/pedagogy/exercises.ts:641 | Rf3 (+3.88) frente a la solución Re8+ (+3.90): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.rook.05.m (espejo) | src/pedagogy/exercises.ts:641 | Rg8 (+3.87) frente a la solución Re8+ (+3.90): candidata a jugada aceptada |
