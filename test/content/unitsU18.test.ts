import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { parseSquare, parseUci } from 'chessops/util';
import type { Role } from 'chessops/types';
import { unit as u18 } from '../../src/content/units/u18.js';
import type { Lesson, PracticeStep, Unit } from '../../src/content/schema.js';
import { CLAIMS, EXPLAIN_RESULT, ONLY_RESULT } from '../../scripts/lib/finales-claims.js';
import { cacheProbe, checkLine, loadCache, modeFor, onlyResultErrors } from '../../scripts/lib/tablebase.js';
import { describeLessons } from './lesson-checks.js';

/**
 * u18 «Finales prácticos: dama, alfil y caballo»: verificación exacta con la tablebase de Lichess desde la caché
 * test/fixtures/tablebase/positions.json (sin red; `npm run verify:finales -- --refresh` la refresca).
 * La unidad se importa directamente (la registra el orquestador en src/content/index.ts).
 */
const units: Unit[] = [u18];
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
  for (const b of step.branches ?? []) {
    const before = load(step.fen);
    for (const x of [...step.solutionUci.slice(0, b.at), ...b.line]) {
      out.push(makeFen(before.toSetup()));
      before.play(parseUci(x)!);
    }
    out.push(makeFen(before.toSetup()));
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

describe('contenido u18: finales con dama, alfil y caballo verificados con la tablebase (pendiente de validación de profesores)', () => {
  it('unidad con metadatos correctos', () => {
    expect([u18.id, u18.level, u18.requires]).toEqual(['u18', 'advanced', ['u15']]);
    expect(u18.lessons.length).toBe(3);
    for (const l of u18.lessons) expect(l.conceptIds?.every((c) => c.startsWith('endgame.')), l.id).toBe(true);
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
            expect(checkLine(probe, step.fen, step.solutionUci, step.alt ?? [], modeFor(key), step.branches ?? [])).toEqual([]);
          });
          if (ONLY_RESULT.includes(key))
            it(`${key}: el texto dice «la única jugada»: no hay otra que conserve el resultado`, () => {
              expect(onlyResultErrors(probe, step.fen, step.solutionUci, step.alt ?? [])).toEqual([]);
            });
          it(`${key}: textos coherentes con la posición`, () => {
            const texts = [step.prompt, step.hint ?? '', step.explanationCorrect, step.explanationWrong, ...Object.values(step.wrongByMove ?? {})];
            expect(textErrors(texts, linePositions(step), load(step.fen).turn)).toEqual([]);
          });
        }
      });
    }
  }

  it('afirmaciones de los textos fuera de la línea (finales-claims.ts)', () => {
    for (const c of CLAIMS) {
      const pos = load(c.fen);
      for (const u of c.moves) pos.play(parseUci(u)!);
      expect(probe(makeFen(pos.toSetup())).category, c.where).toBe(c.result);
    }
  });

  it('l01 expl. 2: tras Qg3 el rey negro queda ahogado', () => {
    const pos = load('6Q1/8/8/8/8/8/K6p/7k w - - 0 1');
    pos.play(parseUci('g8g3')!);
    expect(pos.isStalemate()).toBe(true);
  });

  it('el comprobador de textos detecta errores', () => {
    expect(textErrors(['Juegan blancas. El rey de e4 juega Ra1.'], ['8/4k3/8/4K3/4P3/8/8/8 b - - 0 1'], 'black').length).toBe(3);
  });
});
