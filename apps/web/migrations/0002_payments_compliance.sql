PRAGMA foreign_keys = ON;

-- KYC records reference encrypted/object storage keys; do not store identity documents in D1.
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE RESTRICT,
  country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','expired')),
  documentObjectKeys TEXT,
  providerReference TEXT,
  reviewerUserId TEXT REFERENCES user(id) ON DELETE SET NULL,
  reviewNote TEXT,
  submittedAt INTEGER NOT NULL,
  reviewedAt INTEGER,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS kyc_user_status_idx ON kyc_submissions(userId, status);
CREATE INDEX IF NOT EXISTS kyc_review_queue_idx ON kyc_submissions(status, submittedAt);

CREATE TABLE IF NOT EXISTS payout_requests (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE RESTRICT,
  walletId TEXT NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  reference TEXT NOT NULL UNIQUE,
  amountMinor INTEGER NOT NULL CHECK (amountMinor > 0),
  feeMinor INTEGER NOT NULL DEFAULT 0 CHECK (feeMinor >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('UGX','KES','TZS','RWF','BIF','SSP')),
  destinationType TEXT NOT NULL,
  destinationToken TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','pending','approved','processing','paid','failed','cancelled')),
  provider TEXT,
  providerReference TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS payout_user_idx ON payout_requests(userId, createdAt);

CREATE TABLE IF NOT EXISTS payment_refunds (
  id TEXT PRIMARY KEY NOT NULL,
  paymentIntentId TEXT NOT NULL REFERENCES payment_intents(id) ON DELETE RESTRICT,
  reference TEXT NOT NULL UNIQUE,
  amountMinor INTEGER NOT NULL CHECK (amountMinor > 0),
  currency TEXT NOT NULL CHECK (currency IN ('UGX','KES','TZS','RWF','BIF','SSP')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','processing','succeeded','failed','rejected')),
  providerReference TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS refunds_payment_idx ON payment_refunds(paymentIntentId);

CREATE TABLE IF NOT EXISTS provider_webhook_events (
  id TEXT PRIMARY KEY NOT NULL,
  provider TEXT NOT NULL,
  eventId TEXT NOT NULL,
  payloadHash TEXT NOT NULL,
  signatureVerified INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','processing','processed','failed','ignored')),
  receivedAt INTEGER NOT NULL,
  processedAt INTEGER,
  UNIQUE(provider, eventId)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id TEXT PRIMARY KEY NOT NULL,
  scope TEXT NOT NULL,
  idempotencyKey TEXT NOT NULL,
  responseStatus INTEGER,
  responseBody TEXT,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  UNIQUE(scope, idempotencyKey)
);

CREATE INDEX IF NOT EXISTS idempotency_expiry_idx ON idempotency_keys(expiresAt);

CREATE TABLE IF NOT EXISTS settlements (
  id TEXT PRIMARY KEY NOT NULL,
  provider TEXT NOT NULL,
  settlementReference TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL CHECK (currency IN ('UGX','KES','TZS','RWF','BIF','SSP')),
  expectedAmountMinor INTEGER NOT NULL,
  receivedAmountMinor INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','matched','mismatch','settled','failed')),
  settlementDate TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
