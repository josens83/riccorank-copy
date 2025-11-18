import { NextRequest } from 'next/server';
import { handleApiError, successResponse, paginateArray } from '@/lib/api-utils';
import { getNewsSchema } from '@/lib/validations';
import { mockNews } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params = getNewsSchema.parse({
      category: searchParams.get('category'),
      search: searchParams.get('search'),
      isHot: searchParams.get('isHot'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    let news = [...mockNews];

    // Filter by category
    if (params.category) {
      news = news.filter((item) => item.category === params.category);
    }

    // Filter by hot status
    if (params.isHot !== undefined) {
      news = news.filter((item) => item.isHot === params.isHot);
    }

    // Search in title or content
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      news = news.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort by publishedAt descending (newest first)
    news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Paginate
    const result = paginateArray(news, params.page, params.limit);

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
