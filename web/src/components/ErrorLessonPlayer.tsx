import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import type { ErrorLesson } from '../../../src/pedagogy/error-lesson';
import { initLessonState, lessonReducer, type LessonStep } from '../review/lessonFlow';
import { applyUci, lastMoveOf, turnOf } from '../chess';
import { Board } from './Board';
import { Icon } from './Icon';
import '../review-lesson.css';

interface Props {
  lesson: ErrorLesson;
  /** 'full': los 5 momentos. 'pause-only': solo posición y pregunta; sin pausa en la lección llama a onFinish de inmediato. */
  mode?: 'full' | 'pause-only';
  onFinish: () => void;
}

const MOMENTS: { step: Exclude<LessonStep, 'done'>; label: string }[] = [
  { step: 'look', label: 'Posición' },
  { step: 'pause', label: 'Tu turno' },
  { step: 'happened', label: 'Qué pasó' },
  { step: 'why', label: 'Por qué importa' },
  { step: 'best', label: 'Qué debías hacer' },
];

const TONE_BRUSH = { bad: 'red', good: 'green' } as const;

export function ErrorLessonPlayer({ lesson, mode = 'full', onFinish }: Props) {
  const pauseOnly = mode === 'pause-only';
  const [state, dispatch] = useReducer(lessonReducer, lesson, (l) => {
    const s = initLessonState(l);
    return pauseOnly && s.hasPause ? lessonReducer(s, { type: 'next' }) : s;
  });
  const [bestShown, setBestShown] = useState(false);
  const { step, pauseResult, selected } = state;
  const textRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);

  // Al cambiar de momento, si la explicación quedó fuera de la vista (p. ej. se pulsó el botón con el tablero en pantalla),
  // se lleva a la vista: en el móvil está encima del tablero.
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const panel = panelRef.current;
    if (!panel || typeof panel.scrollIntoView !== 'function') return;
    const top = panel.getBoundingClientRect().top;
    const margin = parseFloat(getComputedStyle(panel).scrollMarginTop) || 0;
    if (top < margin || top > window.innerHeight * 0.6) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      panel.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [state.step]);
  const [locked, setLocked] = useState(false);

  // Tras responder la pausa, el botón «Siguiente» aparece donde estaba «Comprobar»: se bloquea un instante
  // para que un doble toque no lo active, y el foco pasa a la explicación.
  useEffect(() => {
    if (step !== 'happened') return;
    textRef.current?.focus({ preventScroll: true });
    if (!pauseResult) return;
    setLocked(true);
    const t = setTimeout(() => setLocked(false), 600);
    return () => clearTimeout(t);
  }, [step, pauseResult]);

  useEffect(() => {
    if (pauseOnly && !state.hasPause) onFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setBestShown(false);
    if (step !== 'best') return;
    const t = setTimeout(() => setBestShown(true), 700);
    return () => clearTimeout(t);
  }, [step]);

  const afterBest = useMemo(() => applyUci(lesson.fenBefore, lesson.best.uci)?.fen ?? null, [lesson]);
  const orientation = turnOf(lesson.fenBefore);

  const shapes: DrawShape[] = useMemo(() => {
    if (step === 'happened') {
      return [
        ...lesson.happened.circles.map((c): DrawShape => ({ orig: c as Key, brush: 'yellow' })),
        ...lesson.happened.arrows.map((a): DrawShape => ({ orig: a.from as Key, dest: a.to as Key, brush: TONE_BRUSH[a.tone] })),
      ];
    }
    if (step === 'best' && bestShown) return [{ orig: lesson.best.uci.slice(0, 2) as Key, dest: lesson.best.uci.slice(2, 4) as Key, brush: 'green' }];
    return [];
  }, [step, bestShown, lesson]);

  const showAfter = step === 'best' && bestShown && afterBest;
  const fen = showAfter ? afterBest : lesson.fenBefore;
  const lastMove = showAfter ? lastMoveOf(lesson.best.uci) : undefined;

  const moments = pauseOnly ? MOMENTS.filter((m) => m.step === 'pause') : MOMENTS.filter((m) => m.step !== 'pause' || state.hasPause);
  const finished = pauseOnly && step === 'happened';
  const current = step === 'done' || finished ? moments.length : moments.findIndex((m) => m.step === step);

  const feedback =
    pauseResult === 'correct'
      ? 'Bien visto. Esa casilla es la clave de esta posición.'
      : pauseResult === 'wrong' || pauseResult === 'skipped'
        ? 'No pasa nada: te lo enseño.'
        : null;

  const heading = finished ? 'Tu turno' : (MOMENTS.find((m) => m.step === step)?.label ?? 'Listo');

  return (
    <section className="rl" aria-label="Mini lección del error">
      <ol className="rl-progress" aria-label="Momentos de la lección">
        {moments.map((m, i) => (
          <li
            key={m.step}
            className={`rl-dot${i < current ? ' is-done' : ''}${i === current ? ' is-current' : ''}`}
            aria-current={i === current ? 'step' : undefined}
            aria-label={`${m.label}: ${i < current ? 'hecho' : i === current ? 'ahora' : 'pendiente'}`}
          >
            {i < current ? <Icon name="check" size={14} /> : <span aria-hidden="true">{i + 1}</span>}
            <span className="rl-dot-label">{m.label}</span>
          </li>
        ))}
      </ol>

      <div className="rl-layout">
        <div className="rl-board">
          <Board
            fen={fen}
            orientation={orientation}
            lastMove={lastMove}
            shapes={shapes}
            label="Tablero de la mini lección"
            interactive={false}
            onSelectSquare={step === 'pause' ? (sq) => dispatch({ type: 'select', square: sq }) : undefined}
            selectedSquare={step === 'pause' ? selected : null}
          />
        </div>

        <div className="rl-panel" ref={panelRef}>
          <h3 className="rl-title">{heading}</h3>
          <div className="rl-text" aria-live="polite" ref={textRef} tabIndex={-1}>
            {step === 'look' && <p>Esta es la posición antes de tu jugada ({lesson.yourMoveSan}). Mírala un momento: ¿qué ves?</p>}
            {step === 'pause' && <p className="rl-question">{lesson.pause?.question}</p>}
            {step === 'pause' && <p className="rl-hint">Toca una casilla del tablero y pulsa «Comprobar». Puedes cambiarla.</p>}
            {step === 'pause' && <p className="rl-selected" aria-live="polite">{selected ? `Has elegido ${selected}` : 'Aún no has elegido casilla'}</p>}
            {(step === 'happened' || finished) && feedback && (
              <p className={`rl-feedback ${pauseResult === 'correct' ? 'is-good' : 'is-kind'}`}>
                <Icon name={pauseResult === 'correct' ? 'check' : 'bulb'} size={18} /> {feedback}
              </p>
            )}
            {step === 'happened' && !finished && <p>{lesson.happened.text}</p>}
            {step === 'why' && <p>{lesson.why}</p>}
            {step === 'best' && (
              <>
                <p>{lesson.best.text}</p>
                <p className="rl-rule">
                  <span className="rl-rule-tag">La regla</span>
                  {lesson.rule}
                </p>
              </>
            )}
            {step === 'done' && <p>Lección terminada.</p>}
          </div>
        </div>

        {/* Fuera del panel para poder fijarse abajo en el móvil mientras se mira el tablero. */}
        <div className="rl-actions">
          {step === 'pause' && (
            <>
              <button type="button" className="t-btn t-btn-primary rl-btn" disabled={!selected} onClick={() => dispatch({ type: 'confirm' })}>
                Comprobar
              </button>
              <button type="button" className="t-btn rl-btn" onClick={() => dispatch({ type: 'skip' })}>
                No lo sé, enséñamelo
              </button>
            </>
          )}
          {finished && (
            <button type="button" className="t-btn t-btn-primary rl-btn" onClick={onFinish}>
              Continuar
            </button>
          )}
          {(step === 'look' || step === 'happened' || step === 'why') && !finished && (
            <button type="button" className="t-btn t-btn-primary rl-btn" disabled={locked} onClick={() => dispatch({ type: 'next' })}>
              Siguiente
            </button>
          )}
          {step === 'best' && (
            <button type="button" className="t-btn t-btn-primary rl-btn" onClick={onFinish}>
              Terminar
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
