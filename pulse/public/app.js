import {
  initFavorites,
  favoriteButton,
  refreshFavorites,
  readFavorites,
  followedBroadcasts,
} from './components/favorites.js';
import { currentRoute, navigate, installRouter } from './lib/routes.js';
import { countryActivity, orderBroadcasts, dailyOverview } from './lib/observatory.js';
import { requestJSON } from './lib/requests.js';
import { enhanceSelects, closeSelects } from './components/select.js';
import { initDirectory, renderDirectoryPlayer } from './components/directory.js';
import { initLanding } from './components/landing.js';
import { loadAnalytics, renderAnalytics } from './analytics-ui.js';
import { updateMap, resetMaps } from './maps.js';
import {
  countries,
  players,
  indices,
  countryByCode,
  matchesCountry,
  matchesPlayer,
} from './data.js';
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
  showAllBroadcasts = false,
  homeMapFilter = 'all',
  shownNews = 5,
  previousVisit = null;
const statusText = (item) =>
  item.status === 'live' ? 'EN DIRECTO' : item.status === 'finished' ? 'FINALIZADO' : 'PROGRAMADO';
const relatedCountries = (text) => countries.filter((country) => matchesCountry(text, country));
const relatedPlayers = (text) => players.filter((player) => matchesPlayer(text, player));

function renderMaps() {
  const term = $('#country-search').value.trim().toLocaleLowerCase('es');
  const filter = $('#map-filter').value;
  const activity = countryActivity(countries, broadcasts?.items || [], players, filter);
  const list = countries.filter(
    (country) =>
      country.name.toLocaleLowerCase('es').includes(term) &&
      (filter === 'all' ||
        (filter === 'players' && players.some((p) => p.country === country.code)) ||
        (['tournaments', 'live', 'upcoming'].includes(filter) &&
          activity.some((row) => row.country === country && row.count > 0))),
  );
  const common = {
    broadcasts: broadcasts?.items || [],
    players,
    onSelect: (code) => {
      navigate('/mundo/' + code);
    },
  };
  updateMap('home-map', { ...common, list: countries, filter: homeMapFilter });
  const homeActivity = countryActivity(countries, broadcasts?.items || [], players, homeMapFilter)
    .filter((row) => row.count && Number.isFinite(row.country.lng))
    .sort((a, b) => b.count - a.count || a.country.name.localeCompare(b.country.name, 'es'));
  $('#map-activity-list').innerHTML =
    homeActivity
      .slice(0, 6)
      .map(
        (row) =>
          `<a href="/mundo/${row.country.code}">${escape(row.country.name)} <b>${row.count}</b></a>`,
      )
      .join('') ||
    `<span class="fine">${broadcasts || homeMapFilter === 'players' ? 'Sin coincidencias geográficas en esta capa.' : 'Consultando ubicaciones…'}</span>`;
  document.querySelector('.map-legend').hidden = homeMapFilter === 'players';
  $('#home-map-summary').textContent =
    homeMapFilter !== 'players' && broadcasts?.status !== 'ok'
      ? 'Cobertura geográfica pendiente de la fuente'
      : `${homeActivity.length} países con datos en esta capa · Puntos agrupados por país`;
  $('#home-map-source').textContent =
    homeMapFilter === 'players'
      ? 'Selección FIDE · Federación registrada; no residencia. Sin punto cuando no hay correspondencia cartográfica.'
      : broadcasts?.status === 'ok'
        ? `Lichess · ${dateText(broadcasts.fetchedAt)} (Madrid) · ${broadcasts.items.filter((item) => !countries.some((c) => Number.isFinite(c.lng) && matchesCountry(item.location, c))).length} retransmisiones sin ubicación cartográfica identificada.`
        : broadcasts
          ? 'Lichess no disponible. No se muestran puntos de ejemplo.'
          : 'Consultando Lichess…';
  updateMap('world-map', { ...common, list, selected: currentRoute().value || null, filter });
  const signature = JSON.stringify([selectedCountry, list.map((c) => [c.code, c.name])]);
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
function renderDaily() {
  if (!news && !broadcasts) return;
  const data = dailyOverview(broadcasts?.items || [], news?.items || []);
  const followed = readFavorites();
  const related =
    broadcasts?.status === 'ok' ? followedBroadcasts(followed, broadcasts.items) : null;
  if (related) document.dispatchEvent(new CustomEvent('pulse:followed-live', { detail: related }));
  const tiles = [
    ['live', broadcasts?.status === 'ok' ? data.live.length : '—', 'Retransmisiones en directo'],
    [
      'today',
      broadcasts?.status === 'ok' ? data.today.length : '—',
      'Próximas rondas hoy · Madrid',
    ],
    ['news', news?.status === 'ok' ? data.recentNews.length : '—', 'Titulares en las últimas 24 h'],
  ];
  const newCount =
    previousVisit && news?.status === 'ok'
      ? news.items.filter(
          (item) =>
            Date.parse(item.publishedAt) > previousVisit &&
            Date.parse(item.publishedAt) <= Date.now(),
        ).length
      : null;
  $('#daily-brief').innerHTML =
    `<div class="daily-edition"><strong>Tu edición de hoy</strong><button class="text-link" type="button" data-directory-scroll>Buscar un jugador ↓</button><span>${newCount !== null ? `${newCount} titulares recibidos desde tu visita del ${dateText(previousVisit)}.` : 'Directos, agenda y noticias de las fuentes conectadas.'}${news?.partial ? ' Algunas fuentes no están disponibles.' : ''}</span>${followed.length && related ? `<span>Tus favoritos: ${related.length} retransmisiones con coincidencias en la selección.</span>` : ''}</div><div class="daily-tiles">${tiles.map(([filter, count, label]) => `<button type="button" data-feed="${filter}" data-scroll-feed><strong>${count}</strong><span>${label} ↗</span></button>`).join('')}</div><p class="fine">Actualización automática cada 5 minutos mientras consultas el panel. Cobertura según las fuentes; no es un censo mundial.</p>`;
}
function renderFeeds() {
  renderDaily();
  const term = ($('#feed-query').value || '').trim().toLocaleLowerCase('es');
  const language = $('#news-language').value,
    publisher = $('#news-publisher').value;
  const contains = (text) => !term || text.toLocaleLowerCase('es').includes(term);
  if (news) {
    const items = news.items.filter(
      (item) =>
        (!language || item.language === language) &&
        (!publisher || item.source === publisher) &&
        contains(item.title),
    );
    $('#news-count').textContent = news.status === 'ok' ? news.items.length : '—';
    $('#news-list').innerHTML =
      news.status !== 'ok'
        ? errorMarkup('Las fuentes de noticias no están disponibles temporalmente.')
        : items
            .slice(0, shownNews)
            .map((item, n) => {
              const links = [
                ...relatedPlayers(item.title).map(
                  (p) => `<a href="/jugador/${p.id}">${escape(p.name)} ↗</a>`,
                ),
                ...relatedCountries(item.title).map(
                  (c) => `<a href="/mundo/${c.code}">${escape(c.name)} ↗</a>`,
                ),
              ];
              const fresh =
                previousVisit &&
                Date.parse(item.publishedAt) > previousVisit &&
                Date.parse(item.publishedAt) <= Date.now();
              return `<article class="news-item${fresh ? ' is-new' : ''}"><span class="news-order">${String(n + 1).padStart(2, '0')}</span><div><h4><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.title)}</a></h4><div class="item-meta"><span>${escape(item.source)}</span><span>· ${item.language === 'es' ? 'Español' : 'Inglés'}</span>${fresh ? '<b>Nuevo</b>' : ''}<time datetime="${escape(item.publishedAt)}">${dateText(item.publishedAt)}</time></div>${links.length ? `<div class="related-links">${links.join(' · ')}</div>` : ''}</div><a class="arrow" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Leer en ${escape(item.source)}: ${escape(item.title)}">↗</a></article>`;
            })
            .join('') ||
          '<div class="empty">No hay titulares recibidos con estos filtros. Prueba otro idioma, fuente o búsqueda.</div>';
    const more = $('[data-more-news]');
    more.hidden = news.status !== 'ok' || items.length <= shownNews;
    more.textContent = `Ver más titulares · ${Math.min(shownNews, items.length)} de ${items.length} ↓`;
    $('#news-source').textContent =
      news.status === 'ok'
        ? `Consultado ${dateText(news.fetchedAt)} (Madrid). ${news.sources?.map((source) => `${source.source}: ${source.status === 'ok' ? source.count + ' titulares' : 'no disponible'}`).join(' · ') || news.source}. Titulares en el idioma original; artículos completos en la fuente.`
        : 'Consulta fallida. No se sustituyen las noticias por ejemplos.';
  }
  if (broadcasts) {
    $('#events-count').textContent = broadcasts.status === 'ok' ? broadcasts.items.length : '—';
    $('#live-count').textContent =
      broadcasts.status === 'ok'
        ? broadcasts.items.filter((item) => item.status === 'live').length
        : '—';
    const today = new Set(dailyOverview(broadcasts.items, []).today.map((item) => item.id));
    const items = orderBroadcasts(broadcasts.items).filter(
      (item) =>
        contains(`${item.name} ${item.location} ${item.players}`) &&
        (!['live', 'upcoming', 'finished', 'today'].includes(activeFeed) ||
          (activeFeed === 'today' ? today.has(item.id) : item.status === activeFeed)),
    );
    $('#broadcast-heading').textContent =
      {
        live: 'En directo ahora',
        upcoming: 'Próximas rondas',
        finished: 'Rondas finalizadas · Partidas y resultados',
        today: 'Próximas rondas de hoy · Madrid',
      }[activeFeed] || 'Retransmisiones, partidas y resultados';
    $('#broadcast-list').innerHTML =
      broadcasts.status !== 'ok'
        ? errorMarkup('Lichess no está disponible temporalmente.')
        : items.length
          ? items
              .slice(0, showAllBroadcasts ? items.length : 6)
              .map((item) => broadcastCard(item))
              .join('') +
            (items.length > 6
              ? `<button class="refresh-button" type="button" data-show-broadcasts>${showAllBroadcasts ? 'Mostrar menos ↑' : `Ver las ${items.length} retransmisiones del filtro ↓`}</button>`
              : '')
          : '<div class="empty">No hay retransmisiones recibidas con estos filtros. Consulta el directorio de Lichess para ampliar la búsqueda.</div>';
    $('#broadcast-source').textContent =
      broadcasts.status === 'ok'
        ? `Lichess · Consultado ${dateText(broadcasts.fetchedAt)} (Madrid). Activos y primera página de recientes. ${broadcasts.hasMorePast ? 'Hay más torneos pasados en Lichess. ' : ''}Caché de 5 minutos; no es un censo mundial.`
        : 'Fuente: Lichess · Consulta fallida.';
  }
  $('#news-column').hidden = ['live', 'upcoming', 'finished', 'today'].includes(activeFeed);
  $('#broadcast-column').hidden = activeFeed === 'news';
  $('.feed-grid').classList.toggle('single-column', activeFeed !== 'all');
  if (news && broadcasts)
    $('#radar-status').textContent =
      news.status === 'ok' && broadcasts.status === 'ok' && !news.partial
        ? 'Fuentes consultadas · Cobertura parcial. Horas de Madrid.'
        : 'Algunas fuentes no están disponibles. Los guiones indican ausencia de datos.';
}
function renderCountry() {
  const country = countryByCode(selectedCountry) || countries[0];
  const foundPlayers = players.filter((p) => p.country === country.code);
  const tournaments = orderBroadcasts(
    broadcasts?.items.filter((t) => matchesCountry(t.location, country)) || [],
  );
  const foundNews = news?.items.filter((n) => matchesCountry(n.title, country)) || [];
  $('#country-profile').innerHTML =
    `<p class="eyebrow">PAÍS / FEDERACIÓN</p><span class="country-code">${country.code}</span><h2>${escape(country.name)}</h2>${favoriteButton('country', country.code, country.name)}<p>Un punto de partida para explorar su ajedrez. La cobertura competitiva depende de las fuentes conectadas.</p><h3>Jugadores en seguimiento Chedex</h3><div class="profile-links">${foundPlayers.length ? foundPlayers.map((p) => `<a href="/jugador/${p.id}">${escape(p.name)}<span>Ver ficha ↗</span></a>`).join('') : '<p>No hay jugadores de esta federación en la selección de fichas con histórico propio. Puedes buscar otras fichas en el panel.</p>'}<a href="https://ratings.fide.com/" target="_blank" rel="noopener noreferrer">Directorio oficial FIDE <span>↗</span></a></div><h3>Competiciones en la selección</h3>${
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
  if (!player && !analyticsReady) {
    $('#player-profile').innerHTML =
      '<div class="empty">Consultando la selección y el directorio…</div>';
    return;
  }
  if (!player) {
    $('#player-profile').innerHTML = '';
    renderDirectoryPlayer(id, $('#player-profile'));
    return;
  }
  const country = countryByCode(player.country);
  const stories = news?.items.filter((n) => relatedPlayers(n.title).includes(player)) || [];
  const tournaments =
    broadcasts?.items.filter((t) => relatedPlayers(t.players).includes(player)) || [];
  $('#player-profile').innerHTML =
    `<a class="back-link" href="/tendencias">← Explorar jugadores</a><article class="panel player-profile-card"><p class="eyebrow">FICHA CONECTADA · DIRECTORIO EDITORIAL</p><div class="player-avatar">${escape(player.initials)}</div><h1>${escape(player.name)}</h1>${favoriteButton('player', player.id, player.name)}<a class="text-link" href="/mundo/${country.code}">${escape(country.name)} · Explorar país ↗</a><div class="profile-summary"><div><span>Identificador FIDE</span><strong>${player.id}</strong></div><div><span>Elo actual</span><strong>Consultando…</strong></div><div><span>Evolución</span><strong>Consultando…</strong></div></div><p class="fine">La federación del directorio se debe contrastar con la ficha oficial. No se muestran puntuaciones ni títulos sin una lista FIDE fechada.</p><div class="profile-links"><a href="https://ratings.fide.com/profile/${player.id}" target="_blank" rel="noopener noreferrer">Perfil, Elo e histórico oficiales en FIDE <span>↗</span></a><a href="/indices/performance">Cómo se calcula la progresión <span>↗</span></a><a href="/indices/trending">Cómo se calcula el interés en Wikipedia <span>↗</span></a></div><h2 class="profile-section-title">Actualidad relacionada</h2>${stories.length ? stories.map((n) => `<p><a href="${escape(n.url)}" target="_blank" rel="noopener noreferrer">${escape(n.title)} ↗</a></p>`).join('') : '<p class="fine">Sin menciones explícitas en los titulares recibidos.</p>'}<h2 class="profile-section-title">Competiciones relacionadas</h2>${tournaments.length ? tournaments.map((t) => broadcastCard(t)).join('') : '<p class="fine">Sin coincidencias explícitas en los participantes indicados por Lichess. La selección no es exhaustiva.</p>'}</article>`;
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
    `<a class="back-link" href="/panel">← Volver a Hoy</a><article class="panel player-profile-card"><p class="eyebrow">COMPETICIÓN · LICHESS BROADCAST</p><span class="live-badge">${statusText(item)}</span><h1>${escape(item.name)}</h1><p class="subtitle">${escape(item.location || 'Ubicación sin indicar')} · ${escape(item.round)}</p><div class="profile-summary"><div><span>Fecha de ronda</span><strong>${dateText(item.startsAt)}</strong></div><div><span>Formato</span><strong>${escape(item.format || 'No indicado')}</strong></div><div><span>Ritmo</span><strong>${escape(item.timeControl || 'No indicado')}</strong></div></div><div class="profile-links"><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">Ver partidas y resultados en Lichess <span>↗</span></a>${item.standingsUrl ? `<a href="${escape(item.standingsUrl)}" target="_blank" rel="noopener noreferrer">Clasificación en la fuente del torneo ↗</a>` : ''}${countryLinks.map((c) => `<a href="/mundo/${c.code}">Explorar ${c.name} <span>↗</span></a>`).join('')}${playerLinks.map((p) => `<a href="/jugador/${p.id}">${p.name} <span>Ver ficha ↗</span></a>`).join('')}</div><p class="fine">Fuente: Lichess · Consultada ${dateText(broadcasts.fetchedAt)} (Madrid). Los países se enlazan por la ubicación comunicada. Los jugadores se enlazan cuando aparecen expresamente en los datos de participantes.</p></article>`;
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
  refreshFavorites();
  document.title = `Chedex Pulse · ${{ inicio: 'Inicio', hoy: 'El pulso del ajedrez', mundo: 'Mundo', tendencias: 'Tendencias', indices: 'Índices', fuentes: 'Fuentes y metodología', jugador: 'Jugador', torneo: 'Competición' }[name]}`;
  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#main').focus({ preventScroll: true });
  }
}
let analyticsStarted = false,
  analyticsReady = false,
  feedsStarted = false;
function ensureData(name) {
  if (name === 'inicio' || name === 'fuentes') return;
  if (!analyticsStarted) {
    analyticsStarted = true;
    loadAnalytics(() => {
      analyticsReady = true;
      route(false);
    });
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
  const methodLink = event.target.closest('[data-method-link]');
  if (methodLink) {
    event.preventDefault();
    $('#index-method').open = true;
    $('#index-method').scrollIntoView({
      block: 'start',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
  const layer = event.target.closest('[data-map-layer]');
  if (layer) {
    homeMapFilter = layer.dataset.mapLayer;
    document
      .querySelectorAll('[data-map-layer]')
      .forEach((button) => button.setAttribute('aria-pressed', String(button === layer)));
    renderMaps();
  }
  if (event.target.closest('[data-more-news]')) {
    shownNews += 10;
    renderFeeds();
  }
  const retry = event.target.closest('[data-retry]');
  if (retry) loadSources();
  const feedButton = event.target.closest('[data-feed]');
  if (feedButton) {
    activeFeed = feedButton.dataset.feed;
    showAllBroadcasts = false;
    shownNews = activeFeed === 'news' ? 10 : 5;
    document
      .querySelectorAll('[data-feed]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.feed === activeFeed)));
    renderFeeds();
    if (feedButton.hasAttribute('data-scroll-feed'))
      $('#daily-content').scrollIntoView({
        block: 'start',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
  }
  const indexButton = event.target.closest('[data-index]');
  if (indexButton) navigate(`/indices/${indexButton.dataset.index}`);
});
installRouter(() => route());
enhanceSelects();
initLanding();
initDirectory();
initFavorites();
document.addEventListener('pulse:favorites', () => {
  if (currentRoute().section === 'hoy') renderDaily();
});
route(false);
document
  .querySelectorAll('[data-reset-map]')
  .forEach((button) => button.addEventListener('click', resetMaps));

let feedSearchTimer;
$('#feed-query').addEventListener('input', () => {
  clearTimeout(feedSearchTimer);
  feedSearchTimer = setTimeout(() => {
    shownNews = 10;
    renderFeeds();
  }, 150);
});
for (const id of ['news-language', 'news-publisher'])
  document.getElementById(id).addEventListener('change', () => {
    shownNews = 10;
    renderFeeds();
  });
// Solo se consulta con el panel visible; las pestañas inactivas no generan tráfico.
let lastRefresh = Date.now();
const refreshVisible = () => {
  if (
    !document.hidden &&
    ['hoy', 'mundo', 'torneo'].includes(currentRoute().section) &&
    Date.now() - lastRefresh >= 300000
  ) {
    lastRefresh = Date.now();
    loadSources();
  }
};
setInterval(refreshVisible, 60000);
document.addEventListener('visibilitychange', refreshVisible);
