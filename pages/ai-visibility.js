/**
 * pages/ai-visibility.js — AI Visibility (redirect to /forge/ai_visibility)
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AIVisibilityRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/forge/ai_visibility'); }, []);
  return null;
}
