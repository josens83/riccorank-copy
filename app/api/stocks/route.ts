import { NextRequest } from 'next/server';
import { handleApiError, successResponse, paginateArray } from '@/lib/api-utils';
import { getStocksSchema } from '@/lib/validations';
import { mockStocks } from '@/lib/mockData';

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

    let stocks = [...mockStocks];

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
