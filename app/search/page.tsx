'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiSearch, FiTrendingUp, FiFileText, FiMessageCircle, FiEye, FiThumbsUp, FiClock } from 'react-icons/fi';
import Link from 'next/link';

interface SearchResult {
  type: 'stock' | 'post' | 'news';
  data: any;
}

export default function SearchPage() {
  const { isDarkMode } = useThemeStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'stock' | 'post' | 'news'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, activeFilter, sortBy]);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const promises = [];

      if (activeFilter === 'all' || activeFilter === 'stock') {
        promises.push(
          fetch(`/api/stocks?search=${encodeURIComponent(query)}`)
            .then(res => res.ok ? res.json() : { data: [] })
            .then(data => (data.data || []).map((item: any) => ({ type: 'stock' as const, data: item })))
        );
      }

      if (activeFilter === 'all' || activeFilter === 'post') {
        promises.push(
          fetch(`/api/posts?search=${encodeURIComponent(query)}${sortBy === 'date' ? '&sortBy=createdAt' : ''}`)
            .then(res => res.ok ? res.json() : { data: [] })
            .then(data => (data.data || []).map((item: any) => ({ type: 'post' as const, data: item })))
        );
      }

      if (activeFilter === 'all' || activeFilter === 'news') {
        promises.push(
          fetch(`/api/news?search=${encodeURIComponent(query)}`)
            .then(res => res.ok ? res.json() : { data: [] })
            .then(data => (data.data || []).map((item: any) => ({ type: 'news' as const, data: item })))
        );
      }

      const resultsArrays = await Promise.all(promises);
      const allResults = resultsArrays.flat();
      setResults(allResults);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000 / 60 / 60);

    if (diff < 1) {
      return '방금 전';
    } else if (diff < 24) {
      return `${diff}시간 전`;
    } else {
      return `${Math.floor(diff / 24)}일 전`;
    }
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 text-inherit">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filteredResults = results;

  const stockResults = filteredResults.filter(r => r.type === 'stock');
  const postResults = filteredResults.filter(r => r.type === 'post');
  const newsResults = filteredResults.filter(r => r.type === 'news');

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            검색 결과
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            "<span className="font-semibold">{query}</span>" 에 대한 검색 결과 {filteredResults.length}개
          </p>
        </div>

        {/* Filters */}
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-4 mb-6`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체 ({results.length})
              </button>
              <button
                onClick={() => setActiveFilter('stock')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeFilter === 'stock'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                종목 ({stockResults.length})
              </button>
              <button
                onClick={() => setActiveFilter('post')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeFilter === 'post'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                게시글 ({postResults.length})
              </button>
              <button
                onClick={() => setActiveFilter('news')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeFilter === 'news'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                뉴스 ({newsResults.length})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-4 py-2 rounded-md border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="relevance">관련도순</option>
              <option value="date">최신순</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FiSearch className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <p>검색 중...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FiSearch className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
            <p className="text-sm">다른 검색어를 시도해보세요</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stock Results */}
            {(activeFilter === 'all' || activeFilter === 'stock') && stockResults.length > 0 && (
              <div>
                <h2 className={`text-xl font-bold mb-4 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FiTrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  종목 ({stockResults.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stockResults.map((result, index) => (
                    <Link
                      key={`stock-${index}`}
                      href={`/stocklist?symbol=${result.data.symbol}`}
                      className={`block p-4 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } transition-all`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {highlightQuery(result.data.name, query)}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {result.data.market}
                        </span>
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.data.symbol}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {result.data.price?.toLocaleString()}원
                        </span>
                        <span className={`text-sm font-semibold ${
                          result.data.change >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {result.data.change >= 0 ? '+' : ''}{result.data.changePercent}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Post Results */}
            {(activeFilter === 'all' || activeFilter === 'post') && postResults.length > 0 && (
              <div>
                <h2 className={`text-xl font-bold mb-4 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FiFileText className="w-5 h-5 mr-2 text-green-600" />
                  게시글 ({postResults.length})
                </h2>
                <div className="space-y-4">
                  {postResults.map((result, index) => (
                    <Link
                      key={`post-${index}`}
                      href={`/stockboard/${result.data.id}`}
                      className={`block p-4 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } transition-all`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                          }`}>
                            게시글
                          </span>
                          {result.data.isPopular && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                              인기
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {getTimeAgo(result.data.createdAt)}
                        </span>
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {highlightQuery(result.data.title, query)}
                      </h3>
                      <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {highlightQuery(result.data.content, query)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {result.data.author?.name || result.data.author?.email || '익명'}
                        </span>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-gray-400">
                            <FiEye className="w-4 h-4" />
                            <span>{result.data.views || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-400">
                            <FiThumbsUp className="w-4 h-4" />
                            <span>{result.data.likeCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-400">
                            <FiMessageCircle className="w-4 h-4" />
                            <span>{result.data.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* News Results */}
            {(activeFilter === 'all' || activeFilter === 'news') && newsResults.length > 0 && (
              <div>
                <h2 className={`text-xl font-bold mb-4 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FiClock className="w-5 h-5 mr-2 text-orange-600" />
                  뉴스 ({newsResults.length})
                </h2>
                <div className="space-y-4">
                  {newsResults.map((result, index) => (
                    <Link
                      key={`news-${index}`}
                      href={`/news/${result.data.id}`}
                      className={`block p-4 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } transition-all`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                        }`}>
                          뉴스
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {getTimeAgo(result.data.publishedAt)}
                        </span>
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {highlightQuery(result.data.title, query)}
                      </h3>
                      <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {highlightQuery(result.data.content || '', query)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {result.data.source}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <FiEye className="w-4 h-4" />
                          <span>{result.data.views?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
