'use client';

import { useState } from 'react';
import { useThemeStore } from '@/lib/store';
import PopularStocksSidebar from '@/components/PopularStocksSidebar';
import LiveNewsSidebar from '@/components/LiveNewsSidebar';
import { mockMarketIndices, mockThemeStocks, mockUpLimitStocks } from '@/lib/mockData';
import { FiTrendingUp, FiTrendingDown, FiFlame, FiArrowUp } from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  const { isDarkMode } = useThemeStore();
  const [selectedTab, setSelectedTab] = useState<'realtime' | 'global'>('realtime');
  const [selectedSubTab, setSelectedSubTab] = useState('글로벌 주요 지수');

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    const icon = isPositive ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />;
    const color = isPositive ? 'text-red-500' : 'text-blue-500';

    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {icon}
        <span className="text-sm font-semibold">
          {sign}{percent.toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-2">
            <PopularStocksSidebar />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-7">
            {/* Market Indices Section */}
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6 mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <FiTrendingUp className="inline w-6 h-6 mr-2 text-blue-600" />
                  주요 시세
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white">
                    ● 실시간
                  </button>
                  <button className="px-4 py-1 text-sm rounded-full bg-blue-600 text-white font-medium">
                    글로벌 주요 지수
                  </button>
                  <button className={`px-3 py-1 text-sm rounded-full ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    주요 선물 지수
                  </button>
                  <button className={`px-3 py-1 text-sm rounded-full ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    글로벌 멀티에셋
                  </button>
                </div>
              </div>

              {/* Market Indices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockMarketIndices.map((index) => (
                  <div
                    key={index.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          {index.country === '국내' ? '🇰🇷' : '🇺🇸'} {index.country}
                        </div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {index.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(index.value)}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {formatChange(index.change, index.changePercent)}
                          <span className={`text-xs ${
                            index.change >= 0 ? 'text-red-500' : 'text-blue-500'
                          }`}>
                            {index.change >= 0 ? '+' : ''}{formatNumber(index.change)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Stocks Section */}
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6 mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <FiFlame className="w-5 h-5 mr-2 text-orange-500" />
                  오늘의 테마주
                  <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                    HOT
                  </span>
                </h2>
                <Link href="/themes" className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                  전체보기 →
                </Link>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                시장을 주도하는 테마별 금융주
              </div>

              <div className="space-y-3">
                {mockThemeStocks.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {theme.name}
                        </div>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                        theme.changePercent >= 0
                          ? isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                          : isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <FiTrendingUp className="w-4 h-4" />
                        <span className="font-bold">{theme.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Up Limit Stocks Section */}
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <FiArrowUp className="w-5 h-5 mr-2 text-red-500" />
                  상한가 종목
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                    +30%
                  </span>
                </h2>
                <Link href="/uplimit" className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                  전체보기 →
                </Link>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                오늘 상한가를 기록한 종목 현황
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockUpLimitStocks.map((stock, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stock.name}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stock.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stock.price.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end space-x-1 text-red-500">
                          <FiTrendingUp className="w-3 h-3" />
                          <span className="text-xs font-semibold">
                            +{stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-xs text-red-500">
                          +{stock.change.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <LiveNewsSidebar />
          </aside>
        </div>
      </div>
    </main>
  );
}
