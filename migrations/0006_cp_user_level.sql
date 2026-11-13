-- Chedex Pulse: nivel que el alumno elige para empezar. SOLO CREATE ... IF NOT EXISTS.
-- Lichess solo sugiere (ver cp_placement_seen); aqui se guarda lo que el alumno decide.

CREATE TABLE IF NOT EXISTS cp_user_level (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  level TEXT NOT NULL,               -- beginner | initiation | basic | intermediate | advanced | competitive
  chosen_at TEXT NOT NULL            -- ISO, ultima eleccion
);
