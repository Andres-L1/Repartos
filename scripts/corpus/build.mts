/**
 * Construye test/fixtures/corpus/analyses.json: partidas reales (club, historicas, samples) analizadas con
 * Stockfish a la profundidad de produccion. Guarda solo los resultados del motor por posicion; los tests
 * reconstruyen los AnalyzedMove con assembleMoves (sin motor). Reanudable: reutiliza lo ya analizado.
 *
 *   npx tsx scripts/corpus/build.mts
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { analyzeWith } from '../../src/analysis/core.js';
import { parseGame } from '../../src/analysis/pgn.js';
import { REVIEW_DEPTH } from '../../src/review/config.js';
import { AuditEngine } from '../audit/engine.js';
import type { CorpusFile } from '../../test/review/corpus.js';

const OUT = new URL('../../test/fixtures/corpus/analyses.json', import.meta.url);
const read = (p: string) => JSON.parse(readFileSync(new URL(`../../test/fixtures/corpus/${p}`, import.meta.url), 'utf8'));

const toPgn = (moves: string) =>
  moves
    .split(/\s+/)
    .map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${m}` : m))
    .join(' ');

const sources: { id: string; source: string; pgn: string }[] = [
  ...(read('club-games.json') as { id: string; moves: string }[]).map((g) => ({ id: g.id, source: 'club', pgn: toPgn(g.moves) })),
  ...(read('historic.json') as { id: string; moves: string }[]).map((g) => ({ id: g.id, source: 'historica', pgn: toPgn(g.moves) })),
  ...readdirSync(new URL('../../samples/', import.meta.url))
    .filter((f) => f.endsWith('.pgn'))
    .map((f) => ({ id: f.replace('.pgn', ''), source: 'sample', pgn: readFileSync(new URL(`../../samples/${f}`, import.meta.url), 'utf8') })),
];

const done: CorpusFile = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { depth: REVIEW_DEPTH, engine: 'sf16', games: [] };
const have = new Set(done.games.map((g) => g.id));
// Varios procesos del motor en paralelo (mismo resultado: cada posicion se analiza con tablas limpias).
const JOBS = Number(process.env.JOBS ?? 6);
const queue = sources.filter((s) => !have.has(s.id));
async function worker(): Promise<void> {
  const engine = new AuditEngine();
  await engine.init();
  for (let s = queue.shift(); s; s = queue.shift()) {
    let moves;
    try {
      moves = await analyzeWith(engine, s.pgn, { depth: REVIEW_DEPTH });
    } catch (e) {
      console.log('omitida', s.id, (e as Error).message);
      continue;
    }
    const game = parseGame(s.pgn);
    done.games.push({
      id: s.id,
      source: s.source,
      initialFen: game.moves[0]!.fenBefore,
      ucis: moves.map((m) => m.uci),
      results: [
        ...moves.map((m) => ({ score: m.scoreBefore, bestUci: m.bestUci, pv: m.pv.slice(0, 14) })),
        { score: moves[moves.length - 1]!.scoreAfter, bestUci: '', pv: moves[moves.length - 1]!.pvAfter.slice(0, 14) },
      ],
    });
    writeFileSync(OUT, JSON.stringify(done));
    console.log('ok', s.id, done.games.length, '/', sources.length);
  }
  await engine.close();
}
await Promise.all(Array.from({ length: JOBS }, worker));
console.log('listo');
