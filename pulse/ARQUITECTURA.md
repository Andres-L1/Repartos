# Organización y límites de Pulse

- `pulse/worker.mjs`: entrada HTTP, autenticación y entrega de rutas de la aplicación.
- `pulse/server/`: API pública, caché acotada, lectores de instantáneas, ETag y normalización de fuentes.
- `pulse/auth.mjs`: OAuth Lichess y sesiones privadas; nunca pasan por la caché pública.
- `pulse/analytics.mjs`: cálculos puros de los índices y lectura del formato FIDE.
- `pulse/public/lib/`: peticiones compartidas, rutas y catálogo geográfico.
- `pulse/public/components/`: controles reutilizables, independientes de las vistas.
- `pulse/public/styles/`: estilos de componentes, análisis y landing. `styles.css` contiene la base y el dashboard.
- `scripts/collect-analytics.mjs`: recopilación y cálculo fuera de las peticiones de usuarios.

## Contratos de lectura

`GET /api/analytics/summary` devuelve metadatos y rankings sin históricos. `GET /api/players/:id` devuelve el detalle de una ficha. `GET /api/analytics` conserva el contrato completo anterior. Las respuestas públicas incluyen ETag y TTL; HEAD y 304 no transfieren cuerpo. Las URLs desconocidas y APIs inexistentes mantienen 404.

La landing no solicita análisis, noticias, retransmisiones ni geometrías. Las vistas solicitan sus recursos al necesitarlos. El cliente conserva hasta 64 respuestas; el servidor hasta 128 entradas por instancia, con una sola carga concurrente por clave. Estas garantías no implican exclusión distribuida entre todas las instancias de Cloudflare.

## Crecimiento

La instantánea completa se limita a 3 MB para controlar memoria y tiempo de lectura. La selección de jugadores está declarada y los rankings siguen paginados. Los históricos completos se descargan únicamente al abrir fichas; el censo de federaciones se calcula previamente a partir de las listas completas.

Si la selección deja de caber en ese presupuesto, el siguiente paso será particionar los históricos por identificador o sustituir el lector de `server/snapshots.mjs` por almacenamiento indexado. Se conservarán los contratos de resumen y detalle. No se añade una base de datos a las visitas públicas mientras no sea necesaria.

Las cachés nunca almacenan credenciales ni sesiones. Los errores de fuente no se convierten en ceros y se conservan las fechas de la última copia verificada. Los recursos de terceros, datos generados, ZIP FIDE y secretos no se reformatean ni mezclan con el código mantenido.
