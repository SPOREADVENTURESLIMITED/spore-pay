import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type NativeD1 = NonNullable<Parameters<typeof withCloudflare>[0]["d1Native"]>;

export function createAuth(origin: string) {
  const { env } = getCloudflareContext();
  const bindings = env as unknown as {
    DB: NativeD1;
    BETTER_AUTH_SECRET?: string;
  };

  if (!bindings.BETTER_AUTH_SECRET || bindings.BETTER_AUTH_SECRET.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be configured as a Cloudflare Worker secret with at least 32 characters.");
  }

  return betterAuth({
    ...withCloudflare(
      { d1Native: bindings.DB },
      {
        secret: bindings.BETTER_AUTH_SECRET,
        baseURL: origin,
        trustedOrigins: [origin],
        emailAndPassword: {
          enabled: true,
          minPasswordLength: 12,
          maxPasswordLength: 128
        },
        user: {
          additionalFields: {
            phone: { type: "string", required: true, input: true },
            country: { type: "string", required: true, input: true },
            role: { type: "string", required: false, defaultValue: "customer", input: false }
          }
        },
        rateLimit: {
          enabled: true,
          window: 60,
          max: 10
        },
        session: {
          expiresIn: 60 * 60 * 24 * 7,
          updateAge: 60 * 60 * 24
        },
        databaseHooks: {
          user: {
            create: {
              after: async (user) => {
                const currencyByCountry: Record<string, string> = {
                  UG: "UGX",
                  KE: "KES",
                  TZ: "TZS",
                  RW: "RWF",
                  BI: "BIF",
                  SS: "SSP"
                };
                const country = String((user as { country?: string }).country || "UG");
                const currency = currencyByCountry[country] || "UGX";
                const walletId = crypto.randomUUID();
                const accountId = crypto.randomUUID();
                const now = Date.now();

                await bindings.DB.prepare(
                  "INSERT OR IGNORE INTO wallets (id, userId, currency, status, createdAt, updatedAt) VALUES (?, ?, ?, 'pending', ?, ?)"
                ).bind(walletId, user.id, currency, now, now).run();

                await bindings.DB.prepare(
                  "INSERT OR IGNORE INTO ledger_accounts (id, walletId, ownerUserId, accountCode, accountType, currency, status, createdAt) VALUES (?, ?, ?, ?, 'liability', ?, 'active', ?)"
                ).bind(accountId, walletId, user.id, `WALLET-${walletId}`, currency, now).run();
              }
            }
          }
        }
      }
    )
  });
}
