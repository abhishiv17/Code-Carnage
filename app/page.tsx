"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Video, Search, User, Zap } from "lucide-react";

export default function LandingHub() {
  return (
    <main className="min-h-screen bg-[#08080C] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl w-full z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            Master Python.<br/>
            Trade for Guitar.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
              Zero Cash.
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The world's first peer-to-peer skill barter platform. Teach what you know, learn what you love.
          </p>
        </motion.div>

        {/* Skill Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-2xl mb-12"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50"></div>
            <div className="relative flex items-center bg-[#121218] border border-white/10 rounded-2xl p-2 backdrop-blur-[12px] shadow-2xl">
              <Search className="w-6 h-6 text-slate-400 ml-4 mr-2" />
              <input 
                type="text" 
                placeholder="What do you want to learn?" 
                className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none placeholder:text-slate-500 py-3"
              />
              <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-colors border border-white/5">
                Search
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Python', 'UI Design', 'French', 'Guitar', 'Machine Learning'].map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Active Match Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 w-full max-w-xl mb-12 flex items-center gap-6 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
          
          <div className="relative">
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center border-2 border-purple-500">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#121218]"></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">Perfect Match</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Sarah wants to learn Python from you!</h3>
            <p className="text-sm text-slate-400">She can teach you Guitar in exchange.</p>
          </div>
        </motion.div>

        {/* Primary CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center w-full"
        >
          <Link href="/session-lobby" className="group relative">
            <div className="absolute inset-0 bg-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity animate-pulse"></div>
            <div className="relative flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl transition-transform transform group-hover:scale-105">
              <Video className="w-6 h-6" />
              Enter Exchange Lobby
            </div>
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
