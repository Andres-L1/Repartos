import { useEffect, useState } from 'react';
import type { LessonStatus, MapLesson, MapUnit } from '../../../src/shared/api';
import type { Level } from '../../../src/types';
import { api, ApiError } from '../api';
import { navigate } from '../router';

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Principiante · 0-400',
  initiation: 'Iniciación · 400-800',
  basic: 'Básico · 800-1100',
  intermediate: 'Intermedio · 1100-1400',
  advanced: 'Avanzado · 1400-1700',
  competitive: 'Competitivo · 1700-2000',
};

const STATUS_LABEL: Record<LessonStatus, string> = {
  locked: 'Bloqueada',
  available: 'Disponible',
  completed: 'Completada',
};
const STATUS_ICON: Record<LessonStatus, string> = { locked: '🔒', available: '▶', completed: '✓' };

export function MapScreen() {
  const [units, setUnits] = useState<MapUnit[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.map(), api.placement().catch(() => null)])
      .then(([r, p]) => {
        // Primer acceso: antes de mostrar el mapa, la bienvenida pregunta por dónde empezar.
        if (p && !p.chosen) {
          navigate('/bienvenida');
          return;
        }
        setUnits([...r.units].sort((a, b) => a.order - b.order));
      })
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'Error al cargar el mapa.');
      });
  }, []);

  if (error)
    return (
      <p className="form-error" role="alert">
        {error}
      </p>
    );
  if (!units) return <p role="status">Cargando tu mapa…</p>;

  const all = units.flatMap((u) => u.lessons);
  const done = all.filter((l) => l.status === 'completed').length;

  return (
    <div className="map">
      <header className="page-head">
        <h1>Tu mapa de aprendizaje</h1>
        <p className="muted">
          {done} de {all.length} lecciones completadas
        </p>
      </header>
      {units.map((u) => (
        <UnitView key={u.id} unit={u} />
      ))}
    </div>
  );
}

function UnitView({ unit }: { unit: MapUnit }) {
  const done = unit.lessons.filter((l) => l.status === 'completed').length;
  const pct = unit.lessons.length ? Math.round((done / unit.lessons.length) * 100) : 0;
  return (
    <section
      className={`unit unit-${unit.status}${unit.recommended ? ' unit-recommended' : ''}`}
      aria-labelledby={`u-${unit.id}`}
    >
      <div className="unit-head">
        <p className="kicker">
          Unidad {unit.order} · {LEVEL_LABEL[unit.level]}
          {unit.status === 'locked' && ' · Bloqueada'}
          {unit.status === 'completed' && ' · Completada ✓'}
        </p>
        {(unit.recommended || unit.placedOpen) && (
          <p className="unit-tags">
            {unit.recommended && <span className="chip chip-recommended">★ Recomendada</span>}
            {unit.placedOpen && !unit.recommended && (
              <span className="chip chip-review" title="Abierta según tu Elo de Lichess; puedes repasarla cuando quieras">
                ↻ Repaso
              </span>
            )}
          </p>
        )}
        <h2 id={`u-${unit.id}`}>{unit.title}</h2>
        <p className="muted">{unit.description}</p>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`Progreso de la unidad ${unit.title}: ${done} de ${unit.lessons.length}`}
        >
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ol className="path">
        {unit.lessons.map((l, i) => (
          <LessonNode key={l.id} lesson={l} index={i} unitLocked={unit.status === 'locked'} />
        ))}
      </ol>
    </section>
  );
}

const OFFSETS = [0, 1, 2, 1, 0, -1, -2, -1];

function LessonNode({ lesson, index, unitLocked }: { lesson: MapLesson; index: number; unitLocked: boolean }) {
  const status: LessonStatus = unitLocked ? 'locked' : lesson.status;
  const off = OFFSETS[index % OFFSETS.length] ?? 0;
  const stars = lesson.bestScore === undefined ? 0 : lesson.bestScore >= 0.99 ? 3 : lesson.bestScore >= 0.66 ? 2 : 1;
  const content = (
    <>
      <span className={`node node-${status}`} aria-hidden="true">
        {STATUS_ICON[status]}
      </span>
      <span className="node-text">
        <span className="node-title">{lesson.title}</span>
        <span className="node-meta">
          <span className={`chip chip-${status}`}>{STATUS_LABEL[status]}</span>
          {lesson.demo && <span className="chip chip-demo">Gratis</span>}
          {status === 'completed' && lesson.bestScore !== undefined && (
            <span aria-label={`Mejor resultado ${Math.round(lesson.bestScore * 100)} por ciento`}>
              {'★'.repeat(stars)}
              {'☆'.repeat(3 - stars)} {Math.round(lesson.bestScore * 100)}%
            </span>
          )}
        </span>
        <span className="node-obj">{lesson.objective}</span>
      </span>
    </>
  );
  return (
    <li className="path-item" style={{ marginInlineStart: `calc(${off} * var(--zig))` }}>
      {status === 'locked' ? (
        <div className="lesson-link is-locked" aria-disabled="true">
          {content}
        </div>
      ) : (
        <a
          className="lesson-link"
          href={`#/leccion/${encodeURIComponent(lesson.id)}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/leccion/${encodeURIComponent(lesson.id)}`);
          }}
        >
          {content}
        </a>
      )}
    </li>
  );
}
