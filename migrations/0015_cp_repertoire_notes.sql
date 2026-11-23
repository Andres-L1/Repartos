-- Comentarios del alumno sobre una jugada de su repertorio. SOLO CREATE ... IF NOT EXISTS sobre tablas cp_*.
-- Pendiente de aplicar en remoto ANTES de desplegar.
CREATE TABLE IF NOT EXISTS cp_repertoire_notes (
  user_id TEXT NOT NULL,
  color TEXT NOT NULL,
  key TEXT NOT NULL,
  uci TEXT NOT NULL,
  note TEXT NOT NULL,
  PRIMARY KEY (user_id, color, key, uci)
);
