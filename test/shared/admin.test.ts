import { describe, it, expect } from 'vitest';
import { isAdmin } from '../../src/shared/admin.js';

describe('isAdmin', () => {
  it('reconoce la cuenta de administración sin importar mayúsculas', () => {
    expect(isAdmin('andresli')).toBe(true);
    expect(isAdmin('AndresLi')).toBe(true);
  });
  it('no confunde cuentas parecidas, con espacios ni vacías', () => {
    for (const id of ['andresli2', 'xandresli', 'andres', ' andresli', 'andresli ', 'andresli\n', '']) expect(isAdmin(id), JSON.stringify(id)).toBe(false);
  });
});
