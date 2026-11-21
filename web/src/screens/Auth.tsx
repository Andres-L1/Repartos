import { useEffect, useState } from 'react';
import { api, USE_MOCK } from '../api';
import { Link } from '../components/Link';
import { navigate, replaceSearch } from '../router';
import { useSession } from '../session';

/**
 * Botón «Entrar con Lichess»: enlace normal a /auth/login (redirección completa a lichess.org).
 * En modo simulado (?mock=1) no hay servidor: entra con un usuario ficticio.
 */
export function LichessLogin({ large = false, small = false }: { large?: boolean; small?: boolean }) {
  const { setSession } = useSession();
  const cls = `t-btn t-btn-primary${large ? ' t-btn-lg' : ''}${small ? ' t-btn-sm' : ''}`;
  async function mock(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const r = await api.mockLogin();
      await setSession(r.user);
      navigate('/aprender');
    } catch {
      /* sin efecto */
    }
  }
  return (
    <a className={cls} href="/auth/login" onClick={USE_MOCK ? mock : undefined}>
      Entrar con Lichess
    </a>
  );
}

export function AuthScreen() {
  const { user } = useSession();
  const [failed] = useState(() => new URLSearchParams(window.location.search).get('auth') === 'failed');
  const [denied] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('acceso') !== 'denegado') return null;
    const u = q.get('usuario') ?? '';
    return { username: /^[A-Za-z0-9_-]{1,30}$/.test(u) ? u : null }; // solo un nombre de Lichess válido, mostrado como texto
  });
  // Tras mostrar el aviso se quitan ?auth, ?acceso y ?usuario de la URL (conservando el resto, p. ej. ?mock=1).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('auth') === null && p.get('acceso') === null) return;
    p.delete('auth');
    p.delete('acceso');
    p.delete('usuario');
    const q = p.toString();
    replaceSearch(q ? '?' + q : '');
  }, []);
  if (user) {
    return (
      <div className="auth t-card">
        <h1>Ya has entrado</h1>
        <p>Sesión iniciada como {user.username}.</p>
        <button className="t-btn t-btn-primary" onClick={() => navigate('/aprender')}>
          Ir a la ruta
        </button>
      </div>
    );
  }
  if (denied) {
    return (
      <div className="auth">
        <section className="t-card form" aria-labelledby="denied-title">
          <h1 id="denied-title">Todavía no tienes acceso</h1>
          <p>
            Chedex Pulse es la plataforma de entrenamiento de ajedrez de los alumnos de TopChess, y el acceso lo da tu profesor.
          </p>
          <p>
            {denied.username ? (
              <>
                Pídele que te añada con tu nombre de usuario de Lichess: <strong className="lichess-name">{denied.username}</strong>.
              </>
            ) : (
              'Pídele que te añada con tu nombre de usuario de Lichess.'
            )}{' '}
            Cuando lo haga, vuelve a entrar con Lichess y ya podrás empezar.
          </p>
          <p className="muted">No hemos creado ninguna cuenta ni guardado tus datos de aprendizaje.</p>
          <Link className="t-btn" href="/">
            Volver al inicio
          </Link>
        </section>
      </div>
    );
  }
  return (
    <div className="auth">
      <section className="t-card form" aria-labelledby="auth-title">
        <h1 id="auth-title">Entra en Chedex Pulse</h1>
        {failed && (
          <p className="t-alert t-alert-bad" role="alert">
            No se pudo completar el acceso con Lichess. Inténtalo de nuevo.
          </p>
        )}
        <p>
          Usamos tu cuenta de Lichess para identificarte. No pedimos contraseña ni permisos: solo leemos tu nombre de
          usuario.
        </p>
        <LichessLogin large />
        <p className="muted center">
          El acceso es solo para alumnos de TopChess. Si aún no tienes acceso, pídele a tu profesor que te autorice con tu nombre de usuario de Lichess.
        </p>
      </section>
    </div>
  );
}
