/**
 * pages/_app.js — Minimal, no Supabase calls
 */
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
