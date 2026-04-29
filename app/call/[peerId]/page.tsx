'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  Minimize2,
  Users,
  Shield,
  Volume2,
  VolumeX,
  Settings,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

/* ─── Lobby (Pre-flight checks) ─── */
function Lobby({
  onJoin,
  peerName,
  skillName,
}: {
  onJoin: () => void;
  peerName: string;
  skillName: string;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        setCameraReady(true);
        setMicReady(true);
      } catch (err: any) {
        console.error('Media access error:', err);
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera and microphone access was denied. Please allow access in your browser settings.'
            : `Could not access camera/mic: ${err.message}`
        );
      }
    }
    init();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleCam = () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  };

  const toggleMic = () => {
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const handleJoin = () => {
    // Stop the lobby preview stream — the call page will create its own
    stream?.getTracks().forEach((t) => t.stop());
    onJoin();
  };

  const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent-violet/8 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-emerald/6 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Back button */}
        <Link
          href="/dashboard/matches"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Matches
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center">
            <Video size={24} className="text-accent-violet" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Pre-flight Check
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Make sure your camera and mic are working before joining
          </p>
        </div>

        {/* Session info */}
        <div className="flex items-center justify-center gap-4 mb-6 p-3 rounded-xl glass">
          <Image
            src={peerAvatar}
            alt={peerName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Skill session with <strong>{peerName}</strong>
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Skill: {skillName}
            </p>
          </div>
        </div>

        {/* Video preview */}
        <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)] overflow-hidden mb-6">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover mirror transition-opacity duration-300 ${
              cameraOn && stream ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {(!cameraOn || !stream) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <VideoOff size={48} className="text-[var(--text-muted)] opacity-30 mb-3" />
              <p className="text-sm text-[var(--text-muted)]">
                {error ? 'Camera unavailable' : 'Camera is off'}
              </p>
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <Shield size={14} className="inline mr-2" />
            {error}
          </div>
        )}

        {/* Device status */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            cameraReady
              ? 'bg-accent-emerald/5 border-accent-emerald/20'
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              cameraReady ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-red-500/10 text-red-400'
            }`}>
              {cameraReady ? <Video size={16} /> : <VideoOff size={16} />}
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">Camera</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {cameraReady ? 'Ready' : 'Not available'}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            micReady
              ? 'bg-accent-emerald/5 border-accent-emerald/20'
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              micReady ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-red-500/10 text-red-400'
            }`}>
              {micReady ? <Mic size={16} /> : <MicOff size={16} />}
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">Microphone</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {micReady ? 'Ready' : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={toggleCam}
            className={`p-3.5 rounded-2xl transition-all ${
              cameraOn
                ? 'glass text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
            title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-2xl transition-all ${
              micOn
                ? 'glass text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
            title={micOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>

        {/* Join button */}
        <button
          onClick={handleJoin}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-emerald text-white font-heading font-bold text-base tracking-wide shadow-lg shadow-accent-violet/20 hover:shadow-xl hover:shadow-accent-violet/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Video size={20} />
          Join Call
        </button>
      </div>
    </div>
  );
}

/* ─── Call Timer ─── */
function CallTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
      <Clock size={14} />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

/* ─── Video Call Room ─── */
function CallRoom({
  peerName,
  skillName,
}: {
  peerName: string;
  skillName: string;
}) {
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string }[]>([
    { from: peerName, text: 'Hey! Ready to start?' },
    { from: 'You', text: "Let's go! 🚀" },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isEntering, setIsEntering] = useState(true);
  const [isHangingUp, setIsHangingUp] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 50);
    return () => clearTimeout(timer);
  }, []);

  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  // Initialize media
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        cameraTrackRef.current = stream.getVideoTracks()[0] ?? null;
        setLocalStream(stream);
      } catch (err) {
        console.error('Failed to get media:', err);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Bind local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, [localStream]);

  const toggleScreenShare = useCallback(async () => {
    if (!screenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];

        // Replace the local video with screen share
        if (localVideoRef.current) {
          const newStream = new MediaStream([
            screenTrack,
            ...(localStream?.getAudioTracks() || []),
          ]);
          localVideoRef.current.srcObject = newStream;
        }

        screenTrack.onended = () => {
          // Restore camera
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
          }
          setScreenSharing(false);
        };

        setScreenSharing(true);
      } catch {
        console.log('Screen share cancelled');
      }
    } else {
      // Restore camera
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      setScreenSharing(false);
    }
  }, [screenSharing, localStream]);

  const handleHangUp = useCallback(() => {
    if (isHangingUp) return;
    setIsHangingUp(true);

    // Stop all media tracks
    localStream?.getTracks().forEach((t) => t.stop());

    // Play call-ended sound using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // First beep (higher pitch)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(620, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc1.connect(gain1).connect(audioCtx.destination);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.15);

      // Second beep (lower pitch, slight delay)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, audioCtx.currentTime + 0.18);
      gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc2.connect(gain2).connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime + 0.18);
      osc2.stop(audioCtx.currentTime + 0.4);

      // Third beep (lowest pitch)
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(380, audioCtx.currentTime + 0.45);
      gain3.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.45);
      gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc3.connect(gain3).connect(audioCtx.destination);
      osc3.start(audioCtx.currentTime + 0.45);
      osc3.stop(audioCtx.currentTime + 0.8);

      // Redirect to reviews after overlay animation + sound
      setTimeout(() => {
        audioCtx.close();
        router.push('/dashboard/reviews');
      }, 2000);
    } catch {
      setTimeout(() => router.push('/dashboard/reviews'), 1500);
    }
  }, [localStream, router, isHangingUp]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { from: 'You', text: chatInput.trim() }]);
    setChatInput('');
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-700 ease-out ${
        isEntering ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
      }`}
      style={{ background: 'var(--bg-base)' }}
    >
      {/* ── Hang Up Overlay ── */}
      {isHangingUp && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ animation: 'callEndOverlay 1.8s ease-in-out forwards' }}>
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-[var(--bg-base)]/80 backdrop-blur-xl" style={{ animation: 'fadeIn 0.4s ease-out forwards' }} />
          {/* Content */}
          <div className="relative z-10 text-center" style={{ animation: 'callEndContent 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center" style={{ animation: 'callEndIcon 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both' }}>
              <PhoneOff size={32} className="text-red-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 0.4s both' }}>
              Call Ended
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-6" style={{ animation: 'fadeSlideUp 0.5s ease-out 0.6s both' }}>
              Redirecting to leave a review…
            </p>
            <div className="flex items-center justify-center gap-1.5" style={{ animation: 'fadeSlideUp 0.5s ease-out 0.8s both' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Transition CSS */}
      <style jsx>{`
        @keyframes callEndOverlay {
          0% { opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes callEndContent {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          30% { opacity: 1; transform: scale(1) translateY(0); }
          85% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.95) translateY(-10px); }
        }
        @keyframes callEndIcon {
          0% { opacity: 0; transform: scale(0) rotate(-45deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/matches"
            className="p-2 rounded-lg glass text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-heading text-base font-bold text-[var(--text-primary)]">
              Live Session — {skillName}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">with {peerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CallTimer />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className={`flex-1 flex flex-col p-4 gap-4 ${showChat ? '' : ''}`}>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Remote video (large) */}
            <div className="lg:col-span-2 relative rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)] overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-0"
              />

              {/* Simulated peer waiting */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative mb-5">
                  <Image
                    src={peerAvatar}
                    alt={peerName}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full ring-4 ring-accent-violet/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-amber/20 border-2 border-[var(--bg-surface)] flex items-center justify-center">
                    <Loader2 size={12} className="animate-spin text-accent-amber" />
                  </div>
                </div>
                <p className="font-heading font-semibold text-lg text-[var(--text-primary)]">
                  {peerName}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1 animate-pulse">
                  Waiting for peer to join…
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-4 opacity-60">
                  Share the call link with your partner to connect
                </p>
              </div>

              {/* Name badge */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg glass text-sm font-medium text-[var(--text-primary)]">
                {peerName}
              </div>

              {/* Fullscreen button */}
              <button
                onClick={handleFullscreen}
                className="absolute top-4 right-4 p-2 rounded-lg glass text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>

            {/* Sidebar: local video + chat */}
            <div className="flex flex-col gap-4">
              {/* Local video */}
              <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)] overflow-hidden">
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-base)]/80">
                    <VideoOff size={32} className="text-[var(--text-muted)] opacity-40 mb-2" />
                    <p className="text-xs text-[var(--text-muted)]">Camera off</p>
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

                {/* You badge */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md glass text-xs font-medium text-[var(--text-primary)]">
                  You
                </div>
              </div>

              {/* Chat panel */}
              {showChat && (
                <div className="flex-1 min-h-[200px] rounded-2xl glass p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-accent-violet" />
                      <span className="text-sm font-heading font-semibold text-[var(--text-primary)]">
                        Chat
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {chatMessages.length} messages
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                    {chatMessages.map((msg, i) => (
                      <p key={i} className="text-xs text-[var(--text-muted)]">
                        <span
                          className={`font-medium ${
                            msg.from === 'You' ? 'text-accent-violet' : 'text-accent-amber'
                          }`}
                        >
                          {msg.from}:
                        </span>{' '}
                        {msg.text}
                      </p>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50"
                    />
                    <button
                      onClick={sendChat}
                      className="px-3 py-2 rounded-lg bg-accent-violet/10 text-accent-violet text-xs font-medium hover:bg-accent-violet/20 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div className="px-4 sm:px-6 py-4 border-t border-[var(--glass-border)]">
        <div className="flex items-center justify-center gap-3">
          {/* Mic */}
          <button
            onClick={toggleMic}
            className={`p-4 rounded-2xl transition-all ${
              micOn
                ? 'glass text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
            title={micOn ? 'Mute' : 'Unmute'}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-2xl transition-all ${
              cameraOn
                ? 'glass text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
            title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-2xl transition-all ${
              screenSharing
                ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30'
                : 'glass text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
            title={screenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-2xl transition-all ${
              showChat
                ? 'bg-accent-violet/10 text-accent-violet border border-accent-violet/20'
                : 'glass text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
            title={showChat ? 'Hide chat' : 'Show chat'}
          >
            <MessageSquare size={20} />
          </button>

          {/* Hang Up */}
          <button
            onClick={handleHangUp}
            className="p-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/20"
            title="End call"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function CallPage() {
  const { peerId } = useParams();
  const searchParams = useSearchParams();
  const [inCall, setInCall] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const peerName = searchParams.get('peer') || 'Peer';
  const skillName = searchParams.get('skill') || 'Skill Session';

  const handleJoinCall = () => {
    setTransitioning(true);
    // Lobby fades out, then call room mounts
    setTimeout(() => {
      setInCall(true);
      setTransitioning(false);
    }, 600);
  };

  if (!inCall) {
    return (
      <div
        className={`transition-all duration-500 ease-in-out ${
          transitioning
            ? 'opacity-0 scale-95 blur-sm'
            : 'opacity-100 scale-100 blur-0'
        }`}
      >
        <Lobby
          peerName={peerName}
          skillName={skillName}
          onJoin={handleJoinCall}
        />
      </div>
    );
  }

  return <CallRoom peerName={peerName} skillName={skillName} />;
}
