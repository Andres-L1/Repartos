-- Acceso restringido a alumnos de TopChess. SOLO CREATE ... IF NOT EXISTS sobre tablas cp_*.
-- Las cuentas de administración (src/shared/admin.ts) entran siempre, estén o no en cp_allowed_users.
CREATE TABLE IF NOT EXISTS cp_allowed_users (
  lichess_id TEXT PRIMARY KEY,       -- id de Lichess en minúsculas
  username TEXT,                     -- nombre tal como lo escribió la administración
  added_at INTEGER,                  -- ms epoch
  added_by TEXT                      -- id de quien lo añadió
);

-- Intentos de entrada denegados (con tope de filas y borrado a los 90 días, ver worker/access.ts y la limpieza horaria).
CREATE TABLE IF NOT EXISTS cp_access_requests (
  lichess_id TEXT PRIMARY KEY,
  username TEXT,
  first_at INTEGER,
  last_at INTEGER,
  attempts INTEGER
);
CREATE INDEX IF NOT EXISTS idx_cp_access_requests_last ON cp_access_requests (last_at);
