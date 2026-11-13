-- Chedex Pulse: partidas de Lichess ya repasadas. SOLO CREATE ... IF NOT EXISTS (nunca DROP/ALTER).
-- La clave (usuario, partida) hace idempotente el recuento de conceptos fallados.
CREATE TABLE IF NOT EXISTS cp_reviewed_games (
  user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  PRIMARY KEY (user_id, game_id)
);
