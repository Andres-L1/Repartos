# Chedex Pulse · Producto v1.0

Observatorio mundial del ajedrez inspirado en la visión global de World Monitor, conectado con tendencias, estadísticas e índices propios de Chedex. Debe sentirse como un centro de información, con navegación entre noticias, jugadores, torneos, tendencias y países.

## Estructura

- **Hoy:** portada «El pulso del ajedrez», mapa como identidad visual, contadores con cobertura explícita, actualidad internacional, competiciones y, cuando haya histórico, jugadores emergentes. El mapa no es obligatorio para descubrir el contenido en móvil.
- **Mundo:** mapa seleccionable, fichas nacionales, actividad competitiva, jugadores, tendencias y noticias. Filtros por torneos, jugadores y actividad cuando existan datos suficientes. La primera versión utiliza un directorio limitado y mapa esquemático.
- **Tendencias:** progresión competitiva, cambios del interés público y actividad nacional. Sin clasificaciones ficticias.
- **Índices:** Performance (rendimiento y progresión; FIDE), Trending (interés público; Wikipedia inicialmente), Global (evolución de federaciones; FIDE y registros de torneos). Cada publicación debe incluir fórmula, fuentes, periodo, cobertura y fecha de actualización. Los filtros por edad, federación y nivel dependen de una muestra suficiente.

## Desarrollo por fases

1. Base funcional: portada, actualidad de fuentes autorizadas, torneos Lichess, datos mensuales FIDE y fichas de jugadores. Estado actual: titulares y retransmisiones conectados; perfiles enlazados; importación de Elo pendiente.
2. Observatorio: mapa mundial, fichas nacionales, histórico y primeros rankings de tendencias. Estado actual: exploración inicial de países; histórico y rankings pendientes.
3. Inteligencia: índices validados, comparativas y detección explicada de cambios, con fuentes. Estado actual: metodologías propuestas; cálculos y validación pendientes.
4. Personalización: favoritos, alertas y notificaciones de jugadores, países y competiciones. Pendiente.

Arquitectura objetivo: recopilaciones y cálculos en segundo plano, Elo mensual, noticias por intervalos y retransmisiones con mayor frecuencia si están activas. La versión inicial usa caché bajo demanda; los recopiladores programados requieren almacenamiento e historial y no se presentan como implementados.

## Reglas de experiencia

Consulta sin registro obligatorio; una pregunta clara por sección; sin sobrecarga visual; sin datos inventados; fuentes, fechas y estado visibles; metodologías públicas; diseño prioritario para móvil y navegación accesible.

## Modelo comercial

Actualidad, mapa y tendencias básicas gratuitos. Evaluar Pulse Pro solo después de validar visitas recurrentes: alertas personales, comparaciones históricas avanzadas y seguimiento de jugadores. Posibles patrocinios identificados y promoción comercial de torneos. Sin activar pagos antes de validar el uso recurrente.
