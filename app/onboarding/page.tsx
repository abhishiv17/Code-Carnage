'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { SKILL_CATEGORIES, ALL_SKILLS, ROUTES } from '@/lib/constants';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'have' | 'want' | 'confirm';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('have');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [skillsHave, setSkillsHave] = useState<string[]>([]);
  const [skillsWant, setSkillsWant] = useState<string[]>([]);

  const currentSkills = step === 'have' ? skillsHave : skillsWant;
  const setCurrentSkills = step === 'have' ? setSkillsHave : setSkillsWant;

  const toggleSkill = (skillName: string) => {
    setCurrentSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  const filteredSkills = selectedCategory
    ? ALL_SKILLS.filter((s) => s.category === selectedCategory)
    : ALL_SKILLS;

  const stepConfig = {
    have: {
      title: 'What can you teach?',
      subtitle: 'Select skills you\'re confident teaching to peers',
      badge: 'have' as const,
    },
    want: {
      title: 'What do you want to learn?',
      subtitle: 'Pick skills you\'d love to pick up from fellow students',
      badge: 'want' as const,
    },
    confirm: {
      title: 'Looking good!',
      subtitle: 'Review your skill profile before diving in',
      badge: 'default' as const,
    },
  };

  const config = stepConfig[step];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-accent-violet/6 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-amber/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {(['have', 'want', 'confirm'] as Step[]).map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  'h-1.5 rounded-full flex-1 transition-all duration-500',
                  step === s || (['want', 'confirm'].includes(step) && s === 'have') || (step === 'confirm' && s === 'want')
                    ? 'bg-gradient-to-r from-accent-amber to-accent-violet'
                    : 'bg-[var(--bg-surface-solid)]'
                )}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            {config.title}
          </h1>
          <p className="text-[var(--text-muted)]">{config.subtitle}</p>
        </div>

        {step !== 'confirm' ? (
          <GlassCard padding="lg">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  !selectedCategory
                    ? 'bg-accent-violet/20 text-accent-violet'
                    : 'bg-[var(--bg-surface-solid)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                All
              </button>
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    selectedCategory === cat.id
                      ? 'bg-accent-violet/20 text-accent-violet'
                      : 'bg-[var(--bg-surface-solid)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  )}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Skill grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-[300px] overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const isSelected = currentSkills.includes(skill.name);
                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.name)}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left border',
                      isSelected
                        ? step === 'have'
                          ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald'
                          : 'bg-accent-violet/10 border-accent-violet/30 text-accent-violet'
                        : 'bg-[var(--bg-surface-solid)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--glass-border-hover)]'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {isSelected && <Check size={14} />}
                      {skill.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-muted)]">
                {currentSkills.length} skill{currentSkills.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentSkills.map((s) => (
                  <SkillBadge
                    key={s}
                    skill={s}
                    variant={step === 'have' ? 'have' : 'want'}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        ) : (
          /* Confirmation */
          <GlassCard padding="lg">
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-semibold text-sm text-accent-emerald mb-3 uppercase tracking-wider">
                  Skills You&apos;ll Teach
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsHave.map((s) => (
                    <SkillBadge key={s} skill={s} variant="have" size="md" />
                  ))}
                  {skillsHave.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)]">None selected</p>
                  )}
                </div>
              </div>
              <hr className="border-[var(--glass-border)]" />
              <div>
                <h3 className="font-heading font-semibold text-sm text-accent-violet mb-3 uppercase tracking-wider">
                  Skills You&apos;ll Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsWant.map((s) => (
                    <SkillBadge key={s} skill={s} variant="want" size="md" />
                  ))}
                  {skillsWant.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)]">None selected</p>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => {
              if (step === 'want') setStep('have');
              else if (step === 'confirm') setStep('want');
            }}
            className={cn(
              'flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors',
              step === 'have' && 'invisible'
            )}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step === 'confirm' ? (
            <Link href={ROUTES.dashboard}>
              <GradientButton size="md">
                Enter Dashboard
                <ArrowRight size={16} />
              </GradientButton>
            </Link>
          ) : (
            <GradientButton
              size="md"
              onClick={() => {
                if (step === 'have') setStep('want');
                else if (step === 'want') setStep('confirm');
              }}
              disabled={currentSkills.length === 0}
            >
              Continue
              <ArrowRight size={16} />
            </GradientButton>
          )}
        </div>
      </div>
    </div>
  );
}
