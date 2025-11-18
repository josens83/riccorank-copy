'use client';

import { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

interface SearchSuggestion {
  type: 'stock' | 'post' | 'news';
  id: string;
  title: string;
  subtitle?: string;
}

export default function GlobalSearch() {
  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      // Fetch from multiple sources
      const [stocksRes, postsRes, newsRes] = await Promise.all([
        fetch(`/api/stocks?search=${encodeURIComponent(query)}&limit=3`),
        fetch(`/api/posts?search=${encodeURIComponent(query)}&limit=3`),
        fetch(`/api/news?search=${encodeURIComponent(query)}&limit=3`),
      ]);

      const stocks = stocksRes.ok ? await stocksRes.json() : { data: [] };
      const posts = postsRes.ok ? await postsRes.json() : { data: [] };
      const news = newsRes.ok ? await newsRes.json() : { data: [] };

      const newSuggestions: SearchSuggestion[] = [
        ...(stocks.data || []).map((stock: any) => ({
          type: 'stock' as const,
          id: stock.symbol,
          title: stock.name,
          subtitle: `${stock.symbol} · ${stock.market}`,
        })),
        ...(posts.data || []).map((post: any) => ({
          type: 'post' as const,
          id: post.id,
          title: post.title,
          subtitle: post.author?.name || post.author?.email,
        })),
        ...(news.data || []).map((newsItem: any) => ({
          type: 'news' as const,
          id: newsItem.id,
          title: newsItem.title,
          subtitle: newsItem.source,
        })),
      ];

      setSuggestions(newSuggestions.slice(0, 9));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Navigate to search results
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'stock') {
      router.push(`/stocklist?symbol=${suggestion.id}`);
    } else if (suggestion.type === 'post') {
      router.push(`/stockboard/${suggestion.id}`);
    } else if (suggestion.type === 'news') {
      router.push(`/news/${suggestion.id}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <FiTrendingUp className="w-4 h-4" />;
      case 'post':
        return <FiSearch className="w-4 h-4" />;
      case 'news':
        return <FiSearch className="w-4 h-4" />;
      default:
        return <FiSearch className="w-4 h-4" />;
    }
  };

  const getSuggestionBadge = (type: string) => {
    const badges = {
      stock: { text: '종목', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      post: { text: '게시글', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      news: { text: '뉴스', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    };
    const badge = badges[type as keyof typeof badges] || badges.post;
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>{badge.text}</span>;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
          placeholder="종목, 게시글, 뉴스 검색..."
          className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <FiSearch className={`absolute left-3 top-3 w-4 h-4 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
        {query && (
          <button
            onClick={() => setQuery('')}
            className={`absolute right-3 top-2.5 p-0.5 rounded-full ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <FiX className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-xl z-50 max-h-96 overflow-y-auto ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {query.length >= 2 ? (
            // Suggestions
            <>
              {isLoading ? (
                <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  검색 중...
                </div>
              ) : suggestions.length === 0 ? (
                <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  검색 결과가 없습니다
                </div>
              ) : (
                <div className="py-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.id}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-3 flex items-center space-x-3 ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2 mb-1">
                          {getSuggestionBadge(suggestion.type)}
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {suggestion.title}
                          </span>
                        </div>
                        {suggestion.subtitle && (
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {suggestion.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className={`border-t p-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => handleSearch(query)}
                    className={`w-full px-4 py-2 text-sm text-center rounded-md ${
                      isDarkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-colors`}
                  >
                    "{query}" 전체 검색 결과 보기
                  </button>
                </div>
              )}
            </>
          ) : (
            // Search History
            <>
              {searchHistory.length === 0 ? (
                <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  최근 검색 기록이 없습니다
                </div>
              ) : (
                <div className="py-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      최근 검색
                    </span>
                    <button
                      onClick={clearHistory}
                      className={`text-xs ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      전체 삭제
                    </button>
                  </div>
                  {searchHistory.map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(historyItem);
                        handleSearch(historyItem);
                      }}
                      className={`w-full px-4 py-3 flex items-center space-x-3 ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <FiClock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`flex-1 text-left text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {historyItem}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newHistory = searchHistory.filter(h => h !== historyItem);
                          setSearchHistory(newHistory);
                          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                        }}
                        className={`p-1 rounded-full ${
                          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}
                      >
                        <FiX className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
