import { handleAuth } from './auth.mjs';
import { createPublicApi } from './server/public-api.mjs';
import { json, SECURITY_HEADERS } from './server/http.mjs';
import { parseRoute } from './public/lib/routes.js';
export { decodeXml, parseNews, normalizeBroadcasts } from './server/feeds.mjs';
const publicApi = createPublicApi();
export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (
      env.PUBLIC_ORIGIN &&
      url.origin !== env.PUBLIC_ORIGIN &&
      url.hostname.endsWith('.workers.dev') &&
      ['GET', 'HEAD'].includes(request.method) &&
      !url.pathname.startsWith('/api/') &&
      !url.pathname.startsWith('/auth/')
    ) {
      return Response.redirect(new URL(url.pathname + url.search, env.PUBLIC_ORIGIN), 301);
    }
    if (url.hostname === 'chedexpulse.app' && url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url.href, 301);
    }
    if (url.pathname === '/sitemap.xml') {
      const paths = [
        '/',
        '/panel',
        '/mundo',
        '/tendencias',
        '/indices',
        '/indices/performance',
        '/indices/trending',
        '/indices/global',
        '/fuentes',
        '/legal',
      ];
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>https://chedexpulse.app${path}</loc></url>`).join('')}</urlset>`,
        { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
      );
    }
    if (url.pathname === '/legal' && ['GET', 'HEAD'].includes(request.method))
      return env.ASSETS.fetch(new Request(new URL('/legal.html', url.origin), request));
    let response = await handleAuth(request, env);
    if (!response) {
      if (!['GET', 'HEAD'].includes(request.method))
        response = json({ error: 'Método no permitido' }, 405);
      else response = await publicApi(request, env, context);
      if (!response)
        response = url.pathname.startsWith('/api/')
          ? json({ error: 'Recurso no encontrado' }, 404)
          : await env.ASSETS.fetch(
              parseRoute(url.pathname) ? new Request(new URL('/', url.origin), request) : request,
            );
    }
    if (
      response.status === 404 &&
      !url.pathname.startsWith('/api/') &&
      ['GET', 'HEAD'].includes(request.method)
    ) {
      response = new Response(
        request.method === 'HEAD'
          ? null
          : '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Página no encontrada · Chedex Pulse</title><style>body{font-family:system-ui;background:#0b0c0e;color:#f3f3f0;padding:12vh 8vw}a{color:#f18b42}</style><h1>Página no encontrada.</h1><p>La dirección no está disponible.</p><a href="/panel">Volver al panel</a></html>',
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      );
    }
    response = new Response(response.body, response);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);
    return response;
  },
};
