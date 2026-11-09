import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('la publicación mundial coincide con las federaciones y respeta sus filtros', async () => {
  const root = new URL('../public/snapshots/', import.meta.url);
  const snapshot = JSON.parse(await readFile(new URL('latest.json', root), 'utf8'));
  const world = JSON.parse(await readFile(new URL('performance/WORLD.json', root), 'utf8'));
  assert.equal(world.month, snapshot.fide.month);
  assert.equal(world.groups['all:all'].total, world.totalComparable);
  let total = 0;
  for (const federation of snapshot.fide.federations) {
    const data = JSON.parse(
      await readFile(new URL(`performance/${federation.code}.json`, root), 'utf8'),
    );
    assert.equal(data.month, world.month);
    total += data.groups['all:all']?.total || 0;
    for (const [key, group] of Object.entries(data.groups)) {
      const [age, level] = key.split(':');
      assert.ok(group.players.length <= 100 && group.players.length <= group.total);
      for (let i = 0; i < group.players.length; i++) {
        const p = group.players[i],
          years = p.birthYear ? Number(world.month.slice(0, 4)) - p.birthYear : null;
        assert.equal(p.federation, federation.code);
        assert.ok(p.performance.eligible && p.performance.games >= 12);
        if (i) assert.ok(group.players[i - 1].score >= p.score);
        if (age === 'u16') assert.ok(years !== null && years <= 16);
        if (age === 'u20') assert.ok(years !== null && years <= 20);
        if (age === 'adult') assert.ok(years !== null && years > 20);
        if (level === 'elite') assert.ok(p.rating >= 2600);
        if (level === 'master') assert.ok(p.rating >= 2400 && p.rating < 2600);
        if (level === 'other') assert.ok(p.rating < 2400);
      }
    }
  }
  assert.equal(total, world.totalComparable);
});
