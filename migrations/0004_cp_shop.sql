-- Chedex Pulse: tienda y moneda Chedex. SOLO CREATE ... IF NOT EXISTS (nunca DROP/ALTER).
-- Los usuarios existentes no tienen filas aquí: saldo 0, equipado por defecto, 0 protectores.

-- Libro de cuentas. Saldo = SUM(delta). Ingresos > 0 (reason 'streak_milestone'), compras < 0 (reason 'purchase'),
-- marca de protector consumido con delta 0 (reason 'protector_used'). El índice único hace idempotentes los ingresos.
CREATE TABLE IF NOT EXISTS cp_wallet_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cp_wallet_ledger_once ON cp_wallet_ledger (user_id, reason, ref);

-- Objetos comprados (los gratis del catálogo cuentan como poseídos sin fila).
CREATE TABLE IF NOT EXISTS cp_inventory (
  user_id TEXT NOT NULL REFERENCES cp_users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  acquired_at TEXT NOT NULL,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS cp_equipped (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  pieces TEXT NOT NULL,
  board TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cp_protectors (
  user_id TEXT PRIMARY KEY REFERENCES cp_users(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0
);
