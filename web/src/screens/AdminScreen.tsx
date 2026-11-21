import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { AccessOverview } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { Icon, Loading } from '../components/Icon';
import '../admin.css';

const USERNAME = /^[A-Za-z0-9_-]{2,30}$/;
const fmt = (ms: number) => (ms ? new Date(ms).toLocaleDateString('es-ES', { dateStyle: 'medium' }) : '');
const errText = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

/** Panel de administración del acceso. Solo se enlaza para la administración; la comprobación real está en el servidor (403). */
export function AdminScreen() {
  const [data, setData] = useState<AccessOverview | null>(null);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoadError('');
    api
      .adminAccess()
      .then(setData)
      .catch((e: unknown) => {
        if (!(e instanceof ApiError && e.status === 401)) setLoadError(errText(e, 'No se pudo cargar la lista.'));
      });
  }, []);
  useEffect(load, [load]);

  /** Ejecuta una operación del panel: actualiza la lista con la respuesta o muestra el error del servidor. */
  async function run(op: () => Promise<AccessOverview>, okText: string, failText: string): Promise<boolean> {
    setBusy(true);
    setMsg(null);
    try {
      setData(await op());
      setMsg({ ok: true, text: okText });
      return true;
    } catch (e) {
      setMsg({ ok: false, text: errText(e, failText) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    const v = name.trim();
    if (!USERNAME.test(v)) {
      setFieldError('Escribe el nombre de usuario de Lichess: de 2 a 30 letras, números, guion o guion bajo, sin espacios.');
      return;
    }
    setFieldError('');
    if (await run(() => api.adminAllow(v), `${v} ya puede entrar.`, 'No se pudo añadir.')) setName('');
  }

  if (loadError)
    return (
      <div className="t-card empty-state" role="alert">
        <span className="empty-icon" aria-hidden="true">
          <Icon name="alert" size={28} />
        </span>
        <h1>No se pudo cargar</h1>
        <p>{loadError}</p>
        <button className="t-btn t-btn-primary" onClick={load}>
          Reintentar
        </button>
      </div>
    );
  if (!data) return <Loading label="Cargando el acceso…" />;

  return (
    <div className="admin">
      <header>
        <p className="kicker">Administración</p>
        <h1>Acceso de alumnos</h1>
        <p className="muted">Solo pueden entrar las cuentas de Lichess de esta lista. Tú entras siempre.</p>
      </header>

      <div className="admin-status" role="status" aria-live="polite">
        {msg && (
          <p className={`t-alert ${msg.ok ? 't-alert-ok' : 't-alert-bad'}`}>
            <Icon name={msg.ok ? 'check' : 'alert'} size={18} /> {msg.text}
          </p>
        )}
      </div>

      <section className="t-card" aria-labelledby="add-title">
        <h2 id="add-title">Añadir un alumno</h2>
        <form onSubmit={add} noValidate>
          <div className="field">
            <label htmlFor="add-name">Nombre de usuario de Lichess</label>
            <input
              id="add-name"
              className="t-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-describedby={fieldError ? 'add-hint add-error' : 'add-hint'}
              aria-invalid={fieldError ? true : undefined}
            />
            <p id="add-hint" className="muted">
              Debe coincidir exactamente con el nombre que el alumno tiene en Lichess (da igual mayúsculas o minúsculas). No se comprueba con Lichess.
            </p>
            {fieldError && (
              <p id="add-error" className="field-error">
                {fieldError}
              </p>
            )}
          </div>
          <button type="submit" className="t-btn t-btn-primary" disabled={busy}>
            Añadir
          </button>
        </form>
      </section>

      <section className="t-card" aria-labelledby="req-title">
        <h2 id="req-title">Solicitudes de acceso</h2>
        <p className="muted">Cuentas que intentaron entrar sin estar autorizadas. Se borran solas a los 90 días.</p>
        {data.requests.length === 0 ? (
          <p className="admin-empty">No hay solicitudes pendientes.</p>
        ) : (
          <ul className="admin-list">
            {data.requests.map((r) => (
              <li key={r.id}>
                <div className="admin-who">
                  <strong>{r.username}</strong>
                  <span className="muted">
                    {r.attempts} {r.attempts === 1 ? 'intento' : 'intentos'} · último el {fmt(r.lastAt)}
                  </span>
                </div>
                <div className="admin-actions">
                  <button
                    className="t-btn t-btn-primary t-btn-sm"
                    disabled={busy}
                    aria-label={`Autorizar a ${r.username}`}
                    onClick={() => void run(() => api.adminApprove(r.id), `${r.username} ya puede entrar.`, 'No se pudo autorizar.')}
                  >
                    Autorizar
                  </button>
                  <button
                    className="t-btn t-btn-sm"
                    disabled={busy}
                    aria-label={`Descartar la solicitud de ${r.username}`}
                    onClick={() => void run(() => api.adminDismiss(r.id), 'Solicitud descartada.', 'No se pudo descartar.')}
                  >
                    Descartar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="t-card" aria-labelledby="allowed-title">
        <h2 id="allowed-title">Alumnos autorizados</h2>
        <p className="muted">
          {data.allowed.length} de {data.maxAllowed}
        </p>
        {data.allowed.length === 0 ? (
          <p className="admin-empty">Todavía no has autorizado a nadie.</p>
        ) : (
          <ul className="admin-list">
            {data.allowed.map((a) => (
              <li key={a.id}>
                <div className="admin-who">
                  <strong>{a.username}</strong>
                  <span className="muted">{a.addedAt ? `Desde el ${fmt(a.addedAt)}` : 'Sin fecha'}</span>
                </div>
                {confirming === a.id ? (
                  <div role="alertdialog" aria-labelledby={`q-${a.id}`} className="account-confirm admin-confirm">
                    <p id={`q-${a.id}`}>
                      <strong>¿Quitar el acceso a {a.username}?</strong> Dejará de poder entrar y su sesión se cerrará. Sus datos no se borran.
                    </p>
                    <div className="actions">
                      <button
                        className="t-btn t-btn-danger t-btn-sm"
                        disabled={busy}
                        onClick={async () => {
                          await run(() => api.adminRemove(a.id), `${a.username} ya no tiene acceso.`, 'No se pudo quitar.');
                          setConfirming(null);
                        }}
                      >
                        Sí, quitar
                      </button>
                      <button className="t-btn t-btn-sm" autoFocus disabled={busy} onClick={() => setConfirming(null)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="admin-actions">
                    <button className="t-btn t-btn-sm" disabled={busy} aria-label={`Quitar a ${a.username}`} onClick={() => setConfirming(a.id)}>
                      Quitar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
