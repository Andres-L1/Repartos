import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BillingMode, Subscription, User } from '../../src/shared/api';
import { api, setApiHandlers } from './api';
import { navigate } from './router';

interface SessionValue {
  loading: boolean;
  user: User | null;
  subscription: Subscription | null;
  /** Modo de facturación del servidor. Hasta saberlo se asume beta abierta (no se muestra precio). */
  billingMode: BillingMode;
  /** id de la lección que devolvió 402 (para mostrar el aviso en Suscripción) */
  paywallLesson: string | null;
  setSession(user: User | null, subscription?: Subscription | null): void;
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
  const [subscription, setSub] = useState<Subscription | null>(null);
  const [billingMode, setBillingMode] = useState<BillingMode>('beta_open');
  const [paywallLesson, setPaywall] = useState<string | null>(null);

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
        setSub(r.subscription);
        setBillingMode(r.billingMode);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((u: User | null, s?: Subscription | null) => {
    setUser(u);
    if (s !== undefined) setSub(s);
    if (u && s === undefined) {
      api
        .billing()
        .then((r) => setSub(r.subscription))
        .catch(() => {});
    }
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      loading,
      user,
      subscription,
      billingMode,
      paywallLesson,
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
        navigate('/');
      },
    }),
    [loading, user, subscription, billingMode, paywallLesson, setSession],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
