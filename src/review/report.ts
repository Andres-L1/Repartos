import { keyErrors } from './select.js';
import type { AnalyzedMove } from '../types.js';
import type { GameAnalysis, KeyError, Phase, Report, ReviewGame, Strength } from './types.js';

export const MIN_GAMES = 3;
const MIN_PHASE_MOVES = 15;
const MIN_ACCURACY = 0.75;
const MIN_TREND_GAMES = 8;
const TREND_WINDOW = 5;
const TREND_DROP = 0.2;

/** Se lanza cuando no hay partidas suficientes para un informe. */
export class ReportError extends Error {
  readonly code = 'not-enough-games' as const;
  constructor(readonly available: number) {
    super(`Se necesitan al menos ${MIN_GAMES} partidas y hay ${available}.`);
    this.name = 'ReportError';
  }
}

function phaseOf(ply: number): Phase {
  return ply <= 20 ? 'opening' : ply <= 60 ? 'middlegame' : 'endgame';
}

const isError = (m: AnalyzedMove) => m.classification === 'mistake' || m.classification === 'blunder';
const studentMoves = (a: GameAnalysis) => a.moves.filter((m) => m.color === a.color);

function errorRate(moves: AnalyzedMove[]): number {
  return moves.length === 0 ? 0 : moves.filter(isError).length / moves.length;
}

function computeStrengths(analyses: GameAnalysis[], games: ReviewGame[]): Strength[] {
  const strengths: Strength[] = [];
  const all = analyses.flatMap(studentMoves);
  if (all.length === 0) return strengths;
  const overall = errorRate(all);

  for (const phase of ['opening', 'middlegame', 'endgame'] as const) {
    const inPhase = all.filter((m) => phaseOf(m.ply) === phase);
    if (inPhase.length < MIN_PHASE_MOVES) continue;
    const rate = errorRate(inPhase);
    if (rate <= overall / 2) strengths.push({ kind: 'phase', phase, value: rate });
  }

  const good = all.filter((m) => m.classification === 'best' || m.classification === 'good').length / all.length;
  if (good >= MIN_ACCURACY) strengths.push({ kind: 'accuracy', value: good });

  if (analyses.length >= MIN_TREND_GAMES) {
    const created = new Map(games.map((g) => [g.id, g.createdAt]));
    const dated = analyses.filter((a) => created.has(a.gameId));
    if (dated.length >= MIN_TREND_GAMES) {
      const sorted = [...dated].sort((x, y) => created.get(x.gameId)! - created.get(y.gameId)!);
      const first = errorRate(sorted.slice(0, TREND_WINDOW).flatMap(studentMoves));
      const last = errorRate(sorted.slice(-TREND_WINDOW).flatMap(studentMoves));
      if (first > 0 && last <= first * (1 - TREND_DROP)) {
        strengths.push({ kind: 'trend', value: (first - last) / first });
      }
    }
  }
  return strengths;
}

export function buildReport(analyses: GameAnalysis[], games: ReviewGame[]): Report {
  if (analyses.length < MIN_GAMES) throw new ReportError(analyses.length);

  const counts = { wins: 0, draws: 0, losses: 0 };
  for (const g of games) {
    if (g.result === 'win') counts.wins++;
    else if (g.result === 'draw') counts.draws++;
    else counts.losses++;
  }

  // Cada concepto cuenta una vez por partida; las apariciones cuentan cada error.
  const stats = new Map<string, { games: Set<string>; occurrences: number }>();
  const byConcept = new Map<string, KeyError[]>();
  for (const a of analyses) {
    for (const ke of keyErrors(a)) {
      for (const conceptId of ke.diagnosis.conceptIds) {
        const s = stats.get(conceptId) ?? { games: new Set<string>(), occurrences: 0 };
        s.games.add(a.gameId);
        s.occurrences++;
        stats.set(conceptId, s);
        byConcept.set(conceptId, [...(byConcept.get(conceptId) ?? []), ke]);
      }
    }
  }
  const weaknesses = [...stats.entries()]
    .map(([conceptId, s]) => ({ conceptId, games: s.games.size, occurrences: s.occurrences }))
    .sort((x, y) => y.games - x.games || y.occurrences - x.occurrences || x.conceptId.localeCompare(y.conceptId));

  const report: Report = {
    games: games.map((g) => ({ id: g.id, result: g.result })),
    counts,
    strengths: computeStrengths(analyses, games),
    weaknesses,
  };
  if (weaknesses.length > 0) {
    const top = weaknesses[0]!.conceptId;
    report.ruleConceptId = top;
    report.starError = [...byConcept.get(top)!].sort(
      (x, y) => y.move.cpLoss - x.move.cpLoss || x.gameId.localeCompare(y.gameId) || x.move.ply - y.move.ply,
    )[0];
  }
  return report;
}
