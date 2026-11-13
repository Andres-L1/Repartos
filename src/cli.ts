import { readFileSync } from 'node:fs';
import { trainFromPgn } from './pipeline.js';
import type { Level } from './types.js';

const LEVELS: Level[] = ['beginner', 'initiation', 'basic', 'intermediate', 'advanced', 'competitive'];

function usage(): never {
  console.error('Uso: npm run chedex -- <partida.pgn> [--level initiation] [--depth 12]');
  console.error('Niveles: ' + LEVELS.join(', '));
  process.exit(1);
}

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--level' && args[args.indexOf(a) - 1] !== '--depth');
if (!file) usage();
const opt = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const level = (opt('--level') ?? 'initiation') as Level;
if (!LEVELS.includes(level)) usage();
const depth = Number(opt('--depth') ?? 12);

try {
  const pgn = readFileSync(file, 'utf8');
  const items = await trainFromPgn(pgn, { level, depth });
  if (items.length === 0) console.log('No se han encontrado errores relevantes. ¡Buena partida!');
  for (const it of items) {
    const m = it.move;
    const num = Math.ceil(m.ply / 2) + (m.color === 'white' ? '.' : '...');
    console.log(`\n${num} ${m.san}  [${m.classification}, -${m.cpLoss} cp]  mejor: ${m.bestSan}`);
    console.log(`  ${it.explanation.title}${it.explanation.verified ? '' : ' (sin causa verificada)'}`);
    for (const line of it.explanation.text.split('\n')) console.log('  ' + line);
    for (const ex of it.exercises) console.log(`  Ejercicio ${ex.id} (${ex.level}): ${ex.prompt}\n    FEN: ${ex.fen}`);
  }
} catch (e) {
  console.error('Error: ' + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
}
process.exit(0);
