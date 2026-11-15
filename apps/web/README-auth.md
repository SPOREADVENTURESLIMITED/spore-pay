# SPORE PAY authentication and database setup

## Runtime configuration

The Worker needs the following Cloudflare configuration:

- D1 binding: `DB` → `spore-pay-db`
- Secret: `BETTER_AUTH_SECRET` (generate a unique random value of at least 32 characters)
- Public URL: the deployed Worker/custom-domain origin is used to build the Better Auth base URL from the incoming request.

Set the secret in Cloudflare Workers & Pages → spore-pay → Settings → Variables and Secrets → Add → Secret. Name it exactly `BETTER_AUTH_SECRET`. Never commit it or send it in chat.

## Apply the database migration

From the repository root:

```bash
npm install
npm run db:migrate:remote --workspace @spore-pay/web
```

For local development, use:

```bash
npm run db:migrate:local --workspace @spore-pay/web
```

The migration creates Better Auth's user/session/account/verification tables plus initial wallet, merchant, payment-intent, ledger and audit-log structures. Ledger entries are immutable; corrections must use reversals.

## First administrator

Public registration always assigns the `customer` role. It cannot accept a role from the browser. Do not promote an account until the owner has verified its identity and secured the Cloudflare account. The first administrator must be promoted directly by an authorized operator through Cloudflare D1 Console after creating and verifying the intended account:

```sql
UPDATE user SET role = 'admin' WHERE email = 'OWNER_EMAIL' AND role = 'customer';
```

Replace `OWNER_EMAIL` with the exact owner account email. Never expose this SQL through a public API.

## Production requirements still outstanding

This repository is an application foundation, not a licensed live-money service. Before accepting deposits, payouts or customer funds, SPORE PAY must complete applicable licensing and regulatory checks in each operating country, provider contracts and live payment integrations, email/phone verification, KYC/AML workflows, admin MFA and audited role controls, operational monitoring, penetration testing and independent financial-ledger reconciliation.
