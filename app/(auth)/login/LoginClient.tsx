'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { Eye, EyeOff, Mail, Lock, Loader2, Github, Wand2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'password' | 'magic';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      toast.error('Authentication failed. Please try logging in again.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
          toast.error(error.message);
        } else {
          setMagicLinkSent(true);
          toast.success('Magic link sent! Check your inbox.');
        }
        return;
      }

      // Password login
      if (!password) {
        toast.error('Please enter your password');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        router.push(ROUTES.dashboard);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while logging in. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
<<<<<<< HEAD
=======
      return;
    }

    // Password login
    if (!password) {
      toast.error('Please enter your password');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      router.refresh();
      window.location.href = ROUTES.dashboard;
>>>>>>> 1b851afdfcf73d0312eff70d76e58b2686fe4f83
    }
  };

  const handleGitHubLogin = async () => {
    setOauthLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GitHub login failed. Please try again.';
      toast.error(message);
    } finally {
      setOauthLoading(false);
    }
  };

  // Magic link sent confirmation screen
  if (magicLinkSent) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-accent-violet/8 blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center">
            <Mail size={28} className="text-accent-violet" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
            Check your email
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            We sent a magic link to <strong className="text-[var(--text-primary)]">{email}</strong>.
            <br />Click the link in your email to sign in.
          </p>
          <GlassCard padding="md" className="mb-4">
            <p className="text-xs text-[var(--text-muted)]">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button onClick={() => { setMagicLinkSent(false); setLoading(false); }} className="text-accent-violet hover:underline font-medium">
                try again
              </button>
            </p>
          </GlassCard>
          <button
            onClick={() => { setMagicLinkSent(false); setMode('password'); }}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-accent-violet/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-accent-amber/6 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={ROUTES.home} className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-amber via-accent-coral to-accent-violet flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">S</span>
            </div>
            <span className="font-heading font-bold text-xl text-[var(--text-primary)]">{APP_NAME}</span>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Log in to continue swapping skills
          </p>
        </div>

        {/* GitHub OAuth */}
        <button
          onClick={handleGitHubLogin}
          disabled={oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-4 rounded-xl bg-[#24292f] hover:bg-[#2f363d] text-white text-sm font-medium transition-all disabled:opacity-60"
        >
          {oauthLoading ? <Loader2 size={18} className="animate-spin" /> : <Github size={18} />}
          Continue with GitHub
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[var(--glass-border)]" />
          <span className="text-xs text-[var(--text-muted)] font-medium">or</span>
          <div className="flex-1 h-px bg-[var(--glass-border)]" />
        </div>

        {/* Auth mode toggle */}
        <div className="flex rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] p-1 mb-4">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'password'
                ? 'bg-[var(--glass-bg)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Lock size={13} /> Password
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'magic'
                ? 'bg-[var(--glass-bg)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Wand2 size={13} /> Magic Link
          </button>
        </div>

        <GlassCard padding="lg" className="mb-6">
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
                />
              </div>
            </div>

            {/* Password — only in password mode */}
            {mode === 'password' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Magic link info */}
            {mode === 'magic' && (
              <p className="text-xs text-[var(--text-muted)] bg-accent-violet/5 border border-accent-violet/10 rounded-lg px-3 py-2">
                ✨ We&apos;ll send a secure link to your email — no password needed!
              </p>
            )}

            {/* Submit */}
            <GradientButton className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> {mode === 'magic' ? 'Sending link...' : 'Logging in...'}</>
              ) : (
                mode === 'magic' ? '✨ Send Magic Link' : 'Log in'
              )}
            </GradientButton>
          </form>
        </GlassCard>

        {/* Signup link */}
        <p className="text-center text-sm text-[var(--text-muted)]">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.signup} className="text-accent-violet font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
