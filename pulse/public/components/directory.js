import { requestJSON } from '../lib/requests.js';
import { chart, federationName, geoCode } from '../analytics-ui.js';
import { countryByCode } from '../data.js';
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const number = (value) =>
  Number.isFinite(value) ? new Intl.NumberFormat('es-ES').format(value) : '—';
const date = (value) =>
  new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(value));
export function initDirectory() {
  const form = document.getElementById('directory-search'),
    input = document.getElementById('directory-query'),
    results = document.getElementById('directory-results');
  let timer,
    version = 0;
  async function search() {
    const query = input.value.trim(),
      own = ++version;
    if (query.length < 3) {
      results.innerHTML =
        '<p class="fine">Escribe al menos tres caracteres o un identificador FIDE.</p>';
      return;
    }
    results.innerHTML = '<p class="fine">Consultando el directorio FIDE de Lichess…</p>';
    try {
      const data = await requestJSON('/api/directory/players?q=' + encodeURIComponent(query), {
        ttl: 300000,
      });
      if (own !== version) return;
      results.innerHTML = `<p class="source-note">${data.items.length} ${data.items.length === 1 ? 'resultado recibido' : 'resultados recibidos'} · ${escape(data.scope)} Consulta: ${date(data.fetchedAt)} (Madrid).</p><div class="directory-grid">${data.items.map((p) => `<a href="/jugador/${p.id}"><strong>${escape(p.name)} ↗</strong><span>${escape(p.title || '')} · ${escape(federationName(p.federation))} · FIDE ${p.id}</span><span>Estándar ${number(p.standard)} · Rápidas ${number(p.rapid)} · Blitz ${number(p.blitz)}</span></a>`).join('') || '<p class="fine">La fuente no devuelve coincidencias. Prueba el nombre completo o el identificador FIDE; esto no confirma que el jugador no exista.</p>'}</div>`;
    } catch {
      if (own === version)
        results.innerHTML =
          '<p class="fine">El directorio no responde temporalmente. Vuelve a pulsar Buscar para reintentarlo.</p>';
    }
  }
  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-directory-scroll]')) return;
    input.focus({ preventScroll: true });
    form.scrollIntoView({
      block: 'center',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(timer);
    search();
  });
  input.addEventListener('input', () => {
    ++version;
    clearTimeout(timer);
    timer = setTimeout(search, 400);
  });
}
export async function renderDirectoryPlayer(id, container) {
  container.innerHTML = `<a class="back-link" href="/panel">← Volver al panel y buscar jugadores</a><article class="panel player-profile-card" data-directory-id="${id}"><p class="fine">Consultando la ficha FIDE a través de Lichess…</p></article>`;
  const target = container.querySelector('[data-directory-id]');
  try {
    const data = await requestJSON('/api/directory/players/' + id, { ttl: 3600000 });
    if (!target.isConnected) return;
    const p = data.player,
      code = geoCode(p.federation);
    target.innerHTML = `<p class="eyebrow">DIRECTORIO PÚBLICO FIDE · VÍA LICHESS</p><h1>${escape(p.name)}</h1><p>${escape(p.title || 'Sin título indicado')} · Federación ${escape(federationName(p.federation))} · FIDE ${p.id}</p><div class="profile-summary">${[
      ['Estándar', p.standard],
      ['Rápidas', p.rapid],
      ['Blitz', p.blitz],
    ]
      .map(([label, value]) => `<div><span>${label}</span><strong>${number(value)}</strong></div>`)
      .join(
        '',
      )}</div><p class="fine">${p.active ? 'Activo según la fuente' : 'Inactivo según la fuente'}${p.birthYear ? ' · Año de nacimiento: ' + p.birthYear : ''}. Consulta: ${date(data.fetchedAt)} (Madrid). ${escape(data.period)}</p><div class="profile-links"><a href="https://ratings.fide.com/profile/${p.id}" target="_blank" rel="noopener noreferrer">Verificar ficha oficial FIDE ↗</a>${countryByCode(code) ? `<a href="/mundo/${code}">Explorar federación ↗</a>` : ''}</div><p class="source-note">Esta ficha amplía el directorio de consulta. No incorpora al jugador a los rankings Chedex, que mantienen su selección y requisitos publicados.</p>${
      data.history
        ? `<h2>Histórico de Elo disponible</h2><p class="fine">${escape(data.historyNote)}</p>${[
            ['standard', 'Elo estándar'],
            ['rapid', 'Elo rápido'],
            ['blitz', 'Elo blitz'],
          ]
            .map(
              ([key, label]) =>
                `<details class="history-details"><summary>${label} · ${data.history[key].length} observaciones</summary>${chart(data.history[key], 'rating', label)}<div class="daily-values">${data.history[key].map((row) => `<span>${row.month}: <strong>${row.rating}</strong></span>`).join('')}</div></details>`,
            )
            .join('')}`
        : '<p class="fine">La serie histórica no está disponible temporalmente; la ficha permanece consultable.</p>'
    }`;
  } catch {
    if (target.isConnected)
      target.innerHTML = `<h1>Ficha no disponible</h1><p>No hemos podido recuperar este identificador del directorio de Lichess.</p><a class="text-link" href="https://ratings.fide.com/profile/${id}" target="_blank" rel="noopener noreferrer">Consultar directamente en FIDE ↗</a>`;
  }
}
