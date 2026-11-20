/**
 * Cobertura del repaso sobre el corpus guardado (sin motor):
 *   npx tsx scripts/corpus/measure.mts [--cases]
 * Antes = solo errores graves con causa tipificada (lo que hacía keyErrors); Después = keyErrors actual.
 */
import { diagnose } from '../../src/diagnosis/index.js';
import { errorTier, keyErrors, seriousMoves, countInaccuracies } from '../../src/review/select.js';
import { corpusAnalyses } from '../../test/review/corpus.js';

const analyses = corpusAnalyses();
const rows = analyses.map((a) => {
  const serious = seriousMoves(a);
  const before = Math.min(3, serious.filter((m) => diagnose(m)).length);
  const after = keyErrors(a);
  return { a, serious: serious.length, before, after, tiers: after.map(errorTier), inacc: countInaccuracies(a) };
});

const sum = (f: (r: (typeof rows)[number]) => number) => rows.reduce((n, r) => n + f(r), 0);
const withSerious = rows.filter((r) => r.serious > 0);
console.log(`Partidas (por bando): ${rows.length}`);
console.log(`Jugadas graves del alumno: ${sum((r) => r.serious)}; en ${withSerious.length} partidas`);
console.log(`Errores mostrados ANTES (con causa, tope 3): ${sum((r) => r.before)}; DESPUÉS: ${sum((r) => r.after.length)}`);
console.log(`Cobertura de jugadas graves mostradas (tope 3 por partida): antes ${sum((r) => r.before)}/${sum((r) => Math.min(3, r.serious))}, después ${sum((r) => r.after.length)}/${sum((r) => Math.min(3, r.serious))}`);
console.log(`Partidas con errores graves y «nada que aprender»: antes ${withSerious.filter((r) => r.before === 0).length}, después ${withSerious.filter((r) => r.after.length === 0).length}`);
const t = (k: string) => rows.reduce((n, r) => n + r.tiers.filter((x) => x === k).length, 0);
console.log(`Después, por tipo: causa ${t('cause')}, táctica perdida ${t('tactic')}, solo motor ${t('engine')}`);
console.log(`Partidas sin ninguna jugada grave: ${rows.length - withSerious.length}; imprecisiones totales: ${sum((r) => r.inacc)}`);

if (process.argv.includes('--cases')) {
  for (const r of rows)
    for (const e of r.after)
      if (errorTier(e) !== 'cause')
        console.log(JSON.stringify({ g: r.a.gameId, tier: errorTier(e), ply: e.move.ply, san: e.move.san, best: e.move.bestSan, fen: e.move.fenBefore, cp: e.move.cpLoss, fact: e.diagnosis?.fact, pv: e.move.pv.slice(0, 6).join(' ') }));
}
