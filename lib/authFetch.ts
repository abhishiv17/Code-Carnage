import { createClient } from '@/lib/supabase/client';

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Supabase access token as a Bearer token
 * in the Authorization header so server API routes can identify the user.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  // Ensure JSON content type for POST/PUT/PATCH/DELETE with body
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, { ...options, headers });
}
