# Licencia: GPL-3.0-or-later (decisión)

Estado: **aplicada el 2026-11-13** por decisión del usuario. Esto es un análisis técnico, no asesoría legal: si el proyecto va a ser un negocio, conviene que lo revise un abogado.

## El problema
El repositorio está como **MIT**, pero la web incluye librerías **GPL-3.0-or-later** (`chessground` para el tablero y `chessops` para las reglas). La web se sirve a los navegadores de los usuarios, es decir, se distribuye, y un programa que incluye código GPL tiene que ofrecerse entero bajo GPL con su código fuente. Un repositorio MIT no cumple eso.

## Qué usa qué (comprobado en el código)
| Parte | ¿Usa librerías GPL? | Consecuencia |
|---|---|---|
| `web/` | Sí: `chessground` y `chessops` | El conjunto de la web debe ser GPL-3.0-or-later |
| `worker/` (API) | No | Corre en el servidor y no se distribuye: la GPL no le obliga a publicar nada |
| `src/content/` (lecciones) | No, y no van dentro del JavaScript de la web (llegan por la API) | No quedan cubiertas por la GPL por ir en el bundle |
| `src/analysis`, `diagnosis`, `pedagogy` (entrenador) | Sí: `chessops` y Stockfish (GPL) | Si se distribuye (hoy solo por línea de comandos), GPL |
| Piezas `cburnett` (por defecto) | GPLv2+, compatible con GPL-3.0-or-later | Se mantienen con su atribución |

## Propuesta
1. **Licenciar todo el código del repositorio como GPL-3.0-or-later.** Es la salida más simple y honesta: es compatible con todas las librerías usadas, con las piezas permitidas de la tienda y con vender una suscripción (la GPL no prohíbe cobrar; obliga a dar el código a quien recibe el programa).
2. **Separar el contenido educativo.** En `src/content/` añadir un aviso de que los textos y ejercicios son © Chedex con todos los derechos reservados y no se licencian bajo la GPL. Es válido porque el contenido es un trabajo aparte del programa. Aviso: mientras el repositorio sea público, cualquiera puede leer las lecciones. Si el contenido es el activo del negocio, la solución real es moverlo a un repositorio privado más adelante.
3. **Los modelos de pago no cambian:** el código del servidor no tiene por qué publicarse, pero al ser todo el repositorio GPL se ofrece con el resto. Si se prefiere mantener el servidor propietario, habría que sacarlo del repositorio público.

## Cambios concretos si se aprueba
- `LICENSE`: texto completo de la GPL-3.0 con «Copyright (c) 2026 Andres-L1».
- `package.json`: `"license": "GPL-3.0-or-later"`.
- `README.md`: sección de licencia actualizada y enlace a los avisos.
- `THIRD_PARTY_NOTICES.md` (nuevo): atribuciones y licencias de `chessground`, `chessops`, Stockfish, `hono`, `react`, la fuente DM Sans (OFL, ya incluida) y las piezas usadas.
- `src/content/README.md` (nuevo): aviso de contenido reservado.
- Cabecera breve en los archivos principales, opcional.

## Alternativa
Sustituir `chessground` y `chessops` por código propio (un tablero y un motor de reglas). Permitiría mantener MIT, pero es un trabajo grande, con riesgo de errores en las reglas del ajedrez, y no resuelve Stockfish ni las piezas GPL del entrenador. No lo recomiendo.
