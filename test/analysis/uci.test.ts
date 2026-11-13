import { describe, expect, it, vi } from 'vitest';
import { UciSession } from '../../src/analysis/uci.js';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const BLACK = '4k3/8/8/8/8/8/5q2/4K3 b - - 0 1';

/** Transporte falso: guarda lo enviado y responde con las líneas que el test programe. */
function fake(reply: (cmd: string, session: () => UciSession) => string[] = () => []) {
  const sent: string[] = [];
  let session!: UciSession;
  const transport = {
    send(cmd: string) {
      sent.push(cmd);
      for (const l of reply(cmd, () => session)) queueMicrotask(() => session.onLine(l));
    },
  };
  session = new UciSession(transport);
  return { sent, session };
}

const protocol = (cmd: string): string[] =>
  cmd === 'uci' ? ['id name Fake', 'uciok'] : cmd === 'isready' ? ['readyok'] : [];

describe('UciSession', () => {
  it('init envía exactamente la secuencia UCI esperada', async () => {
    const { sent, session } = fake(protocol);
    await session.init();
    expect(sent).toEqual(['uci', 'setoption name Threads value 1', 'setoption name Hash value 32', 'isready']);
  });

  it('analyze envía ucinewgame, isready, position fen y go depth', async () => {
    const { sent, session } = fake((c) =>
      c.startsWith('go depth') ? ['info depth 12 score cp 20 pv e2e4 e7e5', 'bestmove e2e4 ponder e7e5'] : protocol(c),
    );
    await session.init();
    sent.length = 0;
    const r = await session.analyze(START, { depth: 12 });
    expect(sent).toEqual(['ucinewgame', 'isready', `position fen ${START}`, 'go depth 12']);
    expect(r).toEqual({ score: { cp: 20 }, bestUci: 'e2e4', pv: ['e2e4', 'e7e5'] });
  });

  it('devuelve la evaluación con signo de blancas cuando juegan negras', async () => {
    const { session } = fake((c) =>
      c.startsWith('go depth') ? ['info depth 12 score mate -3 pv f2f1', 'bestmove f2f1'] : protocol(c),
    );
    await session.init();
    const r = await session.analyze(BLACK, { depth: 12 });
    expect(r.score).toEqual({ mate: 3 });
  });

  it('bestmove (none) da bestUci vacío', async () => {
    const { session } = fake((c) => (c.startsWith('go depth') ? ['bestmove (none)'] : protocol(c)));
    await session.init();
    const r = await session.analyze(START);
    expect(r.bestUci).toBe('');
    expect(r.pv).toEqual([]);
  });

  it('un segundo analyze concurrente rechaza', async () => {
    const { session } = fake(protocol);
    await session.init();
    void session.analyze(START).catch(() => {});
    await expect(session.analyze(START)).rejects.toThrow('El motor ya está analizando otra posición.');
  });

  it('sin respuesta en el plazo rechaza con el mensaje de tiempo agotado', async () => {
    vi.useFakeTimers();
    try {
      const { session } = fake((c) => (c.startsWith('go depth') ? [] : protocol(c)));
      const ready = session.init();
      await vi.advanceTimersByTimeAsync(0);
      await ready;
      const p = session.analyze(START, { depth: 12 });
      const assertion = expect(p).rejects.toThrow('Tiempo de espera agotado esperando respuesta del motor a "go depth 12".');
      await vi.advanceTimersByTimeAsync(120000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('abort rechaza el comando en curso, limpia temporizadores y deja la sesión usable', async () => {
    vi.useFakeTimers();
    try {
      const { sent, session } = fake((c) => (c.startsWith('go depth') ? [] : protocol(c)));
      const ready = session.init();
      await vi.advanceTimersByTimeAsync(0);
      await ready;
      const p = session.analyze(START, { depth: 12 });
      const assertion = expect(p).rejects.toThrow('Motor caído');
      await vi.advanceTimersByTimeAsync(0);
      session.abort(new Error('Motor caído'));
      await assertion;
      expect(vi.getTimerCount()).toBe(0);
      expect((session as unknown as { listeners: unknown[] }).listeners).toHaveLength(0);
      // ya no está ocupada: un nuevo analyze envía comandos otra vez
      sent.length = 0;
      void session.analyze(START).catch(() => {});
      await vi.advanceTimersByTimeAsync(0);
      expect(sent[0]).toBe('ucinewgame');
    } finally {
      vi.useRealTimers();
    }
  });

  it('si el transporte lanza al enviar, rechaza y no deja temporizador ni oyente', async () => {
    vi.useFakeTimers();
    try {
      const session = new UciSession({
        send() {
          throw new Error('sin transporte');
        },
      });
      await expect(session.init()).rejects.toThrow('sin transporte');
      expect(vi.getTimerCount()).toBe(0);
      expect((session as unknown as { listeners: unknown[] }).listeners).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('quit envía quit', async () => {
    const { sent, session } = fake(protocol);
    session.quit();
    expect(sent).toEqual(['quit']);
  });
});
