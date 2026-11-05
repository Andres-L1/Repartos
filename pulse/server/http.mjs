export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; worker-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}
export async function entityTag(text) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return `W/"${Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')}"`;
}
export function conditional(response, request) {
  const etag = response.headers.get('ETag');
  const candidates = (request.headers.get('If-None-Match') || '')
    .split(',')
    .map((value) => value.trim().replace(/^W\//, ''));
  if (etag && (candidates.includes('*') || candidates.includes(etag.replace(/^W\//, '')))) {
    return new Response(null, { status: 304, headers: response.headers });
  }
  return request.method === 'HEAD' ? new Response(null, response) : response;
}
