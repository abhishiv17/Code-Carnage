"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, User, Loader2, SignalHigh, Presentation, Circle, Clock } from "lucide-react";
import { useDraggable } from "@/hooks/use-draggable";
import { Mind2iRatingModal } from "@/components/mind2i-rating-modal";

function LiveSessionContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "learner";
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  const [connectionState, setConnectionState] = useState<"connecting" | "waiting" | "connected">("connecting");
  const [credits, setCredits] = useState(0.0);
  
  const { position, isDragging, handlePointerDown, dragRef } = useDraggable();

  // Simulate connection states
  useEffect(() => {
    const timer1 = setTimeout(() => setConnectionState("waiting"), 1000);
    const timer2 = setTimeout(() => setConnectionState("connected"), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Simulate credit accumulation ($1.0 / hr -> ~0.00027 per sec. We'll do 0.1 every 3 secs for demo)
  useEffect(() => {
    if (connectionState !== "connected") return;
    const interval = setInterval(() => {
      setCredits(prev => prev + 0.1);
    }, 3000);
    return () => clearInterval(interval);
  }, [connectionState]);

  const handleHangup = () => {
    setIsRatingModalOpen(true);
  };

  const accentColor = role === "mentor" ? "text-purple-500" : "text-teal-500";
  const accentBorder = role === "mentor" ? "border-purple-500/50" : "border-teal-500/50";
  const accentShadow = role === "mentor" ? "shadow-purple-500/20" : "shadow-teal-500/20";

  return (
    <main className="fixed inset-0 bg-[#08080C] text-slate-100 flex overflow-hidden font-sans">
      
      {/* Mesh Gradient Background for Cinema Mode */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-[#08080C] to-[#08080C]"></div>

      <div className="flex-1 relative flex flex-col items-center justify-center">
        
        {/* Signal Strength Badge */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-[#121218]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
          <SignalHigh className={`w-4 h-4 ${connectionState === 'connected' ? 'text-green-500' : 'text-yellow-500'}`} />
          <span className="text-sm font-bold text-white tracking-wide">
            {connectionState === 'connected' ? 'Excellent Connection' : 'Connecting...'}
          </span>
        </div>

        {/* Remote Video Stream (Main Stage) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#08080C]">
          {connectionState === "connecting" && (
            <div className="flex flex-col items-center text-slate-400 gap-4">
              <Loader2 className={`w-12 h-12 animate-spin ${accentColor}`} />
            </div>
          )}
          
          {connectionState === "waiting" && (
            <div className="flex flex-col items-center text-slate-400 gap-4">
              <div className="relative">
                <User className="w-20 h-20 text-slate-600" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></span>
                <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full"></span>
              </div>
              <p className="text-lg font-bold animate-pulse text-yellow-500/80">Waiting for peer...</p>
            </div>
          )}

          {connectionState === "connected" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex items-center justify-center object-cover"
            >
               {isWhiteboardActive ? (
                 <div className="w-[95%] h-[95%] bg-[#121218] rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden">
                   <div className={`absolute top-0 w-full h-1 bg-gradient-to-r ${role === 'mentor' ? 'from-purple-500 to-indigo-500' : 'from-teal-500 to-emerald-500'}`}></div>
                   <p className="text-slate-500 font-bold text-2xl tracking-widest uppercase">Collaborative Whiteboard</p>
                 </div>
               ) : (
                 <>
                   <User className="w-48 h-48 text-slate-800 opacity-30" />
                   <span className="absolute bottom-32 left-8 bg-[#121218]/80 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md border border-white/10 shadow-lg">
                     {role === "mentor" ? "Learner" : "Mentor"}
                   </span>
                 </>
               )}
            </motion.div>
          )}
        </div>

        {/* Local Video Stream (Draggable Picture-in-Picture) */}
        <div 
          ref={dragRef}
          onPointerDown={handlePointerDown}
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          className={`absolute top-8 right-8 z-30 w-56 h-72 bg-[#121218] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden border touch-none select-none 
            ${isDragging ? `cursor-grabbing scale-105 ${accentShadow} ${accentBorder}` : 'cursor-grab border-white/10 hover:border-white/30 transition-colors'}`}
        >
          {!isVideoOff ? (
            <div className="w-full h-full bg-[#111] flex items-center justify-center relative pointer-events-none scale-x-[-1]">
              <User className="w-20 h-20 text-slate-700" />
              <span className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md scale-x-[-1]">
                You
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-[#121218] flex flex-col items-center justify-center pointer-events-none relative">
              <User className="w-20 h-20 text-slate-800" />
              <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay"></div>
            </div>
          )}
        </div>

        {/* Controls Bar Overlay */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 z-40 flex items-center gap-4 bg-[#121218]/90 p-4 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center justify-center rounded-2xl h-14 w-14 transition-all border ${isMuted ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-white/5 text-white border-white/5 hover:bg-white/10'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`flex items-center justify-center rounded-2xl h-14 w-14 transition-all border ${isVideoOff ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-white/5 text-white border-white/5 hover:bg-white/10'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button 
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`flex items-center justify-center rounded-2xl h-14 w-14 transition-all border ${isScreenSharing ? `bg-${role === 'mentor' ? 'purple' : 'teal'}-600 text-white border-transparent` : 'bg-white/5 text-white border-white/5 hover:bg-white/10'}`}
          >
            <MonitorUp className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
            className={`flex items-center justify-center rounded-2xl h-14 w-14 transition-all border ${isWhiteboardActive ? `bg-${role === 'mentor' ? 'purple' : 'teal'}-600 text-white border-transparent` : 'bg-white/5 text-white border-white/5 hover:bg-white/10'}`}
          >
            <Presentation className="w-6 h-6" />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2"></div>

          <button 
            onClick={handleHangup}
            className="flex items-center justify-center rounded-2xl h-14 px-8 transition-all bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20 font-bold gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>
        </motion.div>

      </div>

      {/* Integrated Sidebar */}
      <div className="w-[340px] bg-[#0c0c11] border-l border-white/5 flex flex-col relative z-20">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight">Session Context</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-1 bg-white/5 rounded text-xs font-bold text-slate-400">Python</span>
            <span className="text-slate-600">⇄</span>
            <span className="px-2 py-1 bg-white/5 rounded text-xs font-bold text-slate-400">Guitar</span>
          </div>
        </div>

        {/* Live Credit Meter */}
        <div className="p-6 border-b border-white/5 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 pointer-events-none bg-${role === 'mentor' ? 'purple' : 'teal'}-500`}></div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Credit Meter</span>
            <Clock className={`w-4 h-4 ${accentColor} animate-pulse`} />
          </div>
          
          <div className="flex items-end gap-2">
            <span className={`text-5xl font-black tracking-tighter ${accentColor}`}>
              {credits.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-500 mb-1">CRD</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Rate: 1.0 Credits / hr</p>
        </div>

        {/* Session Recording Toggle */}
        <div className="p-6">
          <div className="bg-[#121218] border border-white/5 rounded-2xl p-5 group hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Record Session</h3>
                <p className="text-xs text-slate-400">Save for future reference</p>
              </div>
              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isRecording ? 'bg-red-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isRecording ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
            
            {/* Tooltip emulation */}
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-wider">Consent Required</span>
            </div>
            
            <AnimatePresence>
              {isRecording && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-center justify-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 py-2 rounded-lg"
                >
                  <Circle className="w-3 h-3 fill-red-500 animate-pulse" />
                  RECORDING ACTIVE
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isRatingModalOpen && (
          <Mind2iRatingModal 
            role={role as "mentor" | "learner"} 
            credits={credits.toFixed(1)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default function LiveSession() {
  return (
    <Suspense fallback={<div className="bg-[#08080C] min-h-screen"></div>}>
      <LiveSessionContent />
    </Suspense>
  );
}
