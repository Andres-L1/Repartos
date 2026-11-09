import { matchesCountry, countryByCode } from '../data.js';
const KEY = 'pulse:favorites:v1';
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export function validFavorite(item) {
  return (
    item &&
    typeof item.name === 'string' &&
    item.name.length > 0 &&
    item.name.length <= 200 &&
    ((item.type === 'player' && /^\d{1,12}$/.test(item.id)) ||
      (item.type === 'country' && /^[A-Z]{3,4}$/.test(item.id)))
  );
}
export function readFavorites() {
  try {
    const rows = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(rows) ? rows.filter(validFavorite).slice(0, 100) : [];
  } catch {
    return [];
  }
}
export function favoriteButton(type, id, name) {
  return `<button class="favorite-toggle" type="button" data-favorite="${type}:${escape(id)}" data-name="${escape(name)}" aria-pressed="false">☆ Guardar en favoritos</button>`;
}
export function refreshFavorites() {
  const rows = readFavorites();
  document.querySelectorAll('[data-favorite]').forEach((button) => {
    const selected = rows.some((row) => `${row.type}:${row.id}` === button.dataset.favorite);
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = selected ? '★ En favoritos' : '☆ Guardar en favoritos';
  });
  const section = document.getElementById('favorites-list');
  if (!section) return;
  section.innerHTML = rows.length
    ? rows
        .map(
          (row) =>
            `<a href="/${row.type === 'player' ? 'jugador' : 'mundo'}/${escape(row.id)}">${escape(row.name)} <span>${row.type === 'player' ? 'Jugador' : 'País / federación'} ↗</span></a>`,
        )
        .join('')
    : '<p class="fine">Guarda jugadores o países desde su ficha para encontrarlos aquí.</p>';
}
export function initFavorites() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-favorite]');
    if (!button) return;
    const [type, id] = button.dataset.favorite.split(':');
    const item = { type, id, name: button.dataset.name };
    if (!validFavorite(item)) return;
    const rows = readFavorites(),
      index = rows.findIndex((row) => row.type === type && row.id === id);
    if (index >= 0) rows.splice(index, 1);
    else if (rows.length < 100) rows.push(item);
    else {
      button.textContent = 'Máximo de 100 favoritos';
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(rows));
      refreshFavorites();
      document.dispatchEvent(new Event('pulse:favorites'));
    } catch {
      button.textContent = 'No se puede guardar en este navegador';
    }
  });
  refreshFavorites();
}

export function followedBroadcasts(favorites, broadcasts) {
  const normalize = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('es');
  return broadcasts.filter((item) =>
    favorites.some((favorite) => {
      if (favorite.type === 'country') {
        const country = countryByCode(favorite.id);
        return country && matchesCountry(item.location, country);
      }
      const pieces = normalize(favorite.name)
        .split(/[^\p{L}]+/u)
        .filter((part) => part.length >= 3);
      const participants = normalize(item.players);
      return (
        pieces.length >= 2 &&
        pieces.every((part) =>
          new RegExp('(^|[^\\p{L}])' + part + '([^\\p{L}]|$)', 'u').test(participants),
        )
      );
    }),
  );
}
