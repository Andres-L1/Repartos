-- Estadísticas de aperturas de Lichess (opcionales, apagadas con OPENINGS_STATS_ENABLED=0). SOLO CREATE ... IF NOT EXISTS sobre tablas cp_*.
-- Pendiente de aplicar en remoto ANTES de desplegar.
-- Caché compartida: una fila por posición (FEN sin contadores) y fuente ('masters' | 'lichess'); json = respuesta ya reducida.
CREATE TABLE IF NOT EXISTS cp_openings_cache (
  fen TEXT NOT NULL,
  source TEXT NOT NULL,
  json TEXT NOT NULL,
  fetched_at INTEGER NOT NULL,  -- ms epoch
  PRIMARY KEY (fen, source)
);
CREATE INDEX IF NOT EXISTS idx_cp_openings_cache_fetched ON cp_openings_cache (fetched_at);

-- Llamadas nuevas a Lichess por día UTC ('AAAA-MM-DD') y alumno; user_id '*' = total del día.
CREATE TABLE IF NOT EXISTS cp_openings_usage (
  day TEXT NOT NULL,
  user_id TEXT NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, user_id)
);
