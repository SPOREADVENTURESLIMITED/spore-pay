# SPORE PAY — Official Platform Architecture

**Owner:** SPORE ADVENTURES LIMITED  
**Technology:** SPORE CYBERNETICS  
**Initial market:** Uganda (UGX)  
**Regional design:** Kenya (KES), Tanzania (TZS), Rwanda (RWF), Burundi (BIF), South Sudan (SSP)  
**Runtime:** Cloudflare Workers + OpenNext / Next.js  
**Primary data store:** Cloudflare D1

## 1. Architecture principles

1. Security and regulatory compliance take precedence over launch speed.
2. The customer-facing application, merchant operations, administrator controls, and payment-provider integrations are separate trust domains.
3. All monetary values are integer minor units; currency is explicit on every wallet, ledger, payment, payout, refund, and settlement record.
4. The ledger is the financial source of truth. Balances are derived from posted ledger entries, never edited as a standalone balance field.
5. Financial operations are idempotent, auditable, permission-checked, and state-transition controlled.
6. No real-money movement is enabled until licensed-provider integration, legal approvals, operational controls, reconciliation, and independent security testing are complete.
7. Provider secrets, authentication keys, and signing keys are Cloudflare Secrets, never source code, plain-text Worker variables, client bundles, or repository files.

## 2. Logical components

### Public web application
- Product information, market availability, service notices, support routes, terms, privacy, and regulatory disclosures.
- Account registration and sign-in.
- Clear status notices distinguishing planned, sandbox, and live capabilities.

### Identity and access
- Better Auth with D1-backed users, sessions, and verification records.
- Customer, merchant, support, compliance, finance, and administrator roles.
- Default role is customer. Privileged roles are assigned only after an administrator verifies identity and records an auditable authorization.
- Enforce authorization in server-side handlers and data access; hiding a UI control is not authorization.
- Production requirements: verified email and phone, MFA for all privileged roles, secure recovery, session revocation, rate limiting, and security event logging.

### Customer domain
- Profile and contact details.
- Wallet account views, status, transaction history, and downloadable statements when enabled.
- KYC submission and status visibility.
- Customer support and complaint tracking.
- Customers cannot change their own role, KYC decision, wallet status, ledger entries, or payment status.

### Merchant domain
- Merchant application and business profile.
- KYB/KYC review and approval.
- Checkout sessions, payment links, collections, refunds, payouts, settlement reports, and webhook event history.
- Merchant access is limited to records owned by that merchant and approved capabilities.

### Financial core
- Double-entry ledger with immutable posted entries.
- Pending, posted, reversed, and failed transaction states.
- Idempotency keys on money-moving commands.
- Reversals use compensating transactions; posted entries are not edited or deleted.
- Daily reconciliation against provider reports and bank/mobile-money settlement records.
- Refunds and payouts require policy checks, approval limits, and audit trails.

### Provider integration boundary
- Provider adapters isolate each mobile-money, bank, and card provider.
- Verify webhook signatures before processing; persist event identifiers and payload hashes; reject duplicate events.
- Never trust browser redirects as proof of payment.
- Use sandbox credentials and test environments until contracts, licensing, risk controls, and approvals are confirmed.
- No provider credentials or live payment endpoints are assumed configured.

### Administration and governance
- Role-based access, MFA, least privilege, and separation of duties.
- User and merchant review, KYC/KYB decisions, account restrictions, support cases, provider configuration, reconciliation, reporting, and audit-log review.
- High-risk actions require step-up authentication and, where configured, dual approval.
- Every privileged action records actor, action, target, outcome, timestamp, and relevant non-sensitive metadata.
- The administrator manually supplies organization-specific policies, approved contacts, provider credentials, legal documents, fee schedules, transaction limits, and authorized staff.

## 3. Deployment topology

- Cloudflare Worker `spore-pay` serves the Next.js/OpenNext application.
- Worker asset binding: `ASSETS`.
- D1 binding: `DB` → `spore-pay-db`.
- Application secrets are stored using Cloudflare Worker Secrets.
- Source of truth: Git repository `SPOREADVENTURESLIMITED/spore-pay`.
- Deployments must be traceable to a reviewed commit and a successful build.
- Production and sandbox provider credentials must be separate.
- Backups, restore drills, migration review, monitoring, and alerting are required before launch.

## 4. Current data model

The deployed D1 database currently contains identity/session and verification tables plus:
- `wallets`, `ledger_accounts`, `ledger_transactions`, `ledger_entries`
- `payment_intents`, `payment_refunds`, `payout_requests`
- `merchant_profiles`, `kyc_submissions`
- `provider_webhook_events`, `settlements`, `idempotency_keys`
- `audit_logs`

Migrations currently recorded in D1: `0001_initial.sql` and `0002_payments_compliance.sql`.

The schema is a foundation, not proof that all workflows, policies, provider adapters, or regulatory controls are implemented.

## 5. Request and transaction flows

### Customer registration
1. Validate input and password policy.
2. Create an unprivileged customer identity.
3. Initialize a pending wallet and corresponding ledger account.
4. Require verified contact channels before production-sensitive activity.
5. Start KYC only when the approved process and privacy notices are configured.

### Payment collection (future, disabled until approved)
1. Merchant creates a payment intent with an idempotency key.
2. Server validates merchant status, amount, currency, limits, and allowed payment method.
3. Provider adapter creates a sandbox/live provider request according to the environment gate.
4. Signed provider webhook is verified and deduplicated.
5. A balanced ledger transaction is posted exactly once.
6. Reconciliation checks provider settlement against the internal ledger.
7. Customer and merchant views update from authoritative records.

### Payout or refund (future, disabled until approved)
1. Validate ownership, available posted balance, KYC/KYB status, risk rules, limits, and destination.
2. Create a pending request and audit event.
3. Apply required approval separation.
4. Submit through the provider adapter with idempotency.
5. Verify provider result independently.
6. Post a compensating or settlement ledger transaction and reconcile.

## 6. Security and operational controls

- Cloudflare Secret bindings for Better Auth and provider credentials.
- No weak or reused secrets; rotate exposed credentials and revoke old values.
- MFA, secure recovery, session invalidation, least-privilege roles, and admin access review.
- CSRF/origin protections, secure cookies, input validation, output encoding, rate limits, and abuse monitoring.
- D1 prepared statements, tenant/ownership filters, foreign-key integrity, and reviewed migrations.
- Immutable audit trail for privileged and financial actions.
- Data minimization, retention schedule, access logging, privacy notices, and incident response.
- Dependency scanning, code review, CI build/typecheck/lint, penetration testing, and independent ledger review.
- Tested backups and documented disaster recovery.

## 7. Manual administrator configuration register

The following are intentionally left for the authorized administrator because they require organization-specific decisions, credentials, evidence, or legal authority:

- Legal entity details, licences, regulator correspondence, terms, privacy policy, complaints and AML/KYC policies.
- Official support email, phone number, postal address, escalation contacts, and business hours.
- Approved administrator and staff identities, role grants, MFA enrollment, and recovery contacts.
- Provider selection, signed contracts, merchant IDs, API credentials, webhook secrets, callback URLs, and sandbox/live approval.
- Fees, limits, currencies enabled, settlement accounts, payout schedules, risk thresholds, and approval matrix.
- KYC/KYB evidence requirements, document storage policy, retention and deletion rules.
- Email/SMS delivery providers, sender IDs, templates, delivery credentials, and verification settings.
- Monitoring recipients, incident contacts, backup retention, and recovery objectives.

Do not enter these values into public source files. Configure them through the designated secure administrative or Cloudflare settings process and record approvals.

## 8. Release gates

### Gate A — Application foundation
- Public pages and account registration/login respond correctly.
- Authenticated customer APIs return correct status codes.
- Unauthenticated access is denied.
- Wallet and admin routes do not produce server errors.
- Build, lint, and typecheck pass.

### Gate B — Controlled operations
- Admin MFA and recovery verified.
- Role-based access tests for customer, merchant, support, compliance, finance, and admin.
- KYC/KYB review and audited approval tested with synthetic records.
- Ledger invariants, idempotency, reversal, and reconciliation tests pass.
- Sandbox provider webhooks pass signature, replay, duplicate, and failure tests.

### Gate C — Production authorization
- Legal/regulatory review and provider contracts complete.
- Independent penetration test and remediation sign-off.
- Independent ledger and reconciliation review.
- Incident response, monitoring, backups, recovery, privacy, and support readiness verified.
- Explicit written launch approval by authorized management.

## 9. Verified status at architecture publication

- Cloudflare Worker and D1 binding exist.
- D1 contains the initial identity, wallet, ledger, payment, merchant, compliance, and audit schema.
- Public homepage, login, and registration pages respond.
- The live wallet and admin routes previously returned HTTP 500 and require post-deployment retesting.
- The Worker configuration inspection found `BETTER_AUTH_SECRET` as a plain-text variable and no registered Worker Secret of that name. This is a release blocker; replace it with a newly generated Cloudflare Secret and redeploy.
- Password recovery, verified email/SMS, administrator MFA, provider integrations, complete operations console, live payment processing, independent security testing, and production authorization remain outstanding.

**Release status: NOT APPROVED FOR LIVE MONEY MOVEMENT.** This architecture defines the target system and manual configuration boundary; it does not claim that every module described above is already implemented.
