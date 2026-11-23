/** API simulada para desarrollar sin servidor (activar con ?mock=1; &admin=1 entra como administración y habilita /admin). */
import { CATALOG, DEFAULT_BOARD, DEFAULT_PIECES, PROTECTOR_ID, PROTECTOR_MAX, STREAK_DAYS_PER_CHEDEX } from '../../../src/shop/catalog';
import type { Level } from '../../../src/types';
import { LEVELS, suggestLevel } from '../../../src/shared/levels';
import type { AccessOverview, Equipped, MapUnit, LevelInfo, OutlineUnit, Profile, Shop, User } from '../../../src/shared/api';
import { UNITS } from '../../../src/content/index';
import { levelPlan } from '../../../worker/level';
import { legalDests, sanOfUci } from '../chess';

interface MockState {
  user: User | null;
  completed: Record<string, number>;
  profile: Profile;
  /** Nivel elegido por el alumno (null = sin elegir todavía). */
  chosenLevel?: Level | null;
  /** Tienda simulada: saldo, objetos poseídos, protectores y lo equipado. */
  /** Lista de autorizados y solicitudes simuladas (panel /admin). */
  access?: AccessOverview;
  wallet?: { balance: number; earnedTotal: number; owned: string[]; protectors: number; equipped: Equipped };
}

/** Parámetros del modo simulado para probar la tienda: ?chedex=N (saldo inicial), ?streak=N (racha), ?protectorUsed=1. */
function mockParam(name: string, key: string): string | null {
  try {
    const q = new URLSearchParams(window.location.search).get(name);
    if (q) sessionStorage.setItem(key, q);
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
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

/** Niveles del mock con contenido: el resto avisa de que llega pronto. */
const MOCK_AVAILABLE: Level[] = ['beginner', 'initiation', 'basic', 'intermediate', 'advanced', 'competitive'];

/** Temario real (el que va en el paquete): el mapa y el índice simulados salen de él, sin copias a mano que se desfasen. */
const fase4 = async () => UNITS;

async function fase4Map(chosen: Level | null): Promise<MapUnit[]> {
  const units = await fase4();
  const plan = chosen ? levelPlan(chosen, { units }) : null;
  return units.map((u) => ({
    id: u.id,
    order: u.order,
    title: u.title,
    description: u.description,
    level: u.level,
    status: state.completed[u.lessons.at(-1)!.id] !== undefined ? 'completed' : 'available',
    ...(plan?.openUnitIds.includes(u.id) ? { placedOpen: true } : {}),
    ...(plan?.recommendedUnitId === u.id ? { recommended: true } : {}),
    lessons: u.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      objective: l.objective,
      status: state.completed[l.id] !== undefined ? 'completed' : 'available',
      ...(state.completed[l.id] !== undefined ? { bestScore: state.completed[l.id] ?? 0 } : {}),
    })),
  }));
}

function levelInfo(): LevelInfo {
  const reliable = MOCK_ELO !== null;
  const sug = suggestLevel({
    perfsPresent: true,
    rapid:
      reliable && MOCK_PERF === 'rapid'
        ? { state: 'reliable', rating: MOCK_ELO ?? undefined, games: 60 }
        : { state: 'provisional', rating: 1500, games: 40 },
    classical: { state: 'absent' },
    blitz: reliable && MOCK_PERF === 'blitz' ? { state: 'reliable', rating: MOCK_ELO ?? undefined, games: 60 } : { state: 'absent' },
  });
  const chosen = state.chosenLevel ?? null;
  return {
    chosen,
    suggested: sug.level,
    hint: sug.hint,
    levels: LEVELS.map((l) => ({ ...l, available: MOCK_AVAILABLE.includes(l.id) })),
    comingSoon: chosen !== null && !MOCK_AVAILABLE.includes(chosen),
  };
}

/** ?admin=1 (se recuerda en la sesión del navegador): el usuario simulado es administración. */
const ADMIN = (() => {
  try {
    const q = new URLSearchParams(window.location.search).get('admin');
    if (q) sessionStorage.setItem('chedex-mock-admin', q);
    return sessionStorage.getItem('chedex-mock-admin') === '1';
  } catch {
    return false;
  }
})();

const T0 = Date.now();
function seedAccess(): AccessOverview {
  return {
    allowed: [
      { id: 'ana_ajedrez', username: 'Ana_Ajedrez', addedAt: T0 - 9 * 864e5 },
      { id: 'luis', username: 'Luis', addedAt: T0 - 3 * 864e5 },
    ],
    requests: [{ id: 'marta_92', username: 'Marta_92', firstAt: T0 - 2 * 864e5, lastAt: T0 - 36e5, attempts: 3 }],
    maxAllowed: 500,
  };
}

function load(): MockState {
  try {
    const raw = sessionStorage.getItem('chedex-mock-state');
    if (raw) return JSON.parse(raw) as MockState;
  } catch {
    /* ignore */
  }
  return {
    user: null,
    completed: {},
    chosenLevel: null,
    profile: {
      level: 'beginner',
      streakDays: 0,
      longestStreak: 0,
      lessonsCompleted: 0,
      weakConcepts: {},
    },
  };
}
const state = load();
const SEED_CHEDEX = Number(mockParam('chedex', 'chedex-mock-chedex') ?? 3);
const SEED_STREAK = mockParam('streak', 'chedex-mock-streak');
function wallet() {
  if (!state.wallet) {
    state.wallet = {
      balance: Number.isInteger(SEED_CHEDEX) && SEED_CHEDEX >= 0 ? SEED_CHEDEX : 3,
      earnedTotal: Number.isInteger(SEED_CHEDEX) && SEED_CHEDEX >= 0 ? SEED_CHEDEX : 3,
      owned: [DEFAULT_PIECES, DEFAULT_BOARD],
      protectors: 0,
      equipped: { pieces: DEFAULT_PIECES, board: DEFAULT_BOARD },
    };
    if (SEED_STREAK !== null && Number.isInteger(Number(SEED_STREAK))) state.profile.streakDays = Math.max(0, Number(SEED_STREAK));
    save();
  }
  return state.wallet;
}

function buildShop(): Shop {
  const w = wallet();
  const days = state.profile.streakDays;
  return {
    balance: w.balance,
    earnedTotal: w.earnedTotal,
    protectors: { count: w.protectors, max: PROTECTOR_MAX },
    streak: { days, daysToNextChedex: STREAK_DAYS_PER_CHEDEX - (days % STREAK_DAYS_PER_CHEDEX), daysPerChedex: STREAK_DAYS_PER_CHEDEX },
    equipped: w.equipped,
    items: CATALOG.map((i) => {
      const owned = i.kind === 'protector' ? false : i.price === 0 || w.owned.includes(i.id);
      return {
        id: i.id,
        kind: i.kind,
        name: i.name,
        description: i.description,
        price: i.price,
        free: i.price === 0,
        owned,
        equipped: i.kind === 'protector' ? false : w.equipped[i.kind] === i.id,
        credit: i.credit,
      };
    }),
  };
}
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

let repMoves: { color: 'white' | 'black'; key: string; uci: string }[] = [];
export async function mockFetch(url: string, init: RequestInit): Promise<Response> {
  await new Promise((r) => setTimeout(r, 120));
  const method = (init.method ?? 'GET').toUpperCase();
  const path = url.replace(/^\/api/, '');
  const body = init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};

  if (path === '/outline') {
    const units: OutlineUnit[] = (await fase4()).map(({ id, order, title, level, description, lessons }) => ({ id, order, title, level, description, lessons: lessons.map((l) => ({ id: l.id, title: l.title })) }));
    return json({ units });
  }
  if (path === '/auth/login' && method === 'GET') {
    state.user = ADMIN ? { id: 'andresli', username: 'AndresLi' } : { id: 'mockuser', username: 'MockUser' };
    save();
    return json({ user: state.user });
  }
  if (path === '/account' && method === 'DELETE') {
    state.user = null;
    save();
    return json({ ok: true });
  }
  if (path === '/auth/logout') {
    state.user = null;
    save();
    return json({ ok: true });
  }
  if (!state.user) return err(401, 'Necesitas iniciar sesión.');

  if (path === '/me') return json({ user: state.user, isAdmin: ADMIN, ai: true, openingsStats: true, equipped: wallet().equipped, level: state.chosenLevel ?? 'initiation', levelChosen: !!state.chosenLevel });
  if (path.startsWith('/openings/stats')) {
    // Cifras inventadas pero deterministas, solo para ver la pantalla sin servidor.
    const fen = new URL(url, 'http://x').searchParams.get('fen') ?? '';
    const moves = [...legalDests(fen)].flatMap(([from, tos]) => tos.map((to) => from + to)).slice(0, 5).map((uci, i) => {
      const n = 4000 - i * 700;
      return { uci, san: sanOfUci(fen, uci), white: Math.round(n * 0.4), draws: Math.round(n * 0.3), black: Math.round(n * 0.3) };
    });
    const sum = (k: 'white' | 'draws' | 'black') => moves.reduce((a, m) => a + m[k], 0);
    return json({ white: sum('white'), draws: sum('draws'), black: sum('black'), opening: null, moves });
  }
  if (path.startsWith('/repertoire')) {
    const b = init.body ? JSON.parse(String(init.body)) : {};
    if (path === '/repertoire/add') for (const m of b.moves) if (!repMoves.some((r) => r.color === b.color && r.key === m.key && r.uci === m.uci)) repMoves.push({ color: b.color, key: m.key, uci: m.uci });
    if (path === '/repertoire/remove') repMoves = repMoves.filter((r) => !(r.color === b.color && r.key === b.key && r.uci === b.uci));
    if (path === '/repertoire/clear') repMoves = repMoves.filter((r) => r.color !== b.color);
    return json({ moves: repMoves });
  }
  if (path === '/shop') return json(buildShop());
  if (path === '/shop/buy' && method === 'POST') {
    const w = wallet();
    const item = CATALOG.find((i) => i.id === body.itemId);
    if (!item) return err(404, 'Ese objeto no existe.');
    if (item.id === PROTECTOR_ID) {
      if (w.protectors >= PROTECTOR_MAX) return err(400, 'Ya tienes el máximo de protectores.');
    } else if (item.price === 0 || w.owned.includes(item.id)) return err(400, 'Ya lo tienes.');
    if (w.balance < item.price) return err(400, 'No tienes Chedex suficientes.');
    w.balance -= item.price;
    if (item.id === PROTECTOR_ID) w.protectors += 1;
    else w.owned.push(item.id);
    save();
    return json(buildShop());
  }
  if (path === '/shop/equip' && method === 'POST') {
    const w = wallet();
    const item = CATALOG.find((i) => i.id === body.itemId);
    if (!item || (body.kind !== 'pieces' && body.kind !== 'board') || item.kind !== body.kind) return err(404, 'Ese objeto no existe.');
    if (item.price !== 0 && !w.owned.includes(item.id)) return err(400, 'Todavía no lo tienes.');
    w.equipped = { ...w.equipped, [body.kind]: item.id };
    save();
    return json(buildShop());
  }
  if (path === '/map') return json({ units: await fase4Map(levelInfo().chosen) });
  if (path === '/level' && method === 'GET') return json(levelInfo());
  if (path === '/level' && method === 'PUT') {
    const lv = LEVELS.find((l) => l.id === body.level);
    if (!lv) return err(400, 'Nivel no válido.');
    state.chosenLevel = lv.id;
    save();
    return json(levelInfo());
  }
  const lm = path.match(/^\/lessons\/([^/]+)(\/complete)?$/);
  if (lm) {
    const id = decodeURIComponent(lm[1] ?? '');
    const lesson = (await fase4()).flatMap((u) => u.lessons).find((l) => l.id === id);
    if (!lesson) return err(404, 'Lección no encontrada.');
    if (!lm[2]) {
      return json({ lesson });
    }
    const correct = Number(body.correct ?? 0);
    const total = Number(body.total ?? 1);
    const score = total ? correct / total : 0;
    const passed = correct >= (lesson.passMark ?? Math.max(1, total - 1));
    const w = wallet();
    const firstTime = passed && state.completed[lesson.id] === undefined;
    if (passed) state.completed[lesson.id] = Math.max(state.completed[lesson.id] ?? 0, score);
    const p = state.profile;
    // El modo simulado cuenta cada lección nueva como un día más de racha.
    if (firstTime) p.streakDays += 1;
    else p.streakDays = Math.max(1, p.streakDays);
    let chedexEarned = 0;
    if (firstTime && p.streakDays % STREAK_DAYS_PER_CHEDEX === 0) {
      chedexEarned = 1;
      w.balance += 1;
      w.earnedTotal += 1;
    }
    let protectorUsed = false;
    if (passed && mockParam('protectorUsed', 'chedex-mock-protector-used') === '1') {
      protectorUsed = true;
      w.protectors = Math.max(0, w.protectors - 1);
      sessionStorage.removeItem('chedex-mock-protector-used');
    }
    p.longestStreak = Math.max(p.longestStreak, p.streakDays);
    if (passed) p.lessonsCompleted = Object.keys(state.completed).length;
    for (const c of (body.mistakes as string[] | undefined) ?? []) p.weakConcepts[c] = (p.weakConcepts[c] ?? 0) + 1;
    save();
    return json({
      progress: { lessonId: lesson.id, completed: passed, bestScore: score, attempts: 1 },
      profile: p,
      chedexEarned,
      protectorUsed,
    });
  }
  if (path === '/profile') return json({ profile: state.profile });
  // IA simulada: una aclaración fija (nada sale del navegador); en el mock la solución ya se vio cuando se pide.
  if (path === '/explain' && method === 'POST')
    return json({ text: 'Al dar jaque, el rival tiene que atender el rey primero. Por eso no llega a salvar la otra pieza.', cached: false });
  if (path === '/admin/ai' && ADMIN)
    return json({ available: true, today: { calls: 3, tokens: 420, cached: 5 }, month: { calls: 41, cached: 96, tokens: 5740, spendEur: null, pct: 1, cut: false }, pricesMissing: true });
  // Administración del acceso (solo con ?admin=1).
  const am = path.match(/^\/admin\/(access|allowed|requests)(?:\/([^/]+))?(\/approve)?$/);
  if (am) {
    if (!ADMIN) return err(403, 'Solo para la administración');
    const acc = (state.access ??= seedAccess());
    const id = decodeURIComponent(am[2] ?? '').toLowerCase();
    if (am[1] === 'access' && method === 'GET') return json(acc);
    if (am[1] === 'allowed' && method === 'POST') {
      const name = String(body.username ?? '').trim();
      if (!/^[A-Za-z0-9_-]{2,30}$/.test(name)) return err(400, 'Escribe el nombre de usuario de Lichess (2 a 30 letras, números, guion o guion bajo)');
      if (name.toLowerCase() === 'andresli') return err(409, 'Esa cuenta es de administración y ya tiene acceso');
      if (acc.allowed.some((a) => a.id === name.toLowerCase())) return err(409, 'Ese usuario ya está autorizado');
      acc.allowed.push({ id: name.toLowerCase(), username: name, addedAt: Date.now() });
      acc.requests = acc.requests.filter((r) => r.id !== name.toLowerCase());
    } else if (am[1] === 'allowed' && method === 'DELETE') {
      if (!acc.allowed.some((a) => a.id === id)) return err(404, 'Ese usuario no está en la lista');
      acc.allowed = acc.allowed.filter((a) => a.id !== id);
    } else if (am[1] === 'requests' && am[3] && method === 'POST') {
      const r = acc.requests.find((x) => x.id === id);
      if (!r) return err(404, 'No hay solicitud de ese usuario');
      acc.allowed.push({ id: r.id, username: r.username, addedAt: Date.now() });
      acc.requests = acc.requests.filter((x) => x.id !== id);
    } else if (am[1] === 'requests' && method === 'DELETE') {
      acc.requests = acc.requests.filter((x) => x.id !== id);
    } else return err(404, 'Ruta no encontrada.');
    acc.allowed.sort((a, b) => a.id.localeCompare(b.id));
    save();
    return json(acc);
  }
  // «Entrenar hoy» simulado: ?due=0 para el estado vacío.
  if (path === '/session/status') return json({ due: new URLSearchParams(window.location.search).get('due') === '0' ? 0 : 3, nextDueAt: new Date(Date.now() + 864e5).toISOString() });
  if (path === '/session' && method === 'GET') {
    return json({
      sessionId: 'mock-session',
      items: [
        { itemId: 'm1', kind: 'bank', conceptId: 'tactics.hanging_piece', fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1', prompt: 'Da jaque mate en una jugada.' },
        { itemId: 'm2', kind: 'own', conceptId: 'tactics.fork', fen: '4k3/8/8/8/8/8/3P4/4K3 w - - 0 1', prompt: 'Mueve el peón de d2 dos casillas.' },
      ],
    });
  }
  if (path === '/session/answer') return json({ correct: String(body.uci) === 'a1a8' || String(body.uci) === 'd2d4', done: true });
  if (path === '/session/finish') return json({ reviewed: [{ conceptId: 'tactics.hanging_piece', correct: true, misses: 0 }], nextDueAt: null, streak: 3 });
  return err(404, 'Ruta no encontrada.');
}
