'use client';

import Link from 'next/link';
import { useThemeStore } from '@/lib/store';
import { FiGithub, FiTwitter, FiFacebook, FiMail } from 'react-icons/fi';

export default function Footer() {
  const { isDarkMode } = useThemeStore();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: '회사 소개', href: '/about' },
      { label: '공지사항', href: '/notices' },
      { label: '채용', href: '/careers' },
      { label: '문의하기', href: '/contact' },
    ],
    service: [
      { label: '주식 랭킹', href: '/stocklist' },
      { label: '뉴스', href: '/news' },
      { label: '커뮤니티', href: '/stockboard' },
      { label: '검색', href: '/search' },
    ],
    legal: [
      { label: '이용약관', href: '/terms' },
      { label: '개인정보처리방침', href: '/privacy' },
      { label: '법적 고지', href: '/legal' },
      { label: '쿠키 정책', href: '/cookies' },
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: '고객센터', href: '/support' },
      { label: 'API 문서', href: '/docs/api' },
      { label: '개발자', href: '/developers' },
    ],
  };

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com/josens83', label: 'GitHub' },
    { icon: FiTwitter, href: 'https://twitter.com/rankup', label: 'Twitter' },
    { icon: FiFacebook, href: 'https://facebook.com/rankup', label: 'Facebook' },
    { icon: FiMail, href: 'mailto:contact@rankup.com', label: 'Email' },
  ];

  return (
    <footer className={`border-t ${
      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-[1920px] mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-blue-600">RANKUP</span>
            </Link>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              실시간 주식, 뉴스, 커뮤니티를 한 곳에서 제공하는 종합 금융 정보 플랫폼
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-md transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              회사
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              서비스
            </h3>
            <ul className="space-y-2">
              {footerLinks.service.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              법적 정보
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              고객지원
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t mb-8 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`} />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © {currentYear} RANKUP. All rights reserved.
          </div>

          {/* Additional Info */}
          <div className={`flex flex-wrap gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>사업자등록번호: 123-45-67890</span>
            <span>|</span>
            <span>대표이사: 홍길동</span>
            <span>|</span>
            <span>개인정보보호책임자: 김철수</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`mt-6 pt-6 border-t text-xs ${
          isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'
        }`}>
          <p className="mb-2">
            <strong>투자 유의사항:</strong> 본 서비스에서 제공하는 정보는 투자 판단의 참고자료이며, 투자의 최종 결정은 투자자 본인의 판단으로 하시기 바랍니다.
          </p>
          <p>
            당사는 제공된 정보의 정확성이나 완전성을 보장하지 않으며, 이를 이용한 투자 결과에 대한 법적 책임을 지지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
