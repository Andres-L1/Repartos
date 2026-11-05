import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  change,
  performance,
  trending,
  globalIndex,
  monthOffset,
  fideColumns,
  parseFideLine,
} from '../analytics.mjs';
test('periodos mensuales cruzan año y la variación con base cero no se inventa', () => {
  assert.equal(monthOffset('2026-01', -1), '2025-12');
  assert.equal(monthOffset('2026-11', -12), '2025-11');
  assert.equal(change(120, 100), 20);
  assert.equal(change(0, 100), -100);
  assert.equal(change(12, 0), null);
});
test('Performance exige continuidad, actividad y partidas; excluye las partidas de la lista base', () => {
  const history = Array.from({ length: 13 }, (_, i) => ({
    month: monthOffset('2026-11', i - 12),
    rating: 2000 + i * 5,
    games: 1,
    active: true,
  }));
  history[0].games = 999;
  assert.deepEqual(performance(history, '2026-11'), {
    score: 60,
    delta: 60,
    games: 12,
    samples: 13,
    eligible: true,
    reason: null,
  });
  assert.equal(
    performance(
      history.filter((_, i) => i !== 4),
      '2026-11',
    ).score,
    null,
  );
  assert.equal(
    performance(
      history.map((r, i) => (i === 12 ? { ...r, active: false } : r)),
      '2026-11',
    ).eligible,
    false,
  );
  assert.equal(
    performance(
      history.map((r, i) => (i === 5 ? { ...r, games: 0 } : r)),
      '2026-11',
    ).eligible,
    false,
  );
});
test('Trending usa catorce días completos, separa periodos y exige base suficiente', () => {
  const history = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 9, 21 + i)).toISOString().slice(0, 10),
    views: i < 7 ? 100 : 200,
  }));
  const result = trending(history, '2026-11-03');
  assert.equal(result.previous, 700);
  assert.equal(result.current, 1400);
  assert.equal(result.score, 100);
  assert.equal(result.start, '2026-10-28');
  assert.equal(trending(history.slice(1), '2026-11-03').score, null);
  assert.equal(
    trending(
      history.map((h) => ({ ...h, views: 0 })),
      '2026-11-03',
    ).score,
    null,
  );
});
test('Global compara el censo activo con base mínima y no mezcla partidas', () => {
  assert.equal(
    globalIndex(
      [
        { month: '2025-11', active: 200 },
        { month: '2026-11', active: 250 },
      ],
      '2026-11',
    ).score,
    25,
  );
  assert.equal(
    globalIndex(
      [
        { month: '2025-11', active: 99 },
        { month: '2026-11', active: 200 },
      ],
      '2026-11',
    ).score,
    null,
  );
  assert.equal(globalIndex([{ month: '2026-11', active: 200 }], '2026-11').score, null);
});
test('parser FIDE por columnas: conserva bandera inactiva y no toma el rating como partidas', () => {
  const header =
    'ID Number      Name                                                         Fed Sex Tit  WTit OTit           FOA NOV26 Gms K  B-day Flag';
  const row =
    "1074563        't Hart, Johan                                               NED M                                1829  0   40 1953  i   ";
  const result = parseFideLine(row, fideColumns(header));
  assert.equal(result.id, '1074563');
  assert.equal(result.rating, 1829);
  assert.equal(result.games, 0);
  assert.equal(result.birthYear, 1953);
  assert.equal(result.active, false);
  assert.equal(result.federation, 'NED');
  assert.throws(() => fideColumns('formato inesperado'));
});
test('instantánea real: cobertura y rankings coherentes con las observaciones importadas', async () => {
  const data = JSON.parse(
    await readFile(new URL('../public/snapshots/latest.json', import.meta.url)),
  );
  assert.equal(data.schema, 1);
  assert.ok(data.fide.sources.length >= 2);
  assert.equal(new Set(data.fide.sources.map((s) => s.month)).size, data.fide.sources.length);
  assert.ok(data.fide.totalPlayers > 100000);
  assert.ok(data.fide.sources.every((s) => s.records > 100000 && /^[a-f0-9]{64}$/.test(s.sha256)));
  assert.ok(data.fide.players.length >= 100);
  assert.equal(new Set(data.fide.players.map((p) => p.id)).size, data.fide.players.length);
  for (const p of data.fide.players)
    assert.deepEqual(p.performance, performance(p.history, data.fide.month));
  for (const f of data.fide.federations)
    assert.deepEqual(f.index, globalIndex(f.history, data.fide.month));
  for (const p of data.interest.players.filter((p) => !p.stale)) {
    const expected = trending(p.history, data.interest.endDate);
    assert.equal(p.score, expected.score);
    assert.equal(p.current, expected.current);
    assert.equal(p.previous, expected.previous);
  }
});
