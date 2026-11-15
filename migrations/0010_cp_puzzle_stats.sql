-- Chedex Pulse: contadores del deposito de puzles por tema y dificultad, para que el Cron Trigger lea unas decenas de filas
-- en vez de todo cp_puzzle_pool. Los mantienen disparadores (atomicos con cada insercion, reclamo, liberacion o borrado),
-- asi que no hay deriva posible. Mas indices para la toma de puzle y la limpieza. SOLO CREATE ... IF NOT EXISTS (+ relleno idempotente).
CREATE TABLE IF NOT EXISTS cp_puzzle_stats (
  theme TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  unused INTEGER NOT NULL,
  last_fetched INTEGER NOT NULL,
  PRIMARY KEY (theme, difficulty)
);

CREATE TRIGGER IF NOT EXISTS trg_cp_puzzle_pool_ai AFTER INSERT ON cp_puzzle_pool
BEGIN
  INSERT INTO cp_puzzle_stats (theme, difficulty, unused, last_fetched)
  VALUES (NEW.theme, NEW.difficulty, NEW.used_at IS NULL, NEW.fetched_at)
  ON CONFLICT (theme, difficulty) DO UPDATE SET unused = unused + excluded.unused, last_fetched = MAX(last_fetched, excluded.last_fetched);
END;

CREATE TRIGGER IF NOT EXISTS trg_cp_puzzle_pool_au AFTER UPDATE OF used_at ON cp_puzzle_pool
BEGIN
  UPDATE cp_puzzle_stats SET unused = unused + (NEW.used_at IS NULL) - (OLD.used_at IS NULL)
  WHERE theme = NEW.theme AND difficulty = NEW.difficulty;
END;

CREATE TRIGGER IF NOT EXISTS trg_cp_puzzle_pool_ad AFTER DELETE ON cp_puzzle_pool
BEGIN
  UPDATE cp_puzzle_stats SET unused = unused - (OLD.used_at IS NULL)
  WHERE theme = OLD.theme AND difficulty = OLD.difficulty;
END;

-- Relleno desde el deposito existente (los disparadores ya existen: cada sentencia es atomica, el valor absoluto es correcto).
INSERT OR REPLACE INTO cp_puzzle_stats (theme, difficulty, unused, last_fetched)
SELECT theme, difficulty, SUM(used_at IS NULL), MAX(fetched_at) FROM cp_puzzle_pool GROUP BY theme, difficulty;

-- Toma del siguiente puzle: el orden (fetched_at, rowid) sale del indice: sin ordenar y parando en el primero que cumple el tope de valoracion.
CREATE INDEX IF NOT EXISTS idx_cp_puzzle_pool_take ON cp_puzzle_pool (theme, difficulty, used_at, fetched_at);
-- Limpieza horaria sin recorrer toda la tabla.
CREATE INDEX IF NOT EXISTS idx_cp_puzzle_pool_used ON cp_puzzle_pool (used_at);
CREATE INDEX IF NOT EXISTS idx_cp_session_items_created ON cp_session_items (created_at);
