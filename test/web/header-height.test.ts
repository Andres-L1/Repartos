import { describe, it, expect } from 'vitest';
import { coveredHeight, stepStartVisible } from '../../web/src/headerHeight';

describe('coveredHeight', () => {
  it('cuenta la cabecera fija a todo el ancho, redondeando hacia arriba', () => {
    expect(coveredHeight('sticky', 320, 66.4, 320)).toBe(67);
    expect(coveredHeight('fixed', 1280, 64, 1280)).toBe(64);
  });
  it('no cuenta la cabecera estática ni la barra lateral de escritorio', () => {
    expect(coveredHeight('static', 667, 67, 667)).toBe(0);
    expect(coveredHeight('sticky', 240, 800, 1280)).toBe(0);
  });
});

describe('stepStartVisible', () => {
  it('es falso si el inicio queda bajo la cabecera o demasiado abajo', () => {
    expect(stepStartVisible(-189, 67, 640, 64)).toBe(false);
    expect(stepStartVisible(60, 67, 640, 64)).toBe(false);
    expect(stepStartVisible(520, 67, 640, 64)).toBe(false);
  });
  it('es verdadero si queda entre la cabecera y la barra inferior', () => {
    expect(stepStartVisible(146, 67, 640, 64)).toBe(true);
    expect(stepStartVisible(0, 0, 640, 0)).toBe(true);
  });
});
