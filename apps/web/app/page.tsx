"use client";

import { useState } from "react";

const regions = [
  { code: "UG", name: "Uganda", currency: "UGX", status: "Initial market" },
  { code: "KE", name: "Kenya", currency: "KES", status: "Regional roadmap" },
  { code: "TZ", name: "Tanzania", currency: "TZS", status: "Regional roadmap" },
  { code: "RW", name: "Rwanda", currency: "RWF", status: "Regional roadmap" },
  { code: "BI", name: "Burundi", currency: "BIF", status: "Regional roadmap" },
  { code: "SS", name: "South Sudan", currency: "SSP", status: "Regional roadmap" }
];
const faqs = [
  { q: "Can I make real payments on SPORE PAY today?", a: "Not yet. This is the public product preview. Live payments will only be enabled after licensed provider integrations, regulatory approvals and independent security testing." },
  { q: "Which countries are planned?", a: "Uganda is the initial market. Kenya, Tanzania, Rwanda, Burundi and South Sudan are included in the regional roadmap, subject to local requirements." },
  { q: "Will businesses have merchant tools?", a: "The planned platform includes merchant onboarding, checkout, payment links, collections, payouts and settlement reporting." }
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState("UG");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const selected = regions.find((r) => r.code === activeRegion)!;

  return <main>
    <nav className="nav shell">
      <a className="brand" href="#top" aria-label="Spore Pay home"><span className="brand-mark">S</span><span>SPORE <b>PAY</b></span></a>
      <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "✕" : "☰"}</button>
      <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
        <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
        <a href="#regions" onClick={() => setMenuOpen(false)}>Our markets</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>FAQs</a>
        <a className="nav-cta" href="#faq" onClick={() => setMenuOpen(false)}>Learn more ↗</a>
      </div>
    </nav>

    <section className="hero shell" id="top">
      <div className="hero-copy">
        <p className="eyebrow"><span className="pulse" /> EAST AFRICA • BUILT FOR BUSINESS</p>
        <h1>Payments<br/><em>made simple.</em></h1>
        <p className="intro">A smarter payment experience is on the way. SPORE PAY is being built to connect customers, merchants and payment services across East Africa.</p>
        <a className="primary-button" href="#platform">Explore the platform <span>→</span></a>
        <p className="micro">Starting in Uganda · Designed for regional growth</p>
      </div>
      <div className="visual" aria-label="Illustration of a digital payment card">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <div className="payment-card"><div className="card-top"><span className="brand-mini">SPORE <b>PAY</b></span><span className="chip">◈</span></div><div className="card-label">PAYMENTS, CONNECTED</div><div className="card-bottom"><span>SECURE BY DESIGN</span><span className="card-dots">● ● ●</span></div></div>
        <div className="float-tag tag-one"><span>↗</span> Merchant tools</div><div className="float-tag tag-two"><span>◎</span> Digital payments</div>
        <div className="visual-caption">ONE PLATFORM. MORE POSSIBILITIES.</div>
      </div>
    </section>

    <section className="platform shell" id="platform">
      <div className="section-heading"><div><p className="eyebrow">THE PLATFORM</p><h2>Built around the<br/><em>way money moves.</em></h2></div><p className="section-note">A connected foundation for digital payments, merchant operations and a better customer experience.</p></div>
      <div className="service-grid">
        <article className="service-card"><span className="service-number">01 / COLLECTIONS</span><div><h3>Digital collections</h3><p>Planned payment acceptance through connected mobile money, bank and card providers.</p></div><span className="service-arrow">↗</span></article>
        <article className="service-card"><span className="service-number">02 / WALLET</span><div><h3>Wallet experience</h3><p>A clear account experience for balances, transaction history and statements.</p></div><span className="service-arrow">↗</span></article>
        <article className="service-card"><span className="service-number">03 / MERCHANTS</span><div><h3>Merchant tools</h3><p>Payment links, checkout journeys, collections and settlement reporting.</p></div><span className="service-arrow">↗</span></article>
      </div>
    </section>

    <section className="region shell" id="regions">
      <div className="region-copy"><p className="eyebrow">REGIONAL BY DESIGN</p><h2>One region.<br/><em>Many possibilities.</em></h2><p>Choose a market to explore our planned regional rollout.</p></div>
      <div className="market-panel"><div className="market-tabs" role="tablist" aria-label="Select a market">{regions.map((r)=><button key={r.code} role="tab" aria-selected={activeRegion===r.code} className={activeRegion===r.code?"market-tab active":"market-tab"} onClick={()=>setActiveRegion(r.code)}>{r.code}</button>)}</div><div className="market-detail" role="tabpanel"><span className="market-label">SELECTED MARKET</span><strong>{selected.name}</strong><span className="market-currency">{selected.currency}</span><span className="market-status"><i/> {selected.status}</span></div></div>
    </section>

    <section className="faq shell" id="faq"><div><p className="eyebrow">GOOD TO KNOW</p><h2>Questions,<br/><em>answered.</em></h2></div><div className="faq-list">{faqs.map((f,i)=><article className="faq-item" key={f.q}><button className="faq-question" aria-expanded={openFaq===i} onClick={()=>setOpenFaq(openFaq===i?null:i)}>{f.q}<span>{openFaq===i?"−":"+"}</span></button>{openFaq===i&&<p className="faq-answer">{f.a}</p>}</article>)}</div></section>

    <section className="closing shell"><div><p className="eyebrow">THE NEXT CHAPTER OF PAYMENTS</p><h2>Let’s move<br/><em>forward.</em></h2></div><a className="primary-button" href="#faq">Explore FAQs <span>↗</span></a></section>
    <footer className="footer shell"><a className="brand" href="#top"><span className="brand-mark">S</span><span>SPORE <b>PAY</b></span></a><div><strong>PAYMENTS MADE SIMPLE</strong><span>Technology by <b>SPORE CYBERNETICS</b></span></div><small>© {new Date().getFullYear()} SPORE ADVENTURES LIMITED</small></footer>
  </main>;
}
