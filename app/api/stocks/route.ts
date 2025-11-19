import { NextRequest } from 'next/server';
import { handleApiError, successResponse, paginateArray } from '@/lib/api/errors';
import { getStocksSchema } from '@/lib/utils/validations';
import { mockStocks } from '@/lib/data';
import { getStocks } from '@/lib/external/stockApi';
import { StockCacheService } from '@/lib/cache/api-cache';
import { withRateLimit } from '@/lib/rate-limit';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const searchParams = request.nextUrl.searchParams;

    const params = getStocksSchema.parse({
      market: searchParams.get('market'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    // Redis 캐시에서 먼저 확인
    const market = params.market || 'all';
    const cached = await StockCacheService.getList(market, params.page);

    let stocks;
    if (cached && !params.search && !params.sortBy) {
      // 검색/정렬 없는 경우만 캐시 사용
      stocks = cached as typeof mockStocks;
      log.debug('Stocks cache hit', { market, page: params.page });
    } else {
      // API에서 데이터 가져오기
      try {
        const apiStocks = await getStocks(params.market as 'KOSPI' | 'KOSDAQ' | undefined, 50);
        stocks = apiStocks.length > 0 ? apiStocks : mockStocks;

        // Redis에 캐시 저장
        await StockCacheService.setList(market, params.page, stocks);
        log.debug('Stocks fetched from API', { market, count: stocks.length });
      } catch (error) {
        log.error('Stock API failed, using mock data', error as Error);
        stocks = mockStocks;
      }
    }

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
