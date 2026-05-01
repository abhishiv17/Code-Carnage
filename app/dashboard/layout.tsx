'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { ChatbotWidget } from '@/components/shared/ChatbotWidget';
import { ROUTES } from '@/lib/constants';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, skills, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // `loading` is only true for ~5ms (localStorage read). No spinner needed.
    if (loading) return;

    if (!user) {
      router.replace(ROUTES.login);
      return;
    }

    // Only check onboarding once profile has loaded from DB.
    // profile === null means "still fetching", not "no profile".
    // profile !== null && skills.length === 0 means "profile loaded, no skills → onboarding".
    if (profile && skills.length === 0) {
      router.replace(ROUTES.onboarding);
    }
  }, [loading, user, profile, skills, router]);

  // Auth not determined yet — render nothing (instant, < 10ms)
  if (loading || !user) return null;

  return (
    <div className="min-h-screen">
      <Sidebar />
      {/* Main content: pushed right on desktop (lg+), full width on mobile */}
      <div className="lg:ml-[240px] transition-all duration-300">
        <TopBar />
        <main className="p-4 sm:p-6 pb-24 lg:pb-6 animate-page-in">
          {children}
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
