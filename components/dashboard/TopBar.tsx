'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { Search, Bell, Coins } from 'lucide-react';

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useUser();

  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--glass-border)] px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search skills, students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Credits */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-amber/10 border border-accent-amber/20">
            <Coins size={16} className="text-accent-amber" />
            <span className="text-sm font-heading font-semibold text-accent-amber">
              {profile?.credits ?? 0}
            </span>
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-coral" />
          </button>

          {/* User avatar */}
          <Image
            src={avatarUrl}
            alt={profile?.username || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full bg-[var(--bg-surface-solid)] cursor-pointer hover:ring-2 hover:ring-accent-violet/30 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
