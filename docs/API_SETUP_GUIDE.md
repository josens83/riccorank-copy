# 실시간 API 연동 설정 가이드

> Yahoo Finance + Naver News API를 사용한 실시간 주식/뉴스 데이터 연동

## ✅ 구현 완료 사항

### 주식 데이터
- **API**: Yahoo Finance2 (무료, API 키 불필요)
- **지원 종목**: KOSPI, KOSDAQ 주요 30개 종목
- **데이터**: 실시간 가격, 등락률, 거래량, 시가총액, PER, PBR
- **캐싱**: 5분 TTL
- **Fallback**: API 실패 시 Mock 데이터로 자동 전환

### 시장 지수
- **API**: Yahoo Finance2
- **지원**: KOSPI, KOSDAQ, 다우존스, S&P 500, 나스닥, 닛케이
- **캐싱**: 2분 TTL (빠른 업데이트)

### 뉴스 데이터
- **API**: Naver News API (무료, API 키 필요)
- **지원**: 금융, 증권, 주식 관련 실시간 뉴스
- **캐싱**: 15분 TTL
- **Fallback**: Naver API 키 없으면 Mock 데이터 사용

---

## 🚀 빠른 시작 (5분 완료)

### 1단계: Yahoo Finance는 이미 동작중 ✅

Yahoo Finance는 API 키가 필요 없으므로 **별도 설정 없이 바로 사용 가능**합니다.

서버 재시작 후 다음 엔드포인트에서 실시간 데이터를 확인할 수 있습니다:
```bash
curl http://localhost:3000/api/stocks
curl http://localhost:3000/api/market-indices
```

### 2단계: Naver News API 설정 (선택사항)

뉴스 데이터를 실시간으로 받으려면 Naver API 키가 필요합니다.

#### 2-1. Naver Developers 가입
1. https://developers.naver.com/ 접속
2. 회원가입 및 로그인
3. 상단 메뉴 > **Application** > **애플리케이션 등록**

#### 2-2. 애플리케이션 생성
1. **애플리케이션 이름**: "RANKUP 뉴스" (자유롭게 입력)
2. **사용 API**: ✅ **검색** 선택
3. **환경 추가**:
   - **WEB 설정** 추가
   - **서비스 URL**: `http://localhost:3000` (개발)
   - 배포 시: `https://yourdomain.com` 추가
4. **등록하기** 클릭

#### 2-3. Client ID/Secret 확인
등록 후 나타나는 화면에서:
- **Client ID**: `YOUR_CLIENT_ID`
- **Client Secret**: `YOUR_CLIENT_SECRET`

이 값들을 복사하세요.

#### 2-4. 환경 변수 설정

`.env` 파일 생성 (또는 수정):
```bash
cp .env.example .env
```

`.env` 파일에 다음 추가:
```env
# Naver News API
NAVER_CLIENT_ID="YOUR_CLIENT_ID"
NAVER_CLIENT_SECRET="YOUR_CLIENT_SECRET"
```

#### 2-5. 서버 재시작
```bash
npm run dev
```

뉴스 API 확인:
```bash
curl http://localhost:3000/api/news
```

---

## 📊 API 동작 확인

### 1. 주식 데이터 (Yahoo Finance)
```bash
# 전체 주식 목록
curl http://localhost:3000/api/stocks

# KOSPI만
curl http://localhost:3000/api/stocks?market=KOSPI

# KOSDAQ만
curl http://localhost:3000/api/stocks?market=KOSDAQ

# 검색
curl http://localhost:3000/api/stocks?search=삼성

# 정렬 (시가총액 내림차순)
curl "http://localhost:3000/api/stocks?sortBy=marketCap&sortOrder=desc"
```

**응답 예시:**
```json
{
  "data": [
    {
      "id": "005930",
      "symbol": "005930",
      "name": "삼성전자",
      "market": "KOSPI",
      "currentPrice": 71200,
      "change": -1500,
      "changePercent": -2.06,
      "volume": "15234567",
      "marketCap": "4250000",
      "per": 12.5,
      "pbr": 1.2,
      "rank": 1
    }
  ],
  "total": 30,
  "page": 1
}
```

### 2. 시장 지수
```bash
# 전체 지수
curl http://localhost:3000/api/market-indices

# 국내만
curl http://localhost:3000/api/market-indices?country=국내

# 해외만
curl http://localhost:3000/api/market-indices?country=해외
```

**응답 예시:**
```json
{
  "data": [
    {
      "id": "KOSPI",
      "name": "코스피지수",
      "symbol": "KOSPI",
      "value": 2650.45,
      "change": 15.23,
      "changePercent": 0.58,
      "country": "국내"
    }
  ]
}
```

### 3. 뉴스 (Naver)
```bash
# 금융 뉴스
curl http://localhost:3000/api/news

# 검색
curl http://localhost:3000/api/news?search=삼성전자

# 카테고리별
curl http://localhost:3000/api/news?category=증권
```

**응답 예시:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "삼성전자, AI 반도체 수요 증가로 실적 개선",
      "content": "삼성전자가 AI 반도체 시장에서...",
      "source": "네이버 뉴스",
      "url": "https://news.naver.com/...",
      "isHot": true,
      "category": "국내",
      "publishedAt": "2025-11-18T10:30:00Z"
    }
  ]
}
```

---

## 🔧 고급 설정

### 캐시 TTL 조정

`lib/cache.ts` 또는 각 API 라우트에서 TTL 수정:

```typescript
// app/api/stocks/route.ts
getCachedData(
  cacheKey,
  fetcher,
  3 * 60 * 1000  // 3분으로 변경
);
```

**권장 TTL:**
- 주식: 2~5분 (시장 개장 시간에는 짧게)
- 시장 지수: 1~2분
- 뉴스: 10~15분

### 종목 추가

`lib/stockApi.ts`의 `KOREAN_STOCKS` 배열에 추가:

```typescript
const KOREAN_STOCKS = [
  // 기존 종목들...
  { symbol: '000000', name: '새종목', market: 'KOSPI' },
];
```

### API 실패 처리

모든 API는 자동으로 Fallback 처리됩니다:
1. API 호출 시도
2. 실패 시 → Mock 데이터 사용
3. 에러 로그 출력

수동으로 캐시 무효화:
```typescript
import { invalidateCache } from '@/lib/cache';

// 특정 캐시 삭제
invalidateCache('stocks:market=KOSPI');

// 모든 캐시 삭제
import { clearAllCache } from '@/lib/cache';
clearAllCache();
```

---

## 📈 성능 최적화

### 1. 캐싱 전략
- ✅ 메모리 기반 캐시 (빠름)
- ✅ TTL 기반 자동 만료
- ✅ 10분마다 만료된 캐시 정리

### 2. Rate Limiting
- Yahoo Finance: 배치당 5개씩, 200ms 지연
- Naver News: 일 25,000 requests (충분함)

### 3. 에러 핸들링
- API 실패 시 자동으로 Mock 데이터로 Fallback
- 로그를 통해 API 상태 모니터링

---

## 🐛 문제 해결

### Q1: 주식 데이터가 업데이트되지 않아요
**A**: 캐시 때문일 수 있습니다.
- 서버 재시작하거나
- 5분 후 다시 시도 (캐시 TTL)
- 개발 중이라면 TTL을 짧게 조정

### Q2: 뉴스가 Mock 데이터로 나와요
**A**: Naver API 키를 확인하세요.
```bash
# .env 파일 확인
cat .env | grep NAVER

# 없으면 위의 2단계 참고하여 설정
```

### Q3: Yahoo Finance API가 느려요
**A**: Yahoo Finance는 무료 API라 가끔 느릴 수 있습니다.
- 캐시가 동작하므로 두 번째 요청부터는 빠름
- 종목 수를 줄이거나 배치 크기 조정

### Q4: KOSDAQ 종목이 없어요
**A**: `lib/stockApi.ts`의 `KOREAN_STOCKS` 배열에 추가하세요.

---

## 🔒 프로덕션 배포 시 주의사항

### 1. 환경 변수
Vercel/Netlify 등에서 다음 환경 변수 설정:
```env
NAVER_CLIENT_ID=your_production_client_id
NAVER_CLIENT_SECRET=your_production_client_secret
```

### 2. Naver API 도메인 등록
Naver Developers > 애플리케이션 > **WEB 설정**에 프로덕션 도메인 추가:
```
https://yourapp.vercel.app
```

### 3. Rate Limiting 모니터링
- Naver: 일 25,000 requests
- Yahoo Finance: 제한 없음 (하지만 너무 많으면 차단 가능)

### 4. 캐싱 최적화
프로덕션에서는 Redis 사용 권장:
```bash
npm install ioredis
```

---

## 📚 참고 자료

- [Yahoo Finance2 Documentation](https://github.com/gadicc/node-yahoo-finance2)
- [Naver Developers](https://developers.naver.com/docs/search/news/)
- [캐싱 전략 Best Practices](https://vercel.com/docs/concepts/edge-network/caching)

---

## ✨ 다음 단계

1. ✅ **주식/뉴스 실시간 연동** (완료)
2. 🔲 **차트 데이터 추가** (TradingView or Chart.js)
3. 🔲 **WebSocket 실시간 시세** (한투 API)
4. 🔲 **AI 종목 추천** (OpenAI API)
5. 🔲 **포트폴리오 관리** (사용자별 보유 종목)

---

**문의사항이나 이슈가 있으면 GitHub Issue로 남겨주세요!** 🚀
