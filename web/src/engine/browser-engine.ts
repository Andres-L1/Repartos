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

  constructor(private readonly workerUrl = '/engine/stockfish-nnue-16-single.js') {}

  async init(): Promise<void> {
    if (this.worker) return;
    const worker = new Worker(this.workerUrl);
    const session = new UciSession({ send: (cmd) => worker.postMessage(cmd) });
    worker.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data !== 'string') return;
      const line = ev.data.trim();
      if (line) session.onLine(line);
    };
    this.worker = worker;
    this.session = session;
    try {
      await session.init();
    } catch (e) {
      await this.close();
      throw new Error(`No se pudo iniciar Stockfish: ${(e as Error).message}`);
    }
  }

  async analyze(fen: string, opts: { depth?: number } = {}): Promise<EngineResult> {
    if (!this.session) throw new Error('El motor no está iniciado (llama a init()).');
    return this.session.analyze(fen, opts);
  }

  async close(): Promise<void> {
    const worker = this.worker;
    if (!worker) return;
    this.worker = null;
    try {
      this.session?.quit();
    } catch {
      // el Worker ya no responde: se termina igualmente
    }
    this.session = null;
    worker.terminate();
  }
}
