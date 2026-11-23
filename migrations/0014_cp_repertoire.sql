-- Repertorio de aperturas del alumno: una fila por jugada (color, posición sin contadores, UCI). SOLO CREATE ... IF NOT EXISTS sobre tablas cp_*.
-- Pendiente de aplicar en remoto ANTES de desplegar.
CREATE TABLE IF NOT EXISTS cp_repertoire (
  user_id TEXT NOT NULL,
  color TEXT NOT NULL,   -- 'white' | 'black'
  key TEXT NOT NULL,     -- FEN de 4 campos
  uci TEXT NOT NULL,
  PRIMARY KEY (user_id, color, key, uci)
);
