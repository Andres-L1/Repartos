/**
 * Comprobación independiente de la táctica perdida sobre todo el corpus: reproduce la línea del motor con chessops
 * (sin las utilidades de la regla), suma lo capturado por cada bando y compara con la ganancia declarada.
 *   npx tsx scripts/corpus/check-gain.mts
 */
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { parseUci } from 'chessops/util';
import { errorTier, keyErrors } from '../../src/review/select.js';
import { corpusAnalyses } from '../../test/review/corpus.js';

const V: Record<string, number> = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
let n = 0;
let bad = 0;
for (const a of corpusAnalyses())
  for (const e of keyErrors(a).filter((k) => errorTier(k) === 'tactic')) {
    n++;
    const d = e.diagnosis!;
    const pos = Chess.fromSetup(parseFen(e.move.fenBefore).unwrap()).unwrap();
    const me = pos.turn;
    let mine = 0;
    let theirs = 0;
    let settled = 0;
    let check = false;
    let mate = false;
    e.move.pv.slice(0, 6).forEach((uci, i) => {
      const m = parseUci(uci)!;
      const target = pos.board.get(m.to);
      const ep = !target && pos.board.get((m as any).from)?.role === 'pawn' && ((m as any).from & 7) !== (m.to & 7);
      const gained = target ? V[target.role]! : ep ? 1 : 0;
      if (gained) (pos.turn === me ? (mine += gained) : (theirs += gained), (settled = mine - theirs));
      pos.play(m);
      if (i === 0) check = pos.isCheck();
    });
    // mate en cualquier punto de la línea completa
    const p2 = Chess.fromSetup(parseFen(e.move.fenBefore).unwrap()).unwrap();
    for (const uci of e.move.pv) {
      p2.play(parseUci(uci)!);
      if (p2.isCheckmate()) mate = true;
    }
    const gain = (d.evidence.gainCp ?? 0) / 100;
    const kind = d.evidence.tactic!;
    const ok = kind === 'check_mate' ? check && mate : kind === 'check_wins' ? check && settled >= 2 : settled >= 2 && Math.abs(settled - gain) <= 0;
    if (!ok) {
      bad++;
      console.log('DISCREPANCIA', a.gameId, e.move.ply, kind, { gain, settled, check, mate }, d.fact);
    }
  }
console.log(`táctica perdida revisada de forma independiente: ${n - bad}/${n} coherentes`);
