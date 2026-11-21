# Auditoría plena 02: diseño visual, UI y accesibilidad

Fecha: 2026-11-15. Rama de trabajo: worktree `agent-ac19584e027eb503d`, sobre `de74847`.

## Resumen

1. Recorridas todas las pantallas (portada, entrada, nivel, mapa, lección, entrenar hoy, repaso de partidas, visor, informe, tienda, perfil, privacidad, créditos) en 320x640, 360x640, 375x667, 390x844, 667x375, 768x1024, 1280x800 y 1920x1080 con datos simulados (`?mock=1`).
2. Medición automática en el navegador (scrollWidth, getBoundingClientRect, getComputedStyle, contraste WCAG calculado con la composición real de fondos): 0 desbordes, 0 objetivos táctiles de menos de 44 px, 0 textos bajo 4,5:1 (3:1 en texto grande), 0 controles sin nombre, 0 ids duplicados, 0 referencias ARIA rotas en todos los viewports.
3. Foco visible medido en todos los controles de la tienda (anillo de 3 px, 28 controles, 0 fallos).
4. Los 16 tableros por los 13 juegos de piezas: cálculo de camuflaje de cada pieza sobre cada casilla y revisión visual de los 8 peores casos (casillas, selección, última jugada y destinos legibles). Sin cambios necesarios.
5. Hallazgos reales encontrados y arreglados: 9 (1 Crítico, 5 Importante, 3 Menor). Todos con commit.
6. El mayor hueco era de accesibilidad de teclado: Entrenar hoy y el repaso de partidas no tenían alternativa escrita al tablero (WCAG 2.1.1). Arreglado con un componente común.
7. Tests: `tsc` limpio, `vitest run --exclude ".claude/**"` 1374 de 1374 en verde, `npm run build` en verde.
8. No verificado: dedo real, Safari/iOS, lectores de pantalla reales, forced-colors y prefers-contrast reales (ver el final).

## Hallazgos

Medidas tomadas en Chromium del panel integrado. Los viewports son los de `resize_window`.

| # | Pantalla | Viewport | Severidad | Evidencia medida | Estado | Commit |
|---|----------|----------|-----------|------------------|--------|--------|
| 1 | Entrenar hoy, repaso de partidas (mini lección, pasos «mejor jugada» y «elige casilla») | todos | Crítico | `grep` de `typed`/`<input` en `SessionScreen.tsx` y `ErrorLessonPlayer.tsx`: 0. Chessground no es operable con teclado y solo la lección (`PracticeBoard`) ofrecía jugada escrita | Arreglado: `TypedMove` y `TypedSquare` comunes; en Entrenar hoy va en un hueco fuera de `.ss-play`, medido: tablero 336 px y caja de juego sin cambios (bottom 631 de 667), disclosure en y=647. Probado: escribir `Ra8#` da «Bien visto» | d877c1d |
| 2 | Todas (SPA) | todos | Importante | `document.title` idéntico en todas las rutas («Chedex Pulse · Aprende ajedrez») | Arreglado: `titleFor(path)` en `router.ts` con test; medido «Tienda · Chedex Pulse», «Lección · Chedex Pulse», etc. | c56248d |
| 3 | Lección y Entrenar hoy | 320, 375 | Importante | Ninguna pestaña de navegación activa en `/leccion/*` y `/entrenar` (consulta de `.nav-link.active`: vacía) | Arreglado: «Aprender» activo (`aria-current="page"`); medido `Aprender*` | c56248d |
| 4 | Lección, Entrenar hoy, barra lateral | todos | Menor | Tres botones «Salir» con el mismo nombre accesible y efectos distintos (salir de la lección, del repaso, cerrar sesión) | Arreglado: `aria-label` «Salir de la lección/del repaso/de tu cuenta» (el texto visible «Salir» sigue dentro del nombre) | c56248d |
| 5 | Cualquier pantalla con sesión | 667x375 | Importante | Cabecera fija (67 px) y barra inferior fija (64 px) = 131 px de 375 (35 %); el tablero de la mini lección empezaba en y=237 con la barra inferior en y=311 | Arreglado: cabecera estática y barra inferior de una fila; medido barra inferior 51 px, cabecera `position: static` | 38febcd |
| 6 | Visor de la partida | 320, 667 | Importante | Pantalla sin ningún encabezado (`h` = vacío) | Arreglado: `h1` oculto con `aria-labelledby` | d38319b |
| 7 | Mini lección del repaso | todos | Menor | Orden de encabezados h1 → h3 (salto) | Arreglado a h2 (misma clase `.rl-title`, sin cambio visual) | d877c1d |
| 8 | Portada (ventana de ejemplo, retirada después) | 375 con espaciado WCAG 1.4.12 y fuente 125 % | Importante | `p.win-title` scrollWidth 231 / clientWidth 188, texto recortado con puntos suspensivos | Arreglado: el título se parte en dos líneas; medido 0 recortes con el espaciado forzado | cb6348d |
| 9 | Portada, aviso de carga de sesión | 375 | Menor | `.loading` con left = 0 (pegado al borde), sin los 16 px de margen | Arreglado: ancho `100% - 2 x 16 px`; medido left 16, width 343 | 7abe142 |
| 10 | Cabecera pública durante la carga de sesión | todos | Menor | Se veía el botón «Entrar con Lichess» a quien ya tiene sesión, durante la comprobación | Arreglado: sin botones en la cabecera mientras `loading` | (último commit, ver abajo) |
| 11 | Todas en modo alto contraste de Windows | n/a | Importante | Código: botones, fichas y pestañas sin borde (`border: 0`, solo sombras) y estados solo por fondo; no existía ni `forced-colors` ni `prefers-contrast` (`grep`: 0) | Arreglado sin poder medirlo en esta herramienta: `web/src/a11y.css` | 2cf4d8f |
| 12 | Tienda (13 juegos de piezas x 16 tableros) | 320 a 1920 | Info | Camuflaje calculado del relleno de cada pieza por casilla (peores: `plano` blanca sobre brasa/samurái/catedral/vikingo, `plano` negra sobre sombras): 99-100 % de relleno semejante a la casilla; la CSS de `shop.css` añade contorno. Revisadas a 300 px las 8 combinaciones peores: legibles, casillas, destinos, selección y última jugada visibles | Sin cambios necesarios | n/a |

Nota sobre el id 10: su commit es el que cierra esta tanda (`Cabecera pública sin botones de acceso mientras se comprueba la sesión`).

## Datos de contraste y tamaño (muestras medidas)

- Texto de lectura `#f5f5f2` y secundario `#b9bbc0` sobre `#191a1e`/`#0b0c0e`: por encima de 7:1 y de 8:1 respectivamente (tests ya existentes en `test/web/theme.test.ts` y `contrast.data.ts` siguen en verde).
- Foco: anillo `#ffb27a` de 3 px, desplazado 3 px; sobre `#0b0c0e` más de 10:1.
- Objetivos táctiles: mínimo medido 44 px (botones pequeños `t-btn-sm`), 48 px los demás; 0 por debajo en las 14 rutas.
- Rejilla de tienda a 320 px: tarjetas de piezas de 328 px de ancho en una columna, tableros en dos columnas de 158 px; todas con botón «Comprar» de 44 px. Las piezas y tableros de la tienda son fondos CSS (no `<img>`), así que no aplican `loading="lazy"` ni ancho/alto; el conjunto pesa unos 1,2 MB repartido en 13 carpetas.

## Lo que no se arregló y por qué

- ~~Lección a 320x640 con la parte de arriba del tablero oculta bajo la cabecera fija al pulsar «Siguiente»~~ **Arreglado** (ver «Arreglos posteriores»).
- ~~Nombre de usuario recortado con puntos suspensivos en la cabecera móvil~~ **Arreglado** (ver «Arreglos posteriores»).
- **Coordenadas del tablero dentro de las casillas** (Menor): se montan sobre piezas de la columna h y la fila 1 en tableros de menos de 260 px. Es el estilo habitual de Lichess; propuesta: ocultarlas bajo 260 px.
- **Etiqueta de movimiento del visor** (Menor): los botones de jugada leen solo «Nc3», sin número ni color. Propuesta: `aria-label` con «jugada 2, blancas, Nc3».
- La barra «Modo simulado» de `?mock=1` no es de producción.

## Cómo se midió y qué quedó fuera del repositorio

- Servidor Vite propio en el puerto 5291 desde este worktree; `node_modules` enlazado con una unión (junction) a la del repositorio principal (ignorada por git).
- Se amplió `web/src/dev/mock.ts` con `/session/status`, `/session`, `/session/answer` y `/session/finish` (`?due=0` para el estado vacío); la pantalla Entrenar hoy devolvía «Ruta no encontrada» en simulado.
- Para el repaso, informe y visor se interceptó `fetch` de Lichess en la página con `test/fixtures/lichess-games.ndjson` y se analizaron 3 partidas con el motor real (profundidad 12). Nada de eso queda en el repositorio.
- Archivos temporales (`web/public/__audit.js`) y `.claude/launch.json` revertidos; servidor parado y pestañas cerradas.
- El panel de navegación es compartido con otros agentes: dos veces mi pestaña fue llevada a otro servidor (puerto 5391), por lo que se repitió el arranque del estado simulado.

## No verificado

- **Dedo real**: tamaños medidos con el rectángulo, no con pulgar; no se probó el tiro de la cabecera en iOS ni la sensación del botón inferior apaisado.
- **Safari/iOS y Firefox**: solo Chromium. Riesgos concretos: `container-type`, subgrid y `:has()` de Entrenar hoy, `100svh`.
- **Lectores de pantalla reales** (NVDA, VoiceOver, TalkBack): solo se revisó la estructura (landmarks, encabezados, nombres, ARIA, `aria-live`).
- **forced-colors y prefers-contrast**: no hay emulación en esta herramienta; el bloque de `a11y.css` es de revisión de código. Probar en Windows con un tema de alto contraste.
- **prefers-reduced-motion**: se leyeron las reglas (motion.css es de otro agente) pero no se forzó el modo.
- **prefers-color-scheme**: no aplica, la app es siempre oscura (un test existente impide añadirlo).
- El estado de una partida con errores graves se vio en 667x375 y 320x640, pero el resto de pasos de la mini lección (pausa, mejor jugada) solo se midió en el paso 1.

## Arreglos posteriores (2026-11-15): tablero bajo la cabecera y nombre de usuario

**Tablero tapado tras «Siguiente»** (Menor). Causa medida, no supuesta: `autoFocus` de React llama a `focus()` sin `preventScroll`, así que el navegador desplazaba la página hasta el botón (debajo del tablero) y la parte alta del tablero quedaba bajo la cabecera fija; además la página conservaba el desplazamiento entre pasos y no había `scroll-padding` que descontara la cabecera ni la barra inferior. Arreglo estructural: (1) `web/src/headerHeight.ts` publica la altura real de la cabecera en `--header-h` (solo si es fija y a todo el ancho; 0 si es estática o la barra lateral de escritorio; se actualiza con `ResizeObserver` y las mismas media queries de `styles.css`); (2) `html { scroll-padding-top: var(--header-h); scroll-padding-bottom: var(--bottom-nav) }` y `.lesson-body { scroll-margin-top }`; (3) los botones con `autoFocus` de `LessonPlayer` pasan a foco con `preventScroll`; (4) tras cambiar de paso, si el inicio del paso no está entre la cabecera y la barra inferior se hace `scrollIntoView({ block: 'start' })`, y si ya lo está no se mueve nada. `.rl-panel` del repaso usaba un 60 px fijo y ahora usa `--header-h`.

Medición (navegador integrado, `?mock=1`, u10.l01 completa: explicación, práctica, evaluación y resultado; borde superior del tablero frente a cabecera y barra inferior):

| Viewport | Antes | Después |
|---|---|---|
| 320x640 | Al empezar la explicación: página desplazada 464 px, tablero en y = -189 (entero bajo la cabecera de 67 px); en la práctica 1: y = -38 | Tablero entre 146 y 434 en todos los pasos (9 de 9), cabecera 67 px, barra inferior en 576; 0 pasos tapados |
| 360x640, 375x667 | no medido antes | 9 de 9 sin tapar (tablero mínimo en y = 146; barra inferior en 576 y 603) |
| 667x375 | cabecera estática | 9 de 9 con el borde superior del tablero en y = 12; el tablero (560 px) es más alto que los 323 px visibles: se ve su parte alta y se baja con el dedo |
| 1280x800 | n/a | tablero 186 a 763, sin tapar |

**Nombre de usuario** (Menor). Antes: por debajo de 480 px el nombre estaba oculto del todo (solo lectores de pantalla) y de 480 a 899 px tenía un tope fijo de 6,5 rem. Ahora el nombre ocupa el hueco libre entre el logo y el saldo (`.side-user` pasa a `display: contents` en móvil, `.whoami` con `flex: 1 1 0` y mínimo de 4 rem), el logo basta por debajo de 480 px (el enlace conserva su `aria-label`) y el `title` lleva el nombre completo. Si no cabe se abrevia con puntos suspensivos; el nombre completo se lee en el `title`, en el lector de pantalla y en el `h1` de Perfil. Medido con un nombre de 20 caracteres (162 px de texto): 320 px, 76 px visibles (unos 8 caracteres, abreviado); 375 px, 131 px (unos 16); 600 px, completo. Sin solapes con el saldo ni «Salir», sin desbordes de página, cabecera de 67 px en todos. **Límite:** a 320 px no caben 20 caracteres junto al saldo, el sonido y «Salir»; se abrevia a propósito.

## Arreglo posterior (2026-11-21): maquetación horizontal real en móvil apaisado

**Problema** (Mayor). En 667x375, 640x360, 568x320, 812x375 y 896x414 el tablero de la lección medía 510 a 531 px (298 con 812 y 896) y empezaba en y = 230: con 323 px útiles solo se veía su parte alta (en 812 y 896 el borde inferior caía en 526, tapado por la barra inferior en 324). El tablero del repaso y del visor empezaba en y = 170 a 207 detrás del título y los momentos. Entrenar hoy ya tenía su maquetación horizontal (no se tocó).

**Arreglo** (solo CSS, sin cambiar contenido ni orden del DOM; en vertical y escritorio no cambia nada):
- `styles.css`: `--land-board` = alto de pantalla menos 83 px (cabecera estática de 67 + 8 + 8 de `.main`) menos `--bottom-nav`, con `dvh` bajo `@supports` y `vh` de reserva; `.main` baja su relleno en lección, repaso y visor.
- Lección (`.lesson`): rejilla con el tablero cuadrado a la izquierda y cabecera, fases, texto y botones a la derecha; `.lesson-body` y `.step-layout` son subcuadrículas (`subgrid`), sin `display: contents`. Fases compactas (solo se lee la actual). Introducción en dos columnas y resultado con el icono a la izquierda.
- Repaso (`review-lesson.css`) y visor (`review-viewer.css`): misma idea (`.rg > .rg` y `.gv` como rejilla; `.rl`, `.rl-layout` y `.gv-main` como subcuadrículas). Una subcuadrícula no puede ser contenedor, así que en horizontal se repiten las reglas de `@container` de `.rl` (título solo para lectores, momentos compactos, botones en fila).
- Si el texto es más largo que el tablero, la página se desplaza y el tablero queda fijo (`sticky`, top 8 px); los botones de la lección y del repaso quedan fijos sobre la barra inferior (`bottom: --bottom-nav + 8px`). Se descartó una columna con desplazamiento propio: a 320 px de alto dejaba una sola línea de texto visible.

**Medición** (navegador integrado, `?mock=1`, u10.l01 resuelta con el flujo real; un iframe por tamaño, con el CSS de antes y el de ahora; lado del tablero en px y borde inferior, frente al borde superior de la barra inferior):

| Viewport (barra inferior en) | Lección, antes | Después | Repaso, antes | Después | Visor, antes | Después |
|---|---|---|---|---|---|---|
| 667x375 (324) | 530, bajo 762 | 229, bajo 309 | 214, bajo 421 | 229, bajo 309 | 214, bajo 384 | 213, bajo 303 |
| 640x360 (309) | 531, bajo 762 | 214, bajo 294 | 200, bajo 406 | 214, bajo 294 | 200, bajo 369 | 199, bajo 288 |
| 568x320 (269) | 510, bajo 740 | 176, bajo 255 | 190, bajo 396 | 176, bajo 255 | 190, bajo 360 | 161, bajo 249 |
| 812x375 (324) | 298, bajo 526 | 229, bajo 309 | 214, bajo 421 | 229, bajo 309 | 214, bajo 384 | 213, bajo 303 |
| 896x414 (364) | 296, bajo 525 | 266, bajo 348 | 252, bajo 459 | 266, bajo 348 | 487, bajo 670 | 251, bajo 341 |

Práctica y evaluación dan las mismas cifras que la explicación. Entrenar hoy no cambia: 229, 214, 176, 229 y 266 (bajo 309, 294, 255, 309 y 348). Altura de la página con 667x375, antes a después: lección 1153 a 535 (explicación), 1120 a 453 (práctica), 1038 a 375 (evaluación, sin desplazar), 698 a 530 (introducción), 634 a 390 (resultado); repaso 573 a 482; visor 519 a 452. El resto es texto largo o los botones secundarios de debajo, que se alcanzan desplazando.

Sin cambios en 320x640 (tablero 274, página 1058 en la explicación), 375x667 (327, 1084), 768x1024 (402, 1024) y 1280x800 (558, 800): idénticos antes y después en lección, práctica, introducción, sesión, repaso y visor. Objetivos táctiles: 0 por debajo de 44 px entre botones y enlaces de `main` en los tamaños medidos; sin desbordes horizontales.

**Límites**
- A 568x320 el lado del tablero es 176 px: la cabecera estática de 67 px y la barra inferior de 52 px dejan 185. Sale de la cuenta de alto, no de la maquetación.
- A 667x375 el texto junto al tablero es corto (la explicación mide 311 px y caben unos 150): se lee desplazando la página.
- Orden de tabulación = orden del DOM (Salir, tablero, texto, botones); visualmente el tablero queda a la izquierda de «Salir». `scroll-padding-bottom` ya descuenta la barra inferior al enfocar; los botones fijos van antes en el DOM que lo que tapan.
- La alternativa escrita de Entrenar hoy (`.ss-typed`) queda debajo del tablero y añade unos 60 px de desplazamiento; no se reubicó.
- Solo Chromium (panel integrado, iframes). No medido: resumen de Entrenar hoy (necesita jugadas verificadas por el servidor), móvil real, Safari/iOS (subgrid, `:has()`, `dvh`, `position: sticky` con la barra del navegador).
