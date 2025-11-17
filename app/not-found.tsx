'use client';

import Link from 'next/link';
import { useThemeStore } from '@/lib/store';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  const { isDarkMode } = useThemeStore();

  return (
    <main className={`min-h-screen flex items-center justify-center px-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className={`text-9xl font-bold mb-4 ${
            isDarkMode ? 'text-gray-700' : 'text-gray-300'
          }`}>
            404
          </h1>
          <div className={`text-6xl mb-4`}>🔍</div>
        </div>

        {/* Error Message */}
        <h2 className={`text-3xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          페이지를 찾을 수 없습니다
        </h2>
        <p className={`text-lg mb-8 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className={`inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>이전 페이지</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FiHome className="w-5 h-5" />
            <span>홈으로</span>
          </Link>
          <Link
            href="/search"
            className={`inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            <FiSearch className="w-5 h-5" />
            <span>검색</span>
          </Link>
        </div>

        {/* Popular Links */}
        <div className={`mt-12 pt-8 border-t ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <h3 className={`text-sm font-medium mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            인기 페이지
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: '주식 랭킹', href: '/stocklist' },
              { label: '뉴스', href: '/news' },
              { label: '커뮤니티', href: '/stockboard' },
              { label: '마이페이지', href: '/mypage' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
