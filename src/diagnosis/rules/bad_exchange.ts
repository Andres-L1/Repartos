import { VALUE, canCaptureOn, describe, replayAsThreat, roleName, sanEs, sq, type Step } from '../chess-utils.js';
import type { Rule } from './types.js';

export const badExchange: Rule = (ctx) => {
  const { move, me, after, pos0, played } = ctx;
  const a0 = after[0];
  if (!a0 || !a0.captured) return null;

  // Cadena de capturas consecutivas sobre una misma casilla (empezando, si aplica, por mi captura).
  const chain: Step[] = [];
  let square: number;
  if (played.captured) {
    if (a0.to !== played.to) return null; // capturas en casillas distintas: no es un cambio
    chain.push(played);
    square = played.to;
  } else {
    square = a0.to;
  }
  for (const s of after) {
    if (s.captured && s.to === square && s.captured.square === square) chain.push(s);
    else break;
  }
  if (chain.length < 2) return null;

  let net = 0;
  for (const s of chain) net += (s.color === me ? 1 : -1) * VALUE[s.captured!.role];
  if (net > -2) return null;

  // Si al terminar la cadena todavía se puede capturar en la casilla, la secuencia es ambigua.
  if (canCaptureOn(chain[chain.length - 1]!.pos, square)) return null;

  const given = chain.filter((s) => s.color !== me).map((s) => s.captured!.role);
  const received = chain.filter((s) => s.color === me).map((s) => s.captured!.role);
  const total = (rs: string[]) => rs.reduce((a, r) => a + VALUE[r as keyof typeof VALUE], 0);
  const list = (rs: string[]) => (rs.length ? rs.map((r) => roleName(r as keyof typeof VALUE)).join(' y ') : 'nada');
  const first = chain[0]!;
  const base = `En ${sq(square)} se produce el cambio ${chain.map((s) => s.san).join(' ')}: se entrega ${list(given)} (valor ${total(given)}) y se recibe ${list(received)} (valor ${total(received)}).`;
  // ¿Ya podía el rival iniciar el mismo cambio antes de la jugada y esta no lo atendió?
  let ignored = false;
  if (!played.captured && played.from !== square) {
    const victim = pos0.board.get(square);
    const replay = victim && victim.color === me ? replayAsThreat(pos0, chain.map((s) => s.uci)) : null;
    ignored = !!replay && replay.every((r, i) => r.captured?.role === chain[i]!.captured!.role);
  }
  const fact = ignored
    ? `No atendiste la amenaza sobre ${describe(pos0.board.get(square)!.role, square)}: ya podía capturarse en ${sq(square)} antes de tu jugada (${sanEs(move.san)}), que no la resuelve. ${base}`
    : base;
  return {
    type: 'bad_exchange',
    ply: move.ply,
    color: me,
    fact,
    evidence: {
      squares: [sq(square), sq(first.from)],
      pieces: [...new Set(chain.flatMap((s) => [s.role, s.captured!.role]))],
      refutationUci: a0.uci,
      materialLostCp: -net * 100,
    },
    conceptIds: ['tactics.bad_exchange'],
  };
};
