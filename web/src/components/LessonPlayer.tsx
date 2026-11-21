import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lesson } from '../../../src/content/schema';
import type { LessonProgress, Profile } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { useSession } from '../session';
import { rewardLines } from '../shop';
import { navigate } from '../router';
import { Board, marksToShapes } from './Board';
import { PracticeBoard, type StepResult } from './PracticeBoard';
import { turnOf } from '../chess';
import { Icon } from './Icon';
import { Coin } from './ShopVisuals';
import { playSound } from '../sound';
import { stepStartVisible } from '../headerHeight';

type Phase =
  | { kind: 'intro' }
  | { kind: 'explain'; i: number }
  | { kind: 'practice'; i: number }
  | { kind: 'evaluation'; i: number }
  | { kind: 'result' };

interface Outcome {
  correct: number;
  total: number;
  passed: boolean;
  profile?: Profile;
  chedexEarned?: number;
  protectorUsed?: boolean;
  progress?: LessonProgress;
  error?: string;
}

const STAGES = ['Introducción', 'Explicación', 'Práctica', 'Evaluación'] as const;

/** Foco al montar sin desplazar la página (autoFocus de React sí desplaza y dejaba el tablero bajo la cabecera). */
const focusNoScroll = (el: HTMLElement | null) => el?.focus({ preventScroll: true });

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { refreshShop } = useSession();
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const [evalResults, setEvalResults] = useState<boolean[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [saving, setSaving] = useState(false);
  const [run, setRun] = useState(0);
  // Un doble toque en «Ver resultado» no debe guardar dos veces; y si el guardado falla, se conservan los aciertos para reintentarlo sin repetir la lección.
  const inFlight = useRef(false);
  const lastResults = useRef<boolean[]>([]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const stepKey = `${run}-${phase.kind}-${'i' in phase ? phase.i : 0}`;
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const el = bodyRef.current;
    if (!el) return;
    const css = getComputedStyle(document.documentElement);
    const px = (v: string) => parseFloat(css.getPropertyValue(v)) || 0;
    const bottomNav = px('--bottom-nav') || (document.querySelector('.side-nav')?.getBoundingClientRect().height ?? 0);
    if (!stepStartVisible(el.getBoundingClientRect().top, px('--header-h'), window.innerHeight, window.matchMedia('(max-width: 899px)').matches ? bottomNav : 0)) {
      el.scrollIntoView({ block: 'start' });
    }
  }, [stepKey]);

  const total = lesson.evaluation.length;
  const passMark = lesson.passMark ?? Math.max(1, total - 1);

  const stageIndex =
    phase.kind === 'intro' ? 0 : phase.kind === 'explain' ? 1 : phase.kind === 'practice' ? 2 : phase.kind === 'evaluation' ? 3 : 4;

  const stepCount =
    phase.kind === 'explain'
      ? lesson.explanation.length
      : phase.kind === 'practice'
        ? lesson.practice.length
        : phase.kind === 'evaluation'
          ? lesson.evaluation.length
          : 0;
  const stepNo = phase.kind === 'explain' || phase.kind === 'practice' || phase.kind === 'evaluation' ? phase.i + 1 : 0;

  // progreso global: pasos totales
  const totalSteps = 1 + lesson.explanation.length + lesson.practice.length + lesson.evaluation.length;
  const doneSteps =
    phase.kind === 'intro'
      ? 0
      : phase.kind === 'explain'
        ? 1 + phase.i
        : phase.kind === 'practice'
          ? 1 + lesson.explanation.length + phase.i
          : phase.kind === 'evaluation'
            ? 1 + lesson.explanation.length + lesson.practice.length + phase.i
            : totalSteps;
  const pct = Math.round((doneSteps / totalSteps) * 100);

  function toExplain() {
    if (lesson.explanation.length) setPhase({ kind: 'explain', i: 0 });
    else toPractice();
  }
  function toPractice() {
    if (lesson.practice.length) setPhase({ kind: 'practice', i: 0 });
    else toEval();
  }
  function toEval() {
    setEvalResults([]);
    if (lesson.evaluation.length) setPhase({ kind: 'evaluation', i: 0 });
    else void finish([]);
  }

  async function finish(results: boolean[]) {
    if (inFlight.current) return;
    inFlight.current = true;
    lastResults.current = results;
    const correct = results.filter(Boolean).length;
    const passed = correct >= passMark;
    setPhase({ kind: 'result' });
    setSaving(true);
    const mistakes = correct < total ? [...new Set(lesson.conceptIds ?? [])] : [];
    try {
      const r = await api.complete(lesson.id, { correct, total, mistakes });
      setOutcome({
        correct,
        total,
        passed: r.progress.completed,
        profile: r.profile,
        progress: r.progress,
        ...(r.chedexEarned !== undefined ? { chedexEarned: r.chedexEarned } : {}),
        ...(r.protectorUsed !== undefined ? { protectorUsed: r.protectorUsed } : {}),
      });
      if (r.chedexEarned || r.protectorUsed) void refreshShop();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setOutcome({
        correct,
        total,
        passed,
        error: e instanceof ApiError ? e.message : 'No se pudo guardar tu progreso.',
      });
    } finally {
      setSaving(false);
      inFlight.current = false;
    }
  }

  function restart() {
    setOutcome(null);
    setEvalResults([]);
    setRun((r) => r + 1);
    setPhase({ kind: 'intro' });
  }

  return (
    <article className="lesson" aria-labelledby="lesson-title">
      <header className="lesson-head">
        <button className="t-btn t-btn-ghost t-btn-sm" aria-label="Salir de la lección" onClick={() => navigate('/aprender')}>
          <Icon name="back" size={18} />
          Salir
        </button>
        <div className="lesson-head-main">
          <h1 id="lesson-title">{lesson.title}</h1>
          <div
            className="t-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Progreso de la lección"
          >
            <div className="t-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="lesson-pct" aria-hidden="true">
          {pct}%
        </span>
      </header>

      {phase.kind !== 'result' && (
        <ol className="stages" aria-label="Fases de la lección">
          {STAGES.map((s, i) => (
            <li
              key={s}
              className={i === stageIndex ? 'stage current' : i < stageIndex ? 'stage done' : 'stage'}
              aria-current={i === stageIndex ? 'step' : undefined}
            >
              <span className="stage-n" aria-hidden="true">
                {i < stageIndex ? <Icon name="check" size={14} /> : i + 1}
              </span>
              <span className="stage-label">{s}</span>
              {i === stageIndex && stepCount > 1 && (
                <span className="stage-count">
                  {' '}
                  ({stepNo}/{stepCount})
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="lesson-body" ref={bodyRef} key={stepKey}>
        {phase.kind === 'intro' && (
          <section className="t-card intro">
            <p className="kicker">
              <Icon name="target" size={16} /> Objetivo
            </p>
            <h2>{lesson.objective}</h2>
            <p className="lead">{lesson.intro}</p>
            <button className="t-btn t-btn-primary" onClick={toExplain} ref={focusNoScroll}>
              Empezar
            </button>
          </section>
        )}

        {phase.kind === 'explain' && <ExplainStepView lesson={lesson} i={phase.i} onNext={() => (phase.i + 1 < lesson.explanation.length ? setPhase({ kind: 'explain', i: phase.i + 1 }) : toPractice())} onPrev={phase.i > 0 ? () => setPhase({ kind: 'explain', i: phase.i - 1 }) : undefined} />}

        {phase.kind === 'practice' && (
          <PracticeBoard
            step={lesson.practice[phase.i]!}
            mode="practice"
            explain={{ lessonId: lesson.id, stepKind: 'practice', stepIndex: phase.i }}
            isLast={phase.i + 1 >= lesson.practice.length}
            onDone={() => (phase.i + 1 < lesson.practice.length ? setPhase({ kind: 'practice', i: phase.i + 1 }) : toEval())}
          />
        )}

        {phase.kind === 'evaluation' && (
          <PracticeBoard
            step={lesson.evaluation[phase.i]!}
            mode="evaluation"
            explain={{ lessonId: lesson.id, stepKind: 'evaluation', stepIndex: phase.i }}
            isLast={phase.i + 1 >= lesson.evaluation.length}
            onDone={(r: StepResult) => {
              const next = [...evalResults, r.ok];
              setEvalResults(next);
              if (phase.i + 1 < lesson.evaluation.length) setPhase({ kind: 'evaluation', i: phase.i + 1 });
              else void finish(next);
            }}
          />
        )}

        {phase.kind === 'result' && (
          <ResultView lesson={lesson} saving={saving} outcome={outcome} passMark={passMark} onRestart={restart} onRetrySave={() => void finish(lastResults.current)} />
        )}
      </div>
    </article>
  );
}

function ExplainStepView({ lesson, i, onNext, onPrev }: { lesson: Lesson; i: number; onNext(): void; onPrev: (() => void) | undefined }) {
  const step = lesson.explanation[i]!;
  const shapes = useMemo(() => marksToShapes(step), [step]);
  const last = i + 1 >= lesson.explanation.length;
  return (
    <div className="step-layout">
      <div className="step-board">
        <Board fen={step.fen} orientation={turnOf(step.fen)} shapes={shapes} label="Tablero de la explicación" />
      </div>
      <div className="step-side">
        <p className="step-kicker">
          <Icon name="eye" size={16} /> Explicación
        </p>
        <p className="step-text">{step.text}</p>
        {(step.squares?.length || step.arrows?.length) && (
          <p className="muted note-marks">Las casillas y flechas verdes del tablero señalan lo importante.</p>
        )}
        <div className="actions">
          {onPrev && (
            <button className="t-btn t-btn-ghost" onClick={onPrev}>
              Anterior
            </button>
          )}
          <button className="t-btn t-btn-primary" onClick={onNext} ref={focusNoScroll}>
            {last ? 'Pasar a la práctica' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultView({
  lesson,
  saving,
  outcome,
  passMark,
  onRestart,
  onRetrySave,
}: {
  lesson: Lesson;
  saving: boolean;
  outcome: Outcome | null;
  passMark: number;
  onRestart(): void;
  onRetrySave(): void;
}) {
  const [nextId, setNextId] = useState<string | null>(null);
  const passed = outcome?.passed === true;
  // Un solo sonido de victoria al completar la lección (nunca al suspender).
  useEffect(() => {
    if (!saving && passed && !outcome?.error) playSound('victory');
  }, [saving, passed, outcome?.error]);
  useEffect(() => {
    if (saving || !passed) return;
    let live = true;
    api
      .map()
      .then((r) => {
        const lessons = [...r.units].sort((a, b) => a.order - b.order).flatMap((u) => (u.status === 'locked' ? [] : u.lessons));
        const at = lessons.findIndex((l) => l.id === lesson.id);
        const open = (l: { id: string; status: string }) => l.status === 'available' && l.id !== lesson.id;
        const next = lessons.slice(at + 1).find(open) ?? lessons.find(open);
        if (live) setNextId(next?.id ?? null);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [saving, passed, lesson.id]);

  if (saving || !outcome) {
    return (
      <section className="t-card result" aria-busy="true">
        <span className="spinner" aria-hidden="true" />
        <p role="status">Guardando tu resultado…</p>
      </section>
    );
  }
  const { correct, total } = outcome;
  return (
    <section className="t-card result" aria-live="polite">
      <p className={`result-icon${passed ? ' result-pass' : ' result-retry'}`} aria-hidden="true">
        <Icon name={passed ? 'check' : 'repeat'} size={44} />
      </p>
      <h2>{outcome.error ? 'No se ha guardado tu resultado' : passed ? 'Lección completada' : 'Casi lo tienes'}</h2>
      <p className="lead">
        Aciertos en la evaluación: <strong>{correct} de {total}</strong>.
        {!passed && ` Necesitas al menos ${passMark} para completarla; puedes repasar y volver a intentarlo cuando quieras.`}
      </p>
      {outcome.profile && passed && (
        <p className="result-streak">
          <Icon name="flame" size={18} /> Racha actual:{' '}
          <strong>
            {outcome.profile.streakDays} {outcome.profile.streakDays === 1 ? 'día' : 'días'}
          </strong>
        </p>
      )}
      {passed &&
        rewardLines(outcome.chedexEarned, outcome.protectorUsed, outcome.profile?.streakDays).map((line) => (
          <p key={line} className="result-reward">
            <Coin size={22} />
            <span>{line}</span>
          </p>
        ))}
      {outcome.error && (
        <>
          <p className="field-error" role="alert">
            {outcome.error} Tus aciertos siguen aquí: pulsa «Guardar de nuevo» para no repetir la lección.
          </p>
          <div className="actions">
            <button className="t-btn t-btn-primary" onClick={onRetrySave} ref={focusNoScroll}>
              Guardar de nuevo
            </button>
          </div>
        </>
      )}
      <div className="actions">
        {passed && nextId ? (
          <button className="t-btn t-btn-primary" onClick={() => navigate(`/leccion/${encodeURIComponent(nextId)}`)} ref={outcome.error ? undefined : focusNoScroll}>
            Siguiente lección
            <Icon name="chevron" size={18} />
          </button>
        ) : (
          <button className="t-btn t-btn-primary" onClick={() => navigate('/aprender')} ref={outcome.error ? undefined : focusNoScroll}>
            Volver a la ruta
          </button>
        )}
        {passed && nextId && (
          <button className="t-btn" onClick={() => navigate('/aprender')}>
            Volver a la ruta
          </button>
        )}
        <button className={passed && nextId ? 't-btn t-btn-ghost' : 't-btn'} onClick={onRestart}>
          {passed ? 'Repasar' : 'Intentarlo de nuevo'}
        </button>
      </div>
      <p className="sr-only">{lesson.title}</p>
    </section>
  );
}
