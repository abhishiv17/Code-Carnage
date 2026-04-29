'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff,
  MessageSquare, Clock, Maximize2, Minimize2,
  ArrowLeft, Loader2, User,
} from 'lucide-react';

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
    <span className="flex items-center gap-1.5 text-sm text-gray-400 font-mono">
      <Clock size={14} />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

/* ─── Dark Video Call Room ─── */
function CallRoom({ peerName, skillName, onEndCall }: { peerName: string; skillName: string; onEndCall: () => void }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isHangingUp, setIsHangingUp] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: peerName, text: 'Hey! Ready to start?' },
    { from: 'You', text: "Let's go! 🚀" },
  ]);
  const [chatInput, setChatInput] = useState('');

  const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const initials = peerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Initialize media on mount
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        setLocalStream(stream);
      } catch (err) {
        console.error('Failed to get media:', err);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // Bind local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOn(track.enabled); }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  }, [localStream]);

  const toggleScreenShare = useCallback(async () => {
    if (!screenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        screenStreamRef.current = displayStream;

        // Show screen share in the main (remote) video area
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = displayStream;
          remoteVideoRef.current.style.opacity = '1';
        }

        screenTrack.onended = () => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
            remoteVideoRef.current.style.opacity = '0';
          }
          screenStreamRef.current = null;
          setScreenSharing(false);
        };
        setScreenSharing(true);
      } catch { console.log('Screen share cancelled'); }
    } else {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
        remoteVideoRef.current.style.opacity = '0';
      }
      screenStreamRef.current = null;
      setScreenSharing(false);
    }
  }, [screenSharing]);

  const handleHangUp = useCallback(() => {
    if (isHangingUp) return;
    setIsHangingUp(true);
    localStream?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    setTimeout(() => onEndCall(), 1800);
  }, [localStream, onEndCall, isHangingUp]);

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
    setChatMessages(prev => [...prev, { from: 'You', text: chatInput.trim() }]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white relative select-none">
      {/* ── Hang Up Overlay ── */}
      {isHangingUp && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-xl animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center animate-bounce">
            <PhoneOff size={32} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
          <p className="text-sm text-gray-400 mb-6">Redirecting to dashboard…</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/sessions" className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white">Live Session — {skillName}</h1>
            <p className="text-xs text-gray-500">with {peerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CallTimer />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative p-4">
          {/* Remote / Main Video */}
          <div className="absolute inset-4 rounded-2xl bg-gray-900 border border-gray-800/50 overflow-hidden">
            <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500" />

            {/* Peer waiting placeholder */}
            {!screenSharing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative mb-5">
                  <Image src={peerAvatar} alt={peerName} width={96} height={96} className="w-24 h-24 rounded-full ring-4 ring-purple-500/20" />
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
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm">
                <Monitor size={12} className="text-purple-400" />
                <span className="text-[11px] font-semibold text-purple-300">Screen Sharing</span>
              </div>
            )}

            {/* Peer name badge */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-gray-900/70 backdrop-blur-md border border-gray-700/50 text-sm font-medium text-white">
              {peerName}
            </div>

            {/* Fullscreen btn */}
            <button onClick={handleFullscreen} className="absolute top-4 right-4 p-2 rounded-lg bg-gray-900/70 backdrop-blur-md border border-gray-700/50 text-gray-400 hover:text-white transition-colors">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {/* ── Local PiP Video ── */}
          <div className="absolute bottom-8 right-8 w-48 h-36 sm:w-56 sm:h-40 rounded-2xl bg-gray-800 border-2 border-gray-700/50 overflow-hidden shadow-2xl shadow-black/50 z-20 group hover:scale-105 transition-transform cursor-move">
            <video
              ref={localVideoRef}
              autoPlay playsInline muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraOn ? 'opacity-100' : 'opacity-0'}`}
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
              <div className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80">
                <MicOff size={10} className="text-white" />
              </div>
            )}

            {/* Name badge */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-gray-900/80 backdrop-blur-sm text-[10px] font-medium text-gray-300">
              You {screenSharing && '· Sharing'}
            </div>
          </div>
        </div>

        {/* ── Chat Panel ── */}
        {showChat && (
          <div className="w-80 border-l border-gray-800/60 flex flex-col bg-gray-900/50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-purple-400" />
                <span className="text-sm font-bold text-white">Chat</span>
              </div>
              <span className="text-[10px] text-gray-500">{chatMessages.length} messages</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.from === 'You' ? 'flex-row-reverse' : ''}`}>
                  <div className={`px-3 py-2 rounded-xl text-xs max-w-[80%] ${
                    msg.from === 'You'
                      ? 'bg-purple-500/20 text-purple-200 rounded-tr-sm'
                      : 'bg-gray-800 text-gray-300 rounded-tl-sm'
                  }`}>
                    <p className={`text-[10px] font-semibold mb-0.5 ${msg.from === 'You' ? 'text-purple-400' : 'text-amber-400'}`}>{msg.from}</p>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 py-3 border-t border-gray-800/60">
              <div className="flex gap-2">
                <input
                  type="text" value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700/50 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <button onClick={sendChat} className="px-3 py-2 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-medium hover:bg-purple-500/30 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Controls Bar (Glassmorphism) ── */}
      <div className="px-6 py-4 border-t border-gray-800/40">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/30">
          {/* Mic */}
          <button onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'}
            className={`p-3.5 rounded-xl transition-all ${micOn ? 'bg-gray-700/50 text-white hover:bg-gray-700' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Camera */}
          <button onClick={toggleCamera} title={cameraOn ? 'Camera off' : 'Camera on'}
            className={`p-3.5 rounded-xl transition-all ${cameraOn ? 'bg-gray-700/50 text-white hover:bg-gray-700' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Share */}
          <button onClick={toggleScreenShare} title={screenSharing ? 'Stop sharing' : 'Share screen'}
            className={`p-3.5 rounded-xl transition-all ${screenSharing ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-700/50 text-white hover:bg-gray-700'}`}>
            {screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>

          {/* Chat */}
          <button onClick={() => setShowChat(!showChat)} title={showChat ? 'Hide chat' : 'Show chat'}
            className={`p-3.5 rounded-xl transition-all ${showChat ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-700/50 text-white hover:bg-gray-700'}`}>
            <MessageSquare size={20} />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-700/50 mx-1" />

          {/* End Call */}
          <button onClick={handleHangUp} title="End call"
            className="p-3.5 rounded-xl bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30">
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Lobby (Pre-flight) ─── */
function Lobby({ onJoin, peerName, skillName }: { onJoin: () => void; peerName: string; skillName: string }) {
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
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        setStream(s); setCameraReady(true); setMicReady(true);
      } catch (err: any) {
        setError(err.name === 'NotAllowedError'
          ? 'Camera/mic access denied. Please allow in browser settings.'
          : `Could not access camera/mic: ${err.message}`);
      }
    }
    init();
    return () => { cancelled = true; stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && stream) localVideoRef.current.srcObject = stream;
  }, [stream]);

  const toggleCam = () => { if (!stream) return; const t = stream.getVideoTracks()[0]; if (t) { t.enabled = !t.enabled; setCameraOn(t.enabled); } };
  const toggleMic = () => { if (!stream) return; const t = stream.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; setMicOn(t.enabled); } };
  const handleJoin = () => { stream?.getTracks().forEach(t => t.stop()); onJoin(); };

  const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent-violet/8 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-emerald/6 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <Link href="/dashboard/matches" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Matches
        </Link>
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center">
            <Video size={24} className="text-accent-violet" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Pre-flight Check</h1>
          <p className="text-sm text-[var(--text-muted)]">Make sure your camera and mic are working before joining</p>
        </div>
        <div className="flex items-center justify-center gap-4 mb-6 p-3 rounded-xl glass">
          <Image src={peerAvatar} alt={peerName} width={40} height={40} className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Skill session with <strong>{peerName}</strong></p>
            <p className="text-xs text-[var(--text-muted)]">Skill: {skillName}</p>
          </div>
        </div>
        <div className="relative aspect-video rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)] overflow-hidden mb-6">
          <video ref={localVideoRef} autoPlay playsInline muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraOn && stream ? 'opacity-100' : 'opacity-0'}`}
            style={{ transform: 'scaleX(-1)' }} />
          {(!cameraOn || !stream) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <VideoOff size={48} className="text-[var(--text-muted)] opacity-30 mb-3" />
              <p className="text-sm text-[var(--text-muted)]">{error ? 'Camera unavailable' : 'Camera is off'}</p>
            </div>
          )}
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${cameraReady ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cameraReady ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-red-500/10 text-red-400'}`}>
              {cameraReady ? <Video size={16} /> : <VideoOff size={16} />}
            </div>
            <div><p className="text-xs font-medium text-[var(--text-primary)]">Camera</p><p className="text-[10px] text-[var(--text-muted)]">{cameraReady ? 'Ready' : 'Not available'}</p></div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${micReady ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${micReady ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-red-500/10 text-red-400'}`}>
              {micReady ? <Mic size={16} /> : <MicOff size={16} />}
            </div>
            <div><p className="text-xs font-medium text-[var(--text-primary)]">Microphone</p><p className="text-[10px] text-[var(--text-muted)]">{micReady ? 'Ready' : 'Not available'}</p></div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mb-8">
          <button onClick={toggleCam} className={`p-3.5 rounded-2xl transition-all ${cameraOn ? 'glass text-[var(--text-primary)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button onClick={toggleMic} className={`p-3.5 rounded-2xl transition-all ${micOn ? 'glass text-[var(--text-primary)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>
        <button onClick={handleJoin}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-emerald text-white font-bold text-base shadow-lg shadow-accent-violet/20 hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
          <Video size={20} /> Join Call
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function CallPage() {
  const { peerId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inCall, setInCall] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const peerName = searchParams.get('peer') || 'Peer';
  const skillName = searchParams.get('skill') || 'Skill Session';

  const handleJoinCall = () => {
    setTransitioning(true);
    setTimeout(() => { setInCall(true); setTransitioning(false); }, 600);
  };

  const handleEndCall = () => {
    router.push('/dashboard/sessions');
  };

  if (!inCall) {
    return (
      <div className={`transition-all duration-500 ease-in-out ${transitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        <Lobby peerName={peerName} skillName={skillName} onJoin={handleJoinCall} />
      </div>
    );
  }

  return <CallRoom peerName={peerName} skillName={skillName} onEndCall={handleEndCall} />;
}
