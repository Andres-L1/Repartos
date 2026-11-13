import { defineConfig } from 'vitest/config';

// Los tests de contenido recorren búsquedas de ajedrez y tardan más de 5 s si la máquina va cargada
// (servidores de desarrollo, navegador...). Un margen mayor evita fallos falsos sin ocultar los reales.
export default defineConfig({
  test: { testTimeout: 30_000 },
});
