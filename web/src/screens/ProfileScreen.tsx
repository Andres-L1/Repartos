import { useEffect, useState } from 'react';
import type { MapUnit, Profile } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { useSession } from '../session';
import { LEVELS } from '../../../src/shared/levels';
import { Link } from '../components/Link';
import { Icon, Loading, ErrorBox } from '../components/Icon';

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
              <a href={`https://lichess.org/@/${encodeURIComponent(user.username)}`} target="_blank" rel="noopener noreferrer">
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
