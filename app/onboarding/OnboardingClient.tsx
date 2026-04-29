'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { SKILL_CATEGORIES, ALL_SKILLS, ROUTES } from '@/lib/constants';
import {
  ArrowLeft, ArrowRight, Check, Loader2, Plus, SkipForward,
  User, GraduationCap, MapPin, ChevronDown, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'have' | 'want' | 'confirm' | 'profile';

const DEGREE_OPTIONS = ['B.Tech', 'B.E.', 'B.Sc', 'BBA', 'BCA', 'B.Com', 'BA', 'M.Tech', 'M.Sc', 'MBA', 'MCA', 'PhD', 'Other'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const YEAR_OPTIONS = ['1', '2', '3', '4', '5'];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('have');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [skillsHave, setSkillsHave] = useState<string[]>([]);
  const [skillsWant, setSkillsWant] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const router = useRouter();

  // Profile fields (optional)
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');

  const handleSaveSkills = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in first');
      router.push(ROUTES.login);
      return;
    }

    const skillRows = [
      ...skillsHave.map((s) => ({ user_id: user.id, skill_name: s, type: 'offered' as const })),
      ...skillsWant.map((s) => ({ user_id: user.id, skill_name: s, type: 'desired' as const })),
    ];

    const { error } = await supabase.from('skills').insert(skillRows);
    if (error) {
      toast.error('Failed to save skills: ' + error.message);
      setSaving(false);
    } else {
      toast.success('Skills saved!');
      setStep('profile');
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(ROUTES.login);
      return;
    }

    const updates: Record<string, unknown> = {};
    if (fullName.trim()) updates.full_name = fullName.trim();
    if (collegeName.trim()) updates.college_name = collegeName.trim();
    if (degree) updates.degree = degree;
    if (branch.trim()) updates.branch = branch.trim();
    if (yearOfStudy) updates.year_of_study = parseInt(yearOfStudy);
    if (city.trim()) updates.city = city.trim();
    if (gender) updates.gender = gender;
    if (bio.trim()) updates.bio = bio.trim();

    if (Object.keys(updates).length > 0) {
      updates.profile_completed = true;
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) {
        toast.error('Failed to save profile: ' + error.message);
        setSaving(false);
        return;
      }
      toast.success('Profile saved! Welcome to SkillSwap 🎉');
    } else {
      toast.success('Welcome to SkillSwap 🎉');
    }
    router.push(ROUTES.dashboard);
  };

  const handleSkipProfile = () => {
    toast.success('Welcome to SkillSwap 🎉 You can fill your profile later.');
    router.push(ROUTES.dashboard);
  };

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

  const stepConfig: Record<Step, { title: string; subtitle: string }> = {
    have: {
      title: 'What can you teach?',
      subtitle: 'Select skills you\'re confident teaching to peers',
    },
    want: {
      title: 'What do you want to learn?',
      subtitle: 'Pick skills you\'d love to pick up from fellow students',
    },
    confirm: {
      title: 'Looking good!',
      subtitle: 'Review your skill profile before diving in',
    },
    profile: {
      title: 'Complete your profile',
      subtitle: 'Help us find you better matches (optional)',
    },
  };

  const config = stepConfig[step];
  const allSteps: Step[] = ['have', 'want', 'confirm', 'profile'];
  const stepIndex = allSteps.indexOf(step);

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
          {allSteps.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  i <= stepIndex
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

        {/* ──── SKILL SELECTION (have / want) ──── */}
        {(step === 'have' || step === 'want') && (
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

            {/* Custom skill input */}
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex-1">
                <Plus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Can't find your skill? Type it here..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customSkill.trim()) {
                      e.preventDefault();
                      const name = customSkill.trim();
                      if (!currentSkills.includes(name)) {
                        toggleSkill(name);
                        toast.success(`Added "${name}"`);
                      } else {
                        toast.error('Skill already added');
                      }
                      setCustomSkill('');
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-dashed border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:border-solid focus:ring-1 focus:ring-accent-violet/30 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!customSkill.trim()) return;
                  const name = customSkill.trim();
                  if (!currentSkills.includes(name)) {
                    toggleSkill(name);
                    toast.success(`Added "${name}"`);
                  } else {
                    toast.error('Skill already added');
                  }
                  setCustomSkill('');
                }}
                disabled={!customSkill.trim()}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
                  customSkill.trim()
                    ? step === 'have'
                      ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/20'
                      : 'bg-accent-violet/10 border-accent-violet/30 text-accent-violet hover:bg-accent-violet/20'
                    : 'bg-[var(--bg-surface-solid)] border-[var(--glass-border)] text-[var(--text-muted)] cursor-not-allowed'
                )}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Selected count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-muted)]">
                {currentSkills.length} skill{currentSkills.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentSkills.map((s) => (
                  <SkillBadge key={s} skill={s} variant={step === 'have' ? 'have' : 'want'} />
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* ──── CONFIRM ──── */}
        {step === 'confirm' && (
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

        {/* ──── PROFILE (optional) ──── */}
        {step === 'profile' && (
          <>
            {/* Better matches badge */}
            <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-xl bg-accent-amber/5 border border-accent-amber/15 mx-auto w-fit">
              <Sparkles size={14} className="text-accent-amber" />
              <span className="text-xs font-medium text-accent-amber">Complete profiles get 3x better match quality</span>
            </div>

            <GlassCard padding="lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Arjun Raghavan"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Gender</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select value={gender} onChange={(e) => setGender(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-accent-violet/50 appearance-none cursor-pointer">
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                {/* College */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">College Name</label>
                  <div className="relative">
                    <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="IIT Bombay"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all" />
                  </div>
                </div>

                {/* Degree */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Degree</label>
                  <div className="relative">
                    <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select value={degree} onChange={(e) => setDegree(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-accent-violet/50 appearance-none cursor-pointer">
                      <option value="">Select degree</option>
                      {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Branch / Major</label>
                  <div className="relative">
                    <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Computer Science"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all" />
                  </div>
                </div>

                {/* Year of Study */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Year of Study</label>
                  <div className="relative">
                    <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-accent-violet/50 appearance-none cursor-pointer">
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">City / Campus</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all" />
                  </div>
                </div>

                {/* Bio — full width */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Bio (Optional)</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="MERN developer, chess nerd, love teaching..." maxLength={200}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all resize-none h-16" />
                </div>
              </div>
            </GlassCard>
          </>
        )}

        {/* ──── NAVIGATION ──── */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => {
              if (step === 'want') setStep('have');
              else if (step === 'confirm') setStep('want');
              else if (step === 'profile') setStep('confirm');
            }}
            className={cn(
              'flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors',
              step === 'have' && 'invisible'
            )}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {step === 'profile' && (
              <button
                onClick={handleSkipProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] transition-all"
              >
                <SkipForward size={14} /> Skip for now
              </button>
            )}

            {step === 'confirm' ? (
              <GradientButton size="md" onClick={handleSaveSkills} disabled={saving}>
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <>Save & Continue <ArrowRight size={16} /></>}
              </GradientButton>
            ) : step === 'profile' ? (
              <GradientButton size="md" onClick={handleSaveProfile} disabled={saving}>
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <>Enter Dashboard <ArrowRight size={16} /></>}
              </GradientButton>
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
    </div>
  );
}
