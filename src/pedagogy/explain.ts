import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import { parseUci } from 'chessops/util';
import type { AnalyzedMove, Diagnosis, Explanation, Level } from '../types.js';
import { CONCEPTS } from './concepts.js';

/** Sin diagnóstico no hay concepto: id reservado para el análisis puro del motor. */
export const ENGINE_ONLY_CONCEPT_ID = 'engine.analysis';

const PIECE_ES: Record<string, { name: string; article: string }> = {
  pawn: { name: 'peón', article: 'el' },
  knight: { name: 'caballo', article: 'el' },
  bishop: { name: 'alfil', article: 'el' },
  rook: { name: 'torre', article: 'la' },
  queen: { name: 'dama', article: 'la' },
  king: { name: 'rey', article: 'el' },
};

function pieceName(p: string): string {
  return PIECE_ES[p]?.name ?? p;
}

function withArticle(p: string): string {
  const e = PIECE_ES[p];
  return e ? `${e.article} ${e.name}` : p;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pawnsText(cp: number): string {
  const n = Math.round((Math.abs(cp) / 100) * 10) / 10;
  const txt = String(n).replace('.', ',');
  return n === 1 ? '1 peón' : `${txt} peones`;
}

/** SAN de un UCI en la posición dada; undefined si no es legal ahí. */
function sanIn(fen: string, uci: string): string | undefined {
  try {
    const setup = parseFen(fen).unwrap();
    const pos = Chess.fromSetup(setup).unwrap();
    const move = parseUci(uci);
    if (!move || !pos.isLegal(move)) return undefined;
    return makeSan(pos, move);
  } catch {
    return undefined;
  }
}

function refutationSan(d: Diagnosis, move: AnalyzedMove): string | undefined {
  const uci = d.evidence.refutationUci;
  if (!uci) return undefined;
  return sanIn(move.fenAfter, uci) ?? sanIn(move.fenBefore, uci) ?? uci;
}

function buildValues(d: Diagnosis, move: AnalyzedMove): Record<string, string | undefined> {
  const ev = d.evidence;
  const first = ev.pieces[0];
  const pieza = first ? withArticle(first) : undefined;
  return {
    hecho: d.fact,
    jugada: move.san,
    mejor: move.bestSan,
    pieza,
    Pieza: pieza ? capitalize(pieza) : undefined,
    piezas: ev.pieces.length ? joinList(ev.pieces.map(pieceName)) : undefined,
    casilla: ev.squares[0],
    casillas: ev.squares.length ? joinList(ev.squares) : undefined,
    refutacion: refutationSan(d, move),
    perdida: ev.materialLostCp !== undefined ? pawnsText(ev.materialLostCp) : undefined,
  };
}

/**
 * Rellena la plantilla. Cada línea con un placeholder sin dato se elimina entera,
 * así el texto nunca afirma nada que no esté en el diagnóstico.
 */
function fillTemplate(template: string, values: Record<string, string | undefined>): string {
  const lines: string[] = [];
  for (const line of template.split('\n')) {
    let complete = true;
    const filled = line.replace(/\{(\w+)\}/g, (_m, key: string) => {
      const v = values[key];
      if (v === undefined || v === '') {
        complete = false;
        return '';
      }
      return v;
    });
    if (complete && filled.trim()) lines.push(filled.trim());
  }
  return lines.join('\n');
}

/** ¿El motor ve mate contra quien jugó tras su jugada? (dato verificado del motor) */
function mateAgainstMover(move: AnalyzedMove): number | undefined {
  const m = move.scoreAfter.mate;
  if (m === undefined) return undefined;
  const against = move.color === 'white' ? m < 0 : m > 0;
  return against ? Math.abs(m) : undefined;
}

/** Línea con la mejor alternativa del motor y la pérdida (solo datos de Capa 1). */
function engineLine(move: AnalyzedMove, level: Level): string {
  const mate = mateAgainstMover(move);
  const loss =
    mate !== undefined
      ? `tras tu jugada el motor ve mate en ${mate} para el rival`
      : `tu jugada pierde unos ${pawnsText(move.cpLoss)} de evaluación respecto a la mejor`;
  switch (level) {
    case 'beginner':
      return `Una jugada mejor era ${move.bestSan}.`;
    case 'initiation':
      return `Mejor alternativa del motor: ${move.bestSan}.`;
    case 'basic':
      return `Mejor alternativa del motor: ${move.bestSan}. Con ${move.san}, ${loss}.`;
    default:
      return `Alternativa del motor: ${move.bestSan}; con ${move.san}, ${loss}.`;
  }
}

/**
 * Capa 3. Con diagnóstico: plantilla del concepto para el nivel rellenada con la evidencia.
 * Sin diagnóstico: reconoce la limitación y solo muestra el análisis verificado del motor.
 */
export function explain(d: Diagnosis | null, move: AnalyzedMove, level: Level): Explanation {
  if (d === null) {
    const intro: Record<Level, string> = {
      beginner: 'Esta jugada no fue la mejor, pero todavía no sé explicarte el motivo con seguridad.',
      initiation: 'Esta jugada no fue la mejor, pero no puedo explicarte la causa con seguridad.',
      basic: 'No he podido determinar con certeza la causa de este error, así que no la voy a suponer.',
      intermediate:
        'No he podido determinar la causa con certeza; muestro solo lo que el motor ha verificado.',
      advanced:
        'La causa no se ha podido determinar con fiabilidad; esto es únicamente el análisis del motor.',
      competitive:
        'Sin causa verificada: se muestra solo el análisis del motor, sin interpretación táctica.',
    };
    return {
      conceptId: ENGINE_ONLY_CONCEPT_ID,
      level,
      title: 'Análisis del motor',
      text: `${intro[level]}\n${engineLine(move, level)}`,
      verified: false,
    };
  }

  const conceptId = d.conceptIds[0] ?? `tactics.${d.type}`;
  const concept = CONCEPTS.find((c) => c.id === conceptId);
  if (!concept) {
    // Concepto desconocido: mismo trato que sin diagnóstico, pero conservando el hecho verificado.
    return {
      conceptId,
      level,
      title: 'Análisis',
      text: `${d.fact}\n${engineLine(move, level)}`,
      verified: true,
    };
  }

  const body = fillTemplate(concept.explanations[level], buildValues(d, move));
  return {
    conceptId: concept.id,
    level,
    title: concept.name,
    text: `${body}\n${engineLine(move, level)}`,
    verified: true,
  };
}
