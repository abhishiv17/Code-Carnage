'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff,
  Clock, ArrowLeft, Loader2, Shield, Star,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

/** Parse peer name from the roomId (e.g., "room_session-mock-1_kirani749") */
function parsePeerFromRoomId(roomId: string): string {
  const parts = roomId.split('_');
  // Last part is the username
  return parts.length > 1 ? parts[parts.length - 1] : 'Peer';
}

/** Format seconds into MM:SS */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ═══════════════════════════════════════════════════════════
   CallTimer — live running clock
   ═══════════════════════════════════════════════════════════ */
function CallTimer({ onTick }: { onTick?: (secs: number) => void }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        onTick?.(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onTick]);

  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-400 font-mono tabular-nums">
      <Clock size={14} />
      {formatDuration(seconds)}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Loading Overlay — while requesting permissions
   ═══════════════════════════════════════════════════════════ */
function LoadingOverlay({ peerName }: { peerName: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 animate-pulse">
          <Video size={32} className="text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Setting up your session</h2>
        <p className="text-sm text-gray-400 mb-6">
          Please allow camera and microphone access to join with <span className="text-purple-400 font-semibold">{peerName}</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/30">
            <Shield size={12} className="text-emerald-400" />
            <span className="text-[11px] text-gray-400">End-to-end secured</span>
          </div>
          <Loader2 size={18} className="animate-spin text-purple-400" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SessionSummary — shown after call ends
   ═══════════════════════════════════════════════════════════ */
function SessionSummary({
  peerName,
  duration,
  onReturn,
}: {
  peerName: string;
  duration: number;
  onReturn: () => void;
}) {
  const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 animate-fade-in">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/8 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-md w-full mx-auto text-center px-6">
        {/* Completed icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
          <PhoneOff size={28} className="text-emerald-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Session Ended</h2>
        <p className="text-gray-400 mb-8">
          Your session with <span className="text-purple-400 font-semibold">{peerName}</span> has ended.
        </p>

        {/* Summary card */}
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-6 mb-8 backdrop-blur-md">
          <div className="flex items-center justify-center gap-4 mb-5">
            <Image
              src={peerAvatar}
              alt={peerName}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full ring-2 ring-purple-500/30"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{peerName}</p>
              <p className="text-xs text-gray-500">Skill Session</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">{formatDuration(duration)}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Duration</p>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className={i <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} />
                ))}
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Quality</p>
            </div>
          </div>
        </div>

        {/* Return button */}
        <button
          onClick={onReturn}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-base shadow-lg shadow-purple-500/25 hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main VideoRoom Page
   ═══════════════════════════════════════════════════════════ */
export default function VideoRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = typeof params.roomId === 'string' ? params.roomId : '';
  const peerName = parsePeerFromRoomId(roomId);

  // Media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [permissionState, setPermissionState] = useState<'loading' | 'granted' | 'denied'>('loading');
  const [callState, setCallState] = useState<'active' | 'ending' | 'ended'>('active');
  const [callDuration, setCallDuration] = useState(0);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Derived
  const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const peerInitials = peerName
    .split(/[_\s]/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  /* ─── Initialize media on mount ─── */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setLocalStream(stream);
        setPermissionState('granted');
      } catch (err) {
        console.error('getUserMedia failed:', err);
        if (!cancelled) {
          setPermissionState('denied');
          // Still allow entering the room with mic/cam off
          setCameraOn(false);
          setMicOn(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── Bind local video ─── */
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, permissionState]);

  /* ─── Cleanup on unmount ─── */
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ─── Toggle Camera ─── */
  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }, [localStream]);

  /* ─── Toggle Mic ─── */
  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, [localStream]);

  /* ─── Toggle Screen Share ─── */
  const toggleScreenShare = useCallback(async () => {
    if (!screenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        screenStreamRef.current = displayStream;

        // Show screen share in the main (remote) video area
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = displayStream;
        }

        screenTrack.onended = () => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          screenStreamRef.current = null;
          setScreenSharing(false);
        };

        setScreenSharing(true);
      } catch {
        console.log('Screen share cancelled');
      }
    } else {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      screenStreamRef.current = null;
      setScreenSharing(false);
    }
  }, [screenSharing]);

  /* ─── End Call ─── */
  const handleEndCall = useCallback(() => {
    // 1. Show ending animation
    setCallState('ending');

    // 2. Stop all tracks
    localStream?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());

    // 3. Transition to summary after brief delay
    setTimeout(() => {
      setCallState('ended');
    }, 1500);
  }, [localStream]);

  /* ─── Return to Dashboard ─── */
  const handleReturnToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  /* ─── Track call duration ─── */
  const handleTimerTick = useCallback((secs: number) => {
    setCallDuration(secs);
  }, []);

  /* ─── Render: Loading state ─── */
  if (permissionState === 'loading') {
    return <LoadingOverlay peerName={peerName} />;
  }

  /* ─── Render: Session Summary ─── */
  if (callState === 'ended') {
    return (
      <SessionSummary
        peerName={peerName}
        duration={callDuration}
        onReturn={handleReturnToDashboard}
      />
    );
  }

  /* ─── Render: Active Call ─── */
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white relative select-none overflow-hidden">
      {/* ── Ending Overlay ── */}
      {callState === 'ending' && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-xl animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center animate-bounce">
            <PhoneOff size={32} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
          <p className="text-sm text-gray-400 mb-6">Preparing session summary…</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/notifications')}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">Live Session</h1>
            <p className="text-xs text-gray-500">with {peerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CallTimer onTick={handleTimerTick} />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 relative p-4">
        {/* Remote / Main Video Area */}
        <div className="absolute inset-4 rounded-2xl bg-gray-900 border border-gray-800/50 overflow-hidden">
          {/* Video element for screen share */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
              screenSharing ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Peer waiting placeholder (shown when not screen sharing) */}
          {!screenSharing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative mb-5">
                <Image
                  src={peerAvatar}
                  alt={peerName}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full ring-4 ring-purple-500/20"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border-2 border-gray-900 flex items-center justify-center">
                  <Loader2 size={12} className="animate-spin text-amber-400" />
                </div>
              </div>
              <p className="font-bold text-lg text-white">{peerName}</p>
              <p className="text-sm text-gray-500 mt-1 animate-pulse">Waiting for peer to join…</p>
            </div>
          )}

          {/* Screen sharing indicator on main */}
          {screenSharing && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm">
                <Monitor size={12} className="text-purple-400" />
                <span className="text-[11px] font-semibold text-purple-300">Screen Sharing</span>
              </div>
              <button
                onClick={toggleScreenShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] font-semibold hover:bg-red-500/30 transition-colors backdrop-blur-sm"
              >
                <MonitorOff size={12} />
                Stop Sharing
              </button>
            </div>
          )}

          {/* Remote peer name badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-gray-900/70 backdrop-blur-md border border-gray-700/50 text-sm font-medium text-white">
            Remote Peer: {peerName}
          </div>
        </div>

        {/* ── Local PiP Video ── */}
        <div className="absolute bottom-8 right-8 w-48 h-36 sm:w-56 sm:h-40 rounded-2xl bg-gray-800 border-2 border-gray-700/50 overflow-hidden shadow-2xl shadow-black/50 z-20 group hover:scale-105 transition-transform cursor-move">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              cameraOn ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Camera off: show initials */}
          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-2">
                <span className="text-lg font-bold text-purple-300">You</span>
              </div>
              <p className="text-[10px] text-gray-500">Camera off</p>
            </div>
          )}

          {/* Muted indicator on PiP */}
          {!micOn && (
            <div className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 backdrop-blur-sm">
              <MicOff size={10} className="text-white" />
            </div>
          )}

          {/* Name badge */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-gray-900/80 backdrop-blur-sm text-[10px] font-medium text-gray-300">
            You {screenSharing && '· Sharing'}
          </div>
        </div>
      </div>

      {/* ── Controls Bar (Glassmorphism Bottom Dock) ── */}
      <div className="px-6 py-4 border-t border-gray-800/40">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/30">
          {/* Mic */}
          <button
            onClick={toggleMic}
            id="btn-toggle-mic"
            title={micOn ? 'Mute' : 'Unmute'}
            className={`p-3.5 rounded-xl transition-all ${
              micOn
                ? 'bg-gray-700/50 text-white hover:bg-gray-700'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleCamera}
            id="btn-toggle-camera"
            title={cameraOn ? 'Camera off' : 'Camera on'}
            className={`p-3.5 rounded-xl transition-all ${
              cameraOn
                ? 'bg-gray-700/50 text-white hover:bg-gray-700'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            id="btn-toggle-screen"
            title={screenSharing ? 'Stop sharing' : 'Share screen'}
            className={`p-3.5 rounded-xl transition-all ${
              screenSharing
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-gray-700/50 text-white hover:bg-gray-700'
            }`}
          >
            {screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-700/50 mx-1" />

          {/* End Call */}
          <button
            onClick={handleEndCall}
            id="btn-end-call"
            title="End call"
            className="p-3.5 rounded-xl bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>

      {/* ── Permission denied notice ── */}
      {permissionState === 'denied' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
          <p className="text-xs text-amber-300">
            ⚠️ Camera/mic access denied. You can still view but won&apos;t send audio/video.
          </p>
        </div>
      )}
    </div>
  );
}
