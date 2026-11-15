# SPORE PAY

**Payments made simple.**

SPORE PAY is a planned East African wallet and payment gateway platform, starting with Uganda (UGX) and designed for regional expansion.

## Product scope
- Customer and merchant accounts
- KYC onboarding workflows
- Wallet views and transaction history
- Merchant checkout, payment links and collections
- Provider integrations for mobile money, banks and cards
- Double-entry ledger, reconciliation and settlements
- Refunds, disputes, fraud controls and administration
- Finance reports, audit logs and customer support

## Important status and compliance boundary
This repository is the initial application foundation. It is not a live payment service. No real-money custody, transfers, card processing or payment acceptance should be enabled until the relevant licences, regulated provider contracts, security reviews and production testing are complete. Any demo balances or transactions must be clearly labelled as simulated.

## Initial market
Uganda first, with a regional design for Kenya, Tanzania, Rwanda, Burundi and South Sudan.

## Ownership
Product: SPORE ADVENTURES LIMITED  
Technology: SPORE CYBERNETICS

## Planned delivery
1. Application foundation and public website
2. Secure customer, merchant and administrator accounts
3. Ledger and transaction workflows
4. Sandbox provider adapters and reconciliation
5. Compliance, security and operational readiness
6. Controlled production launch after approvals

## Cloudflare deployment

The Next.js application is configured for Cloudflare Workers using the OpenNext adapter and Wrangler. The worker name is `spore-pay`.

To enable the deployment workflow:
1. In Cloudflare, create an API token with the permissions required to deploy Workers and read the account.
2. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret**.
3. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. Open **Actions → Deploy SPORE PAY to Cloudflare Workers → Run workflow**.

The deployment workflow is manual so a push cannot unexpectedly publish an unconfigured production deployment. Cloudflare will provide the Workers URL after the first successful deployment.

Cloudflare deployment reference: https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
