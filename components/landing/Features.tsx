import { Zap, Users, Video, ShieldCheck, Star, Coins } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Smart AI Matchmaking',
    description: 'Our AI engine instantly pairs you with the perfect skill-swap partner based on complementary skills, colleges, and schedules.',
    color: 'text-accent-matcha',
    dotColor: 'bg-accent-matcha',
  },
  {
    icon: Users,
    title: 'Social Hub & Messaging',
    description: 'Send follow requests, connect with peers, and securely chat with voice notes, PDFs, and images right in your dashboard.',
    color: 'text-accent-violet',
    dotColor: 'bg-accent-violet',
  },
  {
    icon: Star,
    title: 'Multi-Lingual AI Tutor',
    description: 'Ask the SkillSwap AI for help in your native regional language. Upload documents or images and let it guide your learning.',
    color: 'text-accent-amber',
    dotColor: 'bg-accent-amber',
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
    description: 'Earn credits by teaching what you know, then spend them to learn what you want. A truly balanced ecosystem.',
    color: 'text-accent-mustard',
    dotColor: 'bg-accent-mustard',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Campus Connections',
    description: 'Gatekeep your messages with the Follow Request system. Verified profiles keep the community safe and focused.',
    color: 'text-accent-rose',
    dotColor: 'bg-accent-rose',
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
