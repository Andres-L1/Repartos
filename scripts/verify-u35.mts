/**
 * Verificación con Stockfish (profundidad 18 por defecto) de la unidad u35 «Prevenir antes de atacar».
 *   npx tsx scripts/verify-u35.mts            comprueba los 18 ejercicios (código de salida 1 si algo falla)
 * Por ejercicio, con la jugada del alumno `sol` y la amenaza `threat` (la mejor jugada del rival si el alumno pasara):
 *  1. `sol` es la mejor jugada y la segunda mejor queda >= 100 cp por debajo (luego `sol` es única).
 *  2. La amenaza es real: en la misma posición con el turno cambiado (jugada nula), `threat` es la mejor jugada del
 *     rival y deja al alumno >= 100 cp por debajo de lo que vale `sol`.
 *  3. `sol` la neutraliza: tras `sol`, jugar `threat` es ilegal o deja al alumno a <= 50 cp de lo que valía antes.
 *  4. Si hay jugada tentadora (`tempting`), el motor la evalúa >= 100 cp peor que `sol`.
 *  5. El texto de explanationCorrect nombra la amenaza (SAN).
 * Posiciones construidas con partidas de motor (profundidad baja) y filtradas por motor; no vienen de partidas reales.
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { makeUci, parseUci } from 'chessops/util';
import { unit } from '../src/content/units/u35.ts';
import { Stockfish } from './verify-lib.mts';

const DEPTH = Number(process.env.DEPTH ?? 18);
/** Por ejercicio: la amenaza del rival (UCI) y, si la hay, la jugada tentadora (UCI). */
export const META: Record<string, { sol?: string; threat: string; tempting?: string }> = {
//META
  "u35.l01:explanation:0": { sol: "f6d5", threat: "e3e4" },
  "u35.l01:explanation:1": { sol: "a8h8", threat: "h6h7" },
  "u35.l01:practice:0": { threat: "d6b8" },
  "u35.l01:practice:1": { threat: "f3f7" },
  "u35.l01:practice:2": { threat: "f5e7" },
  "u35.l01:evaluation:0": { threat: "h6g5" },
  "u35.l01:evaluation:1": { threat: "d4c3" },
  "u35.l01:evaluation:2": { threat: "d3d2" },
  "u35.l02:explanation:0": { sol: "e1d1", threat: "c2e1" },
  "u35.l02:explanation:1": { sol: "d3d6", threat: "e6g6" },
  "u35.l02:practice:0": { threat: "f6f4" },
  "u35.l02:practice:1": { threat: "e3d4" },
  "u35.l02:practice:2": { threat: "e7c5" },
  "u35.l02:evaluation:0": { threat: "b2a1" },
  "u35.l02:evaluation:1": { threat: "b1b2" },
  "u35.l02:evaluation:2": { threat: "d7c7" },
  "u35.l03:explanation:0": { sol: "b5c3", threat: "e4d5" },
  "u35.l03:explanation:1": { sol: "b3a2", threat: "a5b3" },
  "u35.l03:practice:0": { threat: "e4e5", tempting: "f1g2" },
  "u35.l03:practice:1": { threat: "e2h5", tempting: "h5e2" },
  "u35.l03:practice:2": { threat: "f3h1", tempting: "c4f7" },
  "u35.l03:evaluation:0": { threat: "f8a8", tempting: "a8f8" },
  "u35.l03:evaluation:1": { threat: "d6d7", tempting: "d7a4" },
  "u35.l03:evaluation:2": { threat: "f4e5", tempting: "a2e2" },
};

const load = (fen: string) => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
const legal = (p: Chess) => [...p.allDests()].flatMap(([f, ds]) => [...ds].map((t) => ({ from: f, to: t })));
const cp = (n: number) => (n / 100).toFixed(2);

const sf = new Stockfish();
await sf.init();
type Item = { key: string; fen: string; sol: string; text: string; exercise: boolean };
const items: Item[] = [];
for (const l of unit.lessons) {
  l.explanation.forEach((e, i) => items.push({ key: `${l.id}:explanation:${i}`, fen: e.fen, sol: (META[`${l.id}:explanation:${i}`] as { sol?: string } | undefined)?.sol ?? '', text: e.text, exercise: false }));
  for (const [mode, steps] of [['practice', l.practice], ['evaluation', l.evaluation]] as const)
    steps.forEach((s, i) => {
      if (s.solutionUci.length !== 1) throw new Error('la solución debe ser una sola jugada');
      items.push({ key: `${l.id}:${mode}:${i}`, fen: s.fen, sol: s.solutionUci[0]!, text: s.explanationCorrect, exercise: true });
    });
}
let failed = 0;
let total = 0;
for (const it of items) {
  const { key } = it;
  if (it.exercise) total++;
  const errs: string[] = [];
  const meta = META[key];
  if (!meta || !it.sol) errs.push('sin META');
  else {
    const sol = it.sol;
    const pos = load(it.fen);
    const top = await sf.multipv(it.fen, DEPTH, 3);
    const best = top[0]!;
    const second = top[1]!;
    if (best.uci !== sol) errs.push(`la mejor es ${makeSan(pos, parseUci(best.uci)!)} y no la solución`);
    if (best.mate !== null) errs.push('la mejor jugada da mate: no es un ejercicio de prevención');
    if (best.score - second.score < 100) errs.push(`única por menos de 100 cp (${cp(best.score)} frente a ${cp(second.score)})`);
    const setup = parseFen(it.fen).unwrap();
    setup.turn = setup.turn === 'white' ? 'black' : 'white';
    setup.epSquare = undefined;
    const nfen = makeFen(setup);
    const npos = Chess.fromSetup(setup).unwrap();
    const nt = await sf.multipv(nfen, DEPTH, 2);
    const tSan = makeSan(npos, parseUci(meta.threat)!);
    if (nt[0]!.uci !== meta.threat) errs.push(`la mejor jugada del rival si el alumno pasa es ${makeSan(npos, parseUci(nt[0]!.uci)!)}, no ${tSan}`);
    const pass = -nt[0]!.score;
    if (nt[0]!.mate !== null) errs.push('la amenaza es mate: el texto no lo dice');
    if (pass > best.score - 100) errs.push(`la amenaza no es real: pasando queda ${cp(pass)} frente a ${cp(best.score)}`);
    const claimed = Number(/al menos (\d+) peon/.exec(it.text)?.[1] ?? NaN);
    if (!(claimed <= (best.score - pass) / 100)) errs.push(`el texto dice al menos ${claimed} peones y la diferencia es ${cp(best.score - pass)}`);
    const p2 = pos.clone();
    p2.play(parseUci(sol)!);
    let after: string;
    const illegal = p2.isEnd() || !legal(p2).some((m) => makeUci(m) === meta.threat);
    if (illegal) after = 'ilegal';
    else {
      const r = (await sf.multipv(makeFen(p2.toSetup()), DEPTH, 1, [meta.threat]))[0]!;
      after = cp(-r.score);
      if (-r.score < best.score - 50) errs.push(`la amenaza sigue funcionando tras la solución (${after} frente a ${cp(best.score)})`);
    }
    if (it.text.includes('ya no se puede hacer') !== illegal) errs.push('el texto sobre la legalidad de la amenaza no coincide');
    let tempt = '';
    if (meta.tempting) {
      const tl = top.find((x) => x.uci === meta.tempting) ?? (await sf.multipv(it.fen, DEPTH, 1, [meta.tempting]))[0]!;
      tempt = ` tentadora ${makeSan(pos, parseUci(meta.tempting)!)} ${cp(tl.score)}`;
      if (tl.score > best.score - 100) errs.push(`la tentadora no pierde >= 100 cp (${cp(tl.score)} frente a ${cp(best.score)})`);
    }
    if (!it.text.includes(tSan.replace(/[+#]$/, ''))) errs.push(`el texto no nombra la amenaza ${tSan}`);
    if (!errs.length)
      console.log(`ok    ${key}  sol ${makeSan(pos, parseUci(sol)!)} ${cp(best.score)} (2ª ${cp(second.score)}) | amenaza ${tSan}: pasando ${cp(pass)}, tras sol ${after}${tempt}`);
  }
  if (errs.length) {
    failed++;
    console.log(`FALLA ${key}\n   ${errs.join('\n   ')}`);
  }
}
console.log(`\n${items.length - failed}/${items.length} correctos a profundidad ${DEPTH} (${total} ejercicios; el resto son posiciones de explicación)`);
sf.quit();
process.exit(failed || total !== 18 ? 1 : 0);
