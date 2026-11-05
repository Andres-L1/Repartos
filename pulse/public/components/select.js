const enhanced = new WeakMap();
let opened,
  sequence = 0;
const fold = (value) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function closeSelects(restoreFocus = false) {
  if (!opened) return;
  const current = opened;
  opened = null;
  current.popup.remove();
  current.button.setAttribute('aria-expanded', 'false');
  current.button.removeAttribute('aria-activedescendant');
  current.button.removeAttribute('aria-controls');
  if (restoreFocus && current.button.isConnected) current.button.focus();
}
export function enhanceSelects(root = document) {
  for (const select of root.querySelectorAll('select')) {
    if (enhanced.has(select) || select.multiple) continue;
    const label =
      select.getAttribute('aria-label') ||
      [...(select.labels?.[0]?.childNodes || [])]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join('')
        .trim() ||
      'Seleccionar';
    const host = document.createElement('span');
    host.className = 'chedex-select';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'select-trigger';
    button.id = `select-trigger-${++sequence}`;
    button.setAttribute('role', 'combobox');
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    const value = document.createElement('span');
    value.className = 'select-value';
    const arrow = document.createElement('span');
    arrow.className = 'select-chevron';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '⌄';
    button.append(value, arrow);
    host.append(button);
    select.after(host);
    select.hidden = true;
    const sync = () => {
      value.textContent = select.selectedOptions[0]?.textContent || 'Seleccionar';
      button.disabled = select.disabled;
    };
    const choose = (option) => {
      if (option.disabled) return;
      select.value = option.value;
      sync();
      closeSelects(true);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    };
    function open() {
      if (button.disabled) return;
      if (opened?.button === button) {
        closeSelects();
        return;
      }
      closeSelects();
      const popup = document.createElement('div');
      popup.className = 'select-popover';
      const list = document.createElement('div');
      list.className = 'select-options';
      list.id = `select-options-${sequence++}`;
      list.setAttribute('role', 'listbox');
      list.setAttribute('aria-label', label);
      button.setAttribute('aria-controls', list.id);
      button.setAttribute('aria-expanded', 'true');
      const state = { button, popup, active: 0, options: [], query: '', lastType: 0 };
      opened = state;
      function activate(index, focus = false) {
        if (!state.options.length) return;
        state.active = (index + state.options.length) % state.options.length;
        state.options.forEach((node, i) => node.classList.toggle('is-active', i === state.active));
        const option = state.options[state.active];
        button.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
        if (focus) option.focus();
      }
      function render(term = '') {
        list.replaceChildren();
        state.options = [];
        for (const option of select.options) {
          if (option.hidden || !fold(option.textContent).includes(fold(term))) continue;
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'select-option';
          item.tabIndex = -1;
          item.id = `${list.id}-${state.options.length}`;
          item.setAttribute('role', 'option');
          item.setAttribute('aria-selected', String(option.selected));
          item.disabled = option.disabled;
          item.textContent = option.textContent;
          item.addEventListener('click', () => choose(option));
          list.append(item);
          if (!option.disabled) state.options.push(item);
        }
        if (!state.options.length) {
          const empty = document.createElement('p');
          empty.className = 'select-empty';
          empty.textContent = 'Sin coincidencias';
          list.append(empty);
        }
        const chosen = state.options.findIndex(
          (item) => item.getAttribute('aria-selected') === 'true',
        );
        activate(Math.max(0, chosen));
      }
      if (select.options.length > 8) {
        const input = document.createElement('input');
        input.type = 'search';
        input.placeholder = 'Buscar opción…';
        input.className = 'select-search';
        input.setAttribute('aria-label', `Buscar opción de ${label}`);
        input.addEventListener('input', () => render(input.value));
        popup.append(input);
      }
      popup.append(list);
      document.body.append(popup);
      function position() {
        const bounds = button.getBoundingClientRect();
        const viewportHeight = window.visualViewport?.height || innerHeight;
        const height = Math.max(44, Math.min(330, viewportHeight - 32));
        popup.style.width = `${Math.min(Math.max(bounds.width, 220), innerWidth - 24)}px`;
        popup.style.left = `${Math.min(Math.max(12, bounds.left), innerWidth - popup.offsetWidth - 12)}px`;
        popup.style.top = '';
        popup.style.bottom = '';
        const below = viewportHeight - bounds.bottom - 12,
          above = bounds.top - 12;
        if (below < 180 && above > below) {
          popup.style.bottom = `${innerHeight - bounds.top + 7}px`;
          popup.style.maxHeight = `${Math.max(44, Math.min(height, above))}px`;
        } else {
          popup.style.top = `${bounds.bottom + 7}px`;
          popup.style.maxHeight = `${Math.max(44, Math.min(height, below))}px`;
        }
      }
      state.position = position;
      position();
      render();
      popup.addEventListener('keydown', (event) => navigate(event, true));
      popup.querySelector('input')?.focus();
      function navigate(event, fromPopup = false) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeSelects(true);
          return;
        }
        if (event.key === 'Tab') {
          closeSelects(true);
          return;
        }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          activate(
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? state.options.length - 1
                : state.active + (event.key === 'ArrowDown' ? 1 : -1),
            fromPopup,
          );
          return;
        }
        if (event.key === 'Enter' || (event.key === ' ' && event.target.tagName !== 'INPUT')) {
          event.preventDefault();
          state.options[state.active]?.click();
          return;
        }
        if (event.key.length === 1 && event.target.tagName !== 'INPUT') {
          state.query = Date.now() - state.lastType > 700 ? '' : state.query;
          state.query += event.key;
          state.lastType = Date.now();
          const index = state.options.findIndex((item) =>
            fold(item.textContent).startsWith(fold(state.query)),
          );
          if (index >= 0) activate(index, fromPopup);
        }
      }
      state.navigate = navigate;
    }
    button.addEventListener('click', open);
    button.addEventListener('keydown', (event) => {
      if (opened?.button === button) opened.navigate(event);
      else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        open();
      }
    });
    select.addEventListener('change', sync);
    select.form?.addEventListener('reset', () => queueMicrotask(sync));
    enhanced.set(select, { sync });
    sync();
  }
}
document.addEventListener('pointerdown', (event) => {
  if (opened && !opened.popup.contains(event.target) && !opened.button.contains(event.target))
    closeSelects();
});
window.addEventListener('resize', () => opened?.position());
window.visualViewport?.addEventListener('resize', () => opened?.position());
document.addEventListener(
  'scroll',
  (event) => {
    if (opened && !opened.popup.contains(event.target)) opened.position();
  },
  true,
);
