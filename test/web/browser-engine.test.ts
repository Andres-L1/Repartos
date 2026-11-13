import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserEngine } from '../../web/src/engine/browser-engine';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

class FakeWorker {
  static last: FakeWorker;
  static reply: (cmd: string) => unknown[] = () => [];
  sent: string[] = [];
  terminated = false;
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onerror: ((ev: { message: string }) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  constructor(public url: string) {
    FakeWorker.last = this;
  }
  postMessage(cmd: string) {
    this.sent.push(cmd);
    for (const d of FakeWorker.reply(cmd)) queueMicrotask(() => this.onmessage?.({ data: d }));
  }
  terminate() {
    this.terminated = true;
  }
}

const protocol = (cmd: string): unknown[] =>
  cmd === 'uci' ? [42, 'id name Fake', 'uciok'] : cmd === 'isready' ? ['readyok'] : [];

beforeEach(() => {
  vi.stubGlobal('Worker', FakeWorker);
  FakeWorker.reply = protocol;
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('BrowserEngine', () => {
  it('usa la URL por defecto y envía la secuencia UCI por postMessage, ignorando mensajes no textuales', async () => {
    FakeWorker.reply = (c) =>
      c.startsWith('go depth') ? [{ x: 1 }, 'info depth 12 score cp 15 pv e2e4', 'bestmove e2e4'] : protocol(c);
    const e = new BrowserEngine();
    await e.init();
    expect(FakeWorker.last.url).toBe('/engine/stockfish-nnue-16-single.js');
    const r = await e.analyze(START, { depth: 12 });
    expect(r).toEqual({ score: { cp: 15 }, bestUci: 'e2e4', pv: ['e2e4'] });
    expect(FakeWorker.last.sent).toEqual([
      'uci',
      'setoption name Threads value 1',
      'setoption name Hash value 32',
      'isready',
      'ucinewgame',
      'isready',
      `position fen ${START}`,
      'go depth 12',
    ]);
  });

  it('dos init concurrentes comparten un único Worker', async () => {
    let created = 0;
    const Counting = class extends FakeWorker {
      constructor(u: string) {
        super(u);
        created++;
      }
    };
    vi.stubGlobal('Worker', Counting);
    const e = new BrowserEngine();
    await Promise.all([e.init(), e.init()]);
    expect(created).toBe(1);
  });

  it('close envía quit, termina el Worker y rechaza el análisis pendiente sin esperar al plazo', async () => {
    FakeWorker.reply = (c) => (c.startsWith('go depth') ? [] : protocol(c));
    const e = new BrowserEngine();
    await e.init();
    const p = e.analyze(START, { depth: 12 });
    const assertion = expect(p).rejects.toThrow('El motor se cerró antes de terminar el análisis.');
    await new Promise((r) => setTimeout(r, 0));
    await e.close();
    await assertion;
    expect(FakeWorker.last.sent.at(-1)).toBe('quit');
    expect(FakeWorker.last.terminated).toBe(true);
  });

  it('un error del Worker rechaza el comando pendiente con el mensaje real', async () => {
    FakeWorker.reply = () => [];
    const e = new BrowserEngine('/engine/falta.js');
    const init = e.init();
    const assertion = expect(init).rejects.toThrow('No se pudo iniciar Stockfish: El motor de análisis falló: 404 al cargar el script');
    FakeWorker.last.onerror?.({ message: '404 al cargar el script' });
    await assertion;
    expect(FakeWorker.last.terminated).toBe(true);
  });

  it('un error del Worker durante un análisis lo rechaza al instante', async () => {
    FakeWorker.reply = (c) => (c.startsWith('go depth') ? [] : protocol(c));
    const e = new BrowserEngine();
    await e.init();
    const p = e.analyze(START);
    const assertion = expect(p).rejects.toThrow('El motor de análisis falló: wasm roto');
    await new Promise((r) => setTimeout(r, 0));
    FakeWorker.last.onerror?.({ message: 'wasm roto' });
    await assertion;
  });

  it('si el motor no responde al arrancar, init falla por tiempo agotado y cierra el Worker', async () => {
    vi.useFakeTimers();
    FakeWorker.reply = () => [];
    const e = new BrowserEngine();
    const init = e.init();
    const assertion = expect(init).rejects.toThrow(
      'No se pudo iniciar Stockfish: Tiempo de espera agotado esperando respuesta del motor a "uci".',
    );
    await vi.advanceTimersByTimeAsync(30000);
    await assertion;
    expect(FakeWorker.last.terminated).toBe(true);
  });
});
