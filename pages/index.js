/**
 * pages/index.js — Public Marketing Homepage
 * Logged out → marketing page | Logged in → /dashboard
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/api';
import Head from 'next/head';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [toolUrl, setToolUrl] = useState('');
  const [toolResult, setToolResult] = useState(null);
  const [toolLoading, setToolLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) router.push('/dashboard');
      else setChecking(false);
    });
  }, []);

  async function checkIndex() {
    if (!toolUrl) return;
    setToolLoading(true);
    setToolResult(null);
    try {
      const res = await fetch('/api/tools/index-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: toolUrl }),
      });
      setToolResult(await res.json());
    } catch (e) {
      setToolResult({ error: e.message });
    } finally { setToolLoading(false); }
  }

  if (checking) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#09090f', color: 'white', fontFamily: 'system-ui' }}>
      Loading...
    </div>
  );

  return (
    <>
      <Head>
        <title>KoneqtiSEO — The Agentic SEO Platform That Actually Builds and Ranks Sites</title>
        <meta name="description" content="Not just reporting — KoneqtiSEO finds niches, writes content, publishes to 16 platforms and monitors rankings automatically. Real browser, real IP, zero API cost." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #09090f; color: #e2e2e2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        a { text-decoration: none; }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid #1e1e2e; }
        .logo { font-size: 22px; font-weight: 900; color: white; }
        .logo span { color: #6c47ff; }
        .nav-links { display: flex; gap: 28px; align-items: center; }
        .nav-link { color: #888; font-size: 14px; }
        .nav-link:hover { color: white; }
        .btn-primary { background: #6c47ff; color: white; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; display: inline-block; }
        .btn-primary:hover { background: #5c37ef; }
        .btn-outline { border: 1.5px solid #333; color: #ccc; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; }
        .btn-outline:hover { border-color: #555; color: white; }
        .hero { text-align: center; padding: 90px 0 60px; }
        .tag { display: inline-block; background: rgba(108,71,255,0.12); color: #a68dff; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 20px; border: 1px solid rgba(108,71,255,0.2); letter-spacing: 0.5px; }
        h1 { font-size: 54px; font-weight: 900; line-height: 1.08; color: white; margin-bottom: 22px; letter-spacing: -1px; }
        h1 em { color: #6c47ff; font-style: normal; }
        .hero-sub { font-size: 19px; color: #888; line-height: 1.65; max-width: 600px; margin: 0 auto 36px; }
        .cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
        .cta-note { font-size: 12px; color: #555; }
        .stats-row { display: flex; gap: 40px; justify-content: center; margin-top: 48px; padding-top: 40px; border-top: 1px solid #1a1a2e; }
        .stat-item { text-align: center; }
        .stat-val { font-size: 28px; font-weight: 900; color: white; }
        .stat-label { font-size: 12px; color: #555; margin-top: 2px; }
        .section { padding: 80px 0; }
        .section-tag { display: inline-block; background: rgba(108,71,255,0.1); color: #a68dff; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 14px; }
        h2 { font-size: 38px; font-weight: 900; color: white; margin-bottom: 12px; letter-spacing: -0.5px; }
        .section-sub { font-size: 16px; color: #666; margin-bottom: 48px; max-width: 520px; }
        .tool-box { background: #111120; border: 1px solid #1e1e3a; border-radius: 16px; padding: 32px; max-width: 580px; margin: 0 auto; }
        .tool-label { font-size: 12px; color: #666; font-weight: 600; margin-bottom: 8px; }
        .tool-input-row { display: flex; gap: 10px; }
        .tool-input { flex: 1; padding: 12px 16px; border-radius: 10px; border: 1.5px solid #1e1e3a; background: #09090f; color: white; font-size: 14px; outline: none; }
        .tool-input:focus { border-color: #6c47ff; }
        .tool-btn { background: #6c47ff; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; white-space: nowrap; }
        .tool-result { margin-top: 14px; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; }
        .tool-ok { background: rgba(0,200,83,0.08); border: 1px solid rgba(0,200,83,0.2); color: #00c853; }
        .tool-fail { background: rgba(244,67,54,0.08); border: 1px solid rgba(244,67,54,0.2); color: #ef5350; }
        .tool-note { font-size: 11px; color: #444; text-align: center; margin-top: 10px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .step-card { background: #111120; border: 1px solid #1e1e3a; border-radius: 14px; padding: 28px; }
        .step-num { width: 40px; height: 40px; border-radius: 10px; background: #6c47ff; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; margin-bottom: 16px; }
        .step-title { font-size: 17px; font-weight: 700; color: white; margin-bottom: 8px; }
        .step-desc { font-size: 14px; color: #666; line-height: 1.65; }
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .feature-card { background: #111120; border: 1px solid #1e1e3a; border-radius: 12px; padding: 22px; }
        .feature-icon { font-size: 28px; margin-bottom: 12px; }
        .feature-title { font-size: 16px; font-weight: 700; color: white; margin-bottom: 6px; }
        .feature-desc { font-size: 13px; color: #666; line-height: 1.6; }
        .feature-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .pill { font-size: 11px; background: #1a1a2e; color: #888; padding: 3px 10px; border-radius: 20px; }
        .compare-table { width: 100%; border-collapse: separate; border-spacing: 0; background: #111120; border-radius: 14px; overflow: hidden; border: 1px solid #1e1e3a; }
        .compare-table th { padding: 16px 20px; font-size: 13px; font-weight: 700; background: #0d0d1a; }
        .compare-table th.us { color: #6c47ff; background: rgba(108,71,255,0.08); }
        .compare-table td { padding: 13px 20px; font-size: 13px; border-top: 1px solid #1a1a2a; }
        .compare-table td.feature-name { color: #ccc; font-weight: 500; }
        .yes { color: #00c853; font-weight: 700; }
        .no { color: #333; }
        .partial { color: #ff9100; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .pricing-card { background: #111120; border: 1px solid #1e1e3a; border-radius: 16px; padding: 30px; position: relative; }
        .pricing-card.featured { border-color: #6c47ff; background: rgba(108,71,255,0.05); }
        .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #6c47ff; color: white; font-size: 11px; font-weight: 700; padding: 4px 16px; border-radius: 20px; white-space: nowrap; }
        .plan-name { font-size: 14px; font-weight: 700; color: #888; letter-spacing: 1px; margin-bottom: 8px; }
        .plan-price { font-size: 46px; font-weight: 900; color: white; line-height: 1; }
        .plan-period { font-size: 13px; color: #555; margin-bottom: 24px; margin-top: 4px; }
        .plan-feature { font-size: 13px; color: #888; padding: 7px 0; border-bottom: 1px solid #1a1a2a; display: flex; gap: 8px; }
        .plan-feature span { color: #00c853; }
        .plan-btn { display: block; width: 100%; text-align: center; margin-top: 24px; padding: 13px; border-radius: 10px; font-weight: 700; font-size: 14px; background: #6c47ff; color: white; border: none; cursor: pointer; }
        .plan-btn.outline { background: transparent; border: 1.5px solid #333; color: #ccc; }
        .geo-box { background: linear-gradient(135deg, rgba(108,71,255,0.1), rgba(0,200,83,0.05)); border: 1px solid rgba(108,71,255,0.2); border-radius: 16px; padding: 40px; text-align: center; }
        .final-cta { text-align: center; padding: 80px 0; }
        footer { border-top: 1px solid #1a1a2a; padding: 32px 0; display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-size: 18px; font-weight: 900; color: white; }
        .footer-logo span { color: #6c47ff; }
        .footer-links { display: flex; gap: 24px; }
        .footer-link { font-size: 13px; color: #555; }
        .footer-link:hover { color: #888; }
        @media (max-width: 768px) {
          h1 { font-size: 36px; }
          .steps-grid, .features-grid, .pricing-grid { grid-template-columns: 1fr; }
          .stats-row { gap: 24px; }
          .nav-links { display: none; }
          .compare-table th, .compare-table td { padding: 10px 12px; font-size: 12px; }
        }
      `}</style>

      {/* NAV */}
      <div className="container">
        <nav className="nav">
          <div className="logo">Koneqti<span>SEO</span></div>
          <div className="nav-links">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#compare" className="nav-link">vs Competitors</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="/login" className="btn-outline" style={{ marginLeft: '8px' }}>Sign In</a>
            <a href="/login" className="btn-primary">Start Free</a>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <div className="container">
        <div className="hero">
          <div className="tag">🤖 AGENTIC SEO — 2026 READY</div>
          <h1>
            Stop Researching.<br />
            Start <em>Ranking.</em>
          </h1>
          <p className="hero-sub">
            KoneqtiSEO finds winning niches, writes the content, publishes across 16 platforms and monitors your rankings — all automatically. Your Chrome browser does the work. No expensive API keys.
          </p>
          <div className="cta-row">
            <a href="/login" className="btn-primary" style={{ padding: '14px 36px', fontSize: '16px' }}>Start Free — No Card Needed</a>
            <a href="#how-it-works" className="btn-outline" style={{ padding: '14px 32px', fontSize: '16px' }}>See How It Works ↓</a>
          </div>
          <div className="cta-note">Free plan available · No credit card · Setup in 5 minutes</div>
          <div className="stats-row">
            {[['16', 'Publishing Platforms'], ['1M+', 'Affiliate Keywords Mapped'], ['5', 'AI Visibility Metrics'], ['4', 'Indexing Channels']].map(([val, label]) => (
              <div className="stat-item" key={label}>
                <div className="stat-val">{val}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FREE TOOL */}
      <div className="container">
        <div className="section" style={{ paddingTop: '0' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="section-tag">FREE TOOL</div>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Is Your Page Indexed on Google?</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>Check instantly — no account needed. 3 free checks per day.</p>
          </div>
          <div className="tool-box">
            <div className="tool-label">ENTER ANY URL</div>
            <div className="tool-input-row">
              <input
                className="tool-input"
                type="url"
                placeholder="https://yoursite.com/your-article"
                value={toolUrl}
                onChange={e => setToolUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkIndex()}
              />
              <button className="tool-btn" onClick={checkIndex} disabled={toolLoading}>
                {toolLoading ? '...' : 'Check'}
              </button>
            </div>
            {toolResult && (
              <div className={`tool-result ${toolResult.error || toolResult.indexed === false ? 'tool-fail' : 'tool-ok'}`}>
                {toolResult.error
                  ? `❌ ${toolResult.error}`
                  : toolResult.indexed
                    ? '✅ This URL is indexed on Google'
                    : '⚠️ Not indexed yet — KoneqtiSEO can fix this automatically'}
              </div>
            )}
            <div className="tool-note">Rate limited to 3 free checks per IP per day. No data stored.</div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="container">
        <div id="how-it-works" className="section">
          <div className="section-tag">HOW IT WORKS</div>
          <h2>Full Pipeline. Zero Manual Work.</h2>
          <p className="section-sub">From niche idea to ranked article — everything runs on your own Chrome browser with your own accounts.</p>
          <div className="steps-grid">
            {[
              { n: '1', title: 'Find a Winning Niche', desc: 'Keyword Studio checks AI Overview presence, SERP weakness, competition DA, search volume and commission rates. You see exactly which niches are winnable before building anything.', pills: ['AI Overview Check', 'SERP Weakness', 'Commission Rates', 'PATH A/B/C Discovery'] },
              { n: '2', title: 'Build and Publish Content', desc: 'Forge writes articles with Claude, runs them through the humanizer (removes AI phrases, adds experience signals), checks originality, then publishes directly to WordPress. All automated.', pills: ['Claude CDP (Free)', 'Humanizer Pass', 'E-E-A-T Signals', 'Auto WordPress Publish'] },
              { n: '3', title: 'Off-Page and Monitor', desc: 'After publishing, the system cross-links on 16 platforms, submits to 4 indexing channels, monitors backlinks weekly and alerts you when content decays or competitors drop.', pills: ['16 Platforms', '4 Index Channels', 'Weekly Monitoring', 'Competitor Alerts'] },
            ].map(step => (
              <div className="step-card" key={step.n}>
                <div className="step-num">{step.n}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
                <div className="feature-pills" style={{ marginTop: '16px' }}>
                  {step.pills.map(p => <span className="pill" key={p}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="container">
        <div id="features" className="section">
          <div className="section-tag">FEATURES</div>
          <h2>Everything in One Platform</h2>
          <p className="section-sub">Not a reporting tool. An execution engine.</p>
          <div className="features-grid">
            {[
              { icon: '🎯', title: 'Keyword + Niche Studio', desc: '5-stage validation: AI Overview TYPE 1-5 detection, SERP DA check, monetization score, trend scoring, commission rates. Three discovery paths: broad market, site analysis, or direct input.', pills: ['AI Overview', 'PATH A/B/C', '5 Validation Stages'] },
              { icon: '✍️', title: 'AI Content Engine', desc: 'Claude writes via CDP (uses your free claude.ai — zero API cost). Humanizer removes AI phrases. Experience injector adds first-person signals. Originality check before publish.', pills: ['Claude CDP Free', 'Humanizer', 'E-E-A-T Injector', 'Originality Check'] },
              { icon: '🔗', title: '16-Platform Off-Page', desc: 'Two-round cross-linking: Round 1 on 10 social platforms, Round 2 on 9 web2 platforms with all Round 1 URLs as backlinks. Each Round 1 post gets ~9 backlinks automatically.', pills: ['LinkedIn', 'Reddit', 'Medium', '+13 more'] },
              { icon: '📍', title: 'Local Rank & Rent', desc: 'Autonomous city × niche discovery. Scans 30,000 US cities against service industries. TIER 1 opportunities (4-8 weeks to rank) identified automatically. GBP + review automation included.', pills: ['30k Cities', 'TIER 1/2/3 Scoring', 'GBP Connect', 'Review Requests'] },
              { icon: '📦', title: 'Affiliate Cluster System', desc: '10 Amazon markets, 300+ categories, 1M+ keywords pre-mapped. 8-article drip publishing per cluster. Commission rates built in. Review writer scrapes Amazon for real product data.', pills: ['10 Markets', '1M Keywords', '8-Article Clusters', 'Amazon Scraper'] },
              { icon: '🤖', title: 'AI Visibility Monitor', desc: "Monitor your brand across ChatGPT, Perplexity and Gemini. Track Share of Voice vs competitors. Detect Ghost Traffic (AI Overview stealing clicks). Find which pages AI is citing.", pills: ['Share of Voice', 'Ghost Traffic', 'Citation Monitor', 'Brand Lookup'] },
            ].map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
                <div className="feature-pills">
                  {f.pills.map(p => <span className="pill" key={p}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="container">
        <div id="compare" className="section">
          <div className="section-tag">VS COMPETITORS</div>
          <h2>They Report. We Build.</h2>
          <p className="section-sub">Every other SEO tool tells you what to do. KoneqtiSEO does it for you.</p>
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: '#666' }}>Capability</th>
                <th className="us">KoneqtiSEO</th>
                <th style={{ color: '#666' }}>Ahrefs</th>
                <th style={{ color: '#666' }}>Semrush</th>
                <th style={{ color: '#666' }}>SEOChex</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Writes content automatically', '✅ Full AI pipeline', '❌', '❌', '❌'],
                ['Publishes to WordPress', '✅ Fully automated', '❌', '❌', '❌'],
                ['Publishes to 16 platforms', '✅ Two-round system', '❌', '❌', '❌'],
                ['Uses free browser (no API cost)', '✅ Chrome CDP', '❌', '❌', '❌'],
                ['Finds niches autonomously', '✅ 3 discovery paths', '⚠️ Manual', '⚠️ Manual', '❌'],
                ['Local rank & rent system', '✅ 30k cities', '❌', '❌', '❌'],
                ['Affiliate cluster automation', '✅ 1M keywords', '❌', '❌', '❌'],
                ['AI answer monitoring', '✅ 5 metrics', '❌', '❌', '❌'],
                ['Site crawler + auto-fix', '✅ 50+ issue types', '✅', '✅', '❌'],
                ['White-label agency reports', '✅ HTML/PDF', '❌', '✅', '❌'],
                ['GHL integration', '✅ Native', '❌', '❌', '❌'],
                ['Indexing (IndexNow + GSC + social)', '✅ 4 channels', '❌', '❌', '✅ Basic'],
                ['Monthly cost for 10 sites', '✅ $149', '❌ $399+', '❌ $449+', '⚠️ Credits'],
              ].map(([feature, ...vals]) => (
                <tr key={feature}>
                  <td className="feature-name">{feature}</td>
                  {vals.map((v, i) => {
                    const cls = v.startsWith('✅') ? 'yes' : v.startsWith('❌') ? 'no' : 'partial';
                    return <td key={i} className={cls}>{v}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GEO ANGLE */}
      <div className="container">
        <div className="section" style={{ paddingTop: '0' }}>
          <div className="geo-box">
            <div className="section-tag">2026 ADVANTAGE</div>
            <h2 style={{ margin: '12px 0 12px' }}>Rank in AI Answers, Not Just Google</h2>
            <p style={{ color: '#888', fontSize: '16px', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.7 }}>
              ChatGPT, Perplexity and Copilot now answer questions directly — and cite sources. KoneqtiSEO monitors which of your pages get cited, tracks your Share of Voice vs competitors, and detects Ghost Traffic (impressions without clicks caused by AI Overviews).
            </p>
            <a href="/login" className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>Get AI Visibility Monitoring →</a>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="container">
        <div id="pricing" className="section">
          <div className="section-tag">PRICING</div>
          <h2>Start Free. Scale When You Rank.</h2>
          <p className="section-sub">No lock-in. Cancel anytime. Upgrade only when you're making money.</p>
          <div className="pricing-grid">
            {[
              { name: 'STARTER', price: '$49', period: '/month', featured: false, features: ['3 sites', '50 articles/month', 'Keyword Studio', 'Forge content engine', 'Basic off-page (10 platforms)', 'IndexNow + web archive', 'Email support'] },
              { name: 'PRO', price: '$149', period: '/month', featured: true, features: ['10 sites', '300 articles/month', 'All Starter features', 'AI Visibility Monitor', '16-platform off-page', 'Local Rank & Rent Studio', 'Affiliate Cluster System', 'API access', 'Priority support'] },
              { name: 'AGENCY', price: '$399', period: '/month', featured: false, features: ['100 sites', '2,000 articles/month', 'All Pro features', 'White-label PDF reports', 'GHL integration', 'Client portal', 'Agency dashboard', 'Dedicated support'] },
            ].map(plan => (
              <div className={`pricing-card ${plan.featured ? 'featured' : ''}`} key={plan.name}>
                {plan.featured && <div className="popular-badge">MOST POPULAR</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">{plan.price}</div>
                <div className="plan-period">{plan.period} · billed monthly</div>
                {plan.features.map(f => (
                  <div className="plan-feature" key={f}><span>✓</span> {f}</div>
                ))}
                <a href="/login" className={`plan-btn ${plan.featured ? '' : 'outline'}`}>
                  {plan.featured ? 'Get Started →' : 'Choose Plan →'}
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: '#444', fontSize: '13px', marginTop: '24px' }}>
            Need pay-per-use? Contact us for credit-based pricing.
          </p>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="container">
        <div className="final-cta">
          <div className="section-tag">GET STARTED</div>
          <h2 style={{ fontSize: '44px', marginBottom: '16px' }}>Stop Paying for Reports.<br />Start Getting Results.</h2>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Every other tool shows you the problem. KoneqtiSEO fixes it — automatically.
          </p>
          <a href="/login" className="btn-primary" style={{ padding: '16px 40px', fontSize: '17px' }}>
            Start Free Today →
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="container">
        <footer>
          <div className="footer-logo">Koneqti<span>SEO</span></div>
          <div className="footer-links">
            <a href="#features" className="footer-link">Features</a>
            <a href="#pricing" className="footer-link">Pricing</a>
            <a href="/login" className="footer-link">Sign In</a>
            <a href="/login" className="footer-link">Start Free</a>
          </div>
          <div style={{ color: '#333', fontSize: '12px' }}>© {new Date().getFullYear()} KoneqtiSEO</div>
        </footer>
      </div>
    </>
  );
}
