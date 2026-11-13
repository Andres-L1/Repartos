# Chedex Pulse

Plataforma de entrenamiento de ajedrez para aprender con un camino claro, entender los errores y entrenar con un propósito. Web: <https://chedexpulse.app>

- **Ruta de aprendizaje** por unidades y lecciones (de 0 a ~800 Elo en esta primera versión), con lecciones interactivas sobre tablero, práctica con corrección y evaluación.
- **Acceso con Lichess** (OAuth PKCE sin permisos). Se usa tu Elo de partidas rápidas y clásicas solo para recomendarte por dónde empezar.
- **Entrenador pedagógico** (prototipo): analiza partidas PGN con Stockfish, diagnostica errores tácticos verificados y propone ejercicios.
- Notación de jugadas como en Lichess (N, B, R, Q, K).

Estado: beta abierta, sin pagos. Contenido verificado por código; la revisión por profesores de ajedrez está pendiente.

## Estructura

| Carpeta | Contenido |
|---|---|
| `web/` | Aplicación React + Vite (tablero con chessground, legalidad con chessops) |
| `worker/` | API en Cloudflare Workers (Hono) con D1 y acceso con Lichess |
| `migrations/` | Migraciones D1 (solo `CREATE TABLE IF NOT EXISTS`, tablas `cp_*`) |
| `src/content/` | Unidades y lecciones (tipadas y verificadas por tests) |
| `src/analysis`, `src/diagnosis`, `src/pedagogy` | Capas del entrenador: análisis, diagnóstico y explicación |
| `samples/`, `test/` | Partidas de ejemplo y pruebas |
| `docs/` | Diseño de la plataforma e informe de validación |
| `pulse/legacy-redirect.mjs` | Redirección del dominio anterior |

## Desarrollo

Requiere Node.js 22 o superior.

```bash
npm install
cp .dev.vars.example .dev.vars   # y rellena SESSION_SECRET
npm run dev                      # web + Worker local en http://localhost:8787
npm test
npm run typecheck
```

Entrenador de partidas por línea de comandos:

```bash
npm run chedex -- samples/blunder.pgn --level initiation
```

## Despliegue

Pasos en [docs/phase2-design.md](docs/phase2-design.md). Resumen: secreto `SESSION_SECRET` con `wrangler secret put`, migraciones D1 con `wrangler d1 migrations apply PULSE_DB --remote` y `npm run build && npx wrangler deploy`.

## Licencia

El código es software libre bajo la **GNU GPL 3.0 o posterior** (ver [LICENSE](LICENSE) y [NOTICE.md](NOTICE.md)). Las lecciones y ejercicios de `src/content/` son © Chedex, todos los derechos reservados (ver [src/content/README.md](src/content/README.md)). Atribuciones de terceros en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
