# Análisis de las últimas 10 partidas de Lichess — diseño

Fecha: 2026-11-13. Estado: pendiente de aprobación. Fase 3 de Chedex Pulse (primer paso).

## Intención y por qué

El alumno entra con Lichess. Chedex Pulse trae sus últimas 10 partidas (blitz o más lento), las analiza en su propio navegador y le enseña, con explicaciones de buena calidad al estilo DecodeChess, qué hizo bien, qué le cuesta y qué hacer ahora.

Lo que de verdad importa no es detectar el error sino **comunicarlo para que el alumno lo entienda**. Un alumno puede ver una flecha y una evaluación sin entender nada. Por eso cada error clave se enseña como una mini lección en la que el alumno participa, y el informe final termina en una sola regla que pueda recordar.

## Objetivos

1. El alumno pulsa un botón y obtiene el repaso de sus últimas 10 partidas elegibles sin salir de Chedex Pulse.
2. Por partida se enseñan los errores clave (hasta 3), cada uno como una mini lección de 5 momentos.
3. Al terminar, se abre un informe visual: resumen con la tira de las 10 partidas, lo que hace bien, lo que más le cuesta, su error más repetido sobre un tablero, una regla para las siguientes partidas y los pasos para practicarla.
4. Los conceptos fallados alimentan `cp_weak_concepts`, sin contar dos veces la misma partida.
5. El alumno no espera mirando una pantalla vacía: repasa la primera partida mientras las demás se analizan.

## No objetivos

- Suscripción y pagos (aplazados por decisión del usuario).
- Partidas bullet y variantes. Solo partidas estándar.
- Guardar partidas en el servidor. Solo se guardan conceptos fallados y los identificadores de las partidas repasadas.
- Analizar al rival, mostrar evaluaciones del motor en bruto, repasos espaciados, sesión diaria (siguientes pasos de la Fase 3).
- Validación del contenido por profesores (Fase 4).

## Antiobjetivos (fallaría aunque funcione)

- Una explicación que suena bien pero es falsa. Se mantiene la regla actual: sin diagnóstico verificado no se inventa una causa.
- Elogios que no salen de los datos. Si no se puede respaldar, no se dice.
- Jerga («evaluación», «centipeones», «desventaja posicional») para niveles bajos.
- Que el alumno sienta que le examinan sus fallos: la pausa siempre se puede saltar sin penalización.
- Una página congelada o confusa mientras el motor trabaja.

## Restricciones

- **Navegador:** Stockfish 16 WASM de un solo hilo (unos 0,6 MB) en un Web Worker. Sin SharedArrayBuffer ni cabeceras COOP/COEP.
- **Reproducibilidad:** misma regla que el CLI: búsqueda por profundidad (12 por defecto), un hilo, hash fijo. Mismas partidas, mismos resultados.
- **Lichess:** petición directa desde el navegador (CORS abierto, comprobado desde un origen ajeno). Un solo pedido a la vez. Con 429, esperar un minuto.
- **Seguridad:** `web/public/_headers` hoy solo permite `'self'`. Hay que abrir `connect-src` a `https://lichess.org`, permitir `worker-src 'self'` y `'wasm-unsafe-eval'` en `script-src`, y nada más.
- **D1:** solo `CREATE TABLE IF NOT EXISTS`, tablas `cp_*` (hay un test que lo exige). Nada de claves de usuario en el repositorio.
- **Sin XP, sin objetivo diario, sin niveles visibles.** Sin emojis en toda la interfaz: los iconos son SVG.
- **Licencia:** Stockfish es GPL; el proyecto es GPL-3.0-or-later. Añadir el crédito en la pantalla de créditos.
- **Calidad exigida por el usuario:** que no se solape nada en ningún ancho (desde 320 px), que todo funcione y reaccione como corresponde (carga, error, vacío, cancelación) y que la maquetación sea responsive.

## Enfoques considerados

- **A. Todo en el navegador (elegido).** El navegador pide las partidas, las analiza en un Worker y reutiliza el diagnóstico y la pedagogía de `src/`. Al servidor solo van conceptos fallados y ids de partida. Es lo más barato y no hay servicio intermedio que mantener.
- **B. El Worker de Cloudflare pide las partidas.** Descartado: se comprobó que el navegador puede pedir a Lichess directamente. Queda como reserva si Lichess cambia su política.
- **C. Reutilizar los análisis de Lichess.** Descartado como base: nuestro diagnóstico necesita la variante del motor tras la jugada del alumno (`pvAfter`) y Lichess no la da. Puede servir luego para ahorrar tiempo.

## Decisiones tomadas con el usuario

- Solo las últimas 10 partidas de blitz hacia arriba, de su cuenta de Lichess.
- La pausa participativa con botón «No lo sé, enséñamelo».
- El informe final es la mezcla acordada, en este orden: resumen y tira de las 10 partidas; lo que ya haces bien; lo que más te cuesta; tu error más repetido sobre un tablero; una regla para las siguientes partidas; para practicarla. Estilo de la app (oscuro, naranja, relieve táctil), maqueta aprobada en `.superpowers/brainstorm/…/informe-v3-mix.html`.
- Cada error clave es una mini lección con 5 momentos: (1) la posición antes de su jugada, (2) pausa: «¿qué pieza tuya está en peligro?» y el alumno la toca, (3) qué pasó, en una frase con flechas, (4) por qué importa, en una línea y sin jerga, (5) qué debías hacer, con la jugada mejor animada y la regla de una frase.

## Mis llamadas (el usuario puede cambiarlas)

- **Dónde:** nueva ruta privada `/partidas`, con acceso desde el mapa de aprendizaje y el perfil. El nombre de usuario es el de Lichess de la sesión.
- **Qué partidas:** `max=10&perfType=blitz,rapid,classical,correspondence`, cabecera `Accept: application/x-ndjson`, con relojes y apertura. Se descartan variantes, partidas abortadas y partidas de menos de 10 jugadas. Si hay menos de 3 partidas válidas, se avisa de cuántas faltan en lugar de mostrar un informe pobre.
- **Del PGN:** la API devuelve las jugadas en SAN; se construye un PGN mínimo para `parseGame`.
- **Motor compartido:** `analyzeGame` y `trainFromPgn` reciben el motor como parámetro (interfaz `init/analyze/close`). El `Engine` de Node se mantiene; se añade un motor de navegador sobre el Worker. No se duplica la lógica de análisis.
- **Qué errores se enseñan:** solo jugadas del alumno clasificadas como error o fallo grave y con diagnóstico verificado, ordenadas por pérdida; hasta 3 por partida. Sin diagnóstico, el error no se enseña como lección (solo cuenta para el resumen).
- **Un solo intento en la pausa:** si el alumno falla, se le muestra la respuesta con tono amable. Los botones «No lo sé, enséñamelo» y «Saltar» siempre están.
- **Niveles:** el texto usa el nivel de colocación ya calculado del alumno. En niveles `beginner` e `initiation` se sustituye «pierdes X peones de evaluación» por material en piezas (por ejemplo «pierdes un alfil»).
- **Caché:** resultados en IndexedDB por id de partida, profundidad y versión del motor, para no recalcular al volver.
- **Contabilidad de conceptos:** tabla nueva `cp_reviewed_games (user_id, game_id, reviewed_at)` y endpoint `POST /api/review/complete`. En un solo lote atómico, `INSERT OR IGNORE` de las partidas y suma a `cp_weak_concepts` solo de las partidas nuevas, para que repetir el repaso no cuente dos veces.
- **Lo que haces bien (solo con datos):** mejor fase de la partida (apertura, medio juego, final) por menos errores, proporción de jugadas buenas o mejores, y tendencia entre las primeras 5 y las últimas 5 partidas. Se muestra solo lo que los datos respaldan.
- **Regla final:** una frase fija por concepto (nuevo contenido en `src/pedagogy/concepts.ts`), la del concepto más repetido.
- **Ejercicios del informe:** hasta 5 posiciones suyas reutilizando la mecánica de la pausa («encuentra la jugada»). Si resulta caro, se recorta a la lección enlazada y a la regla.

### Aclaraciones tras la revisión del constructor

- **Conceptos (respondido por el código):** los 6 tipos de error ya tienen un id de concepto 1 a 1 (`tactics.hanging_piece`, `bad_exchange`, `fork`, `pin`, `mate_threat`, `discovered_attack`) y cada diagnóstico los trae en `conceptIds`. Las lecciones ya pueden declarar `conceptIds` en `src/content/schema.ts`; el enlace «aprende» del informe sale de las lecciones que incluyan el concepto. Si algún concepto no tiene lección, el paso se omite.
- **Cuánto cuenta cada concepto (mi llamada):** una vez por concepto y por partida, aunque se repita dentro de la partida. Así 10 partidas suman como máximo 10 por concepto y no inundan lo que ya escriben las lecciones.
- **Cuándo se envía `/api/review/complete` (mi llamada):** al terminar el repaso de cada partida, no al final de las 10. Una partida cuenta como repasada cuando el alumno recorre sus errores clave, incluso saltando las pausas. Si recarga o cancela a mitad, las partidas ya terminadas están registradas y el análisis guardado en IndexedDB permite continuar sin recalcular. El endpoint acepta lotes parciales y es idempotente por partida.
- **Partidas elegibles (mi llamada):** se piden hasta 30 y se toman las 10 primeras válidas. Se avisa de que faltan partidas solo si, tras filtrar, quedan menos de 3.
- **Respuesta de la pausa (mi llamada):** el diagnóstico trae `evidence.squares` y `evidence.pieces`. La pausa se muestra cuando de ahí sale una casilla comprobable (pieza sin defensa, pieza clavada, piezas atacadas por una horquilla). Si un tipo de error no ofrece una casilla clara, se salta el momento 2 sin penalización y el resto de la lección se mantiene. El constructor puede ampliar la salida del diagnóstico si hace falta.
- **Nivel para el texto (mi llamada):** el nivel interno del alumno (hoy `levelForXp` y la colocación); si no existe, `initiation`. No se bloquea `/partidas` por no haber hecho la colocación.
- **Profundidad (mi llamada):** una sola constante para todos los usuarios. Si el plan decide bajarla, cambia para todos y la clave de la caché incluye la profundidad; nunca se mezclan resultados de profundidades distintas.
- **Pruebas sin red (mi llamada):** un NDJSON grabado de Lichess y un motor falso para las pruebas automáticas y el modo de desarrollo; el WASM real se verifica a mano en el navegador una vez por cambio importante.

## Riesgos

- **Tiempo de análisis.** Se desconoce el coste real en el navegador. El primer paso del plan es medirlo en una posición real. Regla de decisión: objetivo de primera partida lista en menos de 40 s y las 10 en menos de 5 minutos en un portátil normal; si no se cumple, bajar profundidad a 10 o analizar a partir de la jugada 6, sin tocar la reproducibilidad (la profundidad queda fija y documentada).
- **Mapeo concepto a lección.** `concepts.ts` no enlaza con lecciones concretas. Hay que crear ese enlace para el paso «aprende» del informe.
- **Contenido nuevo.** Preguntas de pausa, líneas de «por qué importa» y reglas para los 6 tipos de error: trabajo de redacción en español claro, sin jerga.
- **Mock de desarrollo.** `web/src/dev/mock.ts` no cubre Lichess; el plan debe incluir cómo probar sin red.

## Calidad y verificación (exigido por el usuario)

- Un agente de revisión independiente comprueba al final y **arregla** lo que encuentre: solapamientos, responsive de 320 a 1280 px, ausencia total de emojis, y que cada interacción funcione (carga, errores de Lichess como usuario inexistente, 429 y sin conexión, sin partidas suficientes, cancelar, recargar a mitad, teclado y lectores de pantalla).
- Pruebas de Vitest para las partes puras (construcción del PGN, selección de errores clave, métricas de «lo que haces bien», contabilidad idempotente, inyección del motor) y comprobación visual en el navegador integrado.
- `npm test`, `npm run typecheck` y `npm run build` limpios antes de dar nada por terminado.

## Lo que queda para el constructor

Estructura de archivos, formato exacto del Worker y su protocolo de mensajes, esquema de IndexedDB, diseño de la animación de la jugada mejor, copia final de textos, nombres de componentes y el orden de las tareas del plan.
