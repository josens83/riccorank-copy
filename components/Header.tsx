'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useThemeStore, useLanguageStore, useAuthStore } from '@/lib/store';
import { FiSearch, FiMoon, FiSun, FiChevronDown, FiUser } from 'react-icons/fi';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const menuItems = [
    {
      label: '홈',
      href: '/',
      hasDropdown: false
    },
    {
      label: '주식',
      href: '/stocklist',
      hasDropdown: true,
      subItems: [
        { label: '주식랭킹순위', href: '/stocklist' },
        { label: '해외펀드', href: '/funds' },
        { label: '종합스코어 순위', href: '/score' },
        { label: '금융위원회 공시', href: '/disclosure' },
        { label: '기관대표 Top100', href: '/institution' },
        { label: '재무 상장 순위', href: '/financial' },
        { label: '신규가', href: '/ipo' },
      ],
    },
    {
      label: '코인',
      href: '/coin',
      hasDropdown: true,
      subItems: [
        { label: '코인 시세', href: '/coin/price' },
        { label: '거래소별 시세', href: '/coin/exchange' },
      ],
    },
    {
      label: '뉴스',
      href: '/news',
      hasDropdown: true,
      subItems: [
        { label: '국내 뉴스', href: '/news' },
        { label: '해외 뉴스', href: '/news/global' },
      ],
    },
    {
      label: '커뮤니티',
      href: '/stockboard',
      hasDropdown: true,
      subItems: [
        { label: '주식 토론방', href: '/stockboard' },
        { label: '자유게시판', href: '/community/free' },
      ],
    },
    {
      label: '부동산살거래가',
      href: '/realestate',
      hasDropdown: false,
    },
    {
      label: '모의투자',
      href: '/simulation',
      hasDropdown: true,
      subItems: [
        { label: '모의투자 시작', href: '/simulation/start' },
        { label: '내 포트폴리오', href: '/simulation/portfolio' },
      ],
    },
    {
      label: '마이페이지',
      href: '/mypage',
      hasDropdown: true,
      subItems: [
        { label: '내 정보', href: '/mypage/profile' },
        { label: '즐겨찾기', href: '/mypage/bookmarks' },
        { label: '내 게시글', href: '/mypage/posts' },
      ],
    },
  ];

  const handleMouseEnter = (label: string) => {
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">RANKUP</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.hasDropdown && item.subItems && activeDropdown === item.label && (
                  <div
                    className={`absolute left-0 mt-1 w-48 rounded-md shadow-lg ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border`}
                  >
                    <div className="py-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className={`block px-4 py-2 text-sm ${
                            isDarkMode
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-48 pl-10 pr-4 py-2 rounded-md text-sm border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <FiSearch className={`absolute left-3 top-2.5 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md ${
                isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'
              } hover:opacity-80 transition-opacity`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              className={`w-10 h-10 rounded-md border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-700'
              } hover:bg-opacity-80 transition-all flex items-center justify-center`}
            >
              {language === 'ko' ? (
                <span className="text-xl">🇰🇷</span>
              ) : (
                <span className="text-xl">🇺🇸</span>
              )}
            </button>

            {/* Login/User Menu */}
            {isLoggedIn && user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <FiUser className="w-5 h-5" />
                  </div>
                </button>
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border hidden group-hover:block`}>
                  <div className="py-1">
                    <Link href="/mypage" className={`block px-4 py-2 text-sm ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      마이페이지
                    </Link>
                    <button
                      onClick={logout}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
