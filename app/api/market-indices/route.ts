import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-utils';
import { mockMarketIndices } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country'); // '국내' or '해외'

    let indices = [...mockMarketIndices];

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
