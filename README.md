# Chedex Pulse

Dashboard del ajedrez mundial con identidad Chedex: DM Sans local, fondo negro, acentos naranjas, controles con relieve y navegación lateral adaptable a móvil.

Web: https://chedexpulse.app
Repositorio: https://github.com/Andres-L1/Repartos

## Ejecutar y verificar

Node.js 24 o superior. `npm ci` y `npm start` para Cloudflare local, o `npm run preview` para vista previa Node en http://127.0.0.1:8787. La vista previa no habilita autenticación de producción.

`npm run check`, `npm test`, `npm run build` (empaquetado sin publicar). `npm run publish:cloudflare` actualiza Pulse.

## Contenido y mapa

- Hoy: RSS oficial FIDE y selección Lichess Broadcast, con origen, consulta y cobertura visibles. Caché bajo demanda de 15 y 5 minutos respectivamente.
- Mundo: MapLibre GL JS 6.16.0 con cartografía Natural Earth local, 177 geometrías de países y territorios; desplazamiento, zoom, selección por fronteras, búsqueda, filtros y directorio accesible.
- Los puntos representan coincidencias de ubicación agrupadas por país, colocadas en coordenadas de etiqueta cartográfica. No son sedes exactas. La selección de retransmisiones no describe toda la actividad mundial. Los filtros solo actúan sobre los datos disponibles.
- Fichas conectadas de países, jugadores y torneos; relaciones explícitas en las fuentes. El mapa puede omitir territorios pequeños por su escala 1:110m.
- Tendencias e índices Performance, Trending y Global: cálculos v1.0 operativos, rankings filtrables e históricos con fuentes.

El mapa se inspira en la exploración de World Monitor y utiliza una biblioteca también presente en ese proyecto. No incorpora código de World Monitor. MapLibre se distribuye bajo BSD-3-Clause, Natural Earth es dominio público y DM Sans utiliza SIL OFL. Recursos y licencias servidos desde la propia aplicación, sin servicios cartográficos de pago ni peticiones de teselas a terceros. `npm run assets:prepare` regenera recursos desde las fuentes documentadas.

## Acceso exclusivamente con Lichess

La consulta sigue siendo pública. El único acceso de usuario es `/auth/login`, mediante OAuth Authorization Code + PKCE S256 de Lichess. Client ID: `chedexpulse`; callback: `https://chedexpulse.app/auth/callback`. Lichess admite clientes públicos sin registro previo ni client secret. No se solicitan permisos adicionales.

El servidor intercambia el código, consulta `/api/account` y revoca el token de Lichess tras verificar la identidad. No se almacena el token ni se envía al navegador. La cookie de sesión contiene solo identidad y caducidad, cifradas con AES-GCM; HttpOnly, Secure, SameSite=Lax, prefijo __Host y duración de 12 horas. El estado OAuth caduca a los 10 minutos. `/api/session` nunca se cachea. Cerrar sesión exige POST y origen propio; elimina las cookies locales. La sesión es stateless y no admite revocación individual anticipada de copias de una cookie robada.

`SESSION_SECRET` es un secreto de Cloudflare generado exclusivamente en memoria. `node scripts/configure-auth.mjs` lo configura en la instalación inicial; no repetir en despliegues rutinarios, porque rotarlo invalida todas las sesiones. Nunca publicar claves en GitHub ni cargar credenciales de Turso. `PUBLIC_ORIGIN` limita el origen y callback válidos.

## Cambio de dirección

El Worker principal se llama `chedexpulse`. `wrangler.redirect.jsonc` configura un Worker mínimo en la dirección antigua: `node scripts/wrangler.mjs deploy --config wrangler.redirect.jsonc`. Las visitas públicas redirigen a Pulse; APIs antiguas y escrituras devuelven 410. No se trasladan parámetros ni rutas privadas. El nombre del repositorio GitHub se conserva para mantener enlaces existentes.

## Pendiente

Ampliación de fuentes, rendimiento por partida, comparaciones libres, favoritos y alertas. No hay pagos ni Pulse Pro activos.

Los datos privados de la aplicación de recados no se publican, migran ni borran. Se sirve exclusivamente `pulse/public/` y el Worker Pulse. Los archivos antiguos que permanezcan en la carpeta local son legado inactivo, excluido del nuevo árbol Git. No publicar `.dev.vars`, `.env`, `data/`, `.wrangler/`, `.cloudflare-build/` ni dependencias instaladas.

## Tendencias e índices operativos · v1.2

`npm run data:collect` descarga y verifica trece listas estándar FIDE consecutivas, selecciona top 100 activos, top 50 mujeres activas, top 100 activos de hasta 20 años por año de nacimiento y el catálogo Wikipedia enlazado mediante Wikidata P1440. Guarda una instantánea con la cohorte, series mensuales, agregados de todas las federaciones, fuentes, SHA-256 y fechas. Los ZIP completos permanecen en `.pulse-data-cache/`, excluido de Git y del despliegue.

Performance v1.0 = Elo actual menos Elo hace doce meses, con trece listas consecutivas, al menos doce partidas en los doce periodos posteriores a la lista base y estado activo actual. Se expresa en puntos Elo. No es rendimiento por partida ni ranking mundial de progresión; se ordena únicamente la selección declarada.

Trending v1.0 = 100 × (visitas actuales − anteriores) / anteriores. Catálogo editorial de 28 artículos canónicos de Wikipedia en inglés, all-access, agent=user. Dos periodos consecutivos de siete días completos UTC, con dos días de margen de publicación. Requiere catorce días presentes y al menos cien visitas en la base. Los fallos conservan el histórico marcado, excluido del ranking.

Global v1.0 = 100 × (activos actuales − activos hace doce meses) / activos hace doce meses, con una base de al menos cien jugadores. Agrega las listas FIDE completas, no la cohorte. Puede reflejar cambios administrativos, transferencias y revisiones de la fuente; no mide toda la actividad de un país. Federación y territorio pueden diferir.

Las fichas muestran Elo, variación, edad aproximada, gráfico, valores mensuales y enlaces a cada lista. Los índices incluyen filtros de federación, edad aproximada y nivel, búsqueda y paginación. La edad utiliza únicamente año de lista menos año de nacimiento.

`.github/workflows/pulse-data.yml` ejecuta el recopilador a diario: 07:23 Madrid en invierno, 08:23 en verano; la ejecución de GitHub puede retrasarse. FIDE se reimporta al cambiar de mes o si falta alguna lista; Wikimedia se actualiza diariamente. Solo se guardan resultados validados. La actualización utiliza el GITHUB_TOKEN del repositorio con permiso de escritura de contenidos y no necesita secretos de Cloudflare ni credenciales de terceros.

`/api/analytics` consulta la instantánea pública de la rama main de GitHub, con caché de diez minutos. Si la fuente falla, sirve la copia incluida en el despliegue y lo indica. No hay que redesplegar para las actualizaciones de datos. Si la recopilación tiene más de 48 horas, la interfaz advierte de la antigüedad. Se puede auditar la versión, las fuentes y las incidencias en `/snapshots/latest.json` (copia del despliegue) o en el archivo correspondiente de GitHub (última recopilación).

Pendiente de futuras versiones: resultados y rivales por partida, cohortes ampliadas, comparación libre entre jugadores, más idiomas y fuentes de interés, registros exhaustivos de torneos, favoritos y alertas. No hay cobros activos.

## Interfaz y rendimiento · v1.3

Dominio principal: https://chedexpulse.app. La landing está en `/`; el dashboard en `/panel`; las rutas de mundo, índices y fichas utilizan History API sin fragmentos. Se reconocen los enlaces antiguos con #. El retorno OAuth utiliza `/auth/callback` en el dominio principal y termina en `/panel`.

Los desplegables son componentes propios, con búsqueda en listas largas, navegación por teclado, cierre con Escape, selección accesible y diseño Chedex. El campo select original se conserva para el estado del formulario.

Los rankings consultan `/api/analytics/summary`; los históricos individuales se cargan desde `/api/players/:id` al abrir la ficha. `/api/analytics` conserva la instantánea completa para compatibilidad. La respuesta inicial de análisis pasa de unos 687 KB a 126 KB antes de compresión (82 % menos); comprimida, de unos 77 KB a 19,5 KB (75 % menos), medido sobre la instantánea actual.

La memoria del servidor tiene límite LRU y TTL; las solicitudes simultáneas al mismo recurso comparten una única carga por instancia. Cloudflare mantiene otra capa de caché. ETag permite respuestas 304 y revalidar GitHub sin transferir de nuevo un archivo inalterado. La sesión y autenticación permanecen fuera de todas las cachés públicas.

El cliente reutiliza las solicitudes, carga MapLibre solo cuando se muestra un mapa y utiliza un catálogo geográfico ligero fuera del mapa. Los rankings se indexan y ordenan una vez por instantánea; se evitan repintados de vistas ocultas y las búsquedas se agrupan mientras se escribe.

`npm run format` ordena el código de la aplicación y `npm run format:check` verifica su formato en CI. Los recursos de terceros y archivos generados quedan excluidos. Véase `pulse/ARQUITECTURA.md` para los contratos y límites de escalabilidad actuales.
