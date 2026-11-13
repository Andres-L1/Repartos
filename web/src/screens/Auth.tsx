import { useEffect, useState } from 'react';
import { api, USE_MOCK } from '../api';
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
      setSession(r.user);
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
  // Tras mostrar el error se quita ?auth=failed de la URL (conservando el resto, p. ej. ?mock=1).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('auth') === null) return;
    p.delete('auth');
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
        <p className="muted center">¿No tienes cuenta? Crea una gratis en lichess.org y vuelve aquí.</p>
      </section>
    </div>
  );
}
