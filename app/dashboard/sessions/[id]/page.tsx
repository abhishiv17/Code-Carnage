'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { MOCK_SESSIONS, CURRENT_USER } from '@/lib/mock-data';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MessageSquare, Clock, Coins, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function VideoRoomPage() {
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const session = MOCK_SESSIONS[0];
  const isTeaching = session.teacher.id === CURRENT_USER.id;
  const peer = isTeaching ? session.learner : session.teacher;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-1">Live Session</h1>
          <div className="flex items-center gap-2">
            <SkillBadge skill={session.skill} variant={isTeaching ? 'have' : 'want'} />
            <span className="text-sm text-[var(--text-muted)]">with {peer.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1"><Clock size={14} />{session.duration}min</span>
          <span className="flex items-center gap-1"><Coins size={14} className="text-accent-amber" />{session.creditsExchanged} credits</span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img src={peer.avatar} alt={peer.name} className="w-24 h-24 rounded-full mb-4 ring-4 ring-accent-violet/20" />
              <p className="font-heading font-semibold text-[var(--text-primary)]">{peer.name}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Camera connected</p>
            </div>
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg glass text-sm font-medium text-[var(--text-primary)]">{peer.name}</div>
            <button className="absolute top-4 right-4 p-2 rounded-lg glass text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Maximize2 size={16} /></button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img src={CURRENT_USER.avatar} alt="You" className="w-16 h-16 rounded-full mb-2" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">You</p>
            </div>
            {!cameraOn && <div className="absolute inset-0 bg-[var(--bg-deep)]/90 flex items-center justify-center"><VideoOff size={24} className="text-[var(--text-muted)]" /></div>}
          </div>

          <GlassCard padding="sm" className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-accent-violet" />
              <span className="text-sm font-heading font-semibold text-[var(--text-primary)]">Chat</span>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-muted)]">
              <p><span className="text-accent-amber font-medium">{peer.name}:</span> Ready to start?</p>
              <p><span className="text-accent-violet font-medium">You:</span> Let&apos;s go 🚀</p>
            </div>
            <input type="text" placeholder="Type a message..." className="mt-3 w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50" />
          </GlassCard>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-2xl transition-all ${micOn ? 'glass text-[var(--text-primary)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{micOn ? <Mic size={20} /> : <MicOff size={20} />}</button>
        <button onClick={() => setCameraOn(!cameraOn)} className={`p-4 rounded-2xl transition-all ${cameraOn ? 'glass text-[var(--text-primary)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{cameraOn ? <Video size={20} /> : <VideoOff size={20} />}</button>
        <button className="p-4 rounded-2xl glass text-[var(--text-primary)]"><Monitor size={20} /></button>
        <Link href={ROUTES.reviews}><button className="p-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all"><PhoneOff size={20} /></button></Link>
      </div>
    </div>
  );
}
