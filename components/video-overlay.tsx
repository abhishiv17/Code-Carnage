"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, User, Loader2, SignalHigh, Sidebar, Presentation, Circle, Clock } from "lucide-react";
import { useDraggable } from "@/hooks/use-draggable";
import { PeerRatingModal } from "./peer-rating-modal";

type ConnectionState = "connecting" | "waiting" | "connected";

interface VideoOverlayProps {
  onClose: () => void;
}

export function VideoOverlay({ onClose }: VideoOverlayProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [creditsEarned, setCreditsEarned] = useState(0.0);
  
  const { position, isDragging, handlePointerDown, dragRef } = useDraggable();

  // Simulate connection states
  useEffect(() => {
    const timer1 = setTimeout(() => setConnectionState("waiting"), 1500);
    const timer2 = setTimeout(() => setConnectionState("connected"), 4000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Simulate credit accumulation when connected
  useEffect(() => {
    if (connectionState !== "connected") return;
    const interval = setInterval(() => {
      setCreditsEarned(prev => prev + 0.1);
    }, 5000); // 0.1 credit every 5 seconds for demo
    return () => clearInterval(interval);
  }, [connectionState]);

  const handleHangup = () => {
    setIsRatingModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/95 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Mesh Gradient Background for Cinema Mode */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-[#121212] to-[#121212]"></div>

      <div className="relative w-full h-full flex overflow-hidden">
        
        {/* Main Stage Area */}
        <div className={`relative flex-1 h-full transition-all duration-500 flex items-center justify-center`}>
          
          {/* Signal Strength Indicator */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-[#1a1a1a]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-lg">
            <SignalHigh className={`w-4 h-4 ${connectionState === 'connected' ? 'text-emerald-500' : 'text-yellow-500'}`} />
            <span className="text-xs text-white/80 font-medium font-sans">
              {connectionState === 'connected' ? 'Excellent' : 'Connecting'}
            </span>
          </div>

          {/* Remote Video Stream (Main Stage) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#121212]">
            {connectionState === "connecting" && (
              <div className="flex flex-col items-center text-slate-400 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                <p className="text-lg font-medium animate-pulse font-sans">Establishing secure connection...</p>
              </div>
            )}
            
            {connectionState === "waiting" && (
              <div className="flex flex-col items-center text-slate-400 gap-4">
                <div className="relative">
                  <User className="w-20 h-20 text-slate-600" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></span>
                  <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full"></span>
                </div>
                <p className="text-lg font-medium animate-pulse text-yellow-500/80 font-sans">Waiting for peer to join...</p>
              </div>
            )}

            {connectionState === "connected" && (
              <div className="w-full h-full flex items-center justify-center object-cover">
                 {isWhiteboardActive ? (
                   <div className="w-full h-full bg-slate-50 m-4 rounded-3xl flex items-center justify-center border-4 border-purple-500 shadow-2xl">
                     <p className="text-slate-400 font-sans">Interactive Whiteboard Canvas</p>
                   </div>
                 ) : (
                   <>
                     <User className="w-32 h-32 text-slate-800 opacity-50" />
                     <span className="absolute bottom-32 left-8 bg-[#1a1a1a]/80 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-md border border-white/5 font-sans">
                       Peer Student
                     </span>
                   </>
                 )}
              </div>
            )}
          </div>

          {/* Local Video Stream (Draggable Picture-in-Picture with Mirror effect) */}
          <div 
            ref={dragRef}
            onPointerDown={handlePointerDown}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            className={`absolute top-8 right-8 z-30 w-48 h-64 bg-[#1a1a1a] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden border border-white/10 touch-none select-none 
              ${isDragging ? 'cursor-grabbing scale-105 shadow-purple-500/20 border-purple-500/50' : 'cursor-grab hover:scale-105 transition-transform'}`}
          >
            {!isVideoOff ? (
              <div className="w-full h-full bg-[#222] flex items-center justify-center relative pointer-events-none scale-x-[-1]">
                <User className="w-16 h-16 text-slate-600" />
                <span className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded text-xs backdrop-blur-sm font-sans scale-x-[-1]">
                  You
                </span>
              </div>
            ) : (
              <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center pointer-events-none">
                <User className="w-16 h-16 text-slate-700" />
                <span className="mt-2 text-xs text-slate-500 font-sans">Camera Off</span>
              </div>
            )}
          </div>

          {/* Controls Bar Overlay */}
          <div className="absolute bottom-8 z-40 flex items-center gap-3 bg-[#1a1a1a]/80 p-3 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`inline-flex items-center justify-center rounded-full h-12 w-12 transition-colors focus-visible:outline-none border border-white/5 ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/20' : 'bg-[#2a2a2a] text-slate-200 hover:bg-[#333]'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`inline-flex items-center justify-center rounded-full h-12 w-12 transition-colors focus-visible:outline-none border border-white/5 ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/20' : 'bg-[#2a2a2a] text-slate-200 hover:bg-[#333]'}`}
              title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`inline-flex items-center justify-center rounded-full h-12 w-12 transition-colors focus-visible:outline-none border border-white/5 ${isScreenSharing ? 'bg-purple-600 text-white hover:bg-purple-500 border-purple-500' : 'bg-[#2a2a2a] text-slate-200 hover:bg-[#333]'}`}
              title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
            >
              <MonitorUp className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
              className={`inline-flex items-center justify-center rounded-full h-12 w-12 transition-colors focus-visible:outline-none border border-white/5 ${isWhiteboardActive ? 'bg-purple-600 text-white hover:bg-purple-500 border-purple-500' : 'bg-[#2a2a2a] text-slate-200 hover:bg-[#333]'}`}
              title={isWhiteboardActive ? "Close Whiteboard" : "Open Whiteboard"}
            >
              <Presentation className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-1"></div>

            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={`inline-flex items-center justify-center rounded-full h-12 w-12 transition-colors focus-visible:outline-none border border-white/5 ${isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50' : 'bg-[#2a2a2a] text-slate-200 hover:bg-[#333]'}`}
              title={isRecording ? "Stop Recording" : "Record Session"}
            >
              <div className="relative flex items-center justify-center">
                {isRecording && <span className="absolute animate-ping h-4 w-4 rounded-full bg-red-400 opacity-75"></span>}
                <Circle className={`w-5 h-5 ${isRecording ? 'fill-red-500 text-red-500' : ''}`} />
              </div>
            </button>

            <div className="w-px h-8 bg-white/10 mx-1"></div>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`inline-flex items-center justify-center rounded-full h-12 w-12 transition-colors focus-visible:outline-none border border-white/5 ${isSidebarOpen ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'bg-[#2a2a2a] text-slate-200 hover:bg-[#333]'}`}
              title="Toggle Sidebar"
            >
              <Sidebar className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-1"></div>

            <button 
              onClick={handleHangup}
              className="inline-flex items-center justify-center rounded-full h-12 w-12 transition-colors focus-visible:outline-none bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20"
              title="End Call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Skill-Barter Side Panel */}
        <div 
          className={`h-full bg-[#1a1a1a] border-l border-white/5 shadow-2xl transition-all duration-500 ease-in-out flex flex-col ${isSidebarOpen ? 'w-[320px] translate-x-0' : 'w-0 translate-x-full opacity-0'}`}
        >
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white font-sans tracking-tight">Active Exchange</h2>
            <p className="text-sm text-slate-400 mt-1 font-sans">Python <span className="text-purple-400 mx-1">⇄</span> Guitar</p>
          </div>

          <div className="p-6 border-b border-white/5 bg-purple-500/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 font-sans font-medium">Live Credit Tracker</span>
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400 font-sans tracking-tight">
                {creditsEarned.toFixed(1)}
              </span>
              <span className="text-sm text-emerald-400/70 font-sans uppercase tracking-wider">Credits</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-sans">Automatically tallying time spent in session.</p>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-slate-300 font-sans mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              Shared Scratchpad
            </h3>
            <textarea 
              className="flex-1 w-full bg-[#121212] border border-white/10 rounded-xl p-4 text-slate-300 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-slate-600"
              placeholder="Take session notes here. These are saved to your dashboard..."
            ></textarea>
          </div>
        </div>

      </div>

      {isRatingModalOpen && (
        <PeerRatingModal 
          peerRole="learning" 
          onConfirm={onClose} 
        />
      )}

    </div>
  );
}
