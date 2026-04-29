import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use the standard Supabase JS client — stores auth in localStorage only, NO cookies.
// Cookies were only needed for middleware-based server-side session sync, which is removed.
export const createClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
