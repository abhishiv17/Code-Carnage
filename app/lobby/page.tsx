"use client";

import { useState } from "react";
import { RoleSelectionLobby } from "@/components/role-selection-lobby";
import { VideoOverlay } from "@/components/video-overlay";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LobbyPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-6 relative">
      
      {/* Back to Home Navigation */}
      <div className="w-full max-w-6xl mt-4 mb-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-4xl text-center flex flex-col items-center mt-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Session Lobby
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-16">
          Choose your role for this session to get started. Once you're ready, join the session to connect with your peer.
        </p>

        <div className="w-full flex flex-col items-center">
          <RoleSelectionLobby onJoinSession={() => setIsVideoModalOpen(true)} />
        </div>
      </div>

      {/* Conditionally Render Video Overlay */}
      {isVideoModalOpen && (
        <VideoOverlay onClose={() => setIsVideoModalOpen(false)} />
      )}
    </main>
  );
}
