import { useEffect, useState, type FormEvent } from 'react';
import type { Placement, Profile } from '../../../src/shared/api';
import { CONCEPTS } from '../../../src/pedagogy/concepts';
import { api, ApiError } from '../api';
import { LEVEL_LABEL } from './MapScreen';
import { useSession } from '../session';
import { Icon, Loading, ErrorBox, type IconName } from '../components/Icon';

const GOALS = [10, 20, 30, 50];

function conceptName(id: string): string {
  return CONCEPTS.find((c) => c.id === id)?.name ?? id;
}

export function ProfileScreen() {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [error, setError] = useState('');
  const [goal, setGoal] = useState('20');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .profile()
      .then((r) => {
        setProfile(r.profile);
        setGoal(String(r.profile.dailyGoalXp));
      })
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'Error al cargar el perfil.');
      });
  }, []);

  useEffect(() => {
    api
      .placement()
      .then(setPlacement)
      .catch(() => {});
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    const xp = Number(goal);
    if (!Number.isInteger(xp) || xp < 5 || xp > 500) {
      setError('El objetivo diario debe ser un número entero entre 5 y 500 XP.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const r = await api.setDailyGoal(xp);
      setProfile(r.profile);
      setMsg('Objetivo guardado.');
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return error ? <ErrorBox>{error}</ErrorBox> : <Loading label="Cargando perfil…" />;
  }

  const pct = Math.min(100, Math.round((profile.xpToday / Math.max(1, profile.dailyGoalXp)) * 100));
  const weak = Object.entries(profile.weakConcepts).sort((a, b) => b[1] - a[1]);
  const maxWeak = weak[0]?.[1] ?? 1;

  return (
    <div className="profile">
      <header className="page-head profile-head">
        <span className="avatar" aria-hidden="true">
          {(user?.username ?? '?').slice(0, 1).toUpperCase()}
        </span>
        <div>
        <h1>{user ? `Hola, ${user.username}` : 'Tu perfil'}</h1>
        <p className="muted">
          {user && (
            <>
              Cuenta de Lichess:{' '}
              <a href={`https://lichess.org/@/${encodeURIComponent(user.username)}`} target="_blank" rel="noopener noreferrer">
                {user.username}
              </a>
              {' · '}
            </>
          )}
          Nivel interno: {LEVEL_LABEL[profile.level]}
        </p>
        </div>
      </header>

      <section className="stats" aria-label="Estadísticas">
        <Stat label="XP total" value={profile.xp} icon="star" tone="xp" />
        <Stat label="Racha" value={`${profile.streakDays} ${profile.streakDays === 1 ? 'día' : 'días'}`} icon="flame" tone="streak" />
        <Stat label="Mejor racha" value={`${profile.longestStreak} ${profile.longestStreak === 1 ? 'día' : 'días'}`} icon="medal" tone="best" />
        <Stat label="Lecciones" value={profile.lessonsCompleted} icon="book" tone="lessons" />
      </section>

      <section className="card" aria-labelledby="goal-title">
        <h2 id="goal-title">Objetivo diario</h2>
        <div className="goal-summary">
          <div className="ring" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progreso del objetivo diario">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="ring-track" cx="50" cy="50" r="42" />
              <circle
                className="ring-fill"
                cx="50"
                cy="50"
                r="42"
                pathLength={100}
                strokeDasharray={`${pct} 100`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="ring-label" aria-hidden="true">
              {pct}%
            </span>
          </div>
          <p className="goal-text">
            Hoy llevas <strong>{profile.xpToday}</strong> de <strong>{profile.dailyGoalXp}</strong> XP
            {profile.xpToday >= profile.dailyGoalXp && (
              <span className="goal-done">
                <Icon name="check" size={16} /> ¡Objetivo cumplido!
              </span>
            )}
          </p>
        </div>
        <form onSubmit={save} className="goal-form">
          <fieldset>
            <legend>Cambiar objetivo (XP al día)</legend>
            <div className="chips">
              {GOALS.map((g) => (
                <label key={g} className={`choice ${goal === String(g) ? 'on' : ''}`}>
                  <input type="radio" name="goal" value={g} checked={goal === String(g)} onChange={() => setGoal(String(g))} />
                  {g} XP
                </label>
              ))}
            </div>
            <div className="field inline">
              <label htmlFor="goal-custom">Otro valor</label>
              <input id="goal-custom" type="number" min={5} max={500} value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
          </fieldset>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar objetivo'}
          </button>
          {msg && (
            <p className="ok" role="status">
              <Icon name="check" size={16} /> {msg}
            </p>
          )}
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>

      <section className="card" aria-labelledby="start-title">
        <h2 id="start-title">Punto de partida</h2>
        <p>
          {placement?.source === 'lichess' && placement.perf && placement.rating !== null
            ? `Según tu Elo de Lichess en partidas ${placement.perf === 'rapid' ? 'rápidas' : 'clásicas'} (${placement.rating}), ${
                placement.mode === 'lichess' ? 'la ruta usa la recomendación de inicio.' : 'has elegido empezar desde el principio.'
              }`
            : 'No tenemos partidas rápidas o clásicas suficientes para recomendar un punto de partida; empezamos por el principio.'}
        </p>
        <a className="btn" href="#/bienvenida">
          Ver o cambiar mi punto de partida
        </a>
      </section>

      <section className="card" aria-labelledby="weak-title">
        <h2 id="weak-title">Conceptos a reforzar</h2>
        {weak.length === 0 ? (
          <p className="muted empty-inline">
            <Icon name="sparkle" size={18} /> Todavía no hay errores registrados. ¡Sigue así!
          </p>
        ) : (
          <ul className="weak-list">
            {weak.map(([id, n]) => (
              <li key={id}>
                <span>{conceptName(id)}</span>
                <span className="weak-bar" aria-hidden="true">
                  <span style={{ width: `${Math.round((n / maxWeak) * 100)}%` }} />
                </span>
                <span className="weak-n">
                  {n} {n === 1 ? 'error' : 'errores'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: string | number; icon: IconName; tone: string }) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-icon" aria-hidden="true">
        <Icon name={icon} size={22} filled={icon === 'star'} />
      </span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
