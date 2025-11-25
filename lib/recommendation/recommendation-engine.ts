/**
 * Recommendation Engine
 * 사용자 행동 기반 콘텐츠 추천 시스템
 */

export interface UserPreference {
  userId: string;
  viewedPosts: string[];
  likedPosts: string[];
  viewedStocks: string[];
  searchHistory: string[];
  lastActive: Date;
}

export interface RecommendationScore {
  itemId: string;
  score: number;
  reason: string;
}

/**
 * 콘텐츠 기반 필터링 (Content-Based Filtering)
 * 사용자가 좋아한 콘텐츠와 유사한 콘텐츠 추천
 */
export class ContentBasedRecommender {
  /**
   * 유사도 계산 (Cosine Similarity)
   */
  calculateSimilarity(features1: number[], features2: number[]): number {
    if (features1.length !== features2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < features1.length; i++) {
      dotProduct += features1[i] * features2[i];
      norm1 += features1[i] * features1[i];
      norm2 += features2[i] * features2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * 게시글 특징 벡터 추출
   */
  extractPostFeatures(post: {
    category: string;
    tags?: string[];
    viewCount: number;
    likeCount: number;
  }): number[] {
    // 카테고리 one-hot encoding
    const categories = ['free', 'stock', 'notice'];
    const categoryVector = categories.map((c) => (c === post.category ? 1 : 0));

    // 인기도 점수 정규화 (0-1)
    const popularityScore = Math.min((post.viewCount + post.likeCount * 2) / 1000, 1);

    return [...categoryVector, popularityScore];
  }

  /**
   * 유사 게시글 추천
   */
  recommendSimilarPosts(
    targetPost: any,
    allPosts: any[],
    limit = 5
  ): RecommendationScore[] {
    const targetFeatures = this.extractPostFeatures(targetPost);

    const scores = allPosts
      .filter((post) => post.id !== targetPost.id)
      .map((post) => {
        const features = this.extractPostFeatures(post);
        const similarity = this.calculateSimilarity(targetFeatures, features);

        return {
          itemId: post.id,
          score: similarity,
          reason: `${targetPost.category} 카테고리의 유사한 게시글`,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scores;
  }
}

/**
 * 협업 필터링 (Collaborative Filtering)
 * 유사한 사용자들이 좋아한 콘텐츠 추천
 */
export class CollaborativeFilteringRecommender {
  /**
   * 사용자 간 유사도 계산 (Jaccard Similarity)
   */
  calculateUserSimilarity(user1: UserPreference, user2: UserPreference): number {
    const likedPosts1 = new Set(user1.likedPosts);
    const likedPosts2 = new Set(user2.likedPosts);

    const intersection = new Set([...likedPosts1].filter((x) => likedPosts2.has(x)));
    const union = new Set([...likedPosts1, ...likedPosts2]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
  }

  /**
   * 유사 사용자 찾기
   */
  findSimilarUsers(
    targetUser: UserPreference,
    allUsers: UserPreference[],
    limit = 10
  ): Array<{ userId: string; similarity: number }> {
    return allUsers
      .filter((user) => user.userId !== targetUser.userId)
      .map((user) => ({
        userId: user.userId,
        similarity: this.calculateUserSimilarity(targetUser, user),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * 협업 필터링 기반 추천
   */
  recommendFromSimilarUsers(
    targetUser: UserPreference,
    allUsers: UserPreference[],
    limit = 5
  ): RecommendationScore[] {
    // 유사 사용자 찾기
    const similarUsers = this.findSimilarUsers(targetUser, allUsers);

    // 유사 사용자들이 좋아한 게시글 수집
    const recommendations = new Map<string, number>();
    const targetLikedPosts = new Set(targetUser.likedPosts);

    similarUsers.forEach(({ userId, similarity }) => {
      const user = allUsers.find((u) => u.userId === userId);
      if (!user) return;

      user.likedPosts.forEach((postId) => {
        // 이미 좋아요한 게시글은 제외
        if (targetLikedPosts.has(postId)) return;

        const currentScore = recommendations.get(postId) || 0;
        recommendations.set(postId, currentScore + similarity);
      });
    });

    // 점수 순으로 정렬
    return Array.from(recommendations.entries())
      .map(([itemId, score]) => ({
        itemId,
        score,
        reason: '유사한 사용자들이 좋아한 게시글',
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

/**
 * 하이브리드 추천 시스템
 * 콘텐츠 기반 + 협업 필터링 결합
 */
export class HybridRecommender {
  private contentBased = new ContentBasedRecommender();
  private collaborative = new CollaborativeFilteringRecommender();

  /**
   * 하이브리드 추천
   */
  recommend(
    targetUser: UserPreference,
    allUsers: UserPreference[],
    allPosts: any[],
    options: {
      contentWeight?: number;
      collaborativeWeight?: number;
      limit?: number;
    } = {}
  ): RecommendationScore[] {
    const {
      contentWeight = 0.4,
      collaborativeWeight = 0.6,
      limit = 10,
    } = options;

    // 최근 본 게시글 기반 콘텐츠 추천
    const recentPost = allPosts.find(
      (p) => p.id === targetUser.viewedPosts[targetUser.viewedPosts.length - 1]
    );
    const contentRecommendations = recentPost
      ? this.contentBased.recommendSimilarPosts(recentPost, allPosts, limit * 2)
      : [];

    // 협업 필터링 추천
    const collaborativeRecommendations =
      this.collaborative.recommendFromSimilarUsers(targetUser, allUsers, limit * 2);

    // 두 추천 결과 결합
    const combined = new Map<string, RecommendationScore>();

    // 콘텐츠 기반 추천 추가
    contentRecommendations.forEach((rec) => {
      combined.set(rec.itemId, {
        itemId: rec.itemId,
        score: rec.score * contentWeight,
        reason: rec.reason,
      });
    });

    // 협업 필터링 추천 추가
    collaborativeRecommendations.forEach((rec) => {
      const existing = combined.get(rec.itemId);
      if (existing) {
        existing.score += rec.score * collaborativeWeight;
        existing.reason += ` & ${rec.reason}`;
      } else {
        combined.set(rec.itemId, {
          itemId: rec.itemId,
          score: rec.score * collaborativeWeight,
          reason: rec.reason,
        });
      }
    });

    // 최종 정렬 및 반환
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 트렌딩 콘텐츠 추천 (시간 가중치 적용)
   */
  recommendTrending(
    allPosts: any[],
    options: {
      timeWindow?: number; // 시간 범위 (시간 단위)
      limit?: number;
    } = {}
  ): RecommendationScore[] {
    const { timeWindow = 24, limit = 10 } = options;

    const now = new Date();
    const cutoffTime = new Date(now.getTime() - timeWindow * 60 * 60 * 1000);

    return allPosts
      .filter((post) => new Date(post.createdAt) > cutoffTime)
      .map((post) => {
        // 시간 가중치 계산 (최근일수록 높은 점수)
        const ageInHours =
          (now.getTime() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.exp(-ageInHours / timeWindow);

        // 인기도 점수
        const popularityScore = post.viewCount + post.likeCount * 2;

        return {
          itemId: post.id,
          score: popularityScore * timeDecay,
          reason: '트렌딩 게시글',
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 개인화된 주식 추천
   */
  recommendStocks(
    targetUser: UserPreference,
    allStocks: any[],
    limit = 5
  ): RecommendationScore[] {
    const viewedStocks = new Set(targetUser.viewedStocks);

    // 사용자가 본 주식들의 카테고리/섹터 분석
    const viewedStockData = allStocks.filter((s) => viewedStocks.has(s.id));
    const sectors = viewedStockData.map((s) => s.sector);
    const sectorCounts = sectors.reduce(
      (acc, sector) => {
        acc[sector] = (acc[sector] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 선호 섹터 기반 추천
    return allStocks
      .filter((stock) => !viewedStocks.has(stock.id))
      .map((stock) => {
        const sectorPreference = sectorCounts[stock.sector] || 0;
        const performanceScore = stock.changePercent || 0;

        return {
          itemId: stock.id,
          score: sectorPreference * 0.6 + performanceScore * 0.4,
          reason: `${stock.sector} 섹터 추천`,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

/**
 * 추천 시스템 싱글톤 인스턴스
 */
export const recommendationEngine = new HybridRecommender();
