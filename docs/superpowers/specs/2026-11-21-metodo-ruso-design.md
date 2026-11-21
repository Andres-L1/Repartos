# Método ruso: nueva parte inicial de la ruta — diseño

Fecha: 2026-11-21. Decisión del usuario: la parte inicial actual (u01 a u06) se sustituye por el método ruso. El resto de la ruta (u07 en adelante) se conserva.

## Orden pedagógico (decisión del usuario)

1. El tablero: coordenadas, filas, columnas, diagonales, casillas claras y oscuras, colocación inicial.
2. El rey: cómo se mueve y qué no puede hacer.
3. La torre: cómo se mueve y captura.
4. El jaque: qué pasa cuando dan jaque al rey y las tres respuestas (mover el rey, bloquear, capturar a la pieza que da jaque), ya conociendo rey y torre.
5. El enroque corto y el enroque largo (condiciones y cuándo no se puede).
6. El jaque mate: mate con una torre y mate de las dos torres (mate de escalera).
7. El alfil: movimiento, captura, casillas de un solo color.
8. Mate con dos alfiles apoyados por el rey (rey y dos alfiles contra rey: es victoria forzada; rey y un alfil solos son tablas).
9. La dama: movimiento y captura, y las casillas «bomba».
10. Casillas «bomba» (casillas junto al rey rival donde la dama da mate si está protegida y ahoga o regala la dama si no lo está), el rey ahogado y el mate de dama correspondiente.
11. El caballo: movimiento en L y salto.
12. El peón: avance, doble paso inicial, captura en diagonal.
13. Los 4 conceptos básicos: controlar el centro, desarrollar las piezas, poner al rey a salvo, conectar las torres.
14. Peón al paso, coronación y regla del cuadrado.

## Unidades nuevas (ids sin colisión con las existentes u07 a u16)

| id | order | nivel | Título | Lecciones sugeridas |
|---|---|---|---|---|
| u20 | 1 | beginner | El tablero y las coordenadas | filas y columnas; casillas y colores; diagonales; posición inicial de las piezas |
| u21 | 2 | beginner | El rey | movimiento; captura y casillas prohibidas; el rey y el rey rival |
| u22 | 3 | beginner | La torre | movimiento; captura; torre y rey juntos |
| u23 | 4 | beginner | El jaque | qué es un jaque; mover el rey; bloquear y capturar |
| u24 | 5 | beginner | El enroque | enroque corto; enroque largo; cuándo no se puede |
| u25 | 6 | beginner | Jaque mate con torres | qué es el jaque mate; mate con una torre; mate de las dos torres |
| u26 | 7 | beginner | El alfil | movimiento; captura; alfil y casillas de su color |
| u27 | 8 | beginner | Mate con dos alfiles y el rey | colocación de los alfiles; el rey apoya; la técnica completa |
| u28 | 9 | beginner | La dama | movimiento; captura; dama frente a torre y alfil |
| u29 | 10 | beginner | Casillas bomba y rey ahogado | casillas bomba; el rey ahogado; mate de dama |
| u30 | 11 | beginner | El caballo | movimiento en L; salto y captura; caballo y casillas |
| u31 | 12 | beginner | El peón | avance y doble paso; captura en diagonal; peones bloqueados |
| u32 | 13 | initiation | Cuatro ideas básicas | controlar el centro; desarrollar piezas; rey seguro; conectar las torres |
| u33 | 14 | initiation | Al paso, coronación y regla del cuadrado | peón al paso; coronación; regla del cuadrado |

Tras u33 sigue u07 (se le cambia `requires` a u33). Los `order` de las unidades existentes se desplazan después de 14.

## Estilo del método ruso

- Cada concepto se aprende **haciendo**: poca teoría, mucha práctica sobre el tablero, ejercicios cortos y repetidos.
- Una sola idea por paso; ejemplos con pocas piezas (rey, torre, un rival); progresión por dificultad.
- Español claro, frases cortas, sin emojis, sin culpar. Adecuado a principiantes (también niños): nada de jerga sin explicar.
- Notación de Lichess con piezas nombradas en palabras (ya unificada).
- Política de avisos (docs/estado-proyecto.md): pista tras el primer fallo sin nombrar la jugada solución; solución tras acertar, segundo fallo o «Muéstramelo».

## Verificación (todo por código, sin inventar)

- Movimientos y capturas: legalidad con chessops; las casillas destino de cada pieza y las casillas atacadas se calculan con chessops, no a mano.
- Jaque: qué respuestas legales existen (mover, bloquear, capturar) con chessops.
- Enroque: legalidad y condiciones con chessops.
- Mates con torres y mates de dama: mate en 1 con chessops; líneas completas hasta el mate con la tablebase de Lichess (https://tablebase.lichess.ovh/standard?fen=...; caché en test/fixtures/tablebase; espera entre peticiones; reintento ante 429; solo FEN de ejercicios).
- Rey y dos alfiles contra rey: la técnica se verifica con la tablebase (DTM mínimo) hasta el mate.
- Ahogado: `isStalemate` de chessops; casillas bomba: hechos comprobados (dama protegida/no protegida junto al rey, casillas libres del rey).
- Regla del cuadrado: se verifica con la tablebase y con chessops (el rey alcanza o no alcanza al peón).
- Los 4 conceptos: solo afirmaciones comprobables (casillas controladas del centro, piezas desarrolladas, rey enrocado, torres conectadas sin piezas entre ellas). La calidad pedagógica la valida un profesor.
- Todo el contenido nuevo queda «pendiente de validación de profesores».
