import test from 'node:test';
import assert from 'node:assert/strict';
import { validFavorite, followedBroadcasts } from '../public/components/favorites.js';
test('favoritos solo admite identificadores de jugador o país válidos', () => {
  assert.equal(validFavorite({ type: 'player', id: '1503014', name: 'Magnus Carlsen' }), true);
  assert.equal(validFavorite({ type: 'country', id: 'ESP', name: 'España' }), true);
  assert.equal(validFavorite({ type: 'player', id: '../admin', name: 'X' }), false);
  assert.equal(validFavorite({ type: 'country', id: 'javascript:', name: 'X' }), false);
});

test('seguimiento vincula nombres completos o países sin coincidencias parciales', () => {
  const favorites = [
    { type: 'player', id: '1', name: 'Anand, Viswanathan' },
    { type: 'country', id: 'ESP', name: 'España' },
  ];
  const items = [
    { id: 'a', players: 'Viswanathan Anand, Ding Liren', location: '' },
    { id: 'b', players: 'Sivanandan Bodhana', location: 'India' },
    { id: 'c', players: '', location: 'Madrid, Spain' },
  ];
  assert.deepEqual(
    followedBroadcasts(favorites, items).map((item) => item.id),
    ['a', 'c'],
  );
});
