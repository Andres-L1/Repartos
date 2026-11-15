/**
 * Stockfish 16 (WASM del paquete `stockfish`) con MultiPV para verificar contenido bajo demanda.
 * Solo para scripts de verificación (scripts/verify-*.mts); no se usa en la app ni en los tests.
 */
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

export interface Line {
  uci: string;
  /** Centipeones desde el bando que mueve; un mate vale ±(100000 - 100 * jugadas). */
  score: number;
  /** Jugadas hasta el mate (positivo: da mate quien mueve), o null. */
  mate: number | null;
  /** Variante principal (UCI). */
  pv: string[];
}

const MATE = 100000;
const toScore = (cp: number | null, mate: number | null) => (mate !== null ? Math.sign(mate) * (MATE - 100 * Math.abs(mate)) : cp!);

export class Stockfish {
  private proc: ChildProcessWithoutNullStreams;
  private buf = '';
  private listener: ((l: string) => void) | null = null;

  constructor() {
    const pkg = createRequire(import.meta.url).resolve('stockfish/package.json');
    this.proc = spawn(process.execPath, [join(dirname(pkg), 'src', 'stockfish-nnue-16.js')], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    this.proc.stdout.setEncoding('utf8');
    this.proc.stdout.on('data', (c: string) => {
      this.buf += c;
      let i: number;
      while ((i = this.buf.indexOf('\n')) >= 0) {
        const l = this.buf.slice(0, i).trim();
        this.buf = this.buf.slice(i + 1);
        if (l) this.listener?.(l);
      }
    });
  }

  private until(cmd: string, done: (l: string) => boolean, onLine?: (l: string) => void): Promise<void> {
    return new Promise((resolve) => {
      this.listener = (l) => {
        onLine?.(l);
        if (done(l)) resolve();
      };
      this.proc.stdin.write(cmd + '\n');
    });
  }

  async init(): Promise<void> {
    await this.until('uci', (l) => l === 'uciok');
    this.proc.stdin.write('setoption name Threads value 1\nsetoption name Hash value 64\n');
    await this.until('isready', (l) => l === 'readyok');
  }

  /** Mejores `n` jugadas a profundidad fija (o solo las de `moves`, si se da). */
  async multipv(fen: string, depth: number, n: number, moves?: string[]): Promise<Line[]> {
    this.proc.stdin.write(`setoption name MultiPV value ${n}\nucinewgame\nposition fen ${fen}\n`);
    await this.until('isready', (l) => l === 'readyok');
    const lines = new Map<number, Line>();
    const re = /depth (\d+) .*multipv (\d+) score (cp|mate) (-?\d+).* pv (.+)$/;
    await this.until(
      `go depth ${depth}${moves?.length ? ' searchmoves ' + moves.join(' ') : ''}`,
      (l) => l.startsWith('bestmove'),
      (l) => {
        const m = re.exec(l);
        if (!m || l.includes('bound')) return;
        const cp = m[3] === 'cp' ? Number(m[4]) : null;
        const mate = m[3] === 'mate' ? Number(m[4]) : null;
        // se queda con la línea más profunda de cada multipv (con un mate, el motor puede no llegar a `depth`)
        const pv = m[5]!.split(' ');
        lines.set(Number(m[2]), { uci: pv[0]!, score: toScore(cp, mate), mate, pv });
      },
    );
    return [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v).sort((a, b) => b.score - a.score);
  }

  quit(): void {
    this.proc.stdin.write('quit\n');
  }
}
