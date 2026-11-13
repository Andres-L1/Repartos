import { useEffect, useState } from 'react';
import type { LessonStatus, MapLesson, MapUnit, Profile } from '../../../src/shared/api';
import type { Level } from '../../../src/types';
import { api, ApiError } from '../api';
import { navigate } from '../router';
import { Link } from '../components/Link';
import { Icon, Loading, ErrorBox, type IconName } from '../components/Icon';

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Principiante · 0-400',
  initiation: 'Iniciación · 400-800',
  basic: 'Básico · 800-1100',
  intermediate: 'Intermedio · 1100-1400',
  advanced: 'Avanzado · 1400-1700',
  competitive: 'Competitivo · 1700-2000',
};

const STATUS_ICON: Record<LessonStatus, IconName> = { locked: 'lock', available: 'play', completed: 'check' };

const dayWord = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;

/** Siguiente lección sugerida: la unidad recomendada por la colocación, si no la primera con algo pendiente. */
function pickNext(units: MapUnit[]): { unit: MapUnit; lesson: MapLesson } | null {
  const pending = (u: MapUnit) => (u.status === 'locked' ? undefined : u.lessons.find((l) => l.status === 'available'));
  const rec = units.find((u) => u.recommended && pending(u));
  const normal = units.find((u) => !(u.placedOpen && !u.recommended) && pending(u));
  const any = units.find((u) => pending(u));
  const unit = rec ?? normal ?? any;
  const lesson = unit ? pending(unit) : undefined;
  return unit && lesson ? { unit, lesson } : null;
}

export function MapScreen() {
  const [units, setUnits] = useState<MapUnit[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.map(), api.placement().catch(() => null)])
      .then(([r, p]) => {
        // Primer acceso: antes de mostrar la ruta, la bienvenida pregunta por dónde empezar.
        if (p && !p.chosen) {
          navigate('/bienvenida', { replace: true });
          return;
        }
        setUnits([...r.units].sort((a, b) => a.order - b.order));
      })
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'Error al cargar la ruta.');
      });
    api
      .profile()
      .then((r) => setProfile(r.profile))
      .catch(() => {});
  }, []);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!units) return <Loading label="Cargando tu ruta…" />;

  const all = units.flatMap((u) => u.lessons);
  const done = all.filter((l) => l.status === 'completed').length;
  const next = pickNext(units);

  return (
    <div className="map">
      <header className="page-head">
        <p className="kicker">Aprender</p>
        <h1>Tu ruta de aprendizaje</h1>
      </header>

      <section className="continue t-card" aria-labelledby="continue-title">
        <div className="continue-main">
          {next ? (
            <>
              <p className="kicker">{done === 0 ? 'Para empezar' : 'Continuar'}</p>
              <h2 id="continue-title">{next.lesson.title}</h2>
              <p className="muted continue-meta">
                Unidad {next.unit.order} · {next.unit.title}
              </p>
              <p className="continue-obj">{next.lesson.objective}</p>
              <Link className="t-btn t-btn-primary" href={`/leccion/${encodeURIComponent(next.lesson.id)}`}>
                {done === 0 ? 'Empezar lección' : 'Continuar'}
                <Icon name="chevron" size={18} />
              </Link>
            </>
          ) : (
            <>
              <p className="kicker">Ruta completada</p>
              <h2 id="continue-title">Has recorrido todas las lecciones disponibles</h2>
              <p className="continue-obj">Puedes repasar cualquiera cuando quieras; iremos añadiendo más.</p>
            </>
          )}
        </div>
        <dl className="summary" aria-label="Resumen">
          <div>
            <dt>
              <Icon name="flame" size={16} /> Racha actual
            </dt>
            <dd>{profile ? dayWord(profile.streakDays) : '–'}</dd>
          </div>
          <div>
            <dt>
              <Icon name="book" size={16} /> Lecciones aprendidas
            </dt>
            <dd>{done}</dd>
          </div>
        </dl>
      </section>

      <h2 className="section-title">Unidades</h2>
      {units.map((u) => (
        <UnitView key={u.id} unit={u} nextId={next?.lesson.id} />
      ))}
    </div>
  );
}

function UnitView({ unit, nextId }: { unit: MapUnit; nextId: string | undefined }) {
  const done = unit.lessons.filter((l) => l.status === 'completed').length;
  return (
    <section
      className={`unit unit-${unit.status}${unit.recommended ? ' unit-recommended' : ''}`}
      aria-labelledby={`u-${unit.id}`}
    >
      <div className="unit-head">
        <span className="unit-badge" aria-hidden="true">
          {unit.status === 'locked' ? <Icon name="lock" size={20} /> : unit.status === 'completed' ? <Icon name="check" size={22} /> : unit.order}
        </span>
        <div className="unit-head-main">
          <p className="kicker">
            Unidad {unit.order} · {LEVEL_LABEL[unit.level]}
          </p>
          <h2 id={`u-${unit.id}`}>{unit.title}</h2>
        </div>
        <p className="unit-count">
          <span className="sr-only">Lecciones completadas: </span>
          {done} de {unit.lessons.length}
        </p>
      </div>
      <p className="muted unit-desc">{unit.description}</p>
      <p className="unit-tags">
        {unit.status === 'locked' && (
          <span className="chip chip-locked">
            <Icon name="lock" size={14} /> Se abre al terminar la unidad anterior
          </span>
        )}
        {unit.status === 'completed' && (
          <span className="chip chip-completed">
            <Icon name="check" size={14} /> Completada
          </span>
        )}
        {unit.recommended && (
          <span className="chip chip-recommended">
            <Icon name="star" size={14} filled /> Recomendada para ti
          </span>
        )}
        {unit.placedOpen && !unit.recommended && (
          <span className="chip chip-review" title="Abierta según tu Elo de Lichess; puedes repasarla cuando quieras">
            <Icon name="repeat" size={14} /> Repaso
          </span>
        )}
      </p>
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
  const content = (
    <>
      <span className={`node node-${status}${next ? ' node-next' : ''}`} aria-hidden="true">
        <Icon name={STATUS_ICON[status]} size={status === 'available' ? 18 : 20} />
      </span>
      <span className="node-text">
        <span className="node-title">{lesson.title}</span>
        <span className="node-obj">{lesson.objective}</span>
      </span>
      {status === 'completed' && (
        <span className="chip chip-completed">
          <Icon name="check" size={13} /> Completada
        </span>
      )}
      {next && <span className="chip chip-next">Siguiente</span>}
      {status === 'locked' && (
        <span className="chip chip-locked">
          <Icon name="lock" size={13} /> Bloqueada
        </span>
      )}
      {status !== 'locked' && <Icon name="chevron" size={20} className="node-go" />}
    </>
  );
  return (
    <li className={`path-item is-${status}${next ? ' is-next' : ''}`}>
      {status === 'locked' ? (
        <div className="lesson-link is-locked" aria-disabled="true">
          {content}
        </div>
      ) : (
        <Link className="lesson-link" href={`/leccion/${encodeURIComponent(lesson.id)}`}>
          {content}
        </Link>
      )}
    </li>
  );
}
