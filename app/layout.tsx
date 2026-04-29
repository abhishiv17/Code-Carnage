import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillSwap — Peer-to-Peer Skill Barter for College Students',
  description:
    'Exchange skills with fellow students. Teach what you know, learn what you want. No money needed — just skill credits.',
  keywords: ['skill exchange', 'peer learning', 'college', 'barter', 'skill credits'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange
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
        </QueryProvider>
      </body>
    </html>
  );
}
