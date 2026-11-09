import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seal } from '../auth.mjs';
import { handleProfile, validProfile } from '../server/profile.mjs';
const env = {
  SESSION_SECRET: Buffer.alloc(32, 2).toString('base64url'),
  PUBLIC_ORIGIN: 'https://pulse.test',
  PULSE_DB: {
    prepare() {
      throw new Error('unexpected database access');
    },
  },
};
const data = {
  favorites: [{ type: 'player', id: '123', name: 'Jugador' }],
  preferences: { language: 'es', publisher: 'FIDE', mapFilter: 'live' },
};
test('perfil valida favoritos y filtros y limita el tamaño', () => {
  assert.ok(validProfile(data));
  assert.ok(!validProfile({ ...data, favorites: [{ type: 'player', id: 'x', name: 'x' }] }));
  assert.ok(!validProfile({ ...data, favorites: Array(101).fill(data.favorites[0]) }));
  assert.ok(!validProfile({ ...data, preferences: { ...data.preferences, mapFilter: 'invalid' } }));
});
test('perfil requiere sesión y protege escrituras contra otros orígenes', async () => {
  const unauth = await handleProfile(new Request('https://pulse.test/api/profile'), env);
  assert.equal(unauth.status, 401);
  const session = await seal(
    { kind: 'session', id: 'tester', exp: Date.now() + 10000 },
    env.SESSION_SECRET,
  );
  const req = new Request('https://pulse.test/api/profile', {
    method: 'PUT',
    headers: {
      cookie: `__Host-pulse_session=${session}`,
      origin: 'https://evil.test',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ data, version: 0 }),
  });
  assert.equal((await handleProfile(req, env)).status, 403);
});
