import { currentRoute, navigate, installRouter } from './lib/routes.js';
import { requestJSON } from './lib/requests.js';
import { enhanceSelects, closeSelects } from './components/select.js';
import { initLanding } from './components/landing.js';
import { loadAnalytics, renderAnalytics } from './analytics-ui.js';
import { updateMap, resetMaps } from './maps.js';
import { countries, players, indices, countryByCode, matchesCountry } from './data.js';
const $ = (selector) => document.querySelector(selector);
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );
const dateText = (value) => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Madrid',
      }).format(date)
    : 'Fecha no disponible';
};
let news = null,
  broadcasts = null,
  selectedCountry = 'ESP',
  activeFeed = 'all',
  loading = false,
  showAllBroadcasts = false;
const statusText = (item) =>
  item.status === 'live' ? 'EN DIRECTO' : item.status === 'finished' ? 'FINALIZADO' : 'PROGRAMADO';
const relatedCountries = (text) => countries.filter((country) => matchesCountry(text, country));
const relatedPlayers = (text) =>
  players.filter((player) =>
    player.aliases.some((alias) => text.toLowerCase().includes(alias.toLowerCase())),
  );

function renderMaps() {
  const term = $('#country-search').value.trim().toLocaleLowerCase('es');
  const filter = $('#map-filter').value;
  const list = countries.filter(
    (country) =>
      country.name.toLocaleLowerCase('es').includes(term) &&
      (filter === 'all' ||
        (filter === 'players' && players.some((p) => p.country === country.code)) ||
        (filter === 'tournaments' &&
          broadcasts?.items.some((t) => matchesCountry(t.location, country)))),
  );
  const common = {
    broadcasts: broadcasts?.items || [],
    onSelect: (code) => {
      navigate('/mundo/' + code);
    },
  };
  updateMap('home-map', { ...common, list: countries });
  updateMap('world-map', { ...common, list, selected: currentRoute().value || null, filter });
  const signature = JSON.stringify([selectedCountry, list.map((c) => c.code)]);
  if ($('#country-list').dataset.signature === signature) return;
  $('#country-list').dataset.signature = signature;
  $('#country-list').innerHTML = list.length
    ? list
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))
        .map(
          (c) =>
            '<a class="country-button" href="/mundo/' +
            c.code +
            '" ' +
            (c.code === selectedCountry ? 'aria-current="true"' : '') +
            '>' +
            escape(c.name) +
            '</a>',
        )
        .join('')
    : '<p class="fine">No hay países que coincidan con este filtro en los datos disponibles.</p>';
}
function broadcastCard(item, compact = false) {
  return `<a class="broadcast-card" href="/torneo/${escape(item.id)}"><div class="broadcast-meta"><span class="${item.status === 'live' ? 'live-badge' : ''}">${item.status === 'live' ? '<i class="live-dot"></i>' : ''}${statusText(item)}</span><span>${escape(item.location || 'Ubicación sin indicar')}</span></div><h4>${escape(item.name)}</h4>${compact ? '' : `<p>${escape(item.round || item.format || 'Retransmisión de ajedrez')}</p><div class="card-bottom"><span>${dateText(item.startsAt)}</span><b>Explorar torneo ↗</b></div>`}</a>`;
}
function errorMarkup(message) {
  return `<div class="empty">${escape(message)}<button type="button" data-retry>Volver a consultar ↻</button></div>`;
}
function renderFeeds() {
  if (news) {
    $('#news-count').textContent = news.status === 'ok' ? news.items.length : '—';
    $('#news-list').innerHTML =
      news.status !== 'ok'
        ? errorMarkup('FIDE no está disponible temporalmente. No se muestran titulares de ejemplo.')
        : news.items.length
          ? news.items
              .slice(0, activeFeed === 'news' ? 10 : 5)
              .map((item, n) => {
                const links = [
                  ...relatedPlayers(item.title).map(
                    (p) => `<a href="/jugador/${p.id}">${escape(p.name)} ↗</a>`,
                  ),
                  ...relatedCountries(item.title).map(
                    (c) => `<a href="/mundo/${c.code}">${escape(c.name)} ↗</a>`,
                  ),
                ];
                return `<article class="news-item"><span class="news-order">${String(n + 1).padStart(2, '0')}</span><div><h4><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.title)}</a></h4><div class="item-meta"><span>FIDE</span><span>·</span><time datetime="${escape(item.publishedAt)}">${dateText(item.publishedAt)}</time></div>${links.length ? `<div class="related-links">${links.join(' · ')}</div>` : ''}</div><a class="arrow" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Leer en FIDE: ${escape(item.title)}">↗</a></article>`;
              })
              .join('')
          : '<div class="empty">La fuente no ha devuelto titulares.</div>';
    $('#news-source').textContent =
      news.status === 'ok'
        ? `RSS oficial FIDE · Consultado ${dateText(news.fetchedAt)} (Madrid). Titulares en el idioma original. ${activeFeed === 'news' ? 'Todos los titulares recibidos.' : 'Selecciona Actualidad para ver todos los titulares recibidos.'}`
        : 'Fuente: RSS FIDE · Consulta fallida.';
  }
  if (broadcasts) {
    $('#events-count').textContent = broadcasts.status === 'ok' ? broadcasts.items.length : '—';
    $('#live-count').textContent =
      broadcasts.status === 'ok' ? broadcasts.items.filter((t) => t.status === 'live').length : '—';
    const items = broadcasts.items.filter((t) => activeFeed !== 'live' || t.status === 'live');
    $('#broadcast-list').innerHTML =
      broadcasts.status !== 'ok'
        ? errorMarkup(
            'Lichess no está disponible temporalmente. No se muestran torneos de ejemplo.',
          )
        : items.length
          ? items
              .slice(0, showAllBroadcasts || activeFeed === 'live' ? 24 : 3)
              .map((t) => broadcastCard(t))
              .join('') +
            (activeFeed === 'all' && items.length > 3
              ? `<button class="refresh-button" type="button" data-show-broadcasts>${showAllBroadcasts ? 'Mostrar menos ↑' : `Ver las ${items.length} retransmisiones ↓`}</button>`
              : '')
          : '<div class="empty">No hay retransmisiones en esta selección. Puedes consultar el directorio completo en Lichess.</div>';
    $('#broadcast-source').textContent =
      broadcasts.status === 'ok'
        ? `Lichess Broadcast · Consultado ${dateText(broadcasts.fetchedAt)} (Madrid). Selección destacada, no censo mundial. Caché: 5 minutos.`
        : 'Fuente: Lichess Broadcast · Consulta fallida.';
  }
  $('#news-column').hidden = activeFeed === 'live';
  $('#broadcast-column').hidden = activeFeed === 'news';
  $('.feed-grid').classList.toggle('single-column', activeFeed !== 'all');
  if (news && broadcasts)
    $('#radar-status').textContent =
      news.status === 'ok' && broadcasts.status === 'ok'
        ? 'Fuentes consultadas · Cobertura parcial. Horas de Madrid.'
        : 'Hay fuentes no disponibles. Los guiones indican ausencia de datos.';
}
function renderCountry() {
  const country = countryByCode(selectedCountry) || countries[0];
  const foundPlayers = players.filter((p) => p.country === country.code);
  const tournaments = broadcasts?.items.filter((t) => matchesCountry(t.location, country)) || [];
  const foundNews = news?.items.filter((n) => matchesCountry(n.title, country)) || [];
  $('#country-profile').innerHTML =
    `<p class="eyebrow">FICHA DE PAÍS</p><span class="country-code">${country.code}</span><h2>${escape(country.name)}</h2><p>Un punto de partida para explorar su ajedrez. La cobertura competitiva depende de las fuentes conectadas.</p><h3>Jugadores del directorio</h3><div class="profile-links">${foundPlayers.length ? foundPlayers.map((p) => `<a href="/jugador/${p.id}">${escape(p.name)}<span>Ver ficha ↗</span></a>`).join('') : '<p>Aún no hay fichas locales para este país.</p>'}<a href="https://ratings.fide.com/" target="_blank" rel="noopener noreferrer">Directorio oficial FIDE <span>↗</span></a></div><h3>Competiciones en la selección</h3>${
      tournaments.length
        ? tournaments
            .slice(0, 4)
            .map((t) => broadcastCard(t, true))
            .join('')
        : `<p>${broadcasts?.status === 'ok' ? 'Sin coincidencias de ubicación en la selección actual. Esto no implica ausencia de torneos en el país.' : 'Consulta de retransmisiones no disponible todavía.'}</p>`
    }<h3>Actualidad relacionada</h3><div class="profile-links">${foundNews.length ? foundNews.map((n) => `<a href="${escape(n.url)}" target="_blank" rel="noopener noreferrer">${escape(n.title)} <span>↗</span></a>`).join('') : '<p>Sin coincidencias explícitas en los titulares recibidos. La cobertura no es exhaustiva.</p>'}</div><h3>Tendencia nacional</h3><p>Consulta Global para ver las federaciones con datos comparables. Las retransmisiones no representan un censo nacional.</p><a class="text-link" href="/indices/global">Conocer el índice Global ↗</a>`;
}
function renderMethodology(key) {
  const index = indices[key] || indices.performance;
  document
    .querySelectorAll('[data-index]')
    .forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.index === key)));
  $('#methodology').innerHTML =
    `<p class="eyebrow">CHEDEX ${index.name.toUpperCase()}</p><h2>${index.title}</h2><p class="lead">${index.description}</p><span class="status-label">${index.state}</span><div class="method-grid"><div><h3>Qué medimos</h3><p>${index.calculation}</p></div><div><h3>Periodo y actualización</h3><p>${index.period}</p></div><div><h3>Fuente principal</h3><p>${index.source}</p><a class="text-link" href="${index.url}" target="_blank" rel="noopener noreferrer">Consultar fuente ↗</a></div></div><p class="formula">${index.formula}</p><p><strong>Alcance y límites:</strong> ${index.limitation}</p><p class="fine">Metodología publicada: v1.0 · Los periodos, las fechas de recopilación y la cobertura aparecen junto al ranking.</p>`;
}
function renderPlayer(id) {
  const player = players.find((p) => p.id === id);
  if (!player) {
    $('#player-profile').innerHTML =
      '<div class="empty">Esta ficha no está en el directorio. <a href="/tendencias">Volver a jugadores ↗</a></div>';
    return;
  }
  const country = countryByCode(player.country);
  const stories = news?.items.filter((n) => relatedPlayers(n.title).includes(player)) || [];
  const tournaments =
    broadcasts?.items.filter((t) => relatedPlayers(t.players).includes(player)) || [];
  $('#player-profile').innerHTML =
    `<a class="back-link" href="/tendencias">← Explorar jugadores</a><article class="panel player-profile-card"><p class="eyebrow">FICHA CONECTADA · DIRECTORIO EDITORIAL</p><div class="player-avatar">${escape(player.initials)}</div><h1>${escape(player.name)}</h1><a class="text-link" href="/mundo/${country.code}">${escape(country.name)} · Explorar país ↗</a><div class="profile-summary"><div><span>Identificador FIDE</span><strong>${player.id}</strong></div><div><span>Elo actual</span><strong>Consultando…</strong></div><div><span>Evolución</span><strong>Consultando…</strong></div></div><p class="fine">La federación del directorio se debe contrastar con la ficha oficial. No se muestran puntuaciones ni títulos sin una lista FIDE fechada.</p><div class="profile-links"><a href="https://ratings.fide.com/profile/${player.id}" target="_blank" rel="noopener noreferrer">Perfil, Elo e histórico oficiales en FIDE <span>↗</span></a><a href="/indices/performance">Cómo se medirá la progresión <span>↗</span></a><a href="/indices/trending">Cómo se medirá el interés público <span>↗</span></a></div><h2 class="profile-section-title">Actualidad relacionada</h2>${stories.length ? stories.map((n) => `<p><a href="${escape(n.url)}" target="_blank" rel="noopener noreferrer">${escape(n.title)} ↗</a></p>`).join('') : '<p class="fine">Sin menciones explícitas en los titulares recibidos.</p>'}<h2 class="profile-section-title">Competiciones relacionadas</h2>${tournaments.length ? tournaments.map((t) => broadcastCard(t)).join('') : '<p class="fine">Sin coincidencias explícitas en los participantes indicados por Lichess. La selección no es exhaustiva.</p>'}</article>`;
}
function renderTournament(id) {
  const item = broadcasts?.items.find((t) => t.id === id);
  if (!item) {
    $('#player-profile').innerHTML =
      '<a class="back-link" href="/panel">← Volver a Hoy</a><div class="empty">Este torneo no está en la selección actual o la fuente aún está cargando. <a href="https://lichess.org/broadcast" target="_blank" rel="noopener noreferrer">Consultar Lichess ↗</a></div>';
    return;
  }
  const countryLinks = relatedCountries(item.location);
  const playerLinks = relatedPlayers(item.players);
  $('#player-profile').innerHTML =
    `<a class="back-link" href="/panel">← Volver a Hoy</a><article class="panel player-profile-card"><p class="eyebrow">COMPETICIÓN · LICHESS BROADCAST</p><span class="live-badge">${statusText(item)}</span><h1>${escape(item.name)}</h1><p class="subtitle">${escape(item.location || 'Ubicación sin indicar')} · ${escape(item.round)}</p><div class="profile-summary"><div><span>Fecha de ronda</span><strong>${dateText(item.startsAt)}</strong></div><div><span>Formato</span><strong>${escape(item.format || 'No indicado')}</strong></div><div><span>Ritmo</span><strong>${escape(item.timeControl || 'No indicado')}</strong></div></div><div class="profile-links"><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">Ver partidas y resultados en Lichess <span>↗</span></a>${countryLinks.map((c) => `<a href="/mundo/${c.code}">Explorar ${c.name} <span>↗</span></a>`).join('')}${playerLinks.map((p) => `<a href="/jugador/${p.id}">${p.name} <span>Ver ficha ↗</span></a>`).join('')}</div><p class="fine">Fuente: Lichess · Consultada ${dateText(broadcasts.fetchedAt)} (Madrid). Los países se enlazan por la ubicación comunicada. Los jugadores se enlazan cuando aparecen expresamente en los datos de participantes.</p></article>`;
}
function route(scroll = true) {
  closeSelects();
  const { section, value } = currentRoute();
  const name = [
    'inicio',
    'mundo',
    'tendencias',
    'indices',
    'fuentes',
    'jugador',
    'torneo',
  ].includes(section)
    ? section
    : 'hoy';
  document.body.classList.toggle('landing-mode', name === 'inicio');
  ensureData(name);
  const view = name === 'jugador' || name === 'torneo' ? 'ficha' : name;
  document.querySelectorAll('.view').forEach((el) => {
    el.hidden = el.id !== view;
  });
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (
      link.dataset.nav === name ||
      (name === 'jugador' && link.dataset.nav === 'tendencias') ||
      (name === 'torneo' && link.dataset.nav === 'hoy')
    )
      link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('#workspace-title').textContent = {
    inicio: 'Inicio',
    hoy: 'Vista general',
    mundo: 'Observatorio mundial',
    tendencias: 'Tendencias',
    indices: 'Índices Chedex',
    fuentes: 'Fuentes y metodología',
    jugador: 'Ficha de jugador',
    torneo: 'Competición',
  }[name];
  if (name === 'hoy') {
    renderFeeds();
    renderMaps();
  }
  if (name === 'mundo') {
    if (countryByCode(value)) selectedCountry = value;
    renderMaps();
    renderCountry();
  }
  if (name === 'indices') renderMethodology(indices[value] ? value : 'performance');
  if (name === 'jugador') renderPlayer(value);
  if (name === 'torneo') renderTournament(value);
  renderAnalytics(name, value);
  document.title = `Chedex Pulse · ${{ inicio: 'Inicio', hoy: 'El pulso del ajedrez', mundo: 'Mundo', tendencias: 'Tendencias', indices: 'Índices', fuentes: 'Fuentes y metodología', jugador: 'Jugador', torneo: 'Competición' }[name]}`;
  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#main').focus({ preventScroll: true });
  }
}
let analyticsStarted = false,
  feedsStarted = false;
function ensureData(name) {
  if (name === 'inicio' || name === 'fuentes') return;
  if (!analyticsStarted) {
    analyticsStarted = true;
    loadAnalytics(() => route(false));
  }
  if (['hoy', 'mundo', 'jugador', 'torneo'].includes(name) && !feedsStarted) {
    feedsStarted = true;
    loadSources();
  }
}
async function loadSources() {
  if (loading) return;
  loading = true;
  $('#refresh').disabled = true;
  $('#refresh').textContent = 'Consultando…';
  async function load(kind, ttl) {
    try {
      const data = await requestJSON('/api/' + kind, { ttl });
      if (data.status !== 'ok' || !Array.isArray(data.items)) throw Error('source');
      return data;
    } catch {
      return { status: 'unavailable', items: [], fetchedAt: null };
    }
  }
  [news, broadcasts] = await Promise.all([load('news', 900000), load('broadcasts', 300000)]);
  loading = false;
  $('#refresh').disabled = false;
  $('#refresh').textContent = '↻ Actualizar fuentes';
  route(false);
}
const today = new Date();
$('#today').textContent = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Madrid',
}).format(today);
$('#today').dateTime = today.toISOString();
$('#player-list').innerHTML = players
  .map(
    (p) =>
      `<a class="player-card" href="/jugador/${p.id}"><span class="player-avatar">${p.initials}</span><div><strong>${p.name}</strong><p>${countryByCode(p.country).name} · Perfil FIDE</p></div><span aria-hidden="true">↗</span></a>`,
  )
  .join('');
let countrySearchTimer;
$('#country-search').addEventListener('input', () => {
  clearTimeout(countrySearchTimer);
  countrySearchTimer = setTimeout(renderMaps, 120);
});
$('#map-filter').addEventListener('change', renderMaps);
$('#refresh').addEventListener('click', loadSources);
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-show-broadcasts]')) {
    showAllBroadcasts = !showAllBroadcasts;
    renderFeeds();
  }
  const retry = event.target.closest('[data-retry]');
  if (retry) loadSources();
  const feedButton = event.target.closest('[data-feed]');
  if (feedButton) {
    activeFeed = feedButton.dataset.feed;
    document
      .querySelectorAll('[data-feed]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b === feedButton)));
    renderFeeds();
  }
  const indexButton = event.target.closest('[data-index]');
  if (indexButton) navigate(`/indices/${indexButton.dataset.index}`);
});
installRouter(() => route());
enhanceSelects();
initLanding();
route(false);
document
  .querySelectorAll('[data-reset-map]')
  .forEach((button) => button.addEventListener('click', resetMaps));
