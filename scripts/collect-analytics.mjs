import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
import { performance, trending, globalIndex, fideColumns, parseFideLine, monthOffset, VERSION } from '../pulse/analytics.mjs';
const OUTPUT = 'pulse/public/snapshots/latest.json', CACHE = '.pulse-data-cache';
const UA = 'ChedexPulse/1.2 (https://chedexpulse.chedex-chesssociety.workers.dev)';
const now = new Date(), month = now.toISOString().slice(0, 7);
const monthNames = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const warnings = [];
await mkdir(CACHE, { recursive: true }); await mkdir('pulse/public/snapshots', { recursive: true });
let previous;
try { previous = JSON.parse(await readFile(OUTPUT, 'utf8')); } catch {}
async function get(url) {
  const response = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Fuente respondió ${response.status}`);
  return response;
}
async function catalog() {
  if (previous?.catalog?.length && previous.fide?.month === month && !process.argv.includes('--refresh-catalog')) return previous.catalog;
  const titles = JSON.parse(await readFile('pulse/analytics-catalog.json', 'utf8'));
  const query = new URLSearchParams({ action: 'query', titles: titles.join('|'), prop: 'pageprops', ppprop: 'wikibase_item', redirects: '1', format: 'json' });
  const pages = Object.values((await (await get(`https://en.wikipedia.org/w/api.php?${query}`)).json()).query.pages).filter(p => p.pageprops?.wikibase_item && !('missing' in p));
  const qids = pages.map(p => p.pageprops.wikibase_item);
  const entitiesQuery = new URLSearchParams({ action: 'wbgetentities', ids: qids.join('|'), props: 'claims', format: 'json' });
  const entities = (await (await get(`https://www.wikidata.org/w/api.php?${entitiesQuery}`)).json()).entities;
  return pages.flatMap(page => {
    const qid = page.pageprops.wikibase_item;
    const id = entities[qid]?.claims?.P1440?.find(c => c.rank !== 'deprecated')?.mainsnak?.datavalue?.value;
    return typeof id === 'string' && /^\d+$/.test(id) ? [{ id, article: page.title.replace(/ /g, '_'), wikidata: qid }] : [];
  });
}
let monitored;
try { monitored = await catalog(); }
catch { if (!previous?.catalog?.length) throw new Error('No se pudo verificar el catálogo Wikipedia/FIDE.'); monitored = previous.catalog; warnings.push('No se pudo actualizar el catálogo.'); }
async function archive(period) {
  const code = `${monthNames[Number(period.slice(5)) - 1]}${period.slice(2,4)}`;
  const url = `https://ratings.fide.com/download/standard_${code}frl.zip`, filename = `${CACHE}/standard_${code}frl.zip`;
  let compressed;
  try { compressed = await readFile(filename); }
  catch { console.log(`Descargando FIDE ${period}…`); compressed = new Uint8Array(await (await get(url)).arrayBuffer()); await writeFile(filename, compressed); }
  if (compressed.length > 50000000 || compressed[0] !== 80 || compressed[1] !== 75) throw new Error('Archivo FIDE inválido.');
  const entries = unzipSync(compressed, { filter: file => /\.txt$/i.test(file.name) && file.originalSize < 180000000 });
  const entry = Object.values(entries)[0]; if (!entry) throw new Error('Lista FIDE ausente del ZIP.');
  const info = { month: period, url, sha256: createHash('sha256').update(compressed).digest('hex'), fetchedAt: (await stat(filename)).mtime.toISOString() };
  return { bytes: entry, expected: code.toUpperCase(), info };
}
function scan(archive, selected, selectCandidates = false) {
  const decoder = new TextDecoder('utf-8'); let buffer = '', columns, lines = 0, accepted = 0;
  const rows = [], federations = new Map(), candidates = [];
  function line(text) {
    if (!columns) { columns = fideColumns(text); if (columns.period !== archive.expected) throw new Error('La fecha interna FIDE no coincide con la solicitada.'); return; }
    if (!text.trim()) return;
    lines++;
    const player = parseFideLine(text, columns); if (!player) return;
    accepted++;
    if (selected?.has(player.id)) rows.push(player);
    if (selectCandidates && player.active && player.rating >= 1800) candidates.push(player);
    let fed = federations.get(player.federation);
    if (!fed) { fed = { code: player.federation, listed: 0, active: 0, titled: 0, juniors: 0, appearances: 0, ratings: [] }; federations.set(player.federation, fed); }
    fed.listed++;
    if (player.active) { fed.active++; fed.appearances += player.games; fed.ratings.push(player.rating); if (player.title) fed.titled++; if (player.birthYear && Number(archive.info.month.slice(0,4)) - player.birthYear <= 20) fed.juniors++; }
  }
  for (let offset = 0; offset < archive.bytes.length; offset += 65536) {
    buffer += decoder.decode(archive.bytes.subarray(offset, offset + 65536), { stream: true });
    const pieces = buffer.split('\n'); buffer = pieces.pop(); for (const piece of pieces) line(piece);
  }
  buffer += decoder.decode(); if (buffer.trim()) line(buffer);
  if (accepted < 100000 || accepted / lines < .98) throw new Error(`Cobertura FIDE insuficiente: ${accepted}/${lines}.`);
  for (const fed of federations.values()) { fed.ratings.sort((a,b) => b-a); fed.top10Average = fed.ratings.length >= 10 ? Math.round(fed.ratings.slice(0,10).reduce((a,b)=>a+b,0)/10) : null; delete fed.ratings; }
  return { rows, federations: [...federations.values()], candidates, total: accepted };
}
let fide = previous?.fide;
if (fide?.month !== month || fide?.sources?.length !== 13 || process.argv.includes('--force-fide')) {
  try {
    let latest;
    try { latest = await archive(month); }
    catch { if (fide) throw new Error('La lista del mes actual todavía no está disponible.'); latest = await archive(monthOffset(month,-1)); }
    const targetMonth = latest.info.month;
    const current = scan(latest, new Set(monitored.map(p=>p.id)), true);
    const year = Number(targetMonth.slice(0,4));
    current.candidates.sort((a,b) => b.rating - a.rating || a.id.localeCompare(b.id));
    const selection = new Map([...current.candidates.slice(0,100), ...current.candidates.filter(p=>p.sex==='F').slice(0,50), ...current.candidates.filter(p=>p.birthYear && year-p.birthYear<=20).slice(0,100), ...current.rows].map(p=>[p.id,p]));
    const cohort = [...selection.values()].map(p=>({ ...p, history: [{ month: targetMonth, rating: p.rating, games: p.games, active: p.active, federation: p.federation }] }));
    const ids = new Set(cohort.map(p=>p.id));
    const federationHistory = new Map(current.federations.map(f=>[f.code,[{ ...f, month: targetMonth }]]));
    const sources = [{ ...latest.info, records: current.total }];
    for (let offset = -1; offset >= -12; offset--) {
      const period = monthOffset(targetMonth, offset);
      try {
        const file = await archive(period), parsed = scan(file, ids);
        sources.push({ ...file.info, records: parsed.total });
        for (const row of parsed.rows) selection.has(row.id) && cohort.find(p=>p.id===row.id).history.push({ month: period, rating: row.rating, games: row.games, active: row.active, federation: row.federation });
        for (const fed of parsed.federations) { if (!federationHistory.has(fed.code)) federationHistory.set(fed.code,[]); federationHistory.get(fed.code).push({ ...fed, month: period }); }
        console.log(`FIDE ${period}: ${parsed.total} registros validados.`);
      } catch (error) { warnings.push(`FIDE ${period}: ${error.message}`); }
    }
    for (const player of cohort) { player.history.sort((a,b)=>a.month.localeCompare(b.month)); player.performance = performance(player.history, targetMonth); }
    const federations = [...federationHistory.entries()].map(([code,history])=>({ code, history: history.sort((a,b)=>a.month.localeCompare(b.month)), index: globalIndex(history,targetMonth) }));
    fide = { month: targetMonth, fetchedAt: now.toISOString(), totalPlayers: current.total, cohort: 'Top 100 activos + top 50 mujeres activas + top 100 activos de hasta 20 años por año de nacimiento + catálogo Wikipedia verificado. Selección por Elo de la última lista estándar.', players: cohort, federations, sources, minimumGames: 12, minimumGlobalBase: 100, version: VERSION };
    console.log(`Cohorte: ${cohort.length} jugadores. Federaciones: ${federations.length}.`);
  } catch (error) { warnings.push(`FIDE: ${error.message}`); if (!fide) throw error; }
}
const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 2*86400000);
const endDate = end.toISOString().slice(0,10), startDate = new Date(end.getTime()-13*86400000).toISOString().slice(0,10);
const stamp = date => date.replaceAll('-','')+'00';
const interest = [];
for (const player of monitored) {
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/user/${encodeURIComponent(player.article)}/daily/${stamp(startDate)}/${stamp(endDate)}`;
  try {
    const raw = await (await get(url)).json();
    const history = (raw.items || []).map(row=>({ date: `${row.timestamp.slice(0,4)}-${row.timestamp.slice(4,6)}-${row.timestamp.slice(6,8)}`, views: row.views }));
    interest.push({ ...player, sourceUrl: url, fetchedAt: now.toISOString(), history, ...trending(history,endDate), stale: false });
  } catch {
    const old = previous?.interest?.players.find(p=>p.id===player.id);
    interest.push(old ? { ...old, stale: true, error: 'La fuente no ha respondido en la última recopilación.' } : { ...player, sourceUrl: url, fetchedAt: null, history: [], ...trending([],endDate), stale: true });
    warnings.push(`Wikimedia: no disponible para ${player.article}.`);
  }
}
const snapshot = { schema: 1, generatedAt: now.toISOString(), catalog: monitored, fide, interest: { project: 'en.wikipedia.org', access: 'all-access', agent: 'user', endDate, minimumPreviousViews: 100, players: interest, version: VERSION }, warnings };
if (!fide?.players?.length || !interest.some(p=>p.eligible && !p.stale)) throw new Error('No hay suficientes datos válidos para publicar la instantánea. Se conserva la anterior.');
await writeFile(`${OUTPUT}.tmp`, JSON.stringify(snapshot)); await rename(`${OUTPUT}.tmp`, OUTPUT);
console.log(`Instantánea publicada: ${fide.players.length} jugadores FIDE; ${interest.filter(p=>p.eligible&&!p.stale).length}/${monitored.length} series Wikimedia comparables; ${warnings.length} incidencias.`);
