-- Hazely: користувачі, сесії та замовлення (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  phone         TEXT    NOT NULL UNIQUE,          -- нормалізований: 380XXXXXXXXX
  password_hash TEXT    NOT NULL,                 -- scrypt, hex
  password_salt TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT    PRIMARY KEY,                 -- sha256 від токена з cookie
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id        TEXT    NOT NULL UNIQUE,       -- HZ-YYMMDD-XXXX
  user_id          INTEGER NOT NULL REFERENCES users(id),
  status           TEXT    NOT NULL DEFAULT 'processing'
                   CHECK (status IN ('processing', 'confirmed', 'delivered', 'cancelled')),
  customer_name    TEXT    NOT NULL,
  phone            TEXT    NOT NULL,
  np_branch        TEXT    NOT NULL,              -- поштове відділення
  subscription_id  TEXT,                          -- classic | gourmet | owner
  subscription_price INTEGER NOT NULL DEFAULT 0,  -- з урахуванням регулятора
  budget_used_gg   INTEGER NOT NULL DEFAULT 0,
  budget_credit_gg INTEGER NOT NULL DEFAULT 0,    -- залишок бюджету на наступну відправку
  retail_total     INTEGER NOT NULL DEFAULT 0,
  advent_qty       INTEGER NOT NULL DEFAULT 0,
  advent_total     INTEGER NOT NULL DEFAULT 0,
  total            INTEGER NOT NULL,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kind       TEXT    NOT NULL CHECK (kind IN ('subscription', 'extra', 'advent')),
  product_id TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  qty        INTEGER NOT NULL,
  price      INTEGER NOT NULL DEFAULT 0            -- 0 для продуктів, що входять у підписку
);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
