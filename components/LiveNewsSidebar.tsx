'use client';

import Link from 'next/link';
import { useThemeStore } from '@/lib/store';
import { mockNews } from '@/lib/mockData';
import { FiClock, FiExternalLink } from 'react-icons/fi';

const LiveNewsSidebar = () => {
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
    <div className={`rounded-lg border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiClock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            실시간뉴스
          </h3>
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
            LIVE
          </span>
        </div>
        <Link href="/news" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
          <FiExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {mockNews.slice(0, 5).map((news) => (
          <Link
            key={news.id}
            href={`/news/${news.id}`}
            className={`block p-3 rounded-md transition-all ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className="space-y-2">
              {/* Time Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getTimeAgo(news.publishedAt)}
                </span>
                {news.isHot && (
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                    HOT
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className={`text-sm font-semibold line-clamp-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {news.title}
              </h4>

              {/* Summary */}
              <p className={`text-xs line-clamp-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {news.content}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* View More */}
      <Link
        href="/news"
        className={`mt-4 block text-center py-2 rounded-md text-sm font-medium transition-colors ${
          isDarkMode
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        더 보기 →
      </Link>
    </div>
  );
};

export default LiveNewsSidebar;
