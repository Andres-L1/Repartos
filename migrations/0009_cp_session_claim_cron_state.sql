-- Chedex Pulse: reclamo de la sesion diaria (una sola sesion por usuario aunque lleguen varios GET a la vez).
-- SOLO CREATE ... IF NOT EXISTS.
CREATE TABLE IF NOT EXISTS cp_session_claims (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
