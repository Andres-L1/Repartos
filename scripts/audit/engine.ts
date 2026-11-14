/**
 * Stockfish 16 NNUE de un hilo (el mismo build que usa la web) en un proceso hijo de Node, con MultiPV.
 * Reutiliza UciSession para el saludo UCI y su contrato de determinismo (Threads=1, Hash fijo, `go depth`).
 */
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UciSession } from '../../src/analysis/uci.js';
import type { EngineLike, EngineResult } from '../../src/analysis/engine-like.js';

export interface PvLine {
  /** Puntuación desde el bando que mueve: cp, o mate en N (negativo = recibe mate). */
  cp?: number;
  mate?: number;
  pv: string[];
}

const FILE = 'stockfish-nnue-16-single.js';

function enginePath(): string {
  const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'web', 'public', 'engine', FILE);
  if (existsSync(web)) return web;
  return join(dirname(createRequire(import.meta.url).resolve('stockfish/package.json')), 'src', FILE);
}

export class AuditEngine implements EngineLike {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private buffer = '';
  private extra: ((line: string) => void) | null = null;
  private readonly session = new UciSession({ send: (cmd) => this.proc?.stdin.write(cmd + '\n') });

  async init(): Promise<void> {
    const bridge = join(dirname(fileURLToPath(import.meta.url)), 'stockfish-proc.cjs');
    const proc = spawn(process.execPath, [bridge, enginePath()], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    this.proc = proc;
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (chunk: string) => {
      this.buffer += chunk;
      let i: number;
      while ((i = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, i).trim();
        this.buffer = this.buffer.slice(i + 1);
        if (!line) continue;
        this.session.onLine(line);
        this.extra?.(line);
      }
    });
    proc.stderr.on('data', () => {});
    proc.stdin.on('error', () => {});
    await this.session.init();
  }

  /** EngineLike: mejor línea (MultiPV 1), evaluación desde blancas. */
  async analyze(fen: string, opts: { depth?: number } = {}): Promise<EngineResult> {
    this.proc!.stdin.write('setoption name MultiPV value 1\n');
    return this.session.analyze(fen, opts);
  }

  /**
   * Las `multipv` mejores líneas a profundidad fija, o solo las jugadas `searchmoves` si se indican.
   * Tablas hash limpias por posición (ucinewgame), como UciSession.analyze.
   */
  analyzeMulti(fen: string, depth: number, multipv: number, searchmoves: string[] = []): Promise<PvLine[]> {
    const send = (c: string) => this.proc!.stdin.write(c + '\n');
    const lines = new Map<number, PvLine>();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.extra = null;
        reject(new Error(`Tiempo agotado analizando ${fen}`));
      }, 300_000);
      let ready = false;
      this.extra = (line) => {
        if (!ready) {
          if (line !== 'readyok') return;
          ready = true;
          send(`setoption name MultiPV value ${multipv}`);
          send(`position fen ${fen}`);
          send(`go depth ${depth}${searchmoves.length ? ' searchmoves ' + searchmoves.join(' ') : ''}`);
          return;
        }
        if (line.startsWith('info ') && / depth \d+/.test(line) && !/\b(lowerbound|upperbound)\b/.test(line)) {
          const s = line.match(/\bscore (cp|mate) (-?\d+)/);
          const pv = line.match(/\spv\s+(.+)$/);
          if (!s || !pv) return;
          const k = Number(line.match(/\bmultipv (\d+)/)?.[1] ?? 1);
          const v = Number(s[2]);
          lines.set(k, { ...(s[1] === 'cp' ? { cp: v } : { mate: v }), pv: pv[1]!.trim().split(/\s+/) });
        } else if (line.startsWith('bestmove')) {
          clearTimeout(timer);
          this.extra = null;
          resolve([...lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]));
        }
      };
      send('ucinewgame');
      send('isready');
    });
  }

  async close(): Promise<void> {
    const p = this.proc;
    this.proc = null;
    if (!p) return;
    p.stdin.write('quit\n');
    p.stdin.end();
    setTimeout(() => p.kill(), 2000).unref();
  }
}
