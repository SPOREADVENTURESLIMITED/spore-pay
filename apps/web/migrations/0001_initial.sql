PRAGMA foreign_keys = ON;

-- Better Auth core schema.
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY NOT NULL,
  expiresAt INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS session_userId_idx ON session(userId);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY NOT NULL,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS account_userId_idx ON account(userId);
CREATE INDEX IF NOT EXISTS account_provider_account_idx ON account(providerId, accountId);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER
);

CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier);
CREATE INDEX IF NOT EXISTS user_phone_idx ON user(phone);

-- SPORE PAY customer and merchant records.
CREATE TABLE IF NOT EXISTS merchant_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE RESTRICT,
  businessName TEXT NOT NULL,
  registrationNumber TEXT,
  country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','suspended')),
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE RESTRICT,
  currency TEXT NOT NULL CHECK (currency IN ('UGX','KES','TZS','RWF','BIF','SSP')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','frozen','closed')),
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  UNIQUE(userId, currency)
);

CREATE INDEX IF NOT EXISTS wallets_user_idx ON wallets(userId);

-- Ledger accounts and journal entries store integer minor units only.
-- No cached wallet balance is stored; balances must be derived from posted entries.
CREATE TABLE IF NOT EXISTS ledger_accounts (
  id TEXT PRIMARY KEY NOT NULL,
  walletId TEXT REFERENCES wallets(id) ON DELETE RESTRICT,
  ownerUserId TEXT REFERENCES user(id) ON DELETE RESTRICT,
  accountCode TEXT NOT NULL UNIQUE,
  accountType TEXT NOT NULL CHECK (accountType IN ('asset','liability','equity','income','expense')),
  currency TEXT NOT NULL CHECK (currency IN ('UGX','KES','TZS','RWF','BIF','SSP')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_transactions (
  id TEXT PRIMARY KEY NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  transactionType TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('UGX','KES','TZS','RWF','BIF','SSP')),
  status TEXT NOT NULL CHECK (status IN ('pending','posted','reversed','failed')),
  description TEXT,
  idempotencyKey TEXT UNIQUE,
  createdAt INTEGER NOT NULL,
  postedAt INTEGER,
  reversedTransactionId TEXT REFERENCES ledger_transactions(id)
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY NOT NULL,
  transactionId TEXT NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  ledgerAccountId TEXT NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
  direction TEXT NOT NULL CHECK (direction IN ('debit','credit')),
  amountMinor INTEGER NOT NULL CHECK (amountMinor > 0),
  currency TEXT NOT NULL CHECK (currency IN ('UGX','KES','TZS','RWF','BIF','SSP')),
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS ledger_entries_transaction_idx ON ledger_entries(transactionId);
CREATE INDEX IF NOT EXISTS ledger_entries_account_idx ON ledger_entries(ledgerAccountId, currency);

-- Posted journal lines are immutable. Corrections must be represented by reversal entries.
CREATE TRIGGER IF NOT EXISTS ledger_entries_no_update
BEFORE UPDATE ON ledger_entries BEGIN
  SELECT RAISE(ABORT, 'Ledger entries are immutable');
END;

CREATE TRIGGER IF NOT EXISTS ledger_entries_no_delete
BEFORE DELETE ON ledger_entries BEGIN
  SELECT RAISE(ABORT, 'Ledger entries are immutable');
END;

CREATE TABLE IF NOT EXISTS payment_intents (
  id TEXT PRIMARY KEY NOT NULL,
  merchantUserId TEXT NOT NULL REFERENCES user(id) ON DELETE RESTRICT,
  reference TEXT NOT NULL UNIQUE,
  amountMinor INTEGER NOT NULL CHECK (amountMinor > 0),
  currency TEXT NOT NULL CHECK (currency IN ('UGX','KES','TZS','RWF','BIF','SSP')),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','pending','succeeded','failed','cancelled','refunded')),
  provider TEXT,
  providerReference TEXT,
  description TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS payment_intents_merchant_idx ON payment_intents(merchantUserId, createdAt);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  actorUserId TEXT REFERENCES user(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resourceType TEXT NOT NULL,
  resourceId TEXT,
  outcome TEXT NOT NULL,
  metadata TEXT,
  ipAddress TEXT,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs(actorUserId, createdAt);
