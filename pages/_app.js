/**
 * pages/_app.js — App wrapper
 *
 * Handles:
 *   1. Auth protection — redirect to /login if not logged in
 *   2. NO Layout wrapper here — each page has its own Layout
 *      (pages that don't need layout: index, login)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { supabase } from '../lib/api';

// Pages that don't require auth
const PUBLIC_PAGES = ['/', '/login'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth on mount
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session;
      setUser(session?.user || null);
      setAuthChecked(true);

      const isPublic = PUBLIC_PAGES.includes(router.pathname);

      if (!session && !isPublic) {
        router.push('/login');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
      if (event === 'SIGNED_IN') {
        if (PUBLIC_PAGES.includes(router.pathname)) {
          router.push('/dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't render until auth is checked (prevents flash)
  if (!authChecked) {
    return (
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center',
        justifyContent: 'center', background: '#09090f', color: '#666',
        fontFamily: 'system-ui', fontSize: '14px',
      }}>
        Loading...
      </div>
    );
  }

  // Public pages render without auth
  if (PUBLIC_PAGES.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  // Protected pages — user must be logged in
  if (!user) {
    return null; // router.push('/login') is already triggered
  }

  // Render page — NO Layout wrapper here, each page handles its own Layout
  return <Component {...pageProps} />;
}
