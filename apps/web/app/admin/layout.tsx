import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuth } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  if (!host) redirect("/login");
  const protocol = requestHeaders.get("x-forwarded-proto") || "https";
  const session = await createAuth(`${protocol}://${host}`).api.getSession({ headers: requestHeaders });
  if (!session) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/wallet");
  return children;
}
