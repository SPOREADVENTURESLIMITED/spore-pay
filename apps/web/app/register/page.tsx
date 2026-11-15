"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Register() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNote("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signUp.email({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        phone: String(form.get("phone")),
        country: String(form.get("country"))
      } as unknown as Parameters<typeof authClient.signUp.email>[0]);
      if (result.error) {
        setNote(result.error.message || "Registration could not be completed. Please try again.");
      } else {
        router.push("/wallet");
        router.refresh();
      }
    } catch {
      setNote("Registration service is unavailable. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <header className="auth-top"><Link className="brand" href="/"><span className="brand-mark">S</span>SPORE <b>PAY</b></Link><Link className="back-link" href="/">← Website</Link></header>
    <section className="auth-layout">
      <div className="auth-intro"><p className="eyebrow">JOIN SPORE PAY</p><h1>Your money.<br/><em>Your control.</em></h1><p>Create your customer account for the SPORE PAY wallet platform.</p><div className="auth-points"><span>✓ Customer-first wallet experience</span><span>✓ Uganda-first, regional-ready</span><span>✓ Secure password-based sign-in</span></div></div>
      <form className="auth-card" onSubmit={submit}>
        <div className="form-heading"><span className="eyebrow">CUSTOMER ONBOARDING</span><h2>Create your account</h2><p>All fields are required.</p></div>
        <label>Full name<input name="name" autoComplete="name" required minLength={2} placeholder="Your full name"/></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label>
        <label>Mobile number<input name="phone" type="tel" autoComplete="tel" required minLength={7} placeholder="+256 7XX XXX XXX"/></label>
        <label>Country<select name="country" defaultValue="UG"><option value="UG">Uganda</option><option value="KE">Kenya</option><option value="TZ">Tanzania</option><option value="RW">Rwanda</option><option value="BI">Burundi</option><option value="SS">South Sudan</option></select></label>
        <label>Create password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="At least 12 characters"/></label>
        <button className="auth-submit" disabled={busy}>{busy ? "Creating account…" : "Create secure account →"}</button>
        {note && <p className="form-notice" role="alert">{note}</p>}
        <p className="form-legal">Use a unique password. Email and phone verification will be added before production onboarding.</p>
        <p className="auth-switch">Already registered? <Link href="/login">Log in</Link></p>
      </form>
    </section>
    <footer className="auth-footer">© {new Date().getFullYear()} SPORE ADVENTURES LIMITED · Technology by SPORE CYBERNETICS</footer>
  </main>;
}
