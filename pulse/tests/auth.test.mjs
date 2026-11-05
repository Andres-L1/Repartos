import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleAuth, seal, unseal } from '../auth.mjs';
const env = { SESSION_SECRET: Buffer.alloc(32, 3).toString('base64url'), PUBLIC_ORIGIN: 'https://pulse.test' };
const request = (path, options) => new Request(`https://pulse.test${path}`, options);
test('sesión cifrada: integridad, caducidad y separación OAuth/sesión', async () => {
  const value = await seal({ kind: 'session', username: 'Tester', exp: Date.now() + 10000 }, env.SESSION_SECRET);
  assert.equal((await unseal(value, env.SESSION_SECRET, 'session')).username, 'Tester');
  assert.equal(await unseal(value, env.SESSION_SECRET, 'oauth'), null);
  assert.equal(await unseal(value.slice(0, -3) + 'xxx', env.SESSION_SECRET, 'session'), null);
  assert.equal(await unseal(await seal({ kind: 'session', exp: 1 }, env.SESSION_SECRET), env.SESSION_SECRET, 'session'), null);
});
test('Lichess PKCE S256, estado aleatorio y ningún permiso adicional', async () => {
  const response = await handleAuth(request('/auth/login'), env);
  const url = new URL(response.headers.get('Location'));
  assert.equal(url.origin, 'https://lichess.org'); assert.equal(url.pathname, '/oauth');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), '');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://pulse.test/auth/callback');
  const cookie = response.headers.get('Set-Cookie');
  assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);
  const pending = await unseal(cookie.split(';')[0].split('=')[1], env.SESSION_SECRET, 'oauth');
  assert.equal(pending.state, url.searchParams.get('state'));
  assert.equal(Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pending.verifier))).toString('base64url'), url.searchParams.get('code_challenge'));
});
test('callback rechaza estado inválido sin contactar con Lichess', async () => {
  const pending = await seal({ kind: 'oauth', state: 'correct', verifier: 'secret', exp: Date.now() + 10000 }, env.SESSION_SECRET);
  const original = globalThis.fetch; let called = false;
  globalThis.fetch = async () => { called = true; throw Error('network'); };
  try {
    const response = await handleAuth(request('/auth/callback?code=fake&state=wrong', { headers: { Cookie: `__Host-pulse_oauth=${pending}` } }), env);
    assert.match(response.headers.get('Location'), /auth=failed/); assert.equal(called, false);
  } finally { globalThis.fetch = original; }
});
test('callback completo: verifica cuenta, revoca token y sesión sin credenciales', async () => {
  const pending = await seal({ kind: 'oauth', state: 'correct', verifier: 'secret', exp: Date.now() + 10000 }, env.SESSION_SECRET);
  const original = globalThis.fetch, calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (options.method === 'DELETE') return new Response(null, { status: 204 });
    return Response.json(url.endsWith('/account') ? { id: 'tester', username: 'Tester' } : { access_token: 'test_token' });
  };
  try {
    const response = await handleAuth(request('/auth/callback?code=valid&state=correct', { headers: { Cookie: `__Host-pulse_oauth=${pending}` } }), env);
    assert.equal(response.status, 303); assert.equal(response.headers.get('Location'), 'https://pulse.test/#hoy');
    assert.equal(calls.length, 3); assert.equal(calls[2].options.method, 'DELETE');
    const sessionCookie = response.headers.getSetCookie().find(v => v.startsWith('__Host-pulse_session='));
    const data = await unseal(sessionCookie.split(';')[0].split('=')[1], env.SESSION_SECRET, 'session');
    assert.equal(data.username, 'Tester'); assert.equal(data.token, undefined); assert.equal(data.access_token, undefined);
  } finally { globalThis.fetch = original; }
});
test('sesión siempre privada, logout POST con comprobación de origen', async () => {
  const response = await handleAuth(request('/api/session'), env);
  assert.equal(response.headers.get('Cache-Control'), 'no-store'); assert.equal((await response.json()).authenticated, false);
  assert.equal((await handleAuth(request('/auth/logout'), env)).status, 405);
  assert.equal((await handleAuth(request('/auth/logout', { method: 'POST', headers: { Origin: 'https://evil.test' } }), env)).status, 403);
  assert.equal((await handleAuth(request('/auth/logout', { method: 'POST', headers: { Origin: env.PUBLIC_ORIGIN } }), env)).status, 303);
});
