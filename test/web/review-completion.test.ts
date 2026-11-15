import { describe, it, expect, vi } from 'vitest';

// api.ts lee window al cargarse; solo hace falta el módulo de tipos/clases, no la red.
vi.stubGlobal('window', { location: { search: '' } });
vi.stubGlobal('sessionStorage', { getItem: () => null, setItem: () => undefined });
const { createReviewReporter } = await import('../../web/src/review/completion.js');
const { ApiError } = await import('../../web/src/api.js');

function memory() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    m,
  };
}
const flushAll = () => new Promise((r) => setTimeout(r, 0));

describe('avisos de partidas repasadas', () => {
  it('envía con la cuenta activa y vacía la lista', async () => {
    const send = vi.fn(async () => ({ counted: true }));
    const r = createReviewReporter({ send, storage: memory(), setTimer: () => 0 });
    r.setUser('ana');
    r.report('abcd1234', ['fork']);
    await flushAll();
    expect(send).toHaveBeenCalledWith({ gameId: 'abcd1234', concepts: ['fork'] });
    expect(r.pendingCount()).toBe(0);
  });

  it('un aviso pendiente de otra cuenta no se envía con la sesión de quien entra después', async () => {
    const store = memory();
    const fail = vi.fn(async () => {
      throw new ApiError(0, 'sin red');
    });
    const a = createReviewReporter({ send: fail, storage: store, setTimer: () => 0 });
    a.setUser('ana');
    a.report('abcd1234', ['fork']);
    await flushAll();
    expect(a.pendingCount()).toBe(1);

    // Recarga en el mismo navegador: entra otra persona.
    const send = vi.fn(async () => ({ counted: true }));
    const b = createReviewReporter({ send, storage: store, setTimer: () => 0 });
    b.setUser('beto');
    await flushAll();
    expect(send).not.toHaveBeenCalled();
    // Y cuando vuelve la dueña, sí se entrega.
    b.setUser('ana');
    await flushAll();
    expect(send).toHaveBeenCalledTimes(1);
    expect(b.pendingCount()).toBe(0);
  });

  it('un rechazo definitivo (400) se descarta; un fallo de red se conserva y reintenta', async () => {
    const timers: (() => void)[] = [];
    const send = vi
      .fn<(b: unknown) => Promise<{ counted: boolean }>>()
      .mockRejectedValueOnce(new ApiError(400, 'gameId no válido'))
      .mockRejectedValueOnce(new ApiError(0, 'sin red'));
    const r = createReviewReporter({ send, storage: memory(), setTimer: (f) => timers.push(f) }) ;
    r.setUser('ana');
    r.report('aaaaaaaa', []);
    await flushAll();
    expect(r.pendingCount()).toBe(0);
    r.report('bbbbbbbb', []);
    await flushAll();
    expect(r.pendingCount()).toBe(1);
    expect(timers).toHaveLength(1);
    send.mockResolvedValue({ counted: true });
    timers[0]!();
    await flushAll();
    expect(r.pendingCount()).toBe(0);
  });
});
