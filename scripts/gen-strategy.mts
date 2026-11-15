// Generador de posiciones de u16 (no forma parte de la app): gen-strategy open|seventh|outpost N seed -> posiciones generadas cuya mejor jugada (profundidad 18, MultiPV 8, +60 cp sobre la segunda) es la jugada del tema
import { appendFileSync } from 'node:fs';
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { parseUci, squareFile, squareRank } from 'chessops/util';
import { checkFact } from './lib/strategy-facts.ts';
import { Stockfish } from './verify-lib.mts';

const kind = process.argv[2] as 'open' | 'seventh' | 'outpost';
const N = Number(process.argv[3] ?? 300);
let seed = Number(process.argv[4] ?? 1);
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const pick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)]!;
const OUT = process.env.GEN_OUT ?? `gen-${kind}.txt`;

function build(): { fen: string; file: string } | null {
  const b = new Map<string, string>();
  b.set('g1', 'K'); b.set('g8', 'k');
  for (const f of 'fgh') { b.set(f + '2', 'P'); b.set(f + '7', 'p'); }
  const file = kind === 'outpost' ? pick(['d']) : pick(['c', 'd', 'e']);
  for (const f of 'abcde') {
    if (f === file) continue;
    if (kind === 'outpost' && (f === 'c' || f === 'e')) {
      if (rnd() < 0.8) b.set(f + pick(['2', '3', '4']), 'P'); // peones blancos que protegen d5; las negras sin peones c y e
      continue;
    }
    if (rnd() < 0.7) b.set(f + pick(['2', '3', '4']), 'P');
    if (rnd() < 0.7) b.set(f + pick(['7', '6', '5']), 'p');
  }
  const free = (sq: string) => !b.has(sq);
  const place = (sqs: string[], p: string) => {
    const s = sqs.filter(free);
    if (!s.length) return false;
    b.set(pick(s), p);
    return true;
  };
  if (kind === 'open') {
    place(['a1', 'b1', 'f1', 'e1', 'd1', 'c1'].filter((s) => s[0] !== file), 'R');
    place(['a8', 'b8', 'f8', 'c8', 'd8', 'e8'].filter((s) => s[0] !== file), 'r');
  } else if (kind === 'seventh') {
    b.set(file + '1', 'R');
    place(['a8', 'b8', 'f8', 'c8', 'd8', 'e8'].filter((s) => s[0] !== file), 'r');
  } else {
    place(['c3', 'e3', 'f4', 'b4', 'c3'], 'N');
    place(['a1', 'b1', 'f1', 'e1', 'd1', 'c1'], 'R');
    place(['a8', 'b8', 'f8', 'c8', 'd8', 'e8'], 'r');
  }
  if (rnd() < 0.5) place(['c3', 'f3', 'e2', 'd3', 'c4', 'b2'], pick(['N', 'B']));
  if (rnd() < 0.6) place(['c6', 'f6', 'e7', 'd7', 'b7', 'c8', 'e6'], pick(['n', 'b']));
  const rows: string[] = [];
  for (let r = 8; r >= 1; r--) {
    let s = '', e = 0;
    for (const f of 'abcdefgh') {
      const p = b.get(f + r);
      if (p) { if (e) s += e; e = 0; s += p; } else e++;
    }
    rows.push(s + (e || ''));
  }
  return { fen: `${rows.join('/')} w - - 0 1`, file };
}

const sf = new Stockfish();
await sf.init();
let found = 0;
for (let i = 0; i < N; i++) {
  const g = build();
  if (!g) continue;
  let pos: Chess;
  try { pos = Chess.fromSetup(parseFen(g.fen).unwrap()).unwrap(); } catch { continue; }
  if (pos.isCheck() || pos.isEnd()) continue;
  const cnt = (c: 'white' | 'black', r: string) => [...pos.board[c].intersect(pos.board[r as 'pawn']) ].length;
  if (cnt('white', 'knight') + cnt('white', 'bishop') !== cnt('black', 'knight') + cnt('black', 'bishop') || Math.abs(cnt('white', 'pawn') - cnt('black', 'pawn')) > 1) continue;
  const quick = await sf.multipv(g.fen, 10, 3);
  if (quick.length < 2 || quick[0]!.score - quick[1]!.score < 50 || quick[0]!.score > 350) continue;
  const m = parseUci(quick[0]!.uci)!;
  const to = (m as { to: number }).to;
  const sq = 'abcdefgh'[squareFile(to)]! + (squareRank(to) + 1);
  if (pos.board.has(to)) continue;
  const after = pos.clone();
  after.play(m);
  if (after.isCheck()) continue;
  const fact =
    kind === 'open' ? { kind: 'openFile' as const, file: g.file } : kind === 'seventh' ? { kind: 'seventh' as const, square: sq } : { kind: 'outpost' as const, square: sq };
  if (kind === 'open' && !(sq[0] === g.file && pos.board.get((m as { from: number }).from)?.role === 'rook')) continue;
  if (!checkFact(g.fen, quick[0]!.uci, fact)) continue;
  const top = await sf.multipv(g.fen, 18, 8);
  if (top[0]!.uci !== quick[0]!.uci || top[0]!.score - top[1]!.score < 60 || top[0]!.score > 300 || top[0]!.mate !== null) continue;
  found++;
  const line = `${g.fen} | ${makeSan(pos, m)} ${top[0]!.score} | 2.ª ${makeSan(pos, parseUci(top[1]!.uci)!)} ${top[1]!.score}\n`;
  appendFileSync(OUT, line);
  console.log(line.trim());
}
console.log('encontradas', found);
sf.quit();
process.exit(0);
