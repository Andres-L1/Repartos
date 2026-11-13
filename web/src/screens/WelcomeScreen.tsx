import { useEffect, useState } from 'react';
import type { MapUnit, Placement, PlacementMode } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { navigate } from '../router';

const PERF_LABEL = { rapid: 'partidas rápidas', classical: 'partidas clásicas' } as const;

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
    return error ? (
      <p className="form-error" role="alert">
        {error}
      </p>
    ) : (
      <p role="status">Cargando…</p>
    );
  }

  const rec = units.find((u) => u.id === placement.recommendedUnitId);
  const recName = rec ? `la unidad ${rec.order}, «${rec.title}»` : 'la primera unidad';
  const reviewCount = placement.openUnitIds.filter((id) => id !== placement.recommendedUnitId).length;

  return (
    <div className="card welcome">
      <h1>Bienvenido a Chedex Pulse</h1>
      {placement.source === 'lichess' && placement.perf && placement.rating !== null ? (
        <>
          <p>
            Hemos visto tu Elo de Lichess en {PERF_LABEL[placement.perf]} (<strong>{placement.rating}</strong>) y te recomendamos
            empezar en <strong>{recName}</strong>.
          </p>
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
            No tenemos partidas rápidas o clásicas suficientes para recomendar un punto de partida; empezamos por el principio.
          </p>
          <div className="actions">
            <button className="btn btn-primary" disabled={saving} onClick={() => void choose('scratch')}>
              Empezar desde el principio
            </button>
          </div>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <PrivacyNote />
    </div>
  );
}
