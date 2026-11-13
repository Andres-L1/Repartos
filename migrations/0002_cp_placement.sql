-- Chedex Pulse: colocación inicial según el Elo de Lichess (partidas rápidas/clásicas). SOLO CREATE ... IF NOT EXISTS.
-- Se guarda únicamente el Elo ya validado, no el token de Lichess ni otros datos de la cuenta.

CREATE TABLE IF NOT EXISTS cp_placement (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,              -- 'lichess' (hay Elo fiable) | 'none'
  perf TEXT,                         -- 'rapid' | 'classical' | NULL
  rating INTEGER,                    -- 0..4000 o NULL
  games INTEGER,                     -- partidas en ese ritmo o NULL
  mode TEXT,                         -- elección del usuario: 'lichess' | 'scratch' | NULL (sin elegir todavía)
  fetched_at TEXT NOT NULL           -- ISO, último login que refrescó el dato
);
