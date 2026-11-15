import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WalletLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await (await createAuth()).api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return children;
}
