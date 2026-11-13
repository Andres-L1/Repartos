import type { Exercise } from '../types.js';

/**
 * Banco de ejercicios (Capa 4). Cada solución está verificada en test/pedagogy
 * con chessops: legalidad, unicidad (búsqueda de material) y, en mates, jaque mate real.
 */
export const EXERCISES: Exercise[] = [
  // ───────────── Piezas colgadas ─────────────
  {
    id: 'ex.hanging.01',
    conceptId: 'tactics.hanging_piece',
    level: 'beginner',
    fen: '4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1',
    prompt: 'Juegan blancas. La dama negra no está protegida por ninguna pieza. Captúrala.',
    solutionUci: ['d1d5'],
    hint: 'Tu torre y la dama se miran por la columna d.',
  },
  {
    id: 'ex.hanging.02',
    conceptId: 'tactics.hanging_piece',
    level: 'beginner',
    fen: '4k3/8/8/8/3n4/8/8/3RK3 w - - 0 1',
    prompt: 'Juegan blancas. Hay una pieza negra que nadie protege. Gana material.',
    solutionUci: ['d1d4'],
    hint: 'Busca una pieza negra que tu torre ataque y que no tenga defensor.',
  },
  {
    id: 'ex.hanging.03',
    conceptId: 'tactics.hanging_piece',
    level: 'initiation',
    fen: '4k3/8/5n2/8/8/2B5/8/4K3 w - - 0 1',
    prompt: 'Juegan blancas. ¿Qué pieza negra está sin defensa y a tu alcance?',
    solutionUci: ['c3f6'],
    hint: 'Sigue la diagonal de tu alfil.',
  },
  {
    id: 'ex.hanging.04',
    conceptId: 'tactics.hanging_piece',
    level: 'basic',
    fen: 'r3k3/1p6/2n5/8/6b1/8/8/3QK3 w - - 0 1',
    prompt:
      'Juegan blancas. El caballo está protegido por un peón, pero hay otra pieza negra sin protección. Captúrala.',
    solutionUci: ['d1g4'],
    hint: 'Comprueba pieza por pieza si tiene algún defensor antes de capturar.',
  },
  {
    id: 'ex.hanging.05',
    conceptId: 'tactics.hanging_piece',
    level: 'intermediate',
    fen: '6k1/5ppp/8/8/3b4/8/5PPP/3R2K1 w - - 0 1',
    prompt:
      'Juegan blancas. El alfil negro está bien situado, pero ¿lo protege alguna pieza? Aprovecha lo que encuentres.',
    solutionUci: ['d1d4'],
    hint: 'Ninguna pieza ni peón negro vigila la casilla d4.',
  },

  // ───────────── Intercambios desfavorables ─────────────
  {
    id: 'ex.exchange.01',
    conceptId: 'tactics.bad_exchange',
    level: 'beginner',
    fen: '3rk3/8/8/3r4/4P3/8/8/4K3 w - - 0 1',
    prompt:
      'Juegan blancas. La torre negra de d5 está protegida, pero tu peón vale mucho menos que ella. Haz la captura que sale rentable.',
    solutionUci: ['e4d5'],
    hint: 'Un peón por una torre es un gran negocio, aunque te recapturen el peón.',
  },
  {
    id: 'ex.exchange.02',
    conceptId: 'tactics.bad_exchange',
    level: 'initiation',
    fen: '3rk3/8/8/3r4/8/2N5/8/4K3 w - - 0 1',
    prompt:
      'Juegan blancas. La torre de d5 está protegida por la otra torre. ¿Compensa capturarla con el caballo?',
    solutionUci: ['c3d5'],
    hint: 'Compara lo que ganas (una torre) con lo que pierdes si recapturan (un caballo).',
  },
  {
    id: 'ex.exchange.03',
    conceptId: 'tactics.bad_exchange',
    level: 'basic',
    fen: 'r2qk3/p7/8/3n4/4P3/8/8/R3K3 w - - 0 1',
    prompt:
      'Juegan blancas. Capturar el peón de a7 con la torre parece fácil. ¿Es la mejor captura disponible?',
    solutionUci: ['e4d5'],
    hint: 'Antes de capturar, cuenta quién protege la casilla y qué vale cada pieza que se cambia.',
  },
  {
    id: 'ex.exchange.04',
    conceptId: 'tactics.bad_exchange',
    level: 'intermediate',
    fen: '4k3/8/2p5/3b2n1/8/8/8/2BR2K1 w - - 0 1',
    prompt:
      'Juegan blancas. Torre por alfil protegido sería un mal cambio. ¿Qué captura sí gana material limpio?',
    solutionUci: ['c1g5'],
    hint: 'Hay una pieza negra que nadie protege y que tu alfil ya ve.',
  },

  // ───────────── Horquillas ─────────────
  {
    id: 'ex.fork.01',
    conceptId: 'tactics.fork',
    level: 'beginner',
    fen: '4k3/8/8/3n1n2/8/4P3/8/4K3 w - - 0 1',
    prompt: 'Juegan blancas. Con un solo movimiento de peón puedes atacar los dos caballos a la vez.',
    solutionUci: ['e3e4'],
    hint: 'Los peones capturan en diagonal hacia delante.',
  },
  {
    id: 'ex.fork.02',
    conceptId: 'tactics.fork',
    level: 'initiation',
    fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1',
    prompt: 'Juegan blancas. Un salto de caballo da jaque y ataca además otra pieza. Encuéntralo.',
    solutionUci: ['d5c7'],
    hint: 'Busca una casilla desde la que el caballo vea al rey y a la torre.',
  },
  {
    id: 'ex.fork.03',
    conceptId: 'tactics.fork',
    level: 'basic',
    fen: '6k1/8/8/8/8/8/2KQ4/7r w - - 0 1',
    prompt: 'Juegan blancas. Da jaque con la dama de modo que también ataque la torre.',
    solutionUci: ['d2d5'],
    hint: 'Desde el centro la dama alcanza el rey por una diagonal y la torre por otra.',
  },
  {
    id: 'ex.fork.04',
    conceptId: 'tactics.fork',
    level: 'intermediate',
    fen: '6k1/3q4/8/8/4N3/8/8/4K3 w - - 0 1',
    prompt: 'Juegan blancas. Una horquilla de caballo puede ganar la dama. Encuéntrala.',
    solutionUci: ['e4f6'],
    hint: 'El jaque obliga a responder y deja la dama sin protección.',
  },

  // ───────────── Clavadas ─────────────
  {
    id: 'ex.pin.01',
    conceptId: 'tactics.pin',
    level: 'initiation',
    fen: '4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1',
    prompt: 'Juegan blancas. Clava el caballo negro contra su rey.',
    solutionUci: ['f1b5'],
    hint: 'El alfil debe quedar en la misma línea que el caballo y el rey, con el caballo en medio.',
  },
  {
    id: 'ex.pin.02',
    conceptId: 'tactics.pin',
    level: 'basic',
    fen: '4k3/4b3/8/8/8/8/8/R5K1 w - - 0 1',
    prompt: 'Juegan blancas. Clava el alfil negro con la torre: que no pueda moverse sin dejar el rey en jaque.',
    solutionUci: ['a1e1'],
    hint: 'Pon la torre en la columna del rey negro.',
  },
  {
    id: 'ex.pin.03',
    conceptId: 'tactics.pin',
    level: 'intermediate',
    fen: '4k3/3n4/8/8/8/8/8/3QK3 w - - 0 1',
    prompt: 'Juegan blancas. Clava el caballo negro con la dama usando una diagonal.',
    solutionUci: ['d1a4'],
    hint: 'La diagonal a4-e8 pasa por d7.',
  },
  {
    id: 'ex.pin.04',
    conceptId: 'tactics.pin',
    level: 'advanced',
    fen: '4k3/4n3/8/3P4/8/8/4R3/4K3 w - - 0 1',
    prompt:
      'Juegan blancas. El caballo de e7 está clavado por tu torre. Ataca la pieza clavada para ganarla.',
    solutionUci: ['d5d6'],
    hint: 'Una pieza clavada no puede huir; ataca al caballo con un peón.',
  },

  // ───────────── Amenazas de mate ─────────────
  {
    id: 'ex.mate.01',
    conceptId: 'tactics.mate_threat',
    level: 'beginner',
    fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
    prompt: 'Juegan blancas. Da jaque mate en una jugada.',
    solutionUci: ['g1g7'],
    hint: 'La dama debe dar jaque protegida por tu rey.',
  },
  {
    id: 'ex.mate.02',
    conceptId: 'tactics.mate_threat',
    level: 'beginner',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
    prompt: 'Juegan negras. El rey blanco está muy expuesto. Da jaque mate en una jugada.',
    solutionUci: ['d8h4'],
    hint: 'Mira la diagonal que termina en el rey blanco.',
  },
  {
    id: 'ex.mate.03',
    conceptId: 'tactics.mate_threat',
    level: 'initiation',
    fen: 'r1bqkbnr/1ppp1ppp/p1n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
    prompt: 'Juegan blancas. El punto débil es f7. Da jaque mate en una jugada.',
    solutionUci: ['f3f7'],
    hint: 'f7 está atacada por la dama y el alfil, y defendida solo por el rey.',
  },
  {
    id: 'ex.mate.04',
    conceptId: 'tactics.mate_threat',
    level: 'basic',
    fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1',
    prompt: 'Juegan blancas. El rey negro está encerrado por sus propios peones. Da mate en una jugada.',
    solutionUci: ['a1a8'],
    hint: 'Mate de pasillo: ataca la primera fila.',
  },
  {
    id: 'ex.mate.05',
    conceptId: 'tactics.mate_threat',
    level: 'intermediate',
    fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
    prompt: 'Juegan blancas. El rey negro no tiene casillas libres. Da mate con el caballo.',
    solutionUci: ['g5f7'],
    hint: 'Mate ahogado: el caballo da jaque y las piezas negras bloquean la huida.',
  },

  // ───────────── Jaque a la descubierta ─────────────
  {
    id: 'ex.disc.01',
    conceptId: 'tactics.discovered_attack',
    level: 'initiation',
    fen: 'rnbqkb1r/pppp1ppp/5n2/4N3/8/8/PPPPQPPP/RNB1KB1R w KQkq - 2 5',
    prompt: 'Juegan blancas. Tu dama mira al rey negro con tu caballo en medio. Mueve el caballo con jaque a la descubierta y gana la dama.',
    solutionUci: ['e5c6'],
    hint: 'El caballo debe dar jaque (al descubrir la dama) y atacar a la dama negra a la vez.',
  },
  {
    id: 'ex.disc.02',
    conceptId: 'tactics.discovered_attack',
    level: 'basic',
    fen: '2k5/8/8/8/4r3/2N5/8/2R3K1 w - - 0 1',
    prompt: 'Juegan blancas. Tu torre ataca al rey negro con tu caballo tapando la columna c. Aprovecha el jaque a la descubierta para ganar una torre.',
    solutionUci: ['c3e4'],
    hint: 'Mueve el caballo capturando algo; el rey negro estará en jaque y no podrá evitarlo.',
  },
  {
    id: 'ex.disc.03',
    conceptId: 'tactics.discovered_attack',
    level: 'intermediate',
    fen: '2k5/1q6/8/2N5/8/8/8/2R3K1 w - - 0 1',
    prompt: 'Juegan blancas. El caballo tapa tu torre contra el rey negro. Muévelo capturando la pieza más valiosa.',
    solutionUci: ['c5b7'],
    hint: 'La dama negra está al alcance del caballo; el jaque de la torre impide que el rival la salve.',
  },
  {
    id: 'ex.disc.04',
    conceptId: 'tactics.discovered_attack',
    level: 'advanced',
    fen: '3q2k1/8/4N3/8/8/1B6/8/6K1 w - - 0 1',
    prompt: 'Juegan blancas. El alfil de b3 apunta al rey negro y tu caballo lo tapa. Mueve el caballo para ganar la dama con jaque.',
    solutionUci: ['e6d8'],
    hint: 'Cualquier salto del caballo da jaque, pero solo uno captura una pieza grande.',
  },
];
