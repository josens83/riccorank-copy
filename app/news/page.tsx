'use client';

import { useThemeStore } from '@/lib/store';
import { mockNews, mockPopularSearches } from '@/lib/data';
import PopularStocksSidebar from '@/components/PopularStocksSidebar';
import LiveNewsSidebar from '@/components/LiveNewsSidebar';
import { FiClock, FiEye, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function NewsPage() {
  const { isDarkMode } = useThemeStore();

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 60) {
      return `${diff}분 전`;
    } else if (diff < 1440) {
      return `${Math.floor(diff / 60)}시간 전`;
    } else {
      return `${Math.floor(diff / 1440)}일 전`;
    }
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
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6`}>
              {/* Header */}
              <div className="mb-6">
                <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  국내 뉴스
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  최신 국내 뉴스를 실시간으로 확인하세요
                </p>

                {/* Live Badge */}
                <div className="mt-4 flex items-center space-x-2">
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    LIVE
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    마지막 업데이트: 24분 전
                  </span>
                </div>
              </div>

              {/* News List */}
              <div className="space-y-4">
                {mockNews.map((news) => (
                  <Link
                    key={news.id}
                    href={`/news/${news.id}`}
                    className={`block p-6 rounded-lg border ${
                      isDarkMode
                        ? 'border-gray-700 hover:bg-gray-700/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-all`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FiClock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getTimeAgo(news.publishedAt)}
                        </span>
                        <FiArrowRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      </div>
                      {news.isHot && (
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                          HOT
                        </span>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {news.title}
                    </h3>

                    <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {news.content}
                    </p>

                    {news.source && (
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {news.source}
                        </span>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <FiEye className="w-4 h-4" />
                          <span className="text-xs">{news.views}</span>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-6 text-center">
                <button className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  더 보기
                </button>
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
