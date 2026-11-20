/**
 * Revisión de falsos positivos con un motor más profundo (profundidad 20) sobre una muestra de táctica perdida y solo motor.
 *   npx tsx scripts/corpus/verify.mts [muestra por tipo, 12]
 * Un caso es CORRECTO si, a profundidad 20: (1) la jugada que se enseña como mejor pierde como mucho 50 cp frente a la
 * mejor de esa búsqueda y (2) la jugada del alumno pierde 100 cp o más. Para táctica perdida se imprime además el hecho.
 */
import { errorTier, keyErrors } from '../../src/review/select.js';
import { scoreToCp } from '../../src/analysis/core.js';
import { corpusAnalyses } from '../../test/review/corpus.js';
import { AuditEngine } from '../audit/engine.js';

const N = Number(process.argv[2] ?? 12);
const DEPTH = 20;
const cases = corpusAnalyses().flatMap((a) => keyErrors(a).filter((e) => errorTier(e) !== 'cause'));
const pick = (tier: string) => {
  const all = cases.filter((e) => errorTier(e) === tier);
  const step = Math.max(1, Math.floor(all.length / N));
  return all.filter((_, i) => i % step === 0).slice(0, N);
};

const engine = new AuditEngine();
await engine.init();
// Evaluación desde el bando que mueve en esa posición (cp topado como en producción).
const cpFor = async (fen: string, mover: 'white' | 'black') => {
  const r = await engine.analyze(fen, { depth: DEPTH });
  return { cp: scoreToCp(r.score) * (mover === 'white' ? 1 : -1), best: r.bestUci };
};

let ok = 0;
let total = 0;
for (const tier of ['tactic', 'engine']) {
  for (const e of pick(tier)) {
    const m = e.move;
    const opp = m.color === 'white' ? 'black' : 'white';
    const best = await cpFor(m.fenBefore, m.color);
    const after = -(await cpFor(m.fenAfter, opp)).cp;
    // Jugada que se enseña, forzada con searchmoves.
    const forced = (await engine.analyzeMulti(m.fenBefore, DEPTH, 1, [m.bestUci]))[0];
    const shownCp = forced ? scoreToCp({ cp: forced.cp, mate: forced.mate }) : -9999;
    const shownLoss = best.cp - shownCp;
    const studentLoss = best.cp - after;
    const good = shownLoss <= 50 && studentLoss >= 100;
    total++;
    if (good) ok++;
    console.log(
      `${good ? 'OK ' : 'MAL'} ${tier} ${e.gameId} ply ${m.ply} jugó ${m.san} mejor ${m.bestSan} | d20: mejor ${best.best} pérdida del alumno ${studentLoss}, pérdida de la enseñada ${shownLoss}${e.diagnosis ? ' | ' + e.diagnosis.fact : ''}`,
    );
  }
}
console.log(`Correctos: ${ok}/${total}`);
await engine.close();
