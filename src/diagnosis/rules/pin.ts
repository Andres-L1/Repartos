import { VALUE, capitalize, describe, findPins, lossOver, replayAsThreat, sanEs, sq, withArticle } from '../chess-utils.js';
import type { Rule } from './types.js';

/**
 * Clavada explotada. Se reproduce pvAfter: el rival captura (en su jugada 1ª, 2ª o 3ª de la línea) una pieza
 * del alumno que, justo antes de esa captura, seguía clavada (contra el rey o una pieza mayor) y no se movió.
 * Cubre la explotación inmediata (captura en pvAfter[0]) y la indirecta (un peón / pieza menor ataca la pieza
 * clavada y la captura después). La pérdida se verifica con el material de la línea o, si la línea termina en
 * cambios compensados, con la caída medida por el motor cuando la captura la hace una pieza de menor valor.
 */
export const pin: Rule = (ctx) => {
  const { move, me, opp, after, pos0, pos1, played } = ctx;
  for (const i of [0, 2, 4]) {
    const step = after[i];
    if (!step) break;
    if (step.color !== opp) break;
    if (!step.captured) continue;
    const captured = step.captured;
    // La pieza clavada no se movió antes de ser capturada.
    if (after.slice(0, i).some((s) => s.color === me && s.from === captured.square)) continue;
    const before = i === 0 ? pos1 : after[i - 1]!.pos;
    const pins = findPins(before, me).filter((p) => p.pinned === captured.square && p.pinnedRole === captured.role);
    if (pins.length === 0) continue;
    const p = pins.find((x) => x.absolute) ?? pins[0]!;
    const cheaper = VALUE[step.role] < VALUE[captured.role];
    // Captura inmediata con una pieza de igual o mayor valor (p. ej. la propia clavadora): no es explotar la
    // clavada, la pieza simplemente estaba colgada (lo trata hanging_piece).
    if (i === 0 && !cheaper) continue;
    const loss = lossOver(ctx, 4);
    const verified = loss >= 2 || (cheaper && move.cpLoss >= 100);
    if (!verified) continue;
    const behind = p.absolute ? 'el rey' : describe(p.behindRole, p.behind);
    // Si la misma pieza había atacado antes a la clavada (p. ej. ...d4 y luego ...dxc3), se cita esa jugada.
    const first = after[0]!;
    const attack = i > 0 && !first.captured && first.to === step.from ? `, atacado antes con ${first.san},` : '';
    // Captura inmediata que ya era posible antes de la jugada (la clavada ya estaba y no se atendió).
    let ignored = false;
    if (i === 0 && played.from !== captured.square) {
      const t = replayAsThreat(pos0, [step.uci])?.[0];
      ignored = !!t && t.captured?.square === captured.square && t.captured.role === captured.role;
    }
    const pinnedDesc = describe(p.pinnedRole, p.pinned);
    const pinnerDesc = describe(p.pinnerRole, p.pinner);
    const fact = ignored
      ? `No atendiste la amenaza sobre ${pinnedDesc}, clavado por ${pinnerDesc} contra ${behind}: ya estaba atacado antes de tu jugada (${sanEs(move.san)}) y es capturado por ${withArticle(step.role)} (${step.san}).`
      : capitalize(
          `${pinnedDesc} está clavado por ${pinnerDesc} contra ${behind}${attack} y es capturado por ${withArticle(step.role)} (${step.san}).`,
        );
    return {
      type: 'pin',
      ply: move.ply,
      color: me,
      fact,
      evidence: {
        squares: [sq(p.pinner), sq(p.pinned), sq(p.behind)],
        pieces: [p.pinnerRole, p.pinnedRole, p.behindRole],
        refutationUci: step.uci,
        materialLostCp: loss >= 2 ? loss * 100 : move.cpLoss,
      },
      conceptIds: ['tactics.pin'],
    };
  }
  return null;
};
