import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Equipped, Shop, User } from '../../src/shared/api';
import type { Level } from '../../src/types';
import { api, ApiError, setApiHandlers } from './api';
import { navigate } from './router';
import { DEFAULT_EQUIPPED, preloadPieces, sanitizeEquipped } from './shop';
import { setReviewUser } from './review/completion';

interface SessionValue {
  loading: boolean;
  /** No se pudo comprobar la sesión (sin conexión o error del servidor): no equivale a «sin sesión». */
  connectionError: boolean;
  retryConnection(): void;
  user: User | null;
  /** La administración lo decide en el servidor; la web solo lo usa para mostrar el enlace a /admin. */
  isAdmin: boolean;
  /** Nivel interno para adaptar los textos (nunca se muestra); 'initiation' hasta que /api/me lo devuelva. */
  level: Level;
  /** El alumno ya eligió su nivel (si no, se le lleva a /bienvenida). */
  levelChosen: boolean;
  /** Actualiza el nivel tras elegirlo en la pantalla de nivel. */
  setLevel(l: Level): void;
  /** Tablero y piezas equipados (los de por defecto hasta saber otra cosa). */
  equipped: Equipped;
  /** Tienda (saldo, protectores, objetos); null hasta que carga o si falla. */
  shop: Shop | null;
  setShop(s: Shop): void;
  refreshShop(): Promise<void>;
  /** Fija la sesión y espera a /api/me para saber el nivel antes de exponer el usuario. */
  setSession(user: User | null): Promise<void>;
  logout(): Promise<void>;
  /** Borra la cuenta en el servidor y limpia la sesión local; lanza si el servidor no la borró. */
  deleteAccount(): Promise<void>;
}

const Ctx = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('SessionProvider ausente');
  return v;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [level, setLevelState] = useState<Level>('initiation');
  const [levelChosen, setLevelChosen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

  const loadMe = useCallback(() => {
    setConnectionError(false);
    api
      .me()
      .then((r) => {
        setUser(r.user);
        if (r.level) setLevelState(r.level);
        setLevelChosen(r.levelChosen === true);
        setIsAdmin(r.isAdmin === true);
        if (r.equipped) setEquipped(sanitizeEquipped(r.equipped));
      })
      .catch((e: unknown) => {
        // 401 = sin sesión (normal). Cualquier otro fallo es un problema de conexión o del servidor: se avisa y se puede reintentar.
        if (!(e instanceof ApiError && e.status === 401)) setConnectionError(true);
      })
      .finally(() => setLoading(false));
  }, []);
  const retryConnection = useCallback(() => {
    setLoading(true);
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    setApiHandlers({
      unauthorized: () => {
        setUser(null);
        setIsAdmin(false);
        navigate('/entrar');
      },
      noAccess: () => {
        setUser(null);
        setIsAdmin(false);
        navigate('/entrar?acceso=denegado');
      },
    });
    loadMe();
  }, [loadMe]);

  useEffect(() => preloadPieces(equipped.pieces), [equipped.pieces]);

  // Con sesión, el saldo se carga aparte: la barra lo muestra en cuanto llega.
  const userId = user?.id ?? null;
  useEffect(() => {
    setReviewUser(userId);
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

  const setSession = useCallback(async (u: User | null) => {
    if (u) {
      // El nivel se conoce antes de exponer el usuario: si no, la redirección de primer acceso
      // llevaría a /bienvenida a quien ya eligió nivel.
      try {
        const r = await api.me();
        setLevelState(r.level ?? 'initiation');
        setLevelChosen(r.levelChosen === true);
        setIsAdmin(r.isAdmin === true);
      } catch {
        /* sin /api/me se conserva lo anterior */
      }
    } else if (!u) {
      setLevelState('initiation');
      setLevelChosen(false);
      setIsAdmin(false);
    }
    setUser(u);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      loading,
      connectionError,
      retryConnection,
      user,
      isAdmin,
      level,
      levelChosen,
      setLevel,
      equipped,
      shop,
      setShop,
      refreshShop,
      setSession,
      logout: async () => {
        try {
          await api.logout();
        } catch {
          /* da igual: se limpia el estado local */
        }
        setUser(null);
        setIsAdmin(false);
        setLevelState('initiation');
        setLevelChosen(false);
        navigate('/');
      },
      deleteAccount: async () => {
        await api.deleteAccount(); // si falla no se limpia nada: la cuenta sigue existiendo
        setUser(null);
        setIsAdmin(false);
        setLevelState('initiation');
        setLevelChosen(false);
        navigate('/');
      },
    }),
    [loading, connectionError, retryConnection, user, isAdmin, level, levelChosen, setLevel, equipped, shop, setShop, refreshShop, setSession],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
