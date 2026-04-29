"use client";

import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, User } from "lucide-react";
import Link from "next/link";

export function VideoSession() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Remote Video Stream Placeholder */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {/* Simulating a remote video feed */}
        <div className="w-full h-full bg-slate-900 flex items-center justify-center object-cover">
           <User className="w-32 h-32 text-slate-700 opacity-50" />
           <span className="absolute bottom-24 left-8 bg-black/50 text-white px-3 py-1 rounded-md text-sm backdrop-blur-sm">
             Peer Student
           </span>
        </div>
      </div>

      {/* Local Video Stream Placeholder (Picture-in-Picture) */}
      <div className="absolute top-8 right-8 z-10 w-48 h-64 md:w-64 md:h-80 bg-slate-800 rounded-xl shadow-2xl overflow-hidden border-2 border-slate-700/50 transition-transform hover:scale-105">
        {!isVideoOff ? (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            {/* Replace with <video autoPlay muted playsInline className="object-cover w-full h-full" /> */}
            <User className="w-16 h-16 text-slate-500" />
            <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded text-xs backdrop-blur-sm">
              You
            </span>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center">
            <User className="w-16 h-16 text-slate-700" />
            <span className="mt-2 text-xs text-slate-500">Camera Off</span>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-8 z-20 flex items-center gap-4 bg-background/80 p-4 rounded-full backdrop-blur-md border border-border shadow-2xl">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`inline-flex items-center justify-center rounded-full h-14 w-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border ${isMuted ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`inline-flex items-center justify-center rounded-full h-14 w-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border ${isVideoOff ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <button 
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`inline-flex items-center justify-center rounded-full h-14 w-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border ${isScreenSharing ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
        >
          <MonitorUp className="w-6 h-6" />
        </button>

        <div className="w-px h-10 bg-border mx-2"></div>

        <Link href="/">
          <button 
            className="inline-flex items-center justify-center rounded-full h-14 w-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </Link>
      </div>

    </div>
  );
}
