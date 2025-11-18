import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api/errors';
import { mockMarketIndices } from '@/lib/data';
import { getMarketIndices } from '@/lib/external/stockApi';
import { getCachedData } from '@/lib/utils/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country'); // '국내' or '해외'

    // 실제 API에서 시장 지수 가져오기 (캐시 사용, 2분 TTL)
    let indices = await getCachedData(
      'market-indices',
      async () => {
        try {
          const apiIndices = await getMarketIndices();
          return apiIndices.length > 0 ? apiIndices : mockMarketIndices;
        } catch (error) {
          console.error('Market indices API failed, using mock data:', error);
          return mockMarketIndices;
        }
      },
      2 * 60 * 1000 // 2분 캐시 (시장 지수는 자주 변함)
    );

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
