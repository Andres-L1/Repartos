import { requestJSON } from '../lib/requests.js';

export function initLanding() {
  const coverage = document.getElementById('landing-coverage');
  const status = document.getElementById('landing-coverage-status');
  if (!coverage || !status) return;

  async function loadCoverage() {
    status.textContent = 'Consultando la cobertura de la instantánea…';
    try {
      const data = await requestJSON('/api/analytics/summary', { ttl: 600000 });
      if (data.status !== 'ok' || data.schema !== 1) throw new Error('source');
      const counts = {
        players: data.fide.players.length,
        months: data.fide.sources.length,
        articles: data.catalog.length,
        federations: data.fide.federations.length,
      };
      const format = new Intl.NumberFormat('es-ES');
      for (const element of coverage.querySelectorAll('[data-coverage]')) {
        element.textContent = format.format(counts[element.dataset.coverage]);
      }
      const date = new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Europe/Madrid',
      }).format(new Date(data.generatedAt));
      status.textContent = `Lista FIDE: ${data.fide.month} · Recopilación: ${date} (Madrid).${data.stale ? ' Datos con más de 48 horas sin actualizar.' : ''}${data.delivery === 'bundled' ? ' Copia incluida en la publicación.' : data.delivery === 'last-good' ? ' Última copia verificada; fuente temporalmente no disponible.' : ''}`;
    } catch {
      status.textContent =
        'No se ha podido consultar la cobertura. Puedes revisar las fuentes en el panel.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Volver a consultar ↻';
      retry.addEventListener('click', loadCoverage, { once: true });
      status.append(retry);
    }
  }
  const observer = new IntersectionObserver((entries) => {
    if (
      entries.some((entry) => entry.isIntersecting) &&
      document.body.classList.contains('landing-mode')
    ) {
      observer.disconnect();
      loadCoverage();
    }
  });
  observer.observe(coverage);

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-landing-scroll]');
    if (!button) return;
    document.getElementById(button.dataset.landingScroll)?.scrollIntoView({
      block: 'start',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  });
}
