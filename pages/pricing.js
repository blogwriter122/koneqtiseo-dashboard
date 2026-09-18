/**
 * pages/pricing.js — Public Pricing Page
 */
import Head from 'next/head';

export default function PricingPage() {
  const plans = [
    { name: 'Starter', price: 49, period: 'month', color: '#444', features: ['3 sites', '50 articles/month', 'Keyword Studio', 'Forge engine', 'Basic off-page (10 platforms)', 'IndexNow + web archive', 'Email support'], cta: 'Start Free', popular: false },
    { name: 'Pro', price: 149, period: 'month', color: '#6c47ff', features: ['10 sites', '300 articles/month', 'All Starter features', 'AI Visibility Monitor', '16-platform off-page', 'Local Rank & Rent Studio', 'Affiliate Cluster System', 'API access', 'Priority support'], cta: 'Get Pro', popular: true },
    { name: 'Agency', price: 399, period: 'month', color: '#ff9100', features: ['100 sites', '2,000 articles/month', 'All Pro features', 'White-label PDF reports', 'GHL integration', 'Client portal', 'Agency dashboard', 'Dedicated support'], cta: 'Get Agency', popular: false },
  ];

  return (
    <>
      <Head><title>Pricing — KoneqtiSEO</title></Head>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#09090f; color:#e2e2e2; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .nav { display:flex; justify-content:space-between; align-items:center; padding:20px 60px; border-bottom:1px solid #1e1e2e; }
        .logo { font-size:22px; font-weight:900; color:white; text-decoration:none; }
        .logo span { color:#6c47ff; }
        .nav-links { display:flex; gap:16px; align-items:center; }
        .btn { background:#6c47ff; color:white; padding:10px 24px; border-radius:8px; font-weight:700; font-size:14px; border:none; cursor:pointer; text-decoration:none; display:inline-block; }
        .btn-outline { border:1.5px solid #333; color:#ccc; background:transparent; padding:9px 20px; border-radius:8px; font-weight:700; font-size:14px; text-decoration:none; }
        .hero { text-align:center; padding:80px 24px 48px; }
        h1 { font-size:42px; font-weight:900; color:white; margin-bottom:12px; }
        .sub { font-size:17px; color:#666; margin-bottom:48px; }
        .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; max-width:1000px; margin:0 auto; padding:0 24px 80px; }
        .card { background:#111120; border:1px solid #1e1e3a; border-radius:16px; padding:32px; position:relative; }
        .card.popular { border-color:#6c47ff; }
        .badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#6c47ff; color:white; font-size:11px; font-weight:700; padding:4px 16px; border-radius:20px; white-space:nowrap; }
        .plan-name { font-size:13px; font-weight:700; color:#888; letter-spacing:1px; margin-bottom:8px; }
        .price { font-size:48px; font-weight:900; color:white; }
        .price span { font-size:16px; color:#666; font-weight:400; }
        .period { font-size:13px; color:#555; margin-bottom:24px; margin-top:4px; }
        .feature { font-size:13px; color:#888; padding:7px 0; border-bottom:1px solid #1a1a2a; display:flex; gap:8px; align-items:flex-start; }
        .feature::before { content:'✓'; color:#00c853; flex-shrink:0; }
        .plan-btn { display:block; width:100%; text-align:center; margin-top:24px; padding:13px; border-radius:10px; font-weight:700; font-size:14px; background:#6c47ff; color:white; border:none; cursor:pointer; text-decoration:none; }
        .plan-btn.outline { background:transparent; border:1.5px solid #333; color:#ccc; }
        .faq { max-width:700px; margin:0 auto; padding:0 24px 80px; }
        h2 { font-size:28px; font-weight:800; color:white; text-align:center; margin-bottom:32px; }
        .faq-item { background:#111120; border:1px solid #1e1e3a; border-radius:10px; padding:20px; margin-bottom:12px; }
        .faq-q { font-weight:700; color:white; margin-bottom:8px; }
        .faq-a { font-size:14px; color:#888; line-height:1.6; }
        footer { text-align:center; padding:32px; border-top:1px solid #1a1a2a; color:#444; font-size:13px; }
        @media(max-width:768px) { .grid { grid-template-columns:1fr; } .nav { padding:16px 24px; } }
      `}</style>

      <nav className="nav">
        <a href="/" className="logo">Koneqti<span>SEO</span></a>
        <div className="nav-links">
          <a href="/" className="btn-outline">← Home</a>
          <a href="/login" className="btn">Sign In</a>
        </div>
      </nav>

      <div className="hero">
        <h1>Simple, Transparent Pricing</h1>
        <p className="sub">Start free. Upgrade when you rank. Cancel anytime.</p>
      </div>

      <div className="grid">
        {plans.map(plan => (
          <div key={plan.name} className={`card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="badge">MOST POPULAR</div>}
            <div className="plan-name">{plan.name.toUpperCase()}</div>
            <div className="price">${plan.price}<span>/mo</span></div>
            <div className="period">billed monthly · cancel anytime</div>
            {plan.features.map(f => <div key={f} className="feature">{f}</div>)}
            <a href="/login" className={`plan-btn ${plan.popular ? '' : 'outline'}`}>{plan.cta} →</a>
          </div>
        ))}
      </div>

      <div className="faq">
        <h2>Frequently Asked Questions</h2>
        {[
          ['Do I need a credit card to start?', 'No. Start free with no credit card required. Add billing only when you upgrade.'],
          ['Can I cancel anytime?', 'Yes — cancel with one click. No lock-in, no cancellation fees.'],
          ['What is a "site"?', 'Any WordPress site you connect to KoneqtiSEO. One site = one domain.'],
          ['How does the browser automation work?', 'KoneqtiSEO Launcher runs on your PC. It connects your Chrome browser to the engine. Your real IP and accounts are used — no proxies, no API keys, no extra cost.'],
          ['Do I need to pay for Claude API?', 'No. KoneqtiSEO uses your free claude.ai session via Chrome — completely free.'],
          ['Can I upgrade or downgrade?', 'Yes — change plans anytime. Upgrades take effect immediately.'],
        ].map(([q, a]) => (
          <div key={q} className="faq-item">
            <div className="faq-q">{q}</div>
            <div className="faq-a">{a}</div>
          </div>
        ))}
      </div>

      <footer>© {new Date().getFullYear()} KoneqtiSEO · <a href="/" style={{ color: '#6c47ff' }}>Home</a> · <a href="/login" style={{ color: '#6c47ff' }}>Sign In</a></footer>
    </>
  );
}
