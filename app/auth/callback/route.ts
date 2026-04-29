import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Auth Callback Error (code):', error);
  }

  // Handle Magic Links via token_hash (New Supabase Default)
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as any;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Auth Callback Error (token_hash):', error);
  }

  // If neither code nor token_hash is in the query params, it might be an implicit flow (hash based).
  // Return a client-side script to handle hash parsing.
  return new NextResponse(
    `
    <html>
      <head>
        <script>
          window.onload = function() {
            var hash = window.location.hash;
            if (hash && hash.includes('access_token=')) {
              // The Supabase client on the login or dashboard page will parse this automatically.
              window.location.replace('/dashboard' + hash);
            } else {
              window.location.replace('/login?error=auth_failed_invalid_link');
            }
          }
        </script>
      </head>
      <body>Authenticating...</body>
    </html>
    `,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
