'use client';

import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/shared/Toast";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { useThemeStore } from "@/lib/store";
import { useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import { initMixpanel } from '@/lib/analytics';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Initialize Mixpanel
    initMixpanel();
  }, [isDarkMode]);

  return (
    <html lang="ko">
      <head>
        <title>RANKUP - 종합 금융 정보 플랫폼</title>
        <meta name="description" content="실시간 주식, 코인, 뉴스 정보를 한 곳에서" />
      </head>
      <body
        className="antialiased font-sans"
        style={{
          background: isDarkMode ? 'rgb(var(--color-bg))' : 'rgb(var(--color-bg))',
          color: isDarkMode ? 'rgb(var(--color-text-primary))' : 'rgb(var(--color-text-primary))'
        }}
      >
        <ErrorBoundary>
          <ToastProvider>
            <SessionProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </SessionProvider>
          </ToastProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
