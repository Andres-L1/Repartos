import type { DrawShape } from 'chessground/draw';
import { Board } from '../components/Board';
import { Coin } from '../components/ShopVisuals';
import { Cycle, HowItWorks, Path, Problem, Quality, ShopLine, Tour, Trainer } from './LandingSections';
import { navigate } from '../router';
import { useSession } from '../session';
import { LichessLogin } from './Auth';
import { Icon } from '../components/Icon';
import { Link } from '../components/Link';
import '../tactile.css';
import '../landing.css';

/* ---------- Hero: resplandor de fondo + arte hecho con las propias piezas Contorno ---------- */

function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-glow" />
    </div>
  );
}

/** Tablero real a la derecha del titular (solo en pantallas anchas): la horquilla del caballo, lo primero que se aprende a ver. */
const HERO_FEN = 'r1b1k3/pp3ppp/8/3N4/8/8/PP3PPP/6K1 w - - 0 1';
const HERO_SHAPES: DrawShape[] = [
  { orig: 'd5', dest: 'c7', brush: 'green' },
  { orig: 'c7', dest: 'e8', brush: 'red' },
  { orig: 'c7', dest: 'a8', brush: 'red' },
];

function HeroVisual() {
  return (
    <figure className="hero-visual" aria-label="Ejemplo: Cc7+ ataca a la vez al rey y a la torre">
      <span className="hero-knight-glow" aria-hidden="true" />
      <div className="hero-board" aria-hidden="true" inert>
        <Board fen={HERO_FEN} orientation="white" shapes={HERO_SHAPES} plain appearance="theme-noche pieces-contorno" label="Tablero de ejemplo" sound={false} />
      </div>
      <figcaption>
        <strong>Cc7+</strong> ataca al rey y a la torre a la vez. Esto se aprende aquí, jugando.
      </figcaption>
    </figure>
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

/** Botón principal de la portada. Mientras se comprueba la sesión ocupa su sitio sin etiqueta (misma altura que el botón real) para que no haya saltos de diseño. */
function PrimaryCta() {
  const { user, loading } = useSession();
  if (loading) return <span className="t-btn t-btn-primary t-btn-lg cta-pending" role="status" aria-label="Comprobando tu sesión" />;
  return user ? (
    <button className="t-btn t-btn-primary t-btn-lg" onClick={() => navigate('/aprender')}>
      Ir a mi ruta de aprendizaje
    </button>
  ) : (
    <LichessLogin large />
  );
}

function Closing() {
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
        <p>Si eres alumno de TopChess, entra con tu cuenta de Lichess. Si aún no tienes acceso, pídele a tu profesor que te autorice.</p>
        <div className="actions">
          <PrimaryCta />
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
          Chedex Pulse es la plataforma de entrenamiento de ajedrez de los alumnos de TopChess. No estamos afiliados a Lichess; solo usamos su acceso para identificarte.
        </p>
        <nav className="footer-links" aria-label="Pie de página">
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/creditos">Créditos</Link>
        </nav>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <HeroArt />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">Aprende ajedrez con un <em>camino claro</em></h1>
            <p className="lead">Comprende tus errores y entrena con un propósito. La plataforma de los alumnos de TopChess.</p>
            <section className="access-card" aria-labelledby="access-title">
              <h2 id="access-title">Acceso solo para alumnos de TopChess</h2>
              <div className="actions">
                <PrimaryCta />
              </div>
              <p className="hero-note">
                Si aún no tienes acceso, pídele a tu profesor de TopChess que te autorice con tu nombre de usuario de Lichess.
              </p>
            </section>
          </div>
          <HeroVisual />
        </div>
      </section>

      <HowItWorks />
      <Problem />
      <Cycle />
      <Tour />
      <Trainer />
      <Path />
      <Quality />
      <LichessData />
      <Closing />
    </div>
  );
}
