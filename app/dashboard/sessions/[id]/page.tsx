'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { useWebRTC } from '@/hooks/useWebRTC';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Clock,
  Maximize2,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';

export default function VideoRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const sessionId = typeof id === 'string' ? id : '';
  const { user, profile } = useUser();
  const [peerName, setPeerName] = useState('Peer');
  const [isTeaching, setIsTeaching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inLobby, setInLobby] = useState(true);

  // ─── NEW: Redirect to immersive room ───
  useEffect(() => {
    if (user && sessionId) {
      const fetchSessionInfo = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('sessions')
          .select('*, profiles!teacher_id(username), profiles!learner_id(username)')
          .eq('id', sessionId)
          .single();
        
        if (data) {
          const teaching = data.teacher_id === user.id;
          const pName = teaching ? (data.profiles_learner_id as any)?.username : (data.profiles_teacher_id as any)?.username;
          window.location.href = `/session/room_${sessionId}_${pName || 'Peer'}`;
        }
      };
      fetchSessionInfo();
    }
  }, [user, sessionId]);

  /* Refs for <video> elements */
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  /* Fetch session metadata */
  useEffect(() => {
    if (!user || !sessionId) return;
    const fetchSession = async () => {
      const supabase = createClient();
      const { data: session, error: sessionErr } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionErr) {
        console.error('Failed to fetch session:', sessionErr);
        toast.error('Failed to load session details');
      }

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
  }, [user, sessionId]);

  /* WebRTC — teacher is the "caller" (initiator) */
  const {
    localStream,
    remoteStream,
    cameraOn,
    micOn,
    screenSharing,
    connectionState,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    hangUp,
  } = useWebRTC({
    sessionId,
    userId: user?.id ?? '',
    isCaller: isTeaching,
    startCall: !inLobby,
  });

  /* Bind local stream to <video> */
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, inLobby]);

  /* Bind remote stream to <video> */
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  /* Fullscreen helper */
  const handleFullscreen = useCallback(() => {
    remoteVideoRef.current?.requestFullscreen?.();
  }, []);

  /* End Call Logic */
  const handleEndCall = async () => {
    // 1. Play hangup sound effect
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Ignore if browser blocks audio
    }

    // 2. Close WebRTC connections
    hangUp();

    // 3. Update session status in database to trigger the review flow
    const supabase = createClient();
    await supabase
      .from('sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', sessionId);

    // 4. Redirect to reviews page for this specific session
    router.push(`${ROUTES.reviews}?sessionId=${sessionId}`);
  };

  /* Avatars (fallback when cam off / no stream) */
  const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const myAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const isRemoteConnected = connectionState === 'connected';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent-violet" />
      </div>
    );
  }

  if (inLobby) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
            Join Session with {peerName}
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Please check your camera and microphone settings before joining the live room.
          </p>
        </div>

        <div className="relative aspect-video w-full max-w-3xl rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] overflow-hidden shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover mirror transition-opacity duration-300 ${
              cameraOn ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!cameraOn && (
            <div className="absolute inset-0 bg-[var(--bg-deep)]/90 flex flex-col items-center justify-center">
              <Image
                src={myAvatar}
                alt="You"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full mb-4 ring-4 ring-accent-violet/20"
              />
              <p className="text-lg font-medium text-[var(--text-secondary)]">
                Camera is off
              </p>
            </div>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={toggleMic}
              className={`p-4 rounded-2xl transition-all shadow-lg backdrop-blur-md ${
                micOn
                  ? 'bg-black/40 text-white hover:bg-black/60'
                  : 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600'
              }`}
            >
              {micOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

            <button
              onClick={toggleCamera}
              className={`p-4 rounded-2xl transition-all shadow-lg backdrop-blur-md ${
                cameraOn
                  ? 'bg-black/40 text-white hover:bg-black/60'
                  : 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600'
              }`}
            >
              {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          </div>
        </div>

        <GradientButton size="lg" onClick={() => setInLobby(false)} className="px-12 py-6 text-lg mt-4 shadow-xl">
          Join Room Now
        </GradientButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-1">
            Live Session
          </h1>
          <span className="text-sm text-[var(--text-muted)]">
            with {peerName}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          {/* Connection indicator */}
          <span className="flex items-center gap-1.5">
            {isRemoteConnected ? (
              <Wifi size={14} className="text-green-400" />
            ) : (
              <WifiOff size={14} className="text-yellow-400 animate-pulse" />
            )}
            <span className="text-xs">
              {connectionState === 'new'
                ? 'Connecting…'
                : connectionState}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            60min
          </span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Remote video (large) ── */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] overflow-hidden">
            {/* Video element — always mounted */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isRemoteConnected ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Fallback avatar when not connected */}
            {!isRemoteConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Image
                  src={peerAvatar}
                  alt={peerName}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full mb-4 ring-4 ring-accent-violet/20"
                />
                <p className="font-heading font-semibold text-[var(--text-primary)]">
                  {peerName}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Waiting for connection…
                </p>
              </div>
            )}

            {/* Name badge */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg glass text-sm font-medium text-[var(--text-primary)]">
              {peerName}
            </div>
            {/* Fullscreen btn */}
            <button
              onClick={handleFullscreen}
              className="absolute top-4 right-4 p-2 rounded-lg glass text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* ── Sidebar: local video + chat ── */}
        <div className="flex flex-col gap-4">
          {/* Local video */}
          <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover mirror transition-opacity duration-300 ${
                cameraOn ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Fallback avatar when cam off */}
            {!cameraOn && (
              <div className="absolute inset-0 bg-[var(--bg-deep)]/90 flex flex-col items-center justify-center">
                <Image
                  src={myAvatar}
                  alt="You"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full mb-2"
                />
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Camera off
                </p>
              </div>
            )}

            {/* Screen sharing indicator */}
            {screenSharing && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-violet/20 border border-accent-violet/30">
                <Monitor size={12} className="text-accent-violet" />
                <span className="text-[10px] font-medium text-accent-violet">
                  Sharing Screen
                </span>
              </div>
            )}
          </div>

          {/* Chat panel */}
          <GlassCard padding="sm" className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-accent-violet" />
              <span className="text-sm font-heading font-semibold text-[var(--text-primary)]">
                Chat
              </span>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-muted)]">
              <p>
                <span className="text-accent-amber font-medium">
                  {peerName}:
                </span>{' '}
                Ready to start?
              </p>
              <p>
                <span className="text-accent-violet font-medium">You:</span>{' '}
                Let&apos;s go 🚀
              </p>
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              className="mt-3 w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50"
            />
          </GlassCard>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="flex items-center justify-center gap-3">
        {/* Mic */}
        <button
          id="btn-toggle-mic"
          onClick={toggleMic}
          className={`p-4 rounded-2xl transition-all ${
            micOn
              ? 'glass text-[var(--text-primary)]'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Camera */}
        <button
          id="btn-toggle-camera"
          onClick={toggleCamera}
          className={`p-4 rounded-2xl transition-all ${
            cameraOn
              ? 'glass text-[var(--text-primary)]'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {/* Screen share */}
        <button
          id="btn-toggle-screen"
          onClick={toggleScreenShare}
          className={`p-4 rounded-2xl transition-all ${
            screenSharing
              ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30'
              : 'glass text-[var(--text-primary)]'
          }`}
        >
          {screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>

        {/* Hang up */}
        <button
          id="btn-hangup"
          onClick={handleEndCall}
          className="p-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}
