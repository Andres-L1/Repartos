/** POST /api/explain: explicación breve con IA a petición. El cliente solo señala qué explicar; los hechos salen del servidor. */
import type { Hono } from 'hono';
import type { AppContext } from '../context.js';
import { HttpError, isInt, readJson, requireOwnOrigin, type Env } from '../http.js';
import { cacheKey, explain } from '../ai.js';
import { errorFacts, lessonFacts } from '../ai-facts.js';
import { findLesson } from '../progress.js';

const exact = (b: Record<string, unknown>, keys: string[]) => Object.keys(b).length === keys.length && keys.every((k) => k in b);
const reply = (c: { json(b: unknown, s: 429 | 503): Response }, status: 429 | 503, code: string, error: string) => c.json({ error, code }, status);

export function registerExplainRoutes(app: Hono<Env>, k: AppContext): void {
  const { db, content, now, requireAuth, deps, ai } = k;

  app.post('/api/explain', requireAuth, async (c) => {
    requireOwnOrigin(c, deps);
    if (!ai.on) return reply(c, 503, 'ai_off', 'Las explicaciones no están disponibles ahora.');
    const b = await readJson(c);
    let facts: string[] | null;
    let id: string[];
    let method = ''; // texto del método que el alumno ya vio (solo lecciones: el de la mini lección se genera en el navegador y no se acepta como texto libre)
    if (b.kind === 'lesson' && exact(b, ['kind', 'lessonId', 'stepKind', 'stepIndex'])) {
      const { lessonId, stepKind, stepIndex } = b;
      const lesson = typeof lessonId === 'string' ? findLesson(content, lessonId) : undefined;
      if (!lesson || (stepKind !== 'practice' && stepKind !== 'evaluation') || !isInt(stepIndex)) throw new HttpError(400, 'Petición no válida');
      const step = lesson[stepKind][stepIndex];
      if (!step) throw new HttpError(400, 'Petición no válida');
      facts = lessonFacts(step, lesson.objective);
      id = ['lesson', lesson.id, stepKind, String(stepIndex)];
      method = step.explanationCorrect;
    } else if (b.kind === 'error' && exact(b, ['kind', 'fen', 'played', 'best'])) {
      const { fen, played, best } = b;
      if (typeof fen !== 'string' || typeof played !== 'string' || typeof best !== 'string' || played === best) throw new HttpError(400, 'Petición no válida');
      facts = errorFacts(fen, played, best);
      id = ['error', fen.split(' ').slice(0, 4).join(' '), played, best];
    } else throw new HttpError(400, 'Petición no válida');
    if (!facts) throw new HttpError(400, 'Posición o jugadas no válidas');

    const user = facts.join('\n');
    const out = await explain(db, ai, { userId: c.get('user').id, nowMs: now().getTime(), key: await cacheKey([...id, user]), user, method });
    if (out.kind === 'ok') return c.json({ text: out.text, cached: out.cached });
    if (out.kind === 'user_limit' || out.kind === 'global_limit')
      return reply(c, 429, out.kind, 'Hoy ya no hay más explicaciones, vuelve mañana.');
    // Presupuesto mensual agotado o fallo del proveedor: el alumno solo ve un mensaje neutro (nunca presupuesto ni cifras).
    return reply(c, 503, out.kind === 'budget' ? 'ai_budget' : 'ai_unavailable', 'Las explicaciones no están disponibles ahora.');
  });
}
