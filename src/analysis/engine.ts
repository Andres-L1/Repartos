import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { EngineLike, EngineResult } from './engine-like.js';
import { HASH_MB, UciSession } from './uci.js';

export type { EngineResult } from './engine-like.js';

export { HASH_MB };

const require_ = createRequire(import.meta.url);

function enginePath(): string {
  // El paquete no tiene un `main` utilizable: localizamos package.json y de ahí el build SIMD.
  const pkg = require_.resolve('stockfish/package.json');
  return join(dirname(pkg), 'src', 'stockfish-nnue-16.js');
}

/**
 * Envoltorio de Stockfish 16 (WASM) ejecutado en un proceso hijo de Node, hablando UCI por stdin/stdout.
 * El proceso hijo se cierra limpiamente con `quit` (y se mata si no responde).
 */
export class Engine implements EngineLike {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private buffer = '';
  private readonly session = new UciSession({
    send: (cmd) => {
      if (!this.proc) throw new Error('El motor no está iniciado (llama a init()).');
      this.proc.stdin.write(cmd + '\n');
    },
  });

  async init(): Promise<void> {
    if (this.proc) return;
    const proc = spawn(process.execPath, [enginePath()], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    this.proc = proc;
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (chunk: string) => {
      this.buffer += chunk;
      let idx: number;
      while ((idx = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        if (line) this.session.onLine(line);
      }
    });
    proc.stderr.on('data', () => {});
    proc.on('error', () => {});
    proc.stdin.on('error', () => {});
    try {
      await this.session.init();
    } catch (e) {
      await this.close();
      throw new Error(`No se pudo iniciar Stockfish: ${(e as Error).message}`);
    }
  }

  /** Analiza una posición a profundidad fija. La evaluación se devuelve desde el punto de vista de blancas. */
  async analyze(fen: string, opts: { depth?: number } = {}): Promise<EngineResult> {
    if (!this.proc) throw new Error('El motor no está iniciado (llama a init()).');
    return this.session.analyze(fen, opts);
  }

  async close(): Promise<void> {
    const proc = this.proc;
    if (!proc) return;
    this.proc = null;
    await new Promise<void>((resolve) => {
      let finished = false;
      const end = () => {
        if (finished) return;
        finished = true;
        clearTimeout(kill);
        resolve();
      };
      const kill = setTimeout(() => {
        proc.kill();
        setTimeout(end, 500);
      }, 2000);
      proc.once('exit', end);
      try {
        proc.stdin.write('quit\n');
        proc.stdin.end();
      } catch {
        proc.kill();
      }
    });
  }
}
