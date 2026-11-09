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

La landing carga el resumen de análisis al llegar a su bloque de cobertura; no consulta noticias, retransmisiones ni geometrías. Las vistas solicitan sus recursos al necesitarlos. El cliente conserva hasta 64 respuestas; el servidor hasta 128 entradas por instancia, con una sola carga concurrente por clave. Estas garantías no implican exclusión distribuida entre todas las instancias de Cloudflare.

## Crecimiento

La instantánea completa se limita a 3 MB para controlar memoria y tiempo de lectura. La selección de jugadores está declarada y los rankings siguen paginados. Los históricos completos se descargan únicamente al abrir fichas; el censo de federaciones se calcula previamente a partir de las listas completas.

Si la selección deja de caber en ese presupuesto, el siguiente paso será particionar los históricos por identificador o sustituir el lector de `server/snapshots.mjs` por almacenamiento indexado. Se conservarán los contratos de resumen y detalle. No se añade una base de datos a las visitas públicas mientras no sea necesaria.

Las cachés nunca almacenan credenciales ni sesiones. Los errores de fuente no se convierten en ceros y se conservan las fechas de la última copia verificada. Los recursos de terceros, datos generados, ZIP FIDE y secretos no se reformatean ni mezclan con el código mantenido.

## Edición diaria y directorio ampliado

`/api/news` reúne únicamente titulares de los RSS/Atom públicos de FIDE, ChessBase en español y Lichess, sin copiar artículos. Cada canal se cachea por separado durante 15 minutos; un fallo no oculta las otras fuentes. La respuesta publica el estado y el recuento de cada canal. `/api/broadcasts` incluye los activos y la primera página de recientes de Lichess, normaliza la paginación de `past` y no aplica el antiguo corte de 24 elementos. El límite defensivo es 500; las rondas finalizadas no se anuncian como próximas.

`/api/directory/players?q=` consulta el directorio FIDE de Lichess (3–80 caracteres, primeros 30 resultados). `/api/directory/players/:id` recupera ficha y series estándar/rápida/blitz bajo demanda. Las búsquedas tienen TTL de 5 minutos, las fichas de 1 hora, y comparten la caché acotada y las cargas simultáneas. Las llamadas al directorio son secuenciales por instancia, con cola acotada a ocho y un minuto de enfriamiento tras 429; no es un limitador distribuido. No amplían automáticamente la selección de los índices. La API no indica fecha de lista: se muestra fecha de consulta sin presentarla como fecha del Elo. Las series omiten meses sin cambios; no se usan para calcular Performance ni se rellenan huecos.

El cliente renueva fuentes cada cinco minutos solo con una vista de actualidad visible. El indicador de novedades compara las fechas publicadas con un único timestamp local de la visita anterior; no envía historial de visitas ni requiere cuenta. No garantiza visitas recurrentes: hace falta observar el uso real del producto.
