'use client';

import "./globals.css";
import Header from "@/components/Header";
import SessionProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useThemeStore } from "@/lib/store";
import { useEffect } from "react";

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
  }, [isDarkMode]);

  return (
    <html lang="ko">
      <head>
        <title>RANKUP - 종합 금융 정보 플랫폼</title>
        <meta name="description" content="실시간 주식, 코인, 뉴스 정보를 한 곳에서" />
      </head>
      <body
        className={`font-sans antialiased ${
          isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
        }`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <SessionProvider>
              <Header />
              {children}
            </SessionProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
