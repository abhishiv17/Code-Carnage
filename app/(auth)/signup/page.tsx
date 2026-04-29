'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-coral/8 blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-accent-violet/6 blur-[100px]" />
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
            Join SkillSwap
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Create your account and start swapping skills today
          </p>
        </div>

        <GlassCard padding="lg" className="mb-6">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Arjun Raghavan"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                College Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  placeholder="you@college.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
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

            {/* Submit */}
            <Link href={ROUTES.onboarding}>
              <GradientButton className="w-full" size="lg">
                Create Account
              </GradientButton>
            </Link>
          </form>
        </GlassCard>

        {/* Login link */}
        <p className="text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link href={ROUTES.login} className="text-accent-violet font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
