'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useThemeStore, useLanguageStore } from '@/lib/store';
import { useSession, signOut } from 'next-auth/react';
import {
  FiMenu,
  FiX,
  FiHome,
  FiTrendingUp,
  FiFileText,
  FiMessageCircle,
  FiUser,
  FiLogOut,
  FiChevronRight,
  FiMoon,
  FiSun
} from 'react-icons/fi';

export default function MobileMenu() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    {
      icon: FiHome,
      label: '홈',
      href: '/',
    },
    {
      icon: FiTrendingUp,
      label: '주식 랭킹',
      href: '/stocklist',
    },
    {
      icon: FiFileText,
      label: '뉴스',
      href: '/news',
    },
    {
      icon: FiMessageCircle,
      label: '커뮤니티',
      href: '/stockboard',
    },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`lg:hidden p-2 rounded-md ${
          isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        } transition-colors`}
        aria-label="메뉴 열기"
      >
        <FiMenu className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-[101] transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <Link
              href="/"
              onClick={closeMenu}
              className="text-2xl font-bold text-blue-600"
            >
              RANKUP
            </Link>
            <button
              onClick={closeMenu}
              className={`p-2 rounded-md ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors`}
              aria-label="메뉴 닫기"
            >
              <FiX className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>

          {/* User Section */}
          {status === 'authenticated' && session?.user ? (
            <div className={`p-4 border-b ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <Link
                href="/mypage"
                onClick={closeMenu}
                className="flex items-center space-x-3"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <FiUser className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {session.user.name || '사용자'}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {session.user.email}
                  </div>
                </div>
                <FiChevronRight className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              </Link>
            </div>
          ) : (
            <div className={`p-4 border-b ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                로그인
              </Link>
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center space-x-3 px-4 py-3 ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {status === 'authenticated' && (
              <>
                <div className={`my-2 border-t ${
                  isDarkMode ? 'border-gray-800' : 'border-gray-200'
                }`} />
                <Link
                  href="/mypage"
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 px-4 py-3 ${
                    isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } transition-colors`}
                >
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">마이페이지</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center space-x-3 px-4 py-3 ${
                    isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } transition-colors text-left`}
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">로그아웃</span>
                </button>
              </>
            )}
          </nav>

          {/* Footer Settings */}
          <div className={`p-4 border-t ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                다크모드
              </span>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md ${
                  isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'
                } transition-colors`}
                aria-label="테마 전환"
              >
                {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                언어
              </span>
              <button
                onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                className={`px-3 py-2 rounded-md border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-700'
                } transition-colors flex items-center space-x-2`}
              >
                <span className="text-lg">{language === 'ko' ? '🇰🇷' : '🇺🇸'}</span>
                <span className="text-sm font-medium">{language === 'ko' ? '한국어' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
