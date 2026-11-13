import { useEffect, useMemo, useState } from 'react';
import type { DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import { buildReport, ReportError } from '../../../src/review/report';
import { keyErrors } from '../../../src/review/select';
import type { GameAnalysis, KeyError, Report, ReviewGame } from '../../../src/review/types';
import { buildErrorLesson } from '../../../src/pedagogy/error-lesson';
import { ruleFor } from '../../../src/pedagogy/review-copy';
import { lessonsForConcept } from '../../../src/content';
import type { Level } from '../../../src/types';
import { navigate } from '../router';
import { Link } from '../components/Link';
import { Icon } from '../components/Icon';
import { Board } from '../components/Board';
import { ErrorLessonPlayer } from '../components/ErrorLessonPlayer';
import { useSession } from '../session';
import { NO_STRENGTHS, RESULT_WORD, conceptShort, conceptTitle, headline, inGames, strengthSentence } from '../review/summary';

const MAX_PRACTICE = 5;
const RESULT_ICON = { win: 'check', draw: 'minus', loss: 'x' } as const;

function safeReport(analyses: GameAnalysis[], games: ReviewGame[]): Report | null {
  try {
    return buildReport(analyses, games);
  } catch (e) {
    if (e instanceof ReportError) return null;
    throw e;
  }
}

function Strip({ report }: { report: Report }) {
  return (
    <ol className="rp-strip" aria-label="Resultado de cada partida">
      {report.games.map((g, i) => (
        <li key={g.id} className={`rp-cell rp-${g.result}`} aria-label={`Partida ${i + 1}: ${RESULT_WORD[g.result]}`}>
          <span className="rp-mark" aria-hidden="true">
            <Icon name={RESULT_ICON[g.result]} size={16} />
          </span>
          <span className="rp-n" aria-hidden="true">{i + 1}</span>
        </li>
      ))}
    </ol>
  );
}

function StarBoard({ err, level }: { err: KeyError; level: Level }) {
  const lesson = useMemo(() => buildErrorLesson(err, level), [err, level]);
  const shapes: DrawShape[] = useMemo(
    () => [
      ...lesson.happened.circles.map((c): DrawShape => ({ orig: c as Key, brush: 'yellow' })),
      ...lesson.happened.arrows.filter((a) => a.tone === 'bad').map((a): DrawShape => ({ orig: a.from as Key, dest: a.to as Key, brush: 'red' })),
    ],
    [lesson],
  );
  return (
    <div className="rp-star">
      <div className="rp-board">
        <Board fen={lesson.fenBefore} orientation={err.move.color} shapes={shapes} label="Posición de tu error más repetido, antes de tu jugada" />
      </div>
      <div className="rp-star-text">
        <p>{lesson.happened.text}</p>
        <p className="muted">Tu jugada fue {lesson.yourMoveSan}, en la jugada {Math.ceil(err.move.ply / 2)}.</p>
      </div>
    </div>
  );
}

function Practice({ errors, level }: { errors: KeyError[]; level: Level }) {
  const [p, setP] = useState<number | null>(null);
  const lesson = useMemo(() => {
    if (p === null || !errors[p]) return null;
    try {
      return buildErrorLesson(errors[p]!, level);
    } catch {
      return null;
    }
  }, [p, errors, level]);
  const advance = () => setP((v) => (v === null ? v : v + 1));

  useEffect(() => {
    // Una posición que no se pudo construir se salta sola.
    if (p !== null && p < errors.length && !lesson) advance();
  }, [p, lesson, errors.length]);

  if (errors.length === 0) return null;
  if (p === null)
    return (
      <div className="rp-step">
        <span className="rp-step-ic" aria-hidden="true">2</span>
        <div className="rp-step-body">
          <strong>Practica con {errors.length === 1 ? 'una posición tuya' : `${errors.length} posiciones tuyas`}</strong>
          <span className="muted">Sacadas de tus propias partidas: toca la casilla clave.</span>
        </div>
        <button type="button" className="t-btn t-btn-secondary t-btn-sm" onClick={() => setP(0)}>
          Empezar
        </button>
      </div>
    );
  if (p >= errors.length)
    return (
      <p className="rp-done" role="status">
        <Icon name="check" size={18} /> Has repasado tus posiciones. Juega una partida pensando en tu regla.
      </p>
    );
  return (
    <div className="rp-practice">
      <p className="rg-progress" aria-live="polite">Posición {p + 1} de {errors.length}</p>
      {lesson && <ErrorLessonPlayer key={p} lesson={lesson} mode="pause-only" onFinish={advance} />}
    </div>
  );
}

export function ReportScreen({ games, analyses }: { games: ReviewGame[]; analyses: GameAnalysis[] }) {
  const { level } = useSession();
  const report = useMemo(() => (analyses.length >= 3 ? safeReport(analyses, games.slice(0, analyses.length)) : null), [analyses, games]);

  useEffect(() => {
    if (!report) navigate('/partidas', { replace: true });
  }, [report]);

  const practiceErrors = useMemo(() => {
    const rule = report?.ruleConceptId;
    if (!report || !rule) return [];
    const star = report.starError;
    const same = (e: KeyError) => !!star && e.gameId === star.gameId && e.move.ply === star.move.ply;
    const rest = analyses.flatMap((a) => keyErrors(a)).filter((e) => e.diagnosis.conceptIds.includes(rule) && !same(e));
    return [...(star ? [star] : []), ...rest].slice(0, MAX_PRACTICE);
  }, [report, analyses]);

  if (!report) return null;
  const total = report.games.length;
  const top = report.weaknesses.slice(0, 2);
  const rule = report.ruleConceptId;
  const lessons = rule ? lessonsForConcept(rule) : [];
  const topWeak = report.weaknesses[0];
  const strengths = report.strengths.map(strengthSentence);
  const { wins, draws, losses } = report.counts;

  return (
    <div className="rp">
      <section className="t-card rp-card" aria-labelledby="rp-title">
        <h1 id="rp-title" className="rp-big">Tu informe de las últimas {total} partidas</h1>
        <p className="rp-lead">{headline(report)}</p>
        <Strip report={report} />
        <ul className="rp-chips" aria-label="Resumen de resultados">
          <li className="rp-chip rp-chip-win">{wins} {wins === 1 ? 'ganada' : 'ganadas'}</li>
          <li className="rp-chip">{draws} {draws === 1 ? 'empatada' : 'empatadas'}</li>
          <li className="rp-chip rp-chip-loss">{losses} {losses === 1 ? 'perdida' : 'perdidas'}</li>
        </ul>
      </section>

      <div className="rp-two">
        <section className="t-card rp-card" aria-labelledby="rp-good">
          <h2 id="rp-good" className="rp-sec rp-sec-ok">Lo que ya haces bien</h2>
          {strengths.length === 0 ? <p className="rp-lead">{NO_STRENGTHS}</p> : strengths.map((s) => <p key={s} className="rp-lead">{s}</p>)}
        </section>
        <section className="t-card rp-card" aria-labelledby="rp-bad">
          <h2 id="rp-bad" className="rp-sec rp-sec-bad">Lo que más te cuesta</h2>
          {top.length === 0 ? (
            <p className="rp-lead">No encontré errores graves con una causa clara en estas partidas.</p>
          ) : (
            <ul className="rp-list">
              {top.map((w) => (
                <li key={w.conceptId}>
                  <strong>{conceptTitle(w.conceptId)}</strong>
                  <span className="muted"> {inGames(w.games, total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {report.starError && rule && topWeak && (
        <>
          <section className="t-card rp-card" aria-labelledby="rp-star">
            <h2 id="rp-star" className="rp-sec">Tu error más repetido</h2>
            <p className="rp-lead">
              <strong>{conceptTitle(rule)}</strong>, {inGames(topWeak.games, total)}. Este es el que más te costó:
            </p>
            <StarBoard err={report.starError} level={level} />
          </section>

          <section className="rp-rule" aria-labelledby="rp-rule">
            <h2 id="rp-rule" className="rp-rule-tag">Tu regla</h2>
            <p className="rp-rule-text">{ruleFor(rule)}</p>
            <p className="rp-rule-sub">Es la única regla que necesitas para tus próximas partidas.</p>
          </section>

          <section className="t-card rp-card" aria-labelledby="rp-practice">
            <h2 id="rp-practice" className="rp-sec">Para practicarla</h2>
            {lessons.length > 0 && (
              <div className="rp-step">
                <span className="rp-step-ic" aria-hidden="true">1</span>
                <div className="rp-step-body">
                  <strong>{lessons[0]!.title}</strong>
                  <span className="muted">Lección sobre {conceptShort(rule)}</span>
                </div>
                <Link className="t-btn t-btn-primary t-btn-sm" href={`/leccion/${lessons[0]!.id}`}>
                  Ir a la lección
                </Link>
              </div>
            )}
            <Practice errors={practiceErrors} level={level} />
          </section>
        </>
      )}

      <div className="rv-actions">
        <Link className="t-btn t-btn-secondary" href="/partidas">
          <Icon name="back" size={20} />
          Volver a mis partidas
        </Link>
      </div>
    </div>
  );
}
