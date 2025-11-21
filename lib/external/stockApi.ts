// Stock API Client using Yahoo Finance
import yahooFinance from 'yahoo-finance2';
import { Stock, MarketIndex } from '@/types/models';

/**
 * 한국 주식 종목 목록 (주요 종목)
 * KOSPI: .KS, KOSDAQ: .KQ 접미사 사용
 */
const KOREAN_STOCKS = [
  // KOSPI 대형주
  { symbol: '005930', name: '삼성전자', market: 'KOSPI' },
  { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI' },
  { symbol: '005380', name: '현대차', market: 'KOSPI' },
  { symbol: '000270', name: '기아', market: 'KOSPI' },
  { symbol: '105560', name: 'KB금융', market: 'KOSPI' },
  { symbol: '055550', name: '신한지주', market: 'KOSPI' },
  { symbol: '035720', name: '카카오', market: 'KOSPI' },
  { symbol: '035420', name: 'NAVER', market: 'KOSPI' },
  { symbol: '051910', name: 'LG화학', market: 'KOSPI' },
  { symbol: '006400', name: '삼성SDI', market: 'KOSPI' },
  { symbol: '068270', name: '셀트리온', market: 'KOSPI' },
  { symbol: '207940', name: '삼성바이오로직스', market: 'KOSPI' },
  { symbol: '005490', name: 'POSCO홀딩스', market: 'KOSPI' },
  { symbol: '028260', name: '삼성물산', market: 'KOSPI' },
  { symbol: '012330', name: '현대모비스', market: 'KOSPI' },
  { symbol: '066570', name: 'LG전자', market: 'KOSPI' },
  { symbol: '003550', name: 'LG', market: 'KOSPI' },
  { symbol: '017670', name: 'SK텔레콤', market: 'KOSPI' },
  { symbol: '032830', name: '삼성생명', market: 'KOSPI' },
  { symbol: '015760', name: '한국전력', market: 'KOSPI' },

  // KOSDAQ 주요 종목
  { symbol: '247540', name: '에코프로비엠', market: 'KOSDAQ' },
  { symbol: '086520', name: '에코프로', market: 'KOSDAQ' },
  { symbol: '091990', name: '셀트리온헬스케어', market: 'KOSDAQ' },
  { symbol: '196170', name: '알테오젠', market: 'KOSDAQ' },
  { symbol: '067160', name: '아프리카TV', market: 'KOSDAQ' },
  { symbol: '058470', name: '리노공업', market: 'KOSDAQ' },
  { symbol: '263750', name: '펄어비스', market: 'KOSDAQ' },
  { symbol: '293490', name: '카카오게임즈', market: 'KOSDAQ' },
  { symbol: '036930', name: '주성엔지니어링', market: 'KOSDAQ' },
  { symbol: '112040', name: '위메이드', market: 'KOSDAQ' },
];

/**
 * Yahoo Finance 심볼 변환
 * 한국 주식: KOSPI는 .KS, KOSDAQ는 .KQ 접미사 추가
 */
function toYahooSymbol(symbol: string, market: 'KOSPI' | 'KOSDAQ'): string {
  return market === 'KOSPI' ? `${symbol}.KS` : `${symbol}.KQ`;
}

/**
 * 단일 주식 정보 조회
 */
export async function getStockQuote(symbol: string, market: 'KOSPI' | 'KOSDAQ'): Promise<Stock | null> {
  try {
    const yahooSymbol = toYahooSymbol(symbol, market);
    const quote: any = await yahooFinance.quote(yahooSymbol);

    if (!quote || !quote.regularMarketPrice) {
      console.error(`No data for ${yahooSymbol}`);
      return null;
    }

    // 재무 데이터 조회 (선택적)
    let financialData: any = null;
    try {
      financialData = await yahooFinance.quoteSummary(yahooSymbol, {
        modules: ['defaultKeyStatistics', 'financialData']
      });
    } catch (error) {
      console.warn(`Financial data not available for ${yahooSymbol}`);
    }

    const stock: Stock = {
      id: symbol,
      symbol: symbol,
      name: quote.displayName || quote.shortName || symbol,
      market: market,
      currentPrice: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: Number(quote.regularMarketVolume || 0),
      marketCap: quote.marketCap ? Math.floor(quote.marketCap / 100000000) : undefined, // 억원 단위
      sales: undefined,
      operatingIncome: undefined,
      netIncome: undefined,
      per: financialData?.defaultKeyStatistics?.forwardPE ?? undefined,
      pbr: financialData?.defaultKeyStatistics?.priceToBook ?? undefined,
      score: undefined,
      rank: undefined,
      updatedAt: new Date(),
    };

    return stock;
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error);
    return null;
  }
}

/**
 * 여러 주식 정보 일괄 조회
 */
export async function getStocks(
  market?: 'KOSPI' | 'KOSDAQ',
  limit: number = 30
): Promise<Stock[]> {
  try {
    let stocksToFetch = KOREAN_STOCKS;

    // 시장별 필터링
    if (market) {
      stocksToFetch = stocksToFetch.filter(s => s.market === market);
    }

    // 제한 적용
    stocksToFetch = stocksToFetch.slice(0, limit);

    // 병렬로 데이터 조회 (5개씩 배치로 처리)
    const batchSize = 5;
    const results: Stock[] = [];

    for (let i = 0; i < stocksToFetch.length; i += batchSize) {
      const batch = stocksToFetch.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(stock => getStockQuote(stock.symbol, stock.market as 'KOSPI' | 'KOSDAQ'))
      );

      results.push(...batchResults.filter((s): s is Stock => s !== null));

      // Rate limiting: 200ms 대기
      if (i + batchSize < stocksToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // 시가총액 기준으로 순위 계산
    results.sort((a, b) => {
      const aMarketCap = a.marketCap ? Number(a.marketCap) : 0;
      const bMarketCap = b.marketCap ? Number(b.marketCap) : 0;
      return bMarketCap - aMarketCap;
    });

    results.forEach((stock, index) => {
      stock.rank = index + 1;
    });

    return results;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return [];
  }
}

/**
 * 시장 지수 조회
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  try {
    const indices = [
      { symbol: '^KS11', name: '코스피지수', displaySymbol: 'KOSPI', country: '국내' },
      { symbol: '^KQ11', name: '코스닥', displaySymbol: 'KOSDAQ', country: '국내' },
      { symbol: '^N225', name: '닛케이', displaySymbol: 'NIKKEI', country: '해외' },
      { symbol: '^DJI', name: '다우존스', displaySymbol: 'DJI', country: '해외' },
      { symbol: '^GSPC', name: 'S&P 500', displaySymbol: 'SPX', country: '해외' },
      { symbol: '^IXIC', name: '나스닥종합지수', displaySymbol: 'NASDAQ', country: '해외' },
    ];

    const results = await Promise.all(
      indices.map(async (index) => {
        try {
          const quote: any = await yahooFinance.quote(index.symbol);

          return {
            id: index.displaySymbol,
            name: index.name,
            symbol: index.displaySymbol,
            value: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            country: index.country,
            updatedAt: new Date(),
          } as MarketIndex;
        } catch (error) {
          console.error(`Error fetching index ${index.symbol}:`, error);
          return null;
        }
      })
    );

    return results.filter((r): r is MarketIndex => r !== null);
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return [];
  }
}

/**
 * 주식 검색
 */
export async function searchStocks(query: string): Promise<Stock[]> {
  const allStocks = await getStocks(undefined, 100);
  const searchLower = query.toLowerCase();

  return allStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchLower) ||
    stock.symbol.includes(query)
  );
}
