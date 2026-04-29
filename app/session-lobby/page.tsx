"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mic, Video, Zap } from "lucide-react";

type Role = "mentor" | "learner" | null;

export default function SessionLobby() {
  const [role, setRole] = useState<Role>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  return (
    <main className="min-h-screen bg-[#08080C] text-slate-100 p-6 flex flex-col font-sans">
      
      {/* Top Nav */}
      <nav className="w-full max-w-7xl mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-slate-300">System Ready</span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full space-y-12">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Select Your Role
          </h1>
          <p className="text-lg text-slate-400">
            Define your objective for this session to initialize the correct workspace.
          </p>
        </div>

        {/* Split Screen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Mentor Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRole("mentor")}
            className={`cursor-pointer relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300
              ${role === "mentor" 
                ? "bg-purple-900/20 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]" 
                : "bg-[#121218]/80 border-white/5 hover:border-white/20"
              }`}
          >
            {/* Radio Button */}
            <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${role === "mentor" ? "border-purple-500" : "border-slate-600"}`}>
              {role === "mentor" && <div className="w-3 h-3 bg-purple-500 rounded-full"></div>}
            </div>

            <div className="mb-6 w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">I am the Mentor</h2>
            <p className="text-slate-400 mb-6">Focus on teaching and accumulating skill credits.</p>
            
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <span className="block text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Earning Rate</span>
              <span className="text-xl font-mono text-white">+1.0 Credits / hr</span>
            </div>
          </motion.div>

          {/* Learner Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRole("learner")}
            className={`cursor-pointer relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300
              ${role === "learner" 
                ? "bg-teal-900/20 border-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.2)]" 
                : "bg-[#121218]/80 border-white/5 hover:border-white/20"
              }`}
          >
            {/* Radio Button */}
            <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${role === "learner" ? "border-teal-500" : "border-slate-600"}`}>
              {role === "learner" && <div className="w-3 h-3 bg-teal-500 rounded-full"></div>}
            </div>

            <div className="mb-6 w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <User className="w-8 h-8 text-teal-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">I am the Learner</h2>
            <p className="text-slate-400 mb-6">Focus on acquiring new skills by spending credits.</p>
            
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <span className="block text-xs text-teal-400 font-bold uppercase tracking-wider mb-1">Spending Rate</span>
              <span className="text-xl font-mono text-white">-1.0 Credits / hr</span>
            </div>
          </motion.div>

        </div>

        {/* Setup Check Bubble */}
        <div className="w-full max-w-2xl bg-[#121218] border border-white/10 p-4 rounded-full flex items-center justify-between gap-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-4 pl-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center overflow-hidden border border-white/5 relative">
              {isVideoOn ? (
                <>
                  <User className="w-6 h-6 text-slate-600" />
                  <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                </>
              ) : (
                <Video className="w-5 h-5 text-red-500/50" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Setup Preview</p>
              <p className="text-xs text-slate-400">Check your hair and audio.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500'}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isVideoOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500'}`}
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
          
          <div className="pr-2">
            {role ? (
              <Link href={`/session/live?role=${role}`}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all
                    ${role === "mentor" ? "bg-purple-600 shadow-purple-500/30" : "bg-teal-600 shadow-teal-500/30"}
                  `}
                >
                  GO LIVE
                </motion.button>
              </Link>
            ) : (
              <button 
                disabled
                className="px-8 py-3 rounded-full font-bold text-slate-500 bg-white/5 border border-white/5 cursor-not-allowed"
              >
                GO LIVE
              </button>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
