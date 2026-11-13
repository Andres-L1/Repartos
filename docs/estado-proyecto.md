# Estado del proyecto Chedex Pulse

Documento de traspaso: qué es, qué hay hecho, qué cambió respecto al documento fundacional y qué falta. Actualizado el 2026-11-13.

## Qué es
Academia digital de ajedrez, de principiante a ~2000 Elo: ruta de aprendizaje con lecciones interactivas y un entrenador pedagógico que explica los errores. Web: https://chedexpulse.app. Repositorio: https://github.com/Andres-L1/Repartos (rama `main`). Código bajo GPL-3.0-or-later; lecciones y ejercicios © Chedex (ver `docs/licencia.md`).

## Cómo se trabaja
- Stack: React 19 + Vite (`web/`), API en Cloudflare Worker con Hono (`worker/`), base D1 `PULSE_DB` (`chedexpulse-users`), tests con Vitest. Entrenador (CLI): `src/analysis`, `src/diagnosis`, `src/pedagogy`.
- Comandos: `npm test`, `npm run typecheck`, `npm run build`, `npm run dev` (Worker local en :8787), `npm run chedex -- samples/x.pgn --level initiation` (entrenador por línea de comandos).
- Despliegue manual: `npm run build && npx wrangler deploy`; migraciones D1 con `npx wrangler d1 migrations apply PULSE_DB --remote` (solo `CREATE TABLE IF NOT EXISTS`, tablas `cp_*`; hay un test que lo exige).
- Wrangler está autenticado con la cuenta de Cloudflare de Chedex. `SESSION_SECRET` ya existe en producción: no sobrescribirlo. No hay `gh`; el push usa la identidad git de Andres-L1.
- Método usado: agentes por zona de archivos (servidor, contenido, web, piezas), contratos compartidos en `src/shared/api.ts`, `src/content/schema.ts` y `src/shop/catalog.ts`, y verificación propia del coordinador (tsc, tests, build, capturas) antes de publicar.

## Estado frente al documento fundacional
| Fase | Estado |
|---|---|
| 1. Prototipo pedagógico | Hecho como CLI: PGN, Stockfish, 6 tipos de error (piezas sin defensa, cambios, horquillas, clavadas, jaques a la descubierta, mates), explicaciones por nivel, ejercicios recomendados. Falta validarlo con posiciones revisadas por profesores. |
| 2. Plataforma inicial | Hecho: acceso con Lichess, mapa de aprendizaje, 6 unidades y 24 lecciones (0 a 800 Elo), lecciones interactivas con corrección y evaluación, progreso y racha. **Nivel elegido por el alumno** en `/bienvenida` (primer acceso y desde el Perfil con «Cambiar nivel»): 6 tarjetas (Principiante 0-400, Iniciación 400-800, Básico 800-1100, Intermedio 1100-1400, Avanzado 1400-1700, Competitivo 1700-2000; 2000 o más es Competitivo), cada una «Disponible ahora» o «En preparación» según el temario. Lichess solo sugiere: el mejor Elo fiable entre rápidas, clásicas y blitz, más una pista si hay un Elo provisional más alto con 30 partidas o más. El nivel elegido gobierna el mapa (abre como repaso las unidades de niveles inferiores y recomienda la primera del suyo) y los textos; si su nivel aún no tiene lecciones, se abre todo lo actual sin recomendada y el mapa avisa de que llegan pronto. Tabla `cp_user_level` (migración 0006), `GET`/`PUT /api/level`; `/api/me` devuelve `level` y `levelChosen`. Sustituye a la antigua colocación por bandas (`POST /api/placement` ya no existe). **Falta:** evaluación de nivel (prueba de conocimientos) y suscripción con pagos reales (hoy solo un proveedor simulado y beta abierta). |
| 3. Personalización | Primer paso hecho: **análisis de las últimas 10 partidas de Lichess del alumno** en `/partidas`, a demanda (el alumno elige cuáles; se analiza una a la vez en su navegador con Stockfish WASM a profundidad 12 y se guarda en el dispositivo), repaso de cada partida con mini lecciones de sus errores clave (posición, pausa en la que elige casilla, qué pasó, por qué importa, qué debía hacer y su regla), visor de la partida jugada a jugada e informe final con 3 o más partidas analizadas (resumen, lo que hace bien, lo que más le cuesta, su error más repetido, su regla y práctica con sus propias posiciones). Revisado en móvil (320 a 768 px y en horizontal). En «Qué debías hacer» el alumno juega él la jugada mejor en el tablero (arrastrar o tocar y tocar; si se equivoca la pieza vuelve con un aviso amable, y «Muéstramelo» enseña la animación); en la pausa puede levantar sus piezas para mirar, pero solo «Comprobar» responde. **Puntos débiles en el Perfil**: los 3 conceptos que más ha fallado (lecciones y partidas repasadas), con cuántas veces, su regla y «Practicar» (abre una lección de ese concepto). **Falta:** historial de dificultades, repasos espaciados, sesión diaria y validación con profesores. |
| 4. Contenido hasta 2000 Elo | Pendiente. |

## Decisiones del usuario que cambian el documento original
- Acceso solo con Lichess (sin registro con contraseña). El nivel lo elige el alumno; Lichess solo sugiere (mejor Elo fiable entre rápidas, clásicas y blitz).
- Sin XP, sin objetivo diario y sin niveles internos visibles: el perfil muestra solo racha y lecciones aprendidas.
- Tienda con moneda propia **Chedex**: 1 Chedex cada 5 días de racha, sin dinero real ni azar. Se venden piezas, tableros y protector de racha (máx. 2). Catálogo y precios en `src/shop/catalog.ts`.
- Todo el material visual es propio: tablero «Noche», piezas «Contorno» (por defecto) y «Geométricas», temas de tablero, ficha de Chedex. «Clásicas» (cburnett, GPLv2+) sigue como opción gratuita.
- Toda la app es oscura, con estilo «táctil» (`web/src/tactile.css`) y naranja de acento. URLs limpias sin `#`.
- Base de datos: se mantiene D1 (se valoró Turso y se descartó por ahora).
- Notación de jugadas como Lichess (N, B, R, Q, K).
- Sonidos de Lichess: el juego «sfx» (AGPLv3+, compatible con la GPL-3.0 del proyecto) para jugada, captura, jaque, acierto y lección completada; nada al fallar. El juego «standard» que se pedía no se usa porque el `COPYING.md` de lila lo lista como no libre. Botón para silenciar en la barra de la app (se recuerda en el navegador); créditos en `web/public/sound/LICENSE.md`, `web/src/credits.ts` y `THIRD_PARTY_NOTICES.md`.
- Movimiento con tokens únicos en `web/src/motion.css` (duraciones cortas, entradas escalonadas por pantalla, piezas que se levantan); con «reducir movimiento» solo quedan fundidos breves.
- Beta abierta y gratuita; la suscripción de 10 €/mes del modelo de negocio aún no está activa.

## Pendiente, por orden recomendado
1. **Probar con tu cuenta real de Lichess y en un móvil de verdad**: la sugerencia de nivel y su pista solo se han visto con datos simulados (el caso real del usuario, blitz 1125 fiable y rápida 1749 provisional, está cubierto por tests: sugiere Intermedio y da la pista de rápida). Tampoco se han probado en un dispositivo real los sonidos (salida, latencia, desbloqueo en Safari/iOS) ni arrastrar piezas con el dedo (que no desplace la página y que desplazar fuera del tablero siga funcionando).
2. **Calibrar las bandas de nivel** con datos reales: los cortes de Elo (400, 800, 1100, 1400, 1700, 2000) son una estimación y valen igual para cualquier ritmo, aunque el Elo de blitz suele diferir del de rápidas.
3. Revisar el texto de `/privacidad` (cookies y analítica no verificadas).
4. Cerrar la Fase 2: evaluación de nivel y suscripción con Stripe (hacen falta claves de modo test del usuario; nunca en el repositorio).
5. Seguir la Fase 3 (análisis de partidas y puntos débiles ya hechos): repasos espaciados de esos puntos débiles, sesión diaria e historial de dificultades; validar las mini lecciones con profesores.
6. Fase 4 y validación: contenido de 800 a 2000 Elo con revisión de profesores; mientras tanto el contenido solo está verificado por código.

## Cosas conocidas por pulir
- La consulta «¿hay sesión?» da 401 en consola para visitantes (esperado, pero ruidoso).
- El caballo del hero puede quedar cortado en pantallas de poca altura; las piezas negras sobre casilla oscura dependen del contorno naranja.
- La atomicidad de las compras está probada con SQLite local y D1 local, no con una carga real en producción.
- Mientras el alumno no elige nivel, los textos usan «iniciación» y el mapa no abre nada por adelantado. Quien ya tenía la antigua colocación por Lichess pasa una vez por la pantalla de nivel; su progreso se conserva, pero las unidades que aquella colocación abría vuelven a su estado normal hasta que elige.
- Con un nivel sin lecciones, «Para empezar» del mapa propone la primera lección pendiente del temario (no hay recomendada).
- La tarjeta Competitivo dice «1700 a 2000 Elo», aunque 2000 o más también es Competitivo.
- Aviso de React en desarrollo por la etiqueta `piece` de las miniaturas de la tienda (`ShopVisuals.tsx`): las reglas de piezas usan ese selector, así que cambiarla no es trivial. Sin efecto en producción.
- Analizar las 10 partidas tarda unos 4 minutos en total a profundidad 12 (depende del dispositivo); por eso se hace a demanda y una a la vez.
- Los tests de contenido son lentos (búsquedas de ajedrez): `vitest.config.ts` fija 30 s por test.
