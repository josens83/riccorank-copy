'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { mockMarketIndices, mockThemeStocks, mockUpLimitStocks } from '@/lib/data';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMessageSquare,
  FiArrowUp,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiZap,
  FiArrowRight,
  FiGlobe,
} from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  const { isDarkMode } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    const icon = isPositive ? (
      <FiTrendingUp className="w-3 h-3" />
    ) : (
      <FiTrendingDown className="w-3 h-3" />
    );
    const color = isPositive ? 'text-red-500' : 'text-blue-500';

    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {icon}
        <span className="text-sm font-semibold">
          {sign}
          {percent.toFixed(2)}%
        </span>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Hero Section with Linear Style Gradients */}
      <div className="relative">
        {/* Background Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 -left-4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgb(59, 130, 246) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgb(168, 85, 247) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{
              background: 'radial-gradient(circle, rgb(236, 72, 153) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center mb-12 reveal active">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border-glow">
              <FiZap className="w-4 h-4 text-gradient" />
              <span className="text-sm font-medium text-gradient">
                AI 기반 실시간 투자 플랫폼
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              투자의 새로운{' '}
              <span className="text-gradient">기준</span>
            </h1>

            <p
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              실시간 시장 데이터, AI 분석, 커뮤니티가 하나로.
              <br />
              스마트한 투자 의사결정을 위한 모든 것.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/stocklist"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold interactive glow-hover"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
              >
                투자 시작하기
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold glass border-glow interactive"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                <FiBarChart2 className="w-5 h-5" />
                프리미엄 플랜
              </Link>
            </div>
          </div>

          {/* Bento Grid - Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {/* Large Feature Card - Market Indices */}
            <div className="md:col-span-2 lg:row-span-2 glass-strong rounded-2xl p-6 border-glow card-hover">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-primary">
                    <FiGlobe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{ color: 'rgb(var(--color-text-primary))' }}
                    >
                      글로벌 시장 현황
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: 'rgb(var(--color-text-secondary))' }}
                    >
                      실시간 업데이트
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-primary text-white">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </span>
              </div>

              {/* Market Indices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockMarketIndices.slice(0, 4).map((index) => (
                  <div
                    key={index.id}
                    className="p-4 rounded-xl interactive"
                    style={{
                      background: isDarkMode
                        ? 'rgba(var(--color-surface), 0.5)'
                        : 'rgba(var(--color-bg-secondary), 1)',
                      border: '1px solid rgba(var(--color-border), 0.5)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div
                          className="text-xs mb-1"
                          style={{ color: 'rgb(var(--color-text-tertiary))' }}
                        >
                          {index.country === '국내' ? '🇰🇷' : '🇺🇸'} {index.country}
                        </div>
                        <div
                          className="font-semibold"
                          style={{ color: 'rgb(var(--color-text-primary))' }}
                        >
                          {index.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: 'rgb(var(--color-text-primary))' }}
                        >
                          {formatNumber(index.value)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {formatChange(index.change, index.changePercent)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Stocks Card */}
            <div className="glass-strong rounded-2xl p-6 border-glow card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
                  <FiMessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    오늘의 테마
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    HOT 섹터
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {mockThemeStocks.slice(0, 3).map((theme) => (
                  <div
                    key={theme.id}
                    className="p-3 rounded-lg interactive"
                    style={{
                      background: isDarkMode
                        ? 'rgba(var(--color-surface), 0.5)'
                        : 'rgba(var(--color-bg-secondary), 1)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: 'rgb(var(--color-text-primary))' }}
                      >
                        {theme.name}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          theme.changePercent >= 0 ? 'text-red-500' : 'text-blue-500'
                        }`}
                      >
                        +{theme.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/themes"
                className="mt-4 flex items-center gap-2 text-sm font-medium group"
                style={{ color: 'rgb(var(--color-primary))' }}
              >
                전체 테마 보기
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stats Card */}
            <div className="glass-strong rounded-2xl p-6 border-glow card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500">
                  <FiActivity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    시장 동향
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    실시간 분석
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: isDarkMode
                      ? 'rgba(var(--color-surface), 0.5)'
                      : 'rgba(var(--color-bg-secondary), 1)',
                  }}
                >
                  <div
                    className="text-xs mb-1"
                    style={{ color: 'rgb(var(--color-text-tertiary))' }}
                  >
                    상승 종목
                  </div>
                  <div
                    className="text-2xl font-bold text-red-500"
                  >
                    342
                  </div>
                </div>

                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: isDarkMode
                      ? 'rgba(var(--color-surface), 0.5)'
                      : 'rgba(var(--color-bg-secondary), 1)',
                  }}
                >
                  <div
                    className="text-xs mb-1"
                    style={{ color: 'rgb(var(--color-text-tertiary))' }}
                  >
                    하락 종목
                  </div>
                  <div className="text-2xl font-bold text-blue-500">
                    128
                  </div>
                </div>
              </div>
            </div>

            {/* Up Limit Card */}
            <div className="glass-strong rounded-2xl p-6 border-glow card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500">
                  <FiArrowUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    상한가
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    급등 종목
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {mockUpLimitStocks.slice(0, 3).map((stock, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg interactive"
                    style={{
                      background: isDarkMode
                        ? 'rgba(var(--color-surface), 0.5)'
                        : 'rgba(var(--color-bg-secondary), 1)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: 'rgb(var(--color-text-primary))' }}
                        >
                          {stock.name}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: 'rgb(var(--color-text-tertiary))' }}
                        >
                          {stock.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-sm font-bold"
                          style={{ color: 'rgb(var(--color-text-primary))' }}
                        >
                          {stock.price.toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-red-500">
                          +{stock.changePercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/uplimit"
                className="mt-4 flex items-center gap-2 text-sm font-medium group"
                style={{ color: 'rgb(var(--color-primary))' }}
              >
                전체 목록 보기
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* AI Analysis Card */}
            <div className="md:col-span-2 glass-strong rounded-2xl p-6 border-glow card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500">
                  <FiPieChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    AI 기반 투자 분석
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    프리미엄 기능
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-xl mb-4"
                style={{
                  background: isDarkMode
                    ? 'rgba(var(--color-surface), 0.5)'
                    : 'rgba(var(--color-bg-secondary), 1)',
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                  머신러닝 기반의 실시간 시장 분석으로 최적의 투자 타이밍을 찾아드립니다.
                  과거 데이터와 현재 트렌드를 분석하여 종목 추천과 리스크 관리를 제공합니다.
                </p>
              </div>

              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold interactive"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
              >
                프리미엄 플랜 시작하기
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FiBarChart2, label: '주식 랭킹', href: '/stocklist', color: 'from-blue-500 to-cyan-500' },
              { icon: FiMessageSquare, label: '커뮤니티', href: '/stockboard', color: 'from-orange-500 to-red-500' },
              { icon: FiActivity, label: '뉴스', href: '/news', color: 'from-green-500 to-emerald-500' },
              { icon: FiPieChart, label: '종합스코어', href: '/score', color: 'from-purple-500 to-indigo-500' },
            ].map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="glass-strong rounded-xl p-4 border-glow interactive text-center group"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-gradient-to-br ${link.color}`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className="font-semibold text-sm group-hover:text-gradient transition-all"
                  style={{ color: 'rgb(var(--color-text-primary))' }}
                >
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
