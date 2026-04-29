import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Use the standard Supabase JS client — stores auth in localStorage only, NO cookies.
// Cookies were only needed for middleware-based server-side session sync, which is removed.

let browserClient: SupabaseClient | null = null;

export const createClient = () => {
  // If running on the server (though this file shouldn't be), always return a new instance
  if (typeof window === 'undefined') {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // On the browser, use a singleton to prevent multiple instances competing for the session lock
  // which causes "AbortError: Lock broken by another request with the 'steal' option."
  if (!browserClient) {
    browserClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
};
