# RANKUP - 종합 금융 정보 플랫폼

> 실시간 주식, 뉴스, 커뮤니티를 한 곳에서 제공하는 프로덕션급 금융 정보 플랫폼

## 🚀 주요 기능

### 📊 핵심 기능
- **실시간 주식 정보**: KOSPI, KOSDAQ 종목 정보 및 랭킹
- **뉴스 피드**: 실시간 금융 뉴스 및 분석
- **커뮤니티**: 종목 토론방, 게시글, 댓글, 좋아요 시스템
- **마이페이지**: 사용자 프로필, 작성 글, 댓글, 북마크 관리
- **통합 검색**: 종목, 뉴스, 게시글 통합 검색 및 자동완성
- **인증 시스템**: 이메일/비밀번호, Google OAuth 로그인

### 💎 프로덕션급 기능
- **완벽한 반응형**: 모바일, 태블릿, 데스크톱 완벽 대응
- **다크모드**: 시스템 테마 자동 감지 및 수동 전환
- **SEO 최적화**: Open Graph, Twitter Card, Sitemap, Structured Data
- **PWA 지원**: 오프라인 동작, 홈 화면 추가
- **성능 최적화**: 이미지 자동 최적화, 코드 스플리팅, 캐싱
- **보안 강화**: CSRF, XSS, SQL Injection 방지, Rate Limiting

## 🛠 기술 스택

**Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
**Backend**: Next.js API Routes, NextAuth.js, Prisma, Zod
**Database**: PostgreSQL / MySQL / SQLite
**Deployment**: Vercel

## 📦 빠른 시작

### 1. 설치
```bash
git clone https://github.com/josens83/riccorank-copy.git
cd riccorank-copy
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일 편집:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rankup"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. 데이터베이스 설정
```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 🚢 배포

### Vercel (권장)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/josens83/riccorank-copy)

1. Vercel에 GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포

## 📁 프로젝트 구조

```
riccorank-copy/
├── app/              # Next.js App Router
├── components/       # 재사용 컴포넌트
├── lib/              # 유틸리티 & 설정
├── prisma/           # 데이터베이스 스키마
├── public/           # 정적 파일
└── types/            # TypeScript 타입
```

## 🔒 보안

- ✅ HTTPS 강제 (HSTS)
- ✅ XSS 방지 (CSP)
- ✅ CSRF 보호
- ✅ SQL Injection 방지
- ✅ Rate Limiting
- ✅ 비밀번호 해싱 (bcrypt)

## 📊 성능

- ✅ 이미지 자동 최적화 (AVIF, WebP)
- ✅ 코드 스플리팅
- ✅ API 캐싱
- ✅ Lazy Loading
- ✅ SEO 최적화

## 📝 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/[...nextauth]` - 로그인/로그아웃

### 주식
- `GET /api/stocks` - 주식 목록
- `GET /api/stocks/[symbol]` - 주식 상세

### 뉴스
- `GET /api/news` - 뉴스 목록
- `GET /api/news/[id]` - 뉴스 상세

### 커뮤니티
- `GET/POST /api/posts` - 게시글
- `GET/POST /api/comments` - 댓글
- `POST /api/likes` - 좋아요
- `GET/POST /api/bookmarks` - 북마크

## 🤝 기여

기여는 언제나 환영합니다!

## 📄 라이선스

MIT License

## 👤 작성자

**josens83** - [@josens83](https://github.com/josens83)

---

⭐️ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!
