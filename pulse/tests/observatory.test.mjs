import test from 'node:test';
import assert from 'node:assert/strict';
import { orderBroadcasts, countryActivity } from '../public/lib/observatory.js';
import { matchesCountry } from '../public/data.js';

test('directos primero, próximos por fecha y finalizados al final sin mutar el origen', () => {
  const items = [
    { id: 'late', status: 'upcoming', startsAt: '2026-11-07' },
    { id: 'done', status: 'finished', startsAt: '2026-11-04' },
    { id: 'live', status: 'live', startsAt: '2026-11-05' },
    { id: 'soon', status: 'upcoming', startsAt: '2026-11-06' },
  ];
  assert.deepEqual(
    orderBroadcasts(items).map((item) => item.id),
    ['live', 'soon', 'late', 'done'],
  );
  assert.equal(items[0].id, 'late');
});

test('una afiliación FIDE nunca genera una conexión geográfica', () => {
  assert.equal(
    matchesCountry('FIDE World Championship', { code: 'FID', aliases: ['FIDE'] }),
    false,
  );
  assert.equal(
    matchesCountry('FIDE World Championship in India', { code: 'IND', aliases: ['India'] }),
    true,
  );
  assert.equal(matchesCountry('Indiana', { code: 'IND', aliases: ['India'] }), false);
});

test('capas separan directos, próximas y federación sin inventar ubicaciones', () => {
  const countries = [{ code: 'ESP', name: 'España', aliases: ['Spain'] }];
  const items = [
    { id: '1', status: 'live', location: 'Madrid, Spain' },
    { id: '2', status: 'upcoming', location: 'Spain' },
    { id: '3', status: 'live', location: '' },
  ];
  const players = [
    { id: '10', country: 'ESP' },
    { id: '11', country: 'IND' },
  ];
  assert.equal(countryActivity(countries, items, players)[0].count, 2);
  assert.equal(countryActivity(countries, items, players, 'live')[0].count, 1);
  assert.equal(countryActivity(countries, items, players, 'upcoming')[0].count, 1);
  assert.equal(countryActivity(countries, items, players, 'players')[0].count, 1);
});
