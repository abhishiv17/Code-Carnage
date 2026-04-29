"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";

interface PeerRatingModalProps {
  onConfirm: () => void;
  peerRole: "teaching" | "learning";
}

export function PeerRatingModal({ onConfirm, peerRole }: PeerRatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const roleText = peerRole === "learning" ? "Teacher" : "Learner";
  const creditAction = peerRole === "learning" ? "Transfer 1.0 Credits" : "Earn 1.0 Credits";

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Session Complete</h2>
        <p className="text-slate-400 mb-8">
          How was your experience with your {roleText}?
        </p>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star 
                className={`w-10 h-10 transition-colors ${
                  (hoveredRating || rating) >= star 
                    ? "fill-yellow-500 text-yellow-500" 
                    : "text-slate-700"
                }`} 
              />
            </button>
          ))}
        </div>

        <button
          onClick={onConfirm}
          disabled={rating === 0}
          className="w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
            bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creditAction}
        </button>
        
        {rating === 0 && (
          <p className="text-xs text-slate-500 mt-4">Please leave a rating to complete the transfer.</p>
        )}
      </div>
    </div>
  );
}
