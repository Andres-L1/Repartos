import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  server: {
    port: 5173,
    // Con `npm run dev` (wrangler en :8787) la web se sirve completa; este proxy es solo para `dev:web` (Vite) contra wrangler.
    proxy: { '/api': 'http://localhost:8787', '/auth': 'http://localhost:8787' },
  },
  build: {
    outDir: fileURLToPath(new URL('../dist/web', import.meta.url)),
    emptyOutDir: true,
  },
});
