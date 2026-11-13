import { useEffect, type ReactNode } from 'react';
import { USE_MOCK } from './api';
import { navigate, usePath } from './router';
import { useSession } from './session';
import { Landing, DemoScreen } from './screens/Landing';
import { AuthScreen, LichessLogin } from './screens/Auth';
import { MapScreen } from './screens/MapScreen';
import { LessonScreen } from './screens/LessonScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BillingScreen } from './screens/BillingScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

const PRIVATE_PREFIXES = ['/mapa', '/leccion', '/perfil', '/suscripcion', '/bienvenida'];

export function App() {
  const path = usePath();
  const { loading, user, logout, billingMode } = useSession();
  const isPrivate = PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));

  useEffect(() => {
    if (!loading && !user && isPrivate) navigate('/entrar');
  }, [loading, user, isPrivate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [path]);

  let screen: ReactNode;
  if (loading) screen = <p role="status">Cargando…</p>;
  else if (isPrivate && !user) screen = <p role="status">Redirigiendo al acceso…</p>;
  else if (path === '/') screen = <Landing />;
  else if (path === '/demo') screen = <DemoScreen />;
  else if (path === '/entrar' || path === '/registro') screen = <AuthScreen />;
  else if (path === '/mapa') screen = <MapScreen />;
  else if (path.startsWith('/leccion/')) screen = <LessonScreen id={decodeURIComponent(path.slice('/leccion/'.length))} />;
  else if (path === '/perfil') screen = <ProfileScreen />;
  else if (path === '/bienvenida') screen = <WelcomeScreen />;
  else if (path === '/suscripcion') screen = <BillingScreen />;
  else
    screen = (
      <div className="card">
        <h1>Página no encontrada</h1>
        <a href="#/">Volver al inicio</a>
      </div>
    );

  const link = (to: string, label: string, icon: string) => {
    const active = path === to || path.startsWith(to + '/');
    return (
      <a href={`#${to}`} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </a>
    );
  };

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Saltar al contenido
      </a>
      <header className="topbar">
        <a href="#/" className="brand" aria-label="Chedex Pulse, inicio">
          <span aria-hidden="true">♞</span> Chedex Pulse
        </a>
        {user ? (
          <>
            <nav className="nav" aria-label="Principal">
              {link('/mapa', 'Mapa', '🗺')}
              {link('/perfil', 'Perfil', '👤')}
              {billingMode === 'dev' && link('/suscripcion', 'Suscripción', '💳')}
            </nav>
            {billingMode === 'beta_open' && <span className="chip chip-beta">Beta abierta</span>}
            <span className="whoami" title="Cuenta de Lichess">
              {user.username}
            </span>
            <button className="btn btn-ghost btn-small" onClick={() => void logout()}>
              Salir
            </button>
          </>
        ) : (
          <nav className="nav nav-guest" aria-label="Principal">
            {billingMode === 'beta_open' && <span className="chip chip-beta">Beta abierta</span>}
            <LichessLogin small />
          </nav>
        )}
      </header>
      {USE_MOCK && <p className="mockbar">Modo simulado (?mock=1): los datos no son reales.</p>}
      <main id="main" tabIndex={-1} className="main">
        {screen}
      </main>
    </>
  );
}
