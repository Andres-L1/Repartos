import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BillingMode, Equipped, Shop, Subscription, User } from '../../src/shared/api';
import type { Level } from '../../src/types';
import { api, setApiHandlers } from './api';
import { navigate } from './router';
import { DEFAULT_EQUIPPED, sanitizeEquipped } from './shop';

interface SessionValue {
  loading: boolean;
  user: User | null;
  /** Nivel interno para adaptar los textos (nunca se muestra); 'initiation' hasta que /api/me lo devuelva. */
  level: Level;
  /** El alumno ya eligió su nivel (si no, se le lleva a /bienvenida). */
  levelChosen: boolean;
  /** Actualiza el nivel tras elegirlo en la pantalla de nivel. */
  setLevel(l: Level): void;
  subscription: Subscription | null;
  /** Modo de facturación del servidor. Hasta saberlo se asume beta abierta (no se muestra precio). */
  billingMode: BillingMode;
  /** id de la lección que devolvió 402 (para mostrar el aviso en Suscripción) */
  paywallLesson: string | null;
  /** Tablero y piezas equipados (los de por defecto hasta saber otra cosa). */
  equipped: Equipped;
  /** Tienda (saldo, protectores, objetos); null hasta que carga o si falla. */
  shop: Shop | null;
  setShop(s: Shop): void;
  refreshShop(): Promise<void>;
  /** Fija la sesión; sin suscripción dada, espera a /api/me para saber el nivel antes de exponer el usuario. */
  setSession(user: User | null, subscription?: Subscription | null): Promise<void>;
  setSubscription(s: Subscription): void;
  clearPaywall(): void;
  logout(): Promise<void>;
}

const Ctx = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('SessionProvider ausente');
  return v;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [level, setLevelState] = useState<Level>('initiation');
  const [levelChosen, setLevelChosen] = useState(false);
  const [subscription, setSub] = useState<Subscription | null>(null);
  const [billingMode, setBillingMode] = useState<BillingMode>('beta_open');
  const [paywallLesson, setPaywall] = useState<string | null>(null);
  const [equipped, setEquipped] = useState<Equipped>(DEFAULT_EQUIPPED);
  const [shop, setShopState] = useState<Shop | null>(null);

  const setShop = useCallback((s: Shop) => {
    setShopState(s);
    setEquipped(sanitizeEquipped(s.equipped));
  }, []);
  const refreshShop = useCallback(async () => {
    try {
      setShop(await api.shop());
    } catch {
      /* el saldo es informativo: si falla, se conserva lo anterior */
    }
  }, [setShop]);

  useEffect(() => {
    setApiHandlers({
      unauthorized: () => {
        setUser(null);
        setSub(null);
        navigate('/entrar');
      },
      payment: (lessonId) => {
        setPaywall(lessonId ?? 'paywall');
        navigate('/suscripcion');
      },
    });
    api
      .config()
      .then((r) => setBillingMode(r.billingMode))
      .catch(() => {});
    api
      .me()
      .then((r) => {
        setUser(r.user);
        if (r.level) setLevelState(r.level);
        setLevelChosen(r.levelChosen === true);
        setSub(r.subscription);
        setBillingMode(r.billingMode);
        if (r.equipped) setEquipped(sanitizeEquipped(r.equipped));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Con sesión, el saldo se carga aparte: la barra lo muestra en cuanto llega.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (userId === null) {
      setShopState(null);
      setEquipped(DEFAULT_EQUIPPED);
      return;
    }
    void refreshShop();
  }, [userId, refreshShop]);

  const setLevel = useCallback((l: Level) => {
    setLevelState(l);
    setLevelChosen(true);
  }, []);

  const setSession = useCallback(async (u: User | null, s?: Subscription | null) => {
    if (s !== undefined) setSub(s);
    if (u && s === undefined) {
      api
        .billing()
        .then((r) => setSub(r.subscription))
        .catch(() => {});
      // El nivel se conoce antes de exponer el usuario: si no, la redirección de primer acceso
      // llevaría a /bienvenida a quien ya eligió nivel.
      try {
        const r = await api.me();
        setLevelState(r.level ?? 'initiation');
        setLevelChosen(r.levelChosen === true);
      } catch {
        /* sin /api/me se conserva lo anterior */
      }
    } else if (!u) {
      setLevelState('initiation');
      setLevelChosen(false);
    }
    setUser(u);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      loading,
      user,
      level,
      levelChosen,
      setLevel,
      subscription,
      billingMode,
      paywallLesson,
      equipped,
      shop,
      setShop,
      refreshShop,
      setSession,
      setSubscription: setSub,
      clearPaywall: () => setPaywall(null),
      logout: async () => {
        try {
          await api.logout();
        } catch {
          /* da igual: se limpia el estado local */
        }
        setUser(null);
        setSub(null);
        setLevelState('initiation');
        setLevelChosen(false);
        navigate('/');
      },
    }),
    [loading, user, level, levelChosen, setLevel, subscription, billingMode, paywallLesson, equipped, shop, setShop, refreshShop, setSession],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
