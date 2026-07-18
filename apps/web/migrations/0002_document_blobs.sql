-- Document binary storage in D1 (used when R2 is not bound)

CREATE TABLE IF NOT EXISTS document_blobs (
  document_id TEXT PRIMARY KEY NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  data BLOB NOT NULL
);
