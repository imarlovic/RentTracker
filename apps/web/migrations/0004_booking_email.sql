-- Booking email enrichment (Gmail connect)
CREATE TABLE email_connections (
  id TEXT PRIMARY KEY NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'Booking',
  mailbox_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  gmail_refresh_token_enc TEXT,
  gmail_access_token_enc TEXT,
  gmail_access_token_expires_at TEXT,
  gmail_history_id TEXT,
  last_synced_at TEXT,
  last_sync_error TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (apartment_id, provider, kind)
);

CREATE INDEX idx_email_connections_apartment ON email_connections(apartment_id);
CREATE INDEX idx_email_connections_kind ON email_connections(kind);

CREATE TABLE email_ingest_events (
  id TEXT PRIMARY KEY NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  connection_id TEXT REFERENCES email_connections(id) ON DELETE SET NULL,
  message_id TEXT NOT NULL,
  from_address TEXT,
  subject TEXT,
  received_at TEXT,
  parse_status TEXT NOT NULL,
  parse_error TEXT,
  raw_excerpt TEXT,
  reservation_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (apartment_id, message_id)
);

CREATE INDEX idx_email_ingest_apartment ON email_ingest_events(apartment_id);
CREATE INDEX idx_email_ingest_created ON email_ingest_events(created_at);
