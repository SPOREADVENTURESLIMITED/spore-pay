import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuth } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await createAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/wallet");
  return children;
}
