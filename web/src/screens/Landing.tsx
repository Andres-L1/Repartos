import { useEffect, useMemo, useState } from 'react';
import type { BoardMark, Lesson } from '../../../src/content/schema';
import type { OutlineUnit } from '../../../src/shared/api';
import { STREAK_DAYS_PER_CHEDEX } from '../../../src/shop/catalog';
import { api, ApiError } from '../api';
import { Board, marksToShapes } from '../components/Board';
import { LessonPlayer } from '../components/LessonPlayer';
import { PracticeBoard } from '../components/PracticeBoard';
import { Coin, MiniBoard as ShopMiniBoard } from '../components/ShopVisuals';
import { LEVEL_LABEL } from './MapScreen';
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
          <p>Los tableros son los de la lección de demostración. Puedes recorrerlos de lado a lado.</p>
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

/* ---------- Capturas reales de la app ---------- */

function Inside() {
  const shots = [
    { cls: 'shot-main', src: '/landing/leccion.webp', w: 1000, h: 680, alt: 'Una lección en la fase de práctica: el tablero grande a la izquierda y el enunciado a la derecha.', cap: 'Una lección en práctica: mueves tú y te corrige al momento.' },
    { cls: 'shot-a', src: '/landing/aprender.webp', w: 800, h: 620, alt: 'La pantalla Aprender con las unidades y las lecciones en orden.', cap: 'Aprender: tus unidades y lecciones, en orden.' },
    { cls: 'shot-b', src: '/landing/tienda.webp', w: 800, h: 620, alt: 'La tienda con los tableros y los juegos de piezas.', cap: 'La tienda: tableros y piezas para el tuyo.' },
  ];
  return (
    <section className="band band-ink" aria-labelledby="inside-title">
      <div className="wrap">
        <header className="band-head">
          <h2 id="inside-title">Así se ve por dentro</h2>
          <p>Capturas de la propia aplicación, con datos de ejemplo.</p>
        </header>
        <div className="inside">
          {shots.map((s) => (
            <figure key={s.cls} className={`shot ${s.cls}`}>
              <img src={s.src} width={s.w} height={s.h} alt={s.alt} loading="lazy" decoding="async" />
              <figcaption>{s.cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- El temario ---------- */

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
    <section className="band band-raised" aria-labelledby="route-title">
      <div className="wrap route-grid">
        <header className="route-head">
          <h2 id="route-title">Lo que vas a aprender</h2>
          <p>
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
                className="t-btn t-btn-secondary"
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
                    <span className={`route-node ${u.order % 2 ? 'light' : 'dark'}`} aria-hidden="true">
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

/* ---------- Tienda y racha ---------- */

function ShopBand() {
  const looks = [
    { board: 'noche', name: 'Noche' },
    { board: 'clasico', name: 'Clásico' },
    { board: 'pizarra', name: 'Pizarra' },
    { board: 'bosque', name: 'Bosque' },
    { board: 'papel', name: 'Papel' },
    { board: 'brasa', name: 'Brasa' },
  ];
  return (
    <section className="band band-ember" aria-labelledby="shop-title">
      <div className="wrap shop-grid">
        <div className="shop-copy">
          <Coin size={72} className="shop-coin" />
          <h2 id="shop-title">Tu racha se convierte en Chedex</h2>
          <p>
            Por cada {STREAK_DAYS_PER_CHEDEX} días seguidos de estudio ganas 1 Chedex. Los gastas en la tienda, en piezas y tableros diseñados para Chedex.
          </p>
        </div>
        <ul className="shop-boards" aria-label="Tableros de la tienda">
          {looks.map((l) => (
            <li key={l.board}>
              <ShopMiniBoard board={l.board} pieces="contorno" label={`Tablero ${l.name} con piezas Contorno`} />
              <span>{l.name}</span>
            </li>
          ))}
        </ul>
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
        <h2 id="close-title">Tu primera jugada te espera</h2>
        <p>{billingMode === 'beta_open' ? 'Beta abierta: gratis mientras la probamos.' : 'Sin permanencia: cancela cuando quieras.'}</p>
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
        <HeroArt />
        <div className="wrap hero-grid">
          <div className="hero-side">
          <div className="hero-copy">
            <h1 id="hero-title">Aprende ajedrez moviendo las piezas</h1>
            <p className="lead">
              Lecciones cortas de 0 a 800 Elo sobre un tablero real. Si te equivocas, te explicamos el error y avanzas cuando lo has entendido.
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
              {billingMode === 'beta_open' ? 'Beta abierta: gratis mientras la probamos.' : 'Sin permanencia: cancela cuando quieras.'}
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

      <LessonParts lesson={lesson} />
      <Inside />
      <Route />
      <ShopBand />
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
