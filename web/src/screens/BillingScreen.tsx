import { useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { navigate } from '../router';
import { useSession } from '../session';

export function BillingScreen() {
  const { subscription, setSubscription, paywallLesson, clearPaywall, billingMode } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    api
      .billing()
      .then((r) => setSubscription(r.subscription))
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'Error al cargar la suscripción.');
      });
  }, [setSubscription]);

  async function act(kind: 'subscribe' | 'cancel') {
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const r = kind === 'subscribe' ? await api.subscribe() : await api.cancel();
      setSubscription(r.subscription);
      setConfirmCancel(false);
      if (kind === 'subscribe') {
        setMsg('¡Suscripción activada! Ya puedes acceder a todas las lecciones.');
        if (paywallLesson && paywallLesson !== 'paywall') {
          const id = paywallLesson;
          clearPaywall();
          navigate(`/leccion/${encodeURIComponent(id)}`);
        } else clearPaywall();
      } else setMsg('Suscripción cancelada. Mantienes el acceso hasta el final del periodo pagado.');
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) setError(e instanceof ApiError ? e.message : 'No se pudo completar la operación.');
    } finally {
      setBusy(false);
    }
  }

  const status = subscription?.status ?? 'none';
  const end = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES', { dateStyle: 'long' }) : null;

  if (billingMode === 'beta_open') {
    return (
      <div className="billing">
        <header className="page-head">
          <h1>Beta abierta</h1>
        </header>
        <section className="card plan" aria-labelledby="beta-title">
          <h2 id="beta-title">
            Chedex Pulse <span className="chip chip-sub-active">Beta abierta</span>
          </h2>
          <p>
            Estamos en beta abierta: todas las lecciones están disponibles sin coste y no hace falta suscribirse. Los
            planes de pago llegarán más adelante y te avisaremos antes de cambiar nada.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/mapa')}>
            Ir al mapa
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="billing">
      <header className="page-head">
        <h1>Suscripción</h1>
      </header>

      {paywallLesson && status !== 'active' && (
        <p className="banner" role="status">
          Esa lección es parte del plan de suscripción. Suscríbete para desbloquear todas las lecciones.
        </p>
      )}

      <section className="card plan" aria-labelledby="plan-title">
        <h2 id="plan-title">Plan Chedex Pulse</h2>
        <p className="price">
          10 € <span>/ mes</span>
        </p>
        <ul className="ticks">
          <li>Todas las unidades y lecciones de 0 a 800 Elo</li>
          <li>Seguimiento de XP, racha y conceptos a reforzar</li>
          <li>Cancela cuando quieras</li>
        </ul>
        <p>
          Estado:{' '}
          <strong className={`chip chip-sub-${status}`}>
            {status === 'active' ? 'Activa' : status === 'canceled' ? 'Cancelada' : 'Sin suscripción'}
          </strong>
          {subscription?.provider === 'dev' && <span className="muted"> · pago simulado (modo desarrollo)</span>}
        </p>
        {end && status !== 'none' && (
          <p className="muted">
            {status === 'active' ? 'Próxima renovación' : 'Acceso hasta'}: {end}
          </p>
        )}

        {status !== 'active' && (
          <button className="btn btn-primary btn-large" disabled={busy} onClick={() => act('subscribe')}>
            {busy ? 'Procesando…' : status === 'canceled' ? 'Reactivar por 10 €/mes' : 'Suscríbete por 10 €/mes'}
          </button>
        )}
        {status === 'active' &&
          (confirmCancel ? (
            <div className="confirm" role="alertdialog" aria-label="Confirmar cancelación">
              <p>¿Seguro que quieres cancelar tu suscripción?</p>
              <div className="actions">
                <button className="btn btn-danger" disabled={busy} onClick={() => act('cancel')}>
                  Sí, cancelar
                </button>
                <button className="btn" onClick={() => setConfirmCancel(false)}>
                  Mantener suscripción
                </button>
              </div>
            </div>
          ) : (
            <button className="btn" onClick={() => setConfirmCancel(true)}>
              Cancelar suscripción
            </button>
          ))}
        {msg && (
          <p className="ok" role="status">
            ✓ {msg}
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
