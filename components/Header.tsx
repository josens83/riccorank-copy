'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useThemeStore, useLanguageStore } from '@/lib/store';
import { useSession, signOut } from 'next-auth/react';
import { FiSearch, FiMoon, FiSun, FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi';
import GlobalSearch from './GlobalSearch';
import MobileMenu from './MobileMenu';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { data: session, status } = useSession();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const menuItems = [
    { label: '홈', href: '/', hasDropdown: false },
    {
      label: '주식',
      href: '/stocklist',
      hasDropdown: true,
      subItems: [
        { label: '주식랭킹순위', href: '/stocklist' },
        { label: '종합스코어 순위', href: '/score' },
      ],
    },
    {
      label: '뉴스',
      href: '/news',
      hasDropdown: false,
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

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(var(--color-border), 0.2)' }}>
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <MobileMenu />

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl sm:text-2xl font-bold text-gradient group-hover:scale-105 transition-transform">
              RANKUP
            </span>
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
                  className="relative flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium interactive border-glow"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.hasDropdown && item.subItems && activeDropdown === item.label && (
                  <div className="absolute left-0 mt-1 w-48 rounded-xl glass-strong border" style={{ borderColor: 'rgba(var(--color-border), 0.2)', boxShadow: 'var(--shadow-xl)' }}>
                    <div className="py-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm rounded-lg interactive mx-1"
                          style={{ color: 'rgb(var(--color-text-primary))' }}
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            {/* Notifications - Only show for authenticated users */}
            <NotificationBell />

            {/* Dark Mode Toggle - Hidden on small mobile */}
            <button
              onClick={toggleDarkMode}
              className="hidden sm:flex p-2 rounded-lg interactive border-glow"
              style={{
                background: 'rgba(var(--color-surface), 0.5)',
                borderColor: 'rgba(var(--color-border), 0.2)',
                color: isDarkMode ? 'rgb(253, 224, 71)' : 'rgb(var(--color-text-primary))'
              }}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Language Toggle - Hidden on small mobile */}
            <button
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              className="hidden sm:flex w-10 h-10 rounded-lg border interactive border-glow items-center justify-center"
              style={{
                background: 'rgba(var(--color-surface), 0.5)',
                borderColor: 'rgba(var(--color-border), 0.2)',
                color: 'rgb(var(--color-text-primary))'
              }}
            >
              {language === 'ko' ? <span className="text-xl">🇰🇷</span> : <span className="text-xl">🇺🇸</span>}
            </button>

            {/* Login/User Menu - Hidden on mobile (handled by MobileMenu) */}
            {status === 'authenticated' && session?.user ? (
              <div className="relative group hidden lg:block">
                <button className="flex items-center space-x-2 interactive">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(var(--color-surface), 0.8)' }}>
                    {session.user.image ? (
                      <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
                    ) : (
                      <FiUser className="w-5 h-5" style={{ color: 'rgb(var(--color-text-primary))' }} />
                    )}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    {session.user.name || session.user.email}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-xl glass-strong border hidden group-hover:block" style={{ borderColor: 'rgba(var(--color-border), 0.2)', boxShadow: 'var(--shadow-xl)' }}>
                  <div className="py-1">
                    <Link href="/mypage" className="flex items-center px-4 py-2 text-sm rounded-lg interactive mx-1" style={{ color: 'rgb(var(--color-text-primary))' }}>
                      <FiUser className="w-4 h-4 mr-2" />
                      마이페이지
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center text-left px-4 py-2 text-sm rounded-lg interactive mx-1"
                      style={{ color: 'rgb(var(--color-text-primary))' }}
                    >
                      <FiLogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:inline-block px-4 py-2 rounded-xl text-white text-sm font-medium glow-hover interactive"
                style={{ background: 'var(--gradient-primary)' }}
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
