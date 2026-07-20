-- Track one-shot mailbox history imports
ALTER TABLE email_connections ADD COLUMN history_imported_at TEXT;
