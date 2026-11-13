import { describe, it, expect } from 'vitest';
import { applyUci, canonicalUci, legalDests, lastMoveOf, parseTypedMove, sanOfUci } from '../../web/src/chess.js';

const CASTLE_W = 'r3k2r/pppqbppp/2n1bn2/3pp3/3PP3/2N1BN2/PPPQBPPP/R3K2R w KQkq - 0 1';
const CASTLE_B = 'r3k2r/pppqbppp/2n1bn2/3pp3/3PP3/2N1BN2/PPPQBPPP/R3K2R b KQkq - 0 1';

describe('reproductor: formas UCI del contenido', () => {
  it('enroque como rey a su casilla final (e1g1, e1c1, e8g8, e8c8)', () => {
    expect(applyUci(CASTLE_W, 'e1g1')?.san).toBe('O-O');
    expect(applyUci(CASTLE_W, 'e1c1')?.san).toBe('O-O-O');
    expect(applyUci(CASTLE_W, 'e1g1')?.fen).toContain('R4RK1');
    expect(applyUci(CASTLE_B, 'e8c8')?.san).toBe('O-O-O');
    expect(applyUci(CASTLE_B, 'e8g8')?.san).toBe('O-O');
    expect(sanOfUci(CASTLE_W, 'e1g1')).toBe('O-O');
  });

  it('el tablero ofrece el destino g1 y la jugada de chessground (e1->g1) es válida', () => {
    const d = legalDests(CASTLE_W).get('e1')!;
    expect(d).toContain('g1');
    expect(applyUci(CASTLE_W, 'e1' + 'g1')).not.toBeNull();
  });

  it('también se acepta la forma rey-captura-torre y se normaliza al escribir', () => {
    expect(applyUci(CASTLE_W, 'e1h1')?.san).toBe('O-O');
    expect(parseTypedMove(CASTLE_W, 'O-O')).toBe('e1g1');
    expect(parseTypedMove(CASTLE_W, '0-0-0')).toBe('e1c1');
    expect(parseTypedMove(CASTLE_W, 'e1g1')).toBe('e1g1');
    expect(lastMoveOf('e1g1')).toEqual(['e1', 'g1']);
    expect(canonicalUci(CASTLE_W, 'e1h1')).toBe('e1g1');
    expect(canonicalUci(CASTLE_W, 'e1a1')).toBe('e1c1');
    expect(canonicalUci(CASTLE_B, 'e8h8')).toBe('e8g8');
    expect(canonicalUci(CASTLE_W, 'e1f1')).toBe('e1f1');
  });

  it('enroque ilegal (rey en jaque / casilla atacada) se rechaza', () => {
    expect(applyUci('4k3/8/8/8/8/8/4r3/R3K2R w KQ - 0 1', 'e1g1')).toBeNull();
    expect(applyUci('4k3/8/8/8/8/8/5r2/R3K2R w KQ - 0 1', 'e1g1')).toBeNull();
  });

  it('promoción g7g8q y captura al paso con casilla ep en la FEN', () => {
    expect(applyUci('4k3/6P1/8/8/8/8/8/4K3 w - - 0 1', 'g7g8q')?.san).toBe('g8=Q+');
    expect(applyUci('4k3/6P1/8/8/8/8/8/4K3 w - - 0 1', 'g7g8n')?.san).toBe('g8=N');
    const ep = '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1';
    expect(applyUci(ep, 'e5d6')?.san).toBe('exd6');
    expect(applyUci(ep, 'e5d6')?.fen).not.toContain('3p');
    expect(applyUci('4k3/8/8/3pP3/8/8/8/4K3 w - - 0 1', 'e5d6')).toBeNull(); // sin casilla ep no es legal
  });
});
