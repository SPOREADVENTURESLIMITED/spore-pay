"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Login() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNote("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password"))
      });
      if (result.error) {
        setNote(result.error.message || "Email or password is incorrect.");
      } else {
        router.push("/wallet");
        router.refresh();
      }
    } catch {
      setNote("Sign-in service is unavailable. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <header className="auth-top"><Link className="brand" href="/"><span className="brand-mark">S</span>SPORE <b>PAY</b></Link><Link className="back-link" href="/">← Website</Link></header>
    <section className="auth-layout login-layout">
      <div className="auth-intro"><p className="eyebrow">WELCOME BACK</p><h1>Good to see<br/><em>you again.</em></h1><p>Sign in to view your SPORE PAY customer account.</p><div className="auth-points"><span>✓ Account overview</span><span>✓ Transaction history</span><span>✓ Customer support</span></div></div>
      <form className="auth-card" onSubmit={submit}>
        <div className="form-heading"><span className="eyebrow">CUSTOMER ACCESS</span><h2>Log in to SPORE PAY</h2><p>Enter your registered email and password.</p></div>
        <label>Email address<input name="email" type="email" autoComplete="username" required placeholder="you@example.com"/></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Your password"/></label>
        <button className="auth-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely →"}</button>
        {note && <p className="form-notice" role="alert">{note}</p>}
        <p className="form-legal">If you cannot access your account, contact customer support. Password recovery will be enabled with verified email delivery.</p>
        <p className="auth-switch">New to SPORE PAY? <Link href="/register">Create an account</Link></p>
      </form>
    </section>
    <footer className="auth-footer">© {new Date().getFullYear()} SPORE ADVENTURES LIMITED · Technology by SPORE CYBERNETICS</footer>
  </main>;
}
