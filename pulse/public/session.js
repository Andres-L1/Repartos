import { sync } from './profile.js';
const container = document.getElementById('session-control');
async function loadSession() {
  try {
    const response = await fetch('/api/session', { cache: 'no-store' });
    if (!response.ok) throw new Error('session');
    const session = await response.json();
    if (session.authenticated) {
      await sync(session.user);
      container.replaceChildren();
      const profile = document.createElement('a');
      profile.href = `https://lichess.org/@/${encodeURIComponent(session.user.username)}`;
      profile.target = '_blank';
      profile.rel = 'noopener noreferrer';
      profile.className = 'session-user';
      profile.textContent = session.user.username;
      const form = document.createElement('form');
      form.method = 'post';
      form.action = '/auth/logout';
      const button = document.createElement('button');
      button.type = 'submit';
      button.className = 'logout-button';
      button.textContent = 'Salir';
      form.append(button);
      container.append(profile, form);
    }
  } catch {
    /* El enlace de acceso y la consulta pública siguen disponibles. */
  }
}
const params = new URLSearchParams(location.search);
if (params.has('auth')) {
  const alert = document.createElement('div');
  alert.className = 'auth-notice';
  alert.setAttribute('role', 'alert');
  alert.textContent =
    'No se ha completado el acceso con Lichess. Puedes volver a intentarlo o continuar explorando sin cuenta.';
  document.getElementById('main').prepend(alert);
  history.replaceState(null, '', location.pathname);
}
loadSession();
