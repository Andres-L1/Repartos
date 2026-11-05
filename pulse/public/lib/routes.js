const VIEWS = new Set(['mundo', 'tendencias', 'indices', 'fuentes', 'jugador', 'torneo']);
export function parseRoute(pathname) {
  const parts = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  if (!parts.length) return { section: 'inicio', value: undefined };
  if (parts[0] === 'panel' && parts.length === 1) return { section: 'hoy', value: undefined };
  if (!VIEWS.has(parts[0]) || parts.length > 2) return null;
  if (['tendencias', 'fuentes'].includes(parts[0]) && parts.length !== 1) return null;
  if (parts[0] === 'jugador' && !/^\d{1,12}$/.test(parts[1] || '')) return null;
  if (parts[0] === 'torneo' && !/^[A-Za-z0-9_-]{1,64}$/.test(parts[1] || '')) return null;
  if (parts[0] === 'mundo' && parts[1] && !/^[A-Z]{3,4}$/.test(parts[1])) return null;
  if (
    parts[0] === 'indices' &&
    parts[1] &&
    !['performance', 'trending', 'global'].includes(parts[1])
  )
    return null;
  return { section: parts[0], value: parts[1] };
}
export function legacyPath(hash) {
  const value = hash.replace(/^#\/*/, '');
  if (value === 'hoy') return '/panel';
  return parseRoute('/' + value) ? '/' + value : null;
}
export function currentRoute() {
  return parseRoute(location.pathname) || { section: 'inicio' };
}
export function navigate(path, { replace = false } = {}) {
  const url = new URL(path, location.origin);
  if (url.origin !== location.origin || !parseRoute(url.pathname)) {
    location.assign(url.href);
    return;
  }
  const next = url.pathname + url.search;
  if (next !== location.pathname + location.search)
    history[replace ? 'replaceState' : 'pushState'](null, '', next);
  window.dispatchEvent(new Event('pulse:navigate'));
}
export function installRouter(onNavigate) {
  const migrate = () => {
    const path = location.hash && legacyPath(location.hash);
    if (path) {
      history.replaceState(null, '', path + location.search);
      return true;
    }
    return false;
  };
  migrate();
  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.origin);
    if (url.origin !== location.origin || url.hash || !parseRoute(url.pathname)) return;
    event.preventDefault();
    navigate(url.pathname + url.search);
  });
  window.addEventListener('popstate', onNavigate);
  window.addEventListener('pulse:navigate', onNavigate);
  window.addEventListener('hashchange', () => {
    if (migrate()) onNavigate();
  });
}
