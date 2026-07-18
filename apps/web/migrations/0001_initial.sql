-- Initial RentTracker schema (D1 / SQLite)

CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  picture_url TEXT,
  google_subject TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL
);

CREATE TABLE apartments (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  header_blob_key TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_apartments_owner ON apartments(owner_id);

CREATE TABLE reservations (
  id TEXT PRIMARY KEY NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'Active',
  external_id TEXT,
  reference TEXT,
  booking_date TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'RentTracker',
  holding_name TEXT NOT NULL,
  people INTEGER,
  adults INTEGER,
  children INTEGER,
  infants INTEGER,
  price REAL,
  commission REAL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  country TEXT
);

CREATE INDEX idx_reservations_apartment_dates ON reservations(apartment_id, start_date, end_date);
CREATE INDEX idx_reservations_apartment_external ON reservations(apartment_id, external_id);

CREATE TABLE expenses (
  id TEXT PRIMARY KEY NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR'
);

CREATE INDEX idx_expenses_apartment ON expenses(apartment_id);

CREATE TABLE documents (
  id TEXT PRIMARY KEY NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  blob_key TEXT NOT NULL,
  uploaded_at TEXT NOT NULL
);

CREATE INDEX idx_documents_apartment ON documents(apartment_id);

CREATE TABLE linked_calendars (
  id TEXT PRIMARY KEY NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  last_synced_at TEXT
);

CREATE INDEX idx_linked_calendars_apartment ON linked_calendars(apartment_id);

CREATE TABLE integration_configurations (
  id TEXT PRIMARY KEY NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NotConfigured',
  external_property_id TEXT,
  ical_url TEXT,
  last_synced_at TEXT,
  UNIQUE (apartment_id, provider)
);

CREATE TABLE push_notification_subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TEXT NOT NULL
);
