import { describe, it, expect } from 'vitest';
import { MUTE_KEY, moveSoundOf, playSound, readMuted, soundStats, writeMuted } from '../../web/src/sound.js';

function memory(): Storage {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } as Storage;
}
const throwing = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } } as unknown as Storage;

describe('preferencia de silencio', () => {
  it('por defecto hay sonido y se guarda y lee el silencio', () => {
    const s = memory();
    expect(readMuted(s)).toBe(false);
    expect(writeMuted(s, true)).toBe(true);
    expect(s.getItem(MUTE_KEY)).toBe('1');
    expect(readMuted(s)).toBe(true);
    writeMuted(s, false);
    expect(readMuted(s)).toBe(false);
  });
  it('sin almacenamiento o con él bloqueado no lanza y deja el sonido activado', () => {
    expect(readMuted(null)).toBe(false);
    expect(readMuted(throwing)).toBe(false);
    expect(writeMuted(null, true)).toBe(false);
    expect(writeMuted(throwing, true)).toBe(false);
  });
});

describe('sonido de una jugada', () => {
  const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const e4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
  const beforeCapture = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
  const afterCapture = 'rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2';
  it('mover, capturar y jaque (el jaque manda)', () => {
    expect(moveSoundOf(start, e4, false)).toBe('move');
    expect(moveSoundOf(beforeCapture, afterCapture, false)).toBe('capture');
    expect(moveSoundOf(beforeCapture, afterCapture, true)).toBe('check');
  });
  it('fuera del navegador reproducir no lanza y cuenta la petición', () => {
    const before = soundStats.move;
    expect(() => playSound('move')).not.toThrow();
    expect(soundStats.move).toBe(before + 1);
  });
});
