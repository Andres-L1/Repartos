import { useSyncExternalStore } from 'react';

/**
 * Router con History API: URLs limpias (/aprender, /leccion/u01.l01…).
 * Las partes puras (normalizePath, legacyRedirect, isPrivatePath) no tocan el DOM y se prueban aparte.
 */

/** Rutas antiguas que ahora se llaman distinto (también dentro del hash antiguo). */
const RENAMED: Record<string, string> = { '/mapa': '/aprender', '/registro': '/entrar' };

export const PRIVATE_PREFIXES = ['/aprender', '/leccion', '/perfil', '/suscripcion', '/bienvenida', '/tienda', '/partidas'];

/** Quita query/hash y la barra final; '' pasa a '/'. */
export function normalizePath(raw: string): string {
  let p = raw.split('#')[0]!.split('?')[0]!;
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

export function isPrivatePath(path: string): boolean {
  return PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
}

function renamePath(path: string): string {
  const head = Object.keys(RENAMED).find((k) => path === k || path.startsWith(k + '/'));
  return head ? RENAMED[head]! + path.slice(head.length) : path;
}

/**
 * Si la URL cargada es antigua (con hash "#/ruta" o con una ruta renombrada) devuelve la URL limpia
 * equivalente (path + query + hash restante); si ya es correcta, null. Conserva el query de la URL
 * (p. ej. ?mock=1) y el del propio hash.
 */
export function legacyRedirect(pathname: string, search: string, hash: string): string | null {
  const h = hash.startsWith('#/') ? hash.slice(1) : null;
  if (h === null) {
    const renamed = renamePath(normalizePath(pathname));
    return renamed !== normalizePath(pathname) ? renamed + search + hash : null;
  }
  const qi = h.indexOf('?');
  const hashPath = normalizePath(qi === -1 ? h : h.slice(0, qi));
  const hashQuery = qi === -1 ? '' : h.slice(qi + 1);
  const params = new URLSearchParams(search);
  for (const [k, v] of new URLSearchParams(hashQuery)) params.set(k, v);
  const q = params.toString();
  return renamePath(hashPath) + (q ? '?' + q : '');
}

export function currentPath(): string {
  return normalizePath(window.location.pathname);
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Redirige URLs antiguas al arrancar (replaceState, sin recarga). Idempotente. */
export function applyLegacyRedirect(): void {
  const { pathname, search, hash } = window.location;
  const to = legacyRedirect(pathname, search, hash);
  if (to !== null) window.history.replaceState(null, '', to);
}

export function navigate(to: string, opts: { replace?: boolean } = {}): void {
  const url = new URL(to, window.location.origin);
  const target = url.pathname + url.search + url.hash;
  const here = window.location.pathname + window.location.search + window.location.hash;
  if (target !== here) {
    if (opts.replace) window.history.replaceState(null, '', target);
    else window.history.pushState(null, '', target);
  }
  notify();
}

/** Cambia el query de la URL actual sin añadir historia ni cambiar de ruta. */
export function replaceSearch(search: string): void {
  window.history.replaceState(null, '', window.location.pathname + search + window.location.hash);
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  // Un enlace antiguo con hash pegado en una pestaña ya abierta solo dispara hashchange: se redirige igual.
  const onHash = () => {
    applyLegacyRedirect();
    cb();
  };
  window.addEventListener('popstate', cb);
  window.addEventListener('hashchange', onHash);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('popstate', cb);
    window.removeEventListener('hashchange', onHash);
  };
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath, () => '/');
}

/** ¿Es un clic "normal" que el router debe interceptar? (no ctrl/cmd/shift/alt, botón izquierdo, sin target ajeno) */
export function isPlainClick(e: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}, target?: string | null): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && (!target || target === '_self');
}
