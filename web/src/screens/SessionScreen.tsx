import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnswerResult, FinishResult, SessionItem, SessionStart, SessionStatus } from '../../../src/shared/api';
import { CONCEPTS } from '../../../src/pedagogy/concepts';
import { ruleFor } from '../../../src/pedagogy/review-copy';
import { api, ApiError } from '../api';
import { applyUci, canonicalUci, lastMoveOf, needsPromotion, turnOf } from '../chess';
import { playSound } from '../sound';
import { Board } from '../components/Board';
import { Icon, Loading } from '../components/Icon';
import { Link } from '../components/Link';
import '../review-lesson.css';
import '../session.css';

const conceptName = (id: string) => CONCEPTS.find((c) => c.id === id)?.name ?? 'Ajedrez táctico';
const formatDay = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
const dueText = (n: number) => `Hoy toca repasar ${n} ${n === 1 ? 'concepto' : 'conceptos'}`;
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Ha ocurrido un error inesperado.');

/** Tarjeta de entrada (mapa y perfil): recuento de conceptos que tocan, o «Hoy no toca repasar» con la próxima fecha. */
export function TrainCard() {
  const [st, setSt] = useState<SessionStatus | null>(null);
  useEffect(() => {
    api.sessionStatus().then(setSt).catch(() => {});
  }, []);
  const text =
    st === null
      ? 'Repasa tus puntos débiles con unas pocas posiciones.'
      : st.due > 0
        ? dueText(st.due)
        : `Hoy no toca repasar${st.nextDueAt ? `. Próximo repaso: ${formatDay(st.nextDueAt)}.` : '.'}`;
  return (
    <section className="t-card ss-train" aria-labelledby="train-title">
      <div>
        <h2 id="train-title">Entrenar hoy</h2>
        <p className="muted">{text}</p>
      </div>
      <Link className={`t-btn${st && st.due > 0 ? ' t-btn-primary' : ''}`} href="/entrenar">
        <Icon name="repeat" size={18} /> Entrenar hoy
      </Link>
    </section>
  );
}

type Phase =
  | { k: 'loading' }
  | { k: 'intro'; status: SessionStatus }
  | { k: 'play'; start: SessionStart; i: number }
  | { k: 'finishing' }
  | { k: 'summary'; result: FinishResult }
  | { k: 'error'; message: string; retry: () => void };

export function SessionScreen() {
  const [phase, setPhase] = useState<Phase>({ k: 'loading' });

  const loadStatus = useCallback(() => {
    setPhase({ k: 'loading' });
    api
      .sessionStatus()
      .then((status) => setPhase({ k: 'intro', status }))
      .catch((e) => setPhase({ k: 'error', message: errMsg(e), retry: loadStatus }));
  }, []);
  useEffect(loadStatus, [loadStatus]);

  const start = () => {
    setPhase({ k: 'loading' });
    api
      .session()
      .then((s) => setPhase({ k: 'play', start: s, i: 0 }))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 409) loadStatus();
        else setPhase({ k: 'error', message: errMsg(e), retry: start });
      });
  };

  const finish = (sessionId: string) => {
    setPhase({ k: 'finishing' });
    api
      .finish(sessionId)
      .then((result) => setPhase({ k: 'summary', result }))
      .catch((e) => setPhase({ k: 'error', message: errMsg(e), retry: () => finish(sessionId) }));
  };

  if (phase.k === 'loading') return <Loading label="Cargando…" />;
  if (phase.k === 'finishing') return <Loading label="Guardando tu sesión…" />;

  return (
    <div className="ss">
      <header className="ss-head page-head">
        <div>
          <p className="kicker">Entrenar hoy</p>
          <h1>{phase.k === 'summary' ? 'Sesión terminada' : 'Repaso del día'}</h1>
        </div>
        {phase.k === 'play' && (
          <Link className="t-btn t-btn-ghost t-btn-sm" href="/aprender">
            Salir
          </Link>
        )}
      </header>

      {phase.k === 'error' && (
        <div className="t-alert t-alert-warn ss-alert" role="alert">
          <Icon name="alert" size={20} />
          <span>{phase.message}</span>
          <button type="button" className="t-btn t-btn-sm" onClick={phase.retry}>
            Reintentar
          </button>
        </div>
      )}

      {phase.k === 'intro' && <Intro status={phase.status} onStart={start} />}

      {phase.k === 'play' && (
        <>
          <Progress i={phase.i} total={phase.start.items.length} />
          <ItemView
            key={phase.start.items[phase.i]!.itemId}
            item={phase.start.items[phase.i]!}
            last={phase.i === phase.start.items.length - 1}
            onNext={() => (phase.i + 1 < phase.start.items.length ? setPhase({ ...phase, i: phase.i + 1 }) : finish(phase.start.sessionId))}
          />
        </>
      )}

      {phase.k === 'summary' && <Summary result={phase.result} />}
    </div>
  );
}

function Intro({ status, onStart }: { status: SessionStatus; onStart: () => void }) {
  if (status.due === 0)
    return (
      <div className="t-card ss-card m-enter">
        <h2>Hoy no toca repasar</h2>
        <p>
          {status.nextDueAt
            ? `Tu próximo repaso es el ${formatDay(status.nextDueAt)}. Mientras tanto puedes seguir con tus lecciones.`
            : 'Cuando analices una partida o falles algo en una lección, aquí te prepararemos repasos.'}
        </p>
        <div className="ss-cta">
          <Link className="t-btn t-btn-primary" href="/aprender">
            Ir a Aprender
          </Link>
        </div>
      </div>
    );
  return (
    <div className="t-card ss-card m-enter">
      <h2>{dueText(status.due)}</h2>
      <p>Verás unas pocas posiciones, una cada vez. Mueve la pieza en el tablero. Si fallas, puedes probar otra vez.</p>
      <div className="ss-cta">
        <button type="button" className="t-btn t-btn-primary" onClick={onStart}>
          Empezar
        </button>
      </div>
    </div>
  );
}

function Progress({ i, total }: { i: number; total: number }) {
  return (
    <div className="ss-bar">
      <p className="ss-bar-text">
        Posición {i + 1} de {total}
      </p>
      <div
        className="ss-bar-track"
        role="progressbar"
        aria-label="Progreso de la sesión"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={i}
        aria-valuetext={`${i} de ${total} terminadas`}
      >
        <span className="ss-bar-fill" style={{ width: `${(i / total) * 100}%` }} />
      </div>
    </div>
  );
}

type Status = 'ready' | 'busy' | 'wrong' | 'solved' | 'revealed';
interface Fail {
  message: string;
  retry: () => void;
}

function ItemView({ item, last, onNext }: { item: SessionItem; last: boolean; onNext: () => void }) {
  const fenRef = useRef(item.fen);
  const [fen, setFen] = useState(item.fen);
  const [lastMove, setLastMove] = useState<[string, string] | undefined>();
  const [nonce, setNonce] = useState(0);
  const [status, setStatus] = useState<Status>('ready');
  const [fail, setFail] = useState<Fail | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (ms: number, fn: () => void) => void timers.current.push(window.setTimeout(fn, ms));

  const show = (f: string, mv?: [string, string]) => {
    fenRef.current = f;
    setFen(f);
    setLastMove(mv);
  };
  const play = (uci: string) => {
    const r = applyUci(fenRef.current, uci);
    if (r) show(r.fen, lastMoveOf(uci));
  };
  const revert = (to: string) => {
    show(to);
    setNonce((n) => n + 1);
  };

  async function send(uci: string, before: string) {
    setStatus('busy');
    setFail(null);
    let r: AnswerResult;
    try {
      r = await api.answer({ itemId: item.itemId, uci });
    } catch (e) {
      // La jugada sigue en el tablero: «Reintentar» vuelve a enviar la misma.
      const gone = e instanceof ApiError && e.status === 404;
      setFail({
        message: gone ? 'Esta sesión ya no está disponible. Vuelve a empezar.' : errMsg(e),
        retry: gone ? () => window.location.reload() : () => void send(uci, before),
      });
      return;
    }
    if (r.correct) {
      if (r.reply) later(550, () => play(r.reply!));
      later(r.reply ? 800 : 250, () => {
        if (r.done) {
          setStatus('solved');
          playSound('correct');
        } else setStatus('ready');
      });
    } else if (r.tryAgain) {
      setStatus('wrong');
      later(750, () => {
        revert(before);
        setStatus('ready');
      });
    } else {
      setStatus('wrong');
      const sol = r.solution ?? [];
      later(750, () => {
        revert(before);
        sol.forEach((u, k) => later(500 * (k + 1), () => play(u)));
        later(500 * (sol.length + 1), () => setStatus('revealed'));
      });
    }
  }

  function onMove(from: string, to: string) {
    const before = fenRef.current;
    let uci = canonicalUci(before, from + to); // el enroque llega como e1g1, no e1h1
    if (needsPromotion(before, from, to)) uci += 'q'; // se corona a dama
    const res = applyUci(before, uci);
    if (!res) {
      setNonce((n) => n + 1);
      return;
    }
    show(res.fen, lastMoveOf(uci));
    void send(uci, before);
  }

  const done = status === 'solved' || status === 'revealed';
  const playable = status === 'ready' && !fail;

  return (
    <section className="rl" aria-label="Posición para repasar">
      <div className="rl-layout">
        <div className="rl-board">
          <Board
            fen={fen}
            orientation={turnOf(item.fen)}
            lastMove={lastMove}
            interactive={playable}
            nonce={nonce}
            onMove={playable ? onMove : undefined}
            label={playable ? 'Tablero: mueve una pieza' : 'Tablero del repaso'}
          />
        </div>
        <div className="rl-panel">
          <p className="ss-concept">{conceptName(item.conceptId)}</p>
          <div className="rl-text" aria-live="polite">
            <div className="rl-step m-swap" key={status + (fail ? 'f' : '')}>
              <p className="rl-question">{item.prompt}</p>
              {status === 'ready' && !fail && <p className="rl-hint">Arrastra la pieza, o tócala y toca la casilla a la que va.</p>}
              {status === 'wrong' && (
                <p className="rl-feedback is-kind">
                  <Icon name="bulb" size={18} /> Esa no es. Mira la posición con calma.
                </p>
              )}
              {status === 'solved' && (
                <p className="rl-feedback is-good">
                  <Icon name="check" size={18} /> Bien visto.
                </p>
              )}
              {status === 'revealed' && (
                <p className="rl-feedback is-kind">
                  <Icon name="bulb" size={18} /> Esta era la jugada. No pasa nada: así se aprende.
                </p>
              )}
              {done && (
                <p className="rl-rule">
                  <span className="rl-rule-tag">La regla</span>
                  {ruleFor(item.conceptId)}
                </p>
              )}
              {fail && (
                <p className="rl-feedback is-kind" role="alert">
                  <Icon name="alert" size={18} /> {fail.message}
                </p>
              )}
            </div>
          </div>
        </div>
        {(done || fail) && (
          <div className="rl-actions">
            {fail && (
              <button type="button" className="t-btn t-btn-primary rl-btn" onClick={fail.retry}>
                Reintentar
              </button>
            )}
            {done && (
              <button type="button" className="t-btn t-btn-primary rl-btn" onClick={onNext}>
                {last ? 'Ver resumen' : 'Siguiente'}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Summary({ result }: { result: FinishResult }) {
  const missed = result.reviewed.find((r) => !r.correct);
  const n = result.reviewed.length;
  return (
    <div className="t-card ss-card m-enter">
      <h2>
        Has repasado {n} {n === 1 ? 'concepto' : 'conceptos'}
      </h2>
      <ul className="ss-list">
        {result.reviewed.map((r) => (
          <li key={r.conceptId}>
            <Icon name={r.correct ? 'check' : 'repeat'} size={18} />
            <span>
              {conceptName(r.conceptId)}
              <span className="muted">{r.correct ? ' · a la primera' : ' · lo volverás a ver pronto'}</span>
            </span>
          </li>
        ))}
      </ul>
      {missed && (
        <p className="rl-rule">
          <span className="rl-rule-tag">La regla de hoy: {conceptName(missed.conceptId)}</span>
          {ruleFor(missed.conceptId)}
        </p>
      )}
      <p>{result.nextDueAt ? `Próximo repaso: ${formatDay(result.nextDueAt)}.` : 'Por hoy has terminado.'}</p>
      <div className="ss-cta">
        <Link className="t-btn t-btn-primary" href="/aprender">
          Volver a Aprender
        </Link>
      </div>
    </div>
  );
}
