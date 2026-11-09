export function summarizeWorldPerformance(records, month) {
  const eligible = [...records]
    .filter((row) => row.samples === 13 && row.games >= 12 && Number.isFinite(row.baseline))
    .map(({ samples, baseline, games, ...row }) => ({
      ...row,
      score: row.rating - baseline,
      performance: { eligible: true, score: row.rating - baseline, games },
    }));
  eligible.sort((a, b) => b.score - a.score || b.rating - a.rating || a.id.localeCompare(b.id));
  const groups = new Map(),
    year = Number(month.slice(0, 4));
  for (const row of eligible) {
    const age = row.birthYear ? year - row.birthYear : null;
    const ages = [
      'all',
      ...(age !== null && age <= 20 ? ['u20'] : []),
      ...(age !== null && age <= 16 ? ['u16'] : []),
      ...(age !== null && age > 20 ? ['adult'] : []),
    ];
    const levels = ['all', row.rating >= 2600 ? 'elite' : row.rating >= 2400 ? 'master' : 'other'];
    for (const fed of ['WORLD', row.federation])
      for (const a of ages)
        for (const l of levels) {
          const key = `${fed}|${a}|${l}`;
          let group = groups.get(key);
          if (!group) {
            group = { total: 0, players: [] };
            groups.set(key, group);
          }
          group.total++;
          if (group.players.length < 100) group.players.push(row);
        }
  }
  return { eligible, groups };
}
