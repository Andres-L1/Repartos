import { getSession } from '../auth.mjs';
import { json } from './http.mjs';
export function validProfile(data) {
  const p = data?.preferences;
  return (
    Array.isArray(data?.favorites) &&
    data.favorites.length <= 100 &&
    data.favorites.every(
      (i) =>
        i &&
        typeof i.name === 'string' &&
        i.name.length > 0 &&
        i.name.length <= 200 &&
        ((i.type === 'player' && /^\d{1,12}$/.test(i.id)) ||
          (i.type === 'country' && /^[A-Z]{3,4}$/.test(i.id))),
    ) &&
    p &&
    ['', 'es', 'en'].includes(p.language) &&
    ['', 'FIDE', 'ChessBase', 'Lichess'].includes(p.publisher) &&
    ['all', 'live', 'upcoming', 'players', 'tournaments'].includes(p.mapFilter)
  );
}
export async function handleProfile(request, env) {
  if (new URL(request.url).pathname !== '/api/profile') return null;
  const session = await getSession(request, env);
  if (!session || !/^[a-zA-Z0-9_-]{1,30}$/.test(session.id))
    return json({ error: 'Inicia sesión para sincronizar.' }, 401);
  if (!env.PULSE_DB) return json({ error: 'Sincronización no disponible.' }, 503);
  if (!['GET', 'PUT', 'DELETE'].includes(request.method))
    return json({ error: 'Método no permitido.' }, 405);
  if (
    request.method !== 'GET' &&
    (request.headers.get('Origin') !== env.PUBLIC_ORIGIN ||
      new URL(request.url).origin !== env.PUBLIC_ORIGIN)
  )
    return json({ error: 'Origen no permitido.' }, 403);
  try {
    if (request.method === 'GET') {
      const row = await env.PULSE_DB.prepare('SELECT data, version FROM profiles WHERE user_id = ?')
        .bind(session.id)
        .first();
      return json(
        row ? { data: JSON.parse(row.data), version: row.version } : { data: null, version: 0 },
      );
    }
    if (request.method === 'DELETE') {
      await env.PULSE_DB.prepare('DELETE FROM profiles WHERE user_id = ?').bind(session.id).run();
      return json({ ok: true });
    }
    if (
      !(request.headers.get('Content-Type') || '').startsWith('application/json') ||
      Number(request.headers.get('Content-Length') || 0) > 32000
    )
      return json({ error: 'Solicitud no válida.' }, 400);
    const text = await request.text();
    if (text.length > 32000) return json({ error: 'Solicitud demasiado grande.' }, 413);
    const body = JSON.parse(text);
    if (!validProfile(body.data) || !Number.isSafeInteger(body.version) || body.version < 0)
      return json({ error: 'Datos no válidos.' }, 400);
    const clean = {
      favorites: body.data.favorites.map(({ type, id, name }) => ({ type, id, name })),
      preferences: {
        language: body.data.preferences.language,
        publisher: body.data.preferences.publisher,
        mapFilter: body.data.preferences.mapFilter,
      },
    };
    const result =
      body.version === 0
        ? await env.PULSE_DB.prepare(
            'INSERT OR IGNORE INTO profiles(user_id, data, version) VALUES (?, ?, 1)',
          )
            .bind(session.id, JSON.stringify(clean))
            .run()
        : await env.PULSE_DB.prepare(
            'UPDATE profiles SET data = ?, version = version + 1 WHERE user_id = ? AND version = ?',
          )
            .bind(JSON.stringify(clean), session.id, body.version)
            .run();
    if (!result.meta.changes)
      return json(
        { error: 'Los datos han cambiado en otro dispositivo. Recarga antes de guardar.' },
        409,
      );
    return json({ version: body.version + 1 });
  } catch {
    return json({ error: 'No se han podido sincronizar los datos.' }, 503);
  }
}
