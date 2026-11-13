import { describe, it, expect } from 'vitest';
import { describePerfs, parseSeen, selectPerf, PLACEMENT_MIN_GAMES, parsePerf } from '../../worker/placement.js';

const p = (rating: number, games = 100, prov?: boolean) => ({ rating, games, ...(prov === undefined ? {} : { prov }) });

describe('selectPerf', () => {
  it('constantes de diseño', () => {
    expect(PLACEMENT_MIN_GAMES).toBe(10);
  });

  it('sin perfs o sin datos fiables: none', () => {
    for (const perfs of [undefined, null, {}, { rapid: p(1500, 5) }, { classical: p(1500, 100, true) }])
      expect(selectPerf(perfs)).toEqual({ source: 'none', perf: null, rating: null, games: null });
  });

  it('provisional (prov true) no cuenta aunque tenga muchas partidas', () => {
    expect(selectPerf({ rapid: p(1800, 500, true) }).source).toBe('none');
  });

  it('pocas partidas no cuenta; el umbral (10) sí', () => {
    expect(selectPerf({ classical: p(1800, 9) }).source).toBe('none');
    expect(selectPerf({ classical: p(1800, 10) })).toMatchObject({ source: 'lichess', perf: 'classical', rating: 1800 });
  });

  it('toma el mayor entre rapid y classical fiables; ignora el no fiable aunque sea mayor', () => {
    expect(selectPerf({ rapid: p(1100), classical: p(1500) })).toMatchObject({ perf: 'classical', rating: 1500 });
    expect(selectPerf({ rapid: p(1600), classical: p(1500) })).toMatchObject({ perf: 'rapid', rating: 1600 });
    expect(selectPerf({ rapid: p(900), classical: p(2000, 3) })).toMatchObject({ perf: 'rapid', rating: 900 });
    expect(selectPerf({ rapid: p(1500), classical: p(1500) }).perf).toBe('rapid'); // empate
  });
});

describe('blitz como respaldo', () => {
  it('solo blitz fiable: se usa', () => {
    expect(selectPerf({ blitz: p(1200) })).toMatchObject({ source: 'lichess', perf: 'blitz', rating: 1200, games: 100 });
    expect(selectPerf({ blitz: p(1200, 10) }).perf).toBe('blitz');
  });
  it('blitz provisional o con pocas partidas: no cuenta', () => {
    expect(selectPerf({ blitz: p(1800, 500, true) }).source).toBe('none');
    expect(selectPerf({ blitz: p(1800, 9) }).source).toBe('none');
  });
  it('rápidas o clásicas fiables tienen prioridad sobre un blitz más alto', () => {
    expect(selectPerf({ rapid: p(1100), blitz: p(2000) })).toMatchObject({ perf: 'rapid', rating: 1100 });
    expect(selectPerf({ classical: p(1000), blitz: p(2000) })).toMatchObject({ perf: 'classical', rating: 1000 });
    expect(selectPerf({ classical: p(1300), blitz: p(1700) })).toMatchObject({ perf: 'classical', rating: 1300 });
  });
  it('rápidas/clásicas no fiables: cae a blitz; si blitz tampoco, none', () => {
    expect(selectPerf({ rapid: p(1500, 500, true), classical: p(1500, 3), blitz: p(1300) })).toMatchObject({ perf: 'blitz', rating: 1300 });
    expect(selectPerf({ rapid: p(1500, 500, true), classical: p(1500, 3), blitz: p(1300, 2) })).toMatchObject({ source: 'none', perf: null });
    expect(selectPerf({ rapid: p(1500, 500, true) }).source).toBe('none');
  });
  it('describePerfs incluye blitz con los mismos estados', () => {
    expect(describePerfs({ present: true, blitz: p(1300, 20) }).blitz).toEqual({ state: 'reliable', rating: 1300, games: 20 });
    expect(describePerfs({ present: true, blitz: p(1300, 5, true) }).blitz.state).toBe('provisional');
    expect(describePerfs({ present: true, blitz: p(1300, 5) }).blitz.state).toBe('few_games');
    expect(describePerfs({ present: true, blitz: { rating: 'x' } }).blitz.state).toBe('invalid');
    expect(describePerfs({ present: true }).blitz.state).toBe('absent');
  });
  it('parseSeen: JSON antiguo sin blitz se lee como ausente; blitz inválido se rechaza', () => {
    const old = { perfsPresent: true, rapid: { state: 'absent' }, classical: { state: 'absent' } };
    expect(parseSeen(JSON.stringify(old))).toEqual({ ...old, blitz: { state: 'absent' } });
    expect(parseSeen(JSON.stringify({ ...old, blitz: { state: 'reliable', rating: 1300, games: 20 } }))?.blitz).toEqual({ state: 'reliable', rating: 1300, games: 20 });
    expect(parseSeen(JSON.stringify({ ...old, blitz: { state: 'otro' } }))).toBeNull();
  });
});

describe('parsePerf', () => {
  it('acepta perfs de Lichess reales y rechaza tipos y rangos inválidos', () => {
    expect(parsePerf({ games: 12, rating: 1500, rd: 90, prog: 4, prov: true })).toEqual({ rating: 1500, games: 12, prov: true });
    expect(parsePerf({ games: 12, rating: 1500 })).toEqual({ rating: 1500, games: 12, prov: false });
    for (const bad of [null, 5, 'x', [], {}, { rating: 4001, games: 1 }, { rating: -1, games: 1 }, { rating: 1.5, games: 1 }, { rating: '1500', games: 1 },
      { rating: 1500, games: 1.5 }, { rating: 1500, games: NaN }, { rating: 1500, games: 1, prov: 1 }, { rating: 1500, games: 1, rd: 5000 }, { rating: 1500, games: 1, rd: 'a' }])
      expect(parsePerf(bad)).toBeNull();
  });
});
