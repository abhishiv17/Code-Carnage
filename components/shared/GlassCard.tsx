import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  elevation?: 'flat' | 'raised' | 'inset';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const elevationMap = {
  flat: 'glass',
  raised: 'glass-raised',
  inset: 'glass-inset',
};

export function GlassCard({
  children,
  className,
  hover = false,
  gradient = false,
  elevation = 'flat',
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        elevationMap[elevation],
        paddingMap[padding],
        hover && 'glass-hover cursor-pointer hover-lift',
        gradient && 'gradient-border',
        className
      )}
    >
      {children}
    </div>
  );
}
