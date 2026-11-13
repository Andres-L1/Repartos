import { describe, it, expect } from 'vitest';
import { isPlainClick, isPrivatePath, legacyRedirect, normalizePath } from '../../web/src/router.js';

describe('router: normalizePath', () => {
  it('quita query, hash y barra final', () => {
    expect(normalizePath('')).toBe('/');
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('/aprender/')).toBe('/aprender');
    expect(normalizePath('/aprender?x=1#y')).toBe('/aprender');
    expect(normalizePath('/leccion/u01.l01')).toBe('/leccion/u01.l01');
  });
});

describe('router: rutas privadas', () => {
  it('aprender, leccion, perfil, suscripcion y bienvenida son privadas', () => {
    for (const p of ['/aprender', '/leccion/u01.l01', '/perfil', '/suscripcion', '/bienvenida'])
      expect(isPrivatePath(p)).toBe(true);
    for (const p of ['/', '/demo', '/entrar', '/privacidad', '/nada', '/aprenderx', '/perfiles'])
      expect(isPrivatePath(p)).toBe(false);
  });
});

describe('router: redirección de URLs antiguas', () => {
  it('hash antiguo pasa a ruta limpia', () => {
    expect(legacyRedirect('/', '', '#/mapa')).toBe('/aprender');
    expect(legacyRedirect('/', '', '#/leccion/u01.l01')).toBe('/leccion/u01.l01');
    expect(legacyRedirect('/', '', '#/perfil')).toBe('/perfil');
    expect(legacyRedirect('/', '', '#/registro')).toBe('/entrar');
    expect(legacyRedirect('/', '', '#/')).toBe('/');
    expect(legacyRedirect('/', '', '#/demo/')).toBe('/demo');
  });
  it('conserva el query de la URL y el del hash', () => {
    expect(legacyRedirect('/', '?mock=1', '#/mapa')).toBe('/aprender?mock=1');
    expect(legacyRedirect('/', '?auth=failed', '#/entrar')).toBe('/entrar?auth=failed');
    expect(legacyRedirect('/', '', '#/mapa?mock=1')).toBe('/aprender?mock=1');
  });
  it('/mapa y /registro como ruta real se renombran', () => {
    expect(legacyRedirect('/mapa', '', '')).toBe('/aprender');
    expect(legacyRedirect('/mapa/', '?mock=1', '')).toBe('/aprender?mock=1');
    expect(legacyRedirect('/registro', '', '')).toBe('/entrar');
  });
  it('URLs ya limpias no se tocan; los hashes que no son rutas tampoco', () => {
    expect(legacyRedirect('/aprender', '', '')).toBeNull();
    expect(legacyRedirect('/', '?mock=1', '')).toBeNull();
    expect(legacyRedirect('/privacidad', '', '#seccion')).toBeNull();
    expect(legacyRedirect('/leccion/u01.l01', '', '')).toBeNull();
  });
  it('una ruta desconocida no se redirige (la app muestra el 404)', () => {
    expect(legacyRedirect('/nada', '', '')).toBeNull();
    expect(isPrivatePath(normalizePath('/nada'))).toBe(false);
  });
});

describe('router: clics de enlace', () => {
  const base = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };
  it('solo intercepta el clic simple', () => {
    expect(isPlainClick(base)).toBe(true);
    expect(isPlainClick(base, '_self')).toBe(true);
    expect(isPlainClick({ ...base, ctrlKey: true })).toBe(false);
    expect(isPlainClick({ ...base, metaKey: true })).toBe(false);
    expect(isPlainClick({ ...base, shiftKey: true })).toBe(false);
    expect(isPlainClick({ ...base, button: 1 })).toBe(false);
    expect(isPlainClick(base, '_blank')).toBe(false);
    expect(isPlainClick({ ...base, defaultPrevented: true })).toBe(false);
  });
});
