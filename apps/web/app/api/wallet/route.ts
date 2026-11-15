import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/lib/auth";

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results: T[] }>;
  first<T>(): Promise<T | null>;
};
type D1Binding = { prepare(query: string): D1Statement };

type WalletRow = { id: string; currency: string; status: string };
type TransactionRow = {
  reference: string;
  transactionType: string;
  description: string | null;
  status: string;
  createdAt: number;
  amountMinor: number;
};

export async function GET(request: Request) {
  const session = await createAuth().api.getSession({
    headers: request.headers
  });

  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });

  const { env } = getCloudflareContext();
  const db = (env as unknown as { DB: D1Binding }).DB;

  const walletResult = await db.prepare(
    "SELECT id, currency, status FROM wallets WHERE userId = ? LIMIT 1"
  ).bind(session.user.id).all<WalletRow>();

  const wallet = walletResult.results[0] ?? null;
  if (!wallet) {
    return Response.json({
      user: { name: session.user.name, email: session.user.email },
      wallet: null,
      balanceMinor: 0,
      transactions: []
    });
  }

  const balanceResult = await db.prepare(
    "SELECT COALESCE(SUM(CASE WHEN e.direction = 'credit' THEN e.amountMinor ELSE -e.amountMinor END), 0) AS balanceMinor FROM ledger_entries e INNER JOIN ledger_accounts a ON a.id = e.ledgerAccountId INNER JOIN ledger_transactions t ON t.id = e.transactionId AND t.status = 'posted' WHERE a.walletId = ? AND e.currency = ?"
  ).bind(wallet.id, wallet.currency).first<{ balanceMinor: number }>();

  const transactionResult = await db.prepare(
    "SELECT t.reference, t.transactionType, t.description, t.status, t.createdAt, COALESCE(SUM(CASE WHEN e.direction = 'credit' THEN e.amountMinor ELSE -e.amountMinor END), 0) AS amountMinor FROM ledger_transactions t INNER JOIN ledger_entries e ON e.transactionId = t.id INNER JOIN ledger_accounts a ON a.id = e.ledgerAccountId WHERE a.walletId = ? GROUP BY t.id ORDER BY t.createdAt DESC LIMIT 20"
  ).bind(wallet.id).all<TransactionRow>();

  return Response.json({
    user: { name: session.user.name, email: session.user.email },
    wallet,
    balanceMinor: balanceResult?.balanceMinor ?? 0,
    transactions: transactionResult.results
  });
}
