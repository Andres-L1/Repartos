import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchRecentGames, LichessError } from '../../../src/lichess/fetch';
import { onlyNew, repAt, repIndex, repertoireFromGames, verifyOwn, type RepColor, type RepMove } from '../../../src/openings/repertoire';
import { Board } from '../components/Board';
import { ErrorBox, Icon, Loading } from '../components/Icon';
import { Link } from '../components/Link';
import { BrowserEngine } from '../engine/browser-engine';
import { applyUci, canonicalUci, lastMoveOf, needsPromotion, turnOf } from '../chess';
import { useRepertoire } from '../repertoire';
import { useSession } from '../session';
import '../openings.css';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const COLORS: { id: RepColor; label: string }[] = [
  { id: 'white', label: 'Blancas' },
  { id: 'black', label: 'Negras' },
];
const MAX_GAMES = 100;
const DEPTH = 10;

type Build =
  | { k: 'idle' }
  | { k: 'games' }
  | { k: 'engine'; done: number; total: number }
  | { k: 'preview'; fresh: RepMove[]; dropped: number; games: number }
  | { k: 'none'; games: number }
  | { k: 'error'; text: string };

export function RepertoireScreen() {
  const { user } = useSession();
  const rep = useRepertoire();
  const [color, setColor] = useState<RepColor>('white');
  const [drill, setDrill] = useState(false);
  const [build, setBuild] = useState<Build>({ k: 'idle' });
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

  if (!rep.moves) return rep.error ? <ErrorBox>{rep.error}</ErrorBox> : <Loading label="Cargando tu repertorio…" />;
  const all = rep.moves;
  const mine = all.filter((m) => m.color === color);
  const count = (c: RepColor) => all.filter((m) => m.color === c).length;

  async function create() {
    if (!user) return;
    const ac = new AbortController();
    abort.current = ac;
    const engine = new BrowserEngine();
    try {
      setBuild({ k: 'games' });
      const games = await fetchRecentGames(user.username, { signal: ac.signal, max: MAX_GAMES });
      const cand = repertoireFromGames(games, user.username);
      if (!cand.length) return setBuild({ k: 'none', games: games.length });
      setBuild({ k: 'engine', done: 0, total: cand.length });
      await engine.init();
      const ok = await verifyOwn(cand, engine, {
        depth: DEPTH,
        signal: ac.signal,
        onProgress: (done, total) => setBuild({ k: 'engine', done, total }),
      });
      setBuild({ k: 'preview', fresh: onlyNew(ok, all), dropped: cand.length - ok.length, games: games.length });
    } catch (e) {
      if ((e as { name?: string }).name === 'AbortError') return setBuild({ k: 'idle' });
      setBuild({ k: 'error', text: e instanceof LichessError || e instanceof Error ? e.message : 'No se pudo crear el repertorio.' });
    } finally {
      void engine.close();
    }
  }

  async function save(fresh: RepMove[]) {
    for (const c of COLORS) {
      const list = fresh.filter((m) => m.color === c.id);
      if (list.length) await rep.add(c.id, list);
    }
    setBuild({ k: 'idle' });
  }

  if (drill) return <Drill color={color} moves={all} onExit={() => setDrill(false)} />;

  return (
    <div className="op">
      <header className="op-head">
        <p className="kicker">Aperturas</p>
        <h1>Mi repertorio</h1>
        <p className="muted">
          <Link href="/aperturas">Volver al explorador</Link> para añadir líneas jugándolas en el tablero.
        </p>
      </header>
      {rep.error && <ErrorBox>{rep.error}</ErrorBox>}

      <div className="op-tabs" role="group" aria-label="Color del repertorio">
        {COLORS.map((c) => (
          <button key={c.id} className="t-chip" aria-pressed={color === c.id} onClick={() => setColor(c.id)}>
            {c.label} · {count(c.id)}
          </button>
        ))}
      </div>

      <section className="t-card rep-card" aria-labelledby="rep-drill">
        <h2 id="rep-drill">Repetir</h2>
        <p className="muted">Juega tu repertorio de memoria: el rival responde con sus jugadas guardadas y tú tienes que acertar las tuyas.</p>
        <button className="t-btn t-btn-primary" disabled={mine.length === 0} onClick={() => setDrill(true)}>
          <Icon name="repeat" size={18} /> Repetir con {color === 'white' ? 'blancas' : 'negras'}
        </button>
        {mine.length === 0 && <p className="muted">Aún no tienes jugadas con este color.</p>}
      </section>

      <section className="t-card rep-card" aria-labelledby="rep-build">
        <h2 id="rep-build">Crear a partir de tus partidas de Lichess</h2>
        <p className="muted">
          Leemos tus últimas partidas, comprobamos cada jugada tuya con Stockfish y conservamos solo las variantes que repites. Todo se hace en tu navegador: nada se guarda hasta que lo apruebes.
        </p>
        {build.k === 'idle' && (
          <button className="t-btn t-btn-primary" onClick={() => void create()}>
            <Icon name="book" size={18} /> Crear mi repertorio
          </button>
        )}
        {build.k === 'games' && <p role="status">Descargando tus partidas de Lichess…</p>}
        {build.k === 'engine' && (
          <div role="status">
            <p>
              Comprobando con el motor: {build.done} de {build.total}
            </p>
            <progress className="rep-progress" max={build.total} value={build.done} aria-label="Progreso de la comprobación" />
            <button className="t-btn t-btn-ghost" onClick={() => abort.current?.abort()}>
              Cancelar
            </button>
          </div>
        )}
        {build.k === 'none' && (
          <>
            <p role="status">
              Con tus últimas {build.games} partidas no hay jugadas que repitas lo bastante (mínimo 2 partidas). Juega más y vuelve a probar, o añade líneas desde el explorador.
            </p>
            <button className="t-btn" onClick={() => setBuild({ k: 'idle' })}>
              Entendido
            </button>
          </>
        )}
        {build.k === 'error' && (
          <>
            <ErrorBox>{build.text}</ErrorBox>
            <button className="t-btn" onClick={() => setBuild({ k: 'idle' })}>
              Reintentar
            </button>
          </>
        )}
        {build.k === 'preview' && (
          <div role="status">
            <p>
              <strong>{build.fresh.length} jugadas nuevas</strong> (Blancas {build.fresh.filter((m) => m.color === 'white').length} · Negras {build.fresh.filter((m) => m.color === 'black').length}) a partir de {build.games} partidas.
              {build.dropped > 0 && ` Se descartaron ${build.dropped} por dudosas.`}
            </p>
            <div className="op-tools">
              <button className="t-btn t-btn-primary" disabled={build.fresh.length === 0} onClick={() => void save(build.fresh)}>
                Guardar en mi repertorio
              </button>
              <button className="t-btn" onClick={() => setBuild({ k: 'idle' })}>
                Descartar
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="t-card rep-card" aria-labelledby="rep-edit">
        <h2 id="rep-edit">Modificar</h2>
        <p className="muted">Quita o añade jugadas desde el explorador: en cada posición verás las del repertorio y podrás quitarlas.</p>
        <button
          className="t-btn t-btn-ghost"
          disabled={mine.length === 0}
          onClick={() => {
            if (window.confirm(`¿Vaciar todo el repertorio de ${color === 'white' ? 'blancas' : 'negras'}? No se puede deshacer.`)) void rep.clear(color);
          }}
        >
          Vaciar repertorio de {color === 'white' ? 'blancas' : 'negras'}
        </button>
      </section>
    </div>
  );
}

function Drill({ color, moves, onExit }: { color: RepColor; moves: RepMove[]; onExit(): void }) {
  const idx = useMemo(() => repIndex(moves), [moves]);
  const [fen, setFen] = useState(START_FEN);
  const [last, setLast] = useState<[string, string] | undefined>();
  const [misses, setMisses] = useState(0);
  const [lineMisses, setLineMisses] = useState(0);
  const [lines, setLines] = useState(0);
  const [msg, setMsg] = useState('');
  const [hint, setHint] = useState(false);
  const [nonce, setNonce] = useState(0);
  const options = repAt(idx, color, fen);
  const mineTurn = turnOf(fen) === color;
  const done = options.length === 0;

  function play(uci: string) {
    const r = applyUci(fen, uci);
    if (!r) return;
    setFen(r.fen);
    setLast(lastMoveOf(uci));
    setHint(false);
    setMsg('');
  }

  // El rival responde solo, con una de sus jugadas guardadas.
  useEffect(() => {
    if (mineTurn || done) return;
    const t = window.setTimeout(() => play(options[Math.floor(Math.random() * options.length)]!), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  function onMove(from: string, to: string) {
    if (!mineTurn || done) return setNonce((n) => n + 1);
    const uci = canonicalUci(fen, needsPromotion(fen, from, to) ? `${from}${to}q` : from + to);
    if (options.includes(uci)) return play(uci);
    setMisses((n) => n + 1);
    setLineMisses((n) => n + 1);
    setMsg('Esa no es tu jugada de repertorio. Prueba otra o pide una pista.');
    setNonce((n) => n + 1);
  }
  function again() {
    if (done) setLines((n) => n + 1);
    setFen(START_FEN);
    setLast(undefined);
    setLineMisses(0);
    setHint(false);
    setMsg('');
  }
  const sans = options.map((u) => applyUci(fen, u)?.san ?? u).join(' o ');

  return (
    <div className="op">
      <header className="op-head">
        <p className="kicker">Mi repertorio</p>
        <h1>Repetir con {color === 'white' ? 'blancas' : 'negras'}</h1>
      </header>
      <div className="op-layout">
        <div className="op-board">
          <Board fen={fen} interactive orientation={color} lastMove={last} nonce={nonce} label="Tablero de repaso del repertorio" onMove={onMove} />
        </div>
        <div className="op-side">
          <section className="t-card rep-card" aria-live="polite">
            {done ? (
              <>
                <p className="op-name">{fen === START_FEN ? 'No hay jugadas guardadas' : 'Línea completada'}</p>
                {fen !== START_FEN && <p className="muted">{lineMisses === 0 ? 'Sin ningún fallo.' : `Fallos en esta línea: ${lineMisses}.`}</p>}
              </>
            ) : mineTurn ? (
              <p className="op-name">Tu turno: juega tu jugada del repertorio</p>
            ) : (
              <p className="op-name">Responde el rival…</p>
            )}
            {msg && <p role="alert">{msg}</p>}
            {hint && mineTurn && !done && <p className="op-line">Pista: {sans}</p>}
            <p className="muted">
              Líneas completadas: {lines + (done && fen !== START_FEN ? 1 : 0)} · Fallos: {misses}
            </p>
          </section>
          <div className="op-tools">
            {mineTurn && !done && (
              <button className="t-btn" onClick={() => setHint(true)}>
                Pista
              </button>
            )}
            <button className="t-btn t-btn-primary" onClick={again}>
              <Icon name="repeat" size={18} /> {done ? 'Otra línea' : 'Empezar de nuevo'}
            </button>
            <button className="t-btn t-btn-ghost" onClick={onExit}>
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
