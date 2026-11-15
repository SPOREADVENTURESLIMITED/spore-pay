# SPORE PAY architecture

## Product shape
SPORE PAY combines a customer wallet experience with a merchant payment gateway. The initial market is Uganda (UGX), with regional expansion planned for Kenya (KES), Tanzania (TZS), Rwanda (RWF), Burundi (BIF) and South Sudan (SSP).

## Proposed components
- Web application: customer, merchant and operations interfaces.
- Identity service: registration, secure authentication, MFA, roles and sessions.
- KYC workflow: evidence collection, review states and audit trail.
- Payments orchestration: provider adapters, payment intents, callbacks and idempotency.
- Ledger: immutable double-entry journal with balanced postings.
- Reconciliation: provider settlement matching, exceptions and finance review.
- Merchant services: checkout, payment links, API credentials and reporting.
- Operations: risk queues, disputes, refunds, support and audit logs.

## Core financial invariants
1. Every posted journal must balance by currency.
2. Posted ledger entries are immutable; corrections use reversing entries.
3. All money values use integer minor units, never floating-point arithmetic.
4. Payment requests and provider callbacks are idempotent.
5. A client redirect or browser message is not proof of payment; verify signed provider events or provider-side status.
6. Keep currencies and country-specific rules explicit. Never silently convert currencies.

## Security and compliance
- Use a vetted identity provider or hardened authentication implementation.
- Enforce MFA for privileged operators and role-based access control.
- Store secrets only in managed secret storage; never commit credentials.
- Validate webhook signatures, timestamps and replay protection.
- Maintain append-only audit events for privileged and financial actions.
- Apply KYC, AML, sanctions, privacy and consumer-protection controls appropriate to each jurisdiction.
- Use licensed payment institutions and regulated partners for custody, processing, transfers and settlement.

## Delivery stages
1. Public web foundation (current repository stage).
2. Authentication, user roles and onboarding.
3. Ledger design, tests and sandbox-only payment intents.
4. Provider sandbox adapters and reconciliation.
5. Independent security, legal and operational review.
6. Production enablement only after required licences, provider agreements and approvals.

## Current limitation
The current website is informational only. It does not create accounts, hold funds, process payments or expose a production API. Do not represent demo data as real money.
