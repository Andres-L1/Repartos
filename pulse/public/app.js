import { countries, players, indices, countryByCode, matchesCountry } from './data.js';
const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const dateText = value => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(date) : 'Fecha no disponible';
};
let news = null, broadcasts = null, selectedCountry = 'ESP', activeFeed = 'all', loading = false, showAllBroadcasts = false;
const statusText = item => item.status === 'live' ? 'EN DIRECTO' : item.status === 'finished' ? 'FINALIZADO' : 'PROGRAMADO';
const relatedCountries = text => countries.filter(country => matchesCountry(text, country));
const relatedPlayers = text => players.filter(player => player.aliases.some(alias => text.toLowerCase().includes(alias.toLowerCase())));

function mapMarkup(list, interactive = true) {
  return `<svg viewBox="65 45 810 370" role="img" aria-label="Mapa mundial esquemático con países del directorio. No representa eventos ni fronteras oficiales."><defs><pattern id="${interactive ? 'world' : 'home'}-grid" width="42" height="38" patternUnits="userSpaceOnUse"><path d="M42 0H0V38" class="map-grid"/></pattern></defs><rect x="65" y="45" width="810" height="370" fill="url(#${interactive ? 'world' : 'home'}-grid)"/><g class="land"><path d="M115 99 145 76 187 68 216 83 245 78 273 93 302 96 316 119 298 135 282 152 265 165 247 182 234 196 224 189 210 183 196 165 176 165 157 150 147 131 126 127 110 113Z"/><path d="m230 194 20 6 5 13 18 5 9 18-10 9-16-17-14-6Z"/><path d="m294 67 27-15 32 7 7 25-22 26-19 1-14-21Z"/><path d="m281 237 30-6 34 17 17 26-8 25-15 18-10 32-19 28-7 31-15-16-6-36-15-31-9-32 7-24Z"/><path d="m463 151 6-18 19-7 9-16-5-13 12-15 13-4 4 27 17 10 18-6 17 14 1 20-21 16-24-1-8 16-17-10-16 9-19-3Z"/><path d="m464 173 32-9 28 4 23 22 20 6 15 35-19 32-10 40-21 30-17 3-12-21-12-27-17-16-9-24-19-23 1-30Z"/><path d="m553 121 25-23 36-13 34 1 28-16 43 1 38 13 30 4 30 20 22 12 21 1 5 17-28 8-9 22-25 9-16 19-20 2-17 17-25-11-18 8-16-12-15 16-2 23-13 11-15-23-8-22-20-11-20 6-18-22-13-8-10-24-19-6Z"/><path d="m719 216 14 5 7 25 17 15 24 8-7 11-23-9-11-13-13-19Z"/><path d="m776 290 26-13 34 10 22 29-1 30-26 11-26-14-24 1-16-20Z"/><path d="m817 204 7-19 7-5 4 13-11 18Z"/><path d="m572 293 6 9-7 21-7-4Z"/><path d="m449 109 8-9 4 15-3 14-7-5Z"/></g>${list.map(c => `<a class="map-link" href="#mundo/${c.code}" aria-label="Explorar ${escape(c.name)}"><circle class="map-ring" cx="${c.x}" cy="${c.y}" r="11"/><circle class="map-dot" cx="${c.x}" cy="${c.y}" r="4.5"/><title>${escape(c.name)}</title>${['ESP', 'IND', 'USA', 'BRA', 'CHN', 'NOR'].includes(c.code) ? `<text x="${c.x + 10}" y="${c.y - 8}">${escape(c.name)}</text>` : ''}</a>`).join('')}</svg>`;
}
function renderMaps() {
  $('#home-map').innerHTML = mapMarkup(countries, false);
  const term = $('#country-search').value.trim().toLocaleLowerCase('es');
  const filter = $('#map-filter').value;
  const list = countries.filter(country => country.name.toLocaleLowerCase('es').includes(term) && (filter === 'all' || filter === 'players' && players.some(p => p.country === country.code) || filter === 'tournaments' && broadcasts?.items.some(t => matchesCountry(t.location, country))));
  $('#world-map').innerHTML = mapMarkup(list);
  $('#country-list').innerHTML = list.length ? list.map(c => `<a class="country-button" href="#mundo/${c.code}" ${c.code === selectedCountry ? 'aria-current="true"' : ''}>${escape(c.name)}</a>`).join('') : '<p class="fine">No hay países que coincidan con este filtro en los datos disponibles.</p>';
}
function broadcastCard(item, compact = false) {
  return `<a class="broadcast-card" href="#torneo/${escape(item.id)}"><div class="broadcast-meta"><span class="${item.status === 'live' ? 'live-badge' : ''}">${item.status === 'live' ? '<i class="live-dot"></i>' : ''}${statusText(item)}</span><span>${escape(item.location || 'Ubicación sin indicar')}</span></div><h4>${escape(item.name)}</h4>${compact ? '' : `<p>${escape(item.round || item.format || 'Retransmisión de ajedrez')}</p><div class="card-bottom"><span>${dateText(item.startsAt)}</span><b>Explorar torneo ↗</b></div>`}</a>`;
}
function errorMarkup(message) {
  return `<div class="empty">${escape(message)}<button type="button" data-retry>Volver a consultar ↻</button></div>`;
}
function renderFeeds() {
  if (news) {
    $('#news-count').textContent = news.status === 'ok' ? news.items.length : '—';
    $('#news-list').innerHTML = news.status !== 'ok' ? errorMarkup('FIDE no está disponible temporalmente. No se muestran titulares de ejemplo.') : news.items.length ? news.items.slice(0, activeFeed === 'news' ? 10 : 5).map((item, n) => {
      const links = [...relatedPlayers(item.title).map(p => `<a href="#jugador/${p.id}">${escape(p.name)} ↗</a>`), ...relatedCountries(item.title).map(c => `<a href="#mundo/${c.code}">${escape(c.name)} ↗</a>`)];
      return `<article class="news-item"><span class="news-order">${String(n + 1).padStart(2, '0')}</span><div><h4><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.title)}</a></h4><div class="item-meta"><span>FIDE</span><span>·</span><time datetime="${escape(item.publishedAt)}">${dateText(item.publishedAt)}</time></div>${links.length ? `<div class="related-links">${links.join(' · ')}</div>` : ''}</div><a class="arrow" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Leer en FIDE: ${escape(item.title)}">↗</a></article>`;
    }).join('') : '<div class="empty">La fuente no ha devuelto titulares.</div>';
    $('#news-source').textContent = news.status === 'ok' ? `RSS oficial FIDE · Consultado ${dateText(news.fetchedAt)} (Madrid). Titulares en el idioma original. ${activeFeed === 'news' ? 'Todos los titulares recibidos.' : 'Selecciona Actualidad para ver todos los titulares recibidos.'}` : 'Fuente: RSS FIDE · Consulta fallida.';
  }
  if (broadcasts) {
    $('#events-count').textContent = broadcasts.status === 'ok' ? broadcasts.items.length : '—';
    $('#live-count').textContent = broadcasts.status === 'ok' ? broadcasts.items.filter(t => t.status === 'live').length : '—';
    const items = broadcasts.items.filter(t => activeFeed !== 'live' || t.status === 'live');
    $('#broadcast-list').innerHTML = broadcasts.status !== 'ok' ? errorMarkup('Lichess no está disponible temporalmente. No se muestran torneos de ejemplo.') : items.length ? items.slice(0, showAllBroadcasts || activeFeed === 'live' ? 24 : 3).map(t => broadcastCard(t)).join('') + (activeFeed === 'all' && items.length > 3 ? `<button class="refresh-button" type="button" data-show-broadcasts>${showAllBroadcasts ? 'Mostrar menos ↑' : `Ver las ${items.length} retransmisiones ↓`}</button>` : '') : '<div class="empty">No hay retransmisiones en esta selección. Puedes consultar el directorio completo en Lichess.</div>';
    $('#broadcast-source').textContent = broadcasts.status === 'ok' ? `Lichess Broadcast · Consultado ${dateText(broadcasts.fetchedAt)} (Madrid). Selección destacada, no censo mundial. Caché: 5 minutos.` : 'Fuente: Lichess Broadcast · Consulta fallida.';
  }
  $('#news-column').hidden = activeFeed === 'live';
  $('#broadcast-column').hidden = activeFeed === 'news';
  $('.feed-grid').classList.toggle('single-column', activeFeed !== 'all');
  if (news && broadcasts) $('#radar-status').textContent = news.status === 'ok' && broadcasts.status === 'ok' ? 'Fuentes consultadas · Cobertura parcial. Horas de Madrid.' : 'Hay fuentes no disponibles. Los guiones indican ausencia de datos.';
}
function renderCountry() {
  const country = countryByCode(selectedCountry) || countries[0];
  const foundPlayers = players.filter(p => p.country === country.code);
  const tournaments = broadcasts?.items.filter(t => matchesCountry(t.location, country)) || [];
  const foundNews = news?.items.filter(n => matchesCountry(n.title, country)) || [];
  $('#country-profile').innerHTML = `<p class="eyebrow">FICHA DE PAÍS</p><span class="country-code">${country.code}</span><h2>${escape(country.name)}</h2><p>Un punto de partida para explorar su ajedrez. Directorio editorial inicial; la actividad nacional completa aún no está integrada.</p><h3>Jugadores del directorio</h3><div class="profile-links">${foundPlayers.length ? foundPlayers.map(p => `<a href="#jugador/${p.id}">${escape(p.name)}<span>Ver ficha ↗</span></a>`).join('') : '<p>Aún no hay fichas locales para este país.</p>'}<a href="https://ratings.fide.com/" target="_blank" rel="noopener noreferrer">Directorio oficial FIDE <span>↗</span></a></div><h3>Competiciones en la selección</h3>${tournaments.length ? tournaments.slice(0, 4).map(t => broadcastCard(t, true)).join('') : `<p>${broadcasts?.status === 'ok' ? 'Sin coincidencias de ubicación en la selección actual. Esto no implica ausencia de torneos en el país.' : 'Consulta de retransmisiones no disponible todavía.'}</p>`}<h3>Actualidad relacionada</h3><div class="profile-links">${foundNews.length ? foundNews.map(n => `<a href="${escape(n.url)}" target="_blank" rel="noopener noreferrer">${escape(n.title)} <span>↗</span></a>`).join('') : '<p>Sin coincidencias explícitas en los titulares recibidos. La cobertura no es exhaustiva.</p>'}</div><h3>Tendencia nacional</h3><p>Pendiente de histórico comparable. No se calcula actividad nacional a partir de retransmisiones destacadas.</p><a class="text-link" href="#indices/global">Conocer el índice Global ↗</a>`;
}
function renderMethodology(key) {
  const index = indices[key] || indices.performance;
  document.querySelectorAll('[data-index]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.index === key)));
  $('#methodology').innerHTML = `<p class="eyebrow">CHEDEX ${index.name.toUpperCase()}</p><h2>${index.title}</h2><p class="lead">${index.description}</p><span class="status-label">${index.state}</span><div class="method-grid"><div><h3>Qué mediríamos</h3><p>${index.calculation}</p></div><div><h3>Periodo y actualización</h3><p>${index.period}</p></div><div><h3>Fuente principal</h3><p>${index.source}</p><a class="text-link" href="${index.url}" target="_blank" rel="noopener noreferrer">Consultar fuente ↗</a></div></div><p class="formula">${index.formula}</p><p><strong>Alcance y límites:</strong> ${index.limitation}</p><p class="fine">Documento de metodología: v1.0 · Propuesta inicial. Índice sin publicar; última actualización de datos: no disponible.</p>`;
}
function renderPlayer(id) {
  const player = players.find(p => p.id === id);
  if (!player) { $('#player-profile').innerHTML = '<div class="empty">Esta ficha no está en el directorio. <a href="#tendencias">Volver a jugadores ↗</a></div>'; return; }
  const country = countryByCode(player.country);
  const stories = news?.items.filter(n => relatedPlayers(n.title).includes(player)) || [];
  const tournaments = broadcasts?.items.filter(t => relatedPlayers(t.players).includes(player)) || [];
  $('#player-profile').innerHTML = `<a class="back-link" href="#tendencias">← Explorar jugadores</a><article class="panel player-profile-card"><p class="eyebrow">FICHA CONECTADA · DIRECTORIO EDITORIAL</p><div class="player-avatar">${player.initials}</div><h1>${player.name}</h1><a class="text-link" href="#mundo/${country.code}">${country.name} · Explorar país ↗</a><div class="profile-summary"><div><span>Identificador FIDE</span><strong>${player.id}</strong></div><div><span>Elo actual</span><strong>Sin importar</strong></div><div><span>Evolución</span><strong>Histórico pendiente</strong></div></div><p class="fine">La federación del directorio se debe contrastar con la ficha oficial. No se muestran puntuaciones ni títulos sin una lista FIDE fechada.</p><div class="profile-links"><a href="https://ratings.fide.com/profile/${player.id}" target="_blank" rel="noopener noreferrer">Perfil, Elo e histórico oficiales en FIDE <span>↗</span></a><a href="#indices/performance">Cómo se medirá la progresión <span>↗</span></a><a href="#indices/trending">Cómo se medirá el interés público <span>↗</span></a></div><h2 class="profile-section-title">Actualidad relacionada</h2>${stories.length ? stories.map(n => `<p><a href="${escape(n.url)}" target="_blank" rel="noopener noreferrer">${escape(n.title)} ↗</a></p>`).join('') : '<p class="fine">Sin menciones explícitas en los titulares recibidos.</p>'}<h2 class="profile-section-title">Competiciones relacionadas</h2>${tournaments.length ? tournaments.map(t => broadcastCard(t)).join('') : '<p class="fine">Sin coincidencias explícitas en los participantes indicados por Lichess. La selección no es exhaustiva.</p>'}</article>`;
}
function renderTournament(id) {
  const item = broadcasts?.items.find(t => t.id === id);
  if (!item) { $('#player-profile').innerHTML = '<a class="back-link" href="#hoy">← Volver a Hoy</a><div class="empty">Este torneo no está en la selección actual o la fuente aún está cargando. <a href="https://lichess.org/broadcast" target="_blank" rel="noopener noreferrer">Consultar Lichess ↗</a></div>'; return; }
  const countryLinks = relatedCountries(item.location);
  const playerLinks = relatedPlayers(item.players);
  $('#player-profile').innerHTML = `<a class="back-link" href="#hoy">← Volver a Hoy</a><article class="panel player-profile-card"><p class="eyebrow">COMPETICIÓN · LICHESS BROADCAST</p><span class="live-badge">${statusText(item)}</span><h1>${escape(item.name)}</h1><p class="subtitle">${escape(item.location || 'Ubicación sin indicar')} · ${escape(item.round)}</p><div class="profile-summary"><div><span>Fecha de ronda</span><strong>${dateText(item.startsAt)}</strong></div><div><span>Formato</span><strong>${escape(item.format || 'No indicado')}</strong></div><div><span>Ritmo</span><strong>${escape(item.timeControl || 'No indicado')}</strong></div></div><div class="profile-links"><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">Ver partidas y resultados en Lichess <span>↗</span></a>${countryLinks.map(c => `<a href="#mundo/${c.code}">Explorar ${c.name} <span>↗</span></a>`).join('')}${playerLinks.map(p => `<a href="#jugador/${p.id}">${p.name} <span>Ver ficha ↗</span></a>`).join('')}</div><p class="fine">Fuente: Lichess · Consultada ${dateText(broadcasts.fetchedAt)} (Madrid). Los países se enlazan por la ubicación comunicada. Los jugadores se enlazan cuando aparecen expresamente en los datos de participantes.</p></article>`;
}
function route(scroll = true) {
  const [section, value] = location.hash.replace(/^#/, '').split('/');
  const name = ['mundo', 'tendencias', 'indices', 'fuentes', 'jugador', 'torneo'].includes(section) ? section : 'hoy';
  const view = name === 'jugador' || name === 'torneo' ? 'ficha' : name;
  document.querySelectorAll('.view').forEach(el => { el.hidden = el.id !== view; });
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === name || name === 'jugador' && link.dataset.nav === 'tendencias' || name === 'torneo' && link.dataset.nav === 'hoy') link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (name === 'mundo') { if (countryByCode(value)) selectedCountry = value; renderMaps(); renderCountry(); }
  if (name === 'indices') renderMethodology(indices[value] ? value : 'performance');
  if (name === 'jugador') renderPlayer(value);
  if (name === 'torneo') renderTournament(value);
  document.title = `Chedex Pulse · ${{ hoy: 'El pulso del ajedrez', mundo: 'Mundo', tendencias: 'Tendencias', indices: 'Índices', fuentes: 'Fuentes y metodología', jugador: 'Jugador', torneo: 'Competición' }[name]}`;
  if (scroll) { window.scrollTo({ top: 0, behavior: 'instant' }); $('#main').focus({ preventScroll: true }); }
}
async function loadSources() {
  if (loading) return;
  loading = true; $('#refresh').disabled = true; $('#refresh').textContent = 'Consultando…';
  async function load(kind) {
    try {
      const response = await fetch(`/api/${kind}`, { signal: AbortSignal.timeout(16000) });
      const data = await response.json();
      if (!response.ok || data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('source');
      return data;
    } catch { return { status: 'unavailable', items: [], fetchedAt: null }; }
  }
  await Promise.allSettled([
    load('news').then(data => { news = data; renderFeeds(); route(false); }),
    load('broadcasts').then(data => { broadcasts = data; renderFeeds(); renderMaps(); route(false); })
  ]);
  loading = false; $('#refresh').disabled = false; $('#refresh').textContent = '↻ Actualizar fuentes';
}
const today = new Date(); $('#today').textContent = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' }).format(today); $('#today').dateTime = today.toISOString();
$('#player-list').innerHTML = players.map(p => `<a class="player-card" href="#jugador/${p.id}"><span class="player-avatar">${p.initials}</span><div><strong>${p.name}</strong><p>${countryByCode(p.country).name} · Perfil FIDE</p></div><span aria-hidden="true">↗</span></a>`).join('');
$('#country-search').addEventListener('input', renderMaps); $('#map-filter').addEventListener('change', renderMaps);
$('#refresh').addEventListener('click', loadSources);
document.addEventListener('click', event => {
  if (event.target.closest('[data-show-broadcasts]')) { showAllBroadcasts = !showAllBroadcasts; renderFeeds(); }
  const retry = event.target.closest('[data-retry]'); if (retry) loadSources();
  const feedButton = event.target.closest('[data-feed]');
  if (feedButton) { activeFeed = feedButton.dataset.feed; document.querySelectorAll('[data-feed]').forEach(b => b.setAttribute('aria-pressed', String(b === feedButton))); renderFeeds(); }
  const indexButton = event.target.closest('[data-index]'); if (indexButton) location.hash = `indices/${indexButton.dataset.index}`;
});
window.addEventListener('hashchange', () => route());
renderMaps(); renderCountry(); renderMethodology('performance'); route(false); loadSources();
