# Security policy

SPORE PAY is an early-stage payment platform project. The current public website is informational and is not a live financial service.

## Reporting
Do not publish secrets, customer information or payment credentials in public issues. Report suspected vulnerabilities privately to project maintainers through an approved private channel.

## Development requirements
- Never commit API keys, passwords, private keys, access tokens or production customer data.
- Use environment variables locally and managed secret storage in deployed environments.
- Require multi-factor authentication for privileged accounts.
- Enforce least-privilege roles and record sensitive administrative actions.
- Verify payment provider signatures and enforce idempotency and replay protection.
- Use immutable, balanced double-entry ledger postings for financial records.
- Perform dependency, code, infrastructure and penetration testing before production.
- Do not enable real-money flows until legal, regulatory, provider and security approvals are complete.
