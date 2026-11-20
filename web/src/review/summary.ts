import type { Report, Strength } from '../../../src/review/types';

/** Nombre del concepto en lenguaje corriente, para frases como «dejar piezas sin defensa». */
const CONCEPT_PHRASE: Record<string, { title: string; short: string }> = {
  'tactics.hanging_piece': { title: 'Piezas que se quedan sin defensa', short: 'piezas sin defensa' },
  'tactics.bad_exchange': { title: 'Cambios que pierden material', short: 'cambios que pierden material' },
  'tactics.fork': { title: 'Horquillas del rival', short: 'horquillas del rival' },
  'tactics.pin': { title: 'Clavadas', short: 'clavadas' },
  'tactics.mate_threat': { title: 'Mates y amenazas de mate', short: 'mates y amenazas de mate' },
  'tactics.discovered_attack': { title: 'Ataques que se destapan', short: 'ataques que se destapan' },
  'tactics.skewer': { title: 'Enfiladas', short: 'enfiladas' },
  'tactics.deflection': { title: 'Defensores desviados', short: 'defensores desviados' },
  'tactics.remove_defender': { title: 'Defensores eliminados', short: 'defensores eliminados' },
  'tactics.attraction': { title: 'Sacrificios de atracción', short: 'sacrificios de atracción' },
  'tactics.intermezzo': { title: 'Jugadas intermedias', short: 'jugadas intermedias' },
  'tactics.defensive_move': { title: 'Defensas precisas', short: 'defensas precisas' },
  'tactics.interference': { title: 'Interferencias', short: 'interferencias' },
  'tactics.clearance': { title: 'Despejes de líneas y casillas', short: 'despejes de líneas y casillas' },
  'endgame.king_pawn': { title: 'Finales de rey y peón', short: 'finales de rey y peón' },
  'endgame.rook': { title: 'Finales de torre', short: 'finales de torre' },
  'strategy.open_file': { title: 'Columnas abiertas', short: 'columnas abiertas' },
  'strategy.seventh_rank': { title: 'Torre en la séptima fila', short: 'la torre en la séptima fila' },
  'strategy.outpost': { title: 'Casillas de avanzada para el caballo', short: 'casillas de avanzada para el caballo' },
};

export const conceptTitle = (id: string): string => CONCEPT_PHRASE[id]?.title ?? 'Errores tácticos';
export const conceptShort = (id: string): string => CONCEPT_PHRASE[id]?.short ?? 'errores tácticos';

export const PHASE_NAME = { opening: 'la apertura', middlegame: 'el medio juego', endgame: 'el final' } as const;

/** «en 4 de 10 partidas» (concordancia correcta con 1 partida). */
export function inGames(n: number, total: number): string {
  return `en ${n} de ${total} ${total === 1 ? 'partida' : 'partidas'}`;
}

/** « 4 imprecisiones, que no se repasan.» (vacío si no hay) */
export function inaccuracySentence(n: number): string {
  return n > 0 ? ` Además, ${n} ${n === 1 ? 'imprecisión' : 'imprecisiones'}: jugadas algo peores que la mejor, que no hace falta repasar.` : '';
}

/**
 * Mensaje de una partida sin nada que repasar. `serious`: errores graves del alumno (sin mejor jugada que enseñar
 * si se llega aquí con serious > 0); `inaccuracies`: jugadas algo peores que la mejor.
 */
export function emptyMessage(serious: number, inaccuracies: number): string {
  const inacc = inaccuracies === 0 ? 'ninguna imprecisión' : `${inaccuracies} ${inaccuracies === 1 ? 'imprecisión' : 'imprecisiones'}`;
  if (serious === 0) return `Partida limpia: ${inacc}, ninguna grave. No hay nada que repasar. Buen trabajo.`;
  return `Hubo ${serious} ${serious === 1 ? 'error grave' : 'errores graves'}, pero no pude comprobar una jugada mejor que enseñarte. Puedes verlos en la partida.`;
}

export function headline(r: Report): string {
  const { wins, draws, losses } = r.counts;
  const total = r.games.length;
  const main = r.weaknesses[0];
  const results = `${wins} ${wins === 1 ? 'ganada' : 'ganadas'}, ${draws} ${draws === 1 ? 'empatada' : 'empatadas'} y ${losses} ${losses === 1 ? 'perdida' : 'perdidas'}`;
  if (!main) {
    const noCause =
      r.serious === 0
        ? 'No encontré errores graves.'
        : `Hubo ${r.serious} ${r.serious === 1 ? 'error grave' : 'errores graves'} sin una causa que pueda comprobar; los verás en el repaso de cada partida.`;
    return `En tus últimas ${total} partidas: ${results}. ${noCause}${inaccuracySentence(r.inaccuracies)}`;
  }
  return `En tus últimas ${total} partidas: ${results}. Lo que más puntos te ha costado: ${conceptShort(main.conceptId)}.${inaccuracySentence(r.inaccuracies)}`;
}

export function strengthSentence(s: Strength): string {
  if (s.kind === 'phase' && s.phase) return `Cometes pocos errores graves en ${PHASE_NAME[s.phase]}.`;
  if (s.kind === 'accuracy') return `Tus jugadas suelen ser buenas: ${Math.round(s.value * 100)} de cada 100 fueron acertadas.`;
  return 'En tus partidas más recientes cometes menos errores graves que en las anteriores.';
}

/** Sin puntos fuertes en los datos no se inventa ninguno. */
export const NO_STRENGTHS = 'Con estas partidas no destaca todavía ninguna zona en la que falles claramente menos. Eso se construye con práctica.';

export const RESULT_WORD = { win: 'Ganada', draw: 'Tablas', loss: 'Perdida' } as const;
