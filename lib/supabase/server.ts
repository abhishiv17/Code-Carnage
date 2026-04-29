import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Server-side Supabase client for API routes.
// Reads the auth token from the Authorization header (sent by the browser client).
// No cookies needed — works with the cookie-free browser client.
export const createClient = async () => {
  const headerStore = await headers();
  const authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    }
  );

  return client;
};
