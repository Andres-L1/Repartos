-- Chedex Pulse: indices para las consultas frecuentes de la sesion diaria y el deposito. SOLO CREATE ... IF NOT EXISTS.
CREATE INDEX IF NOT EXISTS idx_cp_session_items_session ON cp_session_items (user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_cp_session_items_status ON cp_session_items (user_id, status);
CREATE INDEX IF NOT EXISTS idx_cp_puzzle_pool_pick ON cp_puzzle_pool (theme, difficulty, used_at);
CREATE INDEX IF NOT EXISTS idx_cp_review_positions_open ON cp_review_positions (user_id, solved_at, created_at);
CREATE INDEX IF NOT EXISTS idx_cp_review_schedule_due ON cp_review_schedule (user_id, due_at);
