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

type Failure = 'not-found' | 'rate-limited' | 'offline' | 'engine' | 'few' | 'other';

function failureOf(error: Error | undefined): Failure {
  if (error instanceof NotEnoughGamesError) return 'few';
  const kind = (error as { kind?: string } | undefined)?.kind;
  if (kind === 'not_found') return 'not-found';
  if (kind === 'rate_limited') return 'rate-limited';
  if (kind === 'network') return 'offline';
  if (error?.name === 'EngineError') return 'engine';
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

function rowState(i: number, r: UseReview): { label: string; cls: string } {
  if (i < r.ready.length) return { label: 'Lista', cls: 'ready' };
  if (r.status === 'analyzing' && i === r.ready.length) {
    const p = r.progress && r.progress.gameIndex === i ? r.progress : undefined;
    return { label: p ? `Analizando, ${Math.round((p.done / p.total) * 100)} %` : 'Analizando', cls: 'busy' };
  }
  return { label: 'En espera', cls: 'wait' };
}

function GameRow({ game, i, r, highlight }: { game: ReviewGame; i: number; r: UseReview; highlight: boolean }) {
  const st = rowState(i, r);
  const p = st.cls === 'busy' && r.progress?.gameIndex === i ? r.progress : undefined;
  return (
    <li className={`rv-row rv-${st.cls}${highlight ? ' rv-next' : ''}`} aria-current={highlight ? 'true' : undefined}>
      <div className="rv-row-main">
        <span className="rv-num" aria-hidden="true">{i + 1}</span>
        <div className="rv-row-text">
          <strong>
            {RESULT_LABEL[game.result]} con {game.color === 'white' ? 'blancas' : 'negras'}
          </strong>
          <span className="muted">{[SPEED_LABEL[game.speed] ?? game.speed, game.opening].filter(Boolean).join(' · ')}</span>
        </div>
        <span className="rv-status">
          {st.cls === 'ready' && <Icon name="check" size={18} />}
          {st.label}
        </span>
      </div>
      {p && <progress className="rv-bar" value={p.done} max={p.total} aria-label={`Progreso de la partida ${i + 1}`} />}
      {st.cls === 'ready' && (
        <button className="t-btn t-btn-secondary t-btn-sm" onClick={() => navigate(`/partidas/repaso/${i + 1}`)}>
          Repasar la partida {i + 1}
        </button>
      )}
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
        index={index}
        game={r.games[index - 1]}
        analysis={r.ready[index - 1]}
        onReviewed={(n) => setNext(n < r.ready.length ? n : null)}
      />
    );
  }
  if (path === '/partidas/informe') return <ReportScreen games={r.games} analyses={r.ready} />;

  if (r.status === 'idle')
    return (
      <Panel
        icon="eye"
        title="Repasa tus últimas partidas"
        actions={
          <button className="t-btn t-btn-primary t-btn-lg" onClick={r.start}>
            Analizar mis partidas
          </button>
        }
      >
        <p>
          Buscaremos tus últimas 10 partidas de Lichess, las analizaremos en tu propio navegador y te enseñaremos los errores que más
          pesaron, con su porqué.
        </p>
        <p className="muted">Tarda unos minutos. Puedes cancelar cuando quieras; lo ya analizado se guarda en este dispositivo.</p>
      </Panel>
    );

  if (r.status === 'loading-games')
    return (
      <section className="t-card rv-card" aria-live="polite">
        <Loading label="Buscando tus partidas en Lichess…" />
        <div className="rv-actions">
          <button className="t-btn t-btn-secondary" onClick={r.cancel}>
            Cancelar
          </button>
        </div>
      </section>
    );

  if (r.status === 'analyzing' || r.status === 'done')
    return (
      <section className="t-card rv-card" aria-labelledby="rv-title">
        <h1 id="rv-title">{r.status === 'done' ? 'Análisis terminado' : 'Analizando tus partidas'}</h1>
        <p className="muted" aria-live="polite">
          {r.status === 'done'
            ? `Las ${r.games.length} partidas están listas para repasar.`
            : `${r.ready.length} de ${r.games.length} partidas listas. Puedes repasar cada una en cuanto esté lista.`}
        </p>
        <ol className="rv-list">
          {r.games.map((g, i) => (
            <GameRow key={g.id} game={g} i={i} r={r} highlight={next === i} />
          ))}
        </ol>
        {r.ready.length >= MIN_GAMES && (
          <div className="rv-actions">
            <button className="t-btn t-btn-primary" onClick={() => navigate('/partidas/informe')}>
              <Icon name="chart" size={20} />
              {r.status === 'done' ? 'Ver mi informe' : `Ver informe con las ${r.ready.length} listas`}
            </button>
          </div>
        )}
        {r.status === 'analyzing' && (
          <div className="rv-actions">
            <button className="t-btn t-btn-secondary" onClick={r.cancel}>
              Cancelar
            </button>
          </div>
        )}
      </section>
    );

  // status === 'error'
  const retry = (
    <button className="t-btn t-btn-primary" onClick={r.start}>
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
      return <RateLimited onRetry={r.start} />;
    case 'offline':
      return (
        <Panel icon="alert" title="Sin conexión con Lichess" actions={retry}>
          <p>No hemos podido conectar. Revisa tu conexión a internet y vuelve a probar.</p>
        </Panel>
      );
    case 'engine':
      return (
        <Panel icon="alert" title="El motor de análisis no está disponible" actions={retry}>
          <p>El analizador no ha podido arrancar en este navegador. Lo ya analizado sigue guardado. Prueba de nuevo o usa otro navegador.</p>
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
        <Panel icon="alert" title="No hemos podido analizar tus partidas" actions={retry}>
          <p>Algo ha fallado de forma inesperada. Prueba de nuevo en un momento.</p>
        </Panel>
      );
  }
}
