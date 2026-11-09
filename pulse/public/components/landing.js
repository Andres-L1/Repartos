import { requestJSON } from '../lib/requests.js';

export function initLanding() {
  const coverage = document.getElementById('landing-coverage');
  const status = document.getElementById('landing-coverage-status');
  if (!coverage || !status) return;

  const $ = (selector) => document.querySelector(selector);
  const count = new Intl.NumberFormat('es-ES');
  const date = (value) =>
    new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Madrid',
    }).format(new Date(value));
  const summary = () => requestJSON('/api/analytics/summary', { ttl: 600000 });
  const performance = () => requestJSON('/api/performance/WORLD', { ttl: 600000 });
  let started = false;
  async function loadSignals() {
    const [broadcasts, analytics, ranking] = await Promise.allSettled([
      requestJSON('/api/broadcasts', { ttl: 300000 }),
      summary(),
      performance(),
    ]);
    const live =
      broadcasts.status === 'fulfilled' && broadcasts.value.status === 'ok'
        ? broadcasts.value
        : null;
    if (live) {
      $('#landing-live-count').textContent = count.format(
        live.items.filter((item) => item.status === 'live').length,
      );
      $('#landing-live-status').textContent =
        `Selección de Lichess · Consultada ${date(live.fetchedAt)} (Madrid).`;
    } else
      $('#landing-live-status').textContent = 'Retransmisiones no disponibles en este momento.';
    const data =
      analytics.status === 'fulfilled' && analytics.value.status === 'ok' ? analytics.value : null;
    const world =
      ranking.status === 'fulfilled' &&
      ranking.value.status === 'ok' &&
      data &&
      ranking.value.month === data.fide.month
        ? ranking.value
        : null;
    if (data) {
      const federations = data.fide.federations.filter((item) => item.index?.eligible).length;
      $('#landing-fed-count').textContent = count.format(federations);
      $('#landing-fed-status').textContent =
        `Variación del censo activo · FIDE ${data.fide.month}.`;
    } else $('#landing-fed-status').textContent = 'Censo FIDE no disponible en este momento.';
    const group = world?.groups?.['all:all'],
      leader = group?.players?.[0];
    if (leader) {
      $('#landing-leader-score').textContent =
        `${leader.score > 0 ? '+' : ''}${count.format(leader.score)} Elo`;
      $('#landing-leader-name').textContent = leader.name;
      $('#landing-leader-status').textContent =
        `Mayor variación a 12 meses entre ${count.format(group.total)} comparables · FIDE ${world.month}.`;
      const link = $('#landing-leader-score').closest('a');
      link.href = `/jugador/${encodeURIComponent(leader.id)}`;
    } else
      $('#landing-leader-status').textContent =
        'Progresión mundial no disponible para la lista actual.';
    if (world)
      coverage.querySelector('[data-coverage="comparable"]').textContent = count.format(
        world.totalComparable,
      );
    else coverage.querySelector('[data-coverage="comparable"]').textContent = '—';
    if (data) {
      const counts = {
        players: data.fide.players.length,
        months: data.fide.sources.length,
        articles: data.catalog.length,
      };
      for (const [key, value] of Object.entries(counts))
        coverage.querySelector(`[data-coverage="${key}"]`).textContent = count.format(value);
      status.textContent = `Lista FIDE: ${data.fide.month} · Recopilación: ${date(data.generatedAt)} (Madrid).${data.stale ? ' Datos con más de 48 horas sin actualizar.' : ''}${data.delivery === 'bundled' ? ' Copia incluida en la publicación.' : data.delivery === 'last-good' ? ' Última copia verificada; fuente temporalmente no disponible.' : ''}${!world ? ' Progresión mundial temporalmente no disponible.' : ''}`;
    } else
      status.textContent =
        'No se ha podido consultar la cobertura. Puedes revisar las fuentes en el panel.';
  }
  function start() {
    if (started || location.pathname !== '/') return;
    started = true;
    loadSignals();
  }
  start();
  window.addEventListener('pulse:navigate', start);
  window.addEventListener('popstate', start);

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-landing-scroll]');
    if (!button) return;
    document.getElementById(button.dataset.landingScroll)?.scrollIntoView({
      block: 'start',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  });
}
