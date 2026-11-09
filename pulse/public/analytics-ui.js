import { topRatings } from './lib/observatory.js';
import { requestJSON } from './lib/requests.js';
import { enhanceSelects } from './components/select.js';
import { countries, players, countryByCode, indices } from './data.js';
import { prepareGeography } from './maps.js';
const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const numberFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const number = (value) => (Number.isFinite(value) ? numberFormat.format(value) : '—');
const signed = (value, unit = '') =>
  Number.isFinite(value) ? `${value > 0 ? '+' : ''}${number(value)}${unit}` : 'No comparable';
const normalize = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
const GEO = {
  NED: 'NLD',
  BIZ: 'BLZ',
  BRU: 'BRN',
  BRN: 'BHR',
  FIJ: 'FJI',
  GEQ: 'GNQ',
  GUI: 'GIN',
  LES: 'LSO',
  SUI: 'CHE',
  POR: 'PRT',
  GRE: 'GRC',
  CRO: 'HRV',
  SLO: 'SVN',
  IRI: 'IRN',
  UAE: 'ARE',
  VIE: 'VNM',
  PHI: 'PHL',
  TPE: 'TWN',
  DEN: 'DNK',
  LAT: 'LVA',
  BUL: 'BGR',
  CHI: 'CHL',
  CRC: 'CRI',
  BAN: 'BGD',
  MGL: 'MNG',
  INA: 'IDN',
  ALG: 'DZA',
  ANG: 'AGO',
  BOT: 'BWA',
  BUR: 'BFA',
  CAM: 'KHM',
  CGO: 'COG',
  CHA: 'TCD',
  ESA: 'SLV',
  GUA: 'GTM',
  HON: 'HND',
  KOS: 'KOS',
  KSA: 'SAU',
  KUW: 'KWT',
  LIB: 'LBN',
  LBA: 'LBY',
  MAD: 'MDG',
  MAW: 'MWI',
  MRI: 'MUS',
  MYA: 'MMR',
  NCA: 'NIC',
  NEP: 'NPL',
  NGR: 'NGA',
  NIG: 'NER',
  OMA: 'OMN',
  PAR: 'PRY',
  PLE: 'PSE',
  SEY: 'SYC',
  SIN: 'SGP',
  SRI: 'LKA',
  SUD: 'SDN',
  TAN: 'TZA',
  TOG: 'TGO',
  TGA: 'TON',
  TTO: 'TTO',
  PUR: 'PRI',
  BAH: 'BHS',
  BAR: 'BRB',
  BHU: 'BTN',
  GAM: 'GMB',
  HAI: 'HTI',
  MTN: 'MRT',
  URU: 'URY',
  ZAM: 'ZMB',
  ZIM: 'ZWE',
};
const NAMES = {
  ENG: 'Inglaterra',
  SCO: 'Escocia',
  WLS: 'Gales',
  FID: 'FIDE',
  FIDE: 'FIDE',
  HKG: 'Hong Kong',
  MAC: 'Macao',
  MNC: 'Mónaco',
  AND: 'Andorra',
  LIE: 'Liechtenstein',
  LUX: 'Luxemburgo',
  MLT: 'Malta',
  SGP: 'Singapur',
  SIN: 'Singapur',
  MRI: 'Mauricio',
  BHR: 'Baréin',
  BRU: 'Brunéi',
  ANT: 'Antigua y Barbuda',
  BAR: 'Barbados',
  BER: 'Bermudas',
  IVB: 'Islas Vírgenes Británicas',
  ISV: 'Islas Vírgenes de Estados Unidos',
  GCI: 'Guernsey',
  JCI: 'Jersey',
  FAI: 'Islas Feroe',
  SMR: 'San Marino',
  PLW: 'Palaos',
  AHO: 'Antillas Neerlandesas',
  ARU: 'Aruba',
  SWZ: 'Esuatini',
};
export const geoCode = (code) => GEO[code] || code;
export const federationName = (code) => NAMES[code] || countryByCode(geoCode(code))?.name || code;
const rankCache = new Map();
let playerIndex = new Map(),
  interestIndex = new Map();
let snapshot,
  failure = false,
  key = 'performance',
  page = 0;
const size = 25;
export function analyticsData() {
  return snapshot;
}
export async function loadAnalytics(onData) {
  try {
    const data = await requestJSON('/api/analytics/summary', { ttl: 600000 });
    if (data.status !== 'ok' || data.schema !== 1) throw Error('source');
    await prepareGeography().catch(() => {});
    snapshot = data;
    playerIndex = new Map(data.fide.players.map((p) => [p.id, p]));
    interestIndex = new Map(data.interest.players.map((p) => [p.id, p]));
    rankCache.clear();
    const old = new Map(players.map((p) => [p.id, p]));
    players.splice(
      0,
      players.length,
      ...data.fide.players.map((p) => ({
        ...p,
        country: geoCode(p.federation),
        initials: p.name
          .split(/[ ,]+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((v) => v[0])
          .join(''),
        aliases: old.get(p.id)?.aliases || [p.name.split(',')[0]].filter((v) => v.length >= 4),
      })),
    );
    for (const federation of data.fide.federations) {
      const code = geoCode(federation.code);
      if (!countryByCode(code))
        countries.push({
          code,
          name: federationName(federation.code),
          aliases: [federationName(federation.code)],
        });
    }
    onData?.();
  } catch {
    failure = true;
    onData?.();
  }
}
function freshness() {
  if (!snapshot)
    return failure
      ? '<div class="notice"><div><strong>El análisis no está disponible temporalmente.</strong><p>Se conserva la consulta pública. Inténtalo de nuevo más tarde.</p></div></div>'
      : '<div class="empty">Cargando los datos verificados de FIDE y Wikimedia…</div>';
  return `<div class="analytics-freshness ${snapshot.stale ? 'is-stale' : ''}"><span class="small-dot"></span><span>Lista FIDE: <strong>${snapshot.fide.month}</strong> · Wikipedia hasta <strong>${snapshot.interest.endDate}</strong> · Recopilación: ${esc(new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(new Date(snapshot.generatedAt)))} (Madrid)${snapshot.stale ? ' · Datos sin actualizar desde hace más de 48 horas' : ''}${snapshot.delivery === 'bundled' ? ' · Copia incluida en la publicación' : snapshot.delivery === 'last-good' ? ' · Última copia verificada; fuente temporalmente no disponible' : ''}</span></div>${snapshot.warnings.length ? `<details class="data-warnings"><summary>${snapshot.warnings.length} incidencias de recopilación</summary><ul>${snapshot.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></details>` : ''}`;
}
function rankRows(type) {
  if (!snapshot) return [];
  if (type === 'global')
    return snapshot.fide.federations
      .filter((f) => f.index.eligible)
      .map((f) => ({ ...f, name: federationName(f.code), score: f.index.score }));
  if (type === 'trending')
    return snapshot.interest.players
      .filter((p) => p.eligible && !p.stale)
      .map((p) => ({
        ...p,
        ...playerIndex.get(p.id),
        score: p.score,
        views: p.current,
        previousViews: p.previous,
      }));
  return snapshot.fide.players
    .filter((p) => p.performance.eligible)
    .map((p) => ({ ...p, score: p.performance.score }));
}
const sortedRows = (type) => {
  if (!rankCache.has(type))
    rankCache.set(
      type,
      rankRows(type).sort(
        (a, b) =>
          b.score - a.score ||
          (b.views || b.rating || b.index?.current || 0) -
            (a.views || a.rating || a.index?.current || 0),
      ),
    );
  return rankCache.get(type);
};
export function chart(history, value, title, labelKey = 'month') {
  const rows = history.filter((row) => Number.isFinite(row[value]));
  if (!rows.length) return '<p class="fine">Sin serie histórica disponible.</p>';
  const values = rows.map((row) => row[value]),
    min = Math.min(...values),
    max = Math.max(...values),
    range = max - min || 1;
  const x = (i) => 50 + (i / Math.max(1, rows.length - 1)) * 580,
    y = (v) => 145 - ((v - min) / range) * 110;
  const points = rows
    .map((row, i) => {
      const before = rows[i - 1];
      const gap =
        before &&
        (labelKey === 'month'
          ? Number(row.month.slice(0, 4)) * 12 +
              Number(row.month.slice(5)) -
              (Number(before.month.slice(0, 4)) * 12 + Number(before.month.slice(5))) >
            1
          : new Date(row.date) - new Date(before.date) > 86400000);
      return `${!i || gap ? 'M' : 'L'}${x(i)},${y(row[value])}`;
    })
    .join(' ');
  return `<figure class="history-chart"><figcaption>${esc(title)} · Registros disponibles</figcaption><svg viewBox="0 0 680 190" role="img" aria-label="${esc(title)}. Mínimo ${min}, máximo ${max}. Los huecos no se interpolan. Consulta las fechas y valores exactos en la tabla."><line x1="50" y1="35" x2="630" y2="35"/><line x1="50" y1="90" x2="630" y2="90"/><line x1="50" y1="145" x2="630" y2="145"/><text x="0" y="39">${number(max)}</text><text x="0" y="149">${number(min)}</text><path class="history-line" d="${points}"/>${rows.map((row, i) => `<circle cx="${x(i)}" cy="${y(row[value])}" r="3"><title>${esc(row[labelKey])}: ${number(row[value])}</title></circle>`).join('')}<text x="50" y="180">${esc(rows[0][labelKey])}</text><text x="570" y="180">${esc(rows.at(-1)[labelKey])}</text></svg></figure>`;
}
function playerLink(row) {
  return `<a href="/jugador/${esc(row.id)}">${esc(row.name || row.article.replaceAll('_', ' '))} <span>↗</span></a>`;
}
function leaderCard(type, title, subtitle, selected) {
  const leader = selected || sortedRows(type)[0];
  const name = leader
    ? type === 'global'
      ? esc(leader.name)
      : esc(leader.name || leader.article.replaceAll('_', ' '))
    : 'Sin datos comparables';
  const destination =
    leader && type !== 'global'
      ? `/jugador/${leader.id}`
      : leader
        ? `/mundo/${geoCode(leader.code)}`
        : `/indices/${type}`;
  return `<a class="analytics-leader" href="${destination}"><span class="eyebrow">${title}</span><strong>${leader ? signed(leader.score, type === 'performance' ? ' Elo' : ' %') : '—'}</strong><h3>${name}</h3><p>${subtitle}</p><span class="leader-link">${leader ? 'Ver ficha y evolución ↗' : 'Consultar índice ↗'}</span></a>`;
}
let homeWorld, homeWorldMonth;
export function renderAnalytics(section, value) {
  if (section === 'hoy' && snapshot && homeWorldMonth !== snapshot.fide.month) {
    homeWorldMonth = snapshot.fide.month;
    homeWorld = null;
    requestJSON('/api/performance/WORLD', { ttl: 600000 })
      .then((data) => {
        if (data.status !== 'ok' || data.month !== snapshot?.fide.month) return;
        homeWorld = data.groups['all:all']?.players?.length ? data.groups['all:all'] : null;
        if (location.pathname === '/panel') {
          delete $('#analytics-home').dataset.version;
          renderAnalytics('hoy');
        }
      })
      .catch(() => {});
  }

  if (
    section === 'hoy' &&
    $('#analytics-home') &&
    $('#analytics-home').dataset.version !== snapshot?.generatedAt
  )
    $('#analytics-home').innerHTML = snapshot
      ? `<div class="section-heading"><div><p class="eyebrow">LOS CAMBIOS, CON DATOS</p><h2>Tres cambios para explorar</h2></div><a class="text-link" href="/tendencias">Ver tendencias ↗</a></div><div class="three-cards">${leaderCard('performance', 'PROGRESIÓN ELO · 12 MESES', homeWorld ? `FIDE ${snapshot.fide.month} · Mayor variación entre ${number(homeWorld.total)} jugadores comparables de las listas completas.` : `FIDE ${snapshot.fide.month} · Mayor subida de Elo entre ${sortedRows('performance').length} jugadores comparables de la selección.`, homeWorld?.players[0])}${leaderCard('trending', 'WIKIPEDIA · 7 VS. 7 DÍAS', `Wikimedia hasta ${snapshot.interest.endDate} · Mayor variación relativa entre ${sortedRows('trending').length} artículos comparables en inglés.`)}${leaderCard('global', 'CENSO FIDE · 12 MESES', `FIDE ${snapshot.fide.month} · Mayor variación del censo entre ${sortedRows('global').length} federaciones comparables.`)}</div>`
      : '';
  if (section === 'hoy' && snapshot) $('#analytics-home').dataset.version = snapshot.generatedAt;
  if (section === 'tendencias') renderTrends();
  if (section === 'indices') renderIndex(value);
  if (section === 'jugador') enhancePlayer(value);
  if (section === 'mundo') enhanceCountry(value || 'ESP');
}
function renderTrends() {
  if (snapshot && $('#trends-data').dataset.version === snapshot.generatedAt) return;
  if (snapshot) $('#trends-data').dataset.version = snapshot.generatedAt;
  $('#trends-data').innerHTML = freshness();
  if (!snapshot) return;
  const rising = sortedRows('performance').filter((p) => p.score > 0),
    attention = sortedRows('trending'),
    global = sortedRows('global');
  const leaders = topRatings(snapshot.fide.players);
  $('#trends-data').innerHTML +=
    `<details class="panel top-ratings"><summary><span>Mayores Elo de la selección</span><small>Lista FIDE ${esc(snapshot.fide.month)} · Ver 10 jugadores ↓</small></summary><p class="source-note">Elo estándar de la lista mensual, no Elo en directo. Ordenado dentro de la selección seguida por Pulse; los empates se muestran por nombre.</p>${leaders.map((p, i) => `<div class="trend-row"><span class="trend-position">${i + 1}</span><div>${playerLink(p)}<small>${esc(federationName(p.federation))}</small></div><strong>${number(p.rating)}</strong></div>`).join('') || '<p class="fine">No hay datos comparables disponibles.</p>'}<p class="source-note"><a href="https://ratings.fide.com/top_lists.phtml" target="_blank" rel="noopener noreferrer">Consultar los rankings oficiales de FIDE ↗</a></p></details><div class="analytics-summary"><div><strong>${number(snapshot.fide.totalPlayers)}</strong><span>Registros en la lista estándar</span></div><div><strong>${snapshot.fide.players.length}</strong><span>Jugadores en seguimiento</span></div><div><strong>${snapshot.fide.sources.length}</strong><span>Listas mensuales verificadas</span></div><div><strong>${attention.length} / ${snapshot.catalog.length}</strong><span>Artículos con comparación válida</span></div></div><div class="trends-columns"><article class="panel trends-panel"><div class="column-title"><h2>Progresión de Elo</h2><a href="/indices/performance">Ver ranking ↗</a></div>${rising
      .slice(0, 5)
      .map(
        (p, i) =>
          `<div class="trend-row"><span class="trend-position">${i + 1}</span><div>${playerLink(p)}<small>${number(p.rating)} Elo · ${esc(federationName(p.federation))}</small></div><strong>${signed(p.score)}</strong></div>`,
      )
      .join(
        '',
      )}<p class="source-note">Progresión en 12 meses dentro de la selección. Mínimo 12 partidas y 13 listas consecutivas. No es performance por partida.</p></article><article class="panel trends-panel"><div class="column-title"><h2>Interés público</h2><a href="/indices/trending">Ver ranking ↗</a></div>${attention
      .slice(0, 5)
      .map(
        (p, i) =>
          `<div class="trend-row"><span class="trend-position">${i + 1}</span><div>${playerLink(p)}<small>${number(p.views)} visitas · Wikipedia en inglés</small></div><strong>${signed(p.score, ' %')}</strong></div>`,
      )
      .join(
        '',
      )}<p class="source-note">Siete días completos frente a los siete anteriores, con dos días de margen de publicación. Solo consultas de usuarios, todos los accesos.</p></article></div><article class="panel federation-overview"><div class="column-title"><h2>Federaciones en movimiento</h2><a href="/indices/global">Explorar Global ↗</a></div><div class="federation-leaders">${global
      .slice(0, 4)
      .map(
        (f) =>
          `<a href="/mundo/${geoCode(f.code)}"><span>${esc(f.name)} · ${f.code}</span><strong>${signed(f.score, ' %')}</strong><small>${number(f.index.current)} activos; base ${number(f.index.baseline)}</small></a>`,
      )
      .join(
        '',
      )}</div><p class="source-note">Cambio del censo activo FIDE a 12 meses, con base mínima de 100 jugadores. Influido por altas, bajas, cambios de bandera y revisiones de la fuente. No mide todo el ajedrez de un país.</p></article><div class="selection-note"><strong>Qué estamos observando</strong><p>${esc(snapshot.fide.cohort)}</p><p>Trending observa únicamente el catálogo indicado. Performance analiza las listas FIDE completas con trece meses consecutivos y al menos doce partidas; no se publican valores cuando faltan datos suficientes.</p></div>`;
}
function renderIndex(type) {
  key = ['performance', 'trending', 'global'].includes(type) ? type : 'performance';
  $('#index-data-status').innerHTML =
    `<div class="index-explainer"><h2>${esc(indices[key].name)}</h2><p>${esc(indices[key].description)}</p><button type="button" class="text-link" data-method-link>Cómo se calcula ↓</button></div>` +
    freshness();
  const container = $('#index-controls');
  if (!snapshot) {
    $('#index-results').innerHTML = '';
    return;
  }
  if (container.dataset.key !== key) {
    page = 0;
    container.dataset.key = key;
    const federations = [
      ...new Set(
        (key === 'performance' ? snapshot.fide.federations : snapshot.fide.players).map(
          (p) => p.code || p.federation,
        ),
      ),
    ].sort((a, b) => federationName(a).localeCompare(federationName(b), 'es'));
    container.innerHTML = `<label>Buscar <input id="analytics-search" type="search" placeholder="${key === 'global' ? 'Federación o código' : key === 'performance' ? 'Buscar entre los primeros 100' : 'Nombre de jugador'}"></label><label>Federación <select id="analytics-federation"><option value="">Todas</option>${(key === 'global' ? snapshot.fide.federations.map((f) => f.code).sort() : federations).map((code) => `<option value="${code}">${esc(federationName(code))} · ${code}</option>`).join('')}</select></label>${key !== 'global' ? '<label>Edad aproximada <select id="analytics-age"><option value="">Todas</option><option value="u20">Hasta 20 años</option><option value="u16">Hasta 16 años</option><option value="adult">Más de 20 años</option></select></label><label>Nivel actual <select id="analytics-level"><option value="">Todos</option><option value="elite">2600 o más</option><option value="master">2400–2599</option><option value="other">Menos de 2400</option></select></label>' : ''}`;
  }
  enhanceSelects(container);
  renderRanking();
}
let rankingSequence = 0;
async function renderRanking() {
  const sequence = ++rankingSequence;
  if (!snapshot) return;
  const term = normalize($('#analytics-search')?.value || ''),
    federation = $('#analytics-federation')?.value || '',
    age = $('#analytics-age')?.value || '',
    level = $('#analytics-level')?.value || '';
  const year = Number(snapshot.fide.month.slice(0, 4));
  let all = sortedRows(key),
    comparableCount = all.length,
    worldwide = false;
  if (key === 'performance') {
    $('#index-results').innerHTML = '<div class="empty">Consultando la progresión mundial…</div>';
    try {
      const data = await requestJSON('/api/performance/' + (federation || 'WORLD'), {
        ttl: 600000,
      });
      if (sequence !== rankingSequence || key !== 'performance') return;
      if (data.month !== snapshot.fide.month || data.status !== 'ok') throw Error('period');
      const group = data.groups[`${age || 'all'}:${level || 'all'}`] || { total: 0, players: [] };
      all = group.players;
      comparableCount = group.total;
      worldwide = true;
    } catch {
      if (sequence !== rankingSequence || key !== 'performance') return;
      $('#index-results').innerHTML =
        '<div class="empty">La progresión mundial no está disponible para la lista actual. Vuelve a intentarlo más tarde.</div>';
      return;
    }
  }
  const rows = all.filter((row) => {
    if (
      term &&
      !normalize(`${row.name || row.article} ${row.code || row.federation}`).includes(term)
    )
      return false;
    if (federation && (row.code || row.federation) !== federation) return false;
    const approximate = row.birthYear ? year - row.birthYear : null;
    if (
      age &&
      (approximate === null ||
        (age === 'u20' && approximate > 20) ||
        (age === 'u16' && approximate > 16) ||
        (age === 'adult' && approximate <= 20))
    )
      return false;
    return (
      !level ||
      (level === 'elite' && row.rating >= 2600) ||
      (level === 'master' && row.rating >= 2400 && row.rating < 2600) ||
      (level === 'other' && row.rating < 2400)
    );
  });
  const pages = Math.max(1, Math.ceil(rows.length / size));
  page = Math.min(page, pages - 1);
  const visible = rows.slice(page * size, (page + 1) * size);
  const headers =
    key === 'performance'
      ? ['Jugador', 'Federación', 'Elo actual', 'Partidas / 12 m', 'Progresión · Δ Elo']
      : key === 'trending'
        ? ['Jugador', 'Federación', 'Visitas / 7 d', 'Visitas / 7 d previos', 'Wikipedia · %']
        : [
            'Federación',
            'Activos actuales',
            'Activos hace 12 m',
            'Media top 10',
            'Censo activo · %',
          ];
  const body = visible
    .map((row, i) => {
      const values =
        key === 'performance'
          ? [
              playerLink(row),
              esc(federationName(row.federation)),
              number(row.rating),
              number(row.performance.games),
              signed(row.score),
            ]
          : key === 'trending'
            ? [
                playerLink(row),
                esc(federationName(row.federation)),
                number(row.views),
                number(row.previousViews),
                signed(row.score, ' %'),
              ]
            : [
                `<a href="/mundo/${geoCode(row.code)}">${esc(row.name)} <small>${row.code}</small> ↗</a>`,
                number(row.index.current),
                number(row.index.baseline),
                number(row.current?.top10Average),
                signed(row.score, ' %'),
              ];
      return `<tr><td class="rank-number">${page * size + i + 1}</td>${values.map((value, n) => `<${n === 0 ? 'th scope="row"' : 'td'}${n === values.length - 1 ? ` class="index-score ${row.score < 0 ? 'negative' : ''}" data-label="${headers[n]}"` : ` data-label="${headers[n]}"`}>${value}</${n === 0 ? 'th' : 'td'}>`).join('')}</tr>`;
    })
    .join('');
  $('#index-results').innerHTML =
    `<p class="ranking-scope">${key === 'global' ? 'Censo de las listas estándar FIDE completas.' : key === 'trending' ? `Selección de ${snapshot.catalog.length} artículos de Wikipedia en inglés; no mide todo el interés por el ajedrez.` : 'Cálculo sobre las listas estándar FIDE completas. Se muestran como máximo los 100 primeros de cada combinación de filtros; la búsqueda actúa sobre esos resultados.'}</p><div class="ranking-heading"><p>${rows.length} resultados visibles · ${worldwide ? number(comparableCount) + ' jugadores comparables con estos filtros' : all.length + ' comparables ' + (key === 'global' ? 'de ' + snapshot.fide.federations.length + ' códigos FIDE' : 'en la selección')}</p><span>Metodología v1.0 · ${key === 'trending' ? snapshot.interest.endDate : snapshot.fide.month}</span></div><p class="ranking-overflow-hint">Desliza la tabla para consultar todos los valores →</p><div class="rank-table-wrap"><table class="rank-table"><caption>${key === 'performance' ? 'Progresión de Elo a 12 meses · listas FIDE completas' : key === 'trending' ? 'Variación del interés en Wikipedia · selección editorial' : 'Crecimiento del censo activo de federaciones FIDE'}</caption><thead><tr><th scope="col">#</th>${headers.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${body || '<tr><td colspan="6">No hay resultados con estos filtros.</td></tr>'}</tbody></table></div><div class="ranking-pagination"><button data-analytics-page="${page - 1}" ${page === 0 ? 'disabled' : ''}>← Anterior</button><span>Página ${page + 1} de ${pages}</span><button data-analytics-page="${page + 1}" ${page === pages - 1 ? 'disabled' : ''}>Siguiente →</button></div><p class="source-note">${key === 'global' ? 'Base mínima: 100 jugadores activos hace 12 meses. Listas estándar FIDE completas. No se utiliza el número de retransmisiones como actividad nacional.' : key === 'trending' ? 'Base mínima: 100 visitas en los siete días anteriores. Excluye series incompletas o cuya última consulta falló. El idioma observado es únicamente inglés.' : 'Requiere 13 listas consecutivas, 12 partidas en los 12 meses y estado activo actual. La edad es el año de la lista menos el año de nacimiento; no una edad exacta.'}</p>`;
}
export async function enhancePlayer(id) {
  if (!snapshot) return;
  let player = playerIndex.get(id);
  if (!player) return;
  const view = $('#player-profile'),
    summary = view.querySelector('.profile-summary');
  if (!summary) return;
  let detail;
  try {
    detail = await requestJSON('/api/players/' + id, { ttl: 600000 });
  } catch {
    if (summary.isConnected)
      summary.insertAdjacentHTML(
        'afterend',
        '<p class="fine">El histórico no está disponible temporalmente.</p>',
      );
    return;
  }
  if (!summary.isConnected || location.pathname !== '/jugador/' + id) return;
  player = detail.player;
  summary.innerHTML = `<div><span>Elo estándar · ${snapshot.fide.month}</span><strong>${number(player.rating)}</strong></div><div><span>Variación a 12 meses</span><strong>${signed(player.performance.delta, ' Elo')}</strong></div><div><span>Edad por año de nacimiento</span><strong>${player.birthYear ? Number(snapshot.fide.month.slice(0, 4)) - player.birthYear + ' años aprox.' : 'No disponible'}</strong></div>`;
  const note = view.querySelector('.fine');
  if (note)
    note.textContent = `Fuente: lista estándar FIDE ${snapshot.fide.month}. Federación registrada: ${federationName(player.federation)} (${player.federation}). ${player.performance.eligible ? 'Performance v1.0: ' + signed(player.performance.score, ' Elo') + '.' : player.performance.reason} No es performance por partida.`;
  const interest = detail.interest;
  const history = player.history;
  const details = `<div class="player-analytics">${chart(history, 'rating', 'Evolución del Elo estándar')}<details class="history-details"><summary>Ver ${history.length} registros mensuales y fuentes</summary><div class="rank-table-wrap"><table><thead><tr><th>Mes</th><th>Elo</th><th>Partidas del periodo</th><th>Estado</th><th>Fuente</th></tr></thead><tbody>${history.map((row) => `<tr><td>${row.month}</td><td>${row.rating}</td><td>${row.games}</td><td>${row.active ? 'Activo' : 'Inactivo'}</td><td><a href="${esc(snapshot.fide.sources.find((s) => s.month === row.month)?.url || 'https://ratings.fide.com/download_lists.phtml')}" target="_blank" rel="noopener noreferrer">Lista FIDE ↗</a></td></tr>`).join('')}</tbody></table></div></details>${interest ? `<div class="interest-summary"><h2>Interés público</h2><p><strong>${signed(interest.score, ' %')}</strong> · ${number(interest.current)} visitas frente a ${number(interest.previous)} · ${interest.start} a ${interest.end}${interest.stale ? ' · Última consulta fallida, valor excluido del ranking' : ''}</p><a href="https://en.wikipedia.org/wiki/${encodeURIComponent(interest.article)}" target="_blank" rel="noopener noreferrer">${esc(interest.article.replaceAll('_', ' '))} · Wikipedia en inglés ↗</a></div>${chart(interest.history, 'views', 'Visitas diarias · usuarios · todos los accesos', 'date')}<details class="history-details"><summary>Ver visitas diarias y fuente</summary><p><a href="${esc(interest.sourceUrl)}" target="_blank" rel="noopener noreferrer">Respuesta de Wikimedia ↗</a></p><div class="daily-values">${interest.history.map((h) => `<span>${h.date}: <strong>${number(h.views)}</strong></span>`).join('')}</div></details>` : '<p class="fine">Este jugador no forma parte del catálogo editorial de Wikipedia seguido por Trending.</p>'}</div>`;
  summary.insertAdjacentHTML(
    'afterend',
    details +
      `<details class="history-details"><summary>Rápidas y blitz · datos de Lichess</summary><p class="fine">Consulta opcional del directorio FIDE de Lichess; su API no indica la fecha de lista.</p><button class="refresh-button" type="button" data-rating-detail="${id}">Consultar datos ↗</button><div aria-live="polite"></div></details>`,
  );
}
export function enhanceCountry(code) {
  if (!snapshot) return;
  const fed = snapshot.fide.federations.find((f) => geoCode(f.code) === code);
  const view = $('#country-profile');
  if (!fed || !view) return;
  const now = fed.current;
  if (!now) return;
  view
    .querySelector('h2')
    ?.insertAdjacentHTML(
      'afterend',
      `<div class="country-data"><p class="eyebrow">LISTA ESTÁNDAR FIDE · ${snapshot.fide.month} · ${fed.code}</p><strong>${number(now.active)}</strong><span> jugadores activos registrados</span><p>Global v1.0: <b>${signed(fed.index.score, ' %')}</b> a 12 meses. Base: ${number(fed.index.baseline)} activos.</p><p>${number(now.titled)} con título · ${number(now.juniors)} de hasta 20 años por año de nacimiento · Media top 10: ${number(now.top10Average)} Elo.</p>${!fed.index.eligible ? `<p>${esc(fed.index.reason)}</p>` : ''}<p class="source-note">Federación FIDE; no equivale necesariamente al territorio o a su actividad total.</p></div>`,
    );
  const countryData = view.querySelector('.country-data');
  if (countryData) {
    countryData.insertAdjacentHTML(
      'beforeend',
      '<div class="country-risers-loading"><p class="source-note">Consultando progresiones de la federación…</p></div>',
    );
    const target = countryData.querySelector('.country-risers-loading');
    requestJSON('/api/performance/' + fed.code, { ttl: 600000 })
      .then((data) => {
        if (!target.isConnected) return;
        if (data.status !== 'ok' || data.month !== snapshot.fide.month) throw Error('period');
        const group = data.groups['all:all'] || { total: 0, players: [] };
        const leaders = group.players.filter((p) => p.score > 0).slice(0, 3);
        target.innerHTML = leaders.length
          ? `<h3>Mayores progresiones de la federación</h3><div class="country-risers">${leaders.map((player) => `<a href="/jugador/${esc(player.id)}">${esc(player.name)} <strong>${signed(player.score, ' Elo')}</strong></a>`).join('')}</div><p class="source-note">Variación a 12 meses entre ${number(group.total)} jugadores comparables de esta federación en las listas FIDE completas.</p><a class="text-link" href="/indices/performance">Explorar el índice ↗</a>`
          : '<p class="source-note">No hay progresiones positivas comparables para esta federación.</p>';
      })
      .catch(() => {
        if (target.isConnected)
          target.innerHTML =
            '<p class="source-note">Las progresiones de la federación no están disponibles temporalmente.</p>';
      });
  }
  for (const p of view.querySelectorAll('p'))
    if (p.textContent.startsWith('Consulta Global para ver las federaciones'))
      p.textContent =
        'La variación del censo activo está disponible en Global. Puede reflejar altas, bajas, transferencias o revisiones de la fuente.';
}
let searchTimer;
document.addEventListener('input', (event) => {
  if (event.target.id === 'analytics-search') {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      page = 0;
      renderRanking();
    }, 120);
  }
});
document.addEventListener('change', (event) => {
  if (event.target.closest('#index-controls')) {
    page = 0;
    renderRanking();
  }
});
document.addEventListener('click', async (event) => {
  const control = event.target.closest('[data-rating-detail]');
  if (control && !control.disabled) {
    const output = control.nextElementSibling;
    control.disabled = true;
    output.textContent = 'Consultando Lichess…';
    try {
      const data = await requestJSON('/api/directory/players/' + control.dataset.ratingDetail, {
        ttl: 3600000,
      });
      if (!output.isConnected) return;
      output.innerHTML = `<p>Rápidas: <strong>${number(data.player.rapid)}</strong> · Blitz: <strong>${number(data.player.blitz)}</strong></p><p class="fine">Consulta: ${esc(new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(new Date(data.fetchedAt)))} (Madrid). ${esc(data.period)}</p>${data.history ? ['rapid', 'blitz'].map((key) => `<details class="history-details"><summary>Histórico ${key === 'rapid' ? 'rápidas' : 'blitz'} · ${data.history[key].length} observaciones</summary>${chart(data.history[key], 'rating', key === 'rapid' ? 'Elo rápido' : 'Elo blitz')}</details>`).join('') + `<p class="fine">${esc(data.historyNote)}</p>` : '<p class="fine">El histórico no está disponible temporalmente.</p>'}`;
      control.hidden = true;
    } catch {
      if (output.isConnected) {
        output.textContent = 'No se han podido consultar los datos. Inténtalo de nuevo.';
        control.disabled = false;
      }
    }
  }
  const button = event.target.closest('[data-analytics-page]');
  if (button && !button.disabled) {
    page = Number(button.dataset.analyticsPage);
    renderRanking();
    $('#index-results')?.scrollIntoView({ block: 'start' });
  }
});
