/**
 * Detector de avisos que regalan la solución. Un aviso de primer fallo (`hint`, `explanationWrong`, `wrongByMove`)
 * solo puede orientar: no nombra la jugada solución (SAN o UCI) ni su casilla de destino. Lo usan
 * test/content/hints.test.ts y scripts/report-hint-leaks.mts.
 */
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { makeSquare, parseUci } from 'chessops/util';
import type { Branch } from '../../src/shared/moves.ts';

const PIECE = 'KQRBN';
const SAN_TOKEN = /(?<![A-Za-z0-9])(O-O-O|O-O|[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|[a-h]x[a-h][1-8](?:=[QRBN])?|[a-h][1-8](?:=[QRBN])?)(?![a-z0-9])/g;
const UCI_TOKEN = /(?<![A-Za-z0-9])[a-h][1-8][a-h][1-8][qrbn]?(?![A-Za-z0-9])/g;
const SQUARE = /(?<![A-Za-z0-9])[a-h][1-8](?![a-z0-9])/g;

export interface Target {
  /** Jugada en UCI con la que el alumno acierta (la esperada o una `alt`). */
  uci: string;
  san: string;
  /** Pieza (K, Q, R, B, N o '' para peón) y casilla de destino: así se detecta «Re8» cuando la solución es «Rxe8». */
  piece: string;
  dest: string;
}

function targetOf(pos: Chess, uci: string): Target | null {
  const m = parseUci(uci);
  if (!m || !pos.isLegal(m)) return null;
  const san = makeSan(pos, m).replace(/[+#]$/, '');
  const piece = san[0] && PIECE.includes(san[0]) ? san[0] : '';
  const dest = san.startsWith('O-O') ? (san === 'O-O' ? 'g' : 'c') + uci[1] : makeSquare((m as { to: number }).to);
  return { uci, san, piece, dest };
}

/** Todas las jugadas con las que el alumno acierta: una por cada turno suyo de la línea, más las `alt` de la última. */
export function targetsOf(fen: string, line: readonly string[], alt: readonly string[] = [], branches: readonly Branch[] = []): Target[] {
  return [
    ...targetsOfLine(fen, line, alt),
    // Las ramas (alternativas intermedias y su continuación) también son soluciones: un aviso no puede nombrarlas.
    ...branches.flatMap((b) => targetsOfLine(fen, [...line.slice(0, b.at), ...b.line], b.alt ?? []),),
  ];
}

function targetsOfLine(fen: string, line: readonly string[], alt: readonly string[]): Target[] {
  const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
  const out: Target[] = [];
  line.forEach((u, i) => {
    if (i % 2 === 0) {
      for (const c of i === line.length - 1 ? [u, ...alt] : [u]) {
        const t = targetOf(pos, c);
        if (t) out.push(t);
      }
    }
    pos.play(parseUci(u)!);
  });
  return out;
}

/**
 * Fragmentos del texto que nombran la solución; vacío si el aviso solo orienta. Lo que el propio enunciado (`prompt`)
 * ya dice («Lleva la torre de h1 a h6») no cuenta: repetirlo no regala nada.
 */
export function leaksIn(text: string, targets: readonly Target[], prompt = ''): string[] {
  const found = new Set<string>();
  for (const [u] of text.matchAll(UCI_TOKEN)) if (targets.some((t) => t.uci === u)) found.add(u);
  for (const [tok] of text.matchAll(SAN_TOKEN)) {
    const bare = tok.replace(/[+#]$/, '');
    for (const t of targets) {
      if (bare === t.san || bare.replace('x', '') === t.san.replace('x', '')) found.add(tok);
      else if (!t.piece && bare === t.dest) found.add(tok);
      else if (t.piece && bare.length >= 3 && bare[0] === t.piece && bare.endsWith(t.dest)) found.add(tok);
    }
  }
  // La casilla de destino sola («lleva la torre a e8») ya es la respuesta.
  for (const [sq] of text.matchAll(SQUARE)) if (targets.some((t) => t.dest === sq)) found.add(sq);
  const given = new Set([...prompt.matchAll(UCI_TOKEN), ...prompt.matchAll(SAN_TOKEN), ...prompt.matchAll(SQUARE)].map((m) => m[0]));
  return [...found].filter((f) => !given.has(f));
}
