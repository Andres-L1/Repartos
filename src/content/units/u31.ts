import type { PracticeStep, Unit } from '../schema.js';

/** Ejercicio de una jugada; `alt` son otras jugadas igual de válidas (el test comprueba que son TODAS las que cumplen el enunciado). */
const ex = (fen: string, prompt: string, sol: string, hint: string, ok: string, wrong: string, alt?: string[]): PracticeStep => ({
  fen,
  prompt,
  solutionUci: [sol],
  ...(alt ? { alt } : {}),
  hint,
  explanationCorrect: ok,
  explanationWrong: wrong,
});

export const unit: Unit = {
  id: 'u31',
  order: 12,
  title: 'El peón',
  description:
    'Aprende cómo se mueve el peón: un paso hacia delante, el doble paso inicial, la captura en diagonal y qué pasa cuando un peón se queda bloqueado.',
  level: 'beginner',
  requires: ['u30'],
  lessons: [
    {
      id: 'u31.l01',
      unitId: 'u31',
      title: 'Un paso y dos pasos',
      objective: 'Avanzar el peón una casilla o dar el doble paso desde su casilla inicial.',
      intro:
        'El peón es la pieza más pequeña, pero sin peones no hay partida. Siempre avanza y nunca retrocede. Hoy aprenderás a dar sus pasos.',
      explanation: [
        {
          fen: '4k3/8/8/8/4P3/8/8/4K3 w - - 0 1',
          squares: ['e4'],
          arrows: [['e4', 'e5']],
          text: 'El peón avanza una casilla hacia delante. Nunca va hacia atrás ni de lado. Las blancas suben por el tablero y las negras bajan. El peón de e4 solo puede ir a e5.',
        },
        {
          fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
          squares: ['e2'],
          arrows: [
            ['e2', 'e3'],
            ['e2', 'e4'],
          ],
          text: 'La primera vez que se mueve, un peón puede avanzar una casilla o dos. Es el doble paso. Solo se puede dar desde la casilla inicial. Después, de uno en uno.',
        },
      ],
      practice: [
        ex(
          '4k3/8/8/8/8/2P5/8/4K3 w - - 0 1',
          'Avanza el peón de c3 una casilla.',
          'c3c4',
          'El peón solo puede ir hacia delante.',
          'Muy bien. El peón avanzó una casilla hacia delante.',
          'El peón avanza recto, una casilla cada vez. No se mueve de lado ni hacia atrás.',
        ),
        ex(
          '4k3/8/8/8/8/8/3P4/4K3 w - - 0 1',
          'Avanza el peón de d2 dos casillas.',
          'd2d4',
          'Es su primera jugada, así que puede hacer el doble paso.',
          'Correcto. Este es el doble paso, que solo se da desde la casilla inicial.',
          'El doble paso son dos casillas rectas hacia delante. Solo se puede desde la fila inicial.',
        ),
        ex(
          '4k3/8/8/8/8/8/1P4P1/4K3 w - - 0 1',
          'Avanza dos casillas uno de los dos peones.',
          'b2b4',
          'Elige un peón y haz su primer movimiento largo.',
          'Muy bien. Los dos peones podían dar el doble paso: has usado uno de ellos.',
          'Hay que avanzar dos casillas con un peón que aún no se ha movido.',
          ['g2g4'],
        ),
      ],
      evaluation: [
        ex(
          '4k3/3p4/8/8/8/8/8/4K3 b - - 0 1',
          'Juegan negras. Avanza el peón de d7 dos casillas.',
          'd7d5',
          'Las negras bajan hacia la fila 1.',
          'Bien. Los peones negros también dan el doble paso, pero hacia abajo.',
          'El peón negro avanza hacia abajo. El doble paso son dos casillas rectas.',
        ),
        ex(
          '4k3/8/8/4p3/8/8/8/4K3 b - - 0 1',
          'Juegan negras. Avanza el peón de e5 una casilla.',
          'e5e4',
          'Recuerda hacia dónde avanzan las negras.',
          'Muy bien. El peón negro bajó una casilla.',
          'Los peones negros avanzan hacia la fila 1, nunca hacia atrás.',
        ),
        ex(
          '4k3/8/8/8/8/1P6/P7/4K3 w - - 0 1',
          'Solo uno de los peones puede dar dos pasos. Hazlo.',
          'a2a4',
          'Un peón que ya se movió solo avanza una casilla.',
          'Correcto. El peón de b3 ya se había movido, así que solo el otro podía dar el doble paso.',
          'El doble paso solo está permitido para un peón que todavía no se ha movido.',
        ),
      ],
    },
    {
      id: 'u31.l02',
      unitId: 'u31',
      title: 'La captura en diagonal',
      objective: 'Capturar con el peón en diagonal y recordar que no captura hacia delante.',
      intro:
        'El peón avanza recto, pero captura distinto: en diagonal, una casilla hacia delante. Es lo que más cuesta al principio, así que lo practicaremos mucho.',
      explanation: [
        {
          fen: '4k3/8/8/3p1p2/4P3/8/8/4K3 w - - 0 1',
          squares: ['e4'],
          arrows: [
            ['e4', 'd5'],
            ['e4', 'f5'],
          ],
          text: 'El peón captura en diagonal, una casilla hacia delante. El peón blanco de e4 puede capturar el peón de d5 o el de f5.',
        },
        {
          fen: '4k3/8/8/4p3/4P3/8/8/4K3 w - - 0 1',
          squares: ['e4', 'e5'],
          text: 'El peón no captura hacia delante. Aquí los dos peones se miran de frente: ninguno puede avanzar ni capturar al otro.',
        },
      ],
      practice: [
        ex(
          '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1',
          'Captura el peón negro con tu peón.',
          'e4d5',
          'El peón rival está en diagonal, una casilla hacia delante.',
          'Bien. El peón capturó en diagonal y ocupó la casilla del peón rival.',
          'El peón solo captura en diagonal, una casilla hacia delante. Busca la pieza rival en esa diagonal.',
        ),
        ex(
          '4k3/8/8/4nb2/4P3/8/8/4K3 w - - 0 1',
          'El peón tiene una pieza justo delante y otra en diagonal. Captura con el peón.',
          'e4f5',
          'Hacia delante el peón no captura: busca en diagonal.',
          'Muy bien. El caballo de delante no se puede capturar con el peón, pero el alfil de la diagonal sí.',
          'Recuerda que el peón no captura la pieza que tiene justo delante, solo las de las diagonales.',
        ),
        ex(
          '4k3/8/8/3p4/4N3/8/8/4K3 b - - 0 1',
          'Juegan negras. Captura con el peón negro.',
          'd5e4',
          'Las negras capturan en diagonal hacia abajo.',
          'Correcto. El peón negro capturó en diagonal, hacia abajo.',
          'El peón negro captura en diagonal, una casilla hacia delante, es decir, hacia abajo.',
        ),
      ],
      evaluation: [
        ex(
          '4k3/8/8/7p/6P1/8/8/4K3 w - - 0 1',
          'Captura el peón negro con tu peón.',
          'g4h5',
          'En el borde solo hay una diagonal posible.',
          'Bien. Un peón del borde solo tiene una diagonal para capturar.',
          'Busca la diagonal que tiene el peón hacia delante. Allí está la pieza que puedes capturar.',
        ),
        ex(
          '4k3/8/8/2br4/3P4/8/8/4K3 w - - 0 1',
          'Hay una torre delante de tu peón y un alfil en diagonal. Captura con el peón.',
          'd4c5',
          'La pieza de delante no se puede capturar con el peón.',
          'Muy bien. Capturaste el alfil en diagonal. La torre de delante no se podía capturar con el peón.',
          'El peón no captura hacia delante. Solo puede capturar lo que esté en sus diagonales.',
        ),
        ex(
          '4k3/8/8/8/2p5/1R1B4/8/4K3 b - - 0 1',
          'Juegan negras. Captura la torre con tu peón.',
          'c4b3',
          'El peón negro captura en diagonal hacia abajo.',
          'Excelente. Capturaste una torre con un simple peón: gran negocio.',
          'Tu peón negro tiene dos piezas en diagonal. Elige la que vale más: la torre.',
        ),
      ],
    },
    {
      id: 'u31.l03',
      unitId: 'u31',
      title: 'Peones bloqueados',
      objective: 'Reconocer un peón bloqueado y buscar otra jugada.',
      intro:
        'Un peón se bloquea cuando tiene una pieza justo delante. No puede avanzar ni capturarla. Aprenderás a verlo y a buscar otra jugada.',
      explanation: [
        {
          fen: '4k3/8/8/3p4/3P4/8/8/4K3 w - - 0 1',
          squares: ['d4', 'd5'],
          text: 'Dos peones de frente se bloquean: ninguno puede avanzar. Un peón bloqueado no se mueve, pero las demás piezas sí pueden moverse.',
        },
        {
          fen: '4k3/8/8/8/8/2P5/2P5/4K3 w - - 0 1',
          squares: ['c2', 'c3'],
          arrows: [['c3', 'c4']],
          text: 'Peones doblados son dos peones del mismo color en la misma columna. El de atrás queda bloqueado por el de delante hasta que este avance.',
        },
      ],
      practice: [
        ex(
          '4k3/8/8/3p4/3P4/8/6P1/4K3 w - - 0 1',
          'El peón de d4 está bloqueado. Avanza el otro peón.',
          'g2g3',
          'El peón bloqueado no se mueve: elige el que tiene el camino libre.',
          'Muy bien. El peón de la columna d no podía avanzar, pero el otro sí.',
          'Ese peón está bloqueado y no puede moverse. Busca el que tiene el camino libre.',
          ['g2g4'],
        ),
        ex(
          '4k3/8/8/4n3/3PP3/8/8/4K3 w - - 0 1',
          'El peón de e4 está bloqueado por un caballo negro. Captura el caballo con el otro peón.',
          'd4e5',
          'El peón bloqueado no captura hacia delante, pero el vecino sí lo ve en diagonal.',
          'Excelente. Tu otro peón capturó en diagonal y además liberó al peón bloqueado.',
          'Un peón captura en diagonal. Busca cuál de los dos puede capturar al caballo.',
        ),
        ex(
          '4k3/7p/8/8/1p6/1P6/8/4K3 b - - 0 1',
          'Juegan negras. El peón de b4 está bloqueado. Avanza el otro peón.',
          'h7h6',
          'Elige el peón que tiene el camino libre.',
          'Correcto. El peón de b4 está bloqueado, pero el de h7 puede avanzar.',
          'Ese peón no tiene camino. Busca el que puede avanzar.',
          ['h7h5'],
        ),
      ],
      evaluation: [
        ex(
          '4k3/8/8/8/5p2/5P2/P7/4K3 w - - 0 1',
          'El peón de f3 está bloqueado. Avanza el otro peón.',
          'a2a3',
          'Busca el peón con el camino libre.',
          'Bien. Un peón bloqueado espera, y el resto de tus peones siguen su camino.',
          'Ese peón está bloqueado. Elige el que tiene delante una casilla libre.',
          ['a2a4'],
        ),
        ex(
          '4k3/8/8/8/3n4/2PP4/8/4K3 w - - 0 1',
          'El peón de d3 está bloqueado por un caballo negro. Captura el caballo con el otro peón.',
          'c3d4',
          'El otro peón ve el caballo en diagonal.',
          'Muy bien. Capturaste el caballo y tu peón de d3 vuelve a tener el camino libre.',
          'Los peones capturan en diagonal. Mira cuál de ellos ve al caballo.',
        ),
        ex(
          '4k3/8/8/8/8/6P1/6P1/4K3 w - - 0 1',
          'Tienes dos peones doblados. Avanza el que no está bloqueado.',
          'g3g4',
          'El peón de atrás tiene otro peón delante.',
          'Correcto. El peón de atrás espera hasta que el de delante avance.',
          'El peón de atrás está bloqueado por su compañero. Mueve el de delante.',
        ),
      ],
    },
  ],
};
