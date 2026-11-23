import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchRecentGames, LichessError } from '../../../src/lichess/fetch';
import { positionKey } from '../../../src/openings/index';
import { lineToMoves, onlyNew, repAt, repIndex, repertoireFromGames, verifyOwn, type RepColor, type RepMove } from '../../../src/openings/repertoire';
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
const MAX_NOTE = 280;
const DEPTH = 10;

type Build =
  | { k: 'idle' }
  | { k: 'games' }
  | { k: 'engine'; done: number; total: number }
  | { k: 'preview'; fresh: RepMove[]; dropped: number; games: number }
  | { k: 'none'; games: number }
  | { k: 'error'; text: string };

interface Ply {
  fen: string;
  uci?: string;
  san?: string;
}
const START: Ply[] = [{ fen: START_FEN }];
const movesText = (hist: Ply[]) =>
  hist
    .slice(1)
    .map((p, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${p.san}` : p.san))
    .join(' ');

/** Una sola pantalla: el tablero es el editor. Juegas una línea, la guardas y comentas cada jugada. */
export function RepertoireScreen() {
  const rep = useRepertoire();
  const [color, setColor] = useState<RepColor>('white');
  const [drill, setDrill] = useState(false);
  const [hist, setHist] = useState<Ply[]>(START);
  const [nonce, setNonce] = useState(0);
  const all = rep.moves ?? [];
  const idx = useMemo(() => repIndex(all), [rep.moves]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rep.moves) return rep.error ? <ErrorBox>{rep.error}</ErrorBox> : <Loading label="Cargando tu repertorio…" />;
  if (drill) return <Drill color={color} moves={all} onExit={() => setDrill(false)} />;

  const mine = all.filter((m) => m.color === color);
  const count = (c: RepColor) => all.filter((m) => m.color === c).length;
  const cur = hist[hist.length - 1]!;
  const lineMoves = lineToMoves(color, hist.map((p) => p.fen), hist.slice(1).map((p) => p.uci!));
  const fresh = onlyNew(lineMoves, all);
  const last = lineMoves[lineMoves.length - 1];
  const lastStored = last && all.find((r) => r.color === last.color && r.key === last.key && r.uci === last.uci);
  const next = repAt(idx, color, cur.fen);

  function play(uci: string) {
    const res = applyUci(cur.fen, uci);
    if (!res) return setNonce((n) => n + 1);
    setHist((h) => [...h, { fen: res.fen, uci, san: res.san }]);
  }
  function onMove(from: string, to: string) {
    // shortcut: coronar siempre dama; subir a otra pieza en un repertorio es rarísimo.
    play(canonicalUci(cur.fen, needsPromotion(cur.fen, from, to) ? `${from}${to}q` : from + to));
  }
  const pick = (c: RepColor) => {
    setColor(c);
    setHist(START);
  };
  const colorName = color === 'white' ? 'blancas' : 'negras';

  return (
    <div className="op">
      <header className="op-head">
        <p className="kicker">Aperturas</p>
        <h1>Mi repertorio</h1>
        <p className="muted">
          Juega una línea en el tablero, guárdala y comenta las jugadas que quieras. Para curiosear aperturas usa el <Link href="/aperturas">explorador</Link>.
        </p>
      </header>
      {rep.error && <ErrorBox>{rep.error}</ErrorBox>}

      <div className="op-tabs" role="group" aria-label="Color del repertorio">
        {COLORS.map((c) => (
          <button key={c.id} className="t-chip" aria-pressed={color === c.id} onClick={() => pick(c.id)}>
            {c.label} · {count(c.id)}
          </button>
        ))}
      </div>

      <div className="op-layout">
        <div className="op-board">
          <Board
            fen={cur.fen}
            interactive
            orientation={color}
            lastMove={cur.uci ? lastMoveOf(cur.uci) : undefined}
            nonce={nonce}
            label={`Tablero del repertorio de ${colorName}`}
            onMove={onMove}
          />
          <div className="op-tools" role="group" aria-label="Controles del tablero">
            <button className="t-btn t-btn-sm" disabled={hist.length < 2} onClick={() => setHist((h) => h.slice(0, -1))}>
              <Icon name="back" size={18} /> Deshacer
            </button>
            <button className="t-btn t-btn-sm" disabled={hist.length < 2} onClick={() => setHist(START)}>
              <Icon name="repeat" size={18} /> Inicio
            </button>
          </div>
        </div>

        <div className="op-side">
          <section className="t-card rep-card" aria-labelledby="rep-line">
            <h2 id="rep-line">{hist.length < 2 ? 'Posición inicial' : 'Línea actual'}</h2>
            {hist.length < 2 ? <p className="muted">Mueve una pieza para empezar tu línea.</p> : <p className="op-line">{movesText(hist)}</p>}
            {last && (
              <>
                <p>
                  Jugada <strong>{cur.san}</strong>: {lastStored ? 'guardada en tu repertorio' : 'aún sin guardar'}.
                </p>
                {lastStored ? (
                  <>
                    <NoteBox key={`${last.key}|${last.uci}`} value={lastStored.note ?? ''} onSave={(t) => void rep.note(last, t)} />
                    <button className="t-btn t-btn-sm" onClick={() => void rep.remove(last)}>
                      Quitar esta jugada
                    </button>
                  </>
                ) : (
                  <p className="muted">Guarda la línea para poder comentarla.</p>
                )}
              </>
            )}
            <button className="t-btn t-btn-primary" disabled={fresh.length === 0} onClick={() => void rep.add(color, fresh)}>
              {fresh.length ? `Guardar línea (${fresh.length} jugadas nuevas)` : hist.length < 2 ? 'Guardar línea' : 'Línea ya guardada'}
            </button>
          </section>

          {next.length > 0 && (
            <section className="t-card rep-card" aria-labelledby="rep-next">
              <h2 id="rep-next">Sigue tu repertorio</h2>
              <ul className="op-moves">
                {next.map((u) => {
                  const m = all.find((r) => r.color === color && r.key === positionKey(cur.fen) && r.uci === u);
                  return (
                    <li key={u}>
                      <button className="op-move" onClick={() => play(u)}>
                        <span className="op-san">{applyUci(cur.fen, u)?.san ?? u}</span>
                        <span className="op-move-name">{m?.note || (turnOf(cur.fen) === color ? 'Tu jugada' : 'Respuesta del rival')}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="t-card rep-card" aria-labelledby="rep-act">
            <h2 id="rep-act">Practicar</h2>
            <button className="t-btn t-btn-primary" disabled={mine.length === 0} onClick={() => setDrill(true)}>
              <Icon name="repeat" size={18} /> Repetir con {colorName}
            </button>
            {mine.length === 0 && <p className="muted">Guarda alguna línea para poder repetirla.</p>}
          </section>

          <FromGames all={all} add={rep.add} />

          <details className="rep-more">
            <summary>Más opciones</summary>
            <button
              className="t-btn t-btn-ghost"
              disabled={mine.length === 0}
              onClick={() => {
                if (window.confirm(`¿Vaciar todo el repertorio de ${colorName}, comentarios incluidos? No se puede deshacer.`)) {
                  void rep.clear(color);
                  setHist(START);
                }
              }}
            >
              Vaciar repertorio de {colorName}
            </button>
          </details>
        </div>
      </div>
    </div>
  );
}

/** Comentario de una jugada: se guarda al salir del campo. */
function NoteBox({ value, onSave }: { value: string; onSave(text: string): void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <label className="rep-note">
      <span className="muted">Comentario (solo lo ves tú)</span>
      <textarea
        value={text}
        maxLength={MAX_NOTE}
        rows={3}
        placeholder="Por qué se juega, plan, trampa a evitar…"
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text.trim() !== value && onSave(text)}
      />
      <span className="muted">
        {text.length}/{MAX_NOTE}
      </span>
    </label>
  );
}

/** Importar desde las partidas de Lichess; todo en el navegador y nada se guarda sin aprobar. */
function FromGames({ all, add }: { all: RepMove[]; add(color: RepColor, list: RepMove[]): Promise<void> }) {
  const { user } = useSession();
  const [build, setBuild] = useState<Build>({ k: 'idle' });
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

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
      if (list.length) await add(c.id, list);
    }
    setBuild({ k: 'idle' });
  }

  return (
    <section className="t-card rep-card" aria-labelledby="rep-build">
      <h2 id="rep-build">Importar de tus partidas de Lichess</h2>
      <p className="muted">Comprobamos tus jugadas con Stockfish y conservamos solo las que repites. Todo en tu navegador; nada se guarda hasta que lo apruebes.</p>
      {build.k === 'idle' && (
        <button className="t-btn" onClick={() => void create()}>
          <Icon name="book" size={18} /> Importar
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
          <p role="status">Con tus últimas {build.games} partidas no hay jugadas que repitas lo bastante (mínimo 2 partidas).</p>
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
  );
}

function Drill({ color, moves, onExit }: { color: RepColor; moves: RepMove[]; onExit(): void }) {
  const idx = useMemo(() => repIndex(moves), [moves]);
  const noteOf = useMemo(() => new Map(moves.filter((m) => m.note).map((m) => [`${m.color}|${m.key}|${m.uci}`, m.note!])), [moves]);
  const [fen, setFen] = useState(START_FEN);
  const [last, setLast] = useState<[string, string] | undefined>();
  const [misses, setMisses] = useState(0);
  const [lineMisses, setLineMisses] = useState(0);
  const [lines, setLines] = useState(0);
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');
  const [hint, setHint] = useState(false);
  const [nonce, setNonce] = useState(0);
  const options = repAt(idx, color, fen);
  const mineTurn = turnOf(fen) === color;
  const done = options.length === 0;

  function play(uci: string) {
    const r = applyUci(fen, uci);
    if (!r) return;
    setNote(noteOf.get(`${color}|${positionKey(fen)}|${uci}`) ?? '');
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
    setNote('');
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
            {note && <p className="op-line">Tu comentario: {note}</p>}
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
