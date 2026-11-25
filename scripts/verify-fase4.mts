/**
 * Verificación con Stockfish del contenido de Fase 4 (u10 en adelante) y de sus ejercicios del banco.
 *   npx tsx scripts/verify-fase4.mts u10 u11 --bank     comprueba unidades y banco (sale con código 1 si algo falla)
 *   npx tsx scripts/verify-fase4.mts probe "<fen>" [n] ["<uci ...>"]  n mejores jugadas con su variante, tras las jugadas dadas
 * Criterios (profundidad DEPTH, MultiPV): en cada jugada del alumno la solución es la mejor o está a <=30 cp de la
 * mejor; si la línea acaba en mate, la jugada da el mate más corto y, salvo en la última, ninguna otra lo da igual de
 * rápido; si no, la primera jugada deja ventaja clara (>= +150 cp) y toda jugada a <=30 cp de la solución tiene que
 * estar en `alt` (última jugada) o no existir (jugadas intermedias). Cada `alt` está a <=30 cp de la solución.
 * Las respuestas del rival son la mejor defensa o están a <=30 cp de ella.
 * Defensa (`defense`, lecciones y banco de `tactics.defensive_move`): en la primera jugada la solución es la mejor
 * (<=30 cp) y cualquier otra jugada, salvo `alt`, está al menos 150 cp por debajo; no se exige ventaja (salvar puede
 * ser llegar a tablas).
 * Estrategia (lecciones y banco con conceptos `strategy.*`, u16): la solución es la mejor y toda otra jugada, salvo `alt`,
 * queda al menos 60 cp por debajo; sin exigir ventaja mínima.
 *   npx tsx scripts/verify-fase4.mts line "<fen>" "<uci uci ...>" [defense] [alt=uci,uci]   comprueba una línea suelta
 */
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { parseUci } from 'chessops/util';
import { UNITS as REGISTERED } from '../src/content/index.ts';
import { unit as u17 } from '../src/content/units/u17.ts';
import { EXERCISES } from '../src/pedagogy/exercises.ts';
import { mirrorExercise } from '../src/pedagogy/mirror.ts';
import { FASE4, legalMoves } from './audit/lib.ts';
import { Stockfish, type Line } from './verify-lib.mts';

// u17 se verifica aunque aún no esté registrada en index.ts.
const UNITS = REGISTERED.some((u) => u.id === 'u17') ? REGISTERED : [...REGISTERED, u17];

// Criterios compartidos con el auditor general (scripts/audit/lib.ts), que los usa para «gana material».
const DEPTH = Number(process.env.DEPTH ?? FASE4.depth);
const NEAR = FASE4.near;
const CLEAR = FASE4.clear;
/** Estrategia: ventaja mínima de la solución sobre la segunda mejor jugada. */
const STRATEGY_GAP = 60;

const load = (fen: string) => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
const san = (pos: Chess, uci: string) => makeSan(pos, parseUci(uci)!);
const fmt = (pos: Chess, l: Line) => `${san(pos, l.uci)} ${l.mate !== null ? `#${l.mate}` : (l.score / 100).toFixed(2)}`;
const legalCount = (pos: Chess) => legalMoves(pos).length;

interface Step {
  key: string;
  fen: string;
  solutionUci: string[];
  alt?: string[];
  defense?: boolean;
  /** Estrategia (`strategy.*`): la solución es la mejor y toda otra jugada, salvo `alt`, queda al menos 60 cp por debajo. */
  strategy?: boolean;
}

async function checkStep(sf: Stockfish, s: Step): Promise<string[]> {
  const errors: string[] = [];
  const pos = load(s.fen);
  const end = pos.clone();
  for (const u of s.solutionUci) end.play(parseUci(u)!);
  const mateLine = end.isCheckmate();
  const cur = pos.clone();
  for (let i = 0; i < s.solutionUci.length; i++) {
    const uci = s.solutionUci[i]!;
    const last = i === s.solutionUci.length - 1;
    const n = Math.min(8, legalCount(cur));
    const top = await sf.multipv(makeFenOf(cur), DEPTH, n);
    const best = top[0]!;
    let sol = top.find((l) => l.uci === uci);
    if (!sol) sol = (await sf.multipv(makeFenOf(cur), DEPTH, 1, [uci]))[0]!;
    const tag = `${i % 2 === 0 ? 'alumno' : 'rival'} ${san(cur, uci)}`;
    if (i % 2 === 1) {
      if (sol.score < best.score - NEAR) errors.push(`${tag}: el rival tiene algo mejor (${fmt(cur, best)} frente a ${fmt(cur, sol)})`);
    } else if (mateLine) {
      if (sol.mate === null || sol.mate <= 0) errors.push(`${tag}: no lleva al mate (${fmt(cur, sol)})`);
      else if (best.mate !== null && best.mate < sol.mate) errors.push(`${tag}: hay un mate más corto (${fmt(cur, best)})`);
      else if (!last) {
        const rivals = top.filter((l) => l.uci !== uci && l.mate !== null && l.mate > 0 && l.mate <= sol!.mate!);
        if (rivals.length) errors.push(`${tag}: otra jugada mata igual de rápido: ${rivals.map((l) => fmt(cur, l)).join(', ')}`);
      }
    } else {
      if (sol.score < best.score - NEAR) errors.push(`${tag}: no es la mejor (${fmt(cur, best)} frente a ${fmt(cur, sol)})`);
      const only = (s.defense || s.strategy) && i === 0;
      if (i === 0 && !s.defense && !s.strategy && sol.score < CLEAR) errors.push(`${tag}: ventaja insuficiente (${fmt(cur, sol)})`);
      const near = top.filter((l) => l.uci !== uci && l.score >= sol!.score - (s.strategy ? STRATEGY_GAP - 1 : only ? CLEAR - 1 : NEAR));
      const allowed = last || only ? (s.alt ?? []) : [];
      const extra = near.filter((l) => !allowed.includes(l.uci));
      if (extra.length) errors.push(`${tag}: jugadas igual de buenas fuera de alt: ${extra.map((l) => `${fmt(cur, l)} (${l.uci})`).join(', ')}`);
      if (near.length === n - 1 && n === 8) errors.push(`${tag}: más de 7 jugadas a <=30 cp, revisar a mano`);
      if (last || only) {
        for (const a of s.alt ?? []) {
          const al = top.find((l) => l.uci === a) ?? (await sf.multipv(makeFenOf(cur), DEPTH, 1, [a]))[0]!;
          if (al.score < sol.score - NEAR) errors.push(`${tag}: alt ${a} peor (${fmt(cur, al)})`);
        }
      }
    }
    cur.play(parseUci(uci)!);
  }
  return errors;
}

function makeFenOf(pos: Chess): string {
  return makeFen(pos.toSetup());
}

const args = process.argv.slice(2);
const sf = new Stockfish();
await sf.init();
if (args[0] === 'probe') {
  const pos = load(args[1]!);
  for (const u of args[3]?.split(' ').filter(Boolean) ?? []) pos.play(parseUci(u)!);
  const n = Math.min(Number(args[2] ?? 8), legalCount(pos));
  console.log(makeFenOf(pos));
  for (const l of await sf.multipv(makeFenOf(pos), DEPTH, n)) {
    const p = pos.clone();
    const pv = l.pv.slice(0, 8).map((u) => {
      const m = parseUci(u)!;
      const s = makeSan(p, m);
      p.play(m);
      return s;
    });
    console.log(fmt(pos, l), l.uci, ' ', pv.join(' '));
  }
  sf.quit();
  process.exit(0);
}

if (args[0] === 'line') {
  const alt = args.find((a) => a.startsWith('alt='))?.slice(4).split(',');
  const errs = await checkStep(sf, { key: 'line', fen: args[1]!, solutionUci: args[2]!.split(' '), defense: args.includes('defense'), ...(alt ? { alt } : {}) });
  console.log(errs.length ? 'FALLA\n   ' + errs.join('\n   ') : 'ok');
  sf.quit();
  process.exit(errs.length ? 1 : 0);
}

if (args[0] === 'lines') {
  // lines <archivo.json>: [{key, fen, uci: "e2e4 ...", alt?: ["uci"]}] ; imprime ok/FALLA por línea
  const { readFileSync } = await import('node:fs');
  const items = JSON.parse(readFileSync(args[1]!, 'utf8')) as { key: string; fen: string; uci: string; alt?: string[] }[];
  for (const it of items) {
    const errs = await checkStep(sf, { key: it.key, fen: it.fen, solutionUci: it.uci.split(' '), ...(it.alt ? { alt: it.alt } : {}) });
    console.log(`${errs.length ? 'FALLA' : 'ok   '} ${it.key}${errs.length ? '\n   ' + errs.join('\n   ') : ''}`);
  }
  sf.quit();
  process.exit(0);
}

const DEFENSE = 'tactics.defensive_move';
const unitIds = args.filter((a) => /^u\d+$/.test(a));
const steps: Step[] = [];
for (const u of UNITS.filter((x) => unitIds.includes(x.id)))
  for (const l of u.lessons) {
    const defense = l.conceptIds?.includes(DEFENSE) ?? false;
    const strategy = l.conceptIds?.some((c) => c.startsWith('strategy.')) ?? false;
    l.practice.forEach((p, i) => steps.push({ key: `${l.id}:practice:${i}`, ...p, defense, strategy }));
    l.evaluation.forEach((p, i) => steps.push({ key: `${l.id}:evaluation:${i}`, ...p, defense, strategy }));
  }
if (args.includes('--bank')) {
  const levels = new Set(['intermediate', 'advanced', 'competitive']);
  const fase4 = new Set([
    'tactics.skewer',
    'tactics.deflection',
    'tactics.remove_defender',
    'tactics.attraction',
    'tactics.intermezzo',
    DEFENSE,
    'tactics.interference',
    'tactics.clearance',
  ]);
  for (const e of EXERCISES.filter((x) => fase4.has(x.conceptId) || x.conceptId.startsWith('strategy.') || (levels.has(x.level) && /\.(1\d|2\d)$/.test(x.id)))) {
    const defense = e.conceptId === DEFENSE;
    const strategy = e.conceptId.startsWith('strategy.');
    steps.push({ key: e.id, ...e, defense, strategy });
    const m = mirrorExercise(e);
    steps.push({ key: m.id, ...m, defense, strategy });
  }
}

let failed = 0;
for (const s of steps) {
  const errs = await checkStep(sf, s);
  if (errs.length) failed++;
  console.log(`${errs.length ? 'FALLA' : 'ok   '} ${s.key}${errs.length ? '\n   ' + errs.join('\n   ') : ''}`);
}
console.log(`\n${steps.length - failed}/${steps.length} correctos a profundidad ${DEPTH}`);
sf.quit();
process.exit(failed ? 1 : 0);
