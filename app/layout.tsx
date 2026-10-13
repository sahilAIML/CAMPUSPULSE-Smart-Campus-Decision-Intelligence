import type { Metadata, Viewport } from 'next';
import { Oxanium } from 'next/font/google';
import './globals.css';
import CampusPulseChatbot from '@/components/chatbot/CampusPulseChatbot';

const oxanium = Oxanium({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-oxanium',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CampusPulse — Student Success Platform | KPMG Smart Campus Analytics',
  description:
    'Decision intelligence & early-warning student success analytics platform converting student data into explainable interventions for faculty and administrators.',
  keywords: [
    'Student Success Platform',
    'Smart Campus Analytics',
    'KPMG Challenge',
    'Early Warning System',
    'Higher Education Analytics',
    'Attendance Risk',
    'Placement Readiness',
  ],
  authors: [{ name: 'CampusPulse Engineering' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${oxanium.variable} font-sans scroll-smooth`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.setItem('campuspulse_theme', 'white');
                  var root = document.documentElement;
                  root.classList.remove('dark', 'theme-bw');
                  root.classList.add('theme-white');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-[var(--clay-text)] antialiased transition-colors duration-300 font-sans relative">
        {/* Full-screen HD Background Animation Video (Edge-to-Edge Big Coverage) */}
        <div
          className="fixed inset-0 w-screen h-screen min-w-full min-h-full pointer-events-none -z-50 overflow-hidden"
          aria-hidden="true"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full min-w-full min-h-full object-cover scale-[1.01] filter brightness-[0.88] contrast-[1.12] saturate-[1.05]"
            src="/video-project-4.mp4"
          />
          {/* High-Contrast Frosted Scrim: Balances HD video motion with maximum text and card contrast */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-[1px] pointer-events-none" />
        </div>

        {children}
        <CampusPulseChatbot />
      </body>
    </html>
  );
}
