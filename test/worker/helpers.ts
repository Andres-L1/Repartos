/** Los tests de la API usan cuentas arbitrarias (ana, luis...): sin lista de autorizados. La puerta se prueba en access.test.ts. */
import { createApp, type AppDeps } from '../../worker/app.js';

export const createOpenApp = (deps: Omit<AppDeps, 'accessMode'>) => createApp({ ...deps, accessMode: 'open' });
