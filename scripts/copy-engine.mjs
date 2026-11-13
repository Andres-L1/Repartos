// Copia el build de un solo hilo de Stockfish 16 a web/public/engine/ (ignorado por git).
// Se ejecuta antes de `dev:web` y `build:web`. El .js carga el .wasm de su mismo directorio.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = createRequire(import.meta.url).resolve('stockfish/package.json');
const src = join(dirname(pkg), 'src');
const out = join(root, 'web', 'public', 'engine');

mkdirSync(out, { recursive: true });
for (const f of ['stockfish-nnue-16-single.js', 'stockfish-nnue-16-single.wasm']) {
  copyFileSync(join(src, f), join(out, f));
}
console.log(`Motor copiado a ${out}`);
