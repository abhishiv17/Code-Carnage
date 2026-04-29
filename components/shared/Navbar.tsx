'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GradientButton } from '@/components/shared/GradientButton';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Stats', href: '#stats' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass py-3 border-x-0 border-t-0 border-b border-[var(--border-soft)] shadow-sm'
          : 'bg-transparent py-5 border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-5xl px-6 flex items-center justify-between">
        <Link href={ROUTES.home} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-matcha to-accent-slate flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
            <span className="text-white font-heading font-bold text-sm">S</span>
          </div>
          <span className="font-heading font-bold text-lg text-[var(--text-primary)]">
            {APP_NAME}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors tracking-wide">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href={ROUTES.login}>
            <GradientButton variant="ghost" size="sm">Log in</GradientButton>
          </Link>
          <Link href={ROUTES.signup}>
            <GradientButton size="sm">Get Started</GradientButton>
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button className="text-[var(--text-primary)] p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mx-4 mt-2 rounded-2xl glass p-5 flex flex-col gap-3 animate-fade-in shadow-lg">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm text-[var(--text-secondary)] py-2 font-medium">{link.label}</a>
          ))}
          <hr className="border-[var(--border-soft)]" />
          <Link href={ROUTES.login} onClick={() => setMobileOpen(false)}>
            <GradientButton variant="ghost" size="sm" className="w-full">Log in</GradientButton>
          </Link>
          <Link href={ROUTES.signup} onClick={() => setMobileOpen(false)}>
            <GradientButton size="sm" className="w-full">Get Started</GradientButton>
          </Link>
        </div>
      )}
    </nav>
  );
}
