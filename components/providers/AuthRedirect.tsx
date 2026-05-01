'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * AuthRedirect — detects Supabase implicit-flow tokens in the URL hash
 * (e.g. #access_token=...) and redirects the user to the dashboard once
 * the session is established.
 *
 * This handles both GitHub OAuth and Magic Link flows, which return
 * tokens as a hash fragment that server-side routes cannot read.
 */
export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Only run on the client and only if hash contains auth tokens
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) return;

    const supabase = createClient();

    // The Supabase client auto-detects the hash and sets the session
    // via `detectSessionInUrl: true` (default). We just need to wait
    // for it to finish, then redirect.
    const handleRedirect = async () => {
      // Give the Supabase client a moment to process the hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('AuthRedirect: Error getting session from hash', error);
        return;
      }

      if (session) {
        // Clean the hash from the URL and redirect to dashboard
        window.location.replace('/dashboard');
      } else {
        // If session isn't ready yet, listen for the auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              window.location.replace('/dashboard');
            }
          }
        );

        // Timeout cleanup — don't wait forever
        setTimeout(() => {
          subscription.unsubscribe();
        }, 10000);
      }
    };

    handleRedirect();
  }, [router]);

  return null;
}
