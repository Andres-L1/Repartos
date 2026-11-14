/**
 * Auditor automático de contenido (ver scripts/audit/README.md).
 * npm run audit:content -- [--unit u03,bank] [--changed] [--depth 16] [--multipv 4] [--jobs 4] [--no-engine] [--out ruta.md]
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { makeFen } from 'chessops/fen';
import { makeSanAndPlay } from 'chessops/san';
import { UNITS } from '../src/content/index.js';
import type { PracticeStep } from '../src/content/schema.js';
import { EXERCISES } from '../src/pedagogy/exercises.js';
import { mirrorExercise } from '../src/pedagogy/mirror.js';
import { AuditEngine } from './audit/engine.js';
import {
  checkMaterialClaim,
  checkMateClaim,
  checkSanMentions,
  compareSolution,
  type Finding,
  type FindingType,
  isDirected,
  type Line,
  lintText,
  loadPos,
  matesInOne,
  parseClaims,
  SEVERITY,
  type Severity,
  THRESHOLDS,
  uciMove,
} from './audit/lib.js';

export const DISCLAIMER =
  'Auditor automático: Stockfish 16 NNUE (en táctica, muy por encima de 2500) más reglas de lint. ' +
  'No es un maestro titulado ni valida la pedagogía; sus hallazgos son candidatos que revisa una persona. ' +
  'No presentar este informe como validación humana.';

// ───────────── Argumentos ─────────────
const argv = process.argv.slice(2);
const opt = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const has = (name: string) => argv.includes(`--${name}`);
const depth = Number(opt('depth') ?? 16);
const multipv = Number(opt('multipv') ?? 4);
const jobs = Number(opt('jobs') ?? Math.max(1, Math.min(4, cpus().length - 1)));
const useEngine = !has('no-engine');
let scope = opt('unit')?.split(',').map((s) => s.trim());

if (has('changed')) {
  const sh = (c: string) => {
    try {
      return execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      return '';
    }
  };
  const files = (sh('git diff --name-only main...HEAD') + sh('git status --porcelain'))
    .split('\n')
    .map((l) => l.replace(/^.. /, '').trim());
  const set = new Set<string>();
  for (const fl of files) {
    const m = fl.match(/src\/content\/units\/(u\d+)\.ts$/);
    if (m) set.add(m[1]!);
    if (/src\/pedagogy\/(exercises|mirror)\.ts$/.test(fl)) set.add('bank');
  }
  scope = [...set];
  if (!scope.length) {
    console.log('--changed: no hay unidades ni banco modificados respecto a main.');
    process.exit(0);
  }
}
const inScope = (id: string) => !scope || scope.includes(id);

// ───────────── Recogida ─────────────
interface Hit extends Finding {
  severity: Severity;
  where: string;
  loc: string;
}
const hits: Hit[] = [];
const add = (where: string, loc: string, fs: Finding[]) => {
  for (const x of fs) hits.push({ ...x, severity: SEVERITY[x.type], where, loc });
};

interface Task {
  fen: string;
  sol: string;
  prompt: string;
  where: string;
  loc: string;
  /** Afirmaciones a comprobar con la línea del motor (solo en la primera jugada del alumno). */
  claims?: { prompt: string; solution: string[] };
}
const tasks: Task[] = [];
let positions = 0;

const lineCache = new Map<string, string>();
const fileText = (file: string) => lineCache.get(file) ?? (lineCache.set(file, readFileSync(file, 'utf8')), lineCache.get(file)!);
const cursors = new Map<string, number>();
/** Línea de la FEN en su archivo, buscando hacia delante desde la anterior (el contenido va en orden). */
function locate(file: string, fen: string): string {
  const txt = fileText(file);
  let i = txt.indexOf(fen, cursors.get(file) ?? 0);
  if (i < 0) i = txt.indexOf(fen);
  if (i < 0) return file;
  cursors.set(file, i + 1);
  return `${file}:${txt.slice(0, i).split('\n').length}`;
}

function sanOf(fen: string) {
  return (uci: string) => {
    const pos = loadPos(fen);
    const m = typeof pos === 'string' ? undefined : uciMove(pos, uci);
    return m && typeof pos !== 'string' ? makeSanAndPlay(pos, m) : uci;
  };
}

/** Posición con solución: legalidad, mates múltiples, tareas de motor y lint de sus textos. */
function auditPractice(
  where: string,
  loc: string,
  step: { fen: string; prompt: string; solutionUci: string[]; hint?: string },
  texts: string[],
  wrongByMove: Record<string, string> = {},
) {
  positions++;
  const pos = loadPos(step.fen);
  if (typeof pos === 'string') return add(where, loc, [{ type: 'FEN_ILEGAL', detail: pos }]);
  const fens = [step.fen];
  for (let i = 0; i < step.solutionUci.length; i++) {
    const u = step.solutionUci[i]!;
    const m = uciMove(pos, u);
    if (!m) return add(where, loc, [{ type: 'SOLUCION_ILEGAL', detail: `${u} (media jugada ${i + 1}) no es legal` }]);
    const fen = makeFen(pos.toSetup());
    if (i % 2 === 0) {
      const mates = matesInOne(pos);
      if (mates.length > 1)
        add(where, loc, [{ type: 'MATE_MULTIPLE', detail: `${mates.length} mates en 1: ${mates.map(sanOf(fen)).join(', ')} (solución ${sanOf(fen)(u)})` }]);
      tasks.push({ fen, sol: u, prompt: i ? '' : step.prompt, where: i ? `${where} (jugada ${i / 2 + 1})` : where, loc, ...(i ? {} : { claims: { prompt: step.prompt, solution: step.solutionUci } }) });
    }
    pos.play(m);
    fens.push(makeFen(pos.toSetup()));
  }
  if (!useEngine) {
    const c = parseClaims(step.prompt);
    if (c.mate) add(where, loc, checkMateClaim(step.fen, step.solutionUci, c.mate));
  }
  for (const t of [step.prompt, step.hint ?? '', ...texts]) add(where, loc, [...lintText(t), ...checkSanMentions(t, fens)]);
  for (const [u, t] of Object.entries(wrongByMove)) {
    const p = loadPos(step.fen);
    const m = typeof p === 'string' ? undefined : uciMove(p, u);
    const extra = m && typeof p !== 'string' ? (p.play(m), [makeFen(p.toSetup())]) : [];
    add(`${where} wrongByMove ${u}`, loc, [...lintText(t), ...checkSanMentions(t, [...extra, ...fens])]);
  }
}

for (const unit of UNITS.filter((u) => inScope(u.id))) {
  const file = `src/content/units/${unit.id}.ts`;
  add(unit.id, file, lintText(unit.description));
  for (const l of unit.lessons) {
    for (const t of [l.title, l.objective, l.intro]) add(l.id, file, lintText(t));
    l.explanation.forEach((s, i) => {
      const where = `${l.id} explicación ${i + 1}`;
      const loc = locate(file, s.fen);
      const p = loadPos(s.fen);
      if (typeof p === 'string') return add(where, loc, [{ type: 'FEN_ILEGAL', detail: p }]);
      add(where, loc, [...lintText(s.text), ...checkSanMentions(s.text, [s.fen])]);
    });
    const steps: [string, PracticeStep[]][] = [
      ['práctica', l.practice],
      ['evaluación', l.evaluation],
    ];
    for (const [kind, list] of steps)
      list.forEach((s, i) =>
        auditPractice(`${l.id} ${kind} ${i + 1}`, locate(file, s.fen), s, [s.explanationCorrect, s.explanationWrong], s.wrongByMove),
      );
  }
}

if (inScope('bank')) {
  const file = 'src/pedagogy/exercises.ts';
  for (const ex of EXERCISES) {
    const loc = locate(file, ex.fen);
    auditPractice(ex.id, loc, ex, []);
    auditPractice(`${ex.id}.m (espejo)`, loc, mirrorExercise(ex), []);
  }
}

// ───────────── Motor ─────────────
async function runEngine() {
  const queue = [...tasks];
  let done = 0;
  const worker = async () => {
    const e = new AuditEngine();
    await e.init();
    try {
      for (let t = queue.shift(); t; t = queue.shift()) {
        const lines: Line[] = await e.analyzeMulti(t.fen, depth, multipv);
        const solLine = lines.find((l) => l.pv[0] === t.sol) ?? (await e.analyzeMulti(t.fen, depth, 1, [t.sol]))[0] ?? { cp: 0, pv: [t.sol] };
        add(t.where, t.loc, compareSolution(lines, t.sol, solLine, sanOf(t.fen), isDirected(t.prompt, t.sol)));
        if (t.claims) {
          const c = parseClaims(t.claims.prompt);
          if (c.mate) add(t.where, t.loc, checkMateClaim(t.fen, t.claims.solution, c.mate, lines[0]));
          if (c.winsMaterial) add(t.where, t.loc, checkMaterialClaim(t.fen, solLine));
        }
        if (++done % 20 === 0) process.stderr.write(`  motor: ${done}/${tasks.length}\n`);
      }
    } finally {
      await e.close();
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, tasks.length) }, worker));
}

const t0 = Date.now();
if (useEngine && tasks.length) {
  console.error(`Analizando ${tasks.length} jugadas del alumno (profundidad ${depth}, MultiPV ${multipv}, ${jobs} procesos)...`);
  await runEngine();
}
const secs = Math.round((Date.now() - t0) / 1000);

// ───────────── Informe ─────────────
const ORDER: Severity[] = ['grave', 'importante', 'aviso'];
const count = new Map<FindingType, number>();
for (const h of hits) count.set(h.type, (count.get(h.type) ?? 0) + 1);
const types = [...count.keys()].sort((a, b) => ORDER.indexOf(SEVERITY[a]) - ORDER.indexOf(SEVERITY[b]) || a.localeCompare(b));
const date = new Date().toISOString().slice(0, 10);
const out = opt('out') ?? `docs/auditoria-contenido-${date}.md`;
const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

const md = [
  `# Auditoría automática de contenido · ${date}`,
  '',
  `> **Aviso.** ${DISCLAIMER}`,
  '',
  `- Alcance: ${scope ? scope.join(', ') : 'u01-u06 y banco de ejercicios con sus espejos'}. Las mini lecciones de error (error-lesson) no tienen posiciones fijas: se generan de cada partida y no entran.`,
  `- Posiciones con solución: ${positions}; jugadas del alumno analizadas: ${useEngine ? tasks.length : 0}.`,
  useEngine
    ? `- Motor: Stockfish 16 NNUE de un hilo, profundidad ${depth}, MultiPV ${multipv}, hash limpio por posición (${secs} s).`
    : '- Sin motor (--no-engine): solo legalidad, mates en 1, afirmaciones de mate y lint.',
  `- Umbrales: solución peor que la mejor en más de ${THRESHOLDS.worse} cp; alternativa a ${THRESHOLDS.alt} cp o menos de la solución; «sigue ganando» desde +${THRESHOLDS.stillWinning / 100}. Mate en N = 20000 − 100·N cp.`,
  '',
  '## Resumen',
  '',
  '| Tipo | Gravedad | Hallazgos |',
  '|---|---|---|',
  ...types.map((t) => `| ${t} | ${SEVERITY[t]} | ${count.get(t)} |`),
  `| **Total** | | **${hits.length}** |`,
  '',
  ...ORDER.flatMap((sev) => {
    const list = hits.filter((h) => h.severity === sev);
    if (!list.length) return [];
    return [
      `## ${sev[0]!.toUpperCase() + sev.slice(1)}`,
      '',
      '| Tipo | Dónde | Archivo | Detalle |',
      '|---|---|---|---|',
      ...list.map((h) => `| ${h.type} | ${esc(h.where)} | ${h.loc} | ${esc(h.detail)} |`),
      '',
    ];
  }),
].join('\n');
writeFileSync(out, md);

console.log(`\n${DISCLAIMER}\n`);
console.log(`Posiciones con solución: ${positions}. Hallazgos: ${hits.length}.`);
for (const t of types) console.log(`  ${t.padEnd(28)} ${SEVERITY[t].padEnd(10)} ${count.get(t)}`);
const graves = hits.filter((h) => h.severity === 'grave');
for (const g of graves) console.log(`  GRAVE ${g.type} · ${g.where} · ${g.loc} · ${g.detail}`);
console.log(`\nInforme: ${out}`);
process.exit(graves.length ? 1 : 0);
