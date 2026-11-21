import { describe, expect, it } from 'vitest';
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { UNITS } from '../../src/content/index.js';
import { MAX_BRANCHES } from '../../src/content/schema.js';
import { EXERCISES } from '../../src/pedagogy/exercises.js';
import { mirrorExercise } from '../../src/pedagogy/mirror.js';
import { altOf, followMove, type Branch, type Variants } from '../../src/shared/moves.js';
import { cacheProbe, checkLine, loadCache, modeFor } from '../../scripts/lib/tablebase.js';
import { leaksIn, targetsOf } from '../../scripts/lib/hint-leaks.js';

/** Ramas: alternativas intermedias del alumno con su continuación (src/shared/moves.ts), verificadas con la tablebase. */
const probe = cacheProbe(loadCache());
const ex = EXERCISES.find((e) => e.id === 'ex.rook.09')!;

const legalLine = (fen: string, line: readonly string[]) => {
  const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
  for (const u of line) {
    const m = parseUci(u)!;
    if (!pos.isLegal(m)) return false;
    pos.play(m);
  }
  return true;
};

describe('reproductor: followMove sigue la línea por la alternativa jugada', () => {
  const v: Variants = ex;
  const main = ex.solutionUci;
  const kf7 = ex.branches!.find((b) => b.line[0] === 'e8f7')!;

  it('la jugada principal sigue la línea principal', () => {
    expect(followMove(v, main, 0, 'h8h6')).toBe(main);
  });

  it('cada alternativa intermedia se acepta y la línea pasa a ser la de su rama (el rival responde según ella)', () => {
    for (const b of ex.branches!) {
      const next = followMove(v, main, 0, b.line[0]!);
      expect(next, b.line[0]).toEqual(b.line);
      expect(next![1], 'respuesta del rival de la rama').toBe(b.line[1]);
    }
  });

  it('una jugada peor (pierde las tablas) o ilegal se rechaza en la jugada intermedia', () => {
    for (const bad of ['h8h7', 'h8h5', 'e8d8', 'a1a2']) expect(followMove(v, main, 0, bad), bad).toBeNull();
  });

  it('dentro de una rama la jugada principal ya no vale y vale la de la rama y su alt', () => {
    expect(followMove(v, kf7.line, 2, 'h6h1')).toBeNull();
    expect(followMove(v, kf7.line, 2, kf7.line[2]!)).toBe(kf7.line);
    for (const a of kf7.alt!) expect(followMove(v, kf7.line, 2, a), a).toBe(kf7.line);
    expect(altOf(v, kf7.line)).toEqual(kf7.alt);
    expect(altOf(v, main)).toEqual(ex.alt);
  });

  it('no hay ramas dentro de ramas: tras tomar una, otra jugada intermedia de otra rama no vale', () => {
    const fake: Variants = { ...ex, branches: [...ex.branches!, { at: 2, line: ['h6h3', 'e8d8', 'h3h1'] } as Branch] };
    expect(followMove(fake, kf7.line, 2, 'h6h3')).toBeNull();
  });

  it('la alt de la línea principal solo vale en la última jugada de esa línea', () => {
    expect(followMove(v, main, 2, 'h6h2')).toBe(main);
    expect(followMove(v, main, 0, 'h8h2')).not.toBeNull(); // h8h2 es una rama, no la alt (la alt es de la última)
  });
});

describe('contenido con ramas', () => {
  // La tablebase solo juzga los ejercicios de finales (lecciones `endgame.*` y banco). Las ramas de ejercicios de movimiento de las
  // lecciones iniciales (u22: mover la torre a una casilla) no tienen «resultado» que verificar: la tablebase las daría todas por
  // ganadas; su corrección la fijan los tests de su unidad (unitsRusoA).
  const steps: { id: string; fen: string; solutionUci: string[]; alt?: string[]; branches?: Branch[]; tb: boolean }[] = [
    ...UNITS.flatMap((u) =>
      u.lessons.flatMap((l) =>
        [...l.practice, ...l.evaluation].map((s, i) => ({ id: `${l.id}:${i}`, ...s, tb: !!l.conceptIds?.some((c) => c.startsWith('endgame.')) })),
      ),
    ),
    ...EXERCISES.flatMap((e) => [e, mirrorExercise(e)]).map((e) => ({ ...e, tb: true })),
  ].filter((s) => s.branches?.length);

  it('hay contenido con ramas en u15 y en el banco (y en su espejo)', () => {
    const ids = steps.map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(['u15.l02:3', 'ex.rook.09', 'ex.rook.09.m']));
  });

  for (const s of steps) {
    it(`${s.id}: todas las ramas son legales, llegan al final, caben en el tope y las verifica la tablebase`, () => {
      expect(s.branches!.length).toBeLessThanOrEqual(MAX_BRANCHES);
      for (const b of s.branches!) {
        const full = [...s.solutionUci.slice(0, b.at), ...b.line];
        expect(full.length, `${b.at}:${b.line[0]}`).toBe(s.solutionUci.length);
        expect(legalLine(s.fen, full), `${b.at}:${b.line[0]}`).toBe(true);
        for (const a of b.alt ?? []) expect(legalLine(s.fen, [...full.slice(0, -1), a]), a).toBe(true);
      }
      if (s.tb) expect(checkLine(probe, s.fen, s.solutionUci, s.alt ?? [], modeFor(s.id), s.branches)).toEqual([]);
    });
  }

  it('los avisos no nombran la jugada de ninguna rama', () => {
    const t = targetsOf(ex.fen, ex.solutionUci, ex.alt, ex.branches);
    expect(leaksIn('Prueba Kf7.', t)).toEqual(['Kf7']);
    expect(leaksIn('Prueba Rh2.', t)).toEqual(['Rh2']);
    expect(leaksIn(ex.hint!, t, ex.prompt)).toEqual([]);
  });
});

describe('checkLine con ramas detecta contenido incorrecto', () => {
  const run = (branches: Branch[], alt = ex.alt) => checkLine(probe, ex.fen, ex.solutionUci, alt, 'optimal', branches);
  const [rh1, rh2, rh4, kf7] = ex.branches!;

  it('el contenido bueno cumple', () => {
    expect(run(ex.branches!)).toEqual([]);
  });

  it('falta una alternativa que conserva el resultado: error', () => {
    expect(run([rh1!, rh2!, rh4!]).join('\n')).toMatch(/Kf7.*también.*no se acepta/);
  });

  it('una alternativa que degrada el resultado: error', () => {
    const bad: Branch = { at: 0, line: ['h8h7', 'e5e6', 'h7h1'] };
    expect(run([...ex.branches!, bad]).join('\n')).toMatch(/Rh7 no conserva el resultado/);
  });

  it('falta la continuación o no llega al final: error', () => {
    expect(run([rh1!, rh2!, rh4!, { at: 0, line: ['e8f7'] }]).join('\n')).toMatch(/continuación falta/);
    expect(run([rh1!, rh2!, rh4!, { at: 0, line: ['e8f7', 'e5e6'] }]).join('\n')).toMatch(/continuación falta/);
  });

  it('una rama cuyo rival o alumno juega algo que pierde las tablas: error', () => {
    // Tras Kf7 el rival no puede empeorar su resultado... pero el alumno sí: Ke7 en vez de Kf6 pierde si hay otra jugada mejor
    const worse: Branch = { ...kf7!, line: ['e8f7', 'e5e6', 'f7g6'] };
    expect(run([rh1!, rh2!, rh4!, worse]).join('\n')).toMatch(/Kg6|rama 0:e8f7/);
  });

  it('rama en la última jugada, repetida o con más ramas que el tope: error', () => {
    expect(run([...ex.branches!, { at: 2, line: ['h6h2'] }]).join('\n')).toMatch(/intermedia/);
    expect(run([...ex.branches!, kf7!]).join('\n')).toMatch(/repetida/);
    const many = Array.from({ length: MAX_BRANCHES + 1 }, () => kf7!);
    expect(run(many).join('\n')).toMatch(/el máximo es/);
  });

  it('una rama igual a la principal: error', () => {
    expect(run([...ex.branches!, { at: 0, line: ['h8h6', 'e5e6', 'h6h1'] }]).join('\n')).toMatch(/jugada de la línea principal/);
  });
});
