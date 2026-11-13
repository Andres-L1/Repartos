import { useEffect, useMemo, useState } from 'react';
import type { BoardMark, Lesson } from '../../../src/content/schema';
import { api, ApiError } from '../api';
import { Board, marksToShapes } from '../components/Board';
import { LessonPlayer } from '../components/LessonPlayer';
import { PracticeBoard } from '../components/PracticeBoard';
import { Coin } from '../components/ShopVisuals';
import { Cycle, Pricing, Path, Problem, Quality, ShopLine, Trainer } from './LandingSections';
import { applyUci, lastMoveOf, turnOf } from '../chess';
import { navigate } from '../router';
import { useSession } from '../session';
import { LichessLogin } from './Auth';
import { Icon, Loading } from '../components/Icon';
import { Link } from '../components/Link';
import '../tactile.css';
import '../landing.css';

/** Tablero Noche y piezas Contorno: el aspecto de Chedex (coincide con lo predeterminado de la app). */
const LOOK = 'theme-noche pieces-contorno';

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

/* ---------- Hero: resplandor de fondo + arte hecho con las propias piezas Contorno ---------- */

function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-glow" />
    </div>
  );
}

/** Caballo Contorno grande bajo el texto, en la columna izquierda: no se solapa con la copia. */
function HeroKnight() {
  return (
    <div className="hero-knight" aria-hidden="true">
      <span className="hero-knight-glow" />
      <img src="/pieces/contorno/wN.svg" width="360" height="360" alt="" />
    </div>
  );
}

/** Piezas pequeñas que flotan en los bordes de la ventana (decorativas). */
function HeroFloat() {
  return (
    <div className="hero-float" aria-hidden="true">
      <img className="hf hf-q" src="/pieces/contorno/bQ.svg" width="96" height="96" alt="" />
      <img className="hf hf-r" src="/pieces/contorno/wR.svg" width="88" height="88" alt="" />
      <img className="hf hf-p" src="/pieces/contorno/bP.svg" width="64" height="64" alt="" />
    </div>
  );
}

/* ---------- Hero: la «ventana de lección» con la demo jugable ---------- */

const STAGES = ['Introducción', 'Explicación', 'Práctica', 'Evaluación'];

function LessonWindow({ lesson, children }: { lesson: Lesson | null; children: React.ReactNode }) {
  return (
    <div className="win" id="demo">
      <div className="win-head">
        <p className="win-title">{lesson?.title ?? 'Lección de demostración'}</p>
        <span className="win-bar" aria-hidden="true">
          <span className="win-bar-fill" />
        </span>
        <span className="win-pct" aria-hidden="true">
          50%
        </span>
      </div>
      <ol className="win-stages" aria-label="Fases de la lección">
        {STAGES.map((s, i) => (
          <li key={s} className={i === 2 ? 'win-stage current' : i < 2 ? 'win-stage done' : 'win-stage'} aria-current={i === 2 ? 'step' : undefined}>
            <span className="win-stage-n" aria-hidden="true">
              {i < 2 ? <Icon name="check" size={14} /> : i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <div className="win-body">{children}</div>
    </div>
  );
}

function HeroDemo({ lesson }: { lesson: Lesson | null }) {
  const base = lesson?.practice[0] ?? lesson?.evaluation[0];
  // marca la pieza que se mueve (sin enseñar la jugada); el marcador se retira al mover
  const step = base && { ...base, squares: base.squares ?? [base.solutionUci[0]?.slice(0, 2) ?? ''].filter(Boolean) };
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  if (!lesson || !step) {
    return (
      <LessonWindow lesson={lesson}>
        <div className="board-placeholder" role="img" aria-label="Cargando tablero" aria-busy="true" />
      </LessonWindow>
    );
  }
  return (
    <LessonWindow lesson={lesson}>
      {done ? (
        <div className="demo-done" role="status">
          <h2>Ya has hecho tu primera jugada</h2>
          <p>Así es cada lección: una idea, una posición y tú moviendo las piezas.</p>
          <div className="actions">
            <button className="t-btn t-btn-primary t-btn-lg" onClick={() => navigate('/demo')}>
              Seguir con la lección completa
            </button>
            <button
              className="t-btn t-btn-secondary t-btn-lg"
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
        <PracticeBoard key={round} step={step} mode="practice" isLast plain appearance={LOOK} showcase onDone={() => setDone(true)} />
      )}
    </LessonWindow>
  );
}

/* ---------- Las cinco partes de una lección ---------- */

function PartBoard({ fen, marks, lastMove, label }: { fen?: string; marks?: BoardMark; lastMove?: [string, string]; label: string }) {
  const shapes = useMemo(() => marksToShapes(marks), [marks]);
  if (!fen) return <div className="board-placeholder" role="img" aria-label="Cargando tablero" />;
  return <Board fen={fen} orientation={turnOf(fen)} shapes={shapes} lastMove={lastMove} plain appearance={LOOK} label={label} />;
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
      visual: (
        <div className="part-title" role="img" aria-label={`Tarjeta de título: ${lesson?.title ?? 'lección'}`}>
          <img src="/pieces/contorno/wP.svg" width="56" height="56" alt="" />
          <p>{lesson?.title ?? ''}</p>
          <span>{lesson?.objective ?? ''}</span>
        </div>
      ),
    },
    {
      title: 'Explicación',
      text: 'Sobre una posición real, con casillas marcadas y flechas que señalan la idea.',
      visual: <PartBoard fen={lesson?.explanation[0]?.fen} marks={lesson?.explanation[0]} label="Ejemplo de explicación con flechas" />,
    },
    {
      title: 'Práctica',
      text: 'Haces tú la jugada. Si la necesitas, tienes una pista.',
      visual: <PartBoard fen={practice?.fen} marks={practice} label="Ejemplo de ejercicio de práctica" />,
    },
    {
      title: 'Corrección',
      text: wrong ? `Si fallas, te decimos por qué: «${wrong.text}»` : 'Si fallas, te decimos por qué y puedes reintentar.',
      visual: <PartBoard fen={wrong?.fen} lastMove={wrong?.last} label="Posición tras una jugada incorrecta" />,
    },
    {
      title: 'Evaluación',
      text: 'Posiciones nuevas y sin pistas. Al superarlas se abre la siguiente lección.',
      visual: <PartBoard fen={lesson?.evaluation[0]?.fen} label="Ejemplo de evaluación" />,
    },
  ];
  return (
    <section className="band band-raised parts-band" aria-labelledby="parts-title">
      <div className="wrap">
        <header className="band-head">
          <h2 id="parts-title">Cada lección tiene cinco partes</h2>
          <p>Así se aprende en Chedex Pulse hoy. Los tableros son los de la lección de demostración.</p>
        </header>
      </div>
      <div className="parts-scroller" role="region" aria-label="Las cinco partes de una lección" tabIndex={0}>
        <ol className="parts">
          {parts.map((x, i) => (
            <li key={x.title} className="part">
              <div className="part-visual">{x.visual}</div>
              <h3>
                <span className="part-n" aria-hidden="true">
                  {i + 1}
                </span>
                {x.title}
              </h3>
              <p>{x.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Datos de Lichess ---------- */

function LichessData() {
  return (
    <section className="band band-ink" aria-labelledby="data-title">
      <div className="wrap data-grid">
        <header>
          <h2 id="data-title">Qué usamos de tu cuenta de Lichess</h2>
          <p>
            Solo lo necesario para recomendarte dónde empezar. No te pedimos la contraseña ni guardamos tu token.
          </p>
          <p>
            <Link className="data-link" href="/privacidad">
              Leer la política de privacidad
            </Link>
          </p>
        </header>
        <div className="data-lists">
          <div>
            <h3>Usamos</h3>
            <ul>
              <li>
                <Icon name="check" size={20} /> Tu nombre de usuario
              </li>
              <li>
                <Icon name="check" size={20} /> Tu Elo en rápidas, clásicas y blitz
              </li>
            </ul>
          </div>
          <div>
            <h3>No tocamos</h3>
            <ul className="no">
              <li>
                <Icon name="x" size={20} /> Tu contraseña
              </li>
              <li>
                <Icon name="x" size={20} /> Tu token, que no se guarda
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="wrap">
        <ShopLine />
      </div>
    </section>
  );
}

/* ---------- Cierre ---------- */

function Closing() {
  const { user, billingMode } = useSession();
  const row = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK'];
  return (
    <section className="band band-raised closing" aria-labelledby="close-title">
      <div className="wrap closing-in">
        <div className="closing-pieces" aria-hidden="true">
          {row.map((p) => (
            <img key={p} src={`/pieces/contorno/${p}.svg`} width="96" height="96" alt="" loading="lazy" />
          ))}
        </div>
        <h2 id="close-title">Empieza por tu primera jugada</h2>
        <p>{billingMode === 'beta_open' ? 'Gratis durante la beta. Después, 10 € al mes con todo incluido.' : 'Una sola suscripción de 10 € al mes, con todo incluido.'}</p>
        <div className="actions">
          {user ? (
            <button className="t-btn t-btn-primary t-btn-lg" onClick={() => navigate('/aprender')}>
              Ir a mi ruta de aprendizaje
            </button>
          ) : (
            <LichessLogin large />
          )}
          <Link className="t-btn t-btn-secondary t-btn-lg" href="/demo">
            Probar una lección
          </Link>
        </div>
      </div>
    </section>
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
          Academia digital de ajedrez, de los primeros pasos a los 2000 Elo. No estamos afiliados a Lichess; solo usamos su acceso para identificarte.
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
        <HeroArt />
        <div className="wrap hero-grid">
          <div className="hero-side">
          <div className="hero-copy">
            <h1 id="hero-title">Aprende ajedrez con un camino claro, comprende tus errores y entrena con un propósito</h1>
            <p className="lead">
              Una academia digital que te acompaña desde tus primeros pasos hasta los 2000 Elo. Aquí entiendes el ajedrez, no solo resuelves ejercicios.
            </p>
            <div className="actions">
              {user ? (
                <button className="t-btn t-btn-primary t-btn-lg" onClick={() => navigate('/aprender')}>
                  Ir a mi ruta de aprendizaje
                </button>
              ) : (
                <LichessLogin large />
              )}
              <Link className="t-btn t-btn-secondary t-btn-lg" href="/demo">
                Probar una lección
              </Link>
            </div>
            <p className="hero-note">
              {billingMode === 'beta_open' ? 'Gratis durante la beta. Después, una sola suscripción de 10 € al mes con todo incluido.' : 'Una sola suscripción de 10 € al mes, con todo incluido.'}
            </p>
          </div>
          <HeroKnight />
          </div>
          <div className="hero-demo">
            <HeroDemo lesson={lesson} />
            <HeroFloat />
          </div>
        </div>
      </section>

      <Problem />
      <Cycle />
      <LessonParts lesson={lesson} />
      <Trainer />
      <Path />
      <Quality />
      <Pricing />
      <LichessData />
      <Closing />
    </div>
  );
}

export function DemoScreen() {
  const { lesson, error } = useDemo();
  if (error) {
    return (
      <div className="t-card empty-state" role="alert">
        <span className="empty-icon" aria-hidden="true">
          <Icon name="alert" size={28} />
        </span>
        <p>{error}</p>
        <button className="t-btn" onClick={() => navigate('/')}>
          Volver
        </button>
      </div>
    );
  }
  if (!lesson) return <Loading label="Cargando demostración…" />;
  return (
    <>
      <p className="t-alert t-alert-info">
        <Icon name="gift" size={18} />{' '}
        Demostración gratuita: no necesitas cuenta. Tu progreso no se guarda.
      </p>
      <LessonPlayer lesson={lesson} demo />
    </>
  );
}
