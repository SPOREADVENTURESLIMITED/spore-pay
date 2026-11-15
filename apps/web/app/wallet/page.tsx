"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type WalletData = {
  user: { name: string; email: string };
  wallet: { id: string; currency: string; status: string } | null;
  balanceMinor: number;
  transactions: Array<{
    reference: string;
    transactionType: string;
    description: string | null;
    status: string;
    createdAt: number;
    amountMinor: number;
  }>;
};

export default function Wallet() {
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [tab, setTab] = useState("All");

  useEffect(() => {
    let active = true;
    fetch("/api/wallet", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login");
          return null;
        }
        if (!response.ok) throw new Error("Wallet information could not be loaded.");
        return response.json() as Promise<WalletData>;
      })
      .then((result) => { if (active && result) setData(result); })
      .catch(() => { if (active) setNote("Your wallet information is temporarily unavailable. Please refresh the page."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  const transactions = useMemo(() => (data?.transactions ?? []).filter((item) =>
    tab === "All" || (tab === "Money in" ? item.amountMinor > 0 : item.amountMinor < 0)
  ), [data, tab]);

  const currency = data?.wallet?.currency ?? "UGX";
  const money = (minor: number) => new Intl.NumberFormat("en", {
    style: "currency", currency, maximumFractionDigits: 0
  }).format(minor);
  const date = (timestamp: number) => new Intl.DateTimeFormat("en", {
    dateStyle: "medium", timeStyle: "short"
  }).format(new Date(timestamp));

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <main className="portal-page">
    <aside className="portal-sidebar">
      <Link className="brand" href="/"><span className="brand-mark">S</span>SPORE <b>PAY</b></Link>
      <div className="portal-nav"><span className="portal-nav-label">CUSTOMER MENU</span><Link className="portal-nav-active" href="/wallet">▦ <span>Overview</span></Link><a href="#transactions">↔ <span>Transactions</span></a><a href="#account">◎ <span>My account</span></a><a href="mailto:support@sporecybernecs.com">? <span>Help & support</span></a></div>
      <div className="sidebar-bottom"><span className="avatar">{data?.user.name?.slice(0, 2).toUpperCase() || "SP"}</span><div><strong>{data?.user.name || "Customer"}</strong><small>{data?.user.email || "SPORE PAY account"}</small></div></div>
    </aside>
    <section className="portal-main">
      <header className="portal-header"><div><span className="eyebrow">CUSTOMER PORTAL</span><h1>Wallet overview</h1></div><div className="portal-header-actions"><span className="demo-pill">ACCOUNT PORTAL</span><button className="outline-button" onClick={signOut}>Sign out</button></div></header>
      <div className="preview-alert">Wallet infrastructure is being prepared. No deposits, withdrawals or transfers are enabled. Any displayed balance is calculated from posted ledger entries only.</div>
      {note && <p className="form-notice" role="alert">{note}</p>}
      <section className="wallet-grid">
        <article className="balance-card"><span>POSTED LEDGER BALANCE</span><strong>{loading ? "Loading…" : money(data?.balanceMinor ?? 0)}</strong><small>{data?.wallet ? `${currency} wallet · ${data.wallet.status.replace("_", " ")}` : "Wallet setup is pending"}</small><div className="balance-actions"><button disabled>＋ Add money</button><button disabled>↗ Send money</button></div></article>
        <article className="mini-stat"><span>WALLET STATUS</span><strong>{loading ? "…" : data?.wallet?.status === "active" ? "Active" : "Pending"}</strong><small>Subject to KYC and approval</small><b>Payments disabled</b></article>
        <article className="mini-stat"><span>TRANSACTIONS</span><strong>{loading ? "…" : String(data?.transactions.length ?? 0).padStart(2, "0")}</strong><small>Posted and pending records</small><b>Live ledger view</b></article>
      </section>
      <section className="portal-panel" id="transactions">
        <div className="panel-heading"><div><span className="eyebrow">ACCOUNT ACTIVITY</span><h2>Recent transactions</h2></div><button className="quiet-button" disabled>Download statement</button></div>
        <div className="transaction-filters">{["All","Money in","Money out"].map((x) => <button key={x} className={tab === x ? "filter-active" : ""} onClick={() => setTab(x)}>{x}</button>)}</div>
        <div>
          {transactions.map((item) => <article className="transaction-row" key={item.reference}><span className="transaction-icon">{item.amountMinor >= 0 ? "↓" : "↑"}</span><div className="transaction-name"><strong>{item.description || item.transactionType}</strong><small>{item.reference} · {date(item.createdAt)}</small></div><strong className={item.amountMinor >= 0 ? "amount-in" : "amount-out"}>{item.amountMinor > 0 ? "+" : ""}{money(item.amountMinor)}</strong><span className="status-chip">{item.status}</span></article>)}
          {!loading && transactions.length === 0 && <p className="empty-state">No transactions yet. Your account activity will appear here when supported payment services are enabled.</p>}
        </div>
      </section>
      <section className="portal-panel" id="account">
        <div className="panel-heading"><div><span className="eyebrow">PROFILE</span><h2>Account information</h2></div><span className="status-chip">Customer account</span></div>
        <div className="account-details"><div><small>Account holder</small><strong>{data?.user.name || "—"}</strong></div><div><small>Registered email</small><strong>{data?.user.email || "—"}</strong></div><div><small>Wallet currency</small><strong>{currency}</strong></div><div><small>Verification</small><strong>Not submitted</strong></div></div>
      </section>
      <footer className="portal-footer">SPORE PAY · Payments made simple · SPORE CYBERNETICS</footer>
    </section>
  </main>;
}
