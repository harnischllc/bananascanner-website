-- Go Bananas anonymous corrections. One row per user-submitted stage fix.
-- No photo, no account, no device id; just the classifier numbers.
CREATE TABLE IF NOT EXISTS corrections (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  predicted_stage INTEGER NOT NULL,
  corrected_stage INTEGER NOT NULL,
  hue             INTEGER NOT NULL,
  confidence      INTEGER,
  demo            INTEGER NOT NULL DEFAULT 0,
  app_version     TEXT,
  client_ts       TEXT,
  received_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_corrections_received_at
  ON corrections (received_at);
