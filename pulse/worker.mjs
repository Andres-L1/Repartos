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
    response = new Response(response.body, response);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);
    return response;
  },
};
