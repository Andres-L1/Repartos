/**
 * Material para comprobar el repaso en el navegador sin Lichess ni motor: escribe web/public/__seed.json con partidas
 * del corpus (el alumno es «MockUser») y sus análisis. Se carga desde la consola del navegador (ver docs/estado-proyecto.md).
 * NO se versiona: borra el archivo al terminar.
 *   npx tsx scripts/corpus/browser-seed.mts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { analysisKey } from '../../src/review/config.js';
import { errorTier, keyErrors } from '../../src/review/select.js';
import { corpusAnalyses } from '../../test/review/corpus.js';

const club = new Map((JSON.parse(readFileSync(new URL('../../test/fixtures/corpus/club-games.json', import.meta.url), 'utf8')) as any[]).map((g) => [g.id, g]));
const sides = corpusAnalyses().filter((a) => club.has(a.gameId.slice(0, -2)));
const tiersOf = (a: (typeof sides)[number]) => keyErrors(a).map(errorTier);
// Una con solo motor, una con táctica perdida, una con causa, una sin errores graves (si la hay).
const pick = [
  sides.find((a) => tiersOf(a).includes('engine') && !tiersOf(a).includes('tactic')),
  sides.find((a) => tiersOf(a).includes('tactic')),
  sides.find((a) => tiersOf(a).every((t) => t === 'cause') && tiersOf(a).length > 0),
  sides.find((a) => tiersOf(a).length === 0),
  sides.find((a) => tiersOf(a).includes('engine') && a.gameId !== sides[0]?.gameId),
].filter((a): a is NonNullable<typeof a> => !!a);
const seen = new Set<string>();
const chosen = pick.filter((a) => (seen.has(a.gameId) ? false : (seen.add(a.gameId), true)));

const base = Date.now() - 86_400_000;
const ndjson = chosen
  .map((a, i) => {
    const g = club.get(a.gameId.slice(0, -2));
    const me = { user: { id: 'mockuser', name: 'MockUser' }, rating: 1500 };
    const other = { user: { id: 'rival' + i, name: 'rival' + i }, rating: 1500 };
    return JSON.stringify({
      id: a.gameId.slice(0, -2), rated: true, variant: 'standard', speed: g.speed === 'blitz' ? 'rapid' : g.speed, status: g.status,
      createdAt: base - i * 3_600_000, moves: g.moves, winner: g.winner ?? undefined,
      players: a.color === 'white' ? { white: me, black: other } : { white: other, black: me },
      opening: g.opening ? { name: g.opening } : undefined,
    });
  })
  .join('\n');
const analyses: Record<string, unknown> = {};
for (const a of chosen) analyses[analysisKey(a.gameId.slice(0, -2))] = { ...a, gameId: a.gameId.slice(0, -2) };
writeFileSync(new URL('../../web/public/__seed.json', import.meta.url), JSON.stringify({ ndjson, analyses }));
console.log(chosen.map((a) => `${a.gameId} ${a.color} ${tiersOf(a).join(',') || 'limpia'}`).join('\n'));
