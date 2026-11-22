import type {
  AnswerBody,
  AccessOverview,
  AnswerResult,
  CompleteLessonBody,
  CompleteReviewBody,
  CompleteReviewResponse,
  Equipped,
  AiUsage,
  OpeningsStats,
  FinishResult,
  LessonProgress,
  MapUnit,
  LevelInfo,
  OutlineUnit,
  Profile,
  SessionStart,
  SessionStatus,
  Shop,
  User,
} from '../../src/shared/api';
import type { Level } from '../../src/types';
import type { Lesson } from '../../src/content/schema';

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
let onNoAccess: Listener = () => {};
export function setApiHandlers(h: { unauthorized: Listener; noAccess: Listener }): void {
  onUnauthorized = h.unauthorized;
  onNoAccess = h.noAccess;
}

/** El modo simulado solo existe en desarrollo (o con VITE_MOCK=1 al compilar): en producción no se incluye el temario ni el mock en el JS. */
const MOCK_ALLOWED = import.meta.env.DEV || import.meta.env.VITE_MOCK === '1';
function sessionFlag(): boolean {
  try {
    return sessionStorage.getItem('chedex-mock') === '1';
  } catch {
    return false;
  }
}
export const USE_MOCK = MOCK_ALLOWED && (new URLSearchParams(window.location.search).has('mock') || sessionFlag());
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
    res = MOCK_ALLOWED && USE_MOCK ? await (await import('./dev/mock')).mockFetch(path, init) : await fetch(path, init);
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
    // La administración quitó el acceso a esta cuenta mientras tenía la sesión abierta.
    if (res.status === 403 && (data as { code?: string } | null)?.code === 'no_access') onNoAccess();
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

/** Respuesta de completar una lección. Los campos de la tienda pueden faltar en un servidor antiguo. */
export interface CompleteResponse {
  progress: LessonProgress;
  profile: Profile;
  chedexEarned?: number;
  protectorUsed?: boolean;
}

export const api = {
  /** El acceso real es un enlace a /auth/login (redirección a Lichess); solo el modo simulado usa la API. */
  mockLogin: () => request<{ user: User }>('GET', '/auth/login', undefined, { silent401: true }),
  logout: () => request<{ ok: true }>('POST', '/auth/logout'),
  /** Borra la cuenta y todos sus datos (irreversible). */
  deleteAccount: () => request<{ ok: true }>('DELETE', '/api/account'),
  me: () =>
    request<{ user: User; isAdmin?: boolean; ai?: boolean; openingsStats?: boolean; equipped?: Equipped; level?: Level; levelChosen?: boolean }>('GET', '/api/me', undefined, { silent401: true }),
  map: () => request<{ units: MapUnit[] }>('GET', '/api/map'),
  lesson: (id: string) => request<{ lesson: Lesson }>('GET', `/api/lessons/${encodeURIComponent(id)}`),
  outline: () => request<{ units: OutlineUnit[] }>('GET', '/api/outline', undefined, { silent401: true }),
  complete: (id: string, b: CompleteLessonBody) =>
    request<CompleteResponse>(
      'POST',
      `/api/lessons/${encodeURIComponent(id)}/complete`,
      b,
    ),
  completeReview: (b: CompleteReviewBody): Promise<CompleteReviewResponse> =>
    USE_MOCK ? Promise.resolve({ counted: true }) : request<CompleteReviewResponse>('POST', '/api/review/complete', b),
  level: () => request<LevelInfo>('GET', '/api/level'),
  setLevel: (level: Level) => request<LevelInfo>('PUT', '/api/level', { level }),
  profile: () => request<{ profile: Profile }>('GET', '/api/profile'),
  shop: () => request<Shop>('GET', '/api/shop'),
  buy: (itemId: string) => request<Shop>('POST', '/api/shop/buy', { itemId }),
  equip: (kind: 'pieces' | 'board', itemId: string) => request<Shop>('POST', '/api/shop/equip', { kind, itemId }),
  sessionStatus: () => request<SessionStatus>('GET', '/api/session/status'),
  session: () => request<SessionStart>('GET', '/api/session'),
  answer: (b: AnswerBody) => request<AnswerResult>('POST', '/api/session/answer', b),
  finish: (sessionId: string) => request<FinishResult>('POST', '/api/session/finish', { sessionId }),
  /** Estadísticas de Lichess para una posición; cualquier fallo (apagado, tope, error) llega como {unavailable:true}. */
  openingsStats: (fen: string, source: 'masters') =>
    request<OpeningsStats | { unavailable: true }>('GET', `/api/openings/stats?fen=${encodeURIComponent(fen)}&source=${source}`).catch(
      (): { unavailable: true } => ({ unavailable: true }),
    ),
  adminAi: () => request<AiUsage>('GET', '/api/admin/ai'),
  adminAccess: () => request<AccessOverview>('GET', '/api/admin/access'),
  adminAllow: (username: string) => request<AccessOverview>('POST', '/api/admin/allowed', { username }),
  adminRemove: (id: string) => request<AccessOverview>('DELETE', `/api/admin/allowed/${encodeURIComponent(id)}`),
  adminApprove: (id: string) => request<AccessOverview>('POST', `/api/admin/requests/${encodeURIComponent(id)}/approve`),
  adminDismiss: (id: string) => request<AccessOverview>('DELETE', `/api/admin/requests/${encodeURIComponent(id)}`),
};
