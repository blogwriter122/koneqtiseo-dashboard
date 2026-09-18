/**
 * pages/index.js — Public Marketing Homepage + Dashboard Router
 *
 * Logged out → marketing page
 * Logged in → redirect to /dashboard
 *
 * MASTER_PLAN §25
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/api';
import Head from 'next/head';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [toolResult, setToolResult] = useState(null);
  const [toolUrl, setToolUrl] = useState('');
  const [toolLoading, setToolLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        router.push('/dashboard');
      } else {
        setChecking(false);
      }
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
      const data = await res.json();
      setToolResult(data);
    } catch (e) {
      setToolResult({ error: e.message });
    } finally { setToolLoading(false); }
  }

  if (checking) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a14', color: 'white' }}>Loading...</div>;

  const s = {
    body: { background: '#0a0a14', color: '#e0e0e0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '100vh' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', borderBottom: '1px solid #1a1a2e' },
    logo: { fontSize: '22px', fontWeight: '800', color: 'white' },
    logoSpan: { color: '#7c4dff' },
    navLinks: { display: 'flex', gap: '32px', alignItems: 'center' },
    navLink: { color: '#999', textDecoration: 'none', fontSize: '14px' },
    btnNav: { background: '#7c4dff', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', textDecoration: 'none' },
    hero: { textAlign: 'center', padding: '100px 60px 60px', maxWidth: '860px', margin: '0 auto' },
    heroTag: { display: 'inline-block', background: 'rgba(124,77,255,0.15)', color: '#7c4dff', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '24px', border: '1px solid rgba(124,77,255,0.3)' },
    h1: { fontSize: '52px', fontWeight: '900', lineHeight: 1.1, marginBottom: '24px', color: 'white' },
    h1Span: { color: '#7c4dff' },
    sub: { fontSize: '20px', color: '#888', lineHeight: 1.6, marginBottom: '40px', maxWidth: '640px', margin: '0 auto 40px' },
    ctaRow: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    btnPrimary: { background: '#7c4dff', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', textDecoration: 'none', display: 'inline-block' },
    btnSecondary: { background: 'transparent', color: 'white', border: '2px solid #333', padding: '14px 32px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', textDecoration: 'none', display: 'inline-block' },
    section: { padding: '80px 60px', maxWidth: '1100px', margin: '0 auto' },
    sectionTitle: { fontSize: '36px', fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: '12px' },
    sectionSub: { fontSize: '16px', color: '#888', textAlign: 'center', marginBottom: '48px' },
    toolBox: { background: '#1a1a2e', borderRadius: '16px', padding: '32px', maxWidth: '600px', margin: '0 auto', border: '1px solid #2a2a3e' },
    toolInput: { width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #2a2a3e', background: '#0a0a14', color: 'white', fontSize: '15px', marginBottom: '12px' },
    toolBtn: { width: '100%', background: '#7c4dff', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '15px' },
    toolResult: (ok) => ({ marginTop: '16px', padding: '14px', borderRadius: '10px', background: ok ? 'rgba(0,200,83,0.1)' : 'rgba(244,67,54,0.1)', border: `1px solid ${ok ? '#00c853' : '#f44336'}`, color: ok ? '#00c853' : '#f44336', fontWeight: '700' }),
    stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' },
    stepCard: { background: '#1a1a2e', borderRadius: '12px', padding: '28px', border: '1px solid #2a2a3e', textAlign: 'center' },
    stepNum: { width: '48px', height: '48px', borderRadius: '50%', background: '#7c4dff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', margin: '0 auto 16px' },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' },
    featureCard: { background: '#1a1a2e', borderRadius: '12px', padding: '24px', border: '1px solid #2a2a3e' },
    featureIcon: { fontSize: '32px', marginBottom: '12px' },
    featureTitle: { fontWeight: '700', color: 'white', marginBottom: '8px' },
    featureDesc: { fontSize: '14px', color: '#888', lineHeight: 1.6 },
    table: { width: '100%', borderCollapse: 'collapse', background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden' },
    th: { padding: '14px 20px', textAlign: 'center', fontWeight: '700', fontSize: '14px', background: '#0f0f1f' },
    td: { padding: '14px 20px', textAlign: 'center', fontSize: '14px', borderTop: '1px solid #2a2a3e' },
    pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' },
    pricingCard: (featured) => ({ background: featured ? '#7c4dff' : '#1a1a2e', borderRadius: '16px', padding: '32px', border: featured ? 'none' : '1px solid #2a2a3e', position: 'relative' }),
    price: { fontSize: '48px', fontWeight: '900', color: 'white', margin: '16px 0 4px' },
    priceSub: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' },
    planFeature: { fontSize: '14px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' },
    footer: { textAlign: 'center', padding: '40px', color: '#444', fontSize: '13px', borderTop: '1px solid #1a1a2e' },
  };

  return (
    <>
      <Head>
        <title>KoneqtiSEO — Agentic SEO Platform That Builds, Writes and Ranks Automatically</title>
        <meta name="description" content="Find niches, write content, publish to 16 platforms and rank on Google — all automated. Real browser, real IP, zero API cost." />
      </Head>
      <div style={s.body}>

        {/* NAV */}
        <nav style={s.nav}>
          <div style={s.logo}>Koneqti<span style={s.logoSpan}>SEO</span></div>
          <div style={s.navLinks}>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#pricing" style={s.navLink}>Pricing</a>
            <a href="#tools" style={s.navLink}>Free Tools</a>
            <a href="/login" style={s.btnNav}>Sign In</a>
          </div>
        </nav>

        {/* HERO */}
        <div style={s.hero}>
          <div style={s.heroTag}>🤖 Agentic SEO — 2026</div>
          <h1 style={s.h1}>
            SEO That <span style={s.h1Span}>Builds Sites,</span><br />
            Writes Content and<br />
            <span style={s.h1Span}>Ranks Them</span> — Automatically
          </h1>
          <p style={s.sub}>
            Research → Write → Publish to 16 platforms → Rank on Google and AI answers.
            Real browser, real IP, zero API cost. Your Chrome does the work.
          </p>
          <div style={s.ctaRow}>
            <a href="/login" style={s.btnPrimary}>Start Free →</a>
            <a href="#how-it-works" style={s.btnSecondary}>See How It Works</a>
          </div>
        </div>

        {/* FREE TOOL */}
        <div id="tools" style={{ ...s.section, paddingTop: '20px' }}>
          <div style={s.sectionTitle}>Check If Your URL Is Indexed</div>
          <div style={s.sectionSub}>Free — no account needed. 3 checks per day.</div>
          <div style={s.toolBox}>
            <input
              style={s.toolInput}
              type="url"
              placeholder="https://yoursite.com/your-article"
              value={toolUrl}
              onChange={e => setToolUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkIndex()}
            />
            <button style={s.toolBtn} onClick={checkIndex} disabled={toolLoading}>
              {toolLoading ? 'Checking...' : '🔍 Check Indexing'}
            </button>
            {toolResult && (
              <div style={s.toolResult(!toolResult.error && toolResult.indexed !== false)}>
                {toolResult.error
                  ? `❌ Error: ${toolResult.error}`
                  : toolResult.indexed
                    ? '✅ This URL is indexed on Google'
                    : '⚠️ Not indexed yet — submit to search engines below'}
              </div>
            )}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div id="how-it-works" style={s.section}>
          <div style={s.sectionTitle}>How It Works</div>
          <div style={s.sectionSub}>Three steps from zero to ranking</div>
          <div style={s.stepsGrid}>
            {[
              { num: '1', title: 'Find Your Niche', desc: 'Keyword Studio validates niches: AI Overview check, SERP weakness, competition score. No guessing.' },
              { num: '2', title: 'Build Your Site', desc: 'Forge writes articles with Claude, humanizes them, publishes to WordPress. All automated.' },
              { num: '3', title: 'Rank and Earn', desc: 'Off-page on 16 platforms, indexing on 4 channels, weekly monitoring. Revenue follows.' },
            ].map(step => (
              <div key={step.num} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                <div style={{ fontWeight: '700', color: 'white', fontSize: '18px', marginBottom: '10px' }}>{step.title}</div>
                <div style={{ color: '#888', fontSize: '14px', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div id="features" style={s.section}>
          <div style={s.sectionTitle}>Everything You Need</div>
          <div style={s.sectionSub}>Not just reporting — we actually build and rank</div>
          <div style={s.featuresGrid}>
            {[
              { icon: '🎯', title: 'Niche Studio', desc: 'Find + validate niches. AI Overview detection, SERP weakness scoring, commission rates.' },
              { icon: '✍️', title: 'AI Writer', desc: 'Claude writes, humanizer removes AI phrases, experience injector adds E-E-A-T signals.' },
              { icon: '📡', title: '16 Platforms', desc: 'LinkedIn, Reddit, Medium, Blogger, Google Sites + 11 more. Two-round cross-linking.' },
              { icon: '📍', title: 'Local Studio', desc: 'City × niche matrix. Autonomous TIER 1 opportunity discovery. Rank & rent model.' },
              { icon: '📦', title: 'Affiliate Clusters', desc: '1M keywords pre-mapped across 10 Amazon markets. 8-article drip publishing per cluster.' },
              { icon: '🤖', title: 'AI Visibility', desc: 'Monitor ChatGPT/Perplexity citations. Share of Voice. Ghost traffic detection.' },
            ].map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Why KoneqtiSEO?</div>
          <div style={s.sectionSub}>We build. They report.</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, textAlign: 'left' }}>Feature</th>
                <th style={{ ...s.th, color: '#7c4dff' }}>KoneqtiSEO</th>
                <th style={s.th}>Ahrefs</th>
                <th style={s.th}>Semrush</th>
                <th style={s.th}>SEOChex</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Writes content for you', '✅', '❌', '❌', '❌'],
                ['Publishes to 16 platforms', '✅', '❌', '❌', '❌'],
                ['Uses your browser (free)', '✅', '❌', '❌', '❌'],
                ['Local rank & rent system', '✅', '❌', '❌', '❌'],
                ['AI answer monitoring', '✅', '❌', '❌', '❌'],
                ['Affiliate cluster system', '✅', '❌', '❌', '❌'],
                ['Agency white-label', '✅', '❌', '✅', '❌'],
                ['Keyword research', '✅', '✅', '✅', '⚠️'],
              ].map(([feature, ...vals]) => (
                <tr key={feature}>
                  <td style={{ ...s.td, textAlign: 'left', color: '#ccc' }}>{feature}</td>
                  {vals.map((v, i) => (
                    <td key={i} style={{ ...s.td, color: v === '✅' ? '#00c853' : v === '❌' ? '#444' : '#ff9100', fontWeight: v === '✅' ? '700' : '400' }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PRICING */}
        <div id="pricing" style={s.section}>
          <div style={s.sectionTitle}>Simple Pricing</div>
          <div style={s.sectionSub}>Start free. Scale when you rank.</div>
          <div style={s.pricingGrid}>
            {[
              { name: 'Starter', price: '$49', period: '/month', features: ['3 sites', '50 articles/month', 'Keyword Studio', 'Forge engine', 'Basic off-page'], featured: false },
              { name: 'Pro', price: '$149', period: '/month', features: ['10 sites', '300 articles/month', 'All engines', 'AI Visibility monitor', 'API access', 'Priority support'], featured: true },
              { name: 'Agency', price: '$399', period: '/month', features: ['100 sites', '2000 articles/month', 'White-label reports', 'GHL integration', 'Client portal', 'Dedicated support'], featured: false },
            ].map(plan => (
              <div key={plan.name} style={s.pricingCard(plan.featured)}>
                {plan.featured && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#00c853', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>MOST POPULAR</div>}
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{plan.name}</div>
                <div style={s.price}>{plan.price}</div>
                <div style={s.priceSub}>{plan.period}</div>
                {plan.features.map(f => (
                  <div key={f} style={s.planFeature}><span style={{ color: '#00c853' }}>✓</span> {f}</div>
                ))}
                <a href="/login" style={{ ...s.btnPrimary, display: 'block', textAlign: 'center', marginTop: '24px', background: plan.featured ? 'white' : '#7c4dff', color: plan.featured ? '#7c4dff' : 'white' }}>
                  Get Started →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={s.footer}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
            Koneqti<span style={{ color: '#7c4dff' }}>SEO</span>
          </div>
          <div>Agentic SEO Platform — © {new Date().getFullYear()} KoneqtiSEO</div>
          <div style={{ marginTop: '8px' }}>
            <a href="/login" style={{ color: '#7c4dff', marginRight: '16px' }}>Sign In</a>
            <a href="/login" style={{ color: '#7c4dff' }}>Start Free</a>
          </div>
        </div>
      </div>
    </>
  );
}
