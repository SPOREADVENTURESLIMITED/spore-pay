import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type NativeD1 = NonNullable<Parameters<typeof withCloudflare>[0]["d1Native"]>;
type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<unknown>;
  first<T>(): Promise<T | null>;
};
type D1Binding = { prepare(query: string): D1Statement };

const APP_ORIGIN = "https://spore-pay.spore-cybernetics.workers.dev";

export function createAuth() {
  const { env } = getCloudflareContext();
  const bindings = env as unknown as {
    DB: D1Binding;
    BETTER_AUTH_SECRET?: string;
  };

  if (!bindings.BETTER_AUTH_SECRET || bindings.BETTER_AUTH_SECRET.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be configured as a Cloudflare Worker secret with at least 32 characters.");
  }

  return betterAuth({
    ...withCloudflare(
      { d1Native: bindings.DB as unknown as NativeD1 },
      {
        secret: bindings.BETTER_AUTH_SECRET,
        baseURL: APP_ORIGIN,
        trustedOrigins: [APP_ORIGIN],
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
                  UG: "UGX", KE: "KES", TZ: "TZS", RW: "RWF", BI: "BIF", SS: "SSP"
                };
                const country = String((user as { country?: string }).country || "UG");
                const currency = currencyByCountry[country] || "UGX";
                const proposedWalletId = crypto.randomUUID();
                const now = Date.now();

                await bindings.DB.prepare(
                  "INSERT OR IGNORE INTO wallets (id, userId, currency, status, createdAt, updatedAt) VALUES (?, ?, ?, 'pending', ?, ?)"
                ).bind(proposedWalletId, user.id, currency, now, now).run();

                const wallet = await bindings.DB.prepare(
                  "SELECT id FROM wallets WHERE userId = ? AND currency = ? LIMIT 1"
                ).bind(user.id, currency).first<{ id: string }>();

                if (!wallet) throw new Error("Customer wallet could not be initialized.");

                await bindings.DB.prepare(
                  "INSERT OR IGNORE INTO ledger_accounts (id, walletId, ownerUserId, accountCode, accountType, currency, status, createdAt) VALUES (?, ?, ?, ?, 'liability', ?, 'active', ?)"
                ).bind(crypto.randomUUID(), wallet.id, user.id, `WALLET-${wallet.id}`, currency, now).run();
              }
            }
          }
        }
      }
    )
  });
}
