import { useEffect, useState } from 'react';
import type { LessonStatus, MapLesson, MapUnit } from '../../../src/shared/api';
import type { Level } from '../../../src/types';
import { api, ApiError } from '../api';
import { navigate } from '../router';
import { Icon, Loading, ErrorBox, type IconName } from '../components/Icon';

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
const STATUS_ICON: Record<LessonStatus, IconName> = { locked: 'lock', available: 'play', completed: 'check' };

export function MapScreen() {
  const [units, setUnits] = useState<MapUnit[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.map(), api.placement().catch(() => null)])
      .then(([r, p]) => {
        // Primer acceso: antes de mostrar la ruta, la bienvenida pregunta por dónde empezar.
        if (p && !p.chosen) {
          navigate('/bienvenida');
          return;
        }
        setUnits([...r.units].sort((a, b) => a.order - b.order));
      })
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'Error al cargar la ruta.');
      });
  }, []);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!units) return <Loading label="Cargando tu ruta…" />;

  const all = units.flatMap((u) => u.lessons);
  const done = all.filter((l) => l.status === 'completed').length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;

  return (
    <div className="map">
      <header className="page-head route-head">
        <div>
          <p className="kicker">Aprender</p>
          <h1>Tu ruta de aprendizaje</h1>
          <p className="muted">
            {done} de {all.length} lecciones completadas
          </p>
        </div>
        <div
          className="route-total"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Progreso total de la ruta"
        >
          <span className="route-total-n">{pct}%</span>
          <span className="progress">
            <span className="progress-fill" style={{ width: `${pct}%` }} />
          </span>
        </div>
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
  const nextId = unit.status === 'locked' ? undefined : unit.lessons.find((l) => l.status === 'available')?.id;
  return (
    <section
      className={`unit unit-${unit.status}${unit.recommended ? ' unit-recommended' : ''}`}
      aria-labelledby={`u-${unit.id}`}
    >
      <div className="unit-head">
        <span className="unit-badge" aria-hidden="true">
          {unit.status === 'locked' ? <Icon name="lock" size={22} /> : unit.status === 'completed' ? <Icon name="check" size={24} /> : unit.order}
        </span>
        <div className="unit-head-main">
          <p className="kicker">
            Unidad {unit.order} · {LEVEL_LABEL[unit.level]}
          </p>
          <h2 id={`u-${unit.id}`}>{unit.title}</h2>
        </div>
      </div>
      <p className="unit-tags">
        {unit.status === 'locked' && (
          <span className="chip chip-locked">
            <Icon name="lock" size={14} /> Bloqueada
          </span>
        )}
        {unit.status === 'completed' && (
          <span className="chip chip-completed">
            <Icon name="check" size={14} /> Completada
          </span>
        )}
        {unit.recommended && (
          <span className="chip chip-recommended">
            <Icon name="star" size={14} filled /> Recomendada
          </span>
        )}
        {unit.placedOpen && !unit.recommended && (
          <span className="chip chip-review" title="Abierta según tu Elo de Lichess; puedes repasarla cuando quieras">
            <Icon name="repeat" size={14} /> Repaso
          </span>
        )}
      </p>
      <p className="muted unit-desc">{unit.description}</p>
      <div className="unit-progress">
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
        <span className="unit-count" aria-hidden="true">
          {done}/{unit.lessons.length}
        </span>
      </div>
      <ol className="path">
        {unit.lessons.map((l) => (
          <LessonNode key={l.id} lesson={l} next={l.id === nextId} unitLocked={unit.status === 'locked'} />
        ))}
      </ol>
    </section>
  );
}

function LessonNode({ lesson, next, unitLocked }: { lesson: MapLesson; next: boolean; unitLocked: boolean }) {
  const status: LessonStatus = unitLocked ? 'locked' : lesson.status;
  const stars = lesson.bestScore === undefined ? 0 : lesson.bestScore >= 0.99 ? 3 : lesson.bestScore >= 0.66 ? 2 : 1;
  const content = (
    <>
      <span className={`node node-${status}${next ? ' node-next' : ''}`} aria-hidden="true">
        <Icon name={STATUS_ICON[status]} size={status === 'available' ? 22 : 24} />
      </span>
      <span className="node-text">
        <span className="node-title">{lesson.title}</span>
        <span className="node-meta">
          <span className={`chip chip-${status}`}>
            <Icon name={STATUS_ICON[status]} size={13} />
            {STATUS_LABEL[status]}
          </span>
          {next && <span className="chip chip-next">Siguiente</span>}
          {lesson.demo && <span className="chip chip-demo">Gratis</span>}
          {status === 'completed' && lesson.bestScore !== undefined && (
            <span className="stars" role="img" aria-label={`Mejor resultado ${Math.round(lesson.bestScore * 100)} por ciento`}>
              {[0, 1, 2].map((n) => (
                <Icon key={n} name="star" size={15} filled={n < stars} className={n < stars ? 'star-on' : 'star-off'} />
              ))}
              <span className="stars-pct">{Math.round(lesson.bestScore * 100)}%</span>
            </span>
          )}
        </span>
        <span className="node-obj">{lesson.objective}</span>
      </span>
      {status !== 'locked' && <Icon name="chevron" size={20} className="node-go" />}
    </>
  );
  return (
    <li className={`path-item is-${status}`}>
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
