import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const session = await createAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const role = (session.user as typeof session.user & { role?: string }).role;
  if (role !== "admin") {
    return (
      <main className="auth-page">
        <header className="auth-top">
          <Link className="brand" href="/"><span className="brand-mark">S</span>SPORE <b>PAY</b></Link>
          <Link className="back-link" href="/wallet">← Customer wallet</Link>
        </header>
        <section className="auth-card" style={{ maxWidth: 560, margin: "12vh auto" }}>
          <span className="eyebrow">RESTRICTED AREA</span>
          <h1>Administrator access required</h1>
          <p>Your account does not have the administrator role. This event is not a KYC or financial decision.</p>
          <Link className="outline-button" href="/wallet">Return to wallet</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <header className="auth-top">
        <Link className="brand" href="/"><span className="brand-mark">S</span>SPORE <b>PAY</b></Link>
        <Link className="back-link" href="/wallet">← Customer wallet</Link>
      </header>
      <section className="auth-card" style={{ maxWidth: 680, margin: "8vh auto" }}>
        <span className="eyebrow">ADMINISTRATOR ACCESS VERIFIED</span>
        <h1>Operations console is not yet enabled</h1>
        <p>Your administrator identity is recognized, but KYC review, financial operations, user management and administrative actions remain disabled until audited controls and workflows are implemented.</p>
      </section>
    </main>
  );
}
