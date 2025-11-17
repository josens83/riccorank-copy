import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api-utils';
import { mockNews } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const news = mockNews.find((n) => n.id === id);

    if (!news) {
      throw new ApiError(404, 'News not found');
    }

    // Increment views (in real app, this would update database)
    const newsDetail = {
      ...news,
      views: news.views + 1,
      relatedNews: mockNews
        .filter((n) => n.id !== id && n.category === news.category)
        .slice(0, 5),
    };

    return successResponse(newsDetail);
  } catch (error) {
    return handleApiError(error);
  }
}
