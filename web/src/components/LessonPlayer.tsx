import { useEffect, useMemo, useState } from 'react';
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

export function LessonPlayer({ lesson, demo = false }: { lesson: Lesson; demo?: boolean }) {
  const { refreshShop } = useSession();
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const [evalResults, setEvalResults] = useState<boolean[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [saving, setSaving] = useState(false);
  const [run, setRun] = useState(0);

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
    const correct = results.filter(Boolean).length;
    const passed = correct >= passMark;
    setPhase({ kind: 'result' });
    if (demo) {
      setOutcome({ correct, total, passed });
      return;
    }
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
      if (e instanceof ApiError && (e.status === 401 || e.status === 402)) return;
      setOutcome({
        correct,
        total,
        passed,
        error: e instanceof ApiError ? e.message : 'No se pudo guardar tu progreso.',
      });
    } finally {
      setSaving(false);
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
        <button className="t-btn t-btn-ghost t-btn-sm" onClick={() => navigate(demo ? '/' : '/aprender')}>
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

      <div className="lesson-body" key={`${run}-${phase.kind}-${'i' in phase ? phase.i : 0}`}>
        {phase.kind === 'intro' && (
          <section className="t-card intro">
            <p className="kicker">
              <Icon name="target" size={16} /> Objetivo
            </p>
            <h2>{lesson.objective}</h2>
            <p className="lead">{lesson.intro}</p>
            <button className="t-btn t-btn-primary" onClick={toExplain} autoFocus>
              Empezar
            </button>
          </section>
        )}

        {phase.kind === 'explain' && <ExplainStepView lesson={lesson} i={phase.i} plain={demo} onNext={() => (phase.i + 1 < lesson.explanation.length ? setPhase({ kind: 'explain', i: phase.i + 1 }) : toPractice())} onPrev={phase.i > 0 ? () => setPhase({ kind: 'explain', i: phase.i - 1 }) : undefined} />}

        {phase.kind === 'practice' && (
          <PracticeBoard
            step={lesson.practice[phase.i]!}
            mode="practice"
            plain={demo}
            isLast={phase.i + 1 >= lesson.practice.length}
            onDone={() => (phase.i + 1 < lesson.practice.length ? setPhase({ kind: 'practice', i: phase.i + 1 }) : toEval())}
          />
        )}

        {phase.kind === 'evaluation' && (
          <PracticeBoard
            step={lesson.evaluation[phase.i]!}
            mode="evaluation"
            plain={demo}
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
          <ResultView lesson={lesson} demo={demo} saving={saving} outcome={outcome} passMark={passMark} onRestart={restart} />
        )}
      </div>
    </article>
  );
}

function ExplainStepView({ lesson, i, plain, onNext, onPrev }: { lesson: Lesson; i: number; plain: boolean; onNext(): void; onPrev: (() => void) | undefined }) {
  const step = lesson.explanation[i]!;
  const shapes = useMemo(() => marksToShapes(step), [step]);
  const last = i + 1 >= lesson.explanation.length;
  return (
    <div className="step-layout">
      <div className="step-board">
        <Board fen={step.fen} orientation={turnOf(step.fen)} shapes={shapes} plain={plain} label="Tablero de la explicación" />
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
          <button className="t-btn t-btn-primary" onClick={onNext} autoFocus>
            {last ? 'Pasar a la práctica' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultView({
  lesson,
  demo,
  saving,
  outcome,
  passMark,
  onRestart,
}: {
  lesson: Lesson;
  demo: boolean;
  saving: boolean;
  outcome: Outcome | null;
  passMark: number;
  onRestart(): void;
}) {
  const [nextId, setNextId] = useState<string | null>(null);
  const passed = outcome?.passed === true;
  useEffect(() => {
    if (demo || saving || !passed) return;
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
  }, [demo, saving, passed, lesson.id]);

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
      <h2>{passed ? 'Lección completada' : 'Casi lo tienes'}</h2>
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
        <p className="field-error" role="alert">
          {outcome.error}
        </p>
      )}
      <div className="actions">
        {demo ? (
          <>
            <a className="t-btn t-btn-primary" href="/auth/login">
              Entrar con Lichess para seguir
            </a>
            <button className="t-btn" onClick={onRestart}>
              Repetir la demostración
            </button>
          </>
        ) : (
          <>
            {passed && nextId ? (
              <button className="t-btn t-btn-primary" onClick={() => navigate(`/leccion/${encodeURIComponent(nextId)}`)} autoFocus>
                Siguiente lección
                <Icon name="chevron" size={18} />
              </button>
            ) : (
              <button className="t-btn t-btn-primary" onClick={() => navigate('/aprender')} autoFocus>
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
          </>
        )}
      </div>
      <p className="sr-only">{lesson.title}</p>
    </section>
  );
}
