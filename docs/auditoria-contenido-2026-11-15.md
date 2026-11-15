# Auditoría automática de contenido · 2026-11-15

> **Aviso.** Auditor automático: Stockfish 16 NNUE (en táctica, muy por encima de 2500) más reglas de lint. No es un maestro titulado ni valida la pedagogía; sus hallazgos son candidatos que revisa una persona. No presentar este informe como validación humana.

- Alcance: u01-u06 y banco de ejercicios con sus espejos. Las mini lecciones de error (error-lesson) no tienen posiciones fijas: se generan de cada partida y no entran.
- Posiciones con solución: 346; jugadas del alumno analizadas: 419.
- Motor: Stockfish 16 NNUE de un hilo, profundidad 16, MultiPV 4, hash limpio por posición (288 s).
- Umbrales: solución peor que la mejor en más de 60 cp; alternativa a 30 cp o menos de la solución; «sigue ganando» desde +3. Mate en N = 20000 − 100·N cp.

## Resumen

| Tipo | Gravedad | Hallazgos |
|---|---|---|
| SAN_ILEGAL | grave | 1 |
| AFIRMACION_FALSA | importante | 9 |
| ALTERNATIVA_IGUAL_O_MEJOR | importante | 189 |
| MATE_MULTIPLE | importante | 2 |
| SAN_JAQUE_FALSO | importante | 1 |
| ALTERNATIVA_EN_POSICION_GANADA | aviso | 38 |
| CULPA | aviso | 3 |
| FRASE_LARGA | aviso | 25 |
| SOLUCION_DIRIGIDA_NO_OPTIMA | aviso | 13 |
| SOLUCION_EN_POSICION_PERDIDA | aviso | 2 |
| SOLUCION_SUBOPTIMA_GANADORA | aviso | 7 |
| **Total** | | **290** |

## Grave

| Tipo | Dónde | Archivo | Detalle |
|---|---|---|---|
| SAN_ILEGAL | u01.l01 explicación 1 | src/content/units/u01.ts:22 | «Ra5» no es legal en la posición del paso ni en su línea |

## Importante

| Tipo | Dónde | Archivo | Detalle |
|---|---|---|---|
| MATE_MULTIPLE | u03.l04 práctica 1 | src/content/units/u03.ts:383 | 5 mates en 1: Qh1#, Qh2#, Qh3#, Qg7#, Qg8# (solución Qh2#) |
| MATE_MULTIPLE | u04.l04 práctica 4 | src/content/units/u04.ts:445 | 2 mates en 1: Qh2#, Qg4# (solución Qh2#) |
| SAN_JAQUE_FALSO | u11.l01 explicación 1 | src/content/units/u11.ts:31 | el texto da «Nd7+» como jaque y no lo es |
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
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 2 | src/content/units/u03.ts:325 | Kf7 (+0.00) frente a la solución dxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 2 | src/content/units/u03.ts:325 | Ke7 (+0.00) frente a la solución dxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 2 | src/content/units/u03.ts:325 | Kd7 (+0.00) frente a la solución dxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 2 | src/content/units/u03.ts:325 | Kd8 (+0.00) frente a la solución dxe3 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 3 | src/content/units/u03.ts:336 | Kf7 (#10) frente a la solución d1=Q+ (#11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 3 | src/content/units/u03.ts:336 | Kf8 (#11) frente a la solución d1=Q+ (#11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l03 evaluación 3 | src/content/units/u03.ts:336 | Ke7 (#11) frente a la solución d1=Q+ (#11): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 práctica 1 | src/content/units/u03.ts:383 | Qh1# (#1) frente a la solución Qh2# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 práctica 1 | src/content/units/u03.ts:383 | Qh3# (#1) frente a la solución Qh2# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u03.l04 práctica 1 | src/content/units/u03.ts:383 | Qg7# (#1) frente a la solución Qh2# (#1): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u04.l03 práctica 3 | src/content/units/u04.ts:312 | Qf6 (-0.16) frente a la solución Qe7 (+0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u04.l04 práctica 4 (jugada 2) | src/content/units/u04.ts:445 | Qg4# (#1) frente a la solución Qh2# (#1): candidata a jugada aceptada |
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
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 2 | src/content/units/u06.ts:73 | Bc4 (+0.13) frente a la solución d4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 2 | src/content/units/u06.ts:73 | Nc3 (+0.11) frente a la solución d4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 2 | src/content/units/u06.ts:73 | Bb5 (+0.08) frente a la solución d4 (+0.04): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 3 | src/content/units/u06.ts:86 | c5 (-0.22) frente a la solución e5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 3 | src/content/units/u06.ts:86 | e6 (-0.22) frente a la solución e5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 práctica 3 | src/content/units/u06.ts:86 | Nc6 (-0.36) frente a la solución e5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 evaluación 1 | src/content/units/u06.ts:116 | Nf6 (-0.08) frente a la solución d5 (-0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 evaluación 1 | src/content/units/u06.ts:116 | e6 (-0.08) frente a la solución d5 (-0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l01 evaluación 1 | src/content/units/u06.ts:116 | c6 (-0.31) frente a la solución d5 (-0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 2 | src/content/units/u06.ts:205 | c3 (+0.13) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 2 | src/content/units/u06.ts:205 | h3 (+0.13) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 2 | src/content/units/u06.ts:205 | Nc3 (+0.07) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 1 | src/content/units/u06.ts:190 | Nc3 (+0.11) frente a la solución Bc4 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 1 | src/content/units/u06.ts:190 | Bb5 (+0.08) frente a la solución Bc4 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 1 | src/content/units/u06.ts:190 | d4 (+0.04) frente a la solución Bc4 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 4 | src/content/units/u06.ts:231 | Bc5 (-0.13) frente a la solución Nf6 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 4 | src/content/units/u06.ts:231 | Be7 (-0.17) frente a la solución Nf6 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 práctica 4 | src/content/units/u06.ts:231 | d6 (-0.22) frente a la solución Nf6 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 1 | src/content/units/u06.ts:247 | d4 (+0.22) frente a la solución Nf3 (+0.22): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 1 | src/content/units/u06.ts:247 | Bc4 (+0.04) frente a la solución Nf3 (+0.22): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 1 | src/content/units/u06.ts:247 | Nc3 (+0.00) frente a la solución Nf3 (+0.22): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 2 | src/content/units/u06.ts:260 | Na4 (+0.08) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 2 | src/content/units/u06.ts:260 | a3 (+0.06) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 2 | src/content/units/u06.ts:260 | Nd5 (+0.04) frente a la solución O-O (+0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 3 | src/content/units/u06.ts:273 | d6 (-0.27) frente a la solución Nc6 (-0.31): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 3 | src/content/units/u06.ts:273 | Nf6 (-0.43) frente a la solución Nc6 (-0.31): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l02 evaluación 3 | src/content/units/u06.ts:273 | d5 (-0.52) frente a la solución Nc6 (-0.31): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 2 | src/content/units/u06.ts:332 | d3 (+0.17) frente a la solución c3 (+0.25): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 2 | src/content/units/u06.ts:332 | O-O (+0.17) frente a la solución c3 (+0.25): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 2 | src/content/units/u06.ts:332 | h3 (+0.08) frente a la solución c3 (+0.25): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 1 | src/content/units/u06.ts:318 | Qe7 (+0.08) frente a la solución Nc6 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 1 | src/content/units/u06.ts:318 | d6 (-0.04) frente a la solución Nc6 (+0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 3 | src/content/units/u06.ts:346 | Nf6 (-0.13) frente a la solución Bc5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 3 | src/content/units/u06.ts:346 | Be7 (-0.17) frente a la solución Bc5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 práctica 3 | src/content/units/u06.ts:346 | d6 (-0.22) frente a la solución Bc5 (-0.13): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 1 | src/content/units/u06.ts:362 | a6 (-0.17) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 1 | src/content/units/u06.ts:362 | Be7 (-0.22) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 1 | src/content/units/u06.ts:362 | Bd6 (-0.27) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 2 | src/content/units/u06.ts:375 | d3 (+0.13) frente a la solución Nc3 (+0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 2 | src/content/units/u06.ts:375 | d4 (+0.00) frente a la solución Nc3 (+0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 2 | src/content/units/u06.ts:375 | Qe2 (+0.00) frente a la solución Nc3 (+0.08): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 3 | src/content/units/u06.ts:388 | d6 (-0.40) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u06.l03 evaluación 3 | src/content/units/u06.ts:388 | Bb6 (-0.40) frente a la solución Nf6 (-0.17): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 práctica 1 | src/content/units/u07.ts:155 | Nc3 (-0.14) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 práctica 1 | src/content/units/u07.ts:155 | Ke2 (-0.14) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 práctica 1 | src/content/units/u07.ts:155 | Kf2 (-0.14) frente a la solución Nc7+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 evaluación 2 | src/content/units/u07.ts:203 | Kd3 (+0.00) frente a la solución f5+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 evaluación 2 | src/content/units/u07.ts:203 | Ke3 (+0.00) frente a la solución f5+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 evaluación 2 | src/content/units/u07.ts:203 | Kf3 (+0.00) frente a la solución f5+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 evaluación 3 | src/content/units/u07.ts:213 | Kd7 (-0.12) frente a la solución Nf2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 evaluación 3 | src/content/units/u07.ts:213 | Ke7 (-0.12) frente a la solución Nf2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l02 evaluación 3 | src/content/units/u07.ts:213 | Nf6 (-0.12) frente a la solución Nf2+ (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 práctica 1 | src/content/units/u07.ts:257 | Kd2 (+0.00) frente a la solución d5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 práctica 1 | src/content/units/u07.ts:257 | Ke2 (+0.00) frente a la solución d5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 práctica 1 | src/content/units/u07.ts:257 | Kd1 (+0.00) frente a la solución d5 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 práctica 3 | src/content/units/u07.ts:283 | Kd7 (+0.00) frente a la solución d4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 práctica 3 | src/content/units/u07.ts:283 | Ke7 (+0.00) frente a la solución d4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 práctica 3 | src/content/units/u07.ts:283 | Kd8 (+0.00) frente a la solución d4 (+0.00): candidata a jugada aceptada |
| AFIRMACION_FALSA | u07.l03 práctica 3 | src/content/units/u07.ts:283 | dice que gana material y tras la línea del motor (d5d4 e1e2 b4c3 b2c3) el material no sube |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 evaluación 3 | src/content/units/u07.ts:318 | Kg7 (+0.00) frente a la solución f4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 evaluación 3 | src/content/units/u07.ts:318 | Kf7 (+0.00) frente a la solución f4 (+0.00): candidata a jugada aceptada |
| ALTERNATIVA_IGUAL_O_MEJOR | u07.l03 evaluación 3 | src/content/units/u07.ts:318 | Kf8 (+0.00) frente a la solución f4 (+0.00): candidata a jugada aceptada |
| AFIRMACION_FALSA | u11.l01 práctica 1 | src/content/units/u11.ts:51 | dice que gana material y tras la línea del motor (f1f8 g8f8 e5d7 f8f7) el material no sube |
| AFIRMACION_FALSA | u11.l01 práctica 2 | src/content/units/u11.ts:64 | dice que gana material y tras la línea del motor (f8f1 g1f1 e4d2 f1f2) el material no sube |
| AFIRMACION_FALSA | u11.l01 evaluación 2 | src/content/units/u11.ts:102 | dice que gana material y tras la línea del motor (f1f8 g8f8 g5e6 f8e7) el material no sube |
| AFIRMACION_FALSA | u11.l01 evaluación 3 | src/content/units/u11.ts:115 | dice que gana material y tras la línea del motor (d8d1 b3d1 g4f2 h1g1) el material no sube |
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
| AFIRMACION_FALSA | ex.attraction.01 | src/pedagogy/exercises.ts:379 | dice que gana material y tras la línea del motor (c1c8 b8c8 d5e7 c8c7) el material no sube |
| AFIRMACION_FALSA | ex.attraction.01.m (espejo) | src/pedagogy/exercises.ts:379 | dice que gana material y tras la línea del motor (c8c1 b1c1 d4e2 c1c2) el material no sube |
| AFIRMACION_FALSA | ex.attraction.04 | src/pedagogy/exercises.ts:406 | dice que gana material y tras la línea del motor (c1c8 b8c8 b5d6 c8d7) el material no sube |
| AFIRMACION_FALSA | ex.attraction.04.m (espejo) | src/pedagogy/exercises.ts:406 | dice que gana material y tras la línea del motor (c8c1 b1c1 b4d3 c1d2) el material no sube |

## Aviso

| Tipo | Dónde | Archivo | Detalle |
|---|---|---|---|
| FRASE_LARGA | u01.l01 | src/content/units/u01.ts | 33 palabras: «Primero aprenderás a «leer» el tablero, como un mapa con direcciones, y después conocer…» |
| FRASE_LARGA | u01.l01 explicación 1 | src/content/units/u01.ts:22 | 34 palabras: «Cada casilla es una letra más un número: la de abajo a la izquierda es a1, la de arriba…» |
| FRASE_LARGA | u01.l01 explicación 1 | src/content/units/u01.ts:22 | 34 palabras: «Las jugadas se escriben como en Lichess: la letra en inglés de la pieza (R torre, B alf…» |
| FRASE_LARGA | u01.l01 explicación 2 | src/content/units/u01.ts:27 | 32 palabras: «La torre (la pieza con forma de castillo) se mueve en línea recta: hacia delante, hacia…» |
| FRASE_LARGA | u01.l02 explicación 3 | src/content/units/u01.ts:151 | 32 palabras: «La dama (o reina) es la pieza más poderosa: se mueve como una torre y como un alfil a l…» |
| FRASE_LARGA | u01.l04 | src/content/units/u01.ts | 34 palabras: «Son los únicos que se mueven de una forma y capturan de otra, así que presta atención a…» |
| CULPA | u02.l03 explicación 3 | src/content/units/u02.ts:248 | «mal»: revisar si culpa al alumno |
| FRASE_LARGA | u03.l02 evaluación 3 | src/content/units/u03.ts:218 | 42 palabras: «Es el «mate de la coz» (también llamado mate ahogado, aunque no tiene nada que ver con …» |
| FRASE_LARGA | u03.l03 | src/content/units/u03.ts | 48 palabras: «Hay tres jugadas especiales que no se parecen a ninguna otra y que a casi todos los pri…» |
| FRASE_LARGA | u03.l03 explicación 1 | src/content/units/u03.ts:236 | 36 palabras: «El enroque es la única jugada en la que mueves dos piezas a la vez: el rey se desplaza …» |
| FRASE_LARGA | u03.l03 explicación 2 | src/content/units/u03.ts:246 | 34 palabras: «Condiciones del enroque: ni el rey ni la torre se han movido antes; no hay piezas entre…» |
| FRASE_LARGA | u03.l04 explicación 4 | src/content/units/u03.ts:377 | 37 palabras: «La regla de las 50 jugadas: si en 50 jugadas de cada bando (100 medias jugadas en total…» |
| FRASE_LARGA | u04 | src/content/units/u04.ts | 37 palabras: «Aprende a terminar la partida: mate de escalera y del pasillo, mate con dama o torre ap…» |
| FRASE_LARGA | u04.l01 | src/content/units/u04.ts | 47 palabras: «Los dos mates más frecuentes en las partidas de principiantes se dan con torres: la esc…» |
| FRASE_LARGA | u04.l01 explicación 1 | src/content/units/u04.ts:29 | 38 palabras: «Ahora la otra torre da jaque en la fila 8 con Ra8# (en notación, + indica jaque y # ind…» |
| FRASE_LARGA | u04.l01 práctica 1 | src/content/units/u04.ts:52 | 34 palabras: «Para mate necesitas jaque y que el rey no pueda huir: la torre de a7 ya cubre la fila 7…» |
| FRASE_LARGA | u04.l02 | src/content/units/u04.ts | 35 palabras: «En esta lección verás el patrón básico (rey junto al rey rival y pieza que da jaque a d…» |
| FRASE_LARGA | u04.l03 práctica 2 | src/content/units/u04.ts:299 | 37 palabras: «El alfil de c4 protege la dama, el rey no puede capturarla ni escapar (e7 la cubre la d…» |
| FRASE_LARGA | u04.l04 explicación 3 | src/content/units/u04.ts:401 | 33 palabras: «Con el rey blanco en d8 y el negro en a8, el rey blanco sube a c7 y lo encierra: el rey…» |
| FRASE_LARGA | u06 | src/content/units/u06.ts | 40 palabras: «Los principios que te hacen jugar bien las primeras jugadas: controla el centro, desarr…» |
| FRASE_LARGA | u06.l02 explicación 3 | src/content/units/u06.ts:183 | 31 palabras: «Para poder hacerlo no deben haberse movido ni el rey ni esa torre, no debe haber piezas…» |
| FRASE_LARGA | u07.l02 | src/content/units/u07.ts | 37 palabras: «En este nivel aprenderás a buscarla de forma ordenada: mira dónde están el rey, la dama…» |
| FRASE_LARGA | u10 | src/content/units/u10.ts | 39 palabras: «Tres ideas tácticas nuevas: la enfilada, que ataca una pieza valiosa para ganar la que …» |
| FRASE_LARGA | u10.l01 | src/content/units/u10.ts | 34 palabras: «En la enfilada, la de delante vale más (muchas veces es el rey): está obligada a aparta…» |
| FRASE_LARGA | u11 | src/content/units/u11.ts | 34 palabras: «Combinaciones de varias jugadas: atraer al rey o a una pieza a una casilla mala con un …» |
| FRASE_LARGA | u11.l01 | src/content/units/u11.ts | 31 palabras: «La pieza que captura queda en una casilla mala: el rey en el radio de una horquilla de …» |
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
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 evaluación 3 (jugada 2) | src/content/units/u02.ts:429 | Kf2 (+28.78) frente a la solución Rxc5 (+28.75): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 evaluación 3 (jugada 2) | src/content/units/u02.ts:429 | Kh2 (+28.78) frente a la solución Rxc5 (+28.75): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 evaluación 3 (jugada 2) | src/content/units/u02.ts:429 | Rc3 (+28.75) frente a la solución Rxc5 (+28.75): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u02.l04 evaluación 3 | src/content/units/u02.ts:429 | Re1+ (+30.83) frente a la solución Bxc5 (+30.83): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l01 práctica 4 | src/content/units/u03.ts:84 | Ra8+ (+96.05) pierde 9095 cp frente a Ra7 (#13) |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l01 práctica 4 | src/content/units/u03.ts:84 | Ra6 (+96.05) frente a la solución Ra8+ (+96.05): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l01 práctica 4 | src/content/units/u03.ts:84 | Kf2 (+96.05) frente a la solución Ra8+ (+96.05): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l03 práctica 1 | src/content/units/u03.ts:266 | O-O (#6) pierde 400 cp frente a Ra7 (#2) |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l03 práctica 2 | src/content/units/u03.ts:274 | O-O-O (#8) pierde 600 cp frente a Ra2 (#2) |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | O-O-O (+12.07) pierde 81 cp frente a h4 (+12.88) |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | h4 (+12.88) frente a la solución O-O-O (+12.07): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | a4 (+12.77) frente a la solución O-O-O (+12.07): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | f4 (+12.62) frente a la solución O-O-O (+12.07): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u03.l03 evaluación 1 | src/content/units/u03.ts:317 | g4 (+12.43) frente a la solución O-O-O (+12.07): candidata a jugada aceptada |
| SOLUCION_SUBOPTIMA_GANADORA | u03.l03 evaluación 3 | src/content/units/u03.ts:336 | d1=Q+ (#11) pierde 100 cp frente a Kf7 (#10) |
| ALTERNATIVA_EN_POSICION_GANADA | u05.l04 práctica 2 | src/content/units/u05.ts:451 | Bb1+ (+31.86) frente a la solución Bxg6+ (+31.97): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u05.l04 práctica 2 | src/content/units/u05.ts:451 | Bc2+ (+31.73) frente a la solución Bxg6+ (+31.97): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u05.l04 práctica 2 | src/content/units/u05.ts:451 | Bf5+ (+31.69) frente a la solución Bxg6+ (+31.97): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u07.l01 práctica 1 | src/content/units/u07.ts:51 | Qh5+ (+34.79) frente a la solución Qa4+ (+34.79): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u07.l01 evaluación 1 | src/content/units/u07.ts:89 | Qd8+ (+33.93) frente a la solución Qd6+ (+34.09): candidata a jugada aceptada |
| ALTERNATIVA_EN_POSICION_GANADA | u10.l01 práctica 3 | src/content/units/u10.ts:70 | Qa8+ (+3.52) frente a la solución Qc8+ (+3.64): candidata a jugada aceptada |
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

## Revisión de los hallazgos (a mano, 2026-11-15)

- **SAN_ILEGAL u01.l01 (grave):** falso positivo. «Ra5» es un ejemplo de cómo se escribe una jugada, no una jugada propuesta sobre la posición inicial.
- **SAN_JAQUE_FALSO u11.l01:** falso positivo. El texto dice que Nd7+ será jaque después de Rf8+ Kxf8, no en la posición inicial.
- **AFIRMACION_FALSA (9):** falsos positivos de método. El auditor mide el material al final de la línea del motor, que se corta a 4 jugadas, y en las combinaciones con sacrificio (atracción en u11, ex.attraction, y la clavada de u07.l03 p3) la ganancia llega después. La verificación específica de u10/u11 y del banco (`scripts/verify-fase4.mts`) sí mide la evaluación tras la combinación (al menos +1,5 en las líneas sin mate) y cuenta el material a más jugadas. Pendiente: que el auditor use esa misma medida.
- **ALTERNATIVA_IGUAL_O_MEJOR (189):** candidatas a `alt`, no errores. Solo importan donde el texto afirma que la jugada es la única; se revisan por unidad cuando un profesor lo pida.
- No se encontró ninguna solución incorrecta ni ningún texto que contradiga la posición, más allá de lo ya corregido.
