import { useEffect, useMemo, useState } from 'react';
import type { BoardMark, Lesson } from '../../../src/content/schema';
import type { OutlineUnit } from '../../../src/shared/api';
import { STREAK_DAYS_PER_CHEDEX } from '../../../src/shop/catalog';
import { api, ApiError } from '../api';
import { Board, marksToShapes } from '../components/Board';
import { LessonPlayer } from '../components/LessonPlayer';
import { PracticeBoard } from '../components/PracticeBoard';
import { Coin } from '../components/ShopVisuals';
import { LEVEL_LABEL } from './MapScreen';
import { applyUci, lastMoveOf, turnOf } from '../chess';
import { navigate } from '../router';
import { useSession } from '../session';
import { LichessLogin } from './Auth';
import { Icon, Loading } from '../components/Icon';
import { Link } from '../components/Link';
import '../landing.css';

function useDemo() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api
      .demo()
      .then((r) => setLesson(r.lesson))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudo cargar la demostración.'));
  }, []);
  return { lesson, error };
}

function HeroDemo({ lesson }: { lesson: Lesson | null }) {
  const base = lesson?.practice[0] ?? lesson?.evaluation[0];
  // marca la pieza que se mueve (sin enseñar la jugada)
  const step = base && { ...base, squares: base.squares ?? [base.solutionUci[0]?.slice(0, 2) ?? ''].filter(Boolean) };
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  if (!lesson || !step) {
    return (
      <div className="demo-card" aria-busy="true">
        <div className="board-placeholder" role="img" aria-label="Cargando tablero" />
      </div>
    );
  }
  return (
    <div className="demo-card" id="demo">
      {done ? (
        <div className="demo-done" role="status">
          <h2>Ya has hecho tu primera jugada</h2>
          <p>Así es cada lección: una idea, una posición y tú moviendo las piezas.</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => navigate('/demo')}>
              Seguir con la lección completa
            </button>
            <button
              className="btn"
              onClick={() => {
                setDone(false);
                setRound((r) => r + 1);
              }}
            >
              Repetir
            </button>
          </div>
        </div>
      ) : (
        <PracticeBoard key={round} step={step} mode="practice" isLast plain onDone={() => setDone(true)} />
      )}
    </div>
  );
}

function MiniBoard({ fen, marks, lastMove, label }: { fen?: string; marks?: BoardMark; lastMove?: [string, string]; label: string }) {
  const shapes = useMemo(() => marksToShapes(marks), [marks]);
  if (!fen) return <div className="board-placeholder" role="img" aria-label="Cargando tablero" />;
  return <Board fen={fen} orientation={turnOf(fen)} shapes={shapes} lastMove={lastMove} plain label={label} />;
}

/** Una fila de casillas a-h: la regla que separa las secciones. Decorativa. */
function Ruler() {
  return (
    <div className="ruler" aria-hidden="true">
      {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f) => (
        <span key={f}>{f}</span>
      ))}
    </div>
  );
}

function LessonParts({ lesson }: { lesson: Lesson | null }) {
  const practice = lesson?.practice[0];
  const wrong = useMemo(() => {
    if (!practice) return null;
    const [uci, text] = Object.entries(practice.wrongByMove ?? {})[0] ?? [];
    const res = uci ? applyUci(practice.fen, uci) : null;
    if (res && uci && text) return { fen: res.fen, last: lastMoveOf(uci), text };
    return { fen: practice.fen, last: undefined, text: practice.explanationWrong };
  }, [practice]);
  const parts = [
    {
      title: 'Introducción',
      text: 'En un par de frases: qué vas a ver y para qué sirve.',
      visual: <p className="part-quote">{lesson?.title ?? ''}</p>,
    },
    {
      title: 'Explicación',
      text: 'Sobre una posición real, con casillas marcadas y flechas que señalan la idea.',
      visual: <MiniBoard fen={lesson?.explanation[0]?.fen} marks={lesson?.explanation[0]} label="Ejemplo de explicación con flechas" />,
    },
    {
      title: 'Práctica',
      text: 'Haces tú la jugada. Si la necesitas, tienes una pista.',
      visual: <MiniBoard fen={practice?.fen} marks={practice} label="Ejemplo de ejercicio de práctica" />,
    },
    {
      title: 'Corrección',
      text: wrong ? `Si fallas, te decimos por qué: «${wrong.text}»` : 'Si fallas, te decimos por qué y puedes reintentar.',
      visual: <MiniBoard fen={wrong?.fen} lastMove={wrong?.last} label="Posición tras una jugada incorrecta" />,
    },
    {
      title: 'Evaluación',
      text: 'Posiciones nuevas y sin pistas. Al superarlas se abre la siguiente lección.',
      visual: <MiniBoard fen={lesson?.evaluation[0]?.fen} label="Ejemplo de evaluación" />,
    },
  ];
  return (
    <section className="section" aria-labelledby="parts-title">
      <Ruler />
      <h2 id="parts-title">Cada lección tiene cinco partes</h2>
      <p className="muted section-sub">Los tableros son de la lección de demostración.</p>
      <ol className="parts">
        {parts.map((x, i) => (
          <li key={x.title} className="part">
            <div className="part-visual">{x.visual}</div>
            <div className="part-text">
              <h3>
                <span className="part-n" aria-hidden="true">
                  {i + 1}
                </span>
                {x.title}
              </h3>
              <p>{x.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function levelText(level: OutlineUnit['level']): string {
  const [name, range] = LEVEL_LABEL[level].split(' · ');
  return range ? `${name}, ${range.replace('-', ' a ')} Elo` : (name ?? '');
}

function Route() {
  const [units, setUnits] = useState<OutlineUnit[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState<Set<string>>(new Set());
  useEffect(() => {
    let live = true;
    api
      .outline()
      .then((r) => {
        if (!live) return;
        const sorted = [...r.units].sort((a, b) => a.order - b.order);
        setUnits(sorted);
        const first = sorted[0];
        if (first) setOpen(new Set([first.id]));
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  const total = units?.reduce((n, u) => n + u.lessons.length, 0) ?? 0;
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <section className="section" aria-labelledby="route-title">
      <Ruler />
      <div className="route-grid">
        <header className="route-head">
          <h2 id="route-title">Lo que vas a aprender</h2>
          <p className="muted">
            {units
              ? `${units.length} unidades y ${total} lecciones, en este orden. Empiezas por las piezas y llegas a las primeras tácticas.`
              : 'Un camino ordenado, de las piezas a las primeras tácticas.'}
          </p>
        </header>
        <div className="route-body">
          {failed && (
            <div className="route-error" role="alert">
              <p>No hemos podido cargar el temario. Comprueba tu conexión e inténtalo de nuevo.</p>
              <button
                className="btn"
                onClick={() => {
                  setFailed(false);
                  setAttempt((n) => n + 1);
                }}
              >
                Reintentar
              </button>
            </div>
          )}
          {!units && !failed && (
            <div className="route-loading" role="status" aria-label="Cargando el temario">
              {[0, 1, 2].map((i) => (
                <div key={i} className="route-skel">
                  <span className="skeleton" />
                  <span className="skeleton" />
                </div>
              ))}
            </div>
          )}
          {units && (
            <ol className="route">
              {units.map((u) => {
                const isOpen = open.has(u.id);
                const listId = `route-l-${u.id}`;
                return (
                  <li key={u.id} className="route-unit">
                    <span className="route-node" aria-hidden="true">
                      {u.order}
                    </span>
                    <h3>
                      <span className="sr-only">Unidad {u.order}: </span>
                      {u.title}
                    </h3>
                    <p className="route-level">{levelText(u.level)}</p>
                    <p className="route-desc">{u.description}</p>
                    <button className="route-toggle" aria-expanded={isOpen} aria-controls={listId} onClick={() => toggle(u.id)}>
                      <span className="route-chev" aria-hidden="true" />
                      {isOpen ? 'Ocultar' : 'Ver'} {u.lessons.length} {u.lessons.length === 1 ? 'lección' : 'lecciones'}
                      <span className="sr-only"> de la unidad {u.order}</span>
                    </button>
                    <ol id={listId} className="route-lessons" hidden={!isOpen}>
                      {u.lessons.map((l, i) => (
                        <li key={l.id}>
                          <span className="route-ln" aria-hidden="true">
                            {u.order}.{i + 1}
                          </span>
                          {l.title}
                        </li>
                      ))}
                    </ol>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function LichessData() {
  return (
    <section className="section" aria-labelledby="data-title">
      <Ruler />
      <div className="data-grid">
        <h2 id="data-title">Qué usamos de tu cuenta de Lichess</h2>
        <div className="data-body">
          <p>
            Solo tu nombre de usuario y tu Elo en rápidas, clásicas y blitz, para recomendarte dónde empezar. No guardamos tu token
            ni te pedimos la contraseña.
          </p>
          <p>
            <Link className="data-link" href="/privacidad">
              Leer la política de privacidad
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function ChedexNote() {
  return (
    <aside className="chedex-note" aria-label="Tienda de Chedex">
      <Coin size={44} />
      <p>
        Por cada {STREAK_DAYS_PER_CHEDEX} días de racha ganas 1 Chedex. Sirve para personalizar las piezas y el tablero en la tienda.
      </p>
    </aside>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <p className="footer-brand">
          <Coin size={28} /> Chedex Pulse
        </p>
        <p className="muted footer-text">
          Entrenamiento de ajedrez de 0 a 800 Elo. No estamos afiliados a Lichess; solo usamos su acceso para identificarte.
        </p>
        <nav className="footer-links" aria-label="Pie de página">
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/creditos">Créditos</Link>
          <span className="chip chip-beta">Beta abierta</span>
        </nav>
      </div>
    </footer>
  );
}

export function Landing() {
  const { user, billingMode } = useSession();
  const { lesson } = useDemo();
  return (
    <div className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-head">
          <h1 id="hero-title">Aprende ajedrez moviendo tú las piezas, de 0 a 800 Elo</h1>
          <div className="hero-sub">
            <p className="lead">
              Lecciones cortas sobre un tablero real. Si te equivocas, te explicamos el error y avanzas cuando lo has entendido.
            </p>
            <div className="actions">
              {user ? (
                <button className="btn btn-primary btn-large" onClick={() => navigate('/aprender')}>
                  Ir a mi ruta de aprendizaje
                </button>
              ) : (
                <LichessLogin large />
              )}
              <Link className="btn btn-large" href="/demo">
                Probar una lección
              </Link>
            </div>
            <p className="muted hero-note">
              {billingMode === 'beta_open' ? 'Beta abierta: gratis mientras la probamos.' : 'Sin permanencia: cancela cuando quieras.'}
            </p>
          </div>
        </div>
        <HeroDemo lesson={lesson} />
      </section>

      <LessonParts lesson={lesson} />
      <Route />
      <LichessData />
      <ChedexNote />
    </div>
  );
}

export function DemoScreen() {
  const { lesson, error } = useDemo();
  if (error) {
    return (
      <div className="card empty-state" role="alert">
        <span className="empty-icon" aria-hidden="true">
          <Icon name="alert" size={28} />
        </span>
        <p>{error}</p>
        <button className="btn" onClick={() => navigate('/')}>
          Volver
        </button>
      </div>
    );
  }
  if (!lesson) return <Loading label="Cargando demostración…" />;
  return (
    <>
      <p className="banner">
        <Icon name="gift" size={18} />{' '}
        Demostración gratuita: no necesitas cuenta. Tu progreso no se guarda.
      </p>
      <LessonPlayer lesson={lesson} demo />
    </>
  );
}
