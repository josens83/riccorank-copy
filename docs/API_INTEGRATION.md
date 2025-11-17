# API 통합 가이드

## 실시간 주식 API 통합

현재 프로젝트는 mock 데이터를 사용하고 있습니다. 실제 주식 데이터를 사용하려면 다음 API 중 하나를 선택하여 통합하세요.

### 1. Alpha Vantage (무료/유료)

**특징:**
- 무료 티어: 일 500 requests
- 실시간 및 과거 주식 데이터
- 글로벌 시장 지원

**설치:**
```bash
npm install alpha-vantage-cli
```

**사용 예시:**
```typescript
// lib/stockApi.ts
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function getStockData(symbol: string) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return {
    symbol,
    price: parseFloat(data['Global Quote']['05. price']),
    change: parseFloat(data['Global Quote']['09. change']),
    changePercent: parseFloat(data['Global Quote']['10. change percent'].replace('%', '')),
  };
}
```

**환경 변수:**
```env
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

**가입:** https://www.alphavantage.co/support/#api-key

---

### 2. Yahoo Finance (비공식 API)

**특징:**
- 무료
- 한국 시장 지원 (KOSPI, KOSDAQ)
- 실시간 데이터

**설치:**
```bash
npm install yahoo-finance2
```

**사용 예시:**
```typescript
// lib/stockApi.ts
import yahooFinance from 'yahoo-finance2';

export async function getKoreanStockData(symbol: string) {
  // 한국 주식은 .KS (KOSPI) 또는 .KQ (KOSDAQ) 접미사 필요
  const fullSymbol = `${symbol}.KS`; // 또는 .KQ

  try {
    const quote = await yahooFinance.quote(fullSymbol);

    return {
      symbol,
      name: quote.displayName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
    };
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    return null;
  }
}
```

---

### 3. 한국투자증권 Open API (한국 시장 전용)

**특징:**
- 한국 증권사 공식 API
- 실시간 호가, 체결 데이터
- 무료 (개인 투자자용)

**가입:** https://apiportal.koreainvestment.com/

**사용 예시:**
```typescript
// lib/kisApi.ts
const KIS_APP_KEY = process.env.KIS_APP_KEY;
const KIS_APP_SECRET = process.env.KIS_APP_SECRET;

async function getAccessToken() {
  const response = await fetch('https://openapi.koreainvestment.com:9443/oauth2/tokenP', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function getStockQuote(symbol: string) {
  const token = await getAccessToken();

  const response = await fetch(
    `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`,
        'appkey': KIS_APP_KEY,
        'appsecret': KIS_APP_SECRET,
        'tr_id': 'FHKST01010100',
      },
    }
  );

  return await response.json();
}
```

---

### 4. 구현 위치

**API 라우트 수정:**
```typescript
// app/api/stocks/route.ts
import { getStockData } from '@/lib/stockApi';

export async function GET(request: NextRequest) {
  // Mock 데이터 대신 실제 API 호출
  const stocks = await Promise.all(
    symbols.map(symbol => getStockData(symbol))
  );

  return NextResponse.json({ data: stocks });
}
```

---

## 실시간 뉴스 API 통합

### 1. NewsAPI (무료/유료)

**특징:**
- 70,000+ 뉴스 소스
- 무료 티어: 월 1,000 requests
- 한국 뉴스 지원

**설치:**
```bash
npm install newsapi
```

**사용 예시:**
```typescript
// lib/newsApi.ts
const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function getFinancialNews(page: number = 1) {
  const url = `https://newsapi.org/v2/everything?q=주식+금융+증권&language=ko&pageSize=20&page=${page}&apiKey=${NEWS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.articles.map((article: any) => ({
    id: article.url,
    title: article.title,
    content: article.description,
    source: article.source.name,
    publishedAt: new Date(article.publishedAt),
    url: article.url,
    image: article.urlToImage,
  }));
}
```

**환경 변수:**
```env
NEWS_API_KEY=your_news_api_key_here
```

**가입:** https://newsapi.org/

---

### 2. Naver 뉴스 API (한국 뉴스)

**특징:**
- 네이버 뉴스 검색
- 무료
- 일 25,000 requests

**사용 예시:**
```typescript
// lib/naverNewsApi.ts
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

export async function searchNaverNews(query: string, display: number = 20) {
  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=date`;

  const response = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
  });

  const data = await response.json();

  return data.items.map((item: any) => ({
    id: item.link,
    title: item.title.replace(/<[^>]*>/g, ''),
    content: item.description.replace(/<[^>]*>/g, ''),
    source: '네이버 뉴스',
    publishedAt: new Date(item.pubDate),
    url: item.link,
  }));
}
```

**가입:** https://developers.naver.com/

---

## 캐싱 전략

실제 API를 사용할 때는 반드시 캐싱을 구현하세요:

```typescript
// lib/cache.ts
import { apiCache } from './performance';

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5분
): Promise<T> {
  // 캐시 확인
  const cached = apiCache.get(key);
  if (cached) return cached;

  // API 호출
  const data = await fetcher();

  // 캐시 저장
  apiCache.set(key, data);

  return data;
}

// 사용 예시
const stocks = await getCachedData(
  'stocks-kospi',
  () => getStockData(),
  5 * 60 * 1000 // 5분 캐싱
);
```

---

## Rate Limiting 주의사항

실제 API 사용 시 Rate Limiting을 준수해야 합니다:

```typescript
// lib/rateLimiter.ts
class APIRateLimiter {
  private lastCall: number = 0;
  private minInterval: number;

  constructor(callsPerMinute: number) {
    this.minInterval = (60 * 1000) / callsPerMinute;
  }

  async throttle() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }

    this.lastCall = Date.now();
  }
}

const stockAPILimiter = new APIRateLimiter(5); // 분당 5회

export async function fetchStockWithLimit(symbol: string) {
  await stockAPILimiter.throttle();
  return await getStockData(symbol);
}
```

---

## 환경 변수 설정

`.env` 파일에 다음 변수를 추가하세요:

```env
# Stock APIs
ALPHA_VANTAGE_API_KEY=your_key
# or
KIS_APP_KEY=your_key
KIS_APP_SECRET=your_secret

# News APIs
NEWS_API_KEY=your_key
# or
NAVER_CLIENT_ID=your_id
NAVER_CLIENT_SECRET=your_secret
```

---

## 테스트

API 통합 후 반드시 테스트하세요:

```bash
# API 테스트
curl http://localhost:3000/api/stocks

# 응답 확인
{
  "data": [
    {
      "symbol": "005930",
      "name": "삼성전자",
      "price": 70000,
      "change": 1000,
      "changePercent": 1.45
    }
  ]
}
```

---

## 에러 처리

API 호출 실패 시 fallback을 제공하세요:

```typescript
export async function getStockDataSafe(symbol: string) {
  try {
    return await getStockData(symbol);
  } catch (error) {
    console.error('Stock API failed:', error);
    // Mock 데이터로 fallback
    return mockStocks.find(s => s.symbol === symbol);
  }
}
```

---

## 비용 최적화

1. **캐싱 활용**: 동일한 데이터를 반복 요청하지 마세요
2. **배치 요청**: 가능하면 여러 종목을 한 번에 요청하세요
3. **오프 시간 스케줄링**: 시장 마감 후에는 API 호출을 줄이세요
4. **WebSocket 고려**: 실시간 데이터가 필요하면 WebSocket을 사용하세요

---

## 참고 자료

- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [Yahoo Finance API](https://github.com/gadicc/node-yahoo-finance2)
- [한국투자증권 API](https://apiportal.koreainvestment.com/)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [Naver Developers](https://developers.naver.com/docs/search/news/)
