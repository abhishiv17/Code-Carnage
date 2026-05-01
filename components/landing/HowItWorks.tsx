'use client';

import { useState, useEffect } from 'react';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { UserPlus, Sparkles, Video, Star, Users, Award, MessageCircle } from 'lucide-react';

const steps = [
  { number: '01', icon: UserPlus, title: 'Build Your Profile', description: 'List your skills and background. Our Llama 3.1 AI will suggest what you should learn next.', color: 'text-accent-matcha', bg: 'bg-section-sage' },
  { number: '02', icon: Users, title: 'Connect & Engage', description: 'Join the Community Forum to discuss topics or find matches directly in the Marketplace.', color: 'text-accent-violet', bg: 'bg-section-sand' },
  { number: '03', icon: Video, title: 'Learn & Teach', description: 'Jump into integrated video sessions. Share resources, earn credits, and master new skills.', color: 'text-accent-rose', bg: 'bg-section-rose' },
  { number: '04', icon: Award, title: 'Unlock Badges', description: 'Climb the leaderboard, unlock unique badges, and celebrate your growth milestones.', color: 'text-accent-amber', bg: 'bg-section-surface' },
];

export function HowItWorks() {
  const [stats, setStats] = useState([
    { value: 0, suffix: '+', label: 'Students' },
    { value: 0, suffix: '+', label: 'Sessions' },
    { value: 0, suffix: '+', label: 'Skills Listed' },
    { value: 0, suffix: '', label: 'Avg Rating', decimals: 1, prefix: '⭐ ' },
  ]);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats([
          { value: data.users || 0, suffix: '+', label: 'Students' },
          { value: data.sessions || 0, suffix: '+', label: 'Sessions' },
          { value: data.skills || 0, suffix: '+', label: 'Skills Listed' },
          { value: data.avgRating || 4.7, suffix: '', label: 'Avg Rating', decimals: 1, prefix: '⭐ ' },
        ]);
      })
      .catch(() => {});
  }, []);

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

        {/* Stats — dynamic from database */}
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
