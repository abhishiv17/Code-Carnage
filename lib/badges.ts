// Badge definitions mirrored from the database seed
// Used for client-side rendering without fetching the badges table every time

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'sessions' | 'rating' | 'community' | 'profile';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: BadgeDefinition[] = [
  { id: 'first-steps',   name: 'First Steps',    description: 'Complete your onboarding',           icon: '🌱', category: 'profile',   rarity: 'common' },
  { id: 'first-session', name: 'First Session',   description: 'Complete your first session',        icon: '🎓', category: 'sessions',  rarity: 'common' },
  { id: 'on-fire',       name: 'On Fire',         description: 'Complete 5 sessions',                icon: '🔥', category: 'sessions',  rarity: 'rare' },
  { id: 'veteran',       name: 'Veteran',         description: 'Complete 20 sessions',               icon: '👑', category: 'sessions',  rarity: 'epic' },
  { id: 'centurion',     name: 'Centurion',       description: 'Complete 50 sessions',               icon: '💯', category: 'sessions',  rarity: 'legendary' },
  { id: 'top-rated',     name: 'Top Rated',       description: 'Achieve an average rating of 4.5+',  icon: '⭐', category: 'rating',    rarity: 'epic' },
  { id: 'five-star',     name: 'Five Star',       description: 'Receive a perfect 5-star review',    icon: '🌟', category: 'rating',    rarity: 'rare' },
  { id: 'helper',        name: 'Campus Helper',   description: 'Help 3 campus feed requests',        icon: '💎', category: 'community', rarity: 'rare' },
  { id: 'super-helper',  name: 'Super Helper',    description: 'Help 10 campus feed requests',       icon: '🦸', category: 'community', rarity: 'epic' },
  { id: 'reviewer',      name: 'Thoughtful',      description: 'Write 5 reviews for peers',          icon: '📝', category: 'community', rarity: 'common' },
  { id: 'mentor',        name: 'Mentor',          description: 'Teach 3 different skills',           icon: '🎯', category: 'sessions',  rarity: 'rare' },
  { id: 'polyglot',      name: 'Polyglot',        description: 'Teach 5 different skills',           icon: '🧠', category: 'sessions',  rarity: 'epic' },
  { id: 'credit-king',   name: 'Credit King',     description: 'Earn 25 credits',                    icon: '💰', category: 'sessions',  rarity: 'rare' },
  { id: 'wealthy',       name: 'Wealthy',         description: 'Earn 100 credits',                   icon: '🏦', category: 'sessions',  rarity: 'legendary' },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common:    { bg: 'bg-slate-500/10',   border: 'border-slate-400/20',   text: 'text-slate-300',   glow: '' },
  rare:      { bg: 'bg-blue-500/10',    border: 'border-blue-400/20',    text: 'text-blue-400',    glow: 'shadow-blue-500/10' },
  epic:      { bg: 'bg-purple-500/10',  border: 'border-purple-400/20',  text: 'text-purple-400',  glow: 'shadow-purple-500/10' },
  legendary: { bg: 'bg-amber-500/10',   border: 'border-amber-400/20',   text: 'text-amber-400',   glow: 'shadow-amber-500/10' },
};

// Milestone definitions — computed from profile stats, no DB table needed
export interface Milestone {
  id: string;
  label: string;
  icon: string;
  category: string;
  thresholds: number[];
  unit: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'sessions',  label: 'Sessions Completed', icon: '🎓', category: 'sessions', thresholds: [1, 5, 10, 25, 50], unit: 'sessions' },
  { id: 'credits',   label: 'Credits Earned',     icon: '💰', category: 'credits',  thresholds: [10, 25, 50, 100],   unit: 'credits' },
  { id: 'reviews',   label: 'Reviews Given',       icon: '📝', category: 'reviews',  thresholds: [1, 5, 10, 25],      unit: 'reviews' },
  { id: 'skills',    label: 'Skills Teaching',      icon: '🎯', category: 'skills',   thresholds: [1, 3, 5, 10],       unit: 'skills' },
];
