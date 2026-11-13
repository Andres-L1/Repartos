import { Link } from '../components/Link';

export function PrivacyScreen() {
  return (
    <article className="prose t-card">
      <p className="kicker">Privacidad</p>
      <h1>Qué datos usamos y para qué</h1>
      <p className="lead">
        Chedex Pulse está en beta abierta. Esto es todo lo que hacemos con tu cuenta, explicado sin letra pequeña.
      </p>

      <h2>Acceso con Lichess</h2>
      <p>
        Entras con tu cuenta de Lichess. No pedimos contraseña ni permisos especiales: Lichess solo nos confirma quién
        eres. Usamos ese acceso una vez, al entrar, y después lo revocamos. <strong>No guardamos tu token de Lichess.</strong>
      </p>

      <h2>Qué guardamos</h2>
      <ul>
        <li>Tu usuario de Lichess, para identificarte.</li>
        <li>Tu Elo y número de partidas en rápidas, clásicas y blitz (bullet no cuenta), solo para recomendarte dónde empezar.</li>
        <li>Las lecciones que completas y tu racha de días, para mostrarte tu progreso.</li>
        <li>Los conceptos en los que has fallado, para preparar repasos en el futuro.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Solo usamos la cookie necesaria para mantener tu sesión iniciada. No la usamos para publicidad ni para seguirte
        por otras webs.
      </p>

      <h2>Tú decides</h2>
      <p>
        Puedes ignorar la recomendación y empezar desde el principio cuando quieras, y salir de tu cuenta en cualquier
        momento con el botón «Salir».
      </p>
      <p className="actions">
        <Link className="t-btn" href="/">
          Volver al inicio
        </Link>
      </p>
    </article>
  );
}
