'use client';

import { Coins } from 'lucide-react';
import { CURRENT_USER } from '@/lib/mock-data';

export function CreditBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass gradient-border shimmer">
      <Coins size={16} className="text-accent-amber" />
      <span className="font-heading font-bold text-lg text-accent-amber">
        {CURRENT_USER.credits}
      </span>
      <span className="text-xs text-[var(--text-muted)] font-medium">credits</span>
    </div>
  );
}
