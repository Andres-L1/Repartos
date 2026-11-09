import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import { createHash } from 'node:crypto';
import { summarizeWorldPerformance } from '../pulse/performance-world.mjs';
import { fideColumns, parseFideLine, monthOffset } from '../pulse/analytics.mjs';
const snapshot = JSON.parse(await readFile('pulse/public/snapshots/latest.json', 'utf8'));
const month = snapshot.fide.month;
try {
  const existing = JSON.parse(
    await readFile('pulse/public/snapshots/performance/WORLD.json', 'utf8'),
  );
  if (existing.month === month && !process.argv.includes('--force')) {
    await Promise.all(
      snapshot.fide.federations.map((fed) =>
        access(`pulse/public/snapshots/performance/${fed.code}.json`),
      ),
    );
    console.log('El índice mundial ya corresponde a la lista actual.');
    process.exit(0);
  }
} catch {}
if (snapshot.fide.sources.length !== 13) throw Error('Se requieren trece listas FIDE verificadas.');
const names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const records = new Map();
for (let offset = 0; offset >= -12; offset--) {
  const period = monthOffset(month, offset),
    suffix = names[Number(period.slice(5)) - 1] + period.slice(2, 4);
  const filename = `.pulse-data-cache/standard_${suffix}frl.zip`;
  const source = snapshot.fide.sources.find((entry) => entry.month === period);
  if (!source || source.url !== `https://ratings.fide.com/download/standard_${suffix}frl.zip`)
    throw Error(`Fuente FIDE incorrecta ${period}`);
  let file;
  try {
    file = await readFile(filename);
  } catch {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(120000),
      headers: { 'User-Agent': 'ChedexPulse/1.4 (https://chedexpulse.app)' },
    });
    if (!response.ok) throw Error(`Descarga FIDE fallida ${period}`);
    file = new Uint8Array(await response.arrayBuffer());
    if (file.length > 50000000 || createHash('sha256').update(file).digest('hex') !== source.sha256)
      throw Error(`Huella FIDE incorrecta ${period}`);
    await mkdir('.pulse-data-cache', { recursive: true });
    await writeFile(filename, file);
  }
  if (createHash('sha256').update(file).digest('hex') !== source.sha256)
    throw Error(`Huella FIDE incorrecta ${period}`);
  const entries = unzipSync(file, {
    filter: (item) => /\.txt$/i.test(item.name) && item.originalSize < 180000000,
  });
  const bytes = Object.values(entries)[0];
  if (!bytes) throw Error(`Falta lista ${period}`);
  const text = new TextDecoder('utf-8').decode(bytes);
  let start = 0,
    end = text.indexOf('\n'),
    columns = fideColumns(text.slice(0, end));
  if (columns.period !== suffix.toUpperCase()) throw Error(`Fecha incorrecta ${period}`);
  let count = 0,
    accepted = 0;
  start = end + 1;
  while (start < text.length) {
    end = text.indexOf('\n', start);
    if (end < 0) end = text.length;
    const line = text.slice(start, end);
    start = end + 1;
    if (!line.trim()) continue;
    count++;
    const p = parseFideLine(line, columns);
    if (!p) continue;
    accepted++;
    if (offset === 0) {
      if (p.active)
        records.set(p.id, {
          id: p.id,
          name: p.name,
          federation: p.federation,
          rating: p.rating,
          birthYear: p.birthYear,
          games: p.games,
          samples: 1,
          baseline: null,
        });
    } else {
      const row = records.get(p.id);
      if (!row) continue;
      row.samples++;
      if (offset === -12) row.baseline = p.rating;
      else row.games += p.games;
    }
  }
  if (accepted < 100000 || accepted / count < 0.98)
    throw Error(`Cobertura incompleta ${period}: ${accepted}/${count}`);
  console.log(`${period}: ${accepted} registros válidos`);
}
const { eligible, groups } = summarizeWorldPerformance(records.values(), month);
const output = 'pulse/public/snapshots/performance';
await mkdir(output, { recursive: true });
const files = new Map(snapshot.fide.federations.map((fed) => [fed.code, {}]));
for (const [key, group] of groups) {
  const [fed, age, level] = key.split('|');
  if (!files.has(fed)) files.set(fed, {});
  files.get(fed)[`${age}:${level}`] = group;
}
for (const [fed, data] of files)
  await writeFile(
    `${output}/${fed}.json`,
    JSON.stringify({
      schema: 1,
      month,
      generatedAt: new Date().toISOString(),
      totalComparable: eligible.length,
      limit: 100,
      groups: data,
    }),
  );
console.log(
  `Comparables: ${eligible.length}; federaciones: ${files.size - 1}; grupos: ${groups.size}.`,
);
