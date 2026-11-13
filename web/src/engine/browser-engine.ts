import type { EngineLike, EngineResult } from '../../../src/analysis/engine-like';
import { UciSession } from '../../../src/analysis/uci';

/**
 * Stockfish 16 (WASM, un solo hilo) dentro de un Web Worker. El propio script de stockfish.js es el
 * Worker: recibe los comandos UCI como cadenas y devuelve cada línea como un mensaje de texto.
 * Sin SharedArrayBuffer, de modo que no hacen falta cabeceras COOP/COEP.
 */
export class BrowserEngine implements EngineLike {
  private worker: Worker | null = null;
  private session: UciSession | null = null;
  private starting: Promise<void> | null = null;

  constructor(private readonly workerUrl = '/engine/stockfish-nnue-16-single.js') {}

  init(): Promise<void> {
    if (this.worker) return this.starting ?? Promise.resolve();
    const worker = new Worker(this.workerUrl);
    const session = new UciSession({ send: (cmd) => worker.postMessage(cmd) });
    worker.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data !== 'string') return;
      const line = ev.data.trim();
      if (line) session.onLine(line);
    };
    worker.onerror = (ev: ErrorEvent) => {
      const detail = ev.message ? `: ${ev.message}` : '';
      session.abort(new Error(`El motor de análisis falló${detail}`));
    };
    worker.onmessageerror = () => {
      session.abort(new Error('El motor de análisis envió un mensaje ilegible.'));
    };
    this.worker = worker;
    this.session = session;
    this.starting = (async () => {
      try {
        await session.init();
      } catch (e) {
        await this.close();
        throw new Error(`No se pudo iniciar Stockfish: ${(e as Error).message}`);
      }
    })();
    return this.starting;
  }

  async analyze(fen: string, opts: { depth?: number } = {}): Promise<EngineResult> {
    if (!this.session) throw new Error('El motor no está iniciado (llama a init()).');
    return this.session.analyze(fen, opts);
  }

  async close(): Promise<void> {
    const worker = this.worker;
    if (!worker) return;
    const session = this.session;
    this.worker = null;
    this.session = null;
    this.starting = null;
    try {
      session?.quit();
    } catch {
      // el Worker ya no responde: se termina igualmente
    }
    session?.abort(new Error('El motor se cerró antes de terminar el análisis.'));
    worker.terminate();
  }
}
