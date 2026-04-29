import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { PLATFORM_STATS } from '@/lib/mock-data';
import { UserPlus, Sparkles, Video, Star, Users } from 'lucide-react';

const steps = [
  { number: '01', icon: UserPlus, title: 'Create Your Profile', description: 'Sign up and list the skills you have and the skills you want to learn.', color: 'text-accent-matcha', bg: 'bg-section-sage' },
  { number: '02', icon: Sparkles, title: 'Get AI Matches & Prep', description: 'Our engine finds compatible students. Need extra prep? Ask the integrated AI tutor for help.', color: 'text-accent-slate', bg: 'bg-section-surface' },
  { number: '03', icon: Users, title: 'Connect & Chat', description: 'Send a follow request. Once accepted, securely chat, share voice notes, and swap files.', color: 'text-accent-violet', bg: 'bg-section-sand' },
  { number: '04', icon: Video, title: 'Jump Into a Session', description: 'Schedule a live video call. Teach one hour, learn one hour. Credits flow automatically.', color: 'text-accent-rose', bg: 'bg-section-rose' },
];

const stats = [
  { value: PLATFORM_STATS.totalUsers, suffix: '+', label: 'Students' },
  { value: PLATFORM_STATS.totalSessions, suffix: '+', label: 'Sessions' },
  { value: PLATFORM_STATS.skillsListed, suffix: '+', label: 'Skills Listed' },
  { value: PLATFORM_STATS.avgRating, suffix: '', label: 'Avg Rating', decimals: 1, prefix: '⭐ ' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-accent-matcha mb-4 block">
            How It Works
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[var(--text-primary)] leading-tight">
            Four steps to your
            <br />
            <span className="gradient-text">first skill swap</span>
          </h2>
        </div>

        {/* Steps — vertical timeline, no cards */}
        <div className="relative max-w-2xl mx-auto mb-24">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-accent-matcha/30 via-accent-slate/30 to-accent-mustard/30" />

          <div className="space-y-14">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="stagger-in relative flex items-start gap-8 group">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={20} className={step.color} />
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <span className="text-[11px] font-heading font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mb-1 block">
                      Step {step.number}
                    </span>
                    <h3 className="font-heading font-semibold text-lg text-[var(--text-primary)] mb-2 group-hover:text-accent-matcha transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats — no card, just numbers on a tinted background strip */}
        <div id="stats" className="bg-section-surface rounded-3xl py-12 px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-3xl sm:text-4xl font-bold gradient-text mb-1">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                    prefix={stat.prefix}
                  />
                </div>
                <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
