# Chedex Pulse

Observatorio mundial del ajedrez: actualidad, retransmisiones, exploración geográfica y metodologías abiertas. Sustituye a la aplicación de recados anterior.

## Ejecutar

Node.js 24 o superior. `npm ci`, seguido de `npm start` (Cloudflare local) o `npm run preview` (servidor Node sin credenciales). Abrir http://127.0.0.1:8787.

## Esta versión

- Hoy: titulares del RSS oficial FIDE y selección de retransmisiones Lichess Broadcast, con origen, fecha y cobertura visibles.
- Mundo: mapa esquemático accesible, directorio inicial de 12 países, búsqueda y filtros por jugadores del directorio o coincidencias de ubicación de torneos.
- Fichas conectadas de países, jugadores y torneos. Las relaciones se muestran cuando hay coincidencias explícitas en la fuente. Los perfiles FIDE se consultan mediante enlaces oficiales.
- Tendencias e índices Performance, Trending y Global: metodologías propuestas y estados pendientes. No hay rankings, Elo, progresiones ni estadísticas nacionales inventados.
- Diseño móvil, navegación con teclado, movimiento reducido y sin registro, rastreadores ni fuentes tipográficas externas.

Los contadores corresponden a los elementos recibidos en una selección limitada, no al total mundial. Los titulares se mantienen en el idioma original y enlazan a los artículos del editor; no se replican artículos completos. La disponibilidad y cobertura dependen de las fuentes.

## Datos y costes

El Worker consulta endpoints fijos de lectura, con un timeout de 12 segundos. Cloudflare almacena respuestas correctas en caché: noticias 15 minutos, retransmisiones 5 minutos. La fecha mostrada es la de consulta de esa respuesta; las horas de la interfaz son de Madrid. Los errores se presentan como no disponibles, sin convertirlos en ceros ni almacenarlos en caché. La caché es por ubicación de Cloudflare y se rellena bajo demanda; no es almacenamiento histórico ni un recopilador programado.

Pendiente de desarrollo: importación mensual FIDE y almacenamiento histórico; integración Wikimedia; ampliación del directorio y cartografía de países con fronteras; índices validados y filtros de rankings; recopiladores programados; favoritos y alertas. No hay pagos ni Pulse Pro activos.

## Validación y publicación

`npm run check`, `npm test`, `npm run build` (empaquetado sin publicar).

`npm run publish:cloudflare` publica en el Worker existente `de-paso-benavente`, conservando su dirección para reemplazar la web anterior: https://de-paso-benavente.chedex-chesssociety.workers.dev. El nombre de producto es Chedex Pulse; el identificador de infraestructura se conserva para no dejar la versión antigua accesible en otra dirección.

El despliegue sirve exclusivamente `pulse/public/` y `pulse/worker.mjs`. No necesita Turso, secretos ni acceso administrativo. Las rutas de recados ya no forman parte de la aplicación. Los datos y archivos privados anteriores no se migran, publican ni borran. El antiguo public/, server/, scripts/publish.mjs y tests/ que puedan quedar en la carpeta local son legado inactivo y se excluyen del nuevo árbol publicado en GitHub.

Repositorio: https://github.com/Andres-L1/Repartos. La configuración conserva el nombre del repositorio existente. No publicar `.dev.vars`, `.env`, `data/`, `.wrangler/`, `.cloudflare-build/` ni dependencias instaladas.
