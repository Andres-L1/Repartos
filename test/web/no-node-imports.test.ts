import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '..', '..');

/** Archivos del código compartido con el navegador (las rutas inexistentes se ignoran). */
const targets = [
  'src/analysis/core.ts',
  'src/analysis/pgn.ts',
  'src/analysis/engine-like.ts',
  'src/analysis/uci.ts',
  'src/diagnosis',
  'src/pedagogy',
  'src/review',
  'src/lichess',
];

function collect(rel: string): string[] {
  const abs = join(root, rel);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isFile()) return [rel];
  return readdirSync(abs).flatMap((name) => collect(`${rel}/${name}`));
}

describe('código compartido con el navegador', () => {
  it('no importa módulos de node:', () => {
    const offenders: string[] = [];
    for (const file of targets.flatMap(collect).filter((f) => f.endsWith('.ts'))) {
      const text = readFileSync(join(root, file), 'utf8');
      if (/from\s+['"]node:/.test(text) || /require\(/.test(text)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});
