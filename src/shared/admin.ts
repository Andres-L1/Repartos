/** Cuentas de administración (id de Lichess en minúsculas, el que verifica el acceso con Lichess). Ven todo el contenido y la tienda sin gastar Chedex. */
const ADMIN_IDS: ReadonlySet<string> = new Set(['andresli']);

export const isAdmin = (userId: string): boolean => ADMIN_IDS.has(userId.toLowerCase());
