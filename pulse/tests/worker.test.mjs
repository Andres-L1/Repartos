import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { parseNews, normalizeBroadcasts, decodeXml } from '../worker.mjs';
import { countries, matchesCountry } from '../public/data.js';
test('RSS conserva fecha y fuente y descarta enlaces ajenos o fechas inválidas', () => {
  const xml =
    '<rss><item><title><![CDATA[Chess &amp; world &#8217;]]></title><link>https://www.fide.com/news/</link><pubDate>Thu, 05 Nov 2026 13:26:42 +0000</pubDate></item><item><title>Bad</title><link>https://evil.test/</link><pubDate>Thu, 05 Nov 2026 13:26:42 +0000</pubDate></item><item><title>No date</title><link>https://www.fide.com/test/</link><pubDate>invalid</pubDate></item></rss>';
  assert.deepEqual(parseNews(xml), [
    {
      title: 'Chess & world ’',
      url: 'https://www.fide.com/news/',
      publishedAt: '2026-11-05T13:26:42.000Z',
      source: 'FIDE',
    },
  ]);
  assert.equal(decodeXml('&#9999999999; &lt;test&gt;'), '<test>');
});
test('directo exige ongoing, elimina duplicados y URLs ajenas', () => {
  const entry = {
    tour: {
      id: 'a',
      name: 'Open',
      url: 'https://lichess.org/broadcast/open/a',
      info: { location: 'Spain' },
    },
    round: { ongoing: true, startsAt: 123 },
  };
  const data = normalizeBroadcasts({
    active: [entry, entry, { tour: { id: 'b', name: 'Bad', url: 'javascript:alert(1)' } }],
    upcoming: [{ tour: { id: 'c', name: 'Soon', url: 'https://lichess.org/broadcast/soon/c' } }],
  });
  assert.equal(data.length, 2);
  assert.equal(data[0].status, 'live');
  assert.equal(data[1].status, 'upcoming');
  assert.equal(normalizeBroadcasts({ active: {} }).length, 0);
});
test('países: coincidencias por palabra, sin falsos India/Indiana', () => {
  const india = countries.find((c) => c.code === 'IND');
  assert.equal(matchesCountry('Chennai, India', india), true);
  assert.equal(matchesCountry('Indiana, USA', india), false);
});
test('los nombres geográficos se interpretan como texto y se recompilan solo si cambian', () => {
  const country = { aliases: ['Test (isla)'] };
  assert.equal(matchesCountry('Open Test (isla), 2026', country), true);
  assert.equal(matchesCountry('Open Test isla, 2026', country), false);
  country.aliases = ['Otro país'];
  assert.equal(matchesCountry('Otro país', country), true);
  assert.equal(matchesCountry('Test (isla)', country), false);
});
test('API antigua no existe y métodos de escritura se rechazan', async () => {
  assert.equal(
    (await worker.fetch(new Request('https://pulse.test/api/orders'), {}, {})).status,
    404,
  );
  assert.equal(
    (await worker.fetch(new Request('https://pulse.test/api/news', { method: 'POST' }), {}, {}))
      .status,
    405,
  );
});
test('errores externos no inventan datos y no se cachean', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('no', { status: 429 });
  try {
    const response = await worker.fetch(
      new Request('https://pulse.test/api/news'),
      {},
      { waitUntil() {} },
    );
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const data = await response.json();
    assert.equal(data.status, 'unavailable');
    assert.deepEqual(data.items, []);
    assert.equal(data.fetchedAt, null);
  } finally {
    globalThis.fetch = original;
  }
});
test('páginas con política de seguridad y sin rutas de recados', async () => {
  const env = { ASSETS: { fetch: async () => new Response('not found', { status: 404 }) } };
  const response = await worker.fetch(new Request('https://pulse.test/admin.html'), env, {});
  assert.equal(response.status, 404);
  assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
});
test('análisis: si GitHub falla se identifica la copia publicada y se conserva su fecha', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('offline');
  };
  try {
    const snapshot = {
      schema: 1,
      generatedAt: '2020-01-01T00:00:00Z',
      fide: { players: [] },
      interest: { players: [] },
    };
    const env = { ASSETS: { fetch: async () => Response.json(snapshot) } };
    const response = await worker.fetch(new Request('https://pulse.test/api/analytics'), env, {
      waitUntil() {},
    });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.delivery, 'bundled');
    assert.equal(data.stale, true);
    assert.equal(data.generatedAt, snapshot.generatedAt);
  } finally {
    globalThis.fetch = original;
  }
});
