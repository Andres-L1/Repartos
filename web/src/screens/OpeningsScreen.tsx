import { useEffect, useMemo, useState } from 'react';
import type { OpeningsStats } from '../../../src/shared/api';
import { bookMoves, buildIndex, openingOfGame, positionKey, type OpeningIndex, type OpeningLine } from '../../../src/openings/index';
import { Board } from '../components/Board';
import { ErrorBox, Icon, Loading } from '../components/Icon';
import { api } from '../api';
import { applyUci, canonicalUci, lastMoveOf, needsPromotion, PROMO_ROLES, turnOf } from '../chess';
import { fmtGames, gamesOf, outcomeBar, pct } from '../openingsUi';
import { useSession } from '../session';
import '../openings.css';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
type Source = 'book' | 'masters';
const SOURCES: { id: Source; label: string }[] = [
  { id: 'book', label: 'Libro' },
  { id: 'masters', label: 'Maestros' },
];

interface Ply {
  fen: string;
  uci?: string;
  san?: string;
}
type StatsState = { kind: 'loading' } | { kind: 'ok'; stats: OpeningsStats } | { kind: 'unavailable' };

/** Texto «1. e4 e5 2. Nf3» de las jugadas hechas. */
function movesText(hist: Ply[]): string {
  return hist
    .slice(1)
    .map((p, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${p.san}` : p.san))
    .join(' ');
}

export function OpeningsScreen() {
  const { openingsStats } = useSession();
  const [index, setIndex] = useState<OpeningIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [hist, setHist] = useState<Ply[]>([{ fen: START_FEN }]);
  const [flipped, setFlipped] = useState(false);
  const [source, setSource] = useState<Source>('book');
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null);
  const [nonce, setNonce] = useState(0);
  const [stats, setStats] = useState<StatsState>({ kind: 'loading' });

  // Datos y código del libro: solo se descargan al entrar aquí (carga diferida).
  useEffect(() => {
    let live = true;
    import('../../../src/openings/openings.json')
      .then((data) => {
        if (live) setIndex(buildIndex(data.default as unknown as OpeningLine[]));
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const cur = hist[hist.length - 1]!;
  const key = positionKey(cur.fen);
  const opening = useMemo(() => (index ? openingOfGame(index, hist.map((p) => positionKey(p.fen))) : undefined), [index, hist]);
  const onPosition = !!index && opening !== undefined && openingOfGame(index, [key]) !== undefined;
  const book = useMemo(() => (index ? bookMoves(index, key) : []), [index, key]);
  const useStats = openingsStats && source !== 'book';
  const effective: Source = useStats ? source : 'book';

  useEffect(() => {
    if (effective === 'book') return;
    let live = true;
    setStats({ kind: 'loading' });
    void api.openingsStats(cur.fen, effective).then((r) => {
      if (live) setStats('unavailable' in r ? { kind: 'unavailable' } : { kind: 'ok', stats: r });
    });
    return () => {
      live = false;
    };
  }, [effective, cur.fen]);

  function play(rawUci: string) {
    const uci = canonicalUci(cur.fen, rawUci);
    const res = applyUci(cur.fen, uci);
    if (!res) {
      setNonce((n) => n + 1); // ilegal: la pieza vuelve a su sitio
      return;
    }
    setHist((h) => [...h, { fen: res.fen, uci, san: res.san }]);
  }
  function onBoardMove(from: string, to: string) {
    if (needsPromotion(cur.fen, from, to)) setPromo({ from, to });
    else play(from + to);
  }
  const last = cur.uci ? lastMoveOf(cur.uci) : undefined;
  const turn = turnOf(cur.fen) === 'white' ? 'blancas' : 'negras';

  if (failed) return <ErrorBox>No se pudo cargar el libro de aperturas. Recarga la página.</ErrorBox>;
  if (!index) return <Loading label="Cargando aperturas…" />;

  return (
    <div className="op">
      <header className="op-head">
        <p className="kicker">Aperturas</p>
        <h1>Explorador de aperturas</h1>
      </header>

      <div className="op-layout">
        <div className="op-board">
          <Board
            fen={cur.fen}
            interactive
            orientation={flipped ? 'black' : 'white'}
            lastMove={last}
            nonce={nonce}
            label={`Tablero del explorador. Mueven las ${turn}.`}
            onMove={onBoardMove}
          />
          {promo && (
            <div
              className="promo"
              role="dialog"
              aria-label="Elige la pieza de promoción"
              onKeyDown={(e) => {
                if (e.key !== 'Escape') return;
                setPromo(null);
                setNonce((n) => n + 1);
              }}
            >
              <p>Elige la pieza para coronar:</p>
              <div className="promo-options">
                {PROMO_ROLES.map((p, k) => (
                  <button
                    key={p.role}
                    autoFocus={k === 0}
                    className="t-btn"
                    onClick={() => {
                      const m = promo;
                      setPromo(null);
                      play(m.from + m.to + p.letter);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  className="t-btn t-btn-ghost"
                  onClick={() => {
                    setPromo(null);
                    setNonce((n) => n + 1);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          <div className="op-tools" role="group" aria-label="Controles del tablero">
            <button className="t-btn t-btn-sm" disabled={hist.length < 2} onClick={() => setHist((h) => h.slice(0, -1))}>
              <Icon name="back" size={18} /> Deshacer
            </button>
            <button className="t-btn t-btn-sm" disabled={hist.length < 2} onClick={() => setHist([{ fen: START_FEN }])}>
              <Icon name="repeat" size={18} /> Reiniciar
            </button>
            <button className="t-btn t-btn-sm" aria-pressed={flipped} onClick={() => setFlipped((f) => !f)}>
              <Icon name="repeat" size={18} /> Voltear
            </button>
          </div>
        </div>

        <div className="op-side">
          <section className="t-card op-now" aria-labelledby="op-now-title">
            <h2 id="op-now-title" className="sr-only">
              Posición actual
            </h2>
            <div aria-live="polite">
              {opening ? (
                <>
                  <p className="op-name">
                    <span className="op-eco">{opening.eco}</span> {opening.name}
                  </p>
                  {!onPosition && <p className="muted">Fuera del libro: se muestra la última apertura reconocida.</p>}
                </>
              ) : (
                <p className="op-name">{hist.length < 2 ? 'Posición inicial' : 'Posición fuera del libro de aperturas'}</p>
              )}
              {hist.length < 2 ? (
                <p className="muted">Juega una jugada en el tablero o elige una de la lista.</p>
              ) : (
                <p className="op-line">{movesText(hist)}</p>
              )}
            </div>
            <p className="muted">Mueven las {turn}.</p>
          </section>

          {openingsStats && (
            <div className="op-tabs" role="group" aria-label="Origen de los datos">
              {SOURCES.map((s) => (
                <button key={s.id} className="t-chip" aria-pressed={source === s.id} onClick={() => setSource(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {effective === 'book' ? (
            <section className="t-card" aria-labelledby="op-list-title">
              <h2 id="op-list-title">Jugadas del libro</h2>
              {book.length === 0 ? (
                <p className="muted">Esta posición no está en el libro de aperturas. Puedes seguir jugando o deshacer para volver.</p>
              ) : (
                <ul className="op-moves">
                  {book.map((m) => (
                    <li key={m.uci}>
                      <button className="op-move" onClick={() => play(m.uci)}>
                        <span className="op-san">{m.san}</span>
                        <span className="op-move-name">
                          {m.opening.name}
                          <span className="op-eco"> {m.opening.eco}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <StatsPanel state={stats} onPlay={play} book={index} fenKey={key} />
          )}
        </div>
      </div>
    </div>
  );
}

function Bar({ o }: { o: { white: number; draws: number; black: number } }) {
  const [w, d, b] = pct(o);
  return (
    <>
      <span className="op-bar" aria-hidden="true">
        <span className="op-bar-w" style={{ width: `${w}%` }} />
        <span className="op-bar-d" style={{ width: `${d}%` }} />
        <span className="op-bar-b" style={{ width: `${b}%` }} />
      </span>
      <span className="op-bar-text">
        <span className="sr-only">{outcomeBar(o)}</span>
        <span aria-hidden="true">
          Blancas {w} % · Tablas {d} % · Negras {b} %
        </span>
      </span>
    </>
  );
}

function StatsPanel({ state, onPlay, book, fenKey }: { state: StatsState; onPlay(uci: string): void; book: OpeningIndex; fenKey: string }) {
  const title = 'Partidas de maestros';
  const names = useMemo(() => new Map(bookMoves(book, fenKey).map((m) => [m.uci, m.opening.name])), [book, fenKey]);
  return (
    <section className="t-card" aria-labelledby="op-stats-title" aria-busy={state.kind === 'loading'}>
      <h2 id="op-stats-title">{title}</h2>
      {state.kind === 'loading' && <p className="muted" role="status">Consultando Lichess…</p>}
      {state.kind === 'unavailable' && (
        <p className="muted" role="status">
          Las estadísticas de Lichess no están disponibles ahora. El libro de aperturas sigue funcionando.
        </p>
      )}
      {state.kind === 'ok' &&
        (state.stats.moves.length === 0 ? (
          <p className="muted">Lichess no tiene partidas de esta posición.</p>
        ) : (
          <>
            <p className="op-total">
              {fmtGames(gamesOf(state.stats))} partidas en esta posición
            </p>
            <Bar o={state.stats} />
            <ul className="op-moves">
              {state.stats.moves.map((m) => (
                <li key={m.uci}>
                  <button className="op-move op-stat" onClick={() => onPlay(m.uci)}>
                    <span className="op-san">{m.san}</span>
                    <span className="op-move-name">
                      {fmtGames(gamesOf(m))} partidas{names.get(m.uci) ? ` · ${names.get(m.uci)}` : ''}
                    </span>
                    <Bar o={m} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ))}
      <p className="muted op-source">Estadísticas de Lichess (explorador de aperturas). Solo se consulta la posición, nunca tus datos.</p>
    </section>
  );
}
