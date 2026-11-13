import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameAnalysis, ReviewGame } from '../../../src/review/types';
import { keyErrors } from '../../../src/review/select';
import { buildErrorLesson } from '../../../src/pedagogy/error-lesson';
import { navigate } from '../router';
import { Link } from '../components/Link';
import { Icon } from '../components/Icon';
import { ErrorLessonPlayer } from '../components/ErrorLessonPlayer';
import { GameViewer } from '../components/GameViewer';
import { indexBeforePly } from '../review/gameViewer';
import { useSession } from '../session';
import { reportReviewed } from '../review/completion';
import { RESULT_WORD } from '../review/summary';

interface Props {
  index: number;
  game?: ReviewGame;
  analysis?: GameAnalysis;
  /** Se llama al terminar el repaso, antes de volver a la lista. */
  onReviewed?: (index: number) => void;
}

export function ReviewGameScreen({ index, game, analysis, onReviewed }: Props) {
  const { level } = useSession();
  const errors = useMemo(() => (analysis ? keyErrors(analysis) : []), [analysis]);
  const [i, setI] = useState(0);
  const finished = useRef(false);
  /** Posición con la que está abierto el visor de la partida; null = cerrado. */
  const [view, setView] = useState<number | null>(null);

  // Una sola lección a la vez: las comprobaciones de unicidad son costosas.
  const lesson = useMemo(() => {
    const err = errors[i];
    if (!err) return null;
    try {
      return buildErrorLesson(err, level);
    } catch {
      return null;
    }
  }, [errors, i, level]);

  function finish() {
    if (finished.current || !game) return;
    finished.current = true;
    reportReviewed(game.id, [...new Set(errors.flatMap((e) => e.diagnosis.conceptIds))]);
    onReviewed?.(index);
    navigate('/partidas');
  }

  const next = () => (i + 1 < errors.length ? setI(i + 1) : finish());

  // Si la lección de un error no se pudo construir, se pasa al siguiente sin bloquear.
  useEffect(() => {
    if (errors.length > 0 && !lesson) next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  const back = (
    <Link className="t-btn t-btn-secondary" href="/partidas">
      <Icon name="back" size={20} />
      Volver a mis partidas
    </Link>
  );

  if (!game || !analysis) {
    return (
      <section className="t-card rv-card" aria-labelledby="rg-title">
        <h1 id="rg-title">Partida {index}</h1>
        <p>Esta partida todavía no está analizada. Analiza tus partidas primero.</p>
        <div className="rv-actions">{back}</div>
      </section>
    );
  }

  const heading = (
    <header className="rg-head">
      <h1 id="rg-title">Partida {index}</h1>
      <p className="muted">
        {[RESULT_WORD[game.result], game.color === 'white' ? 'con blancas' : 'con negras', game.opening].filter(Boolean).join(' · ')}
      </p>
    </header>
  );

  if (errors.length === 0) {
    return (
      <section className="t-card rv-card" aria-labelledby="rg-title">
        {heading}
        <p>No encontré errores graves que enseñarte en esta partida. Buen trabajo.</p>
        <div className="rv-actions">
          <button type="button" className="t-btn t-btn-primary" onClick={finish}>
            Continuar
          </button>
          {back}
        </div>
      </section>
    );
  }

  return (
    <section className="rg" aria-labelledby="rg-title">
      {/* La lección sigue montada (solo oculta) mientras se ve la partida, para no perder su paso ni su pausa. */}
      <div className="rg" hidden={view !== null}>
        <div className="t-card rv-card">
          {heading}
          <p className="rg-progress" aria-live="polite">
            Error {i + 1} de {errors.length}
          </p>
          <div className="rv-actions">
            <button type="button" className="t-btn t-btn-secondary t-btn-sm" onClick={() => setView(0)}>
              <Icon name="eye" size={20} />
              Ver la partida
            </button>
          </div>
        </div>
        {lesson && <ErrorLessonPlayer key={`${game.id}-${i}`} lesson={lesson} onFinish={next} />}
        {lesson && errors[i] && (
          <div className="rv-actions">
            <button type="button" className="t-btn t-btn-secondary t-btn-sm" onClick={() => setView(indexBeforePly(analysis.moves, errors[i]!.move.ply))}>
              <Icon name="eye" size={20} />
              Ver cómo se llegó aquí
            </button>
          </div>
        )}
      </div>
      {view !== null && <GameViewer analysis={analysis} startIndex={view} onClose={() => setView(null)} />}
    </section>
  );
}
