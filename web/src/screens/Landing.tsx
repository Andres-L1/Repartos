import { useEffect, useMemo, useState } from 'react';
import type { BoardMark, Lesson } from '../../../src/content/schema';
import type { OutlineUnit } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { Board, marksToShapes } from '../components/Board';
import { LessonPlayer } from '../components/LessonPlayer';
import { PracticeBoard } from '../components/PracticeBoard';
import { LEVEL_LABEL } from './MapScreen';
import { turnOf } from '../chess';
import { navigate } from '../router';
import { useSession } from '../session';
import { LichessLogin } from './Auth';
import { Icon, Loading } from '../components/Icon';
import { Link } from '../components/Link';

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
  const step = lesson?.practice[0] ?? lesson?.evaluation[0];
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  if (!lesson || !step) {
    return (
      <div className="demo-card">
        <div className="board-placeholder" role="img" aria-label="Cargando tablero" />
      </div>
    );
  }
  return (
    <div className="demo-card" id="demo">
      <p className="demo-kicker">
        <Icon name="play" size={14} /> Pruébalo ahora · sin cuenta
      </p>
      {done ? (
        <div className="demo-done" role="status">
          <span className="result-icon result-pass" aria-hidden="true">
            <Icon name="check" size={34} />
          </span>
          <h2>Ya has hecho tu primera jugada</h2>
          <p className="muted">Así es cada lección: una idea, una posición y tú moviendo las piezas.</p>
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
        <PracticeBoard key={round} step={step} mode="practice" isLast onDone={() => setDone(true)} />
      )}
    </div>
  );
}

function MiniBoard({ step, label }: { step: (BoardMark & { fen: string }) | undefined; label: string }) {
  const shapes = useMemo(() => marksToShapes(step), [step]);
  if (!step) return <div className="board-placeholder" role="img" aria-label="Cargando tablero" />;
  return <Board fen={step.fen} orientation={turnOf(step.fen)} shapes={shapes} label={label} />;
}

function HowItWorks({ lesson }: { lesson: Lesson | null }) {
  const steps = [
    {
      n: 1,
      title: 'Entiende',
      text: 'Una idea por lección, explicada con texto breve y señales sobre el propio tablero: casillas marcadas y flechas.',
      step: lesson?.explanation[0],
      label: 'Ejemplo de explicación con flechas',
    },
    {
      n: 2,
      title: 'Practica',
      text: 'Mueves tú las piezas. Si te equivocas, te explicamos por qué y puedes reintentar sin penalización.',
      step: lesson?.practice[0],
      label: 'Ejemplo de ejercicio de práctica',
    },
    {
      n: 3,
      title: 'Demuestra',
      text: 'Un par de posiciones nuevas, sin pistas, para confirmar que lo has entendido y abrir la siguiente lección.',
      step: lesson?.evaluation[0],
      label: 'Ejemplo de evaluación',
    },
  ];
  return (
    <section className="section" aria-labelledby="how-title">
      <header className="section-head">
        <p className="kicker">Cómo funciona</p>
        <h2 id="how-title">Tres pasos en cada lección</h2>
      </header>
      <ol className="how">
        {steps.map((x) => (
          <li key={x.n} className="how-item">
            <div className="how-board">
              <MiniBoard step={x.step} label={x.label} />
            </div>
            <h3>
              <span className="feature-n" aria-hidden="true">
                {x.n}
              </span>
              {x.title}
            </h3>
            <p className="muted">{x.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Outline() {
  const [units, setUnits] = useState<OutlineUnit[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    api
      .outline()
      .then((r) => setUnits([...r.units].sort((a, b) => a.order - b.order)))
      .catch(() => setFailed(true));
  }, []);
  const total = units?.reduce((n, u) => n + u.lessons.length, 0) ?? 0;
  return (
    <section className="section" aria-labelledby="outline-title">
      <header className="section-head">
        <p className="kicker">Qué aprenderás</p>
        <h2 id="outline-title">Un camino ordenado, de las piezas a las primeras tácticas</h2>
        {units && (
          <p className="muted">
            {units.length} unidades y {total} lecciones. Las vas abriendo a tu ritmo.
          </p>
        )}
      </header>
      {failed && <p className="muted">No se ha podido cargar el temario ahora mismo.</p>}
      {!units && !failed && <Loading label="Cargando el temario…" />}
      {units && (
        <ol className="outline">
          {units.map((u) => (
            <li key={u.id} className="outline-unit">
              <span className="outline-n" aria-hidden="true">
                {u.order}
              </span>
              <div className="outline-main">
                <p className="kicker">
                  Unidad {u.order} · {LEVEL_LABEL[u.level]}
                </p>
                <h3>{u.title}</h3>
                <p className="muted">{u.description}</p>
                <details className="outline-lessons">
                  <summary>
                    {u.lessons.length} {u.lessons.length === 1 ? 'lección' : 'lecciones'}
                  </summary>
                  <ul>
                    {u.lessons.map((l) => (
                      <li key={l.id}>{l.title}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function LichessData() {
  return (
    <section className="section" aria-labelledby="data-title">
      <div className="card data-card">
        <header>
          <p className="kicker">Acceso con Lichess</p>
          <h2 id="data-title">Qué datos usamos, sin letra pequeña</h2>
        </header>
        <ul className="data-list">
          <li>
            <span className="data-tick" aria-hidden="true">
              <Icon name="check" size={16} />
            </span>
            <span>
              Tu <strong>nombre de usuario</strong> de Lichess, para identificarte.
            </span>
          </li>
          <li>
            <span className="data-tick" aria-hidden="true">
              <Icon name="check" size={16} />
            </span>
            <span>
              Tu <strong>Elo en rápidas, clásicas y blitz</strong>, solo para recomendarte dónde empezar. Puedes ignorarlo y empezar
              desde el principio.
            </span>
          </li>
          <li>
            <span className="data-tick data-no" aria-hidden="true">
              <Icon name="x" size={16} />
            </span>
            <span>
              <strong>No pedimos contraseña ni permisos</strong> sobre tu cuenta, y <strong>no guardamos tu token</strong>.
            </span>
          </li>
        </ul>
        <p className="muted">
          <Link href="/privacidad">Leer la explicación completa de privacidad</Link>
        </p>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <p className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            ♞&#xFE0E;
          </span>{' '}
          Chedex Pulse
        </p>
        <p className="muted footer-text">
          Entrenamiento de ajedrez de 0 a 800 Elo. No estamos afiliados a Lichess; solo usamos su acceso para identificarte.
        </p>
        <nav className="footer-links" aria-label="Pie de página">
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/demo">Probar una lección</Link>
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
        <div className="hero-copy">
          <p className="kicker">Ajedrez de 0 a 800 Elo</p>
          <h1 id="hero-title">
            Aprende ajedrez <span className="hl">una idea cada vez</span>.
          </h1>
          <p className="lead">
            Lecciones cortas con un tablero grande: lees la idea, la practicas moviendo tú las piezas y compruebas que la has
            entendido. Sin prisas, sin ruido.
          </p>
          <div className="actions">
            {user ? (
              <button className="btn btn-primary btn-large" onClick={() => navigate('/aprender')}>
                Ir a mi ruta de aprendizaje
              </button>
            ) : (
              <>
                <LichessLogin large />
                <a
                  className="btn btn-large"
                  href="#demo"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  Probar la demo
                </a>
              </>
            )}
          </div>
          <p className="muted hero-note">
            <Icon name="gift" size={18} />{' '}
            {billingMode === 'beta_open'
              ? 'Beta abierta: todo es gratis mientras la probamos.'
              : 'Sin permanencia: cancela cuando quieras.'}
          </p>
        </div>
        <HeroDemo lesson={lesson} />
      </section>

      <HowItWorks lesson={lesson} />
      <Outline />
      <LichessData />

      {!user && (
        <section className="section final-cta" aria-labelledby="cta-title">
          <h2 id="cta-title">Empieza cuando quieras</h2>
          <p className="muted">Entra con tu cuenta de Lichess y te sugerimos por dónde empezar.</p>
          <div className="actions">
            <LichessLogin large />
            <button className="btn btn-large" onClick={() => navigate('/demo')}>
              Probar una lección gratis
            </button>
          </div>
        </section>
      )}
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
