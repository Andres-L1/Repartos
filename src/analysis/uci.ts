import type { Score } from '../types.js';
import type { EngineResult } from './engine-like.js';

/** Tamaño fijo de la tabla hash (MB); parte del contrato de determinismo. */
export const HASH_MB = 32;

/** Por dónde salen los comandos UCI: stdin de un proceso en Node, `postMessage` de un Worker en el navegador. */
export interface UciTransport {
  send(cmd: string): void;
}

/**
 * Protocolo UCI sin ninguna dependencia de plataforma. El transporte envía los comandos y quien lo
 * posee entrega cada línea recibida a `onLine`. La secuencia de comandos y el análisis de líneas son
 * el contrato de determinismo del motor: no cambiarlos sin revisar `test/validation`.
 */
export class UciSession {
  private listeners: ((line: string) => void)[] = [];
  private pending = new Set<{ fail: (err: Error) => void }>();
  private busy = false;

  constructor(private readonly transport: UciTransport) {}

  /** Una línea de salida del motor (sin salto de línea ni espacios sobrantes). */
  onLine(line: string): void {
    for (const l of [...this.listeners]) l(line);
  }

  async init(): Promise<void> {
    await this.command('uci', (l) => l === 'uciok', 30000);
    // Determinismo: un hilo, hash de tamaño fijo y búsqueda por profundidad (nunca por tiempo).
    this.transport.send('setoption name Threads value 1');
    this.transport.send(`setoption name Hash value ${HASH_MB}`);
    await this.command('isready', (l) => l === 'readyok', 30000);
  }

  private command(cmd: string, done: (line: string) => boolean, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const finish = () => {
        clearTimeout(timer);
        this.listeners = this.listeners.filter((l) => l !== listener);
        this.pending.delete(entry);
      };
      const timer = setTimeout(() => {
        finish();
        reject(new Error(`Tiempo de espera agotado esperando respuesta del motor a "${cmd}".`));
      }, timeoutMs);
      const listener = (line: string) => {
        if (done(line)) {
          finish();
          resolve();
        }
      };
      const entry = {
        fail: (err: Error) => {
          finish();
          reject(err);
        },
      };
      this.pending.add(entry);
      this.listeners.push(listener);
      try {
        this.transport.send(cmd);
      } catch (e) {
        finish();
        reject(e);
      }
    });
  }

  /** Rechaza ya todo comando en curso con `err` y libera sus temporizadores y oyentes. La sesión sigue usable. */
  abort(err: Error): void {
    for (const p of [...this.pending]) p.fail(err);
  }

  /** Analiza una posición a profundidad fija. La evaluación se devuelve desde el punto de vista de blancas. */
  async analyze(fen: string, opts: { depth?: number } = {}): Promise<EngineResult> {
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
      this.transport.send('ucinewgame');
      await this.command('isready', (l) => l === 'readyok', 30000);
      this.transport.send(`position fen ${fen}`);
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

  quit(): void {
    this.transport.send('quit');
  }
}
