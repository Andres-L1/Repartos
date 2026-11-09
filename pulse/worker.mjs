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
      return new Response(
        (await env.ASSETS.fetch(new Request(new URL('/legal-content.txt', url.origin), request)))
          .body,
        { headers: { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS } },
      );
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
    if (
      response.ok &&
      request.method === 'GET' &&
      parseRoute(url.pathname) &&
      response.headers.get('Content-Type')?.includes('text/html')
    ) {
      const meta = {
        '/': [
          'Chedex Pulse · El ajedrez mundial',
          'Noticias, retransmisiones y datos del ajedrez mundial con fuentes visibles.',
        ],
        '/panel': [
          'Panel de actualidad · Chedex Pulse',
          'Consulta noticias, retransmisiones y cambios destacados del ajedrez.',
        ],
        '/mundo': [
          'Mapa mundial de ajedrez · Chedex Pulse',
          'Explora países, federaciones y retransmisiones en el mapa.',
        ],
        '/tendencias': [
          'Tendencias de ajedrez · Chedex Pulse',
          'Explora la evolución del Elo, federaciones y visitas en Wikipedia.',
        ],
        '/indices': [
          'Índices de ajedrez · Chedex Pulse',
          'Compara progresión de Elo, interés en Wikipedia y censo FIDE.',
        ],
        '/fuentes': [
          'Fuentes y metodología · Chedex Pulse',
          'Consulta las fuentes, la cobertura y las metodologías de Chedex Pulse.',
        ],
      };
      const page =
        meta[url.pathname] ||
        (url.pathname.startsWith('/indices/')
          ? meta['/indices']
          : url.pathname.startsWith('/mundo/')
            ? meta['/mundo']
            : url.pathname.startsWith('/jugador/')
              ? [
                  'Jugador FIDE · Chedex Pulse',
                  'Consulta la ficha y los datos disponibles del jugador.',
                ]
              : [
                  'Competición de ajedrez · Chedex Pulse',
                  'Consulta la retransmisión y las fuentes de la competición.',
                ]);
      const html = (await response.text())
        .replace(
          /<title>[^<]*<\/title>/,
          `<title>${page[0]}</title><link rel="canonical" href="https://chedexpulse.app${url.pathname}"><link rel="sitemap" type="application/xml" href="/sitemap.xml">`,
        )
        .replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
          `<meta name="description" content="${page[1]}">`,
        );
      const headers = new Headers(response.headers);
      headers.delete('Content-Length');
      headers.delete('ETag');
      response = new Response(html, { status: response.status, headers });
    }
    response = new Response(response.body, response);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);
    return response;
  },
};
