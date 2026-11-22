/** «Por qué» automático: textos fijos (golden) por tipo de hecho y reglas del generador (tope, solapamiento, determinismo). */
import { describe, expect, it } from 'vitest';
import { MAX_CHARS, MAX_SENTENCES, overlap, rawWhy, whyError, whyLesson } from '../../src/pedagogy/why.js';
import { canCaptureOn, loadPosition } from '../../src/diagnosis/chess-utils.js';

interface Case {
  name: string;
  fen: string;
  line: string[];
  played?: string;
  good?: Record<string, string>;
  bad?: Record<string, string>;
}

const CASES: Case[] = [
  { name: 'jaque mate', fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', line: ['d1d8'], good: { mate: 'La torre da jaque mate en d8: el rey rival está atacado y ninguna jugada lo salva.' } },
  { name: 'captura sin recaptura', fen: '4k3/8/8/3n4/8/8/3R4/4K3 w - - 0 1', line: ['d2d5'], good: { 'capture-free': 'La torre captura el caballo en d5 y el rival no puede recapturar.' } },
  { name: 'captura al paso', fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', line: ['e5d6'], good: { 'capture-free': 'El peón captura al paso el peón de d5 y el rival no puede recapturar.' } },
  { name: 'captura de pieza mayor', fen: '4k3/8/4p3/3q4/8/8/8/3RK3 w - - 0 1', line: ['d1d5'], good: { 'capture-wins': 'La torre captura la dama en d5: vale más que la torre, y aunque haya recaptura el cambio sale a favor.' } },
  { name: 'ataque doble', fen: '4k3/8/1r3q2/8/8/4N3/8/4K3 w - - 0 1', line: ['e3d5'], good: { fork: 'Desde d5, el caballo amenaza a la torre en b6 y a la dama en f6 al mismo tiempo.' } },
  { name: 'ataque doble con jaque', fen: '4k3/1q6/8/8/4N3/8/8/4K3 w - - 0 1', line: ['e4d6'], good: { fork: 'Con el jaque, el caballo en d6 también ataca a la dama en b7.' } },
  { name: 'jaque', fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1', line: ['a1a8'], good: { check: 'La torre ataca al rey desde a8, así que el rival está obligado a responder al jaque.' } },
  { name: 'jaque descubierto', fen: '4k3/8/8/8/8/8/4B3/4RK2 w - - 0 1', line: ['e2f3'], good: { discovered: 'El alfil se aparta y la torre da jaque al descubierto.' } },
  { name: 'clavada', fen: '4k3/8/8/4n3/8/8/3Q1PPP/6K1 w - - 0 1', line: ['d2e3'], good: { pin: 'La dama en e3 clava el caballo: si se mueve, el rey rival quedaría en jaque.' } },
  { name: 'poner a salvo', fen: '4k3/8/8/8/3p4/2R5/8/4K3 w - - 0 1', line: ['c3a3'], good: { saves: 'La torre en c3 corría peligro por el peón rival. Esa jugada la deja a salvo.' } },
  { name: 'tapar un jaque', fen: '4r1k1/8/8/8/8/8/3B4/4K3 w - - 0 1', line: ['d2e3'], good: { block: 'El alfil responde al jaque poniéndose en medio, entre el rey y la pieza que ataca.' } },
  { name: 'rey sale del jaque', fen: '4r1k1/8/8/8/8/8/3B4/4K3 w - - 0 1', line: ['e1d1'], good: { escape: 'El rey se aparta del jaque hacia una casilla segura.' } },
  { name: 'enroque', fen: 'r3k2r/8/8/8/8/8/5PPP/R3K2R w KQkq - 0 1', line: ['e1g1'], good: { castle: 'Al enrocar, el rey queda protegido tras sus peones y la torre entra en juego.' } },
  { name: 'coronación', fen: '8/4P1k1/8/8/8/8/8/4K3 w - - 0 1', line: ['e7e8q'], good: { promotion: 'El peón corona en e8: ahora hay una dama más en el tablero.' } },
  { name: 'mate al final de la secuencia', fen: '7k/8/8/8/8/8/R7/1R5K w - - 0 1', line: ['a2a7', 'h8g8', 'b1b8'], good: { 'mate-line': 'La secuencia termina en jaque mate.' } },
  {
    name: 'material de la secuencia',
    fen: '4k3/8/1r3q2/8/8/4N3/8/4K3 w - - 0 1',
    line: ['e3d5', 'f6h6', 'd5b6', 'h6b6'],
    good: { 'line-material': 'Siguiendo la secuencia, capturas una torre y el rival solo captura un caballo.' },
  },
  { name: 'mala captura', fen: '4k3/8/4p3/3p4/8/8/3Q4/4K3 w - - 0 1', line: ['e1f1'], played: 'd2d5', bad: { 'bad-trade': 'La dama captura un peón, pero el peón rival puede capturarla después y el cambio sale perdiendo.' } },
  { name: 'pieza movida sin protección', fen: '4k3/8/4p3/8/8/8/3Q4/4K3 w - - 0 1', line: ['e1f1'], played: 'd2d5', bad: { hangs: 'En d5, la dama no tiene protección: el peón rival puede capturarla gratis.' } },
  { name: 'pieza que se deja sin defensa', fen: '3qk3/8/8/B7/8/8/8/R3K3 w - - 0 1', line: ['a1a2'], played: 'a1b1', bad: { hangs: 'Tras esa jugada, el alfil en a5 queda sin protección: la dama rival puede capturarlo gratis.' } },
  { name: 'amenaza no atendida', fen: '4k3/8/8/8/3p4/2R5/8/4K3 w - - 0 1', line: ['c3a3'], played: 'e1e2', bad: { 'ignored-threat': 'La torre en c3 seguía en peligro: el peón rival podía capturarla.' } },
  { name: 'mate permitido', fen: '4r1k1/8/8/8/8/8/P4PPP/6K1 w - - 0 1', line: ['g1h1'], played: 'a2a3', bad: { 'mate-allowed': 'El rival ya amenazaba dar jaque mate en una jugada y esa jugada no lo evita.' } },
  { name: 'ataque doble permitido', fen: '4k3/8/8/4n3/8/8/1R1Q4/4K3 w - - 0 1', line: ['d2d5'], played: 'e1f1', bad: { 'fork-allowed': 'Tras esa jugada, el rival puede mover el caballo a c4 y atacar a la vez a la torre en b2 y a la dama en d2.' } },
  { name: 'clavada permitida', fen: '4r1k1/8/8/8/8/2N5/8/4K3 w - - 0 1', line: ['c3d5'], played: 'c3e2', bad: { 'pin-allowed': 'Tras esa jugada, la torre rival clava el caballo en e2: no puede moverse sin dejar al rey en jaque.' } },
  {
    name: 'descubierto permitido',
    fen: '4r1k1/8/8/4n3/8/3B4/8/4K3 w - - 0 1',
    line: ['d3c4'],
    played: 'd3c4',
    bad: { 'discovered-allowed': 'El rival puede capturar el alfil en c4 y, al apartarse su caballo, la torre suya da jaque.' },
  },
  { name: 'ataque doble con jaque permitido', fen: '4k3/8/8/4n3/8/8/3Q1PPP/6K1 w - - 0 1', line: ['d2e2'], played: 'g2g3', bad: { 'fork-allowed': 'Tras esa jugada, el rival puede mover el caballo a f3 y atacar a la vez al rey y a la dama en d2.' } },
  { name: 'ataque descubierto permitido', fen: '3q2k1/8/8/8/3N4/8/8/3RK3 b - - 0 1', line: ['d8d4'], played: 'g8h8', bad: { 'discovered-attack-allowed': 'Tras esa jugada, el caballo rival puede apartarse de d4 y dejar que la torre suya ataque a la dama en d8.' } },
];

describe('why: textos fijos por tipo de hecho', () => {
  for (const c of CASES) {
    it(c.name, () => {
      const r = rawWhy(c.fen, c.line, c.played);
      for (const [kind, text] of Object.entries(c.good ?? {})) expect(r.good.find((s) => s.kind === kind)?.text).toBe(text);
      for (const [kind, text] of Object.entries(c.bad ?? {})) expect(r.bad.find((s) => s.kind === kind)?.text).toBe(text);
    });
  }

  it('sin hecho que afirmar no escribe nada (nunca relleno)', () => {
    // Dama por peón protegido: no hay captura ganadora, jaque, amenaza ni clavada que contar.
    expect(rawWhy('4k3/8/4p3/3p4/8/8/3Q4/4K3 w - - 0 1', ['d2d5']).good).toEqual([]);
    expect(whyLesson({ fen: '4k3/8/4p3/3p4/8/8/3Q4/4K3 w - - 0 1', line: ['e1f1'], known: [] })).toBeNull();
    expect(whyError({ fen: '4k3/8/4p3/8/8/8/3Q4/4K3 w - - 0 1', played: 'e1f1', best: 'e1d1', known: [] })).toBeNull();
  });

  it('es determinista y nunca pasa de 3 frases ni de 300 caracteres', () => {
    for (const c of CASES) {
      const t = whyLesson({ fen: c.fen, line: c.line, ...(c.played ? { played: c.played } : {}), known: [] });
      expect(whyLesson({ fen: c.fen, line: c.line, ...(c.played ? { played: c.played } : {}), known: [] })).toBe(t);
      if (!t) continue;
      expect(t.length).toBeLessThanOrEqual(MAX_CHARS);
      expect(t.split(/(?<=\.)\s/).length).toBeLessThanOrEqual(MAX_SENTENCES);
      expect(t).not.toMatch(/\p{Extended_Pictographic}|centipe|\bcp\b|\d,\d|stockfish|motor/iu);
    }
  });

  it('las frases de un mismo texto no se repiten entre sí', () => {
    for (const c of CASES) {
      const t = whyLesson({ fen: c.fen, line: c.line, ...(c.played ? { played: c.played } : {}), known: [] });
      const parts = (t ?? '').split(/(?<=\.)\s/);
      expect(new Set(parts).size).toBe(parts.length);
    }
  });

  it('una posición con varias plantillas posibles no suena siempre igual', () => {
    const texts = new Set<string>();
    // La misma jugada en posiciones distintas (otro FEN) puede elegir otra plantilla.
    for (const f of ['4k3/8/8/3n4/8/8/3R4/4K3 w - - 0 1', '4k3/8/8/3n4/8/8/3R4/3K4 w - - 0 1', '5k2/8/8/3n4/8/8/3R4/4K3 w - - 0 1', '4k3/8/8/3n4/8/8/3R4/5K2 w - - 0 1', '3k4/8/8/3n4/8/8/3R4/4K3 w - - 0 1', '4k3/8/8/3n4/8/8/3R4/6K1 w - - 0 1']) {
      const s = rawWhy(f, ['d2d5']).good.find((x) => x.kind === 'capture-free')?.text;
      if (s) texts.add(s);
    }
    expect(texts.size).toBeGreaterThan(1);
  });

  it('afirmaciones comprobadas aparte: captura sin recaptura y mate', () => {
    const pos = loadPosition('4k3/8/8/3n4/8/8/3R4/4K3 w - - 0 1')!;
    const after = pos.clone();
    after.play({ from: 11, to: 35 });
    expect(canCaptureOn(after, 35)).toBe(false);
    const mate = loadPosition('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1')!.clone();
    mate.play({ from: 3, to: 59 });
    expect(mate.isCheckmate()).toBe(true);
  });
});

describe('why: no repite lo que el alumno ya leyó', () => {
  const fen = '4k3/8/8/3n4/8/8/3R4/4K3 w - - 0 1';
  it('con una explicación que ya dice lo mismo no añade nada', () => {
    expect(whyLesson({ fen, line: ['d2d5'], known: ['La torre captura el caballo en d5 porque nadie podía recapturar.'] })).toBeNull();
    expect(overlap('La torre captura el caballo en d5 y el rival no puede recapturar.', ['La torre captura el caballo en d5 porque nadie podía recapturar.'])).toBeGreaterThanOrEqual(0.6);
  });
  it('con una explicación distinta sí lo añade', () => {
    expect(whyLesson({ fen, line: ['d2d5'], known: ['Muy bien. Recuerda mirar siempre las piezas del rival.'] })).toBe('La torre captura el caballo en d5 y el rival no puede recapturar.');
  });
});

describe('why: errores de partida', () => {
  it('cuenta lo que hacía la jugada del alumno y lo que lograba la mejor', () => {
    // Dama a d5 (la captura el peón) frente a la torre que captura la torre rival sin protección.
    const fen = '4k2r/8/4p3/8/8/8/3Q4/4K2R w - - 0 1';
    expect(whyError({ fen, played: 'd2d5', best: 'h1h8', known: [] })).toBe(
      'En d5, la dama no tiene protección: el peón rival puede capturarla gratis. En cambio, la torre toma la torre en h8 gratis: no hay ninguna pieza rival que pueda recapturar. La torre da jaque desde h8: el rival tiene que atender al rey antes que a nada.',
    );
  });
  it('tipos sin hecho propio de la mejor jugada solo cuentan lo que dejaba la del alumno', () => {
    const t = whyError({ fen: '3qk3/8/8/B7/8/8/8/R3K3 w - - 0 1', played: 'a1b1', best: 'a1a2', known: [] });
    expect(t).toBe('Tras esa jugada, el alfil en a5 queda sin protección: la dama rival puede capturarlo gratis.');
  });
  it('pieza amenazada que la jugada del alumno no salvó y la mejor sí: una sola frase', () => {
    const t = whyError({ fen: '4k3/8/8/8/1b6/2N5/8/R3K3 w - - 0 1', played: 'a1b1', best: 'a1c1', known: [] });
    expect(t).toBe('El caballo en c3 ya estaba amenazado por el alfil rival y esa jugada no lo puso a salvo; con la mejor, sí.');
  });
  it('usa la línea del motor si empieza por la mejor jugada', () => {
    const fen = '4k3/8/1r3q2/8/8/4N3/8/4K3 w - - 0 1';
    const t = whyError({ fen, played: 'e1d1', best: 'e3d5', line: ['e3d5', 'f6h6', 'd5b6', 'h6b6'], known: [] });
    expect(t).toBe('Tras esa jugada, el rival puede mover la dama a f3 y atacar a la vez al rey y al caballo en e3. En cambio, desde d5, el caballo amenaza a la torre en b6 y a la dama en f6 al mismo tiempo. En la secuencia ganas una torre y pierdes un caballo.');
  });
});
