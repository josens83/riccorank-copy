import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { recommendationEngine, UserPreference } from '@/lib/recommendation/recommendation-engine';

/**
 * GET /api/recommendations
 * 사용자 맞춤 추천 게시글
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'posts';
    const limit = parseInt(searchParams.get('limit') || '10');

    // 실제 구현에서는 데이터베이스에서 사용자 선호도 가져오기
    const mockUserPreference: UserPreference = {
      userId: session.user.id,
      viewedPosts: ['post1', 'post2', 'post3'],
      likedPosts: ['post1'],
      viewedStocks: ['AAPL', 'GOOGL'],
      searchHistory: ['주식', '투자'],
      lastActive: new Date(),
    };

    const mockAllUsers: UserPreference[] = [
      mockUserPreference,
      // 다른 사용자들...
    ];

    const mockAllPosts = [
      {
        id: 'post1',
        category: 'stock',
        title: '애플 주식 분석',
        viewCount: 100,
        likeCount: 20,
        createdAt: new Date(),
      },
      // 더 많은 게시글...
    ];

    let recommendations;

    switch (type) {
      case 'posts':
        recommendations = recommendationEngine.recommend(
          mockUserPreference,
          mockAllUsers,
          mockAllPosts,
          { limit }
        );
        break;

      case 'trending':
        recommendations = recommendationEngine.recommendTrending(mockAllPosts, { limit });
        break;

      case 'stocks':
        const mockAllStocks = [
          { id: 'AAPL', name: 'Apple', sector: 'Technology', changePercent: 2.5 },
          { id: 'GOOGL', name: 'Google', sector: 'Technology', changePercent: 1.8 },
          // 더 많은 주식...
        ];
        recommendations = recommendationEngine.recommendStocks(
          mockUserPreference,
          mockAllStocks,
          limit
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      meta: {
        type,
        limit,
        count: recommendations.length,
      },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
