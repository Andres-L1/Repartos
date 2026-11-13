/** Los conceptos que más veces ha fallado el alumno: recuento descendente, empate por id, sin recuentos no positivos. */
export function topWeakConcepts(weak: Record<string, number>, n = 3): { conceptId: string; count: number }[] {
  return Object.entries(weak)
    .filter(([, count]) => Number.isFinite(count) && count > 0)
    .map(([conceptId, count]) => ({ conceptId, count }))
    .sort((a, b) => b.count - a.count || (a.conceptId < b.conceptId ? -1 : a.conceptId > b.conceptId ? 1 : 0))
    .slice(0, Math.max(0, n));
}
