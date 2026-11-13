import { describe, expect, it } from 'vitest';
import { Chess, normalizeMove } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeSquare, parseSquare, parseUci } from 'chessops/util';
import type { NormalMove, Role } from 'chessops/types';
type Move = NormalMove;
import { UNITS, LESSONS, getLesson } from '../../src/content/index.js';
import { CONCEPTS } from '../../src/pedagogy/concepts.js';
import type { Lesson, PracticeStep, ExplainStep, BoardMark } from '../../src/content/schema.js';

const IDS = ['u01', 'u02', 'u03'];
const units = UNITS.filter((u) => IDS.includes(u.id));
const lessons: Lesson[] = units.flatMap((u) => u.lessons);

const VALUE: Record<Role, number> = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };

function load(fen: string): Chess {
  const setup = parseFen(fen);
  if (setup.isErr) throw new Error(`FEN no válido: ${fen}`);
  const r = Chess.fromSetup(setup.unwrap());
  if (r.isErr) throw new Error(`FEN ilegal (${String(r.error)}): ${fen}`);
  return r.unwrap();
}

function parseMove(pos: Chess, uci: string): Move {
  const m = parseUci(uci);
  if (!m) throw new Error(`UCI no válido: ${uci}`);
  return normalizeMove(pos, m) as Move;
}

function playLine(fen: string, line: string[]): Chess {
  const pos = load(fen);
  for (const u of line) {
    const m = parseMove(pos, u);
    if (!pos.isLegal(m)) throw new Error(`Jugada ilegal ${u} en ${pos.turn} (${fen})`);
    pos.play(m);
  }
  return pos;
}

function allMoves(pos: Chess): Move[] {
  const out: Move[] = [];
  for (const [from, dests] of pos.allDests()) {
    for (const to of dests) {
      const piece = pos.board.get(from)!;
      const lastRank = to >> 3 === 0 || to >> 3 === 7;
      out.push(piece.role === 'pawn' && lastRank ? { from, to, promotion: 'queen' } : { from, to });
    }
  }
  return out;
}

function gain(pos: Chess, m: Move): number {
  const target = pos.board.get(m.to);
  const mover = pos.board.get(m.from)!;
  if (target && target.color !== mover.color) return VALUE[target.role];
  if (mover.role === 'pawn' && !target && (m.from & 7) !== (m.to & 7)) return 1; // al paso
  return 0;
}

/** Búsqueda de 3 capas: yo muevo, el rival responde (cualquier cosa), yo recapturo si me conviene. */
function score(pos: Chess, m: Move): number {
  const g1 = gain(pos, m);
  const a = pos.clone();
  a.play(m);
  const replies = allMoves(a);
  if (replies.length === 0) return g1;
  let worst = Infinity;
  for (const r of replies) {
    const g2 = gain(a, r);
    const b = a.clone();
    b.play(r);
    let best3 = 0;
    for (const c of allMoves(b)) {
      const g3 = gain(b, c);
      if (g3 === 0) continue;
      // si el rival puede recapturar en la casilla de llegada, restamos el valor de mi pieza
      const mover = b.board.get(c.from)!;
      const d = b.clone();
      d.play(c);
      const recaptured = allMoves(d).some((x) => x.to === c.to && gain(d, x) > 0);
      best3 = Math.max(best3, g3 - (recaptured ? VALUE[mover.role] : 0));
    }
    worst = Math.min(worst, -g2 + best3);
  }
  return g1 + worst;
}

function mateInOneMoves(pos: Chess): Move[] {
  return allMoves(pos).filter((m) => {
    const p = pos.clone();
    p.play(m);
    return p.isCheckmate();
  });
}

function nonEmpty(s: unknown): boolean {
  return typeof s === 'string' && s.trim().length > 0;
}

const norm = (fen: string): string => fen.split(' ').slice(0, 4).join(' ');

function exercises(l: Lesson): { key: string; step: PracticeStep; kind: 'practice' | 'evaluation' }[] {
  return [
    ...l.practice.map((step, i) => ({ key: `${l.id}:practice:${i + 1}`, step, kind: 'practice' as const })),
    ...l.evaluation.map((step, i) => ({ key: `${l.id}:evaluation:${i + 1}`, step, kind: 'evaluation' as const })),
  ];
}

function checkMark(mark: BoardMark, where: string): void {
  for (const s of mark.squares ?? []) expect(parseSquare(s), `${where} casilla ${s}`).toBeDefined();
  for (const [a, b] of mark.arrows ?? []) {
    expect(parseSquare(a), `${where} flecha ${a}`).toBeDefined();
    expect(parseSquare(b), `${where} flecha ${b}`).toBeDefined();
  }
}

describe('contenido unidades 1-3: estructura', () => {
  it('existen u01-u03 con los datos esperados', () => {
    expect(units.map((u) => u.id)).toEqual(IDS);
    expect(units.map((u) => u.order)).toEqual([1, 2, 3]);
    for (const u of units) {
      expect(u.level).toBe('beginner');
      expect(nonEmpty(u.title) && nonEmpty(u.description), u.id).toBe(true);
      expect(u.lessons.length, u.id).toBeGreaterThanOrEqual(3);
      expect(u.lessons.length, u.id).toBeLessThanOrEqual(4);
    }
    expect(units[0]!.requires).toEqual([]);
    expect(units[1]!.requires).toEqual(['u01']);
    expect(units[2]!.requires).toEqual(['u02']);
  });

  it('ids de lección únicos y coherentes con su unidad', () => {
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const u of units) {
      u.lessons.forEach((l, i) => {
        expect(l.id).toBe(`${u.id}.l${String(i + 1).padStart(2, '0')}`);
        expect(l.unitId).toBe(u.id);
        expect(getLesson(l.id)).toBe(l);
      });
    }
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });

  it('exactamente una lección demo: u01.l01', () => {
    expect(lessons.filter((l) => l.demo === true).map((l) => l.id)).toEqual(['u01.l01']);
  });

  it('conceptIds existen', () => {
    const known = new Set(CONCEPTS.map((c) => c.id));
    for (const l of lessons) for (const c of l.conceptIds ?? []) expect(known.has(c), `${l.id} ${c}`).toBe(true);
  });
});

for (const l of lessons) {
  describe(`lección ${l.id} ${l.title}`, () => {
    it('esquema completo y textos no vacíos', () => {
      expect(nonEmpty(l.title) && nonEmpty(l.objective) && nonEmpty(l.intro)).toBe(true);
      expect(l.intro.length).toBeGreaterThan(80);
      expect(l.explanation.length).toBeGreaterThanOrEqual(2);
      expect(l.explanation.length).toBeLessThanOrEqual(4);
      expect(l.practice.length).toBeGreaterThanOrEqual(3);
      expect(l.practice.length).toBeLessThanOrEqual(5);
      expect(l.evaluation.length).toBe(3);
      if (l.passMark !== undefined) {
        expect(l.passMark).toBeGreaterThanOrEqual(1);
        expect(l.passMark).toBeLessThanOrEqual(3);
      }
      l.explanation.forEach((s: ExplainStep, i) => {
        expect(nonEmpty(s.text) && nonEmpty(s.fen), `explicación ${i + 1}`).toBe(true);
        checkMark(s, `${l.id} explicación ${i + 1}`);
      });
      for (const { key, step } of exercises(l)) {
        expect(nonEmpty(step.prompt), key).toBe(true);
        expect(nonEmpty(step.explanationCorrect), key).toBe(true);
        expect(nonEmpty(step.explanationWrong), key).toBe(true);
        expect(step.solutionUci.length, key).toBeGreaterThanOrEqual(1);
        expect(step.solutionUci.length % 2, `${key}: la línea debe acabar con jugada del alumno`).toBe(1);
        if (step.hint !== undefined) expect(nonEmpty(step.hint), key).toBe(true);
        checkMark(step, key);
      }
    });

    it('todas las FEN son legales y las soluciones son legales jugada por jugada', () => {
      for (const s of l.explanation) expect(() => load(s.fen), s.fen).not.toThrow();
      for (const { key, step } of exercises(l)) {
        expect(() => playLine(step.fen, step.solutionUci), key).not.toThrow();
      }
    });

    it('wrongByMove: jugadas legales, distintas de la solución y con texto', () => {
      for (const { key, step } of exercises(l)) {
        const pos = load(step.fen);
        for (const [uci, text] of Object.entries(step.wrongByMove ?? {})) {
          expect(nonEmpty(text), `${key} ${uci}`).toBe(true);
          expect(uci, key).not.toBe(step.solutionUci[0]);
          const m = parseMove(pos, uci);
          expect(pos.isLegal(m), `${key}: ${uci} no es legal`).toBe(true);
          if (/^¡Ahogado/.test(text)) {
            const p = pos.clone();
            p.play(m);
            expect(p.isStalemate(), `${key}: ${uci} debería ahogar`).toBe(true);
          }
        }
      }
    });

    it('casillas marcadas contienen lo que dicen (flechas parten de una pieza)', () => {
      for (const s of l.explanation) {
        const pos = load(s.fen);
        for (const [a] of s.arrows ?? []) {
          expect(pos.board.get(parseSquare(a)!), `${l.id} flecha desde ${a} sin pieza`).toBeDefined();
        }
      }
    });

    it('mates reales y únicos en los ejercicios de mate', () => {
      for (const { key, step } of exercises(l)) {
        if (!/\bmate\b/i.test(step.prompt)) continue;
        const end = playLine(step.fen, step.solutionUci);
        expect(end.isCheckmate(), `${key}: la solución debe dar mate`).toBe(true);
        if (/mate en 1/i.test(step.prompt) && !/varias/i.test(step.prompt)) {
          const pos = load(step.fen);
          const mates = mateInOneMoves(pos).map((m) => makeSquare(m.from) + makeSquare(m.to));
          expect(mates, `${key}: mate en 1 único`).toEqual([step.solutionUci[0]!.slice(0, 4)]);
        }
      }
    });

    it('las explicaciones sobre mate/ahogado/material coinciden con la posición final', () => {
      for (const { key, step } of exercises(l)) {
        const end = playLine(step.fen, step.solutionUci);
        if (/ahogado/i.test(step.explanationCorrect) && /¡Ahogado/.test(step.explanationCorrect)) {
          expect(end.isStalemate(), key).toBe(true);
        }
        if (/material insuficiente/i.test(step.explanationCorrect)) {
          expect(end.isInsufficientMaterial(), key).toBe(true);
        }
        if (/jaque mate/i.test(step.explanationCorrect) && /^(Mate|Da mate)/i.test(step.prompt)) {
          expect(end.isCheckmate(), key).toBe(true);
        }
      }
    });

    it('la evaluación usa posiciones distintas de la práctica', () => {
      const practice = new Set(l.practice.map((p) => norm(p.fen)));
      const seen = new Set<string>();
      for (const e of l.evaluation) {
        expect(practice.has(norm(e.fen)), `${l.id} evaluación repite práctica`).toBe(false);
        expect(seen.has(norm(e.fen)), `${l.id} evaluación repetida`).toBe(false);
        seen.add(norm(e.fen));
      }
      expect(new Set(l.practice.map((p) => norm(p.fen))).size).toBe(l.practice.length);
    });
  });
}

describe('FEN de ejercicios únicas en todo u01-u03', () => {
  it('ninguna posición de práctica/evaluación se repite entre lecciones', () => {
    const seen = new Map<string, string>();
    for (const l of lessons) {
      for (const { key, step } of exercises(l)) {
        const n = norm(step.fen);
        expect(seen.has(n), `${key} repite ${seen.get(n)}`).toBe(false);
        seen.set(n, key);
      }
    }
  });
});

describe('u02: la solución es la mejor jugada por material (búsqueda de 3 capas)', () => {
  const u02 = units.find((u) => u.id === 'u02')!;
  for (const l of u02.lessons) {
    for (const { key, step } of exercises(l)) {
      it(key, () => {
        const pos = load(step.fen);
        const sol = parseMove(pos, step.solutionUci[0]!);
        const solScore = score(pos, sol);
        const others = allMoves(pos)
          .filter((m) => !(m.from === sol.from && m.to === sol.to))
          .map((m) => ({ uci: makeSquare(m.from) + makeSquare(m.to), s: score(pos, m) }));
        const better = others.filter((o) => o.s > solScore);
        expect(better, `${key}: hay jugadas mejores por material (sol=${solScore})`).toEqual([]);
        if (/^(Gana|Captura|Elige la captura|Cambia)/.test(step.prompt)) {
          expect(solScore, `${key}: la captura debe ganar material`).toBeGreaterThan(0);
        }
      });
    }
  }
});
