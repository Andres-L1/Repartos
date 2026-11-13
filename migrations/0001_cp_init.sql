-- Chedex Pulse: tablas nuevas con prefijo cp_. SOLO CREATE ... IF NOT EXISTS.
-- Nunca DROP/ALTER sobre tablas existentes: la base D1 de producción contiene datos de otros módulos.

CREATE TABLE IF NOT EXISTS cp_users (
  id TEXT PRIMARY KEY,               -- id de Lichess (minúsculas)
  username TEXT NOT NULL,            -- nombre de usuario de Lichess
  created_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cp_lesson_progress (
  user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  best_score REAL NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  last_key TEXT,
  last_at INTEGER,
  last_xp INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS cp_profiles (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  daily_goal_xp INTEGER NOT NULL DEFAULT 20,
  xp_today INTEGER NOT NULL DEFAULT 0,
  xp_today_date TEXT
);

CREATE TABLE IF NOT EXISTS cp_weak_concepts (
  user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, concept_id)
);

-- Solo se usa con BILLING_MODE=dev (proveedor simulado). En beta_open queda vacía.
CREATE TABLE IF NOT EXISTS cp_subscriptions (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  current_period_end TEXT,
  external_id TEXT
);
