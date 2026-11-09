import test from 'node:test';
import assert from 'node:assert/strict';
import { initLanding } from '../public/components/landing.js';

test('una fuente caída o un periodo distinto no producen cifras falsas', async () => {
  const original = {
    document: globalThis.document,
    window: globalThis.window,
    location: globalThis.location,
    fetch: globalThis.fetch,
  };
  const elements = new Map();
  const get = (key) => {
    if (!elements.has(key))
      elements.set(key, { textContent: '—', href: '', closest: () => get('leader-link') });
    return elements.get(key);
  };
  const coverage = { querySelector: (key) => get(key) };
  globalThis.document = {
    getElementById: (id) =>
      id === 'landing-coverage'
        ? coverage
        : id === 'landing-coverage-status'
          ? get('status')
          : null,
    querySelector: get,
    addEventListener() {},
  };
  globalThis.window = { addEventListener() {} };
  globalThis.location = { pathname: '/' };
  globalThis.fetch = async (url) => {
    if (url === '/api/broadcasts') return new Response('', { status: 503 });
    if (url === '/api/analytics/summary')
      return Response.json({
        status: 'ok',
        schema: 1,
        generatedAt: '2026-11-09T12:00:00Z',
        catalog: [],
        fide: { month: '2026-11', players: [], sources: [], federations: [] },
      });
    return Response.json({
      status: 'ok',
      month: '2026-10',
      totalComparable: 1,
      groups: { 'all:all': { total: 1, players: [{ id: '1', name: 'Example', score: 50 }] } },
    });
  };
  try {
    initLanding();
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(get('#landing-live-count').textContent, '—');
    assert.match(get('#landing-live-status').textContent, /no disponibles/);
    assert.equal(get('#landing-leader-score').textContent, '—');
    assert.match(get('#landing-leader-status').textContent, /no disponible/);
    assert.equal(get('[data-coverage="comparable"]').textContent, '—');
  } finally {
    Object.assign(globalThis, original);
  }
});
