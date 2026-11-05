const SESSION = '__Host-pulse_session', OAUTH = '__Host-pulse_oauth';
const encoder = new TextEncoder();
const base64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const decode = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const random = () => base64url(crypto.getRandomValues(new Uint8Array(32)));
const cookie = (name, value, age) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const readCookie = (request, name) => (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`))?.slice(name.length + 1);
async function key(secret) { return crypto.subtle.importKey('raw', decode(secret), 'AES-GCM', false, ['encrypt', 'decrypt']); }
export async function seal(data, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(secret), encoder.encode(JSON.stringify(data)));
  return `${base64url(iv)}.${base64url(encrypted)}`;
}
export async function unseal(value, secret, kind) {
  try {
    if (!value || value.length > 4096) return null;
    const parts = value.split('.'); if (parts.length !== 2) return null;
    const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(parts[0]) }, await key(secret), decode(parts[1]));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    return data.kind === kind && Number.isFinite(data.exp) && data.exp > Date.now() ? data : null;
  } catch { return null; }
}
function response(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
function redirect(location, cookies = []) {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  cookies.forEach(value => headers.append('Set-Cookie', value));
  return new Response(null, { status: 303, headers });
}
export async function handleAuth(request, env) {
  const url = new URL(request.url), path = url.pathname;
  if (!path.startsWith('/auth/') && path !== '/api/session') return null;
  const isLogout = path === '/auth/logout';
  if (request.method !== (isLogout ? 'POST' : 'GET')) return response({ error: 'Método no permitido' }, 405);
  if (path === '/api/session') {
    const session = env.SESSION_SECRET && await unseal(readCookie(request, SESSION), env.SESSION_SECRET, 'session');
    return response({ authenticated: Boolean(session), user: session ? { id: session.id, username: session.username } : null });
  }
  if (!env.SESSION_SECRET || !env.PUBLIC_ORIGIN) return response({ error: 'Acceso con Lichess no configurado en este entorno.' }, 503);
  const origin = env.PUBLIC_ORIGIN;
  if (url.origin !== origin) return response({ error: 'Origen no permitido' }, 403);
  if (isLogout) {
    if (request.headers.get('Origin') !== origin) return response({ error: 'Origen no permitido' }, 403);
    return redirect(`${origin}/#hoy`, [cookie(SESSION, '', 0), cookie(OAUTH, '', 0)]);
  }
  const redirectUri = `${origin}/auth/callback`, clientId = 'chedexpulse';
  if (path === '/auth/login') {
    const verifier = random(), state = random();
    const challenge = base64url(await crypto.subtle.digest('SHA-256', encoder.encode(verifier)));
    const payload = await seal({ kind: 'oauth', verifier, state, exp: Date.now() + 600000 }, env.SESSION_SECRET);
    const authorize = new URL('https://lichess.org/oauth');
    authorize.search = new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: redirectUri, code_challenge_method: 'S256', code_challenge: challenge, state, scope: '' }).toString();
    return redirect(authorize.href, [cookie(OAUTH, payload, 600)]);
  }
  if (path === '/auth/callback') {
    const pending = await unseal(readCookie(request, OAUTH), env.SESSION_SECRET, 'oauth');
    const failed = () => redirect(`${origin}/?auth=failed#hoy`, [cookie(OAUTH, '', 0)]);
    if (!pending || url.searchParams.get('state') !== pending.state || url.searchParams.has('error')) return failed();
    const code = url.searchParams.get('code');
    if (!code || !/^[A-Za-z0-9_]{1,1024}$/.test(code)) return failed();
    let token;
    try {
      const exchange = await fetch('https://lichess.org/api/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, redirect_uri: redirectUri, code_verifier: pending.verifier, code }), signal: AbortSignal.timeout(12000)
      });
      if (!exchange.ok) return failed();
      token = (await exchange.json()).access_token;
      if (typeof token !== 'string' || !/^[A-Za-z0-9_]{1,2048}$/.test(token)) return failed();
      const account = await fetch('https://lichess.org/api/account', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
      if (!account.ok) return failed();
      const user = await account.json();
      if (typeof user.id !== 'string' || typeof user.username !== 'string' || !/^[A-Za-z0-9_-]{1,30}$/.test(user.username)) return failed();
      const session = await seal({ kind: 'session', id: user.id, username: user.username, exp: Date.now() + 43200000 }, env.SESSION_SECRET);
      return redirect(`${origin}/#hoy`, [cookie(OAUTH, '', 0), cookie(SESSION, session, 43200)]);
    } catch { return failed(); }
    finally {
      // Solo se verifica identidad. El token de Lichess nunca se guarda en la sesión ni en el navegador.
      if (token) await fetch('https://lichess.org/api/token', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) }).catch(() => {});
    }
  }
  return response({ error: 'Recurso no encontrado' }, 404);
}
