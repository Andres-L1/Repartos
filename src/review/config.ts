/** Profundidad fija de revisión para todos los usuarios (medida en la Tarea 3: ~284 ms por posición). */
export const REVIEW_DEPTH = 12;
export const ENGINE_TAG = 'sf16';

/** Clave de caché: incluye profundidad y motor para no mezclar análisis distintos. */
export function analysisKey(gameId: string): string {
  return `${gameId}:d${REVIEW_DEPTH}:${ENGINE_TAG}`;
}
