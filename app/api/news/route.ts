import { NextRequest } from 'next/server';
import { handleApiError, successResponse, paginateArray } from '@/lib/api/errors';
import { getNewsSchema } from '@/lib/utils/validations';
import { mockNews } from '@/lib/data';
import { getFinancialNews, getNewsByCategory, searchNews } from '@/lib/external/newsApi';
import { getCachedData, createCacheKey } from '@/lib/utils/cache';

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

    // 실제 API에서 뉴스 가져오기 (캐시 사용, 15분 TTL)
    const cacheKey = createCacheKey('news', {
      category: params.category || 'all',
      search: params.search || 'none'
    });

    let news = await getCachedData(
      cacheKey,
      async () => {
        try {
          // 검색어가 있으면 검색
          if (params.search) {
            const searchResults = await searchNews(params.search, 50);
            return searchResults.length > 0 ? searchResults : mockNews;
          }

          // 카테고리가 있으면 카테고리별 뉴스
          if (params.category) {
            const categoryNews = await getNewsByCategory(params.category, 50);
            return categoryNews.length > 0 ? categoryNews : mockNews;
          }

          // 기본: 금융 뉴스
          const financialNews = await getFinancialNews(50);
          return financialNews.length > 0 ? financialNews : mockNews;
        } catch (error) {
          console.error('News API failed, using mock data:', error);
          return mockNews;
        }
      },
      15 * 60 * 1000 // 15분 캐시
    );

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
