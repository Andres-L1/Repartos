export default {
  fetch(request) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD' || url.pathname.startsWith('/api/')) return new Response('El servicio anterior ya no está disponible.', { status: 410, headers: { 'Cache-Control': 'no-store' } });
    // No reenviar consultas ni rutas privadas de la aplicación anterior.
    return Response.redirect('https://chedexpulse.chedex-chesssociety.workers.dev/', 301);
  }
};
