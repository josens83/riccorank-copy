'use client';

import Link from 'next/link';
import { useThemeStore } from '@/lib/store';
import { mockPopularSearches } from '@/lib/mockData';
import { FiTrendingUp, FiExternalLink } from 'react-icons/fi';

const PopularStocksSidebar = () => {
  const { isDarkMode } = useThemeStore();

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  const formatChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    const color = isPositive ? 'text-red-500' : 'text-blue-500';

    return (
      <div className={`text-xs ${color} font-medium`}>
        <div>{sign}{formatNumber(change)}</div>
        <div>({sign}{percent.toFixed(2)}%)</div>
      </div>
    );
  };

  return (
    <div className={`rounded-lg border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-red-500 text-sm">●</span>
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            실시간 인기검색종목
          </h3>
          <span className="text-green-400">✨</span>
        </div>
        <Link href="/stocklist" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
          <FiExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Popular Stocks List */}
      <div className="space-y-3">
        {mockPopularSearches.map((stock, index) => {
          const isTop3 = index < 3;

          return (
            <Link
              key={stock.rank}
              href={`/stock/${stock.symbol}`}
              className={`block p-3 rounded-md transition-all ${
                index === 3
                  ? isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                  : isDarkMode
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className={`font-bold ${
                    isTop3 ? 'text-blue-600' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stock.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                      {stock.name}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stock.code}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(stock.changePercent >= 0 ? Math.floor(Math.random() * 500000) + 50000 : Math.floor(Math.random() * 300000) + 30000)}
                  </div>
                  {formatChange(stock.change, stock.changePercent)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PopularStocksSidebar;
