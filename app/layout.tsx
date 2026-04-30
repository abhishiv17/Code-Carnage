import type { Metadata, Viewport } from 'next';
import { Sora, DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { UserProvider } from '@/hooks/useUser';
import { Toaster } from 'sonner';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#bdf2b5',
};

export const metadata: Metadata = {
  title: 'SkillSwap — Peer-to-Peer Skill Barter for College Students',
  description:
    'Exchange skills with fellow students. Teach what you know, learn what you want. No money needed — just skill credits.',
  keywords: ['skill exchange', 'peer learning', 'college', 'barter', 'skill credits'],
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${dmSans.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <QueryProvider>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem={true}
            >
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: 'var(--bg-cream)',
                    border: '1px solid var(--border-soft)',
                    color: 'var(--text-primary)',
                  },
                }}
              />
            </ThemeProvider>
          </UserProvider>
        </QueryProvider>
        
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
