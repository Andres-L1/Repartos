-- Chedex Pulse: repasos espaciados y sesion diaria. SOLO CREATE ... IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS cp_review_schedule (
  user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL,
  box INTEGER NOT NULL,               -- 1..5 (esperas de 1, 2, 4, 8 y 16 dias)
  due_at INTEGER NOT NULL,            -- ms epoch
  last_at INTEGER,
  PRIMARY KEY (user_id, concept_id)
);

CREATE TABLE IF NOT EXISTS cp_review_positions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  ply INTEGER NOT NULL,
  concept_id TEXT NOT NULL,
  fen TEXT NOT NULL,
  best_uci TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  solved_at INTEGER,
  UNIQUE (user_id, game_id, ply)
);

CREATE TABLE IF NOT EXISTS cp_puzzle_pool (
  puzzle_id TEXT PRIMARY KEY,
  theme TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  rating INTEGER NOT NULL,
  fen TEXT NOT NULL,
  line_json TEXT NOT NULL,
  fetched_at INTEGER NOT NULL,
  used_at INTEGER
);

CREATE TABLE IF NOT EXISTS cp_session_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  source_id TEXT,
  fen TEXT NOT NULL,
  line_json TEXT NOT NULL,
  step INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  first_try_ok INTEGER,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);
