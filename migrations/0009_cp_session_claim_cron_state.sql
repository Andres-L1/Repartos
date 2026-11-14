-- Chedex Pulse: reclamo de la sesion diaria (una sola sesion por usuario aunque lleguen varios GET a la vez)
-- y estado del Cron Trigger (pausa de Lichess tras un 429 que sobrevive entre ejecuciones). SOLO CREATE ... IF NOT EXISTS.
CREATE TABLE IF NOT EXISTS cp_session_claims (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS cp_cron_state (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);
