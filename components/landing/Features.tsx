import { Zap, Users, Video, ShieldCheck, Star, Coins } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Matching',
    description: 'Smart algorithm finds your perfect skill-swap partner based on complementary skills and schedules.',
    color: 'text-accent-matcha',
    dotColor: 'bg-accent-matcha',
  },
  {
    icon: Video,
    title: 'In-App Video Calls',
    description: 'Jump into live sessions with WebRTC video — no third-party apps, no downloads, no hassle.',
    color: 'text-accent-slate',
    dotColor: 'bg-accent-slate',
  },
  {
    icon: Coins,
    title: 'Skill Credit Economy',
    description: 'Earn credits by teaching, spend them to learn. Every hour you give is an hour you get.',
    color: 'text-accent-mustard',
    dotColor: 'bg-accent-mustard',
  },
  {
    icon: Star,
    title: 'Ratings & Reviews',
    description: 'Rate sessions. Verified badges highlight the best teachers on campus.',
    color: 'text-accent-rose',
    dotColor: 'bg-accent-rose',
  },
  {
    icon: Users,
    title: 'Campus Community',
    description: 'Connect with students at your college who share your learning interests.',
    color: 'text-accent-clay',
    dotColor: 'bg-accent-clay',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & Safety',
    description: 'Consent-based session recording. Verified profiles. Community guidelines.',
    color: 'text-accent-slate',
    dotColor: 'bg-accent-slate',
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
