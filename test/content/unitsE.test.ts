import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { parseSquare, parseUci } from 'chessops/util';
import type { Role } from 'chessops/types';
import { UNITS } from '../../src/content/index.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { mirrorExercise } from '../../src/pedagogy/mirror.js';
import { levelPlan } from '../../worker/level.js';
import type { Lesson, PracticeStep, Unit } from '../../src/content/schema.js';
import { CLAIMS, EXPLAIN_RESULT } from '../../scripts/lib/finales-claims.js';
import { cacheProbe, checkLine, loadCache } from '../../scripts/lib/tablebase.js';
import { describeLessons } from './lesson-checks.js';

/**
 * Finales (conceptos `endgame.*`): verificación exacta con la tablebase de Lichess desde la caché
 * test/fixtures/tablebase/positions.json (sin red). Para refrescarla contra la API: `npm run verify:finales -- --refresh`.
 */
const ENDGAME_UNITS: { id: string; level: Unit['level']; order: number; requires: string }[] = [
  { id: 'u13', level: 'basic', order: 10, requires: 'u09' },
];
const units = ENDGAME_UNITS.map((d) => UNITS.find((u) => u.id === d.id)!);
const probe = cacheProbe(loadCache());

const load = (fen: string) => Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
const stepsOf = (l: Lesson): { key: string; step: PracticeStep }[] => [
  ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i}`, step })),
  ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i}`, step })),
];

const ROLE: Record<string, Role> = { rey: 'king', dama: 'queen', torre: 'rook', alfil: 'bishop', caballo: 'knight', peón: 'pawn' };
const SAN_RE = /(?<![A-Za-z0-9])(?:[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|[a-h]x[a-h][1-8])(?:=[QRBN])?[+#]?/g;
const PIECE_RE = /\b(rey|dama|torre|alfil|caballo|peón)(?: (blanc|negr)[oa])? de ([a-h][1-8])\b/g;

/** SAN de todas las jugadas alcanzables desde `roots` en hasta `depth` medias jugadas (para buscar las citadas en el texto). */
function sansNear(roots: string[], wanted: Set<string>, depth = 4): Set<string> {
  const seen = new Set<string>();
  const found = new Set<string>();
  let frontier = roots;
  for (let d = 0; d < depth && frontier.length && [...wanted].some((w) => !found.has(w)); d++) {
    const next: string[] = [];
    for (const fen of frontier) {
      if (seen.has(fen)) continue;
      seen.add(fen);
      const pos = load(fen);
      for (const [from, dests] of pos.allDests()) {
        for (const to of dests) {
          const promo = pos.board.get(from)?.role === 'pawn' && (to >> 3 === 7 || to >> 3 === 0);
          for (const promotion of promo ? (['queen', 'rook', 'bishop', 'knight'] as Role[]) : [undefined]) {
            const mv = { from, to, promotion };
            found.add(makeSan(pos, mv));
            const child = pos.clone();
            child.play(mv);
            next.push(makeFen(child.toSetup()));
          }
        }
      }
    }
    frontier = next;
  }
  return found;
}

/** Posiciones de la línea (antes de cada jugada y la final) y, para cada jugada errónea comentada, la posición tras ella. */
function linePositions(step: PracticeStep): string[] {
  const pos = load(step.fen);
  const out = [step.fen];
  for (const u of step.solutionUci) {
    pos.play(parseUci(u)!);
    out.push(makeFen(pos.toSetup()));
  }
  for (const u of [...Object.keys(step.wrongByMove ?? {}), ...(step.alt ?? [])]) {
    const before = load(step.fen);
    if (step.alt?.includes(u)) for (const x of step.solutionUci.slice(0, -1)) before.play(parseUci(x)!);
    before.play(parseUci(u)!);
    out.push(makeFen(before.toSetup()));
  }
  return out;
}

/** Errores de coherencia texto-posición: color al turno, piezas citadas «X de casilla» y jugadas en SAN. */
function textErrors(texts: string[], positions: string[], turn?: 'white' | 'black'): string[] {
  const errors: string[] = [];
  const all = texts.join('\n');
  if (turn) {
    const m = texts[0]!.match(/^Juegan (blancas|negras)/);
    if (m && (m[1] === 'blancas') !== (turn === 'white')) errors.push(`«${m[0]}» pero juegan ${turn}`);
  }
  for (const m of all.matchAll(PIECE_RE)) {
    const [, word, color, sq] = m;
    const ok = positions.some((fen) => {
      const p = load(fen).board.get(parseSquare(sq!)!);
      return p?.role === ROLE[word!] && (!color || p?.color === (color === 'blanc' ? 'white' : 'black'));
    });
    if (!ok) errors.push(`«${m[0]}» no aparece en ninguna posición de la línea`);
  }
  const sans = new Set([...all.matchAll(SAN_RE)].map((m) => m[0]));
  const near = sansNear(positions, sans);
  for (const s of sans) if (!near.has(s)) errors.push(`${s} no es una jugada legal cerca de la línea`);
  return errors;
}

describe('contenido E: finales verificados con la tablebase (pendiente de validación de profesores)', () => {
  it('unidades con metadatos correctos y en el temario', () => {
    for (const [i, d] of ENDGAME_UNITS.entries()) {
      const u = units[i]!;
      expect(u, d.id).toBeDefined();
      expect([u.level, u.order, u.requires], d.id).toEqual([d.level, d.order, [d.requires]]);
      expect(u.lessons.length).toBe(3);
      for (const l of u.lessons) expect(l.conceptIds?.every((c) => c.startsWith('endgame.')), l.id).toBe(true);
    }
    // órdenes únicos en todo el temario (el mapa numera las unidades por `order`)
    expect(new Set(UNITS.map((u) => u.order)).size).toBe(UNITS.length);
  });

  it('el nivel elegido sigue recomendando la primera unidad de su nivel', () => {
    expect(levelPlan('basic', { units: UNITS })).toMatchObject({ recommendedUnitId: 'u07', comingSoon: false });
    expect(levelPlan('intermediate', { units: UNITS })).toMatchObject({ recommendedUnitId: 'u10', comingSoon: false });
    expect(levelPlan('advanced', { units: UNITS }).openUnitIds).toEqual(expect.arrayContaining(ENDGAME_UNITS.filter((d) => d.level !== 'advanced' && d.level !== 'competitive').map((d) => d.id)));
  });

  it('sin emojis en los textos', () => {
    expect(JSON.stringify(units)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  // Esquema y legalidad; la corrección la da la tablebase (abajo), no la búsqueda de material.
  describeLessons(units, { engine: new Set(units.flatMap((u) => u.lessons.flatMap((l) => stepsOf(l).map((s) => s.key)))) });

  for (const u of units) {
    for (const l of u.lessons) {
      describe(`${l.id} (tablebase)`, () => {
        l.explanation.forEach((e, i) => {
          it(`explicación ${i + 1}: resultado declarado y texto coherente con la posición`, () => {
            expect(probe(e.fen).category).toBe(EXPLAIN_RESULT[`${l.id}:${i}`]);
            expect(textErrors([e.text], [e.fen])).toEqual([]);
          });
        });
        for (const { key, step } of stepsOf(l)) {
          it(`${key}: se aceptan exactamente las jugadas que conservan el resultado`, () => {
            expect(checkLine(probe, step.fen, step.solutionUci, step.alt ?? [])).toEqual([]);
          });
          it(`${key}: textos coherentes con la posición`, () => {
            const texts = [step.prompt, step.hint ?? '', step.explanationCorrect, step.explanationWrong, ...Object.values(step.wrongByMove ?? {})];
            expect(textErrors(texts, linePositions(step), load(step.fen).turn)).toEqual([]);
          });
        }
      });
    }
  }

  describe('banco de finales y sus espejos', () => {
    const bank = EXERCISES.filter((e) => e.conceptId.startsWith('endgame.')).flatMap((e) => [e, mirrorExercise(e)]);
    it('al menos 4 ejercicios por concepto de finales', () => {
      for (const c of ['endgame.king_pawn', 'endgame.rook']) expect(EXERCISES.filter((e) => e.conceptId === c).length).toBeGreaterThanOrEqual(4);
    });
    for (const e of bank) {
      it(`${e.id}: tablebase y textos`, () => {
        expect(checkLine(probe, e.fen, e.solutionUci, e.alt ?? [])).toEqual([]);
        const step = { ...e, explanationCorrect: '', explanationWrong: '' } as PracticeStep;
        expect(textErrors([e.prompt, e.hint ?? ''], linePositions(step), load(e.fen).turn)).toEqual([]);
      });
    }
  });

  it('afirmaciones de los textos fuera de la línea (finales-claims.ts)', () => {
    for (const c of CLAIMS) {
      const pos = load(c.fen);
      for (const u of c.moves) pos.play(parseUci(u)!);
      expect(probe(makeFen(pos.toSetup())).category, c.where).toBe(c.result);
    }
  });

  it('el comprobador de textos detecta errores', () => {
    expect(textErrors(['Juegan blancas. El rey de e4 juega Ra1.'], ['8/4k3/8/4K3/4P3/8/8/8 b - - 0 1'], 'black').length).toBe(3);
  });
});
