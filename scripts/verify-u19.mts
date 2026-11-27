/** Verifica u19 con Stockfish d18: vuelca los pasos a JSON y llama a `verify-fase4.mts lines` (solución mejor y única en cada jugada). */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unit } from '../src/content/units/u19.ts';

const items = unit.lessons.flatMap((l) =>
  [...l.practice, ...l.evaluation].map((s, i) => ({ key: `${l.id}:${i}`, fen: s.fen, uci: s.solutionUci.join(' '), ...(s.alt ? { alt: s.alt } : {}) })),
);
const f = join(mkdtempSync(join(tmpdir(), 'u19-')), 'lines.json');
writeFileSync(f, JSON.stringify(items));
const out = execFileSync('npx', ['tsx', 'scripts/verify-fase4.mts', 'lines', f], { encoding: 'utf8', shell: true });
console.log(out);
process.exit(/FALLA/.test(out) ? 1 : 0);
