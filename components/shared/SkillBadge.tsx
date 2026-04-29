import { cn } from '@/lib/utils';

import { X } from 'lucide-react';

interface SkillBadgeProps {
  skill: string;
  variant?: 'default' | 'have' | 'want' | 'match';
  size?: 'sm' | 'md';
  className?: string;
  onRemove?: () => void;
}

const variantStyles = {
  default: 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-soft)]',
  have: 'bg-section-sage text-accent-matcha border-accent-matcha/20',
  want: 'bg-section-sand text-accent-mustard border-accent-mustard/20',
  match: 'bg-section-rose text-accent-rose border-accent-rose/20',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-[11px] gap-1',
  md: 'px-3.5 py-1 text-[13px] gap-1.5',
};

export function SkillBadge({ skill, variant = 'default', size = 'sm', className, onRemove }: SkillBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-lg border font-medium tracking-wide', variantStyles[variant], sizeStyles[size], className)}>
      {skill}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
          className="hover:opacity-70 transition-opacity ml-0.5 focus:outline-none"
          aria-label={`Remove ${skill}`}
        >
          <X size={size === 'sm' ? 12 : 14} />
        </button>
      )}
    </span>
  );
}
