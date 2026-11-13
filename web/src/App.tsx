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
import { ReviewScreen } from './screens/ReviewScreen';
import { LevelScreen } from './screens/LevelScreen';
import { ShopScreen } from './screens/ShopScreen';
import { CreditsScreen } from './screens/CreditsScreen';
import { Coin } from './components/ShopVisuals';
import { chedexText } from './shop';
import { Icon, Loading, type IconName } from './components/Icon';
import { SoundToggle } from './components/SoundToggle';

export function App() {
  const path = usePath();
  const { loading, user, logout, billingMode, shop, levelChosen } = useSession();
  const isPrivate = isPrivatePath(path);

  useEffect(() => {
    if (!loading && !user && isPrivate) navigate('/entrar', { replace: true });
  }, [loading, user, isPrivate]);

  // Primer acceso: sin nivel elegido, toda ruta privada lleva a la pantalla de nivel.
  const needsLevel = !loading && !!user && isPrivate && !levelChosen && path !== '/bienvenida';
  useEffect(() => {
    if (needsLevel) navigate('/bienvenida', { replace: true });
  }, [needsLevel]);

  const onLanding = path === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [path]);

  let screen: ReactNode;
  if (loading) screen = <Loading label="Cargando…" />;
  else if (isPrivate && !user) screen = <Loading label="Redirigiendo al acceso…" />;
  else if (needsLevel) screen = <Loading label="Cargando…" />;
  else if (path === '/') screen = <Landing />;
  else if (path === '/demo') screen = <DemoScreen />;
  else if (path === '/privacidad') screen = <PrivacyScreen />;
  else if (path === '/creditos') screen = <CreditsScreen />;
  else if (path === '/tienda') screen = <ShopScreen />;
  else if (path === '/entrar') screen = <AuthScreen />;
  else if (path === '/aprender') screen = <MapScreen />;
  else if (path.startsWith('/leccion/')) screen = <LessonScreen id={decodeURIComponent(path.slice('/leccion/'.length))} />;
  else if (path === '/partidas' || path === '/partidas/informe' || path.startsWith('/partidas/repaso/')) screen = <ReviewScreen path={path} />;
  else if (path === '/perfil') screen = <ProfileScreen />;
  else if (path === '/bienvenida') screen = <LevelScreen />;
  else if (path === '/suscripcion') screen = <BillingScreen />;
  else
    screen = (
      <div className="t-card empty-state">
        <span className="empty-icon" aria-hidden="true">
          <Icon name="target" size={28} />
        </span>
        <h1>Página no encontrada</h1>
        <Link className="t-btn t-btn-primary" href="/">
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
      <Coin size={34} />
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
              {link('/partidas', 'Partidas', 'eye')}
              {link('/tienda', 'Tienda', 'shop')}
              {link('/perfil', 'Perfil', 'user')}
              {billingMode === 'dev' && link('/suscripcion', 'Suscripción', 'card')}
            </nav>
            {shop && (
              <Link href="/tienda" className="balance" aria-label={`Tienes ${chedexText(shop.balance)}. Abrir la tienda`}>
                <Coin size={24} />
                <span className="balance-num" aria-hidden="true">{shop.balance}</span>
                <span className="balance-unit" aria-hidden="true">Chedex</span>
              </Link>
            )}
            <div className="side-user">
              {billingMode === 'beta_open' && <span className="chip chip-beta">Beta abierta</span>}
              <span className="whoami" title="Cuenta de Lichess">
                <span className="whoami-avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span>
                <span className="whoami-text">
                  <span className="whoami-name">{user.username}</span>
                  <span className="whoami-sub">Cuenta de Lichess</span>
                </span>
              </span>
              <SoundToggle />
              <button className="t-btn t-btn-ghost t-btn-sm" onClick={() => void logout()}>
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
            <Link className="t-btn t-btn-primary t-btn-sm" href="/aprender">
              Ir a Aprender
            </Link>
            <button className="t-btn t-btn-ghost t-btn-sm" onClick={() => void logout()}>
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
      <main id="main" tabIndex={-1} className={onLanding ? 'main main-landing' : 'main'}>
        {screen}
      </main>
      <SiteFooter />
    </>
  );
}
