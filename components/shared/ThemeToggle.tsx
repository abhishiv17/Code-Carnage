'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-9 h-9 rounded-xl border border-[var(--border-soft)]", className)} />;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300',
        'border border-[var(--border-soft)] text-[var(--text-secondary)]',
        'hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]',
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun className={cn("h-[1.15rem] w-[1.15rem] transition-all absolute", isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")} />
      <Moon className={cn("h-[1.15rem] w-[1.15rem] transition-all absolute", isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0")} />
    </button>
  );
}
