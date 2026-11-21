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

/** Caballo Contorno grande a la derecha del titular (solo en pantallas anchas). */
function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <span className="hero-knight-glow" />
      <img src="/pieces/contorno/wN.svg" width="360" height="360" alt="" />
    </div>
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
            <h1 id="hero-title">Aprende ajedrez con un camino claro, comprende tus errores y entrena con un propósito</h1>
            <p className="lead">Chedex Pulse: la plataforma de entrenamiento de ajedrez de los alumnos de TopChess.</p>
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
