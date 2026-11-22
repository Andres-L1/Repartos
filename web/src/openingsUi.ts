/** Ayudas puras de la pantalla «Aperturas» (se prueban aparte). */

export interface Outcomes {
  white: number;
  draws: number;
  black: number;
}

/** Porcentajes enteros blancas/tablas/negras que suman 100 (el resto del redondeo va al mayor). Sin partidas: 0, 0, 0. */
export function pct(o: Outcomes): [number, number, number] {
  const total = o.white + o.draws + o.black;
  if (total <= 0) return [0, 0, 0];
  const raw = [o.white, o.draws, o.black].map((n) => (n / total) * 100);
  const out = raw.map(Math.floor);
  let rest = 100 - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) if (rest-- > 0) out[i]!++;
  return out as [number, number, number];
}

export function outcomeBar(o: Outcomes): string {
  const [w, d, b] = pct(o);
  return `Blancas ganan ${w} %, tablas ${d} %, negras ganan ${b} %`;
}

export const gamesOf = (o: Outcomes): number => o.white + o.draws + o.black;

/** 12 345 -> «12 345» (separador de miles fino, sin depender del idioma del navegador). */
export const fmtGames = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
