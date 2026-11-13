import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { contrast, PAIRS } from './contrast.data.js';

const SRC = join(__dirname, '..', '..', 'web', 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const read = (p: string) => readFileSync(p, 'utf8');
const cssFiles = walk(SRC).filter((f) => f.endsWith('.css'));

describe('tema: la app es siempre oscura', () => {
  it('hay hojas de estilo que revisar', () => {
    expect(cssFiles.length).toBeGreaterThanOrEqual(4);
  });

  it('ningún CSS de web/src reintroduce @media (prefers-color-scheme: light)', () => {
    for (const f of cssFiles) {
      expect(read(f), f).not.toMatch(/prefers-color-scheme\s*:\s*light/i);
    }
  });

  it('ningún CSS ni componente usa prefers-color-scheme ni el mecanismo data-landing', () => {
    for (const f of walk(SRC).filter((p) => /\.(css|tsx?)$/.test(p))) {
      const text = read(f);
      expect(text, f).not.toMatch(/prefers-color-scheme/i);
      expect(text, f).not.toMatch(/data-landing/);
    }
  });

  it('el CSS fija color-scheme: dark y no declara color-scheme: light', () => {
    const all = cssFiles.map(read).join('\n');
    expect(all).toMatch(/color-scheme:\s*dark/);
    expect(all).not.toMatch(/color-scheme:\s*light/);
  });

  it('index.html tiene un único theme-color oscuro y color-scheme dark', () => {
    const html = read(join(SRC, '..', 'index.html'));
    const themeColors = html.match(/<meta[^>]+name="theme-color"[^>]*>/g) ?? [];
    expect(themeColors).toHaveLength(1);
    expect(themeColors[0]).toContain('#0b0c0e');
    expect(themeColors[0]).not.toContain('media=');
    expect(html).toMatch(/<meta[^>]+name="color-scheme"[^>]+content="dark"/);
  });

  it('no se usa #8a8d95 como color de texto de lectura', () => {
    for (const f of cssFiles) expect(read(f), f).not.toMatch(/color:\s*#8a8d95/i);
  });
});

describe('contraste (WCAG) de las parejas usadas en la app', () => {
  for (const p of PAIRS) {
    it(`${p.name}: ${p.fg} sobre ${p.bg} >= ${p.min}:1`, () => {
      expect(contrast(p.fg, p.bg)).toBeGreaterThanOrEqual(p.min);
    });
  }
});
