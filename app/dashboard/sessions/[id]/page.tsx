'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { useWebRTC } from '@/hooks/useWebRTC';
import { GlassCard } from '@/components/shared/GlassCard';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff, MessageSquare, Clock, Maximize2, Loader2, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function VideoRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useUser();
  const [peerName, setPeerName] = useState('Peer');
  const [isTeaching, setIsTeaching] = useState(false);
  const [loading, setLoading] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const sessionId = typeof id === 'string' ? id : '';
  const userId = user?.id ?? '';

  const {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    error,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    endCall,
  } = useWebRTC({ sessionId, userId });

  // Fetch session metadata
  useEffect(() => {
    if (!user || !id) return;
    const fetchSession = async () => {
      const supabase = createClient();
      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (session) {
        const teaching = session.teacher_id === user.id;
        setIsTeaching(teaching);
        const peerId = teaching ? session.learner_id : session.teacher_id;
        const { data: peerProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', peerId)
          .single();
        if (peerProfile) setPeerName(peerProfile.username);
      }
      setLoading(false);
    };
    fetchSession();
  }, [user, id]);

  // Bind local stream to <video>
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Bind remote stream to <video>
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const myAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const handleEndCall = () => {
    endCall();
    router.push(ROUTES.reviews);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-1">Live Session</h1>
          <span className="text-sm text-[var(--text-muted)]">with {peerName}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1"><Clock size={14} />60min</span>

          {/* Connection status indicator */}
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-400">LIVE</span>
            </div>
          ) : isConnecting ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/20">
              <Loader2 size={10} className="animate-spin text-accent-amber" />
              <span className="text-xs font-medium text-accent-amber">Connecting…</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--bg-surface-solid)] border border-[var(--glass-border)]">
              <WifiOff size={10} className="text-[var(--text-muted)]" />
              <span className="text-xs font-medium text-[var(--text-muted)]">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Remote video (large) */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Fallback avatar when no remote stream */}
            {!remoteStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Image src={peerAvatar} alt={peerName} width={96} height={96} className="w-24 h-24 rounded-full mb-4 ring-4 ring-accent-violet/20" />
                <p className="font-heading font-semibold text-[var(--text-primary)]">{peerName}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {isConnecting ? 'Waiting for peer to join…' : 'Camera connected'}
                </p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg glass text-sm font-medium text-[var(--text-primary)]">{peerName}</div>
            <button className="absolute top-4 right-4 p-2 rounded-lg glass text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Maximize2 size={16} /></button>
          </div>
        </div>

        {/* Sidebar: local video + chat */}
        <div className="flex flex-col gap-4">
          {/* Local video (small) */}
          <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover mirror"
            />
            {/* Fallback when camera off */}
            {!isCameraOn && (
              <div className="absolute inset-0 bg-[var(--bg-deep)]/90 flex items-center justify-center">
                <VideoOff size={24} className="text-[var(--text-muted)]" />
              </div>
            )}
            {/* Fallback avatar when no local stream at all */}
            {!localStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Image src={myAvatar} alt="You" width={64} height={64} className="w-16 h-16 rounded-full mb-2" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">You</p>
              </div>
            )}
            {isScreenSharing && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-accent-violet/20 border border-accent-violet/30 text-[10px] font-semibold text-accent-violet">
                Screen
              </div>
            )}
          </div>

          <GlassCard padding="sm" className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-accent-violet" />
              <span className="text-sm font-heading font-semibold text-[var(--text-primary)]">Chat</span>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-muted)]">
              <p><span className="text-accent-amber font-medium">{peerName}:</span> Ready to start?</p>
              <p><span className="text-accent-violet font-medium">You:</span> Let&apos;s go 🚀</p>
            </div>
            <input type="text" placeholder="Type a message..." className="mt-3 w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50" />
          </GlassCard>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-2xl transition-all ${isMicOn ? 'glass text-[var(--text-primary)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={toggleCamera}
          className={`p-4 rounded-2xl transition-all ${isCameraOn ? 'glass text-[var(--text-primary)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
        >
          {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-2xl transition-all ${isScreenSharing ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30' : 'glass text-[var(--text-primary)]'}`}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>
        <button
          onClick={handleEndCall}
          className="p-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}
