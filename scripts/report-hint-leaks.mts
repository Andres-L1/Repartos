// Uso: npx tsx scripts/report-hint-leaks.mts [uXX|bank]. Lista los avisos de primer fallo que nombran la solución.
import { UNITS } from '../src/content/index.js';
import { EXERCISES } from '../src/pedagogy/exercises.js';
import { mirrorExercise } from '../src/pedagogy/mirror.js';
import { leaksIn, targetsOf } from './lib/hint-leaks.js';

const only = process.argv[2];
const rows: string[] = [];
const per: Record<string, number> = {};
for (const u of UNITS) {
  if (only && only !== u.id) continue;
  for (const l of u.lessons)
    for (const [mode, steps] of [['practice', l.practice], ['evaluation', l.evaluation]] as const)
      steps.forEach((s, i) => {
        const t = targetsOf(s.fen, s.solutionUci, s.alt);
        const texts: [string, string | undefined][] = [
          ['hint', s.hint],
          ['wrong', s.explanationWrong],
          ...Object.entries(s.wrongByMove ?? {}).map(([k, v]): [string, string] => [`byMove:${k}`, v]),
        ];
        for (const [kind, text] of texts) {
          if (!text) continue;
          const lk = leaksIn(text, t, s.prompt);
          if (lk.length) {
            per[u.id] = (per[u.id] ?? 0) + 1;
            rows.push(`${l.id} ${mode}${i} [${kind}] sol=${t.map((x) => x.san).join('/')} leak=${lk.join(',')} :: ${text}`);
          }
        }
      });
}
if (!only || only === 'bank')
  for (const e of EXERCISES.flatMap((x) => [x, mirrorExercise(x)])) {
    if (!e.hint) continue;
    const lk = leaksIn(e.hint, targetsOf(e.fen, e.solutionUci, e.alt), e.prompt);
    if (lk.length) {
      per.bank = (per.bank ?? 0) + 1;
      rows.push(`${e.id} [hint] leak=${lk.join(',')} :: ${e.hint}`);
    }
  }
console.log(rows.join('\n'));
console.log(per);
