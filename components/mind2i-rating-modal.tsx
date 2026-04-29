"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Award, Zap, CheckCircle2, HeartHandshake } from "lucide-react";
import Link from "next/link";

interface Mind2iRatingModalProps {
  role: "mentor" | "learner";
  credits: string;
}

export function Mind2iRatingModal({ role, credits }: Mind2iRatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const peerRoleText = role === "mentor" ? "Learner" : "Mentor";
  const actionText = role === "mentor" ? "Earn" : "Transfer";
  const accentColor = role === "mentor" ? "bg-purple-600 hover:bg-purple-500" : "bg-teal-600 hover:bg-teal-500";

  const badges = [
    { id: "patient", icon: HeartHandshake, label: "Patient Teacher" },
    { id: "fast", icon: Zap, label: "Fast Learner" },
    { id: "expert", icon: Award, label: "Subject Expert" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-full max-w-lg bg-[#121218] border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2">Session Complete</h2>
          <p className="text-slate-400 mb-8">
            How was your experience with the {peerRoleText}?
          </p>

          {/* 5-Star Rating */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none"
              >
                <Star 
                  className={`w-12 h-12 transition-colors ${
                    (hoveredRating || rating) >= star 
                      ? "fill-yellow-500 text-yellow-500" 
                      : "text-slate-700"
                  }`} 
                />
              </motion.button>
            ))}
          </div>

          {/* Badge Selection */}
          <div className="w-full mb-8">
            <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Give a Badge</p>
            <div className="flex justify-center gap-3">
              {badges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    selectedBadge === badge.id 
                      ? "bg-white/10 border-white/30 scale-105 shadow-lg" 
                      : "bg-[#08080C] border-white/5 opacity-60 hover:opacity-100"
                  }`}
                >
                  <badge.icon className={`w-6 h-6 ${selectedBadge === badge.id ? 'text-yellow-400' : 'text-slate-500'}`} />
                  <span className="text-[10px] font-bold text-slate-300">{badge.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Credit Summary */}
          <div className="w-full bg-[#08080C] border border-white/5 rounded-2xl p-4 mb-8 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Credit Summary</span>
            <span className="text-xl font-bold text-white">
              {actionText} {credits} CRD
            </span>
          </div>

          {/* Actions */}
          <Link href="/" className="w-full">
            <button
              disabled={rating === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${accentColor}`}
            >
              Confirm Settlement
            </button>
          </Link>

        </div>
      </motion.div>
    </motion.div>
  );
}
