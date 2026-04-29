import Link from 'next/link';
import { APP_NAME, ROUTES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-matcha to-accent-slate flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xs">S</span>
              </div>
              <span className="font-heading font-bold text-base text-[var(--text-primary)]">
                {APP_NAME}
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Swap skills, not cash. The peer-to-peer learning platform built for college students.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-[var(--text-primary)] mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link href={ROUTES.dashboard} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Marketplace</Link></li>
              <li><Link href={ROUTES.matches} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Find Matches</Link></li>
              <li><Link href={ROUTES.sessions} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Sessions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-[var(--text-primary)] mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-[var(--text-muted)]">How It Works</span></li>
              <li><span className="text-sm text-[var(--text-muted)]">Skill Credits</span></li>
              <li><span className="text-sm text-[var(--text-muted)]">Community Guidelines</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-[var(--text-primary)] mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-[var(--text-muted)]">Privacy Policy</span></li>
              <li><span className="text-sm text-[var(--text-muted)]">Terms of Service</span></li>
              <li><span className="text-sm text-[var(--text-muted)]">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-soft)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © 2026 {APP_NAME}. Built with ❤️ for college students.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--text-muted)]">Made for mind2i PS-18</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
