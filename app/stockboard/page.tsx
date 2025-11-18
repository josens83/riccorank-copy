'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { mockStockSentiment } from '@/lib/data';
import { FiMessageCircle, FiThumbsUp, FiEye, FiSend, FiRefreshCw, FiEdit } from 'react-icons/fi';
import Link from 'next/link';
import { Post } from '@/lib/types';

export default function StockBoardPage() {
  const { isDarkMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'stock' | 'free' | 'notice'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('최신순');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [activeTab, searchQuery, selectedSort]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        if (activeTab === 'popular') {
          params.append('isPopular', 'true');
        } else {
          params.append('category', activeTab);
        }
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (selectedSort === '인기순') {
        params.append('sortBy', 'likes');
      } else if (selectedSort === '조회순') {
        params.append('sortBy', 'views');
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { key: 'all' as const, label: '전체' },
    { key: 'popular' as const, label: '인기글' },
    { key: 'stock' as const, label: '종목토론글' },
    { key: 'free' as const, label: '자유토론글' },
    { key: 'notice' as const, label: '공지사항' },
  ];

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60 / 60);

    if (diff < 1) {
      return '방금 전';
    } else if (diff < 24) {
      return `${diff}시간 전`;
    } else {
      return `${Math.floor(diff / 24)}일 전`;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      stock: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      free: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      notice: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const labels: Record<string, string> = {
      stock: '종목토론글',
      free: '자유토론글',
      notice: '공지사항',
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${styles[category] || styles.free}`}>
        {labels[category] || category}
      </span>
    );
  };

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Stock Sentiment */}
          <aside className="lg:col-span-3">
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-4`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                인기 종목
              </h3>

              <div className="space-y-4">
                {mockStockSentiment.map((stock) => (
                  <div key={stock.symbol} className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stock.name}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stock.code}
                        </div>
                      </div>
                      <div className={`text-right text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stock.upCount}회<br/>언급
                      </div>
                    </div>

                    {/* Sentiment Bar */}
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-red-500"
                        style={{ width: `${stock.upPercent}%` }}
                      />
                    </div>

                    {/* Sentiment Stats */}
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div className="flex items-center space-x-1 text-red-500">
                        <span>▲ 상승</span>
                        <span className="font-semibold">{stock.upPercent.toFixed(1)}%</span>
                        <span>({stock.upCount}건)</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-500">
                        <span>▼ 하락</span>
                        <span className="font-semibold">{stock.downPercent.toFixed(1)}%</span>
                        <span>({stock.downCount}건)</span>
                      </div>
                    </div>

                    <div className="mt-1 text-center">
                      <span className="text-xs text-gray-500">
                        — 보합 {stock.neutralPercent.toFixed(1)}% ({stock.neutralCount}건)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6`}>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <FiMessageCircle className="inline w-6 h-6 mr-2 text-blue-600" />
                      주식 토론방
                    </h1>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      실시간 투자자 소통 공간
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href="/stockboard/write"
                      className={`flex items-center px-4 py-2 rounded-md ${
                        isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition-colors`}
                    >
                      <FiEdit className="w-5 h-5" />
                      <span className="ml-1 text-sm">글쓰기</span>
                    </Link>
                    <button
                      onClick={fetchPosts}
                      className={`p-2 rounded-md ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      <FiRefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="재목, 내용, 작성자 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          activeTab === tab.key
                            ? 'bg-blue-600 text-white'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className={`px-3 py-2 rounded-md border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option>최신순</option>
                    <option>인기순</option>
                    <option>조회순</option>
                  </select>
                </div>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    로딩 중...
                  </div>
                ) : posts.length === 0 ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    게시글이 없습니다
                  </div>
                ) : (
                  posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/stockboard/${post.id}`}
                      className={`block p-4 rounded-lg border ${
                        isDarkMode
                          ? 'border-gray-700 hover:bg-gray-700/50'
                          : 'border-gray-200 hover:bg-gray-50'
                      } transition-all`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {post.isPopular && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                              인기
                            </span>
                          )}
                          {getCategoryBadge(post.category)}
                        </div>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getTimeAgo(post.createdAt)}
                        </span>
                      </div>

                      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {post.title}
                      </h3>

                      <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {post.author?.name || post.author?.email || '익명'}
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-gray-400">
                            <FiEye className="w-4 h-4" />
                            <span>{post.views?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-400">
                            <FiThumbsUp className="w-4 h-4" />
                            <span>{post.likeCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-400">
                            <FiMessageCircle className="w-4 h-4" />
                            <span>{post.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Popular Posts */}
          <aside className="lg:col-span-3">
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FiMessageCircle className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    인기글
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                  실시간
                </span>
              </div>

              <div className="space-y-3">
                {posts.slice(0, 3).map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/stockboard/${post.id}`}
                    className={`block p-3 rounded-md ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    {post.tags && (
                      <div className="mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {post.tags}
                        </span>
                      </div>
                    )}

                    <h4 className={`text-sm font-semibold mb-1 line-clamp-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {post.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {getTimeAgo(post.createdAt)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-gray-400">
                          <FiEye className="w-3 h-3" />
                          <span>{post.views?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <FiThumbsUp className="w-3 h-3" />
                          <span>{post.likeCount || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <FiMessageCircle className="w-3 h-3" />
                          <span>{post.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
