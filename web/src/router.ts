import { useEffect, useState } from 'react';

/** Router de hash: "#/ruta/param". */
export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  const path = h.split('?')[0] ?? '';
  return path === '' ? '/' : path;
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function usePath(): string {
  const [path, setPath] = useState(currentPath());
  useEffect(() => {
    const on = () => setPath(currentPath());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}
