-- Explicaciones breves con IA (DeepSeek). SOLO CREATE ... IF NOT EXISTS sobre tablas cp_*. Pendiente de aplicar en remoto antes de desplegar.
-- Caché compartida entre todos los alumnos: cada explicación se genera una vez. La clave es un hash (versión del prompt, hechos).
CREATE TABLE IF NOT EXISTS cp_ai_cache (
  key TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL,       -- ms epoch
  tokens INTEGER NOT NULL DEFAULT 0  -- tokens que costó generarla
);
CREATE INDEX IF NOT EXISTS idx_cp_ai_cache_created ON cp_ai_cache (created_at);

-- Uso por día UTC ('AAAA-MM-DD') y alumno. Dos filas especiales por día: user_id '*' (total de llamadas nuevas y tokens) y
-- '*cache' (respuestas servidas desde la caché, en calls). Los ids de Lichess no pueden contener '*'.
CREATE TABLE IF NOT EXISTS cp_ai_usage (
  day TEXT NOT NULL,
  user_id TEXT NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  tokens INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, user_id)
);

-- Consumo del mes UTC ('AAAA-MM'): corte duro mensual (presupuesto o tope de tokens, ver worker/ai.ts). Una fila por mes.
CREATE TABLE IF NOT EXISTS cp_ai_month (
  month TEXT PRIMARY KEY,
  calls INTEGER NOT NULL DEFAULT 0,      -- llamadas nuevas a la IA
  cached INTEGER NOT NULL DEFAULT 0,     -- respuestas servidas desde la caché
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0
);
