import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeUci, parseSquare, parseUci, makeSquare } from 'chessops/util';
import type { Move, Role } from 'chessops/types';
import { CONCEPTS } from '../../src/pedagogy/concepts.js';
import type { ExplainStep, Unit } from '../../src/content/schema.js';
import { leaksIn, targetsOf } from '../../scripts/lib/hint-leaks.js';
import { cacheProbe, checkLine, loadCache } from '../../scripts/lib/tablebase.js';
import { CACHE_RUSO_B, RUSO_B, TB_CLAIMS, isTb, stepsOf } from '../../scripts/lib/metodo-ruso-b.js';
import { legalMoves, load, playLine, playMove } from '../pedagogy/helpers.js';
import { FACTS, SAFE_CAPTURE, SQUARE_COLORS, colorOfSq, safeCaptureErrors, techniqueErrors } from './unitsRusoB.facts.js';

/**
 * Método ruso, parte B (u25 a u29), pendiente de validación de profesores. Las unidades no están en el registro todavía:
 * se importan por su archivo. Las líneas de varias jugadas y la técnica las verifica la tablebase de Lichess desde la
 * caché (sin red): `npx tsx scripts/verify-metodo-ruso.mts` la completa y la refresca.
 */
const EXPECT: Record<string, { order: number; requires: string }> = {
  u25: { order: 6, requires: 'u24' },
  u26: { order: 7, requires: 'u25' },
  u27: { order: 8, requires: 'u26' },
  u28: { order: 9, requires: 'u27' },
  u29: { order: 10, requires: 'u28' },
};
const probe = cacheProbe(loadCache(CACHE_RUSO_B));
const units: Unit[] = RUSO_B;

const ROLE: Record<string, Role> = { rey: 'king', dama: 'queen', torre: 'rook', alfil: 'bishop', caballo: 'knight', peón: 'pawn' };
const SAN_RE = /(?<![A-Za-z0-9])(?:[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|[a-h]x[a-h][1-8]|O-O)(?:=[QRBN])?[+#]?/g;
const PIECE_RE = /\b(rey|dama|torre|alfil|caballo|peón)(?: (blanc|negr)[oa])? de ([a-h][1-8])\b/g;

/** Posiciones de la línea de un paso y las posteriores a cada jugada errónea comentada. */
function linePositions(fen: string, line: string[], wrong: string[]): string[] {
  const pos = load(fen);
  const out = [fen];
  for (const u of line) {
    pos.play(parseUci(u)!);
    out.push(makeFen(pos.toSetup()));
  }
  for (const u of wrong) {
    const p = load(fen);
    p.play(parseUci(u)!);
    out.push(makeFen(p.toSetup()));
  }
  return out;
}

/** Errores de coherencia texto-posición: piezas citadas «X de casilla» que no existen, jugadas en SAN, frases largas. */
function textErrors(texts: string[], positions: string[]): string[] {
  const errors: string[] = [];
  const all = texts.join('\n');
  for (const m of all.matchAll(PIECE_RE)) {
    const [, word, color, sq] = m;
    const ok = positions.some((fen) => {
      const p = load(fen).board.get(parseSquare(sq!)!);
      return p?.role === ROLE[word!] && (!color || p?.color === (color === 'blanc' ? 'white' : 'black'));
    });
    if (!ok) errors.push(`«${m[0]}» no aparece en ninguna posición`);
  }
  for (const m of all.matchAll(SAN_RE)) errors.push(`notación SAN en el texto: ${m[0]}`);
  for (const t of texts)
    for (const s of t.split(/[.!?]+/)) {
      const words = s.trim().split(/\s+/).filter(Boolean).length;
      if (words > 30) errors.push(`frase de ${words} palabras: «${s.trim()}»`);
    }
  return errors;
}

/** ¿Puede el bando al turno capturar en `sq`? */
const canCaptureOn = (pos: Chess, sq: number): boolean => legalMoves(pos).some((m) => m.to === sq && pos.board.get(sq) !== undefined);

/** Reglas de los avisos de `wrongByMove` que afirman un hecho: se comprueban con chessops. */
const WRONG_RULES: [string, (after: Chess, mv: Move) => boolean][] = [
  ['No es mate.', (a) => a.isCheck() && !a.isCheckmate()],
  ['No da jaque.', (a) => !a.isCheck()],
  ['Ahogado.', (a) => a.isStalemate()],
  ['La capturan.', (a, mv) => canCaptureOn(a, mv.to)],
  ['No hay captura.', (a, mv) => !canCaptureOn(a, mv.to)],
];

const mateIn = (pos: Chess, n: number): Move[] =>
  legalMoves(pos).filter((m) => {
    const q = playMove(pos, m);
    if (q.isCheckmate()) return true;
    if (n === 1 || q.isStalemate() || q.isInsufficientMaterial()) return false;
    const rs = legalMoves(q);
    return rs.length > 0 && rs.every((r) => mateIn(playMove(q, r), n - 1).length > 0);
  });

/** Casillas de destino legales de la pieza en `from` (el turno debe ser suyo). */
export const destsOf = (fen: string, from: string): string[] =>
  [...(load(fen).dests(parseSquare(from)!) ?? [])].map((s) => makeSquare(s)).sort();

describe('método ruso B: u25 a u29 (pendiente de validación de profesores)', () => {
  it('metadatos: orden, nivel, requisitos en cadena y 3 lecciones', () => {
    for (const u of units) {
      const e = EXPECT[u.id]!;
      expect([u.order, u.level, u.requires], u.id).toEqual([e.order, 'beginner', [e.requires]]);
      expect(u.lessons.length, u.id).toBe(3);
      expect(u.description.length).toBeGreaterThan(20);
    }
  });

  it('ids únicos uNN.lNN, sin emojis y sin conceptos inexistentes', () => {
    const ids = units.flatMap((u) => u.lessons.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const u of units) u.lessons.forEach((l, i) => expect([l.id, l.unitId]).toEqual([`${u.id}.l${String(i + 1).padStart(2, '0')}`, u.id]));
    expect(JSON.stringify(units)).not.toMatch(/\p{Extended_Pictographic}/u);
    const concepts = new Set(CONCEPTS.map((c) => c.id));
    for (const u of units) for (const l of u.lessons) for (const c of l.conceptIds ?? []) expect(concepts.has(c), c).toBe(true);
  });

  for (const u of units) {
    for (const l of u.lessons) {
      describe(l.id, () => {
        it('esquema: 2 explicaciones, 3 prácticas y 3 evaluaciones nuevas', () => {
          expect(l.objective.length).toBeGreaterThan(15);
          expect(l.intro.length).toBeGreaterThan(40);
          expect([l.explanation.length, l.practice.length, l.evaluation.length]).toEqual([2, 3, 3]);
          const practiceFens = new Set(l.practice.map((p) => p.fen.split(' ').slice(0, 4).join(' ')));
          for (const e of l.evaluation) expect(practiceFens.has(e.fen.split(' ').slice(0, 4).join(' ')), e.fen).toBe(false);
          expect(new Set([...l.practice, ...l.evaluation].map((s) => s.fen)).size).toBe(6);
          expect(textErrors([l.objective, l.intro], [])).toEqual([]);
        });

        l.explanation.forEach((e: ExplainStep, i) => {
          const key = `${l.id}:${i}`;
          it(`explicación ${i + 1}: forma, hechos del texto verificados y texto coherente`, () => {
            expect(e.text.trim().length).toBeGreaterThan(40);
            const pos = load(e.fen);
            for (const s of e.squares ?? []) expect(parseSquare(s), s).toBeDefined();
            for (const [a, b] of e.arrows ?? []) expect([parseSquare(a), parseSquare(b)].every((x) => x !== undefined)).toBe(true);
            const fact = FACTS[key];
            expect(fact, `${key}: falta declarar el hecho que comprueba`).toBeDefined();
            fact!(pos, e);
            expect(textErrors([e.text], [e.fen])).toEqual([]);
          });
        });

        for (const { key, step } of stepsOf(l)) {
          describe(key, () => {
            it('FEN legal, solución y jugadas erróneas legales, avisos verificados', () => {
              const pos = load(step.fen);
              const end = playLine(step.fen, step.solutionUci);
              expect(step.prompt.trim().length).toBeGreaterThan(10);
              expect(step.explanationCorrect.trim().length).toBeGreaterThan(20);
              expect(step.explanationWrong.trim().length).toBeGreaterThan(20);
              expect(step.solutionUci.length % 2).toBe(1);
              expect(step.branches ?? []).toEqual([]);
              const legal = new Set(legalMoves(pos).map(makeUci));
              for (const [uci, text] of Object.entries(step.wrongByMove ?? {})) {
                expect(legal.has(uci), `${uci} no es legal`).toBe(true);
                expect(uci).not.toBe(step.solutionUci[0]);
                expect(text.trim().length).toBeGreaterThan(15);
                const after = playLine(step.fen, [uci]);
                const mv = parseUci(uci)!;
                for (const [prefix, ok] of WRONG_RULES) if (text.startsWith(prefix)) expect(ok(after, mv), `${uci}: «${text}»`).toBe(true);
              }
            });

            it('la solución es correcta', () => {
              const pos = load(step.fen);
              const end = playLine(step.fen, step.solutionUci);
              const accepted = new Set([step.solutionUci[0]!, ...(step.solutionUci.length === 1 ? (step.alt ?? []) : [])]);
              expect(techniqueErrors(key, step.fen, step.solutionUci[0]!), key).toEqual([]);
              if (SAFE_CAPTURE.has(key)) expect(safeCaptureErrors(pos, step.solutionUci[0]!), key).toEqual([]);
              for (const [sq, color] of SQUARE_COLORS[key] ?? []) expect(colorOfSq(sq), `${key}: ${sq}`).toBe(color);
              if (isTb(key, step)) return; // lo comprueba la tablebase (abajo); aquí, que si acaba en mate lo sea de verdad
              if (end.isCheckmate()) {
                // mate en 1: la solución da mate (el resto de mates los acepta `isExpectedMove`)
                expect(step.solutionUci.length).toBe(1);
                for (const uci of Object.keys(step.wrongByMove ?? {})) expect(playLine(step.fen, [uci]).isCheckmate(), `${uci} también da mate`).toBe(false);
                return;
              }
              if (end.isStalemate()) {
                // ejercicio de ahogado: toda jugada que ahoga está aceptada
                const all = legalMoves(pos).filter((m) => playMove(pos, m).isStalemate()).map(makeUci);
                for (const a of all) expect(accepted.has(a), `${a} también ahoga y no se acepta`).toBe(true);
                return;
              }
              // movimiento o captura: todas las jugadas a la misma casilla están aceptadas, y solo esas
              const to = (parseUci(step.solutionUci[0]!) as { to: number }).to;
              const same = legalMoves(pos).filter((m) => m.to === to).map(makeUci);
              for (const a of same) expect(accepted.has(a), `${a} llega a la misma casilla y no se acepta`).toBe(true);
              for (const a of accepted) expect(same.includes(a), `${a} no llega a la casilla de la solución`).toBe(true);
            });

            it('textos: sin notación SAN, frases cortas, piezas citadas existentes y avisos sin fuga', () => {
              const texts = [step.prompt, step.hint ?? '', step.explanationCorrect, step.explanationWrong, ...Object.values(step.wrongByMove ?? {})];
              expect(textErrors(texts, linePositions(step.fen, step.solutionUci, Object.keys(step.wrongByMove ?? {})))).toEqual([]);
              const targets = targetsOf(step.fen, step.solutionUci, step.alt, step.branches);
              expect(targets.length).toBeGreaterThan(0);
              const avisos: [string, string | undefined][] = [
                ['hint', step.hint],
                ['explanationWrong', step.explanationWrong],
                ...Object.entries(step.wrongByMove ?? {}).map(([uci, text]): [string, string] => [`wrongByMove[${uci}]`, text]),
              ];
              for (const [kind, text] of avisos) if (text) expect(leaksIn(text, targets, step.prompt), `${kind}: «${text}»`).toEqual([]);
            });

            if (isTb(key, step)) {
              it('tablebase: se aceptan exactamente las jugadas que ganan lo antes posible (caché)', () => {
                expect(checkLine(probe, step.fen, step.solutionUci, step.alt ?? [], 'optimal')).toEqual([]);
                const end = playLine(step.fen, step.solutionUci);
                if (end.isCheckmate() && step.solutionUci.length <= 5) {
                  // mate en N: ninguna jugada fuerza el mate antes (comprobación independiente con chessops)
                  const n = (step.solutionUci.length + 1) / 2;
                  const pos = load(step.fen);
                  expect(mateIn(pos, n).map(makeUci), key).toContain(step.solutionUci[0]);
                  if (n > 1) expect(mateIn(pos, n - 1), key).toEqual([]);
                }
                // «Mate en N» del enunciado: la tablebase da mate en 2N-1 medias jugadas
                if (end.isCheckmate()) expect(probe(step.fen).dtm, key).toBe(step.solutionUci.length);
              });
            }
          });
        }
      });
    }
  }

  it('afirmaciones de los textos que dependen de la tablebase', () => {
    for (const c of TB_CLAIMS) {
      const pos = load(c.fen);
      for (const u of c.moves) pos.play(parseUci(u)!);
      expect(probe(makeFen(pos.toSetup())).category, c.where).toBe(c.result);
    }
  });

  it('los comprobadores detectan errores', () => {
    expect(textErrors(['El rey de e4 juega Rb7.'], ['8/4k3/8/4K3/8/8/8/8 b - - 0 1']).length).toBe(2);
    expect(textErrors(['Una dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte veintiuna veintidós veintitrés veinticuatro veinticinco veintiséis veintisiete veintiocho veintinueve treinta treintaiuna.'], []).length).toBe(1);
    expect(destsOf('6k1/8/8/8/3B4/8/8/7K w - - 0 1', 'd4').length).toBe(13);
    void parseFen;
  });
});
