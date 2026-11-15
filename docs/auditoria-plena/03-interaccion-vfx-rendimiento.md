# Auditoría plena 03: interacción, VFX, sonido, rendimiento y flujos de UX (2026-11-15)

## Resumen

1. Hallazgo mayor: el JS público incluía las 12 unidades completas (ejercicios y soluciones, también las de pago) por `lessonsForConcept` y el mock. Arreglado: el índice concepto-lección se genera al compilar y el mock solo existe en desarrollo.
2. Carga inicial: JS de la portada de 724 KB a 345 KB decodificados (741 KB / 216 KB gzip a 266 KB / 82 KB gzip el fragmento principal); las pantallas privadas van en fragmentos propios.
3. CLS de la portada de 0,92 a 0,02 (el pie de página aparecía y se desplazaba al terminar de cargar la sesión) y fuente precargada.
4. Sonido: una descarga por sonido (antes 3 peticiones del mismo mp3), acierto y victoria bajo demanda (audio de la portada de 148 KB a 61 KB), sin elemento sin fuente en el reparto.
5. Cache: faltaban cabeceras para `/assets/*`, `/pieces/*`, `/sound/*`, `/brand/*`, `/landing/*` y `/engine/*` (solo tenía `/fonts/*`). Añadidas. Sprites del juego de piezas equipado precargados.
6. Interacción: foco tras cada ejercicio y en el diálogo de promoción (Escape cancela), chessground sin animación con «reducir movimiento», guardado de lección sin doble envío y con reintento sin repetir, tienda sin doble compra, aviso de conexión al fallar `/api/me`.
7. Sin fugas: 140 navegaciones (20 vueltas a 7 pantallas) dejan nodos DOM y listeners idénticos y +0,4 MB de heap. El análisis (Stockfish) no bloquea la interfaz: 41 posiciones en 14 s con fotogramas de 6 ms y máximo 9 ms.
8. No verificado: dedo real, Safari/iOS, audio real en móvil, red lenta real, licencias de los sonidos contra el origen en línea, y arrastre táctil (la emulación táctil de CDP entrega `touchstart` no cancelable y chessground no puede arrastrar; ver hallazgo T1).

## Método

Chrome real en modo headless controlado por CDP (script propio fuera del repo; el navegador integrado estaba oculto y no ejecuta `requestAnimationFrame`, así que no sirve para fotogramas), builds de producción servidas con `vite preview`, datos simulados `?mock=1` (build con `VITE_MOCK=1`). Observadores de long tasks, layout shift, LCP, `Memory.getDOMCounters`, `document.getAnimations()`, arrastres con eventos de ratón reales, `prefers-reduced-motion` emulado. «Antes» = build del commit de74847 extraída con `git archive`.

## Hallazgos

| Id | Área | Sev. | Evidencia medida | Estado | Commit |
|---|---|---|---|---|---|
| R1 | Rendimiento/seguridad | Crítico | El bundle contenía 275 ejercicios con `solutionUci` y `explanationCorrect` (grep en `dist`) por `lessonsForConcept` (Perfil, Informe) y el mock; las lecciones de pago están tras 402 en la API pero se descargaban en el JS | Arreglado: plugin Vite `virtual:concept-lessons` (solo id y título), mock con `import()` y solo con `import.meta.env.DEV` o `VITE_MOCK=1`; build de producción sin trozo `mock` y sin temario | 735c4bb |
| R2 | Rendimiento | Importante | Un solo JS de 741 KB (216 KB gzip), 724 KB decodificados en la portada | Arreglado: `React.lazy` para 8 pantallas privadas (principal 266 KB / 82 KB gzip; Board 61 KB compartido; Revisión 80 KB; Sesión 46 KB) | aeb59c0 |
| R3 | Rendimiento/UX | Importante | CLS 0,915 en la portada (entrada de layout-shift: `main` de 95 a 699 px de alto con el pie ya visible) | Arreglado: sin pie de página mientras carga la sesión; CLS 0,023. Resto: botón de la barra 15 px por cambio de fuente | aeb59c |
| R4 | Rendimiento | Menor | Fuente DM Sans sin precarga (cambio de ancho del botón de la barra) | Arreglado: `preload` en `index.html` | aeb59c |
| R5 | Caché | Importante | `_headers` solo cubría `/fonts/*`: JS con hash, 120 sprites, mp3, motor WASM (575 KB) sin política de caché | Arreglado: `immutable` en `/assets/*`; 7 días en piezas, sonidos, marca, portada; 30 días en `/engine/*` (nombre con versión). Sin verificar en Cloudflare real | 0b9041b |
| S1 | Sonido | Menor | Portada: 9 peticiones y 148 KB de audio (Move x3, Capture x2, Check x2 duplicados) sin gesto del usuario | Arreglado: solo el primer elemento del reparto descarga, el resto toma la caché; acierto y victoria con el primer gesto. Medido en preview: 5 peticiones / 121 KB antes de cargar los pesados; con los pesados diferidos la portada queda en 61 KB | 0b9041b, 0a8b68c |
| S2 | Sonido | Menor | `list.find(paused)` podía elegir un elemento sin fuente (extras que aún no cargaron) y quedar mudo | Arreglado: exige `src` | 0a8b68c |
| S3 | Sonido | — | Créditos coherentes (`LICENSE.md`, `credits.ts`, `THIRD_PARTY_NOTICES.md`: sfx de Lichess, Enigmahack, AGPLv3+); 5 ficheros presentes con sus md5 | Comprobado solo offline; no se contrastó con el repositorio de Lichess | — |
| V1 | VFX/accesibilidad | Importante | chessground anima con rAF: «reducir movimiento» no le llegaba (duración fija 200 ms) | Arreglado: `animation.enabled = !prefers-reduced-motion` | 0b9041b |
| V2 | VFX | Menor | Duraciones fijas fuera de los tokens (`.promo` 0,2 s, `.feedback-wrong` 0,35 s, `.result-pass` 0,5 s, barra de sesión 0,35 s, tarjeta de nivel 0,12 s) | Arreglado con `--m-dur-*` y `--m-ease-*` (tocadas solo líneas de animación en `styles.css`, `session.css`, `level.css`) | 0b9041b |
| V3 | VFX | — | Con reducir movimiento: 0 animaciones de transform/spin/shimmer, solo fundidos de 120 ms (`getAnimations()` en mapa, tienda y paso de lección); sin él, solo `m-fade`, `m-rise`, transiciones de color | Comprobado, sin cambios | — |
| I1 | Interacción | Importante | Tras pasar de «Pasar a la práctica» a un ejercicio, `document.activeElement` era `BODY` (el botón desaparece): el teclado vuelve a empezar desde «Saltar al contenido» | Arreglado: el enunciado recibe el foco al montar cada ejercicio (no en la vitrina de la portada) | 043ec27 |
| I2 | Interacción | Importante | El diálogo de promoción no recibía foco ni respondía a Escape (SessionScreen sí) | Arreglado: foco en «Dama» y Escape cancela y devuelve la pieza | 043ec27 |
| I3 | UX/datos | Importante | Si `POST /complete` falla (500/429/red), el resultado decía «Lección completada», sonaba la victoria y solo había un mensaje; no había forma de reintentar sin repetir la lección | Arreglado: título «No se ha guardado tu resultado», botón «Guardar de nuevo» con los aciertos conservados, sin sonido de victoria. Reintento = misma petición: si la primera llegó al servidor y la respuesta se perdió, depende de que `complete` sea idempotente (worker, fuera de mi área). Comprobado solo por código (el mock no falla) | 043ec27 |
| I4 | UX | Menor | Doble toque en «Ver resultado» llamaba dos veces a `finish` (dos `POST /complete`) | Arreglado: guarda `inFlight` | 043ec27 |
| I5 | UX | Importante | Un fallo de `/api/me` (sin red, 500) se tomaba como «sin sesión»: redirección silenciosa a `/entrar` | Arreglado: pantalla «No se pudo conectar» con «Reintentar» y foco (comprobado en build real con la API inexistente) | 043ec27 |
| I6 | UX | Menor | Compra o equipado con doble toque lanzaba dos peticiones (la segunda salía como error «ya lo tienes») | Arreglado: guarda `inFlight` en ShopScreen | 043ec27 |
| I7 | Rendimiento | Menor | Al equipar un juego de piezas los sprites se piden al pintar: casillas vacías un instante | Arreglado: `preloadPieces` al cambiar `equipped.pieces` (los de la tienda se descargan al abrir: 60 WebP, 380 KB, ahora cacheados) | 0b9041b |
| T1 | Tablero táctil | Importante (sin confirmar) | `touch-action` está en `manipulation` (motion.css pisa al `none` de styles.css). Con la emulación táctil de CDP el navegador cancela el gesto (`pointercancel`) y el arrastre no se completa; con `none` tampoco, porque `touchstart` llega no cancelable y chessground ignora esos eventos. No es concluyente: en dedo real `touchstart` sí es cancelable | No arreglado: no se puede reproducir sin dedo real. Propuesta: probar en un Android/iPhone y, si el arrastre vertical desplaza la página, poner `touch-action: none` en `.board-touch cg-board piece` (solo sobre las piezas, el resto del tablero sigue permitiendo desplazar) | — |
| T2 | Teclado | Menor | Tras cancelar la promoción el foco se pierde (el diálogo desaparece) | No arreglado: el tablero no es focalizable por teclado; se ofrece la jugada escrita como alternativa | — |
| A1 | Administración | Menor | La UI no contiene lógica de administrador: depende de lo que devuelve el servidor (`ownedIds`, `levelEffect`, `hasAccess`). El protector (consumable) no se regala al administrador: ve «Faltan N días» en esa tarjeta. Administración sin nivel elegido pasa por `/bienvenida` | No arreglado (decisión de producto / worker). Sin comprobar con mock de administrador (el mock no distingue cuentas) | — |
| X1 | Rendimiento | Menor | La portada espera a `/api/me` antes de pintar (un viaje de red antes del LCP) | Arreglado (ver «Arreglo de X1»): la portada pinta de inmediato; la sesión solo decide los botones | — |


## Métricas antes y después (Chrome headless, 1280x800, build de producción local sin compresión)

| Métrica | Antes | Después |
|---|---|---|
| JS decodificado cargado en la portada | 724 KB | 345 KB |
| Fragmento principal (min / gzip) | 741 KB / 216 KB | 266 KB / 82 KB |
| Peso total decodificado en la portada (sin mock) | 893 KB | 495 KB |
| CLS de la portada | 0,915 | 0,023 |
| FCP / LCP de la portada (local) | 440 ms | 460 ms (sin mejora apreciable local: lo medido es transferencia, no CPU) |
| Long tasks en la portada | 0 | 0 |
| Audio descargado en la portada con demostración | 148 KB, 9 peticiones | 61 KB tras el primer gesto, 5 peticiones (121 KB hasta el gesto) |
| Heap tras 140 navegaciones (calentado) | 3,76 a 4,21 MB (+0,45) | 3,99 a 4,43 MB (+0,44) |
| Nodos DOM y listeners tras 140 navegaciones | 618 / 170 sin cambio | 644 / 170 sin cambio |
| Fotogramas durante el análisis de 41 posiciones | n/a | mediana 6 ms, p95 6 ms, máx. 9 ms (14,3 s, 350 ms por posición, init del motor 2,5 s en desarrollo) |
| Long tasks en el análisis | n/a | 2 (56 y 59 ms) por la carga de módulos de desarrollo, ninguna durante la búsqueda |
| Tienda con 30 tarjetas | n/a | 67 peticiones nuevas (60 WebP, 462 KB), CLS 0,0002, 0 long tasks, 639 nodos |
| Arrastre de ratón en lección | n/a | pieza rival no se coge, jugada ilegal vuelve, e2e4 con respuesta del rival a los 650 ms, 1 long task de 64 ms y eventos de 16 a 32 ms en todo el flujo de login, nivel y lección |

## Verificación

`npx tsc --noEmit` limpio; `npx vitest run --exclude ".claude/**"`: 45 archivos, 1373 pruebas en verde; `npm run build:web` en verde (con y sin `VITE_MOCK=1`). Se repitieron las mediciones sobre la build final. No toqué `worker/`, `scripts/` ni los CSS de pantallas salvo las líneas de duración de animación indicadas en V2.

## No verificado

- Dedo real, Safari e iOS (incluida la política de autoplay y que los elementos de audio extra, que reciben su fuente tras el desbloqueo, suenen en iOS; solo el primero de cada sonido se desbloquea en el primer gesto).
- Audio real en móvil y latencia del primer sonido en dispositivo.
- Red lenta real, y el efecto de las cabeceras de caché en Cloudflare (solo se comprobó la sintaxis de `_headers`).
- Arrastre táctil (T1).
- Licencia y hashes de los sonidos frente al repositorio de Lichess (sin red).
- Flujos con 429, 500 y corte de red en mitad de lección: revisados leyendo el código y la pantalla de conexión comprobada; el mock no simula errores.
- Análisis completo de una partida de Lichess real desde `/partidas` (sin acceso a la red de Lichess); sí con el motor y una partida de 20 jugadas.
- Cuenta de administración con un mock de administrador.

## Arreglo de X1 (2026-11-15): la portada ya no espera a `/api/me`

Cambio: `App.tsx` solo muestra «Cargando…» durante la comprobación en las rutas que no son la portada; en «/» pinta `Landing` y el pie al instante. El botón principal (hero y cierre) es `PrimaryCta`: mientras `loading` ocupa su sitio con un hueco sin etiqueta (`.cta-pending`, misma altura que el botón real, `role="status"` con «Comprobando tu sesión») y después pasa a «Entrar con Lichess» o «Ir a mi ruta de aprendizaje». La cabecera ya no mostraba botones durante la carga y su `min-height` fija los 64 px. Comportamiento con sesión sin cambios (comprobado en el código): `/` no redirige, enseña la portada con «Ir a Aprender» y «Ir a mi ruta de aprendizaje»; las rutas privadas sin sesión siguen llevando a `/entrar` y con fallo de red muestran «No se pudo conectar» con «Reintentar» (comprobado: con `/api/me` en 503 aparece, y al reintentar con 401 lleva a `/entrar`).

Medición: Chrome headless por CDP (script fuera del repo), Vite en desarrollo detrás de un proxy que responde `/api/me` con 400 ms de retraso (sin sesión o con sesión), 375x667, 3-4 cargas por caso. «Hero pintado» = `h1#hero-title` en el DOM más un `requestAnimationFrame`.

| Métrica | Antes | Después |
|---|---|---|
| Hero pintado (375x667) | 525 a 578 ms | 136 a 181 ms |
| CLS (375x667, sin sesión) | 0 a 0,042 (2 de 3 cargas con salto al llegar `/api/me`) | 0 en 4 de 4 |
| CLS (375x667, con sesión) | 0 a 0,042 | 0 |
| CLS (1280x800, sin sesión) | 0,0225 | 0 |
| CLS (320x640, con sesión) | no medido | 0,0001 |
| LCP según Chrome | 580 a 650 ms (el botón principal) | 590 a 660 ms: **sin mejora** |

El LCP no mejora y se dice tal cual: Chrome no cuenta como candidatos los textos de la portada porque entran con la animación `hero-in` desde `opacity: 0`, así que el último candidato sigue siendo el botón principal, que depende de la sesión. El contenido sí es visible 400 ms antes. No se tocó la animación (bajarla de 0 a 0,01 de opacidad sería cumplir la métrica sin pintar nada visible). Propuesta si se quiere mover el LCP: que el `h1` no parta de opacidad 0.
