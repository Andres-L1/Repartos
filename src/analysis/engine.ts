import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Score } from '../types.js';
import type { EngineLike, EngineResult } from './engine-like.js';

export type { EngineResult } from './engine-like.js';

/** Tamaño fijo de la tabla hash (MB); parte del contrato de determinismo. */
export const HASH_MB = 32;

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
  private listeners: ((line: string) => void)[] = [];
  private busy = false;

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
        if (line) for (const l of [...this.listeners]) l(line);
      }
    });
    proc.stderr.on('data', () => {});
    proc.on('error', () => {});
    proc.stdin.on('error', () => {});
    try {
      await this.command('uci', (l) => l === 'uciok', 30000);
      // Determinismo: un hilo, hash de tamaño fijo y búsqueda por profundidad (nunca por tiempo).
      this.send('setoption name Threads value 1');
      this.send(`setoption name Hash value ${HASH_MB}`);
      await this.command('isready', (l) => l === 'readyok', 30000);
    } catch (e) {
      await this.close();
      throw new Error(`No se pudo iniciar Stockfish: ${(e as Error).message}`);
    }
  }

  private send(cmd: string): void {
    if (!this.proc) throw new Error('El motor no está iniciado (llama a init()).');
    this.proc.stdin.write(cmd + '\n');
  }

  private command(cmd: string, done: (line: string) => boolean, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.listeners = this.listeners.filter((l) => l !== listener);
        reject(new Error(`Tiempo de espera agotado esperando respuesta del motor a "${cmd}".`));
      }, timeoutMs);
      const listener = (line: string) => {
        if (done(line)) {
          clearTimeout(timer);
          this.listeners = this.listeners.filter((l) => l !== listener);
          resolve();
        }
      };
      this.listeners.push(listener);
      this.send(cmd);
    });
  }

  /** Analiza una posición a profundidad fija. La evaluación se devuelve desde el punto de vista de blancas. */
  async analyze(fen: string, opts: { depth?: number } = {}): Promise<EngineResult> {
    if (!this.proc) throw new Error('El motor no está iniciado (llama a init()).');
    if (this.busy) throw new Error('El motor ya está analizando otra posición.');
    this.busy = true;
    const depth = opts.depth ?? 12;
    const whiteToMove = (fen.split(' ')[1] ?? 'w') === 'w';
    let score: Score = { cp: 0 };
    let pv: string[] = [];
    let bestUci = '';
    try {
      // Determinismo: cada posición se analiza con tablas hash limpias, de modo que el resultado
      // no dependa de las posiciones analizadas antes (Threads=1 + Hash fijo + 'go depth', sin tiempo).
      this.send('ucinewgame');
      await this.command('isready', (l) => l === 'readyok', 30000);
      this.send(`position fen ${fen}`);
      await this.command(
        `go depth ${depth}`,
        (line) => {
          if (line.startsWith('info ') && !/\b(lowerbound|upperbound)\b/.test(line)) {
            const m = line.match(/\bscore (cp|mate) (-?\d+)/);
            if (m) {
              const v = Number(m[2]) * (whiteToMove ? 1 : -1);
              score = m[1] === 'cp' ? { cp: v } : { mate: v };
              const p = line.match(/\spv\s+(.+)$/);
              if (p) pv = p[1]!.trim().split(/\s+/);
            }
          } else if (line.startsWith('bestmove')) {
            bestUci = line.split(/\s+/)[1] ?? '';
            return true;
          }
          return false;
        },
        120000,
      );
    } finally {
      this.busy = false;
    }
    if (bestUci === '(none)') bestUci = '';
    if (!pv.length && bestUci) pv = [bestUci];
    return { score, bestUci, pv };
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
    this.listeners = [];
  }
}
