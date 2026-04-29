import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: string;
  variant?: 'default' | 'have' | 'want' | 'match';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-soft)]',
  have: 'bg-section-sage text-accent-matcha border-accent-matcha/20',
  want: 'bg-section-sand text-accent-mustard border-accent-mustard/20',
  match: 'bg-section-rose text-accent-rose border-accent-rose/20',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-[11px]',
  md: 'px-3.5 py-1 text-[13px]',
};

export function SkillBadge({ skill, variant = 'default', size = 'sm', className }: SkillBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-lg border font-medium tracking-wide', variantStyles[variant], sizeStyles[size], className)}>
      {skill}
    </span>
  );
}
