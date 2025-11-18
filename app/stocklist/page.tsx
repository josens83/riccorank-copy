'use client';

import { useState } from 'react';
import { useThemeStore } from '@/lib/store';
import { mockStocks } from '@/lib/data';
import { FiStar, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';

type SortField = 'rank' | 'name' | 'currentPrice' | 'changePercent' | 'marketCap' | 'sales' | 'operatingIncome' | 'netIncome' | 'per' | 'pbr';
type SortDirection = 'asc' | 'desc';

export default function StockListPage() {
  const { isDarkMode } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<'KOSPI' | 'KOSDAQ'>('KOSPI');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const formatNumber = (num: number | undefined) => {
    if (!num) return '-';
    return num.toLocaleString('ko-KR');
  };

  const formatPercent = (num: number | undefined) => {
    if (!num) return '-';
    return num.toFixed(2);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredStocks = mockStocks
    .filter(stock => stock.market === selectedMarket)
    .filter(stock =>
      searchQuery === '' ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.includes(searchQuery)
    );

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <FiChevronUp className="inline w-3 h-3 ml-1" />
    ) : (
      <FiChevronDown className="inline w-3 h-3 ml-1" />
    );
  };

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6`}>
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              주식랭킹순위
            </h1>

            {/* Market Tabs */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setSelectedMarket('KOSPI')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedMarket === 'KOSPI'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                KOSPI
              </button>
              <button
                onClick={() => setSelectedMarket('KOSDAQ')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedMarket === 'KOSDAQ'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                KOSDAQ
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="여기에서 주식을 검색하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <FiSearch className={`absolute left-3 top-2.5 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    순위 ⓘ
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    종목명
                  </th>
                  <th
                    className={`px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => handleSort('currentPrice')}
                  >
                    현재가 <SortIcon field="currentPrice" />
                  </th>
                  <th className={`px-4 py-3 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    점수 ⓘ ▽
                  </th>
                  <th
                    className={`px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => handleSort('marketCap')}
                  >
                    시가총액(억) ⓘ <SortIcon field="marketCap" />
                  </th>
                  <th
                    className={`px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => handleSort('sales')}
                  >
                    매출(억) ⓘ <SortIcon field="sales" />
                  </th>
                  <th
                    className={`px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => handleSort('operatingIncome')}
                  >
                    영업이익(억) ⓘ <SortIcon field="operatingIncome" />
                  </th>
                  <th
                    className={`px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => handleSort('netIncome')}
                  >
                    순이익(억) ⓘ <SortIcon field="netIncome" />
                  </th>
                  <th
                    className={`px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => handleSort('per')}
                  >
                    PER ⓘ <SortIcon field="per" />
                  </th>
                  <th
                    className={`px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => handleSort('pbr')}
                  >
                    PBR ⓘ <SortIcon field="pbr" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStocks.map((stock) => {
                  const isPositive = stock.change >= 0;
                  const changeColor = isPositive ? 'text-red-500' : 'text-blue-500';
                  const changeBgColor = isPositive
                    ? isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
                    : isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50';

                  return (
                    <tr
                      key={stock.id}
                      className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button className={`${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`}>
                            <FiStar className="w-4 h-4" />
                          </button>
                          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                            {stock.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/stock/${stock.symbol}`} className={`hover:underline ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="font-semibold">{stock.name}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {stock.market}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(stock.currentPrice)}
                        </div>
                        <div className={`text-xs ${changeColor}`}>
                          {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {stock.score?.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {formatNumber(stock.marketCap)}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${changeBgColor} ${changeColor}`}>
                          순위 1
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {formatNumber(stock.sales)}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${changeBgColor} ${changeColor}`}>
                          순위 {stock.rank}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {formatNumber(stock.operatingIncome)}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${changeBgColor} ${changeColor}`}>
                          순위 {stock.rank}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {formatNumber(stock.netIncome)}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${changeBgColor} ${changeColor}`}>
                          순위 {stock.rank}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {formatPercent(stock.per)}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${changeBgColor} ${changeColor}`}>
                          순위 {stock.rank && stock.rank + 443}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {formatPercent(stock.pbr)}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${changeBgColor} ${changeColor}`}>
                          순위 {stock.rank && stock.rank + 691}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
