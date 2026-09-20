import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { api } from '../lib/api';

const NAV = [
  { section: null, items: [
    { href: '/dashboard', icon: '◆', label: 'Overview', engine: 'overview' },
    { href: '/jobs', icon: '⊟', label: 'Job Queue', engine: 'overview' },
    { href: '/bots', icon: '◉', label: 'Bot Status', engine: 'overview' },
    { href: '/config', icon: '⚙', label: 'System Config', engine: 'overview' },
    { href: '/settings', icon: '🔑', label: 'Settings & Launcher', engine: 'overview' },
    { href: '/admin', icon: '⚙️', label: 'Admin', engine: 'overview' },
  ]},
  { section: 'STUDIO', color: 'studio', items: [
    { href: '/studio', icon: '🎯', label: 'Niche Studio', engine: 'studio' },
    { href: '/local', icon: '📍', label: 'Local Studio', engine: 'studio' },
    { href: '/campaign', icon: '🚀', label: 'Campaigns', engine: 'studio' },
    { href: '/audit', icon: '🕷️', label: 'Site Audit', engine: 'studio' },
    { href: '/reports', icon: '📄', label: 'Reports', engine: 'studio' },
    { href: '/agencies', icon: '🏢', label: 'Agencies', engine: 'studio' },
  ]},
  { section: 'FORGE', color: 'forge', items: [
    { href: '/forge/nichefinder', icon: '🔍', label: 'Niche Finder', engine: 'forge' },
    { href: '/forge/quickwrite', icon: '✎', label: 'Quick Write', engine: 'forge' },
    { href: '/forge/research',   icon: '⊕', label: 'Research',    engine: 'forge' },
    { href: '/forge/sites',      icon: '⬡', label: 'Sites',       engine: 'forge' },
    { href: '/forge/content',    icon: '▤', label: 'Content',     engine: 'forge' },
    { href: '/forge/monitor',    icon: '⚙', label: 'Monitor',     engine: 'forge' },
    { href: '/forge/gsc',       icon: '📊', label: 'GSC Intel',   engine: 'forge' },
    { href: '/forge/ai_visibility', icon: '🤖', label: 'AI Visibility', engine: 'forge' },
    { href: '/offpage',          icon: '🔗', label: 'Off-Page Hub', engine: 'forge' },
    { href: '/forge/ecommerce',  icon: '🏪', label: 'Ecommerce',  engine: 'forge' },
    { href: '/forge/clusters',   icon: '📦', label: 'Clusters',   engine: 'forge' },
  ]},
  { section: 'REACH', color: 'reach', items: [
    { href: '/reach/campaigns',  icon: '⇶', label: 'Campaigns',   engine: 'reach' },
    { href: '/reach/moneypages', icon: '💰', label: 'Money Pages', engine: 'reach' },
    { href: '/profiles',         icon: '🔐', label: 'Profiles',    engine: 'reach' },
    { href: '/reach/accounts',   icon: '◉', label: 'Accounts',    engine: 'reach' },
    { href: '/reach/trends',     icon: '⚡', label: 'Trends',     engine: 'reach' },
    { href: '/reach/tools',      icon: '⚒', label: 'Tools',      engine: 'reach' },
    { href: '/reach/keywords',   icon: '🔑', label: 'Keywords',   engine: 'reach' },
    { href: '/reach/analytics',  icon: '📊', label: 'Analytics',  engine: 'reach' },
  ]},
  { section: 'LOCALE', color: 'locale', items: [
    { href: '/locale/scorer',    icon: '◎', label: 'Niche Scorer', engine: 'locale' },
    { href: '/locale/research',  icon: '⊕', label: 'Research',    engine: 'locale' },
    { href: '/locale/sites',     icon: '📍', label: 'Local Sites', engine: 'locale' },
    { href: '/locale/geogrid',   icon: '🗺️', label: 'Geo-Grid',   engine: 'locale' },
    { href: '/locale/citations', icon: '◻', label: 'Citations',   engine: 'locale' },
    { href: '/locale/rankings',  icon: '📈', label: 'Rankings',   engine: 'locale' },
    { href: '/locale/agency',    icon: '◈', label: 'Agency',      engine: 'locale' },
  ]},
];

export default function Layout({ children }) {
  const router = useRouter();
  const { data: health } = useSWR('health', () => api.health().catch(() => null), { refreshInterval: 15000 });
  const online = !!health?.ok;

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/"><div className="logo">Koneqti<span className="r">SEO</span></div></Link>
        <div className="logo-sub">Agentic SEO Platform</div>

        {NAV.map((group, gi) => (
          <div className="nav-group" key={gi}>
            {group.section && (
              <div className="nav-group-label">
                <span className={group.color} />
                {group.section}
              </div>
            )}
            {group.items.map(n => {
              const active = router.pathname === n.href || router.pathname.startsWith(n.href + '/');
              return (
                <Link key={n.href} href={n.href}
                  className={`nav-item ${active ? `active ${n.engine}` : ''}`}>
                  <span className="nav-icon">{n.icon}</span>
                  {n.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="nav-spacer" />
        <div className="flex" style={{ fontSize: 11, color: 'var(--text-faint)', padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: online ? 'var(--go)' : 'var(--skip)', boxShadow: online ? '0 0 6px var(--go)' : 'none', display: 'inline-block' }} />
          Engine {online ? 'online' : 'offline'}
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
