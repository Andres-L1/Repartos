import { useEffect, type ReactNode } from 'react';
import { USE_MOCK } from './api';
import { isPrivatePath, navigate, usePath } from './router';
import { Link } from './components/Link';
import { useSession } from './session';
import { Landing, DemoScreen, SiteFooter } from './screens/Landing';
import { PrivacyScreen } from './screens/Privacy';
import { AuthScreen, LichessLogin } from './screens/Auth';
import { MapScreen } from './screens/MapScreen';
import { LessonScreen } from './screens/LessonScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BillingScreen } from './screens/BillingScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { Icon, Loading, type IconName } from './components/Icon';

export function App() {
  const path = usePath();
  const { loading, user, logout, billingMode } = useSession();
  const isPrivate = isPrivatePath(path);

  useEffect(() => {
    if (!loading && !user && isPrivate) navigate('/entrar', { replace: true });
  }, [loading, user, isPrivate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [path]);

  let screen: ReactNode;
  if (loading) screen = <Loading label="Cargando…" />;
  else if (isPrivate && !user) screen = <Loading label="Redirigiendo al acceso…" />;
  else if (path === '/') screen = <Landing />;
  else if (path === '/demo') screen = <DemoScreen />;
  else if (path === '/privacidad') screen = <PrivacyScreen />;
  else if (path === '/entrar') screen = <AuthScreen />;
  else if (path === '/aprender') screen = <MapScreen />;
  else if (path.startsWith('/leccion/')) screen = <LessonScreen id={decodeURIComponent(path.slice('/leccion/'.length))} />;
  else if (path === '/perfil') screen = <ProfileScreen />;
  else if (path === '/bienvenida') screen = <WelcomeScreen />;
  else if (path === '/suscripcion') screen = <BillingScreen />;
  else
    screen = (
      <div className="card empty-state">
        <span className="empty-icon" aria-hidden="true">
          <Icon name="target" size={28} />
        </span>
        <h1>Página no encontrada</h1>
        <Link className="btn btn-primary" href="/">
          Volver al inicio
        </Link>
      </div>
    );

  const link = (to: string, label: string, icon: IconName) => {
    const active = path === to || path.startsWith(to + '/');
    return (
      <Link href={to} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>
        <Icon name={icon} size={22} />
        <span>{label}</span>
      </Link>
    );
  };

  const brand = (
    <Link href="/" className="brand" aria-label="Chedex Pulse, inicio">
      <span className="brand-mark" aria-hidden="true">♞&#xFE0E;</span>
      <span className="brand-name">Chedex Pulse</span>
    </Link>
  );
  const skip = (
    <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
      Saltar al contenido
    </a>
  );
  const mock = USE_MOCK && <p className="mockbar">Modo simulado (?mock=1): los datos no son reales.</p>;

  // App con barra lateral (escritorio) o barra inferior (móvil): solo con sesión y en las pantallas privadas.
  if (user && isPrivate) {
    return (
      <>
        {skip}
        <div className="shell">
          <header className="sidebar">
            {brand}
            <nav className="nav side-nav" aria-label="Principal">
              {link('/aprender', 'Aprender', 'learn')}
              {link('/perfil', 'Perfil', 'user')}
              {billingMode === 'dev' && link('/suscripcion', 'Suscripción', 'card')}
            </nav>
            <div className="side-user">
              {billingMode === 'beta_open' && <span className="chip chip-beta">Beta abierta</span>}
              <span className="whoami" title="Cuenta de Lichess">
                <span className="whoami-avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span>
                <span className="whoami-text">
                  <span className="whoami-name">{user.username}</span>
                  <span className="whoami-sub">Cuenta de Lichess</span>
                </span>
              </span>
              <button className="btn btn-ghost btn-small" onClick={() => void logout()}>
                Salir
              </button>
            </div>
          </header>
          <div className="shell-body">
            {mock}
            <main id="main" tabIndex={-1} className="main main-shell">
              {screen}
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {skip}
      <header className="topbar">
        {brand}
        {user ? (
          <nav className="nav nav-guest" aria-label="Principal">
            <Link className="btn btn-primary btn-small" href="/aprender">
              Ir a Aprender
            </Link>
            <button className="btn btn-ghost btn-small" onClick={() => void logout()}>
              Salir
            </button>
          </nav>
        ) : (
          <nav className="nav nav-guest" aria-label="Principal">
            {billingMode === 'beta_open' && <span className="chip chip-beta">Beta abierta</span>}
            <LichessLogin small />
          </nav>
        )}
      </header>
      {mock}
      <main id="main" tabIndex={-1} className="main">
        {screen}
      </main>
      <SiteFooter />
    </>
  );
}
