import { useEffect, useState, type ReactNode } from 'react';
import type { ReviewGame } from '../../../src/review/types';
import { navigate } from '../router';
import { Icon, Loading, type IconName } from '../components/Icon';
import { useReview, type UseReview } from '../review/useReview';
import { NotEnoughGamesError } from '../review/runner';
import { MIN_GAMES } from '../../../src/review/report';
import { ReviewGameScreen } from './ReviewGameScreen';
import { ReportScreen } from './ReportScreen';
import '../review.css';

const WAIT_SECONDS = 60;
const RESULT_LABEL = { win: 'Ganada', loss: 'Perdida', draw: 'Tablas' } as const;
const SPEED_LABEL: Record<string, string> = { blitz: 'Blitz', rapid: 'Rápida', classical: 'Clásica', correspondence: 'Por correo' };

type Failure = 'not-found' | 'rate-limited' | 'offline' | 'few' | 'other';

function failureOf(error: Error | undefined): Failure {
  if (error instanceof NotEnoughGamesError) return 'few';
  const kind = (error as { kind?: string } | undefined)?.kind;
  if (kind === 'not_found') return 'not-found';
  if (kind === 'rate_limited') return 'rate-limited';
  if (kind === 'network') return 'offline';
  return 'other';
}

function Panel({ icon, title, children, actions }: { icon: IconName; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <section className="t-card rv-card" aria-labelledby="rv-title">
      <span className="rv-icon" aria-hidden="true">
        <Icon name={icon} size={28} />
      </span>
      <h1 id="rv-title">{title}</h1>
      {children}
      {actions && <div className="rv-actions">{actions}</div>}
    </section>
  );
}

function RateLimited({ onRetry }: { onRetry: () => void }) {
  const [left, setLeft] = useState(WAIT_SECONDS);
  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);
  return (
    <Panel
      icon="alert"
      title="Lichess pide esperar un poco"
      actions={
        <button className="t-btn t-btn-primary" disabled={left > 0} onClick={onRetry}>
          {left > 0 ? `Reintentar en ${left} s` : 'Reintentar'}
        </button>
      }
    >
      <p>Has hecho muchas peticiones seguidas. Espera un minuto y vuelve a probar.</p>
      <p className="muted">{left > 0 ? `Quedan ${left} segundos.` : 'Ya puedes reintentar.'}</p>
    </Panel>
  );
}

function GameRow({ game, i, r, highlight }: { game: ReviewGame; i: number; r: UseReview; highlight: boolean }) {
  const st = r.statuses[i]!;
  const anyBusy = r.statuses.includes('analyzing');
  const p = st === 'analyzing' && r.progress?.gameIndex === i ? r.progress : undefined;
  const label =
    st === 'ready'
      ? 'Lista'
      : st === 'analyzing'
        ? p
          ? `Analizando, ${Math.round((p.done / p.total) * 100)} %`
          : 'Analizando'
        : st === 'error'
          ? 'No se pudo analizar'
          : 'Sin analizar';
  const cls = st === 'analyzing' ? 'busy' : st === 'ready' ? 'ready' : st === 'error' ? 'err' : 'wait';
  const hintId = `rv-hint-${i}`;
  return (
    <li className={`rv-row rv-${cls}${highlight ? ' rv-next' : ''}`} aria-current={highlight ? 'true' : undefined}>
      <div className="rv-row-main">
        <span className="rv-num" aria-hidden="true">{i + 1}</span>
        <div className="rv-row-text">
          <strong>
            {RESULT_LABEL[game.result]} con {game.color === 'white' ? 'blancas' : 'negras'}
          </strong>
          <span className="muted">{[SPEED_LABEL[game.speed] ?? game.speed, game.opening].filter(Boolean).join(' · ')}</span>
        </div>
        <span className="rv-status">
          {st === 'ready' && <Icon name="check" size={18} />}
          {label}
        </span>
      </div>
      {p && <progress className="rv-bar" value={p.done} max={p.total} aria-label={`Progreso de la partida ${i + 1}`} />}
      {st === 'ready' && (
        <button className="t-btn t-btn-secondary t-btn-sm" onClick={() => navigate(`/partidas/repaso/${i + 1}`)}>
          Repasar la partida {i + 1}
        </button>
      )}
      {st === 'analyzing' && (
        <button className="t-btn t-btn-secondary t-btn-sm" onClick={r.cancel}>
          Cancelar
        </button>
      )}
      {(st === 'pending' || st === 'error') && (
        <>
          <button className="t-btn t-btn-secondary t-btn-sm" disabled={anyBusy} aria-describedby={anyBusy ? hintId : undefined} onClick={() => r.analyze(i)}>
            {st === 'error' ? `Reintentar la partida ${i + 1}` : `Analizar la partida ${i + 1}`}
          </button>
          {anyBusy && (
            <span id={hintId} className="muted rv-hint">
              Espera a que termine el análisis en curso.
            </span>
          )}
        </>
      )}
      {st === 'error' && <p className="rv-fail" role="alert">El analizador no ha podido arrancar o se ha detenido en este navegador. Prueba de nuevo.</p>}
    </li>
  );
}

export function ReviewScreen({ path = '/partidas' }: { path?: string }) {
  const r = useReview();
  const [next, setNext] = useState<number | null>(null);
  const m = /^\/partidas\/repaso\/(\d+)$/.exec(path);
  if (m) {
    const index = Number(m[1]);
    return (
      <ReviewGameScreen
        key={index}
        index={index}
        game={r.games[index - 1]}
        analysis={r.analyses[index - 1]}
        onReviewed={(n) => {
          const k = r.analyses.findIndex((a, i) => i >= n && a);
          setNext(k >= 0 ? k : null);
        }}
      />
    );
  }
  if (path === '/partidas/informe') {
    const done = r.games.flatMap((g, i) => (r.analyses[i] ? [{ g, a: r.analyses[i]! }] : []));
    return <ReportScreen games={done.map((d) => d.g)} analyses={done.map((d) => d.a)} />;
  }

  if (r.status === 'idle')
    return (
      <Panel
        icon="eye"
        title="Repasa tus últimas partidas"
        actions={
          <button className="t-btn t-btn-primary t-btn-lg" onClick={r.load}>
            Buscar mis partidas
          </button>
        }
      >
        <p>
          Buscaremos tus últimas 10 partidas de Lichess y tú eliges cuáles analizar. El análisis se hace en tu propio dispositivo y te
          enseñamos los errores que más pesaron, con su porqué.
        </p>
        <p className="muted">
          Cada partida tarda un rato. Puedes cancelar cuando quieras; lo ya analizado se guarda en este dispositivo. Con 3 partidas analizadas
          podrás ver tu informe.
        </p>
      </Panel>
    );

  if (r.status === 'loading-games')
    return (
      <section className="t-card rv-card" aria-live="polite">
        <Loading label="Buscando tus partidas en Lichess…" />
      </section>
    );

  if (r.status === 'loaded') {
    const busyNow = r.statuses.includes('analyzing');
    return (
      <section className="t-card rv-card" aria-labelledby="rv-title">
        <h1 id="rv-title">Tus últimas partidas</h1>
        <p className="muted" aria-live="polite">
          {busyNow
            ? `Analizando la partida ${r.statuses.indexOf('analyzing') + 1}. Solo se analiza una a la vez.`
            : `${r.analyzedCount} de ${r.games.length} partidas analizadas. Elige cuáles quieres analizar; se hace en tu dispositivo.`}
        </p>
        <ol className="rv-list">
          {r.games.map((g, i) => (
            <GameRow key={g.id} game={g} i={i} r={r} highlight={next === i} />
          ))}
        </ol>
        <div className={r.analyzedCount >= MIN_GAMES ? 'rv-actions rv-cta' : 'rv-actions'}>
          {r.analyzedCount >= MIN_GAMES ? (
            <button className="t-btn t-btn-primary" onClick={() => navigate('/partidas/informe')}>
              <Icon name="chart" size={20} />
              Ver mi informe
            </button>
          ) : (
            <p className="muted">Analiza al menos {MIN_GAMES} partidas para ver tu informe (llevas {r.analyzedCount}).</p>
          )}
        </div>
      </section>
    );
  }

  // status === 'error'
  const retry = (
    <button className="t-btn t-btn-primary" onClick={r.load}>
      Reintentar
    </button>
  );
  switch (failureOf(r.error)) {
    case 'not-found':
      return (
        <Panel icon="user" title="No encontramos tu usuario en Lichess" actions={retry}>
          <p>Lichess no tiene ninguna cuenta con ese nombre. Comprueba que has entrado con tu cuenta de Lichess.</p>
        </Panel>
      );
    case 'rate-limited':
      return <RateLimited onRetry={r.load} />;
    case 'offline':
      return (
        <Panel icon="alert" title="Sin conexión con Lichess" actions={retry}>
          <p>No hemos podido conectar. Revisa tu conexión a internet y vuelve a probar.</p>
        </Panel>
      );
    case 'few': {
      const have = (r.error as NotEnoughGamesError).available;
      const missing = 3 - have;
      return (
        <Panel icon="book" title="Aún hay pocas partidas para repasar" actions={retry}>
          <p>
            Necesitamos al menos 3 partidas terminadas de ajedrez estándar (blitz, rápidas, clásicas o por correo) con un mínimo de jugadas cada
            una. Tienes {have}, {missing === 1 ? 'te falta 1' : `te faltan ${missing}`}.
          </p>
          <p className="muted">Juega alguna más en Lichess y vuelve a intentarlo.</p>
        </Panel>
      );
    }
    default:
      return (
        <Panel icon="alert" title="No hemos podido cargar tus partidas" actions={retry}>
          <p>Algo ha fallado de forma inesperada. Prueba de nuevo en un momento.</p>
        </Panel>
      );
  }
}
