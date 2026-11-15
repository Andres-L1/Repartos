// Funciones puras del auditor de contenido (scripts/audit/lib.ts). El análisis con motor no entra en `npm test`.
import { describe, expect, it } from 'vitest';
import {
  checkMaterialClaim,
  checkMateClaim,
  checkSanMentions,
  compareSolution,
  followToStable,
  isDirected,
  type Line,
  lineScore,
  lintText,
  loadPos,
  matesInOne,
  parseClaims,
  sanTokens,
} from '../../scripts/audit/lib.js';

const types = (fs: { type: string }[]) => fs.map((x) => x.type);
const san = (u: string) => u;

describe('posiciones', () => {
  it('detecta FEN ilegal', () => {
    expect(typeof loadPos('8/8/8/8/8/8/8/8 w - - 0 1')).toBe('string');
    expect(typeof loadPos('4k3/8/8/8/8/8/8/4K3 w - - 0 1')).not.toBe('string');
  });
  it('cuenta los mates en 1', () => {
    const pos = loadPos('7k/5K2/8/8/8/8/8/6Q1 w - - 0 1');
    if (typeof pos === 'string') throw new Error(pos);
    expect(matesInOne(pos).sort()).toEqual(['g1g7', 'g1g8', 'g1h1', 'g1h2']);
  });
});

describe('comparación con el motor', () => {
  it('mate más corto puntúa más', () => {
    expect(lineScore({ mate: 1 })).toBeGreaterThan(lineScore({ mate: 3 }));
    expect(lineScore({ mate: 3 })).toBeGreaterThan(lineScore({ cp: 5000 }));
    expect(lineScore({ mate: -2 })).toBeLessThan(lineScore({ cp: -5000 }));
  });
  it('marca solución mala y alternativas cercanas', () => {
    const lines = [
      { cp: 80, pv: ['a'] },
      { cp: 10, pv: ['b'] },
      { cp: 0, pv: ['c'] },
    ];
    const fs = compareSolution(lines, 'c', lines[2]!, san);
    expect(types(fs)).toEqual(['SOLUCION_NO_ES_LA_MEJOR', 'ALTERNATIVA_IGUAL_O_MEJOR', 'ALTERNATIVA_IGUAL_O_MEJOR']);
  });
  it('si la solución sigue ganando, solo avisa', () => {
    const lines = [{ mate: 5, pv: ['a'] }, { cp: 900, pv: ['b'] }];
    expect(types(compareSolution(lines, 'b', lines[1]!, san))).toEqual(['SOLUCION_SUBOPTIMA_GANADORA', 'ALTERNATIVA_IGUAL_O_MEJOR']);
  });
  it('posición ya perdida, jugada dirigida y alternativas en posición ganada', () => {
    const lost = [{ cp: -2900, pv: ['a'] }, { cp: -3000, pv: ['b'] }];
    expect(types(compareSolution(lost, 'b', lost[1]!, san))).toEqual(['SOLUCION_EN_POSICION_PERDIDA', 'ALTERNATIVA_IGUAL_O_MEJOR']);
    const drawn = [{ cp: 2900, pv: ['a'] }, { cp: 0, pv: ['b'] }];
    expect(types(compareSolution(drawn, 'b', drawn[1]!, san, true))).toEqual(['SOLUCION_DIRIGIDA_NO_OPTIMA']);
    const won = [{ cp: 3000, pv: ['a'] }, { cp: 2990, pv: ['b'] }, { mate: 9, pv: ['c'] }];
    expect(types(compareSolution(won, 'b', won[1]!, san))).toEqual([
      'ALTERNATIVA_EN_POSICION_GANADA',
      'ALTERNATIVA_IGUAL_O_MEJOR',
    ]);
    const mates = [{ mate: 1, pv: ['a'] }, { mate: 1, pv: ['b'] }, { mate: 2, pv: ['c'] }];
    expect(types(compareSolution(mates, 'a', mates[0]!, san))).toEqual(['ALTERNATIVA_IGUAL_O_MEJOR']);
    expect(isDirected('Avanza el peón dos casillas, hasta d4.', 'd2d4')).toBe(true);
    expect(isDirected('Da mate en una jugada.', 'a1a8')).toBe(false);
  });
  it('la mejor jugada, sin alternativas cerca, no da hallazgos', () => {
    const lines = [{ cp: 300, pv: ['a'] }, { cp: 200, pv: ['b'] }];
    expect(compareSolution(lines, 'a', lines[0]!, san)).toEqual([]);
  });
});

describe('afirmaciones del enunciado', () => {
  it('lee mate en N y ganar material', () => {
    expect(parseClaims('Juegan blancas. Mate en dos jugadas.')).toEqual({ mate: { n: 2 } });
    expect(parseClaims('Da jaque mate en una jugada.').mate).toEqual({ n: 1 });
    expect(parseClaims('Da mate con el caballo.').mate).toEqual({});
    expect(parseClaims('Hay una pieza sin defensa. Gana material.').winsMaterial).toBe(true);
  });
  it('comprueba que la línea acaba en mate', () => {
    const fen = '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1';
    expect(checkMateClaim(fen, ['a1a8'], { n: 1 }, { mate: 1, pv: ['a1a8'] })).toEqual([]);
    expect(types(checkMateClaim(fen, ['a1a7'], { n: 1 }))).toEqual(['AFIRMACION_FALSA']);
  });
  // Motor falso: la primera llamada (con searchmoves) da la línea de la solución; las siguientes, la continuación.
  const engine = (first: Line, rest: Line = { pv: [] }) => async (_fen: string, sm?: string[]) => (sm ? first : rest);
  it('comprueba que se gana material tras la respuesta', async () => {
    const fen = '4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1';
    expect(await checkMaterialClaim(fen, 'd1d5', engine({ cp: 900, pv: ['d1d5', 'e8e7'] }))).toEqual([]);
    expect(types(await checkMaterialClaim(fen, 'd1d3', engine({ cp: -900, pv: ['d1d3', 'd5d3'] })))).toEqual(['AFIRMACION_FALSA']);
  });
  it('sacrificio verdadero: sigue la línea hasta una posición estable aunque la variante se corte (u11.l01)', async () => {
    // Stockfish 16, profundidad 18: Rf8+ Kxf8 Nd7+ Kf7 Nxb6 g5 Kg1 (+2.58). Cortada a 4 jugadas, el material aún baja.
    const fen = '6k1/1p4pp/pqn5/4N3/8/6B1/PP4PP/5R1K w - - 0 1';
    const first = { cp: 258, pv: ['f1f8', 'g8f8', 'e5d7', 'f8f7'] };
    const rest = { cp: 258, pv: ['d7b6', 'g7g5', 'h1g1', 'f7e6'] };
    const { played } = await followToStable(fen, 'f1f8', engine(first, rest));
    expect(played).toEqual(['f1f8', 'g8f8', 'e5d7', 'f8f7', 'd7b6', 'g7g5']);
    expect(await checkMaterialClaim(fen, 'f1f8', engine(first, rest))).toEqual([]);
  });
  it('afirmación falsa real: Bxc6+ bxc6 cambia pieza por pieza', async () => {
    // Inventada y comprobada con Stockfish 16, profundidad 18: Bxc6+ bxc6 Rd1 (+0.17), material igual.
    const fen = 'r3k3/pp3ppp/2n5/1B6/8/8/PP3PPP/R3K3 w - - 0 1';
    const line = { cp: 17, pv: ['b5c6', 'b7c6', 'a1d1', 'a7a5', 'd1d4'] };
    const out = await checkMaterialClaim(fen, 'b5c6', engine(line));
    expect(types(out)).toEqual(['AFIRMACION_FALSA']);
    expect(out[0]!.detail).toContain('b5c6 b7c6 a1d1');
  });
  it('vale un mate o una evaluación clara aunque el material llegue más tarde', async () => {
    const fen = '4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1';
    expect(await checkMaterialClaim(fen, 'd1d3', engine({ mate: 5, pv: ['d1d3', 'd5d3'] }))).toEqual([]);
    expect(await checkMaterialClaim(fen, 'e1e2', engine({ cp: -250, pv: ['e1e2', 'e8e7', 'e2e1'] }))).toEqual([]);
  });
  it('en tablas muertas la línea del motor no refuta la afirmación (u07.l03 práctica 3)', async () => {
    // Stockfish 16, profundidad 18: d4 Kd2 Bxc3 bxc3 dxc3 Kxc3 Ke7 (0.00): cambia todo porque cualquier línea es tablas.
    const fen = '4k3/8/8/3p4/1b6/2N5/1P6/4K3 b - - 0 1';
    const line = { cp: 0, pv: ['d5d4', 'e1d2', 'b4c3', 'b2c3', 'd4c3', 'd2c3', 'e8e7'] };
    expect(await checkMaterialClaim(fen, 'd5d4', engine(line))).toEqual([]);
  });
});

describe('lint de texto', () => {
  it('notación española, frases largas, culpa y emojis', () => {
    expect(types(lintText('Correcto: Cxd5 gana la torre.'))).toEqual(['NOTACION_MEZCLADA']);
    expect(lintText('Correcto: Nxd5 gana la torre.')).toEqual([]);
    expect(types(lintText(Array(31).fill('palabra').join(' ') + '.'))).toEqual(['FRASE_LARGA']);
    expect(types(lintText('Lo has hecho mal.'))).toEqual(['CULPA']);
    expect(types(lintText('Fallaste otra vez.'))).toEqual(['CULPA']);
    expect(types(lintText('¡Bien! 🎉'))).toEqual(['EMOJI']);
  });
  it('las casillas sueltas no son jugadas; las secuencias numeradas sí', () => {
    expect(sanTokens('la casilla e4 está libre')).toEqual([]);
    expect(sanTokens('1.e4 e5 2.Bc4 Nc6 3.Qh5').map((t) => t.san)).toEqual(['e4', 'e5', 'Bc4', 'Nc6', 'Qh5']);
    expect(sanTokens('...Nf6 y Dg8+').map((t) => t.san)).toEqual(['Nf6', 'Qg8+']);
  });
});

describe('jugadas citadas', () => {
  const pasillo = '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1';
  it('acepta jugadas legales y mates reales', () => {
    expect(checkSanMentions('Ra8# es el mate del pasillo.', [pasillo])).toEqual([]);
    expect(checkSanMentions('Ra8 es mate.', [pasillo])).toEqual([]);
  });
  it('avisa de jugadas ilegales y de mates o jaques que no lo son', () => {
    expect(types(checkSanMentions('Qa8# gana.', [pasillo]))).toEqual(['SAN_ILEGAL']);
    expect(types(checkSanMentions('Ra7# encierra al rey.', [pasillo]))).toEqual(['SAN_MATE_FALSO']);
    expect(types(checkSanMentions('Ra2+ obliga a mover.', [pasillo]))).toEqual(['SAN_JAQUE_FALSO']);
  });
  it('sigue secuencias, amenazas del rival y jugadas tras una respuesta no citada', () => {
    // Turno de negras y la amenaza blanca es Qxf7#.
    const pastor = 'rnbqk1nr/pppp1ppp/8/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3';
    expect(checkSanMentions('Las blancas amenazan Qxf7#.', [pastor])).toEqual([]);
    expect(checkSanMentions('Qa8+ obliga a Qd8 y Qxd8 es mate.', ['6k1/5ppp/8/8/7q/8/5PPP/Q5K1 w - - 0 1'])).toEqual([]);
    expect(checkSanMentions('Nc7+ y cuando el rey se mueva, Nxa8.', ['r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1'])).toEqual([]);
  });
  it('ignora ejemplos de notación y acepta jaques condicionales', () => {
    const inicial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(checkSanMentions('Así, Ra5 es «torre a a5».', [inicial])).toEqual([]);
    expect(types(checkSanMentions('Ra5 gana.', [inicial]))).toEqual(['SAN_ILEGAL']);
    // u11.l01 explicación 1: el jaque llega tras Rf8+ Kxf8.
    const atraccion = '6k1/1p4pp/pqn5/4N3/8/6B1/PP4PP/5R1K w - - 0 1';
    expect(checkSanMentions('Si el rey estuviera en f8, Nd7+ sería horquilla.', [atraccion])).toEqual([]);
    expect(checkSanMentions('Después de Rf8+ Kxf8, Nd7+ gana la dama.', [atraccion])).toEqual([]);
    expect(types(checkSanMentions('Nd7+ gana la dama.', [atraccion]))).toEqual(['SAN_JAQUE_FALSO']);
    expect(types(checkSanMentions('Si juegas Ra2+, el rey se mueve.', [pasillo]))).toEqual(['SAN_JAQUE_FALSO']);
  });
  it('acepta relatos de jugadas ya hechas', () => {
    const tras = 'rnbqkb1r/pppp1ppp/5n2/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 2 3';
    expect(checkSanMentions('Las blancas sacaron la dama con 2.Qh5 y las negras jugaron ...Nf6.', [tras])).toEqual([]);
  });
});
