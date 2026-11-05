import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
// Solo configuración inicial. No se imprime ni escribe la clave en archivos.
const child = spawn(process.execPath, ['scripts/wrangler.mjs', 'secret', 'put', 'SESSION_SECRET'], {
  stdio: ['pipe', 'inherit', 'inherit'],
});
child.stdin.end(randomBytes(32).toString('base64url'));
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
child.on('error', () => {
  console.error('No se ha podido configurar la sesión.');
  process.exitCode = 1;
});
