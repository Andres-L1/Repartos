/**
 * Número de unidad que ve el alumno: su posición en la ruta (1, 2, 3...), no el campo `order`. `order` es un valor
 * persistido que solo sirve para ordenar (u10-u15 se intercalaron con valores no consecutivos), así que mostrarlo daba
 * «Unidad 14» a la u15. Los ids y `order` no cambian.
 */
export type Numbered<T> = T & { n: number };

/** Copia ordenada por `order` con `n` = posición desde 1. */
export function numberUnits<T extends { order: number }>(units: readonly T[]): Numbered<T>[] {
  return [...units].sort((a, b) => a.order - b.order).map((u, i) => ({ ...u, n: i + 1 }));
}
