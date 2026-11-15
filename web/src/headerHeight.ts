import { useEffect } from 'react';

/** Altura que la cabecera tapa de la parte alta de la pantalla: solo cuenta si es una barra fija (sticky/fixed) a todo el ancho; la barra lateral de escritorio o la cabecera estática no tapan nada. */
export function coveredHeight(position: string, width: number, height: number, viewportWidth: number): number {
  const pinned = position === 'sticky' || position === 'fixed';
  return pinned && width >= viewportWidth * 0.9 ? Math.ceil(height) : 0;
}

/** Tras cambiar de paso, deja el inicio del paso visible entre la cabecera fija y la barra inferior; si ya lo está, no mueve nada. */
export function stepStartVisible(top: number, headerH: number, viewportH: number, bottomNavH: number): boolean {
  return top >= headerH && top <= viewportH - bottomNavH - 80;
}

/** Publica la altura real de la cabecera en `--header-h` (usada por scroll-padding y scroll-margin). `key` cambia cuando se monta otra cabecera. */
export function useHeaderHeight(key: unknown) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.sidebar, .topbar');
    const root = document.documentElement;
    if (!el) return;
    const apply = () => {
      const r = el.getBoundingClientRect();
      root.style.setProperty('--header-h', `${coveredHeight(getComputedStyle(el).position, r.width, r.height, window.innerWidth)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    // Los mismos cortes que usa styles.css para volver estática o lateral la cabecera.
    const queries = ['(max-width: 899px)', '(max-height: 500px)'].map((q) => window.matchMedia(q));
    window.addEventListener('resize', apply);
    queries.forEach((m) => m.addEventListener('change', apply));
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
      queries.forEach((m) => m.removeEventListener('change', apply));
    };
  }, [key]);
}
