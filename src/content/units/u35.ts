import type { Unit } from '../schema.js';

/**
 * Unidad 35 · Prevenir antes de atacar (avanzado, 1400-1700 Elo).
 * Pendiente de validación de profesores. Posiciones CONSTRUIDAS (partidas de motor de poca profundidad, filtradas por motor);
 * no proceden de partidas reales ni de puzles. Verificación: Stockfish 16, profundidad 18 (`npx tsx scripts/verify-u35.mts`):
 * la solución es la mejor jugada y la segunda queda >= 100 cp por debajo, la amenaza del rival (su mejor jugada si el alumno pasara)
 * es real (>= 100 cp) y tras la solución ya no funciona; en las lecciones con jugada tentadora, esta queda >= 100 cp peor.
 * Los textos solo afirman lo que esa comprobación confirma. Código en test/content/unitsU35.test.ts.
 */
export const unit: Unit = {
  id: 'u35',
  order: 28,
  title: 'Prevenir antes de atacar',
  description:
    'Jugadas profilácticas: quitar al rival su mejor idea antes de que la ejecute, detectar su amenaza y saber cuándo la mejor defensa es una jugada tranquila.',
  level: 'advanced',
  requires: ['u11'],
  lessons: [
    {
      id: "u35.l01",
      unitId: 'u35',
      title: "La jugada profiláctica",
      objective:
        "Reconocer la mejor idea del rival y quitársela con una jugada tranquila antes de que la ejecute.",
      conceptIds: ['tactics.defensive_move'],
      intro:
        "Una jugada profiláctica no ataca nada: impide la mejor idea del rival antes de que la juegue. Para encontrarla, haz un truco mental: imagina que pasas el turno y pregúntate qué jugaría el rival. Esa jugada es su amenaza. Después busca la jugada tranquila que la deja sin efecto. En estas posiciones el motor confirma que, si el rival pudiera jugar su idea, saldría ganando al menos un peón de ventaja, y que una sola jugada tuya lo evita.",
      explanation: [
        {
          // construida, verificada con Stockfish d18
          fen: "2r3k1/1b3pp1/1p2pn1p/6q1/1RNp4/3NPP2/6P1/2Q2RK1 b - - 0 27",
          text: "El rival amenaza e4: si pudiera jugarla, el motor vería tu posición al menos 3 peones peor. La jugada Nd5 lo evita: esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          squares: ["d5", "e4"],
          arrows: [
            ["f6", "d5"],
            ["e3", "e4"],
          ],
        },
        {
          // construida, verificada con Stockfish d18
          fen: "r7/1pknRB2/2p3pP/p4p2/3P4/P7/1P3P2/6K1 b - - 0 33",
          text: "El rival amenaza h7: si pudiera jugarla, el motor vería tu posición al menos 2 peones peor. La jugada Rh8 lo evita: esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          squares: ["h8", "h7"],
          arrows: [
            ["a8", "h8"],
            ["h6", "h7"],
          ],
        },
      ],
      practice: [
        {
          // construida, verificada con Stockfish d18
          fen: "4k2r/5pp1/3Qnn2/6Bp/2q5/5N2/1P3PPP/5RK1 b k - 0 22",
          prompt: "Juegan negras. Quita al rival su mejor idea con una jugada tranquila.",
          solutionUci: ["c4c7"],
          hint: "Imagina que pasas el turno: ¿qué jugaría el rival? Busca una jugada tranquila que le quite esa idea.",
          explanationCorrect:
            "Correcto: Qc7. El rival amenazaba Qb8+ (la dama): si pudiera jugarla, el motor vería tu posición al menos 5 peones peor. Con Qc7, esa jugada del rival ya no se puede hacer. Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada deja la idea del rival en pie. Pasa el turno mentalmente, mira qué jugaría el rival y busca cómo quitársela.",
        },
        {
          // construida, verificada con Stockfish d18
          fen: "r5nr/ppp4p/3k4/3p2Bp/3P4/2P2R2/P1P3PP/4R1K1 b - - 0 16",
          prompt: "Juegan negras. Quita al rival su mejor idea con una jugada tranquila.",
          solutionUci: ["h7h6"],
          hint: "Imagina que pasas el turno: ¿qué jugaría el rival? Busca una jugada tranquila que le quite esa idea.",
          explanationCorrect:
            "Correcto: h6. El rival amenazaba Rf7 (una torre): si pudiera jugarla, el motor vería tu posición al menos 3 peones peor. Con h6, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada deja la idea del rival en pie. Pasa el turno mentalmente, mira qué jugaría el rival y busca cómo quitársela.",
        },
        {
          // construida, verificada con Stockfish d18
          fen: "2rr2k1/pp1q1pp1/8/3bRN1p/P1P5/1P5P/2Q3P1/5RK1 b - - 0 29",
          prompt: "Juegan negras. Quita al rival su mejor idea con una jugada tranquila.",
          solutionUci: ["d5e6"],
          hint: "Imagina que pasas el turno: ¿qué jugaría el rival? Busca una jugada tranquila que le quite esa idea.",
          explanationCorrect:
            "Correcto: Be6. El rival amenazaba Ne7+ (un caballo): si pudiera jugarla, el motor vería tu posición al menos 4 peones peor. Con Be6, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada deja la idea del rival en pie. Pasa el turno mentalmente, mira qué jugaría el rival y busca cómo quitársela.",
        },
      ],
      evaluation: [
        {
          // construida, verificada con Stockfish d18
          fen: "2r3k1/pp1nn3/1q2R2Q/7p/3P4/5NP1/PPr2PKp/5R2 b - - 0 28",
          prompt: "Juegan negras. Quita al rival su mejor idea con una jugada tranquila.",
          solutionUci: ["b6b5"],
          hint: "Imagina que pasas el turno: ¿qué jugaría el rival? Busca una jugada tranquila que le quite esa idea.",
          explanationCorrect:
            "Correcto: Qb5. El rival amenazaba Qg5+ (la dama): si pudiera jugarla, el motor vería tu posición al menos 14 peones peor. Con Qb5, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada deja la idea del rival en pie. Pasa el turno mentalmente, mira qué jugaría el rival y busca cómo quitársela.",
        },
        {
          // construida, verificada con Stockfish d18
          fen: "b1rr4/4kppp/4pN2/1B6/1p1b1P2/1P5P/P4P1R/3QK3 w - - 1 25",
          prompt: "Juegan blancas. Quita al rival su mejor idea con una jugada tranquila.",
          solutionUci: ["f6d7"],
          hint: "Imagina que pasas el turno: ¿qué jugaría el rival? Busca una jugada tranquila que le quite esa idea.",
          explanationCorrect:
            "Correcto: Nd7. El rival amenazaba Bc3+ (un alfil): si pudiera jugarla, el motor vería tu posición al menos 5 peones peor. Con Nd7, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada deja la idea del rival en pie. Pasa el turno mentalmente, mira qué jugaría el rival y busca cómo quitársela.",
        },
        {
          // construida, verificada con Stockfish d18
          fen: "r6r/pb3kp1/2p1pp2/8/Q6N/1P1q4/5K1P/2R3R1 w - - 0 34",
          prompt: "Juegan blancas. Quita al rival su mejor idea con una jugada tranquila.",
          solutionUci: ["g1d1"],
          hint: "Imagina que pasas el turno: ¿qué jugaría el rival? Busca una jugada tranquila que le quite esa idea.",
          explanationCorrect:
            "Correcto: Rgd1. El rival amenazaba Qd2+ (la dama): si pudiera jugarla, el motor vería tu posición al menos 8 peones peor. Con Rgd1, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada deja la idea del rival en pie. Pasa el turno mentalmente, mira qué jugaría el rival y busca cómo quitársela.",
        },
      ],
    },
    {
      id: "u35.l02",
      unitId: 'u35',
      title: "Detectar la amenaza",
      objective:
        "Descubrir qué quiere hacer el rival (captura, jaque o ataque) antes de elegir tu jugada.",
      conceptIds: ['tactics.defensive_move'],
      intro:
        "Antes de mover, mira la posición desde el lado del rival: qué piezas suyas pueden capturar, dar jaque o atacar algo tuyo. La amenaza no siempre es un jaque; muchas veces es una captura que aparece si tú haces otra cosa. En estos ejercicios el motor confirma cuál es la mejor jugada del rival si le dejas el turno, cuánto vale, y que solo una jugada tuya la neutraliza.",
      explanation: [
        {
          // construida, verificada con Stockfish d18
          fen: "r6k/1p4p1/5n2/6Np/3B3P/8/PPn2PP1/4R1K1 w - - 0 29",
          text: "El rival amenaza Nxe1: si pudiera jugarla, el motor vería tu posición al menos 3 peones peor. La jugada Rd1 lo evita: esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          squares: ["d1", "e1"],
          arrows: [
            ["e1", "d1"],
            ["c2", "e1"],
          ],
        },
        {
          // construida, verificada con Stockfish d18
          fen: "8/p1p5/1p2R1b1/7p/2P1Pk2/PP1r4/3N1P2/4K3 b - - 2 39",
          text: "El rival amenaza Rxg6: si pudiera jugarla, el motor vería tu posición al menos 3 peones peor. La jugada Rd6 lo evita: esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          squares: ["d6", "g6"],
          arrows: [
            ["d3", "d6"],
            ["e6", "g6"],
          ],
        },
      ],
      practice: [
        {
          // construida, verificada con Stockfish d18
          fen: "5rk1/p4p2/5r1p/4R3/3n1B2/2RP4/1P4PP/6K1 w - - 1 29",
          prompt: "Juegan blancas. Hay una amenaza del rival: detéctala y evítala.",
          solutionUci: ["f4g3"],
          hint: "Mira la posición con los ojos del rival: ¿qué haría si le tocara a él? Responde a esa amenaza.",
          explanationCorrect:
            "Correcto: Bg3. El rival amenazaba Rxf4 (una torre): si pudiera jugarla, el motor vería tu posición al menos 2 peones peor. Con Bg3, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Pasa el turno mentalmente y mira cuál sería su mejor jugada.",
        },
        {
          // construida, verificada con Stockfish d18
          fen: "1r6/4p1kp/1n1r1pp1/3P4/1PpR2PP/P1P1b3/2K1B3/3R4 w - - 0 34",
          prompt: "Juegan blancas. Hay una amenaza del rival: detéctala y evítala.",
          solutionUci: ["d4e4"],
          hint: "Mira la posición con los ojos del rival: ¿qué haría si le tocara a él? Responde a esa amenaza.",
          explanationCorrect:
            "Correcto: Re4. El rival amenazaba Bxd4 (un alfil): si pudiera jugarla, el motor vería tu posición al menos 3 peones peor. Con Re4, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Pasa el turno mentalmente y mira cuál sería su mejor jugada.",
        },
        {
          // construida, verificada con Stockfish d18
          fen: "5rk1/p3Bpp1/4b3/2n4p/2pNp2P/P5P1/5P2/1R4K1 b - - 0 27",
          prompt: "Juegan negras. Hay una amenaza del rival: detéctala y evítala.",
          solutionUci: ["f8c8"],
          hint: "Mira la posición con los ojos del rival: ¿qué haría si le tocara a él? Responde a esa amenaza.",
          explanationCorrect:
            "Correcto: Rc8. El rival amenazaba Bxc5 (un alfil): si pudiera jugarla, el motor vería tu posición al menos 3 peones peor. Con Rc8, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Pasa el turno mentalmente y mira cuál sería su mejor jugada.",
        },
      ],
      evaluation: [
        {
          // construida, verificada con Stockfish d18
          fen: "5r1r/1p1k4/p2N2p1/3K1pPp/4P3/P6B/1bP5/R7 w - - 0 29",
          prompt: "Juegan blancas. Hay una amenaza del rival: detéctala y evítala.",
          solutionUci: ["a1b1"],
          hint: "Mira la posición con los ojos del rival: ¿qué haría si le tocara a él? Responde a esa amenaza.",
          explanationCorrect:
            "Correcto: Rb1. El rival amenazaba Bxa1 (un alfil): si pudiera jugarla, el motor vería tu posición al menos 5 peones peor. Con Rb1, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Pasa el turno mentalmente y mira cuál sería su mejor jugada.",
        },
        {
          // construida, verificada con Stockfish d18
          fen: "r2r3k/1p4p1/3p3p/3Pp3/p1P1P1P1/4N1RP/1nP4K/1R6 b - - 1 29",
          prompt: "Juegan negras. Hay una amenaza del rival: detéctala y evítala.",
          solutionUci: ["a4a3"],
          hint: "Mira la posición con los ojos del rival: ¿qué haría si le tocara a él? Responde a esa amenaza.",
          explanationCorrect:
            "Correcto: a3. El rival amenazaba Rxb2 (una torre): si pudiera jugarla, el motor vería tu posición al menos 3 peones peor. Con a3, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Pasa el turno mentalmente y mira cuál sería su mejor jugada.",
        },
        {
          // construida, verificada con Stockfish d18
          fen: "5rk1/p1Nr4/1p5p/2p1p1p1/8/PPP1RP1P/8/R5K1 w - - 1 31",
          prompt: "Juegan blancas. Hay una amenaza del rival: detéctala y evítala.",
          solutionUci: ["c7a6"],
          hint: "Mira la posición con los ojos del rival: ¿qué haría si le tocara a él? Responde a esa amenaza.",
          explanationCorrect:
            "Correcto: Na6. El rival amenazaba Rxc7 (una torre): si pudiera jugarla, el motor vería tu posición al menos 2 peones peor. Con Na6, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Pasa el turno mentalmente y mira cuál sería su mejor jugada.",
        },
      ],
    },
    {
      id: "u35.l03",
      unitId: 'u35',
      title: "Defender con una jugada tranquila",
      objective:
        "Elegir una jugada tranquila que frena la amenaza del rival cuando hay un jaque o una captura que tienta.",
      conceptIds: ['tactics.defensive_move'],
      intro:
        "A veces hay un jaque o una captura a mano, pero el rival también tiene una amenaza mayor. Si te lanzas, la amenaza sigue ahí. En estas posiciones la jugada correcta es tranquila: defiende, mueve o cambia de sitio una pieza. Antes de atacar, pregúntate qué jugaría el rival si pasaras. En todos los ejercicios el motor confirma que la jugada tentadora queda al menos un peón por detrás de la jugada tranquila.",
      explanation: [
        {
          // construida, verificada con Stockfish d18
          fen: "2n3k1/p4pp1/1pb3rp/1N1R4/P2Pq3/6PP/3B1P2/2Q3K1 w - - 1 37",
          text: "El rival amenaza Qxd5: si pudiera jugarla, el motor vería tu posición al menos 7 peones peor. La jugada Nc3 lo evita: esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          squares: ["c3", "d5"],
          arrows: [
            ["b5", "c3"],
            ["e4", "d5"],
          ],
        },
        {
          // construida, verificada con Stockfish d18
          fen: "5rk1/2p3b1/p6p/npqN1pp1/P7/1BP1R3/1P4P1/2K2Q2 w - - 2 29",
          text: "El rival amenaza Nxb3+: si pudiera jugarla, el motor vería tu posición al menos 6 peones peor. La jugada Ba2 lo evita: esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          squares: ["a2", "b3"],
          arrows: [
            ["b3", "a2"],
            ["a5", "b3"],
          ],
        },
      ],
      practice: [
        {
          // construida, verificada con Stockfish d18
          fen: "3R4/8/2pBk1p1/p3p3/4R3/2P2P2/2PK1bPP/5q2 b - - 3 33",
          prompt: "Juegan negras. Hay un jaque o una captura que tienta, pero el rival amenaza algo.",
          solutionUci: ["f2d4"],
          hint: "Hay una jugada que tienta, pero mira primero qué haría el rival si pasaras el turno.",
          explanationCorrect:
            "Correcto: Bd4. El rival amenazaba Rxe5+ (una torre): si pudiera jugarla, el motor vería tu posición al menos 6 peones peor. Con Bd4, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Antes de atacar, mira qué jugaría él si le tocara.",
          wrongByMove: { "f1g2": "Es tentadora, pero el motor la valora al menos un peón por debajo de la jugada correcta. Mira antes qué haría el rival si pasaras." },
        },
        {
          // construida, verificada con Stockfish d18
          fen: "4r3/5pbk/p1p4p/5p1q/P4P2/2P4P/1P2B1PB/4QK2 b - - 4 37",
          prompt: "Juegan negras. Hay un jaque o una captura que tienta, pero el rival amenaza algo.",
          solutionUci: ["h5g6"],
          hint: "Hay una jugada que tienta, pero mira primero qué haría el rival si pasaras el turno.",
          explanationCorrect:
            "Correcto: Qg6. El rival amenazaba Bxh5 (un alfil): si pudiera jugarla, el motor vería tu posición al menos 5 peones peor. Con Qg6, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Antes de atacar, mira qué jugaría él si le tocara.",
          wrongByMove: { "h5e2": "Es tentadora, pero el motor la valora al menos un peón por debajo de la jugada correcta. Mira antes qué haría el rival si pasaras." },
        },
        {
          // construida, verificada con Stockfish d18
          fen: "2b2rk1/2p2ppp/6n1/4p3/2B1P3/5q2/PQ3P1P/R3K2R w KQ - 0 22",
          prompt: "Juegan blancas. Hay un jaque o una captura que tienta, pero el rival amenaza algo.",
          solutionUci: ["h1g1"],
          hint: "Hay una jugada que tienta, pero mira primero qué haría el rival si pasaras el turno.",
          explanationCorrect:
            "Correcto: Rg1. El rival amenazaba Qxh1+ (la dama): si pudiera jugarla, el motor vería tu posición al menos 7 peones peor. Con Rg1, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Antes de atacar, mira qué jugaría él si le tocara.",
          wrongByMove: { "c4f7": "Es tentadora, pero el motor la valora al menos un peón por debajo de la jugada correcta. Mira antes qué haría el rival si pasaras." },
        },
      ],
      evaluation: [
        {
          // construida, verificada con Stockfish d18
          fen: "Q4r2/4bppk/bqP1p3/1p1p4/P7/6PP/1P3N2/R1R4K w - - 0 24",
          prompt: "Juegan blancas. Hay un jaque o una captura que tienta, pero el rival amenaza algo.",
          solutionUci: ["a4a5"],
          hint: "Hay una jugada que tienta, pero mira primero qué haría el rival si pasaras el turno.",
          explanationCorrect:
            "Correcto: a5. El rival amenazaba Rxa8 (una torre): si pudiera jugarla, el motor vería tu posición al menos 6 peones peor. Con a5, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Antes de atacar, mira qué jugaría él si le tocara.",
          wrongByMove: { "a8f8": "Es tentadora, pero el motor la valora al menos un peón por debajo de la jugada correcta. Mira antes qué haría el rival si pasaras." },
        },
        {
          // construida, verificada con Stockfish d18
          fen: "r5k1/3b2p1/3Rp3/p2p2Np/P2r4/1P5P/5PP1/2R3K1 b - - 1 34",
          prompt: "Juegan negras. Hay un jaque o una captura que tienta, pero el rival amenaza algo.",
          solutionUci: ["d7e8"],
          hint: "Hay una jugada que tienta, pero mira primero qué haría el rival si pasaras el turno.",
          explanationCorrect:
            "Correcto: Be8. El rival amenazaba Rxd7 (una torre): si pudiera jugarla, el motor vería tu posición al menos 4 peones peor. Con Be8, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Antes de atacar, mira qué jugaría él si le tocara.",
          wrongByMove: { "d7a4": "Es tentadora, pero el motor la valora al menos un peón por debajo de la jugada correcta. Mira antes qué haría el rival si pasaras." },
        },
        {
          // construida, verificada con Stockfish d18
          fen: "r6k/7p/1p3r1P/2pP4/5B2/6p1/q3RPP1/2Q2K2 b - - 1 33",
          prompt: "Juegan negras. Hay un jaque o una captura que tienta, pero el rival amenaza algo.",
          solutionUci: ["a2a4"],
          hint: "Hay una jugada que tienta, pero mira primero qué haría el rival si pasaras el turno.",
          explanationCorrect:
            "Correcto: Qa4. El rival amenazaba Be5 (un alfil): si pudiera jugarla, el motor vería tu posición al menos 5 peones peor. Con Qa4, esa jugada del rival ya no mejora su posición (el motor la ve a menos de medio peón de diferencia). Todas las demás jugadas quedan al menos un peón por debajo.",
          explanationWrong:
            "Esa jugada no frena la amenaza del rival. Antes de atacar, mira qué jugaría él si le tocara.",
          wrongByMove: { "a2e2": "Es tentadora, pero el motor la valora al menos un peón por debajo de la jugada correcta. Mira antes qué haría el rival si pasaras." },
        },
      ],
    },
  ],
};
