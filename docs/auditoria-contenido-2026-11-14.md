# Auditoría automática de contenido · 2026-11-14

> **Aviso.** Auditor automático: Stockfish 16 NNUE (en táctica, muy por encima de 2500) más reglas de lint. No es un maestro titulado ni valida la pedagogía; sus hallazgos son candidatos que revisa una persona. No presentar este informe como validación humana.

- Alcance: u01-u06 y banco de ejercicios con sus espejos. Las mini lecciones de error (error-lesson) no tienen posiciones fijas: se generan de cada partida y no entran.
- Posiciones con solución: 216; jugadas del alumno analizadas: 229.
- Motor: Stockfish 16 NNUE de un hilo, profundidad 16, MultiPV 4, hash limpio por posición (151 s).
- Umbrales: solución peor que la mejor en más de 60 cp; alternativa a 30 cp o menos de la solución; «sigue ganando» desde +3. Mate en N = 20000 − 100·N cp.

## Resumen

| Tipo | Gravedad | Hallazgos |
|---|---|---|
| ALTERNATIVA_IGUAL_O_MEJOR | importante | 174 |
| MATE_MULTIPLE | importante | 2 |
| SAN_JAQUE_FALSO | importante | 1 |
| ALTERNATIVA_EN_POSICION_GANADA | aviso | 35 |
| CULPA | aviso | 3 |
| FRASE_LARGA | aviso | 18 |
| NOTACION_MEZCLADA | aviso | 5 |
| SOLUCION_DIRIGIDA_NO_OPTIMA | aviso | 13 |
| SOLUCION_EN_POSICION_PERDIDA | aviso | 2 |
| SOLUCION_SUBOPTIMA_GANADORA | aviso | 7 |
| **Total** | | **260** |

## Importante

| Tipo | Dónde | Archivo | Detalle |
|---|---|---|---|
| MATE_MULTIPLE | u03.l04 práctica 1 | src/content/units/u03.ts:383 | 5 mates en 1: Qh1#, Qh2#, Qh3#, Qg7#, Qg8# (solución Qh2#) |
| MATE_MULTIPLE | u04.l04 práctica 4 | src/content/units/u04.ts:444 | 2 mates en 1: Qh2#, Qg4# (solución Qh2#) |
| SAN_JAQUE_FALSO | u05.l03 práctica 2 | src/content/units/u05.ts:321 | el texto da «Nxc6+» como jaque y no lo es |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l02 práctica 2 | src/content/units/u01.ts:178 | Bb2 (+0.00) frente a la solución Bxf4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l02 práctica 2 | src/content/units/u01.ts:178 | Bd2 (+0.00) frente a la solución Bxf4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l02 práctica 2 | src/content/units/u01.ts:178 | Ba3 (+0.00) frente a la solución Bxf4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l02 práctica 2 | src/content/units/u01.ts:178 | Be3 (+0.00) frente a la solución Bxf4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 práctica 1 | src/content/units/u01.ts:291 | Kc3 (+0.00) frente a la solución Kxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 práctica 1 | src/content/units/u01.ts:291 | Kd3 (+0.00) frente a la solución Kxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l02 evaluación 3 | src/content/units/u01.ts:223 | Bg1 (+0.00) frente a la solución Bxb6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l02 evaluación 3 | src/content/units/u01.ts:223 | Be3 (+0.00) frente a la solución Bxb6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l02 evaluación 3 | src/content/units/u01.ts:223 | Bg3 (+0.00) frente a la solución Bxb6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l02 evaluación 3 | src/content/units/u01.ts:223 | Bd4 (+0.00) frente a la solución Bxb6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 práctica 4 | src/content/units/u01.ts:324 | Ng1 (+0.00) frente a la solución Nxe5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 práctica 4 | src/content/units/u01.ts:324 | Nd2 (+0.00) frente a la solución Nxe5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 práctica 4 | src/content/units/u01.ts:324 | Nh2 (+0.00) frente a la solución Nxe5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 práctica 4 | src/content/units/u01.ts:324 | Nd4 (+0.00) frente a la solución Nxe5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 práctica 2 | src/content/units/u01.ts:419 | Kd1 (+0.00) frente a la solución dxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 práctica 2 | src/content/units/u01.ts:419 | d3 (+0.00) frente a la solución dxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 práctica 2 | src/content/units/u01.ts:419 | d4 (+0.00) frente a la solución dxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 evaluación 3 | src/content/units/u01.ts:358 | Nd2 (+0.00) frente a la solución Nxg5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 evaluación 3 | src/content/units/u01.ts:358 | Nf2 (+0.00) frente a la solución Nxg5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 evaluación 3 | src/content/units/u01.ts:358 | Nc3 (+0.00) frente a la solución Nxg5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l03 evaluación 3 | src/content/units/u01.ts:358 | Ng3 (+0.00) frente a la solución Nxg5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 evaluación 2 | src/content/units/u01.ts:457 | e3 (+0.00) frente a la solución exf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 evaluación 2 | src/content/units/u01.ts:457 | e4 (+0.00) frente a la solución exf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 evaluación 2 | src/content/units/u01.ts:457 | Kf1 (+0.00) frente a la solución exf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 evaluación 3 | src/content/units/u01.ts:469 | e3 (+0.00) frente a la solución exd3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 evaluación 3 | src/content/units/u01.ts:469 | Kd7 (+0.00) frente a la solución exd3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u01.l04 evaluación 3 | src/content/units/u01.ts:469 | Ke7 (+0.00) frente a la solución exd3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l01 práctica 3 | src/content/units/u02.ts:64 | Be2 (+0.00) frente a la solución Bxc4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l01 práctica 3 | src/content/units/u02.ts:64 | Bg2 (+0.00) frente a la solución Bxc4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l01 práctica 3 | src/content/units/u02.ts:64 | Bd3 (+0.00) frente a la solución Bxc4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l01 práctica 3 | src/content/units/u02.ts:64 | Bh3 (+0.00) frente a la solución Bxc4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l01 práctica 4 | src/content/units/u02.ts:72 | d5 (+0.00) frente a la solución dxe5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l01 práctica 4 | src/content/units/u02.ts:72 | Kd1 (+0.00) frente a la solución dxe5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l01 práctica 4 | src/content/units/u02.ts:72 | Kf1 (+0.00) frente a la solución dxe5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l01 evaluación 2 | src/content/units/u02.ts:93 | Nxf4 (-0.19) frente a la solución Nxc5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l02 práctica 3 | src/content/units/u02.ts:174 | Bc1 (+0.00) frente a la solución Bxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l02 práctica 3 | src/content/units/u02.ts:174 | Be3 (+0.00) frente a la solución Bxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l02 práctica 3 | src/content/units/u02.ts:174 | Bf4 (+0.00) frente a la solución Bxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l02 práctica 1 | src/content/units/u02.ts:152 | Nc3 (+0.04) frente a la solución d3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l02 práctica 1 | src/content/units/u02.ts:152 | Nf2 (+0.00) frente a la solución d3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l02 práctica 1 | src/content/units/u02.ts:152 | Ng3 (+0.00) frente a la solución d3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l02 práctica 1 | src/content/units/u02.ts:152 | Ng5 (+0.00) frente a la solución d3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l03 práctica 4 | src/content/units/u02.ts:297 | d3 (+0.00) frente a la solución dxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l03 práctica 4 | src/content/units/u02.ts:297 | Kd7 (+0.00) frente a la solución dxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l03 práctica 4 | src/content/units/u02.ts:297 | Ke7 (+0.00) frente a la solución dxc3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l03 evaluación 3 | src/content/units/u02.ts:329 | d4 (+0.00) frente a la solución dxc4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l03 evaluación 3 | src/content/units/u02.ts:329 | Kd1 (+0.00) frente a la solución dxc4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u02.l03 evaluación 3 | src/content/units/u02.ts:329 | Kf1 (+0.00) frente a la solución dxc4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l01 práctica 2 | src/content/units/u03.ts:64 | Kf1 (+0.00) frente a la solución Be3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l01 práctica 2 | src/content/units/u03.ts:64 | Kd1 (-0.03) frente a la solución Be3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l01 práctica 2 | src/content/units/u03.ts:64 | Kd2 (-0.03) frente a la solución Be3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l01 evaluación 1 | src/content/units/u03.ts:94 | Kd1 (+0.00) frente a la solución gxf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l01 evaluación 1 | src/content/units/u03.ts:94 | Kf1 (+0.00) frente a la solución gxf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l01 evaluación 1 | src/content/units/u03.ts:94 | Kf2 (+0.00) frente a la solución gxf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l01 práctica 4 | src/content/units/u03.ts:84 | Ra7 (#13) frente a la solución Ra8+ (+96.05): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 1 | src/content/units/u03.ts:266 | Ra7 (#2) frente a la solución O-O (#6): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 1 | src/content/units/u03.ts:266 | Rh7 (#2) frente a la solución O-O (#6): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 1 | src/content/units/u03.ts:266 | Ra6 (#4) frente a la solución O-O (#6): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 1 | src/content/units/u03.ts:266 | Rh6 (#4) frente a la solución O-O (#6): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 2 | src/content/units/u03.ts:274 | Ra2 (#2) frente a la solución O-O-O (#8): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 2 | src/content/units/u03.ts:274 | Rh2 (#2) frente a la solución O-O-O (#8): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 2 | src/content/units/u03.ts:274 | Ra3 (#4) frente a la solución O-O-O (#8): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 2 | src/content/units/u03.ts:274 | Kd7 (#6) frente a la solución O-O-O (#8): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 4 | src/content/units/u03.ts:293 | d6 (+0.00) frente a la solución dxc6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 4 | src/content/units/u03.ts:293 | Kd1 (+0.00) frente a la solución dxc6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 práctica 4 | src/content/units/u03.ts:293 | Kd2 (+0.00) frente a la solución dxc6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 3 | src/content/units/u03.ts:336 | Kf7 (#10) frente a la solución d1=Q+ (#11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 3 | src/content/units/u03.ts:336 | Kf8 (#11) frente a la solución d1=Q+ (#11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 3 | src/content/units/u03.ts:336 | Ke7 (#11) frente a la solución d1=Q+ (#11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 2 | src/content/units/u03.ts:325 | Kf7 (+0.00) frente a la solución dxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 2 | src/content/units/u03.ts:325 | Ke7 (+0.00) frente a la solución dxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 2 | src/content/units/u03.ts:325 | Kd7 (+0.00) frente a la solución dxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 2 | src/content/units/u03.ts:325 | Kd8 (+0.00) frente a la solución dxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 práctica 1 | src/content/units/u03.ts:383 | Qh1# (#1) frente a la solución Qh2# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 práctica 1 | src/content/units/u03.ts:383 | Qh3# (#1) frente a la solución Qh2# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 práctica 1 | src/content/units/u03.ts:383 | Qg7# (#1) frente a la solución Qh2# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 evaluación 2 | src/content/units/u03.ts:426 | Kb1 (+0.00) frente a la solución Kxa1 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 evaluación 2 | src/content/units/u03.ts:426 | Kc1 (+0.00) frente a la solución Kxa1 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 evaluación 2 | src/content/units/u03.ts:426 | Ka2 (+0.00) frente a la solución Kxa1 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u04.l03 práctica 3 | src/content/units/u04.ts:312 | Qf6 (-0.16) frente a la solución Qe7 (+0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u04.l04 práctica 4 (jugada 2) | src/content/units/u04.ts:444 | Qg4# (#1) frente a la solución Qh2# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l01 práctica 4 | src/content/units/u05.ts:90 | Kd2 (-29.47) frente a la solución exd5 (-29.74): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l01 práctica 4 | src/content/units/u05.ts:90 | Kf2 (-29.54) frente a la solución exd5 (-29.74): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l01 práctica 4 | src/content/units/u05.ts:90 | Ke2 (-29.64) frente a la solución exd5 (-29.74): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 práctica 2 | src/content/units/u05.ts:197 | Ke2 (-0.12) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 práctica 2 | src/content/units/u05.ts:197 | Kd2 (-0.14) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 práctica 2 | src/content/units/u05.ts:197 | Nd4 (-0.14) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 evaluación 1 | src/content/units/u05.ts:238 | Ke2 (-0.11) frente a la solución Ne7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 evaluación 1 | src/content/units/u05.ts:238 | Kd2 (-0.11) frente a la solución Ne7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 evaluación 1 | src/content/units/u05.ts:238 | Ne3 (-0.12) frente a la solución Ne7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 evaluación 2 | src/content/units/u05.ts:248 | Ke7 (-0.11) frente a la solución Nf2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 evaluación 2 | src/content/units/u05.ts:248 | Nf6 (-0.11) frente a la solución Nf2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l02 evaluación 2 | src/content/units/u05.ts:248 | Kf7 (-0.11) frente a la solución Nf2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l03 práctica 3 | src/content/units/u05.ts:334 | Kd7 (+0.00) frente a la solución d4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l03 práctica 3 | src/content/units/u05.ts:334 | Ke7 (+0.00) frente a la solución d4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u05.l03 práctica 3 | src/content/units/u05.ts:334 | Kd8 (+0.00) frente a la solución d4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 1 | src/content/units/u06.ts:58 | d4 (+0.08) frente a la solución e4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 1 | src/content/units/u06.ts:58 | Nf3 (+0.08) frente a la solución e4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 1 | src/content/units/u06.ts:58 | e3 (+0.04) frente a la solución e4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 2 | src/content/units/u06.ts:72 | Bc4 (+0.13) frente a la solución d4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 2 | src/content/units/u06.ts:72 | Nc3 (+0.11) frente a la solución d4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 2 | src/content/units/u06.ts:72 | Bb5 (+0.08) frente a la solución d4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 3 | src/content/units/u06.ts:85 | c5 (-0.22) frente a la solución e5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 3 | src/content/units/u06.ts:85 | e6 (-0.22) frente a la solución e5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 3 | src/content/units/u06.ts:85 | Nc6 (-0.36) frente a la solución e5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 evaluación 1 | src/content/units/u06.ts:114 | Nf6 (-0.08) frente a la solución d5 (-0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 evaluación 1 | src/content/units/u06.ts:114 | e6 (-0.08) frente a la solución d5 (-0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 evaluación 1 | src/content/units/u06.ts:114 | c6 (-0.31) frente a la solución d5 (-0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 2 | src/content/units/u06.ts:202 | c3 (+0.13) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 2 | src/content/units/u06.ts:202 | h3 (+0.13) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 2 | src/content/units/u06.ts:202 | Nc3 (+0.07) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 1 | src/content/units/u06.ts:188 | Nc3 (+0.11) frente a la solución Bc4 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 1 | src/content/units/u06.ts:188 | Bb5 (+0.08) frente a la solución Bc4 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 1 | src/content/units/u06.ts:188 | d4 (+0.04) frente a la solución Bc4 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 4 | src/content/units/u06.ts:228 | Bc5 (-0.13) frente a la solución Nf6 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 4 | src/content/units/u06.ts:228 | Be7 (-0.17) frente a la solución Nf6 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 4 | src/content/units/u06.ts:228 | d6 (-0.22) frente a la solución Nf6 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 2 | src/content/units/u06.ts:257 | Na4 (+0.08) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 2 | src/content/units/u06.ts:257 | a3 (+0.06) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 2 | src/content/units/u06.ts:257 | Nd5 (+0.04) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 1 | src/content/units/u06.ts:244 | d4 (+0.22) frente a la solución Nf3 (+0.22): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 1 | src/content/units/u06.ts:244 | Bc4 (+0.04) frente a la solución Nf3 (+0.22): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 1 | src/content/units/u06.ts:244 | Nc3 (+0.00) frente a la solución Nf3 (+0.22): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 1 | src/content/units/u06.ts:315 | Qe7 (+0.08) frente a la solución Nc6 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 1 | src/content/units/u06.ts:315 | d6 (-0.04) frente a la solución Nc6 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 3 | src/content/units/u06.ts:270 | d6 (-0.27) frente a la solución Nc6 (-0.31): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 3 | src/content/units/u06.ts:270 | Nf6 (-0.43) frente a la solución Nc6 (-0.31): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 3 | src/content/units/u06.ts:270 | d5 (-0.52) frente a la solución Nc6 (-0.31): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 2 | src/content/units/u06.ts:329 | d3 (+0.17) frente a la solución c3 (+0.25): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 2 | src/content/units/u06.ts:329 | O-O (+0.17) frente a la solución c3 (+0.25): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 2 | src/content/units/u06.ts:329 | h3 (+0.08) frente a la solución c3 (+0.25): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 3 | src/content/units/u06.ts:342 | Nf6 (-0.13) frente a la solución Bc5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 3 | src/content/units/u06.ts:342 | Be7 (-0.17) frente a la solución Bc5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 3 | src/content/units/u06.ts:342 | d6 (-0.22) frente a la solución Bc5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 2 | src/content/units/u06.ts:370 | d3 (+0.13) frente a la solución Nc3 (+0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 2 | src/content/units/u06.ts:370 | d4 (+0.00) frente a la solución Nc3 (+0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 2 | src/content/units/u06.ts:370 | Qe2 (+0.00) frente a la solución Nc3 (+0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 1 | src/content/units/u06.ts:357 | a6 (-0.17) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 1 | src/content/units/u06.ts:357 | Be7 (-0.22) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 1 | src/content/units/u06.ts:357 | Bd6 (-0.27) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 3 | src/content/units/u06.ts:383 | d6 (-0.40) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 3 | src/content/units/u06.ts:383 | Bb6 (-0.40) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03 | src/pedagogy/exercises.ts:31 | Ba1 (+0.00) frente a la solución Bxf6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03 | src/pedagogy/exercises.ts:31 | Bb2 (+0.00) frente a la solución Bxf6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03 | src/pedagogy/exercises.ts:31 | Bd2 (+0.00) frente a la solución Bxf6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03 | src/pedagogy/exercises.ts:31 | Bb4 (+0.00) frente a la solución Bxf6 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03.m (espejo) | src/pedagogy/exercises.ts:31 | Ba4 (+0.00) frente a la solución Bxf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03.m (espejo) | src/pedagogy/exercises.ts:31 | Be4 (+0.00) frente a la solución Bxf3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.hanging.03.m (espejo) | src/pedagogy/exercises.ts:31 | Bb5 (+0.00) frente a la solución Bxf3 (+0.00): candidata a jugada aceptada |
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
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01 | src/pedagogy/exercises.ts:142 | Be2 (+0.00) frente a la solución Bb5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01 | src/pedagogy/exercises.ts:142 | Bg2 (+0.00) frente a la solución Bb5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01 | src/pedagogy/exercises.ts:142 | Bd3 (+0.00) frente a la solución Bb5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01 | src/pedagogy/exercises.ts:142 | Bh3 (+0.00) frente a la solución Bb5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01.m (espejo) | src/pedagogy/exercises.ts:142 | Ba3 (+0.00) frente a la solución Bb4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01.m (espejo) | src/pedagogy/exercises.ts:142 | Bc5 (+0.00) frente a la solución Bb4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.01.m (espejo) | src/pedagogy/exercises.ts:142 | Bd6 (+0.00) frente a la solución Bb4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02 | src/pedagogy/exercises.ts:151 | Kg2 (+0.15) frente a la solución Re1 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02 | src/pedagogy/exercises.ts:151 | Kf2 (+0.15) frente a la solución Re1 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02 | src/pedagogy/exercises.ts:151 | Ra6 (+0.14) frente a la solución Re1 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02 | src/pedagogy/exercises.ts:151 | Kh2 (+0.11) frente a la solución Re1 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02.m (espejo) | src/pedagogy/exercises.ts:151 | Kf7 (+0.15) frente a la solución Re8 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02.m (espejo) | src/pedagogy/exercises.ts:151 | Kg7 (+0.15) frente a la solución Re8 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02.m (espejo) | src/pedagogy/exercises.ts:151 | Ra3 (+0.14) frente a la solución Re8 (+0.11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | ex.pin.02.m (espejo) | src/pedagogy/exercises.ts:151 | Rd8 (+0.11) frente a la solución Re8 (+0.11): candidata a jugada aceptada |

## Aviso

| Tipo | Dónde | Archivo | Detalle |
|---|---|---|---|
| FRASE_LARGA | u01.l01 | src/content/units/u01.ts | 33 palabras: «Primero aprenderás a «leer» el tablero, como un mapa con direcciones, y después conocer…» |
| FRASE_LARGA | u01.l01 explicación 1 | src/content/units/u01.ts:22 | 34 palabras: «Cada casilla es una letra más un número: la de abajo a la izquierda es a1, la de arriba…» |
| FRASE_LARGA | u01.l01 explicación 2 | src/content/units/u01.ts:27 | 32 palabras: «La torre (la pieza con forma de castillo) se mueve en línea recta: hacia delante, hacia…» |
| FRASE_LARGA | u01.l02 explicación 3 | src/content/units/u01.ts:151 | 32 palabras: «La dama (o reina) es la pieza más poderosa: se mueve como una torre y como un alfil a l…» |
| FRASE_LARGA | u01.l04 | src/content/units/u01.ts | 34 palabras: «Son los únicos que se mueven de una forma y capturan de otra, así que presta atención a…» |
| CULPA | u02.l03 explicación 3 | src/content/units/u02.ts:248 | «mal»: revisar si culpa al alumno |
| NOTACION_MEZCLADA | u02.l04 explicación 2 | src/content/units/u02.ts:357 | Cxd5 usa letra española; la app usa la inglesa (Nxd5) |
| NOTACION_MEZCLADA | u03.l02 explicación 1 | src/content/units/u03.ts:134 | Ta8 usa letra española; la app usa la inglesa (Ra8) |
| NOTACION_MEZCLADA | u03.l02 explicación 2 | src/content/units/u03.ts:140 | Ta8 usa letra española; la app usa la inglesa (Ra8) |
| NOTACION_MEZCLADA | u03.l02 explicación 3 | src/content/units/u03.ts:148 | Dg8 usa letra española; la app usa la inglesa (Qg8) |
| FRASE_LARGA | u03.l03 | src/content/units/u03.ts | 48 palabras: «Hay tres jugadas especiales que no se parecen a ninguna otra y que a casi todos los pri…» |
| FRASE_LARGA | u03.l03 explicación 1 | src/content/units/u03.ts:236 | 36 palabras: «El enroque es la única jugada en la que mueves dos piezas a la vez: el rey se desplaza …» |
| FRASE_LARGA | u03.l03 explicación 2 | src/content/units/u03.ts:246 | 34 palabras: «Condiciones del enroque: ni el rey ni la torre se han movido antes; no hay piezas entre…» |
| FRASE_LARGA | u03.l04 explicación 4 | src/content/units/u03.ts:377 | 37 palabras: «La regla de las 50 jugadas: si en 50 jugadas de cada bando (100 medias jugadas en total…» |
| NOTACION_MEZCLADA | u03.l04 evaluación 3 | src/content/units/u03.ts:434 | Dg7 usa letra española; la app usa la inglesa (Qg7) |
| FRASE_LARGA | u04 | src/content/units/u04.ts | 37 palabras: «Aprende a terminar la partida: mate de escalera y del pasillo, mate con dama o torre ap…» |
| FRASE_LARGA | u04.l01 | src/content/units/u04.ts | 47 palabras: «Los dos mates más frecuentes en las partidas de principiantes se dan con torres: la esc…» |
| FRASE_LARGA | u04.l01 explicación 1 | src/content/units/u04.ts:29 | 31 palabras: «Ahora la otra torre da jaque en la fila 8 con Ra8 y el rey no tiene escapatoria: g7 y h…» |
| FRASE_LARGA | u04.l01 práctica 1 | src/content/units/u04.ts:52 | 34 palabras: «Para mate necesitas jaque y que el rey no pueda huir: la torre de a7 ya cubre la fila 7…» |
| FRASE_LARGA | u04.l02 | src/content/units/u04.ts | 35 palabras: «En esta lección verás el patrón básico (rey junto al rey rival y pieza que da jaque a d…» |
| FRASE_LARGA | u04.l02 explicación 2 | src/content/units/u04.ts:141 | 36 palabras: «Fíjate en que el rey rival está en el borde y que los dos reyes están en «oposición» (s…» |
| FRASE_LARGA | u04.l04 explicación 3 | src/content/units/u04.ts:400 | 33 palabras: «Con el rey blanco en d8 y el negro en a8, el rey blanco sube a c7 y lo encierra: el rey…» |
| FRASE_LARGA | u06 | src/content/units/u06.ts | 40 palabras: «Los principios que te hacen jugar bien las primeras jugadas: controla el centro, desarr…» |
| FRASE_LARGA | u06.l02 explicación 3 | src/content/units/u06.ts:181 | 31 palabras: «Para poder hacerlo no deben haberse movido ni el rey ni esa torre, no debe haber piezas…» |
| CULPA | ex.exchange.04 | src/pedagogy/exercises.ts:92 | «mal»: revisar si culpa al alumno |
| CULPA | ex.exchange.04.m (espejo) | src/pedagogy/exercises.ts:92 | «mal»: revisar si culpa al alumno |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l01 práctica 3 | src/content/units/u01.ts:78 | Rh6 (+32.53) pierde 613 cp frente a g4 (+38.66) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l01 práctica 1 | src/content/units/u01.ts:55 | Ra5 (+29.00) pierde 15600 cp frente a Ra7 (#15) |
| ALTERNATIVA_EN_POSICION_GANADA | u01.l01 evaluación 2 | src/content/units/u01.ts:110 | Kd1 (+28.50) frente a la solución Rxc3 (+28.50): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u01.l01 evaluación 2 | src/content/units/u01.ts:110 | Ke2 (+28.50) frente a la solución Rxc3 (+28.50): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u01.l01 evaluación 2 | src/content/units/u01.ts:110 | Kf1 (+28.49) frente a la solución Rxc3 (+28.50): candidata a jugada aceptada |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l01 evaluación 1 | src/content/units/u01.ts:102 | Rb2 (+28.79) pierde 79 cp frente a Rh7 (+29.58) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l01 evaluación 3 | src/content/units/u01.ts:118 | Rd1 (+28.67) pierde 6738 cp frente a Kf2 (+96.05) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l02 práctica 3 | src/content/units/u01.ts:186 | Qg4 (+33.24) pierde 15776 cp frente a Qd6 (#9) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l03 práctica 2 | src/content/units/u01.ts:302 | Kf2 (-30.01) pierde 78 cp frente a Kd2 (-29.23) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l04 práctica 1 | src/content/units/u01.ts:408 | d4 (+0.00) pierde 2880 cp frente a Ke2 (+28.80) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l04 práctica 4 | src/content/units/u01.ts:439 | d5 (+0.00) pierde 2895 cp frente a Kf7 (+28.95) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l04 práctica 3 | src/content/units/u01.ts:431 | a4 (+3.60) pierde 2476 cp frente a Ke2 (+28.36) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u01.l04 evaluación 1 | src/content/units/u01.ts:449 | g3 (+0.00) pierde 2895 cp frente a Kf2 (+28.95) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | u02.l02 práctica 4 | src/content/units/u02.ts:182 | Rc1 (+2.00) pierde 2868 cp frente a Be6 (+30.68) |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l03 evaluación 2 | src/content/units/u02.ts:318 | Qe2+ (+3.80) frente a la solución Qxh5+ (+3.79): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l03 evaluación 2 | src/content/units/u02.ts:318 | Qg6+ (+3.79) frente a la solución Qxh5+ (+3.79): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l03 evaluación 2 | src/content/units/u02.ts:318 | Qg8+ (+3.76) frente a la solución Qxh5+ (+3.79): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 práctica 1 | src/content/units/u02.ts:378 | Kf2 (+30.92) frente a la solución Nxe5 (+30.91): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 práctica 1 (jugada 2) | src/content/units/u02.ts:378 | Kf2 (+28.50) frente a la solución Rxe5+ (+28.50): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 práctica 1 (jugada 2) | src/content/units/u02.ts:378 | Kg2 (+28.50) frente a la solución Rxe5+ (+28.50): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 práctica 1 (jugada 2) | src/content/units/u02.ts:378 | Re2 (+28.50) frente a la solución Rxe5+ (+28.50): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 evaluación 3 | src/content/units/u02.ts:429 | Re1+ (+30.83) frente a la solución Bxc5 (+30.83): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 evaluación 3 (jugada 2) | src/content/units/u02.ts:429 | Kf2 (+28.78) frente a la solución Rxc5 (+28.75): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 evaluación 3 (jugada 2) | src/content/units/u02.ts:429 | Kh2 (+28.78) frente a la solución Rxc5 (+28.75): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 evaluación 3 (jugada 2) | src/content/units/u02.ts:429 | Rc3 (+28.75) frente a la solución Rxc5 (+28.75): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l01 práctica 4 | src/content/units/u03.ts:84 | Ra8+ (+96.05) pierde 9095 cp frente a Ra7 (#13) |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l01 práctica 4 | src/content/units/u03.ts:84 | Ra6 (+96.05) frente a la solución Ra8+ (+96.05): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l01 práctica 4 | src/content/units/u03.ts:84 | Kf2 (+96.05) frente a la solución Ra8+ (+96.05): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l03 práctica 1 | src/content/units/u03.ts:266 | O-O (#6) pierde 400 cp frente a Ra7 (#2) |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l03 práctica 2 | src/content/units/u03.ts:274 | O-O-O (#8) pierde 600 cp frente a Ra2 (#2) |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l03 evaluación 3 | src/content/units/u03.ts:336 | d1=Q+ (#11) pierde 100 cp frente a Kf7 (#10) |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | O-O-O (+12.07) pierde 81 cp frente a h4 (+12.88) |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | h4 (+12.88) frente a la solución O-O-O (+12.07): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | a4 (+12.77) frente a la solución O-O-O (+12.07): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | f4 (+12.62) frente a la solución O-O-O (+12.07): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | g4 (+12.43) frente a la solución O-O-O (+12.07): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u05.l04 práctica 2 | src/content/units/u05.ts:451 | Bb1+ (+31.86) frente a la solución Bxg6+ (+31.97): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u05.l04 práctica 2 | src/content/units/u05.ts:451 | Bc2+ (+31.73) frente a la solución Bxg6+ (+31.97): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u05.l04 práctica 2 | src/content/units/u05.ts:451 | Bf5+ (+31.69) frente a la solución Bxg6+ (+31.97): candidata a jugada aceptada |
| SOLUCION_DIRIGIDA_NO_OPTIMA | ex.exchange.02.m (espejo) | src/pedagogy/exercises.ts:72 | Nxd4 (-30.38) pierde 131 cp frente a Kf7 (-29.07) |
| SOLUCION_EN_POSICION_PERDIDA | ex.exchange.03 | src/pedagogy/exercises.ts:82 | exd5 (-37.56) pierde 271 cp frente a Ra3 (-34.85) |
| SOLUCION_DIRIGIDA_NO_OPTIMA | ex.exchange.02 | src/pedagogy/exercises.ts:72 | Nxd5 (-30.12) pierde 230 cp frente a Na4 (-27.82) |
| SOLUCION_EN_POSICION_PERDIDA | ex.exchange.03.m (espejo) | src/pedagogy/exercises.ts:82 | exd4 (-40.12) pierde 354 cp frente a Ra7 (-36.58) |
| ALTERNATIVA_EN_POSICION_GANADA | ex.fork.03 | src/pedagogy/exercises.ts:122 | Qg2+ (+34.35) frente a la solución Qd5+ (+34.25): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.fork.03.m (espejo) | src/pedagogy/exercises.ts:122 | Qd1+ (+33.74) frente a la solución Qd4+ (+33.55): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.fork.03.m (espejo) | src/pedagogy/exercises.ts:122 | Qg7+ (+33.55) frente a la solución Qd4+ (+33.55): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.fork.03.m (espejo) | src/pedagogy/exercises.ts:122 | Qg4+ (+33.53) frente a la solución Qd4+ (+33.55): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | ex.pin.03 | src/pedagogy/exercises.ts:160 | Qa4 (+3.02) pierde 3275 cp frente a Qd6 (+35.77) |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03 | src/pedagogy/exercises.ts:160 | Qd6 (+35.77) frente a la solución Qa4 (+3.02): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03 | src/pedagogy/exercises.ts:160 | Kf2 (+3.57) frente a la solución Qa4 (+3.02): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03 | src/pedagogy/exercises.ts:160 | Qe2+ (+3.27) frente a la solución Qa4 (+3.02): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03 | src/pedagogy/exercises.ts:160 | Qd5 (+3.17) frente a la solución Qa4 (+3.02): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:160 | Qa5 (+3.03) pierde 3235 cp frente a Ke7 (+35.38) |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:160 | Ke7 (+35.38) frente a la solución Qa5 (+3.03): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:160 | Qd3 (+3.36) frente a la solución Qa5 (+3.03): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:160 | Kf7 (+3.28) frente a la solución Qa5 (+3.03): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | ex.pin.03.m (espejo) | src/pedagogy/exercises.ts:160 | Qd4 (+3.26) frente a la solución Qa5 (+3.03): candidata a jugada aceptada |
