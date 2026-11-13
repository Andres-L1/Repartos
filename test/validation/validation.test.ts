import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';
import { normalizeMove } from 'chessops/chess';
import { parseSquare, parseUci } from 'chessops/util';
import { beforeAll, describe, expect, it } from 'vitest';
import { trainFromPgn } from '../../src/pipeline.js';
import type { TrainingItem } from '../../src/types.js';

const DIR = join(import.meta.dirname, '..', '..', 'samples');
const files = readdirSync(DIR)
  .filter((f) => /^v\d+_.*\.pgn$/.test(f))
  .sort();
const CLEAN = ['v01_limpia.pgn', 'v10_limpia_qgd.pgn'];

const ROLE_ES: Record<string, string> = {
  peón: 'pawn',
  caballo: 'knight',
  alfil: 'bishop',
  torre: 'rook',
  dama: 'queen',
  rey: 'king',
};

const results = new Map<string, TrainingItem[]>();
const failures = new Map<string, string>();

function load(fen: string): Chess {
  return Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
}

/** Posiciones alcanzables reproduciendo pv (desde fenBefore) y pvAfter (desde fenAfter). */
function positionsOf(item: TrainingItem): Chess[] {
  const out: Chess[] = [];
  const walk = (fen: string, line: string[]) => {
    let pos = load(fen);
    out.push(pos);
    for (const u of line.slice(0, 12)) {
      const m = parseUci(u);
      if (!m) break;
      const mv = normalizeMove(pos, m);
      if (!pos.isLegal(mv)) break;
      pos = pos.clone();
      pos.play(mv);
      out.push(pos);
    }
  };
  walk(item.move.fenBefore, []);
  walk(item.move.fenAfter, item.move.pvAfter);
  return out;
}

beforeAll(async () => {
  for (const f of files) {
    try {
      results.set(f, await trainFromPgn(readFileSync(join(DIR, f), 'utf8'), { depth: 10 }));
    } catch (e) {
      failures.set(f, e instanceof Error ? e.message : String(e));
    }
  }
  const dump = Object.fromEntries(
    [...results].map(([f, items]) => [
      f,
      items.map((i) => ({
        ply: i.move.ply,
        san: i.move.san,
        cls: i.move.classification,
        cpLoss: i.move.cpLoss,
        best: i.move.bestSan,
        type: i.diagnosis?.type ?? null,
        fact: i.diagnosis?.fact ?? null,
        verified: i.explanation.verified,
      })),
    ]),
  );
  writeFileSync(join(import.meta.dirname, 'last-run.json'), JSON.stringify(dump, null, 1));
}, 600_000);

describe('validación Fase 1 sobre samples/v*.pgn', () => {
  it('hay al menos 8 partidas de validación', () => {
    expect(files.length).toBeGreaterThanOrEqual(8);
  });

  it('(a) ninguna partida lanza excepción', () => {
    expect([...failures]).toEqual([]);
    expect(results.size).toBe(files.length);
  });

  it('(b) toda explicación verificada tiene un diagnóstico coherente con el tablero', () => {
    for (const [f, items] of results) {
      for (const it of items) {
        if (!it.explanation.verified) continue;
        const where = `${f} ply ${it.move.ply} ${it.move.san}`;
        const d = it.diagnosis;
        expect(d, where).not.toBeNull();
        if (!d) continue;
        expect(d.ply, where).toBe(it.move.ply);
        expect(d.color, where).toBe(it.move.color);
        const positions = positionsOf(it);

        // Casillas de evidencia válidas y casillas citadas en el hecho: existen.
        for (const s of d.evidence.squares) expect(parseSquare(s), `${where} evidence ${s}`).toBeDefined();
        const cited = d.fact.match(/\b[a-h][1-8]\b/g) ?? [];
        for (const s of cited) expect(parseSquare(s), `${where} fact ${s}`).toBeDefined();
        // Las casillas del hecho están en la evidencia o en alguna jugada citada (SAN) de las líneas.
        for (const s of cited) {
          const known = d.evidence.squares.includes(s) || it.move.uci.includes(s) || (d.evidence.refutationUci ?? '').includes(s) || it.move.pv.some((u) => u.includes(s)) || it.move.pvAfter.some((u) => u.includes(s));
          expect(known, `${where}: casilla ${s} del hecho no está en evidencia ni en las líneas: ${d.fact}`).toBe(true);
        }
        // "<pieza> en <casilla>": esa pieza estuvo ahí en fenBefore/fenAfter o en la línea reproducida.
        const re = /(peón|caballo|alfil|torre|dama|rey) en ([a-h][1-8])/g;
        for (const m of d.fact.matchAll(re)) {
          const role = ROLE_ES[m[1]!]!;
          const sq = parseSquare(m[2]!)!;
          const ok = positions.some((p) => p.board.getRole(sq) === role);
          expect(ok, `${where}: no hay ${m[1]} en ${m[2]} en ninguna posición de la línea. Hecho: ${d.fact}`).toBe(true);
        }
        // Piezas de evidencia: cada rol listado existe en el tablero.
        for (const p of d.evidence.pieces) expect(Object.values(ROLE_ES), where).toContain(p);
        // La refutación debe ser legal en fenAfter (o fenBefore si es una captura de la propia jugada).
        if (d.evidence.refutationUci) {
          const u = parseUci(d.evidence.refutationUci);
          expect(u, where).toBeDefined();
          const legalSomewhere = positions.some((p) => {
            const m = parseUci(d.evidence.refutationUci!);
            return !!m && p.isLegal(normalizeMove(p, m));
          });
          expect(legalSomewhere, `${where}: refutación ${d.evidence.refutationUci} ilegal`).toBe(true);
        }
        // Si hay pérdida material declarada, es no negativa.
        if (d.evidence.materialLostCp !== undefined) expect(d.evidence.materialLostCp, where).toBeGreaterThanOrEqual(0);
        // La explicación usa un concepto del diagnóstico.
        expect(d.conceptIds, where).toContain(it.explanation.conceptId);
      }
    }
  });

  it('(c) sin diagnóstico no se afirman causas', () => {
    const CAUSE = /clavad|horquilla|ataque doble|sin defensa|colgad|indefens|intercambio|cambio desfavorable|amenaza de mate|doble ataque/i;
    for (const [f, items] of results) {
      for (const it of items) {
        if (it.diagnosis !== null) continue;
        const where = `${f} ply ${it.move.ply} ${it.move.san}`;
        expect(it.explanation.verified, where).toBe(false);
        expect(it.explanation.conceptId, where).toBe('engine.analysis');
        expect(it.explanation.text, where).not.toMatch(CAUSE);
        expect(it.exercises, where).toEqual([]);
      }
    }
  });

  it('(d) las partidas limpias no producen diagnósticos', () => {
    for (const f of CLEAN) {
      const items = results.get(f);
      expect(items, f).toBeDefined();
      const diag = (items ?? []).filter((i) => i.diagnosis !== null).map((i) => `${i.move.ply} ${i.move.san}: ${i.diagnosis!.fact}`);
      expect(diag, f).toEqual([]);
    }
  });

  it('las partidas con error deliberado producen al menos un error del motor', () => {
    for (const f of files) {
      if (CLEAN.includes(f)) continue;
      const items = results.get(f) ?? [];
      expect(items.some((i) => i.move.classification === 'blunder' || i.move.classification === 'mistake'), f).toBe(true);
    }
  });
});
