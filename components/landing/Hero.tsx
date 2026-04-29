'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GradientButton } from '@/components/shared/GradientButton';
import { ROUTES } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

const skills = ['Python', 'Guitar', 'UI/UX', '日本語', 'Photography', 'Yoga', 'React', 'Piano'];

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [swapPhase, setSwapPhase] = useState<'initial' | 'swapping' | 'done'>('initial');

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger the swap animation after mount
  useEffect(() => {
    const t1 = setTimeout(() => setSwapPhase('swapping'), 400);
    const t2 = setTimeout(() => setSwapPhase('done'), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Soft pastel blobs — organic, asymmetric with gentle scroll parallax */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-75 ease-out"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      >
        <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-accent-matcha/40 dark:bg-accent-matcha/20 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-accent-rose/30 dark:bg-accent-rose/15 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full bg-accent-slate/30 dark:bg-accent-slate/15 blur-3xl animate-pulse-glow" style={{ animationDelay: '3.5s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Social proof — minimal, no card */}
        <p className="text-[13px] font-medium text-[var(--text-muted)] tracking-widest uppercase mb-10">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-matcha mr-2 align-middle" />
          2,847 students swapping skills
        </p>


        {/* Hero heading with word-swap animation */}
        <h1 className="stagger-in font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[0.92] tracking-[-0.03em] mb-7">
          <span className="text-[var(--text-primary)] inline-flex items-baseline gap-[0.2em] overflow-visible relative">
            {/* Word 1: "Swap" — starts on right, moves to left */}
            <span
              className="inline-block relative"
              style={{
                animation: swapPhase === 'swapping'
                  ? 'wordSwapLeft 0.8s ease-in-out forwards'
                  : undefined,
                transform: swapPhase === 'initial' ? 'translateX(calc(100% + 0.2em))' : undefined,
                opacity: swapPhase === 'initial' ? 0.5 : 1,
                transition: swapPhase === 'done' ? 'none' : undefined,
              }}
            >
              Swap
            </span>
            {/* Word 2: "Skills," — starts on left, moves to right */}
            <span
              className="inline-block relative"
              style={{
                animation: swapPhase === 'swapping'
                  ? 'wordSwapRight 0.8s ease-in-out forwards'
                  : undefined,
                transform: swapPhase === 'initial' ? 'translateX(calc(-100% - 0.2em))' : undefined,
                opacity: swapPhase === 'initial' ? 0.5 : 1,
                transition: swapPhase === 'done' ? 'none' : undefined,
              }}
            >
              Skills,
            </span>
            {/* Spark trail during swap */}
            {swapPhase === 'swapping' && (
              <span className="absolute inset-0 pointer-events-none" aria-hidden>
                <span
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{
                    background: 'var(--accent-matcha, #a8c99b)',
                    boxShadow: '0 0 20px 8px var(--accent-matcha, #a8c99b)',
                    animation: 'sparkFlash 0.7s ease-out forwards',
                  }}
                />
              </span>
            )}
          </span>

          <br />
          <span className="gradient-text">Not Cash.</span>
        </h1>

        {/* Transition CSS */}
        <style jsx>{`
          @keyframes wordSwapLeft {
            0% {
              transform: translateX(calc(100% + 0.2em)) translateY(0);
              opacity: 0.5;
            }
            50% {
              transform: translateX(50%) translateY(-25%);
              opacity: 1;
            }
            100% {
              transform: translateX(0) translateY(0);
              opacity: 1;
            }
          }
          @keyframes wordSwapRight {
            0% {
              transform: translateX(calc(-100% - 0.2em)) translateY(0);
              opacity: 0.5;
            }
            50% {
              transform: translateX(-50%) translateY(25%);
              opacity: 1;
            }
            100% {
              transform: translateX(0) translateY(0);
              opacity: 1;
            }
          }
          @keyframes sparkFlash {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.5);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(3);
            }
          }
        `}</style>

        {/* Subheading */}
        <p className="stagger-in max-w-lg mx-auto text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-12">
          You know Python. They know guitar. Teach what you have,
          learn what you want — powered by AI matching.
        </p>

        {/* CTAs */}
        <div className="stagger-in flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href={ROUTES.signup}>
            <GradientButton size="lg">
              Start Swapping
              <ArrowRight size={18} />
            </GradientButton>
          </Link>
          <Link href="#how-it-works">
            <GradientButton variant="outline" size="lg">
              See How It Works
            </GradientButton>
          </Link>
        </div>

        {/* Skill tags — scattered, organic sizes */}
        <div className="stagger-in flex flex-wrap items-center justify-center gap-3">
          {skills.map((skill, i) => (
            <div
              key={skill}
              className="animate-float inline-block"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <span
                className="inline-block px-5 py-2.5 rounded-full text-sm font-medium text-[var(--text-secondary)] glass transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:text-[var(--text-primary)] hover:shadow-lg hover:shadow-accent-matcha/10 cursor-default"
                style={{ fontSize: `${13 + (i % 3) * 2}px` }}
              >
                {skill}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
