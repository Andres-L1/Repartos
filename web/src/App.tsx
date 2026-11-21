import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { USE_MOCK } from './api';
import { isPrivatePath, navigate, titleFor, usePath } from './router';
import { Link } from './components/Link';
import { useSession } from './session';
import { Landing, SiteFooter } from './screens/Landing';
import { AuthScreen, LichessLogin } from './screens/Auth';
import { Coin } from './components/ShopVisuals';
import { chedexText } from './shop';
import { Icon, Loading, type IconName } from './components/Icon';
import { SoundToggle } from './components/SoundToggle';
import { useHeaderHeight } from './headerHeight';

// Pantallas con carga diferida: el paquete inicial solo lleva portada, acceso y marco; cada pantalla se descarga al visitarla.
const PrivacyScreen = lazy(() => import('./screens/Privacy').then((m) => ({ default: m.PrivacyScreen })));
const MapScreen = lazy(() => import('./screens/MapScreen').then((m) => ({ default: m.MapScreen })));
const LessonScreen = lazy(() => import('./screens/LessonScreen').then((m) => ({ default: m.LessonScreen })));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })));
const AdminScreen = lazy(() => import('./screens/AdminScreen').then((m) => ({ default: m.AdminScreen })));
const ReviewScreen = lazy(() => import('./screens/ReviewScreen').then((m) => ({ default: m.ReviewScreen })));
const LevelScreen = lazy(() => import('./screens/LevelScreen').then((m) => ({ default: m.LevelScreen })));
const ShopScreen = lazy(() => import('./screens/ShopScreen').then((m) => ({ default: m.ShopScreen })));
const SessionScreen = lazy(() => import('./screens/SessionScreen').then((m) => ({ default: m.SessionScreen })));
const CreditsScreen = lazy(() => import('./screens/CreditsScreen').then((m) => ({ default: m.CreditsScreen })));

function NotFound() {
  return (
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
}

export function App() {
  const path = usePath();
  const { loading, connectionError, retryConnection, user, isAdmin, logout, shop, levelChosen } = useSession();
  const isPrivate = isPrivatePath(path);
  useHeaderHeight(!!user && isPrivate);

  useEffect(() => {
    if (!loading && !user && isPrivate && !connectionError) navigate('/entrar', { replace: true });
  }, [loading, user, isPrivate, connectionError]);

  // Primer acceso: sin nivel elegido, toda ruta privada lleva a la pantalla de nivel.
  const needsLevel = !loading && !!user && isPrivate && !levelChosen && path !== '/bienvenida';
  useEffect(() => {
    if (needsLevel) navigate('/bienvenida', { replace: true });
  }, [needsLevel]);

  const onLanding = path === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
    // Cada pantalla con su título (WCAG 2.4.2): el lector de pantalla y las pestañas lo anuncian al cambiar de ruta.
    document.title = titleFor(path);
  }, [path]);

  let screen: ReactNode;
  // La portada es pública: pinta ya y solo sus botones esperan a la sesión (ver PrimaryCta y la cabecera).
  if (loading && !onLanding) screen = <Loading label="Cargando…" />;
  else if (isPrivate && !user && connectionError)
    screen = (
      <div className="t-card empty-state">
        <h1>No se pudo conectar</h1>
        <p>No hemos podido comprobar tu sesión. Tu progreso está guardado: revisa tu conexión e inténtalo de nuevo.</p>
        <button className="t-btn t-btn-primary" onClick={retryConnection} autoFocus>
          Reintentar
        </button>
      </div>
    );
  else if (isPrivate && !user) screen = <Loading label="Redirigiendo al acceso…" />;
  else if (needsLevel) screen = <Loading label="Cargando…" />;
  else if (path === '/') screen = <Landing />;
  else if (path === '/privacidad') screen = <PrivacyScreen />;
  else if (path === '/creditos') screen = <CreditsScreen />;
  else if (path === '/tienda') screen = <ShopScreen />;
  else if (path === '/entrar') screen = <AuthScreen />;
  else if (path === '/aprender') screen = <MapScreen />;
  else if (path.startsWith('/leccion/')) screen = <LessonScreen id={decodeURIComponent(path.slice('/leccion/'.length))} />;
  else if (path === '/partidas' || path === '/partidas/informe' || path.startsWith('/partidas/repaso/')) screen = <ReviewScreen path={path} />;
  else if (path === '/entrenar') screen = <SessionScreen />;
  else if (path === '/perfil') screen = <ProfileScreen />;
  else if (path === '/bienvenida') screen = <LevelScreen />;
  else if (path === '/admin') screen = isAdmin ? <AdminScreen /> : <NotFound />;
  else screen = <NotFound />;

  const link = (to: string, label: string, icon: IconName, also: string[] = []) => {
    const active = [to, ...also].some((p) => path === p || path.startsWith(p + '/'));
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
              {link('/aprender', 'Aprender', 'learn', ['/leccion', '/entrenar'])}
              {link('/partidas', 'Partidas', 'eye')}
              {link('/tienda', 'Tienda', 'shop')}
              {link('/perfil', 'Perfil', 'user')}
              {isAdmin && link('/admin', 'Admin', 'shield')}
            </nav>
            {shop && (
              <Link href="/tienda" className="balance" aria-label={`Tienes ${chedexText(shop.balance)}. Abrir la tienda`}>
                <Coin size={24} />
                <span className="balance-num" aria-hidden="true">{shop.balance}</span>
                <span className="balance-unit" aria-hidden="true">Chedex</span>
              </Link>
            )}
            <div className="side-user">
              <span className="whoami" title={`${user.username} (cuenta de Lichess)`}>
                <span className="whoami-avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span>
                <span className="whoami-text">
                  <span className="whoami-name">{user.username}</span>
                  <span className="whoami-sub">Cuenta de Lichess</span>
                </span>
              </span>
              <SoundToggle />
              <button className="t-btn t-btn-ghost t-btn-sm" aria-label="Salir de tu cuenta" onClick={() => void logout()}>
                Salir
              </button>
            </div>
          </header>
          <div className="shell-body">
            {mock}
            <main id="main" tabIndex={-1} className="main main-shell">
              <Suspense fallback={<Loading label="Cargando…" />}>{screen}</Suspense>
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
        {/* Mientras se comprueba la sesión no se enseña «Entrar con Lichess»: a quien ya entró le saltaba un botón que no es suyo. */}
        {loading ? null : user ? (
          <nav className="nav nav-guest" aria-label="Principal">
            <Link className="t-btn t-btn-primary t-btn-sm" href="/aprender">
              Ir a Aprender
            </Link>
            <button className="t-btn t-btn-ghost t-btn-sm" aria-label="Salir de tu cuenta" onClick={() => void logout()}>
              Salir
            </button>
          </nav>
        ) : (
          <nav className="nav nav-guest" aria-label="Principal">
            <LichessLogin small />
          </nav>
        )}
      </header>
      {mock}
      <main id="main" tabIndex={-1} className={onLanding ? 'main main-landing' : 'main'}>
        <Suspense fallback={<Loading label="Cargando…" />}>{screen}</Suspense>
      </main>
      {(!loading || onLanding) && <SiteFooter />}
    </>
  );
}
