# Avisos de terceros

Chedex Pulse usa el software y los materiales siguientes. Cada uno conserva su licencia.

| Componente | Autoría | Licencia | Uso |
|---|---|---|---|
| chessground | Thibault Duplessis y colaboradores de Lichess | GPL-3.0-or-later | Tablero de la web |
| chessops | Niklas Fiekas | GPL-3.0-or-later | Reglas del ajedrez, PGN y análisis |
| stockfish (npm, Stockfish.js) | Nathan Rugg; proyecto Stockfish | GPL-3.0 | Motor de análisis del entrenador de partidas |
| Piezas «cburnett» (incluidas en chessground) | Colin M.L. Burnett | GPLv2+ | Juego de piezas por defecto |
| Sonidos «sfx» de Lichess (`web/public/sound/`, ver `LICENSE.md` allí) | Enigmahack | AGPL-3.0-or-later | Sonidos del tablero y de fin de lección |
| chess-openings (`src/openings/openings.json`, generado con `scripts/build-openings.mts`) | Lichess y colaboradores (https://github.com/lichess-org/chess-openings) | CC0 1.0 Universal (dominio público; su README: «As a collection of facts, this data set is in the public domain», y lo que pudiera tener copyright se libera bajo CC0) | Nombres y códigos ECO de las aperturas |
| hono | Yusuke Wada | MIT | Servidor de la API |
| react, react-dom | Meta Platforms, Inc. y colaboradores | MIT | Interfaz web |
| DM Sans | Los autores del proyecto DM Sans | SIL Open Font License 1.1 (`web/public/fonts/OFL.txt`) | Tipografía |

Los textos completos de cada licencia están en el paquete correspondiente de `node_modules` y en los
sitios de cada proyecto. Las herramientas de desarrollo (por ejemplo vite, vitest, typescript, wrangler)
no forman parte del programa distribuido.

## Material propio de Chedex

Los temas de tablero de la tienda, el juego de piezas «Geométricas» (`web/public/pieces/geo/`), los
iconos y la ficha de Chedex son creación propia y se publican con el resto del código bajo GPL-3.0-or-later.

Los diez juegos ilustrados (`web/public/pieces/{catedral,neon,olimpo,plano,pixel,samurai,egipto,vikingo,sombras,cosmos}/`)
son material propio: ilustraciones generadas con IA por el equipo y recortadas con `scripts/cut-pieces.py`.
**No están bajo la GPL**: son © Chedex, todos los derechos reservados (ver `web/public/pieces/LICENCIA-ILUSTRADOS.md`).
El código que las carga sí es GPL-3.0-or-later; las imágenes son datos y no forman parte del programa.
