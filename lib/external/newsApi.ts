// News API Client using Naver News API
import { News } from '@/types/models';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverNewsResponse {
  items: NaverNewsItem[];
  total: number;
  start: number;
  display: number;
}

/**
 * HTML 태그 제거
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Naver 뉴스 검색
 */
export async function searchNaverNews(
  query: string = '주식',
  display: number = 20,
  sort: 'sim' | 'date' = 'date'
): Promise<News[]> {
  // API 키가 없으면 빈 배열 반환 (Fallback)
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.warn('Naver API credentials not configured. Skipping news fetch.');
    return [];
  }

  try {
    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(
      query
    )}&display=${display}&sort=${sort}`;

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      throw new Error(`Naver API error: ${response.status}`);
    }

    const data: NaverNewsResponse = await response.json();

    return data.items.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      title: stripHtml(item.title),
      content: stripHtml(item.description),
      summary: stripHtml(item.description).substring(0, 100) + '...',
      source: '네이버 뉴스',
      url: item.originallink || item.link,
      imageUrl: undefined,
      isHot: index < 3, // 상위 3개는 핫 뉴스로 표시
      category: '국내',
      tags: undefined,
      views: 0,
      publishedAt: new Date(item.pubDate),
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching Naver news:', error);
    return [];
  }
}

/**
 * 금융 뉴스 가져오기
 */
export async function getFinancialNews(limit: number = 20): Promise<News[]> {
  const queries = ['주식', '증권', '금융'];
  const newsPerQuery = Math.ceil(limit / queries.length);

  try {
    const results = await Promise.all(
      queries.map(query => searchNaverNews(query, newsPerQuery))
    );

    // 모든 결과를 합치고 중복 제거
    const allNews = results.flat();
    const uniqueNews = allNews.filter(
      (news, index, self) =>
        index === self.findIndex(n => n.title === news.title)
    );

    // 발행일 기준 정렬
    uniqueNews.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    return uniqueNews.slice(0, limit);
  } catch (error) {
    console.error('Error fetching financial news:', error);
    return [];
  }
}

/**
 * 카테고리별 뉴스 가져오기
 */
export async function getNewsByCategory(
  category: string,
  limit: number = 20
): Promise<News[]> {
  const categoryQueries: Record<string, string> = {
    '국내': '주식 국내',
    '해외': '주식 해외 미국',
    '증권': '증권 시황',
    '경제': '경제 금융',
  };

  const query = categoryQueries[category] || '주식';
  const news = await searchNaverNews(query, limit);

  return news.map(item => ({
    ...item,
    category: category,
  }));
}

/**
 * 뉴스 검색
 */
export async function searchNews(query: string, limit: number = 20): Promise<News[]> {
  return searchNaverNews(query, limit, 'sim'); // 유사도순 정렬
}
