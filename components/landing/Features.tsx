import { Zap, Users, Video, ShieldCheck, Star, Coins, Award, MessageCircle, Library, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Skill Recommendations',
    description: 'Our Llama 3.1 powered AI analyzes your profile to suggest the perfect skills to learn next, creating personalized learning paths.',
    color: 'text-accent-matcha',
    dotColor: 'bg-accent-matcha',
  },
  {
    icon: Award,
    title: 'Badges & Milestones',
    description: 'Gamify your journey. Earn unique badges for teaching, learning, and hitting milestones. Showcase your expertise to the community.',
    color: 'text-accent-amber',
    dotColor: 'bg-accent-amber',
  },
  {
    icon: MessageCircle,
    title: 'Community Forum',
    description: 'Discuss topics, ask for help, and share solutions. A dedicated space for academic and skill-based collaborative learning.',
    color: 'text-accent-violet',
    dotColor: 'bg-accent-violet',
  },
  {
    icon: Library,
    title: 'Resource Library',
    description: 'Share and discover videos, articles, and e-books. A crowdsourced repository of knowledge curated by students.',
    color: 'text-accent-emerald',
    dotColor: 'bg-accent-emerald',
  },
  {
    icon: Video,
    title: 'In-App Video Calls',
    description: 'Jump directly into live peer-to-peer sessions using integrated WebRTC video — no third-party apps required.',
    color: 'text-accent-slate',
    dotColor: 'bg-accent-slate',
  },
  {
    icon: Coins,
    title: 'Skill Credit Economy',
    description: 'Earn credits by teaching what you know, then spend them to learn what you want. A truly balanced student ecosystem.',
    color: 'text-accent-matcha',
    dotColor: 'bg-accent-matcha',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-section-sage">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section header — left-aligned, editorial */}
        <div className="mb-16 max-w-2xl">
          <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-accent-matcha mb-4 block">
            Features
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[var(--text-primary)] leading-tight mb-4">
            Everything you need to
            <br />
            <span className="gradient-text">learn & teach</span>
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg leading-relaxed">
            A complete platform designed for peer-to-peer skill exchange on campus.
          </p>
        </div>

        {/* Feature list — no cards, just content rows with dividers */}
        <div className="space-y-0">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title}>
                {i > 0 && <div className="divider-soft my-0" />}
                <div className="stagger-in group flex items-start gap-5 py-8 hover-lift cursor-default">
                  {/* Color dot + icon */}
                  <div className="relative mt-1">
                    <div className={`w-2 h-2 rounded-full ${feature.dotColor} absolute -left-4 top-2.5 opacity-60`} />
                    <Icon size={22} className={`${feature.color} transition-transform duration-300 group-hover:scale-110`} />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="font-heading font-semibold text-[17px] text-[var(--text-primary)] mb-1.5 group-hover:text-accent-matcha transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-md">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
