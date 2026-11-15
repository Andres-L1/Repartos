import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const text = readFileSync(fileURLToPath(new URL('../../web/public/_headers', import.meta.url)), 'utf8');
const csp = /Content-Security-Policy:\s*(.+)/.exec(text)?.[1] ?? '';
const directive = (name: string) => csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(name + ' ')) ?? '';

describe('web/public/_headers', () => {
  it('la CSP no permite código ni estilos en línea ni eval, y solo habla con Lichess', () => {
    expect(csp).not.toBe('');
    expect(directive('script-src')).toBe("script-src 'self' 'wasm-unsafe-eval'");
    expect(directive('style-src')).toBe("style-src 'self'");
    expect(csp).not.toMatch(/'unsafe-inline'|'unsafe-eval'/);
    expect(directive('connect-src')).toBe("connect-src 'self' https://lichess.org");
    for (const d of ['object-src', 'base-uri', 'frame-ancestors']) expect(directive(d)).toContain("'none'");
  });

  it('los ficheros con hash de /assets/ se cachean un año', () => {
    expect(/\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/.test(text)).toBe(true);
  });
});
