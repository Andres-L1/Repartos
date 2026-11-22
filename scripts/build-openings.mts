/**
 * Genera src/openings/openings.json a partir de lichess-org/chess-openings (a.tsv..e.tsv, dominio público / CC0).
 * Uso: npx tsx scripts/build-openings.mts   (necesita red; el JSON resultante se commitea, la app nunca descarga nada).
 * Cada línea se reproduce con chessops: si una jugada es ilegal, el script falla. Formato: [eco, nombre, "e4 e5 Nf3"].
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { Chess } from 'chessops/chess';
import { makeSan, parseSan } from 'chessops/san';

const BASE = 'https://raw.githubusercontent.com/lichess-org/chess-openings/master/';
const out: [string, string, string][] = [];

for (const v of 'abcde') {
  const res = await fetch(`${BASE}${v}.tsv`);
  if (!res.ok) throw new Error(`${v}.tsv: HTTP ${res.status}`);
  const rows = (await res.text()).split(/\r?\n/).filter(Boolean);
  if (rows.shift() !== 'eco\tname\tpgn') throw new Error(`${v}.tsv: cabecera inesperada`);
  for (const row of rows) {
    const [eco, name, pgn] = row.split('\t');
    if (!eco || !name || !pgn) throw new Error(`${v}.tsv: fila inválida: ${row}`);
    const pos = Chess.default();
    const sans: string[] = [];
    for (const tok of pgn.replace(/\d+\.(\.\.)?/g, ' ').split(/\s+/).filter(Boolean)) {
      const m = parseSan(pos, tok);
      if (!m) throw new Error(`${eco} ${name}: jugada ilegal «${tok}»`);
      sans.push(makeSan(pos, m)); // forma canónica (con + y #)
      pos.play(m);
    }
    out.push([eco, name, sans.join(' ')]);
  }
}
mkdirSync(new URL('../src/openings/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/openings/openings.json', import.meta.url), JSON.stringify(out));
console.log(`${out.length} líneas escritas`);
