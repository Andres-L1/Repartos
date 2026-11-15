import { configDefaults, defineConfig } from 'vitest/config';

// Los tests de contenido recorren búsquedas de ajedrez y tardan más de 5 s si la máquina va cargada
// (servidores de desarrollo, navegador...). Un margen mayor evita fallos falsos sin ocultar los reales.
// .claude/ guarda copias de trabajo de otros agentes: sus tests no son los del proyecto.
export default defineConfig({
  test: { testTimeout: 30_000, exclude: [...configDefaults.exclude, '.claude/**'] },
});
