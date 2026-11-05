import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const excluded = new Set(['vendor', 'snapshots', 'fonts', 'geo']);
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    excluded.has(entry.name)
      ? []
      : entry.isDirectory()
        ? files(`${directory}/${entry.name}`)
        : /\.(?:js|mjs)$/.test(entry.name)
          ? [`${directory}/${entry.name}`]
          : [],
  );
}
const paths = [
  ...files('pulse'),
  ...['check', 'collect-analytics', 'configure-auth', 'vendor-assets', 'wrangler'].map(
    (name) => `scripts/${name}.mjs`,
  ),
];
for (const path of paths) execFileSync(process.execPath, ['--check', path], { stdio: 'inherit' });
console.log(`${paths.length} archivos de código comprobados.`);
