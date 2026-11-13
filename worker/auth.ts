/**
 * Acceso con Lichess (OAuth PKCE, sin scopes). Adaptado del login de producción de chedexpulse.app.
 *  - Estado y sesión viajan en cookies selladas con AES-GCM (clave SESSION_SECRET, 32 bytes base64url).
 *  - El token de Lichess solo se usa para leer /api/account y se revoca siempre; nunca se guarda.
 *  - Solo APIs Web (crypto.subtle, fetch, AbortSignal): corre en Workers y en Node.
 */
import type { Context } from 'hono';

const encoder = new TextEncoder();

export const base64url = (bytes: ArrayBuffer | Uint8Array): string =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const fromBase64url = (value: string): Uint8Array<ArrayBuffer> => {
  const bin = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const randomToken = () => base64url(crypto.getRandomValues(new Uint8Array(32)));

async function aesKey(secret: string) {
  const raw = fromBase64url(secret);
  if (raw.length !== 32) throw new Error('SESSION_SECRET debe ser de 32 bytes en base64url');
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function seal(data: Record<string, unknown>, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await aesKey(secret),
    encoder.encode(JSON.stringify(data)),
  );
  return `${base64url(iv)}.${base64url(encrypted)}`;
}

export async function unseal(
  value: string | undefined,
  secret: string,
  kind: string,
  nowMs = Date.now(),
): Promise<Record<string, any> | null> {
  try {
    if (!value || value.length > 4096) return null;
    const parts = value.split('.');
    if (parts.length !== 2) return null;
    const bytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64url(parts[0]!) },
      await aesKey(secret),
      fromBase64url(parts[1]!),
    );
    const data = JSON.parse(new TextDecoder().decode(bytes));
    return data.kind === kind && Number.isFinite(data.exp) && data.exp > nowMs ? data : null;
  } catch {
    return null;
  }
}

export interface AuthConfig {
  secret: string | undefined;
  /** Origen público, p. ej. https://chedexpulse.app (en local, http://localhost:8787). */
  origin: string | undefined;
  now: () => Date;
  /**
   * Se llama al terminar el login correcto (upsert del usuario). `perfs` lleva SOLO los perfs de rápidas, clásicas y blitz
   * tal como los envía Lichess, SIN validar (la validación estricta es de quien los usa).
   */
  onLogin: (
    user: { id: string; username: string },
    perfs: { rapid?: unknown; classical?: unknown; blitz?: unknown; present?: boolean },
  ) => Promise<void>;
  clientId?: string;
}

export const SESSION_MS = 7 * 86_400_000;
const OAUTH_MS = 10 * 60_000;

/** Nombres de cookie: prefijo __Host- solo con HTTPS (exige Secure). */
export function cookieNames(origin: string) {
  const secure = origin.startsWith('https:');
  return {
    secure,
    session: secure ? '__Host-chedex_session' : 'chedex_session',
    oauth: secure ? '__Host-chedex_oauth' : 'chedex_oauth',
  };
}

const cookieHeader = (name: string, value: string, age: number, secure: boolean) =>
  `${name}=${value}; Path=/; HttpOnly;${secure ? ' Secure;' : ''} SameSite=Lax; Max-Age=${age}`;

function readCookie(c: Context, name: string): string | undefined {
  return (c.req.header('cookie') ?? '')
    .split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function readSession(c: Context, cfg: AuthConfig): Promise<{ id: string; username: string } | null> {
  if (!cfg.secret || !cfg.origin) return null;
  const s = await unseal(readCookie(c, cookieNames(cfg.origin).session), cfg.secret, 'session', cfg.now().getTime());
  if (!s || typeof s.id !== 'string' || typeof s.username !== 'string') return null;
  return { id: s.id, username: s.username };
}

function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  for (const ck of cookies) headers.append('Set-Cookie', ck);
  return new Response(null, { status: 303, headers });
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const NOT_CONFIGURED = { error: 'Acceso con Lichess no configurado en este entorno.' };

export async function handleLogin(c: Context, cfg: AuthConfig): Promise<Response> {
  if (!cfg.secret || !cfg.origin) return json(NOT_CONFIGURED, 503);
  if (new URL(c.req.url).origin !== cfg.origin) return json({ error: 'Origen no permitido' }, 403);
  const n = cookieNames(cfg.origin);
  const verifier = randomToken();
  const state = randomToken();
  const challenge = base64url(await crypto.subtle.digest('SHA-256', encoder.encode(verifier)));
  const payload = await seal({ kind: 'oauth', verifier, state, exp: cfg.now().getTime() + OAUTH_MS }, cfg.secret);
  const authorize = new URL('https://lichess.org/oauth');
  authorize.search = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId ?? 'chedexpulse',
    redirect_uri: `${cfg.origin}/auth/callback`,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
    scope: '',
  }).toString();
  return redirect(authorize.href, [cookieHeader(n.oauth, payload, OAUTH_MS / 1000, n.secure)]);
}

export async function handleCallback(c: Context, cfg: AuthConfig): Promise<Response> {
  if (!cfg.secret || !cfg.origin) return json(NOT_CONFIGURED, 503);
  const url = new URL(c.req.url);
  if (url.origin !== cfg.origin) return json({ error: 'Origen no permitido' }, 403);
  const { origin, secret } = cfg;
  const n = cookieNames(origin);
  const clearOauth = cookieHeader(n.oauth, '', 0, n.secure);
  const failed = () => redirect(`${origin}/entrar?auth=failed`, [clearOauth]);

  const pending = await unseal(readCookie(c, n.oauth), secret, 'oauth', cfg.now().getTime());
  if (!pending || url.searchParams.get('state') !== pending.state || url.searchParams.has('error')) return failed();
  const code = url.searchParams.get('code');
  if (!code || !/^[A-Za-z0-9_]{1,1024}$/.test(code)) return failed();

  let token: string | undefined;
  try {
    const exchange = await fetch('https://lichess.org/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: cfg.clientId ?? 'chedexpulse',
        redirect_uri: `${origin}/auth/callback`,
        code_verifier: String(pending.verifier),
        code,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!exchange.ok) return failed();
    const t = ((await exchange.json()) as { access_token?: unknown }).access_token;
    if (typeof t !== 'string' || !/^[A-Za-z0-9_]{1,2048}$/.test(t)) return failed();
    token = t;
    const account = await fetch('https://lichess.org/api/account', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(12_000),
    });
    if (!account.ok) return failed();
    const user = (await account.json()) as { id?: unknown; username?: unknown; perfs?: unknown };
    if (
      typeof user.id !== 'string' ||
      !/^[A-Za-z0-9_-]{1,30}$/.test(user.id) ||
      typeof user.username !== 'string' ||
      !/^[A-Za-z0-9_-]{1,30}$/.test(user.username)
    )
      return failed();
    const me = { id: user.id.toLowerCase(), username: user.username };
    // Del resto de la cuenta solo se extraen los ritmos rápido y clásico (colocación inicial).
    const rawPerfs = typeof user.perfs === 'object' && user.perfs !== null ? (user.perfs as Record<string, unknown>) : {};
    await cfg.onLogin(me, {
      rapid: rawPerfs.rapid,
      classical: rawPerfs.classical,
      blitz: rawPerfs.blitz,
      present: typeof user.perfs === 'object' && user.perfs !== null,
    });
    const session = await seal(
      { kind: 'session', id: me.id, username: me.username, exp: cfg.now().getTime() + SESSION_MS },
      secret,
    );
    return redirect(`${origin}/aprender`, [clearOauth, cookieHeader(n.session, session, SESSION_MS / 1000, n.secure)]);
  } catch {
    return failed();
  } finally {
    // Solo se verifica identidad. El token de Lichess nunca se guarda y se revoca siempre.
    if (token)
      await fetch('https://lichess.org/api/token', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5_000),
      }).catch(() => {});
  }
}

export function handleLogout(c: Context, cfg: AuthConfig): Response {
  if (!cfg.origin) return json(NOT_CONFIGURED, 503);
  if (c.req.header('origin') !== cfg.origin) return json({ error: 'Origen no permitido' }, 403);
  const n = cookieNames(cfg.origin);
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  headers.append('Set-Cookie', cookieHeader(n.session, '', 0, n.secure));
  headers.append('Set-Cookie', cookieHeader(n.oauth, '', 0, n.secure));
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
