import { cn } from '@/lib/utils';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-3.5 text-[15px]',
};

export function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        'relative z-10 font-heading font-semibold rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 tracking-wide',
        sizeMap[size],
        variant === 'primary' && [
          'bg-gradient-to-r from-accent-matcha to-accent-slate',
          'text-white',
          'shadow-md shadow-accent-matcha/15',
          'hover:shadow-lg hover:shadow-accent-slate/20 hover:brightness-105',
          'active:scale-[0.97]',
        ],
        variant === 'outline' && [
          'bg-transparent border-2 border-[var(--border-soft)]',
          'text-[var(--text-primary)]',
          'hover:bg-section-surface hover:border-accent-matcha/30',
          'active:scale-[0.97]',
        ],
        variant === 'ghost' && [
          'bg-transparent text-[var(--text-secondary)]',
          'hover:text-[var(--text-primary)] hover:bg-[var(--bg-warm)]',
        ],
        disabled && 'opacity-40 pointer-events-none',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
