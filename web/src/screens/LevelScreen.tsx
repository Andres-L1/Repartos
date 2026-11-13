import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { LevelInfo } from '../../../src/shared/api';
import type { Level } from '../../../src/types';
import { api, ApiError } from '../api';
import { navigate } from '../router';
import { useSession } from '../session';
import { Icon, Loading, ErrorBox } from '../components/Icon';
import '../level.css';

const PERF_LABEL = { rapid: 'partidas rápidas', classical: 'partidas clásicas', blitz: 'blitz' } as const;

/** Pantalla de nivel (/bienvenida): el alumno elige; Lichess solo sugiere. */
export function LevelScreen() {
  const { setLevel } = useSession();
  const [info, setInfo] = useState<LevelInfo | null>(null);
  const [picked, setPicked] = useState<Level | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let alive = true;
    setError('');
    api
      .level()
      .then((r) => {
        if (!alive) return;
        setInfo(r);
        setPicked(r.chosen ?? r.suggested);
      })
      .catch((e) => {
        if (alive && !(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los niveles.');
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  if (error && !info) {
    return (
      <div className="lvl">
        <ErrorBox>{error}</ErrorBox>
        <button className="t-btn" onClick={() => setAttempt((n) => n + 1)}>
          Reintentar
        </button>
      </div>
    );
  }
  if (!info) return <Loading label="Cargando los niveles…" />;

  const cards = info.levels;
  const current = cards.find((c) => c.id === picked) ?? null;
  const tabStop = current ? current.id : cards[0]?.id;

  function move(index: number) {
    const next = cards[(index + cards.length) % cards.length];
    if (!next) return;
    setPicked(next.id);
    refs.current[next.id]?.focus();
  }

  function onKey(e: KeyboardEvent, index: number, id: Level) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      move(index + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      move(index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      move(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      move(cards.length - 1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setPicked(id);
    }
  }

  async function confirm() {
    if (!current || saving) return;
    setSaving(true);
    setError('');
    try {
      await api.setLevel(current.id);
      setLevel(current.id);
      navigate('/aprender');
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'No se pudo guardar tu nivel. Inténtalo de nuevo.');
      setSaving(false);
    }
  }

  const hint = info.hint;
  return (
    <div className="lvl">
      <header className="lvl-head">
        <p className="kicker">Bienvenida</p>
        <h1 id="lvl-title">¿En qué nivel quieres empezar?</h1>
        <p className="muted lvl-lead">Tú decides. Puedes cambiarlo cuando quieras desde tu perfil.</p>
      </header>

      <div className="lvl-grid" role="radiogroup" aria-labelledby="lvl-title">
        {cards.map((c, i) => {
          const selected = c.id === picked;
          return (
            <div
              key={c.id}
              ref={(el) => {
                refs.current[c.id] = el;
              }}
              role="radio"
              aria-checked={selected}
              tabIndex={c.id === tabStop ? 0 : -1}
              className={`t-card lvl-card${c.available ? ' is-now' : ''}${selected ? ' is-selected' : ''}`}
              onClick={() => setPicked(c.id)}
              onKeyDown={(e) => onKey(e, i, c.id)}
            >
              <span className="lvl-badge" aria-hidden="true">
                {selected ? <Icon name="check" size={22} /> : i + 1}
              </span>
              <div className="lvl-body">
                <h2 className="lvl-name">{c.label}</h2>
                <p className="lvl-range">
                  {c.minElo} a {c.maxElo} Elo · {c.blurb}.
                </p>
                <p className="lvl-tags">
                  {c.available ? (
                    <span className="chip chip-recommended">
                      <Icon name="bolt" size={14} /> Disponible ahora
                    </span>
                  ) : (
                    <span className="chip chip-review">
                      <Icon name="book" size={14} /> En preparación
                    </span>
                  )}
                  {c.id === info.suggested && (
                    <span className="chip lvl-sug">
                      <Icon name="star" size={14} filled /> Sugerido por Lichess
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {hint && (
        <p className="muted lvl-hint">
          También vemos {hint.rating} en {PERF_LABEL[hint.perf]}, aún provisional.
        </p>
      )}
      {!info.suggested && !info.chosen && (
        <p className="muted lvl-hint">No tenemos datos de Lichess suficientes para sugerirte uno: elige el que te encaje.</p>
      )}

      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="lvl-actions">
        <button className="t-btn t-btn-primary t-btn-lg" disabled={!current || saving} onClick={() => void confirm()}>
          {saving ? 'Guardando…' : current ? `Empezar en ${current.label}` : 'Elige un nivel'}
          {!saving && current && <Icon name="chevron" size={18} />}
        </button>
      </div>
    </div>
  );
}
