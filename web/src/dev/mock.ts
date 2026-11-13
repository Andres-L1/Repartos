/** API simulada para desarrollar sin servidor (activar con ?mock=1; ?mock=1&billing=dev simula pagos). */
import type { BillingMode, MapUnit, OutlineUnit, Placement, PlacementMode, Profile, Subscription, User } from '../../../src/shared/api';
import type { Lesson } from '../../../src/content/schema';

const L1: Lesson = {
  id: 'u01.l01',
  unitId: 'u01',
  title: 'El peón y la torre',
  objective: 'Mover el peón, coronar y dar un mate de torre.',
  demo: true,
  conceptIds: ['tactics.hanging_piece'],
  intro:
    'Antes de planear nada hay que saber cómo se mueven las piezas. Hoy verás el peón (avanza y captura en diagonal) y la torre (líneas rectas). ¡Al final darás tu primer mate!',
  explanation: [
    {
      fen: '4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1',
      text: 'El peón avanza una casilla; desde su casilla inicial puede avanzar dos. Las flechas muestran las dos opciones del peón blanco.',
      squares: ['e2'],
      arrows: [
        ['e2', 'e3'],
        ['e2', 'e4'],
      ],
    },
    {
      fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1',
      text: 'La torre se mueve en línea recta, tantas casillas como quiera. Aquí la torre puede llegar a la octava fila: ¡con jaque!',
      arrows: [['a1', 'a8']],
    },
  ],
  practice: [
    {
      fen: '4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1',
      prompt: 'Abre la partida avanzando el peón dos casillas.',
      solutionUci: ['e2e4', 'e7e5'],
      hint: 'El peón de e2 puede saltar hasta e4.',
      explanationCorrect: 'Desde su casilla inicial el peón avanza dos casillas.',
      explanationWrong: 'Esa jugada no es la pedida: avanza el peón de la columna e dos casillas.',
      wrongByMove: { e2e3: 'e3 es legal, pero avanza una sola casilla; aquí se pide la salida doble.' },
    },
    {
      fen: '8/4P1k1/8/8/8/8/8/4K3 w - - 0 1',
      prompt: 'Corona el peón de e7 en dama.',
      solutionUci: ['e7e8q'],
      hint: 'Al llegar a la última fila eliges pieza: elige la dama.',
      explanationCorrect: 'Muy bien: al coronar, el peón se convierte en la pieza que elijas; la dama es la más fuerte.',
      explanationWrong: 'Coronar en otra pieza es legal, pero aquí la dama es lo mejor.',
      squares: ['e8'],
    },
  ],
  evaluation: [
    {
      fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
      prompt: 'Da jaque mate en una jugada.',
      solutionUci: ['a1a8'],
      explanationCorrect: 'Mate: el rey negro no puede escapar porque tu rey vigila g7 y h7.',
      explanationWrong: 'Esa jugada no da mate. Busca la fila del rey rival.',
    },
    {
      fen: '4k3/8/8/8/8/8/3P4/4K3 w - - 0 1',
      prompt: 'Mueve el peón de d2 dos casillas.',
      solutionUci: ['d2d4'],
      explanationCorrect: 'Eso es: la salida doble desde la casilla inicial.',
      explanationWrong: 'Avanza el peón d dos casillas.',
      wrongByMove: { d2d3: 'd3 avanza solo una casilla.' },
    },
  ],
};

const L2: Lesson = {
  id: 'u01.l02',
  unitId: 'u01',
  title: 'El caballo',
  objective: 'Mover el caballo en forma de L.',
  intro: 'El caballo salta sobre otras piezas y se mueve en forma de L.',
  explanation: [
    {
      fen: '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1',
      text: 'Desde b1 el caballo puede ir a a3, c3 o d2.',
      squares: ['b1'],
      arrows: [
        ['b1', 'c3'],
        ['b1', 'a3'],
        ['b1', 'd2'],
      ],
    },
  ],
  practice: [
    {
      fen: '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1',
      prompt: 'Saca el caballo a c3.',
      solutionUci: ['b1c3'],
      hint: 'Dos arriba y una a la derecha.',
      explanationCorrect: 'Bien: c3 es una buena casilla central.',
      explanationWrong: 'El caballo hace una L: dos casillas en una dirección y una en perpendicular.',
    },
  ],
  evaluation: [
    {
      fen: '4k3/8/8/8/8/8/8/4K1N1 w - - 0 1',
      prompt: 'Lleva el caballo a f3.',
      solutionUci: ['g1f3'],
      explanationCorrect: 'Así.',
      explanationWrong: 'Recuerda la L del caballo.',
    },
  ],
};

const L3: Lesson = {
  ...L2,
  id: 'u02.l01',
  unitId: 'u02',
  title: 'Mate con dos torres',
  objective: 'Dar mate con la escalera de torres.',
  demo: false,
};

const LESSONS: Record<string, Lesson> = { [L1.id]: L1, [L2.id]: L2, [L3.id]: L3 };

interface MockState {
  user: User | null;
  sub: Subscription;
  completed: Record<string, number>;
  profile: Profile;
  /** Elección del usuario en la bienvenida (null = sin elegir todavía). */
  placementMode?: PlacementMode | null;
}

/** Caso de colocación simulado: Elo 1250 en rápidas (?mock=1&elo=none simula sin Elo fiable; &elo=900 un Elo bajo; &perf=blitz el Elo viene de blitz). */
const MOCK_PERF: 'rapid' | 'blitz' = (() => {
  try {
    const q = new URLSearchParams(window.location.search).get('perf');
    if (q) sessionStorage.setItem('chedex-mock-perf', q);
    return sessionStorage.getItem('chedex-mock-perf') === 'blitz' ? 'blitz' : 'rapid';
  } catch {
    return 'rapid';
  }
})();

const MOCK_ELO: number | null = (() => {
  try {
    const q = new URLSearchParams(window.location.search).get('elo');
    if (q) sessionStorage.setItem('chedex-mock-elo', q);
    const v = sessionStorage.getItem('chedex-mock-elo');
    if (v === 'none') return null;
    const n = Number(v);
    return v && Number.isInteger(n) && n >= 0 && n <= 4000 ? n : 1250;
  } catch {
    return 1250;
  }
})();

function placementFor(): Placement {
  const reliable = MOCK_ELO !== null;
  const open = reliable && MOCK_ELO >= 1000 ? ['u01'] : [];
  const mode: PlacementMode = reliable && state.placementMode !== 'scratch' ? 'lichess' : 'scratch';
  return {
    seen: {
      perfsPresent: true,
      rapid:
        reliable && MOCK_PERF === 'rapid'
          ? { state: 'reliable', rating: MOCK_ELO ?? undefined, games: 60 }
          : { state: 'provisional', rating: 1500, games: 4 },
      classical: { state: 'absent' },
      blitz: reliable && MOCK_PERF === 'blitz' ? { state: 'reliable', rating: MOCK_ELO ?? undefined, games: 60 } : { state: 'absent' },
    },
    source: reliable ? 'lichess' : 'none',
    perf: reliable ? MOCK_PERF : null,
    rating: MOCK_ELO,
    games: reliable ? 60 : null,
    mode,
    chosen: state.placementMode === 'lichess' || state.placementMode === 'scratch',
    recommendedUnitId: !reliable ? null : MOCK_ELO >= 1000 ? 'u02' : 'u01',
    openUnitIds: open,
  };
}

const MODE: BillingMode = (() => {
  try {
    const q = new URLSearchParams(window.location.search).get('billing');
    if (q) sessionStorage.setItem('chedex-mock-billing', q);
    return sessionStorage.getItem('chedex-mock-billing') === 'dev' ? 'dev' : 'beta_open';
  } catch {
    return 'beta_open';
  }
})();

function load(): MockState {
  try {
    const raw = sessionStorage.getItem('chedex-mock-state');
    if (raw) return JSON.parse(raw) as MockState;
  } catch {
    /* ignore */
  }
  return {
    user: null,
    sub: { status: 'none', priceEurPerMonth: 10, provider: MODE === 'dev' ? 'dev' : 'none', beta: MODE !== 'dev' },
    completed: {},
    placementMode: null,
    profile: {
      xp: 0,
      level: 'beginner',
      streakDays: 0,
      longestStreak: 0,
      dailyGoalXp: 20,
      xpToday: 0,
      lessonsCompleted: 0,
      weakConcepts: {},
    },
  };
}
const state = load();
function save(): void {
  try {
    sessionStorage.setItem('chedex-mock-state', JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
const err = (status: number, error: string) => json({ error }, status);

/** Temario público simulado (sin contenido de lecciones). */
const OUTLINE: OutlineUnit[] = [
  {
    id: 'u01', order: 1, title: 'Primeros pasos', description: 'Las piezas y cómo se mueven.', level: 'beginner',
    lessons: [{ id: L1.id, title: L1.title }, { id: L2.id, title: L2.title }],
  },
  {
    id: 'u02', order: 2, title: 'Mates básicos', description: 'Los primeros mates con pocas piezas.', level: 'initiation',
    lessons: [{ id: L3.id, title: L3.title }, { id: 'u02.l02', title: 'Mate de dama y rey' }, { id: 'u02.l03', title: 'Mate del pasillo' }],
  },
  {
    id: 'u03', order: 3, title: 'Tácticas simples', description: 'Horquillas, clavadas y piezas sin defender.', level: 'initiation',
    lessons: [{ id: 'u03.l01', title: 'Piezas sin defender' }, { id: 'u03.l02', title: 'La horquilla' }],
  },
];

function buildMap(): MapUnit[] {
  const done1 = state.completed[L1.id] !== undefined;
  const done2 = state.completed[L2.id] !== undefined;
  const pl = placementFor();
  const effective = pl.mode === 'lichess';
  const u1Open = effective && pl.openUnitIds.includes('u01');
  const u1Done = done1 && done2;
  const done3 = state.completed[L3.id] !== undefined;
  const units: MapUnit[] = [
    {
      id: 'u01',
      order: 1,
      title: 'Primeros pasos',
      description: 'Las piezas y cómo se mueven.',
      level: 'beginner',
      status: u1Done ? 'completed' : 'available',
      ...(u1Open ? { placedOpen: true } : {}),
      ...(effective && pl.recommendedUnitId === 'u01' ? { recommended: true } : {}),
      lessons: [
        {
          id: L1.id,
          title: L1.title,
          objective: L1.objective,
          demo: true,
          status: done1 ? 'completed' : 'available',
          ...(done1 ? { bestScore: state.completed[L1.id] ?? 0 } : {}),
        },
        {
          id: L2.id,
          title: L2.title,
          objective: L2.objective,
          demo: false,
          status: done2 ? 'completed' : done1 || u1Open ? 'available' : 'locked',
          ...(done2 ? { bestScore: state.completed[L2.id] ?? 0 } : {}),
        },
      ],
    },
    {
      id: 'u02',
      order: 2,
      title: 'Mates básicos',
      description: 'Los primeros mates con pocas piezas.',
      level: 'initiation',
      status: done3 ? 'completed' : u1Done || u1Open ? 'available' : 'locked',
      ...(effective && pl.recommendedUnitId === 'u02' ? { recommended: true } : {}),
      lessons: [
        {
          id: L3.id,
          title: L3.title,
          objective: L3.objective,
          demo: false,
          status: done3 ? 'completed' : u1Done || u1Open ? 'available' : 'locked',
          ...(done3 ? { bestScore: state.completed[L3.id] ?? 0 } : {}),
        },
      ],
    },
  ];
  return units;
}

export async function mockFetch(url: string, init: RequestInit): Promise<Response> {
  await new Promise((r) => setTimeout(r, 120));
  const method = (init.method ?? 'GET').toUpperCase();
  const path = url.replace(/^\/api/, '');
  const body = init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};

  if (path === '/demo') return json({ lesson: L1 });
  if (path === '/outline') return json({ units: OUTLINE });
  if (path === '/config') return json({ billingMode: MODE });
  if (path === '/auth/login' && method === 'GET') {
    state.user = { id: 'mockuser', username: 'MockUser' };
    save();
    return json({ user: state.user });
  }
  if (path === '/auth/logout') {
    state.user = null;
    save();
    return json({ ok: true });
  }
  if (!state.user) return err(401, 'Necesitas iniciar sesión.');

  if (path === '/me') return json({ user: state.user, subscription: state.sub, billingMode: MODE });
  if (path === '/map') return json({ units: buildMap() });
  if (path === '/placement' && method === 'GET') return json(placementFor());
  if (path === '/placement' && method === 'POST') {
    if (body.mode !== 'lichess' && body.mode !== 'scratch') return err(400, "mode debe ser 'lichess' o 'scratch'.");
    if (body.mode === 'lichess' && MOCK_ELO === null) return err(400, 'No hay un Elo de Lichess fiable.');
    state.placementMode = body.mode;
    save();
    return json(placementFor());
  }
  const lm = path.match(/^\/lessons\/([^/]+)(\/complete)?$/);
  if (lm) {
    const lesson = LESSONS[decodeURIComponent(lm[1] ?? '')];
    if (!lesson) return err(404, 'Lección no encontrada.');
    if (!lm[2]) {
      if (MODE === 'dev' && !lesson.demo && state.sub.status !== 'active') return err(402, 'Esta lección requiere suscripción.');
      return json({ lesson });
    }
    const correct = Number(body.correct ?? 0);
    const total = Number(body.total ?? 1);
    const score = total ? correct / total : 0;
    const passed = correct >= (lesson.passMark ?? Math.max(1, total - 1));
    const xpGained = passed ? 10 + correct * 5 : 3;
    if (passed) state.completed[lesson.id] = Math.max(state.completed[lesson.id] ?? 0, score);
    const p = state.profile;
    p.xp += xpGained;
    p.xpToday += xpGained;
    p.streakDays = Math.max(1, p.streakDays);
    p.longestStreak = Math.max(p.longestStreak, p.streakDays);
    if (passed) p.lessonsCompleted = Object.keys(state.completed).length;
    for (const c of (body.mistakes as string[] | undefined) ?? []) p.weakConcepts[c] = (p.weakConcepts[c] ?? 0) + 1;
    save();
    return json({
      progress: { lessonId: lesson.id, completed: passed, bestScore: score, attempts: 1 },
      xpGained,
      profile: p,
    });
  }
  if (path === '/profile') return json({ profile: state.profile });
  if (path === '/billing') return json({ subscription: state.sub });
  if (MODE === 'beta_open' && path.startsWith('/billing/')) return err(501, 'Los pagos llegarán próximamente.');
  if (path === '/billing/subscribe') {
    state.sub = { ...state.sub, status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 864e5).toISOString() };
    save();
    return json({ subscription: state.sub });
  }
  if (path === '/billing/cancel') {
    state.sub = { ...state.sub, status: 'canceled' };
    save();
    return json({ subscription: state.sub });
  }
  return err(404, 'Ruta no encontrada.');
}
