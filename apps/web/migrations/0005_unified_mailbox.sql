-- Unify to one Gmail mailbox per apartment (parses Booking + Airbnb transparently)

PRAGMA foreign_keys = OFF;

CREATE TABLE email_connections_new (
  id TEXT PRIMARY KEY NOT NULL,
  apartment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'Mailbox',
  mailbox_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  gmail_refresh_token_enc TEXT,
  gmail_access_token_enc TEXT,
  gmail_access_token_expires_at TEXT,
  gmail_history_id TEXT,
  last_synced_at TEXT,
  last_sync_error TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (apartment_id, kind)
);

-- Keep one gmail connection per apartment (prefer rows that still have a refresh token)
INSERT INTO email_connections_new (
  id, apartment_id, user_id, kind, provider, mailbox_email, status,
  gmail_refresh_token_enc, gmail_access_token_enc, gmail_access_token_expires_at,
  gmail_history_id, last_synced_at, last_sync_error, created_at
)
SELECT
  id,
  apartment_id,
  user_id,
  kind,
  'Mailbox',
  mailbox_email,
  status,
  gmail_refresh_token_enc,
  gmail_access_token_enc,
  gmail_access_token_expires_at,
  gmail_history_id,
  last_synced_at,
  last_sync_error,
  created_at
FROM email_connections
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY apartment_id, kind
        ORDER BY
          CASE WHEN gmail_refresh_token_enc IS NOT NULL THEN 0 ELSE 1 END,
          CASE WHEN status = 'Active' THEN 0 ELSE 1 END,
          created_at DESC
      ) AS rn
    FROM email_connections
  ) ranked
  WHERE rn = 1
);

-- Point ingest events from dropped duplicate connections at the kept mailbox
UPDATE email_ingest_events
SET connection_id = (
  SELECT n.id
  FROM email_connections_new n
  JOIN email_connections old ON old.id = email_ingest_events.connection_id
  WHERE n.apartment_id = old.apartment_id AND n.kind = old.kind
)
WHERE connection_id IS NOT NULL
  AND connection_id NOT IN (SELECT id FROM email_connections_new);

DROP TABLE email_connections;
ALTER TABLE email_connections_new RENAME TO email_connections;

CREATE INDEX IF NOT EXISTS idx_email_connections_apartment ON email_connections(apartment_id);
CREATE INDEX IF NOT EXISTS idx_email_connections_kind ON email_connections(kind);

PRAGMA foreign_keys = ON;
