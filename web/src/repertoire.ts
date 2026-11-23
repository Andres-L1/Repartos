import { useCallback, useEffect, useState } from 'react';
import type { RepColor, RepMove } from '../../src/openings/repertoire';
import { api } from './api';

/** Repertorio del alumno (servidor). `moves` es null mientras carga. Cada cambio devuelve la lista completa. */
export function useRepertoire() {
  const [moves, setMoves] = useState<RepMove[] | null>(null);
  const [error, setError] = useState('');
  const apply = useCallback((p: Promise<{ moves: RepMove[] }>) => {
    setError('');
    return p.then((r) => setMoves(r.moves)).catch((e: Error) => setError(e.message || 'No se pudo guardar. Inténtalo de nuevo.'));
  }, []);
  useEffect(() => {
    void apply(api.repertoire());
  }, [apply]);
  return {
    moves,
    error,
    /** Añade en bloques (el servidor admite 500 por petición). */
    add: async (color: RepColor, list: { key: string; uci: string }[]) => {
      for (let i = 0; i < list.length || i === 0; i += 500) await apply(api.repertoireAdd(color, list.slice(i, i + 500)));
    },
    remove: (m: RepMove) => apply(api.repertoireRemove(m)),
    clear: (color: RepColor) => apply(api.repertoireClear(color)),
  };
}
