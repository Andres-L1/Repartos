// Proceso UCI por stdin/stdout para el build de un hilo de Stockfish 16 (el de la web).
// Su modo CLI de Node no funciona (usa postMessage, que en el build de un hilo no llega al motor),
// así que lo cargamos como módulo y le pasamos los comandos con onCustomMessage, como hace su Worker.
// Uso: node stockfish-proc.cjs <ruta a stockfish-nnue-16-single.js>
const path = require('node:path');
const readline = require('node:readline');

const js = path.resolve(process.argv[2]);
const wasm = js.replace(/\.js$/, '.wasm');
const queue = [];
let engine = null;

readline.createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line) return;
  if (line === 'quit') process.exit(0);
  if (engine) engine.onCustomMessage(line);
  else queue.push(line);
}).on('close', () => process.exit(0));

require(js)()({ locateFile: (f) => (f.includes('.wasm') ? wasm : js) }).then((sf) => {
  engine = sf;
  sf.addMessageListener((l) => process.stdout.write(l + '\n'));
  for (const l of queue.splice(0)) sf.onCustomMessage(l);
});
