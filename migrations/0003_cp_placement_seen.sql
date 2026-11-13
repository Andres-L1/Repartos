-- Chedex Pulse: qué devolvió Lichess en el último login para los ritmos rápido y clásico. SOLO CREATE ... IF NOT EXISTS.
-- Sirve para explicar al usuario por qué se le recomienda (o no) un punto de partida. Solo guarda rating, partidas y estado
-- de esos dos ritmos; no guarda el token ni otros datos de la cuenta.

CREATE TABLE IF NOT EXISTS cp_placement_seen (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  seen_json TEXT NOT NULL,           -- {perfsPresent, rapid:{state,rating?,games?}, classical:{...}}
  fetched_at TEXT NOT NULL           -- ISO, último login
);
