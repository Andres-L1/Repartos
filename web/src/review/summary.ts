import type { Report, Strength } from '../../../src/review/types';

/** Nombre del concepto en lenguaje corriente, para frases como «dejar piezas sin defensa». */
const CONCEPT_PHRASE: Record<string, { title: string; short: string }> = {
  'tactics.hanging_piece': { title: 'Piezas que se quedan sin defensa', short: 'piezas sin defensa' },
  'tactics.bad_exchange': { title: 'Cambios que pierden material', short: 'cambios que pierden material' },
  'tactics.fork': { title: 'Horquillas del rival', short: 'horquillas del rival' },
  'tactics.pin': { title: 'Clavadas', short: 'clavadas' },
  'tactics.mate_threat': { title: 'Amenazas de jaque mate', short: 'amenazas de mate' },
  'tactics.discovered_attack': { title: 'Ataques que se destapan', short: 'ataques que se destapan' },
};

export const conceptTitle = (id: string): string => CONCEPT_PHRASE[id]?.title ?? 'Errores tácticos';
export const conceptShort = (id: string): string => CONCEPT_PHRASE[id]?.short ?? 'errores tácticos';

export const PHASE_NAME = { opening: 'la apertura', middlegame: 'el medio juego', endgame: 'el final' } as const;

/** «en 4 de 10 partidas» (concordancia correcta con 1 partida). */
export function inGames(n: number, total: number): string {
  return `en ${n} de ${total} ${total === 1 ? 'partida' : 'partidas'}`;
}

export function headline(r: Report): string {
  const { wins, draws, losses } = r.counts;
  const total = r.games.length;
  const main = r.weaknesses[0];
  const results = `${wins} ${wins === 1 ? 'ganada' : 'ganadas'}, ${draws} ${draws === 1 ? 'empatada' : 'empatadas'} y ${losses} ${losses === 1 ? 'perdida' : 'perdidas'}`;
  if (!main) return `En tus últimas ${total} partidas: ${results}. No encontré errores graves con una causa clara.`;
  return `En tus últimas ${total} partidas: ${results}. Lo que más puntos te ha costado: ${conceptShort(main.conceptId)}.`;
}

export function strengthSentence(s: Strength): string {
  if (s.kind === 'phase' && s.phase) return `Cometes pocos errores graves en ${PHASE_NAME[s.phase]}.`;
  if (s.kind === 'accuracy') return `Tus jugadas suelen ser buenas: ${Math.round(s.value * 100)} de cada 100 fueron acertadas.`;
  return 'En tus partidas más recientes cometes menos errores graves que en las anteriores.';
}

/** Sin puntos fuertes en los datos no se inventa ninguno. */
export const NO_STRENGTHS = 'Con estas partidas no destaca todavía ninguna zona en la que falles claramente menos. Eso se construye con práctica.';

export const RESULT_WORD = { win: 'Ganada', draw: 'Tablas', loss: 'Perdida' } as const;
