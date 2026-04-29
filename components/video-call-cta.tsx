"use client";

import { Video } from "lucide-react";

interface VideoCallCTAProps {
  onClick: () => void;
}

export function VideoCallCTA({ onClick }: VideoCallCTAProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative group">
        {/* Pulsing rings animation */}
        <div className="absolute -inset-4 bg-indigo-500 rounded-full opacity-20 group-hover:opacity-40 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute -inset-2 bg-indigo-400 rounded-full opacity-40 group-hover:opacity-60 animate-ping" style={{ animationDuration: '2s' }}></div>
        
        {/* Main button */}
        <button 
          onClick={onClick}
          className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 z-10"
        >
          <Video className="w-10 h-10 text-white" />
        </button>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Ready to Connect?
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Your match is waiting. Click the button above to jump into your skill-sharing session.
        </p>
      </div>
    </div>
  );
}
