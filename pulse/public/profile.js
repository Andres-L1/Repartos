import { readFavorites, refreshFavorites } from './components/favorites.js';
const KEY = 'pulse:favorites:v1',
  OWNER = 'pulse:owner:v1',
  ALERTS = 'pulse:alerts:v1',
  PENDING = 'pulse:pending:v1';
const status = document.getElementById('sync-status');
const selectors = {
  language: 'news-language',
  publisher: 'news-publisher',
  mapFilter: 'map-filter',
};
let version = 0,
  active = false,
  saving = false,
  dirty = false;
const preferences = () =>
  Object.fromEntries(
    Object.entries(selectors).map(([key, id]) => [key, document.getElementById(id).value]),
  );
async function save() {
  if (!active) return;
  dirty = true;
  localStorage.setItem(
    PENDING,
    JSON.stringify({
      owner: localStorage.getItem(OWNER),
      favorites: readFavorites(),
      preferences: preferences(),
    }),
  );
  if (saving) return;
  saving = true;
  while (dirty) {
    dirty = false;
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version,
          data: { favorites: readFavorites(), preferences: preferences() },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      version = result.version;
      if (!dirty) localStorage.removeItem(PENDING);
      status.textContent = 'Favoritos y filtros sincronizados con tu cuenta de Lichess.';
    } catch (error) {
      active = false;
      document.getElementById('retry-sync').hidden = false;
      status.textContent =
        error.message || 'No se pudo sincronizar. Tus cambios siguen en este dispositivo.';
    }
  }
  saving = false;
}
async function sync(user) {
  try {
    const response = await fetch('/api/profile', { cache: 'no-store' });
    if (!response.ok) throw new Error();
    const profile = await response.json();
    const previous = localStorage.getItem(OWNER);
    const pending = JSON.parse(localStorage.getItem(PENDING) || 'null');
    if (previous === user.id && pending?.owner === user.id) {
      status.textContent =
        'Hay cambios locales sin sincronizar. Puedes recuperarlos y reemplazar la copia de la cuenta.';
      document.getElementById('retry-sync').hidden = false;
      return;
    }
    const local = previous ? [] : readFavorites();
    const remote = profile.data?.favorites || [];
    const merged = [
      ...remote,
      ...local.filter(
        (item) => !remote.some((row) => row.type === item.type && row.id === item.id),
      ),
    ].slice(0, 100);
    localStorage.setItem(KEY, JSON.stringify(merged));
    localStorage.setItem(OWNER, user.id);
    version = profile.version;
    if (profile.data?.preferences)
      for (const [key, id] of Object.entries(selectors)) {
        const element = document.getElementById(id),
          value = profile.data.preferences[key];
        if ([...element.options].some((option) => option.value === value)) {
          element.value = value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    refreshFavorites();
    document.dispatchEvent(new Event('pulse:favorites'));
    active = true;
    document.getElementById('delete-profile').hidden = false;
    if (!profile.data || merged.length !== remote.length) await save();
    else status.textContent = 'Favoritos y filtros sincronizados con tu cuenta de Lichess.';
  } catch {
    status.textContent = 'No se pudo sincronizar. Tus favoritos siguen en este dispositivo.';
  }
}
document.addEventListener('pulse:favorites', () => save());
for (const id of Object.values(selectors))
  document.getElementById(id).addEventListener('change', () => save());
document.getElementById('retry-sync').addEventListener('click', async () => {
  if (!confirm('¿Reemplazar los datos de la cuenta con los cambios guardados en este dispositivo?'))
    return;
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING));
    if (!pending || pending.owner !== localStorage.getItem(OWNER)) throw new Error();
    const response = await fetch('/api/profile', { cache: 'no-store' });
    if (!response.ok) throw new Error();
    version = (await response.json()).version;
    localStorage.setItem(KEY, JSON.stringify(pending.favorites));
    for (const [key, id] of Object.entries(selectors))
      document.getElementById(id).value = pending.preferences[key];
    refreshFavorites();
    active = true;
    await save();
    if (active) {
      document.getElementById('retry-sync').hidden = true;
      document.getElementById('delete-profile').hidden = false;
      document.dispatchEvent(new Event('pulse:favorites'));
    }
  } catch {
    status.textContent = 'No se han podido recuperar los cambios. Inténtalo de nuevo.';
  }
});
document.getElementById('delete-profile').addEventListener('click', async () => {
  if (
    !confirm(
      '¿Borrar tus favoritos y preferencias sincronizados? También se eliminarán de este dispositivo.',
    )
  )
    return;
  try {
    const response = await fetch('/api/profile', { method: 'DELETE' });
    if (!response.ok) throw new Error();
    active = false;
    localStorage.removeItem(KEY);
    localStorage.removeItem(OWNER);
    localStorage.removeItem(PENDING);
    refreshFavorites();
    document.dispatchEvent(new Event('pulse:favorites'));
    status.textContent =
      'Datos sincronizados eliminados. Cierra sesión y vuelve a entrar para activar la sincronización de nuevo.';
    document.getElementById('delete-profile').hidden = true;
  } catch {
    status.textContent = 'No se han podido borrar los datos. Inténtalo de nuevo.';
  }
});
const alertButton = document.getElementById('alerts-toggle');
function showAlertState() {
  alertButton.textContent =
    localStorage.getItem(ALERTS) === 'yes' && Notification.permission === 'granted'
      ? 'Desactivar avisos en este dispositivo'
      : 'Activar avisos en este dispositivo';
}
if (!('Notification' in window)) {
  alertButton.hidden = true;
  document.getElementById('alerts-status').textContent = 'Este navegador no admite avisos.';
} else {
  showAlertState();
  alertButton.addEventListener('click', async () => {
    if (localStorage.getItem(ALERTS) === 'yes') localStorage.removeItem(ALERTS);
    else if ((await Notification.requestPermission()) === 'granted')
      localStorage.setItem(ALERTS, 'yes');
    else
      document.getElementById('alerts-status').textContent =
        'El navegador no ha permitido los avisos.';
    showAlertState();
  });
}
let previousLive = null;
document.addEventListener('pulse:followed-live', (event) => {
  const items = event.detail;
  const container = document.getElementById('followed-live');
  container.replaceChildren();
  if (items.length) {
    const heading = document.createElement('p');
    heading.className = 'fine';
    heading.textContent = 'Retransmisiones relacionadas con tus favoritos:';
    container.append(heading);
    for (const item of items.slice(0, 5)) {
      const link = document.createElement('a');
      link.href = `/torneo/${encodeURIComponent(item.id)}`;
      link.textContent = `${item.name} ↗`;
      container.append(link);
    }
  }
  const live = items.filter((item) => item.status === 'live');
  if (
    previousLive &&
    'Notification' in window &&
    Notification.permission === 'granted' &&
    localStorage.getItem(ALERTS) === 'yes'
  )
    for (const item of live) {
      if (!previousLive.has(item.id))
        new Notification('Chedex Pulse · retransmisión relacionada', {
          body: item.name,
          icon: '/icon-192.png',
          tag: `pulse-${item.id}`,
        });
    }
  previousLive = new Set(live.map((item) => item.id));
});
let prompt;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  prompt = event;
  document.getElementById('install-app').hidden = false;
});
document.getElementById('install-app').addEventListener('click', async () => {
  if (prompt) {
    await prompt.prompt();
    prompt = null;
    document.getElementById('install-app').hidden = true;
  }
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
export { sync };
