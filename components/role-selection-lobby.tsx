"use client";

import { useState } from "react";
import { Mic, BookOpen, Headphones, Notebook, Loader2, Users } from "lucide-react";

type Role = "teaching" | "learning" | null;

interface RoleSelectionLobbyProps {
  onJoinSession: () => void;
}

export function RoleSelectionLobby({ onJoinSession }: RoleSelectionLobbyProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleJoin = () => {
    setIsConnecting(true);
    // Simulate a brief connecting transition
    setTimeout(() => {
      onJoinSession();
      setIsConnecting(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        
        {/* Teaching Card */}
        <div 
          onClick={() => setSelectedRole("teaching")}
          className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 p-6 flex flex-col items-center text-center gap-4 
            ${selectedRole === "teaching" 
              ? "bg-slate-800/80 ring-2 ring-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] scale-105" 
              : "bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:scale-[1.02] hover:ring-2 hover:ring-purple-500/50"
            } backdrop-blur-md`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className={`p-4 rounded-full ${selectedRole === "teaching" ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-300 group-hover:text-purple-400"}`}>
            <Mic className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">I am Teaching</h3>
            <p className="text-sm text-slate-400">
              Share your expertise and earn skill credits.
            </p>
          </div>
        </div>

        {/* Learning Card */}
        <div 
          onClick={() => setSelectedRole("learning")}
          className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 p-6 flex flex-col items-center text-center gap-4 
            ${selectedRole === "learning" 
              ? "bg-slate-800/80 ring-2 ring-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] scale-105" 
              : "bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:scale-[1.02] hover:ring-2 hover:ring-purple-500/50"
            } backdrop-blur-md`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className={`p-4 rounded-full ${selectedRole === "learning" ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-300 group-hover:text-indigo-400"}`}>
            <Notebook className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">I am Learning</h3>
            <p className="text-sm text-slate-400">
              Spend credits to acquire a new skill.
            </p>
          </div>
        </div>

      </div>

      {/* Confirmation Action */}
      <div className={`transition-all duration-500 overflow-hidden ${selectedRole ? "opacity-100 max-h-32 mt-8" : "opacity-0 max-h-0"}`}>
        <button
          onClick={handleJoin}
          disabled={isConnecting}
          className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 hover:scale-105 transition-all shadow-xl disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed min-w-[200px]"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Join Session
            </>
          )}
        </button>
      </div>

    </div>
  );
}
