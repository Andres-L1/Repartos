import type { LichessGame, ReviewGame } from '../review/types.js';

const MIN_PLIES = 10;
const BAD_STATUS = new Set(['aborted', 'noStart', 'started', 'created', 'unknownFinish']);

export function isValidUsername(u: string): boolean {
  return /^[A-Za-z0-9_-]{2,30}$/.test(u);
}

export function gamesUrl(username: string, max = 30): string {
  const q = new URLSearchParams({
    max: String(max),
    perfType: 'blitz,rapid,classical,correspondence',
    moves: 'true',
    opening: 'true',
    clocks: 'true',
  });
  return `https://lichess.org/api/games/user/${encodeURIComponent(username)}?${q.toString().replace(/%2C/g, ',')}`;
}

type RawPlayer = { user?: { id?: string }; rating?: number } | undefined;
type RawGame = Omit<LichessGame, 'players'> & { players: { white?: RawPlayer; black?: RawPlayer } };

/** La API anida el identificador en `user`; los anónimos no lo traen. */
function player(p: RawPlayer): { id?: string; rating?: number } {
  return { id: p?.user?.id, rating: p?.rating };
}

/** Una partida por línea; se ignoran las líneas vacías o que no son JSON de partida. */
export function parseNdjson(text: string): LichessGame[] {
  const games: LichessGame[] = [];
  for (const line of text.split('\n')) {
    const s = line.trim();
    if (!s) continue;
    try {
      const raw = JSON.parse(s) as RawGame;
      if (raw && typeof raw === 'object' && typeof raw.id === 'string' && typeof raw.moves === 'string' && raw.players) {
        games.push({
          id: raw.id,
          speed: raw.speed,
          variant: raw.variant,
          status: raw.status,
          createdAt: raw.createdAt,
          moves: raw.moves,
          initialFen: raw.initialFen,
          winner: raw.winner,
          players: { white: player(raw.players.white), black: player(raw.players.black) },
          opening: raw.opening?.name ? { name: raw.opening.name } : undefined,
        });
      }
    } catch {
      // línea inválida: se ignora
    }
  }
  return games;
}

export function toReviewGame(g: LichessGame, username: string): ReviewGame | null {
  if (g.variant !== 'standard' || BAD_STATUS.has(g.status)) return null;
  const plies = g.moves.trim() ? g.moves.trim().split(/\s+/).length : 0;
  if (plies < MIN_PLIES) return null;

  const me = username.toLowerCase();
  const white = g.players.white?.id?.toLowerCase();
  const black = g.players.black?.id?.toLowerCase();
  const color = white === me ? 'white' : black === me ? 'black' : null;
  if (!color) return null;

  const result = !g.winner ? 'draw' : g.winner === color ? 'win' : 'loss';
  const pgnResult = !g.winner ? '1/2-1/2' : g.winner === 'white' ? '1-0' : '0-1';

  const headers = [
    ['Event', `Lichess ${g.speed}`],
    ['Site', `https://lichess.org/${g.id}`],
    ['White', g.players.white?.id ?? '?'],
    ['Black', g.players.black?.id ?? '?'],
    ['Result', pgnResult],
  ];
  if (g.initialFen) headers.push(['SetUp', '1'], ['FEN', g.initialFen]);
  const pgn = `${headers.map(([k, v]) => `[${k} "${v}"]`).join('\n')}\n\n${g.moves.trim()} ${pgnResult}\n`;

  return { id: g.id, color, result, speed: g.speed, createdAt: g.createdAt, opening: g.opening?.name, pgn };
}

export function pickGames(games: LichessGame[], username: string, n = 10): ReviewGame[] {
  const out: ReviewGame[] = [];
  for (const g of games) {
    const r = toReviewGame(g, username);
    if (r) out.push(r);
    if (out.length === n) break;
  }
  return out;
}
