import type {
  BillingMode,
  CompleteLessonBody,
  Equipped,
  LessonProgress,
  MapUnit,
  OutlineUnit,
  Placement,
  PlacementMode,
  Profile,
  Shop,
  Subscription,
  User,
} from '../../src/shared/api';
import type { Lesson } from '../../src/content/schema';
import { mockFetch } from './dev/mock';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Listener = () => void;
let onUnauthorized: Listener = () => {};
let onPaymentRequired: (lessonId?: string) => void = () => {};
export function setApiHandlers(h: { unauthorized: Listener; payment: (lessonId?: string) => void }): void {
  onUnauthorized = h.unauthorized;
  onPaymentRequired = h.payment;
}

export const USE_MOCK = new URLSearchParams(window.location.search).has('mock') ||
  sessionStorage.getItem('chedex-mock') === '1';
if (USE_MOCK) {
  try {
    sessionStorage.setItem('chedex-mock', '1');
  } catch {
    /* sin almacenamiento */
  }
}

async function request<T>(method: string, path: string, body?: unknown, opts: { silent401?: boolean } = {}): Promise<T> {
  const init: RequestInit = {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
  let res: Response;
  try {
    res = USE_MOCK ? await mockFetch(path, init) : await fetch(path, init);
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor. Inténtalo de nuevo.');
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* sin cuerpo */
  }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? 'Ha ocurrido un error inesperado.';
    if (res.status === 401 && !opts.silent401) onUnauthorized();
    if (res.status === 402) onPaymentRequired(path.match(/^\/lessons\/([^/]+)/)?.[1]);
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

/** Respuesta de completar una lección. Los campos de la tienda pueden faltar en un servidor antiguo. */
export interface CompleteResponse {
  progress: LessonProgress;
  xpGained: number;
  profile: Profile;
  chedexEarned?: number;
  protectorUsed?: boolean;
}

export const api = {
  config: () => request<{ billingMode: BillingMode }>('GET', '/api/config', undefined, { silent401: true }),
  /** El acceso real es un enlace a /auth/login (redirección a Lichess); solo el modo simulado usa la API. */
  mockLogin: () => request<{ user: User }>('GET', '/auth/login', undefined, { silent401: true }),
  logout: () => request<{ ok: true }>('POST', '/auth/logout'),
  me: () =>
    request<{ user: User; subscription: Subscription; billingMode: BillingMode; equipped?: Equipped }>('GET', '/api/me', undefined, { silent401: true }),
  map: () => request<{ units: MapUnit[] }>('GET', '/api/map'),
  lesson: (id: string) => request<{ lesson: Lesson }>('GET', `/api/lessons/${encodeURIComponent(id)}`),
  outline: () => request<{ units: OutlineUnit[] }>('GET', '/api/outline', undefined, { silent401: true }),
  demo: () => request<{ lesson: Lesson }>('GET', '/api/demo', undefined, { silent401: true }),
  complete: (id: string, b: CompleteLessonBody) =>
    request<CompleteResponse>(
      'POST',
      `/api/lessons/${encodeURIComponent(id)}/complete`,
      b,
    ),
  placement: () => request<Placement>('GET', '/api/placement'),
  setPlacement: (mode: PlacementMode) => request<Placement>('POST', '/api/placement', { mode }),
  profile: () => request<{ profile: Profile }>('GET', '/api/profile'),
  billing: () => request<{ subscription: Subscription }>('GET', '/api/billing'),
  subscribe: () => request<{ subscription: Subscription }>('POST', '/api/billing/subscribe'),
  shop: () => request<Shop>('GET', '/api/shop'),
  buy: (itemId: string) => request<Shop>('POST', '/api/shop/buy', { itemId }),
  equip: (kind: 'pieces' | 'board', itemId: string) => request<Shop>('POST', '/api/shop/equip', { kind, itemId }),
  cancel: () => request<{ subscription: Subscription }>('POST', '/api/billing/cancel'),
};
