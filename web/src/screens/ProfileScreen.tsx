import { useEffect, useState } from 'react';
import type { MapUnit, Profile } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { useSession } from '../session';
import { LEVELS } from '../../../src/shared/levels';
import { Link } from '../components/Link';
import { Icon, Loading, ErrorBox } from '../components/Icon';
import { CONCEPTS } from '../../../src/pedagogy/concepts';
import { ruleFor } from '../../../src/pedagogy/review-copy';
import { lessonsForConcept } from '../../../src/content';
import { topWeakConcepts } from '../../../src/review/weak';
import '../weak.css';

const dayWord = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;

export function ProfileScreen() {
  const { user, level, levelChosen } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [units, setUnits] = useState<MapUnit[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .profile()
      .then((r) => setProfile(r.profile))
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'Error al cargar el perfil.');
      });
    api
      .map()
      .then((r) => setUnits([...r.units].sort((a, b) => a.order - b.order)))
      .catch(() => {});
  }, []);

  if (!profile) {
    return error ? <ErrorBox>{error}</ErrorBox> : <Loading label="Cargando perfil…" />;
  }

  const learned = (units ?? [])
    .map((u) => ({ unit: u, lessons: u.lessons.filter((l) => l.status === 'completed') }))
    .filter((x) => x.lessons.length > 0);
  const learnedCount = units ? learned.reduce((n, x) => n + x.lessons.length, 0) : profile.lessonsCompleted;

  // Solo conceptos que sabemos nombrar o practicar: un id desconocido (contenido antiguo) no ocupa uno de los 3 huecos.
  const nameable = Object.fromEntries(
    Object.entries(profile.weakConcepts ?? {}).filter(([id]) => CONCEPTS.some((c) => c.id === id) || lessonsForConcept(id).length > 0),
  );
  const weak = topWeakConcepts(nameable).map(({ conceptId, count }) => {
    const lessons = lessonsForConcept(conceptId);
    const known = CONCEPTS.find((c) => c.id === conceptId);
    return {
      conceptId,
      count,
      name: known?.name ?? lessons[0]?.title ?? 'Ajedrez táctico',
      rule: known ? ruleFor(conceptId) : null,
      lessonId: lessons[0]?.id ?? null,
    };
  });

  return (
    <div className="profile">
      <header className="page-head profile-head">
        <span className="avatar" aria-hidden="true">
          {(user?.username ?? '?').slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h1>{user ? user.username : 'Tu perfil'}</h1>
          {user && (
            <p className="muted">
              <a className="profile-lichess" href={`https://lichess.org/@/${encodeURIComponent(user.username)}`} target="_blank" rel="noopener noreferrer">
                Ver mi cuenta en Lichess<span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </p>
          )}
        </div>
      </header>

      <section className="streaks" aria-label="Rachas">
        <div className="t-card streak">
          <p className="streak-label">
            <Icon name="flame" size={18} /> Racha actual
          </p>
          <p className="streak-value">{dayWord(profile.streakDays)}</p>
          <p className="muted">
            Días seguidos en los que has completado al menos una lección.
            {profile.streakDays === 0 && ' Cuando completes una, empieza de nuevo.'}
          </p>
        </div>
        <div className="t-card streak">
          <p className="streak-label">
            <Icon name="medal" size={18} /> Mejor racha
          </p>
          <p className="streak-value">{dayWord(profile.longestStreak)}</p>
          <p className="muted">Tu récord se conserva siempre.</p>
        </div>
      </section>
      <p className="muted streak-note">
        Si un día no puedes estudiar no pasa nada: la racha vuelve a empezar con tu próxima lección y tu mejor racha sigue ahí.
      </p>

      <section className="t-card" aria-labelledby="learned-title">
        <div className="learned-head">
          <h2 id="learned-title">Lecciones aprendidas</h2>
          <p className="learned-count" aria-label={`${learnedCount} lecciones aprendidas`}>
            {learnedCount}
          </p>
        </div>
        {units === null ? (
          <p className="muted">Cargando tus lecciones…</p>
        ) : learned.length === 0 ? (
          <p className="muted empty-inline">
            <Icon name="sparkle" size={18} /> Aún no has completado ninguna lección. Cuando lo hagas, aparecerá aquí.
          </p>
        ) : (
          <div className="learned-units">
            {learned.map(({ unit, lessons }) => (
              <section key={unit.id} aria-labelledby={`l-${unit.id}`} className="learned-unit">
                <h3 id={`l-${unit.id}`}>
                  Unidad {unit.order} · {unit.title}
                </h3>
                <ul className="learned-list">
                  {lessons.map((l) => (
                    <li key={l.id}>
                      <Icon name="check" size={16} />
                      <span>{l.title}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        <Link className="t-btn" href="/aprender">
          Ir a la ruta
        </Link>
      </section>

      <section className="t-card" aria-labelledby="weak-title">
        <h2 id="weak-title">Tus puntos débiles</h2>
        {weak.length === 0 ? (
          <p className="muted empty-inline">
            <Icon name="sparkle" size={18} /> Aún no hay puntos débiles: analiza una partida o completa una lección
          </p>
        ) : (
          <ul className="weak-list">
            {weak.map((w) => (
              <li key={w.conceptId} className="weak-item">
                <h3>{w.name}</h3>
                <p className="muted weak-count">{w.count} {w.count === 1 ? 'vez' : 'veces'}</p>
                {w.rule && <p className="weak-rule">{w.rule}</p>}
                {w.lessonId && (
                  <Link className="t-btn" href={`/leccion/${w.lessonId}`}>
                    Practicar
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="t-card" aria-labelledby="start-title">
        <h2 id="start-title">Tu nivel</h2>
        {(() => {
          const info = LEVELS.find((l) => l.id === level);
          return levelChosen && info ? (
            <p>
              Estás en <strong>{info.label}</strong> ({info.minElo} a {info.maxElo} Elo). Lichess solo sugiere: el nivel lo eliges tú.
            </p>
          ) : (
            <p>Todavía no has elegido tu nivel.</p>
          );
        })()}
        <Link className="t-btn" href="/bienvenida">
          Cambiar nivel
        </Link>
      </section>
    </div>
  );
}
