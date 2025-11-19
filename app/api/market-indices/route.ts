import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api/errors';
import { mockMarketIndices } from '@/lib/data';
import { getMarketIndices } from '@/lib/external/stockApi';
import { StockCacheService } from '@/lib/cache/api-cache';
import { withRateLimit } from '@/lib/rate-limit';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country'); // '국내' or '해외'

    // Redis 캐시에서 먼저 확인
    const cached = await StockCacheService.getIndices();

    let indices;
    if (cached) {
      indices = cached as typeof mockMarketIndices;
      log.debug('Market indices cache hit');
    } else {
      // API에서 시장 지수 가져오기
      try {
        const apiIndices = await getMarketIndices();
        indices = apiIndices.length > 0 ? apiIndices : mockMarketIndices;

        // Redis에 캐시 저장
        await StockCacheService.setIndices(indices);
        log.debug('Market indices fetched from API', { count: indices.length });
      } catch (error) {
        log.error('Market indices API failed, using mock data', error as Error);
        indices = mockMarketIndices;
      }
    }

    // Filter by country
    if (country) {
      indices = indices.filter((index) => index.country === country);
    }

    return successResponse({
      data: indices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
