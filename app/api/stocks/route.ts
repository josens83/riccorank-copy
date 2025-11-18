import { NextRequest } from 'next/server';
import { handleApiError, successResponse, paginateArray } from '@/lib/api/errors';
import { getStocksSchema } from '@/lib/utils/validations';
import { mockStocks } from '@/lib/data';
import { getStocks } from '@/lib/external/stockApi';
import { getCachedData, createCacheKey } from '@/lib/utils/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params = getStocksSchema.parse({
      market: searchParams.get('market'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    // 실제 API에서 데이터 가져오기 (캐시 사용, 5분 TTL)
    const cacheKey = createCacheKey('stocks', { market: params.market || 'all' });
    let stocks = await getCachedData(
      cacheKey,
      async () => {
        try {
          const apiStocks = await getStocks(params.market as 'KOSPI' | 'KOSDAQ' | undefined, 50);
          // API 실패 시 fallback to mock data
          return apiStocks.length > 0 ? apiStocks : mockStocks;
        } catch (error) {
          console.error('Stock API failed, using mock data:', error);
          return mockStocks;
        }
      },
      5 * 60 * 1000 // 5분 캐시
    );

    // Filter by market
    if (params.market) {
      stocks = stocks.filter((stock) => stock.market === params.market);
    }

    // Search by name or symbol
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      stocks = stocks.filter(
        (stock) =>
          stock.name.toLowerCase().includes(searchLower) ||
          stock.symbol.includes(searchLower)
      );
    }

    // Sort
    if (params.sortBy) {
      stocks.sort((a, b) => {
        const aVal = a[params.sortBy as keyof typeof a] ?? 0;
        const bVal = b[params.sortBy as keyof typeof b] ?? 0;

        if (params.sortOrder === 'desc') {
          return aVal > bVal ? -1 : 1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // Paginate
    const result = paginateArray(stocks, params.page, params.limit);

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/stocks/stats - Stock statistics
export async function HEAD() {
  try {
    const stats = {
      total: mockStocks.length,
      kospi: mockStocks.filter((s) => s.market === 'KOSPI').length,
      kosdaq: mockStocks.filter((s) => s.market === 'KOSDAQ').length,
      gainers: mockStocks.filter((s) => s.change > 0).length,
      losers: mockStocks.filter((s) => s.change < 0).length,
      unchanged: mockStocks.filter((s) => s.change === 0).length,
    };

    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
