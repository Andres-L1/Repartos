import { useEffect, useState } from 'react';
import type { MapUnit, Placement, PlacementMode, PlacementSeen, SeenPerf } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { navigate } from '../router';
import { Icon, Loading, ErrorBox } from '../components/Icon';

const PERF_LABEL = { rapid: 'partidas rápidas', classical: 'partidas clásicas' } as const;
/** Mismo mínimo que usa el servidor (worker/placement.ts: PLACEMENT_MIN_GAMES). */
const MIN_GAMES = 10;

function seenText(p: SeenPerf): string {
  switch (p.state) {
    case 'reliable':
      return `${p.rating} (${p.games} partidas): cuenta para la recomendación.`;
    case 'provisional':
      return `${p.rating}, provisional (${p.games} partidas): todavía no es fiable, no cuenta.`;
    case 'few_games':
      return `${p.rating} con ${p.games} partidas: hacen falta al menos ${MIN_GAMES}, no cuenta.`;
    case 'invalid':
      return 'Lichess envió un dato que no hemos podido leer, no cuenta.';
    default:
      return 'Lichess no ha enviado este ritmo (sin partidas en él), no cuenta.';
  }
}

/** Lo que Lichess nos devolvió en tu último acceso, para que veas por qué recomendamos lo que recomendamos. */
export function SeenSummary({ seen }: { seen: PlacementSeen | null }) {
  if (!seen)
    return <p className="muted">Vuelve a entrar con Lichess para ver qué datos de tu cuenta hemos recibido.</p>;
  return (
    <div className="muted seen">
      <p>
        <strong>Esto es lo que nos ha enviado Lichess:</strong>
      </p>
      {!seen.perfsPresent && <p>Lichess no ha enviado la información de ritmos de tu cuenta.</p>}
      <ul>
        <li>
          <strong>Rápidas:</strong> {seenText(seen.rapid)}
        </li>
        <li>
          <strong>Clásicas:</strong> {seenText(seen.classical)}
        </li>
      </ul>
    </div>
  );
}

export function PrivacyNote() {
  return (
    <p className="muted">
      Usamos tu Elo solo para recomendarte dónde empezar. No guardamos tu contraseña ni tu token de Lichess.
    </p>
  );
}

/** Bienvenida tras el primer login (y accesible desde Perfil): recomienda un punto de partida según el Elo de Lichess. */
export function WelcomeScreen() {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [units, setUnits] = useState<MapUnit[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .placement()
      .then((p) => setPlacement(p))
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'Error al cargar tu punto de partida.');
      });
    api
      .map()
      .then((r) => setUnits(r.units))
      .catch(() => {});
  }, []);

  async function choose(mode: PlacementMode) {
    setError('');
    setSaving(true);
    try {
      await api.setPlacement(mode);
      navigate('/mapa');
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'No se pudo guardar tu elección.');
      setSaving(false);
    }
  }

  if (!placement) {
    return error ? <ErrorBox>{error}</ErrorBox> : <Loading label="Cargando…" />;
  }

  const rec = units.find((u) => u.id === placement.recommendedUnitId);
  const recName = rec ? `la unidad ${rec.order}, «${rec.title}»` : 'la primera unidad';
  const reviewCount = placement.openUnitIds.filter((id) => id !== placement.recommendedUnitId).length;

  return (
    <div className="card welcome">
      <span className="welcome-icon" aria-hidden="true">
        <Icon name="sparkle" size={26} />
      </span>
      <h1>Bienvenido a Chedex Pulse</h1>
      {placement.source === 'lichess' && placement.perf && placement.rating !== null ? (
        <>
          <p>
            Hemos visto tu Elo de Lichess en {PERF_LABEL[placement.perf]} (<strong>{placement.rating}</strong>) y te recomendamos
            empezar en <strong>{recName}</strong>.
          </p>
          <SeenSummary seen={placement.seen} />
          {reviewCount > 0 && (
            <p className="muted">
              Las unidades anteriores te quedan abiertas con la etiqueta «Repaso», para que las repases cuando quieras. No cuentan como
              completadas ni te dan XP por adelantado.
            </p>
          )}
          {placement.chosen && (
            <p className="muted" role="status">
              Tu elección actual: {placement.mode === 'lichess' ? 'empezar en la unidad recomendada' : 'empezar desde el principio'}.
            </p>
          )}
          <div className="actions">
            <button className="btn btn-primary" disabled={saving} onClick={() => void choose('lichess')}>
              Empezar aquí
            </button>
            <button className="btn" disabled={saving} onClick={() => void choose('scratch')}>
              Empezar desde el principio
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            No hemos podido recomendarte un punto de partida con tu Elo de Lichess en rápidas o clásicas; empezamos por el principio.
          </p>
          <SeenSummary seen={placement.seen} />
          <div className="actions">
            <button className="btn btn-primary" disabled={saving} onClick={() => void choose('scratch')}>
              Empezar desde el principio
            </button>
          </div>
        </>
      )}
      {error && <ErrorBox>{error}</ErrorBox>}
      <PrivacyNote />
    </div>
  );
}
