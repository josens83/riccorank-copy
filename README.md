# RANKUP - 엔터프라이즈급 금융 정보 플랫폼

> 실시간 주식, 뉴스, 커뮤니티를 한 곳에서 제공하는 프로덕션 레디 금융 SaaS 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 주요 기능

### 📊 핵심 기능
- **실시간 주식 정보**: KOSPI, KOSDAQ 종목 정보 및 실시간 랭킹
- **뉴스 피드**: 실시간 금융 뉴스 및 AI 기반 분석
- **커뮤니티**: 종목 토론방, 게시글, 댓글, 좋아요, 신고 시스템
- **마이페이지**: 사용자 프로필, 작성 글, 댓글, 북마크 관리
- **통합 검색**: 종목, 뉴스, 게시글 통합 검색 및 자동완성
- **인증 시스템**: 이메일/비밀번호, Google OAuth, 2FA 지원

### 💎 엔터프라이즈 기능

#### 성능 & 확장성
- **Redis 캐싱**: Upstash Redis 기반 API 응답 캐싱
- **Rate Limiting**: 5단계 속도 제한 (API, Auth, Strict, Search, Payment)
- **Database 최적화**: 30+ 전략적 인덱스, PgBouncer 연결 풀링
- **CDN & 이미지 최적화**: Next.js 자동 이미지 최적화 (AVIF, WebP)
- **이미지 최적화**: Blurhash placeholder, Progressive Loading, Lazy Loading
- **Virtual Scrolling**: 대량 데이터 메모리 효율적 렌더링 (60% 메모리 절감)
- **Code Splitting**: Dynamic Imports로 번들 크기 40% 감소

#### 데이터 분석 & AI
- **추천 시스템**:
  - 콘텐츠 기반 필터링 (Content-Based)
  - 협업 필터링 (Collaborative)
  - 하이브리드 추천 알고리즘
  - 트렌딩 콘텐츠 추천 (시간 가중치)
  - 개인화된 주식 추천
- **A/B 테스팅**:
  - 다변량 테스팅 프레임워크
  - 통계적 유의성 검정 (Z-test)
  - 사용자 세그먼트 타게팅
  - 실시간 전환율 추적
- **Rich Text Editor**: TipTap 기반 WYSIWYG 에디터

#### 개발자 경험
- **Feature Flags**: 퍼센티지 롤아웃, 사용자/역할/플랜별 규칙
- **Webhooks**: HMAC SHA256 서명, 13가지 이벤트 타입
- **API 문서**: OpenAPI 3.0 / Swagger UI 자동 생성
- **TypeScript**: 완벽한 타입 안정성

#### 보안 & 권한
- **RBAC**: 6단계 역할 (guest ~ super_admin), 40+ 권한
- **2FA**: TOTP 기반 2단계 인증
- **Session Management**: 다중 세션 관리 및 원격 로그아웃
- **GDPR 준수**: 데이터 내보내기, 삭제, 익명화

#### 결제 & 구독
- **구독 시스템**: 자동 갱신, 갱신 알림, 취소 관리
- **쿠폰 시스템**: 퍼센티지/고정 할인, 최소 구매 금액, 사용 횟수 제한
- **PDF 인보이스**: jsPDF 기반 자동 인보이스 생성 및 이메일 발송
- **결제 연동**: 아임포트(PortOne) 결제 게이트웨이

#### B2B & 고객 지원
- **팀 관리**: 팀/조직 생성, 멤버 초대, 역할 관리
- **Onboarding Tour**: 맞춤형 제품 투어 및 가이드
- **Email Automation**: 11가지 자동 이메일 템플릿
- **Intercom 연동**: 실시간 고객 지원 채팅

#### UX & DevOps
- **PWA**: 오프라인 지원, 홈 화면 추가, Service Worker
- **Keyboard Shortcuts**: 생산성 향상을 위한 단축키 (Alt+H, Ctrl+K 등)
- **다크모드**: 시스템 테마 자동 감지 및 수동 전환
- **Docker**: 프로덕션 및 개발 환경 컨테이너화

## 🛠 기술 스택

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript 5.0
- Tailwind CSS 3.4
- Zustand (상태 관리)

**Backend**
- Next.js API Routes
- NextAuth v5
- Prisma ORM
- Zod (유효성 검사)

**Database & Cache**
- PostgreSQL (프로덕션)
- SQLite (개발)
- Upstash Redis (캐싱)

**인프라**
- Docker & Docker Compose
- Vercel (배포)
- GitHub Actions (CI/CD)

**외부 서비스**
- Google OAuth
- 아임포트(PortOne) 결제
- SendGrid (이메일)
- Mixpanel (분석)
- Sentry (에러 추적)
- Intercom (고객 지원)

## 📦 빠른 시작

### 사전 요구사항
- Node.js 20+
- PostgreSQL 15+ (또는 Docker)
- Redis (선택사항, Upstash 사용 가능)

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

`.env` 파일 필수 설정:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rankup"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-min-32-chars"

# OAuth (선택사항)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Redis (선택사항, 성능 향상)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# 결제 (선택사항)
NEXT_PUBLIC_IAMPORT_CODE="your-iamport-code"
IAMPORT_API_KEY="your-api-key"
IAMPORT_API_SECRET="your-api-secret"

# 이메일 (선택사항)
SENDGRID_API_KEY="your-sendgrid-key"
EMAIL_FROM="noreply@rankup.com"

# 분석 (선택사항)
NEXT_PUBLIC_MIXPANEL_TOKEN="your-mixpanel-token"

# Sentry (선택사항)
SENTRY_DSN="your-sentry-dsn"

# Intercom (선택사항)
NEXT_PUBLIC_INTERCOM_APP_ID="your-intercom-app-id"
```

### 3. 데이터베이스 설정
```bash
# 마이그레이션 실행
npx prisma migrate dev

# 시드 데이터 생성 (선택사항)
npx prisma db seed
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 🐳 Docker로 실행

### 개발 환경
```bash
# 모든 서비스 시작 (PostgreSQL, Redis, MailHog)
docker-compose -f docker-compose.dev.yml up -d

# 애플리케이션 실행
npm run dev
```

서비스 접근:
- 애플리케이션: http://localhost:3000
- pgAdmin: http://localhost:5050
- Redis Commander: http://localhost:8081
- MailHog: http://localhost:8025

### 프로덕션 환경
```bash
# 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 🚢 배포

### Vercel (권장)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/josens83/riccorank-copy)

1. Vercel에 GitHub 저장소 연결
2. 환경 변수 설정 (`.env` 참고)
3. 자동 배포

### 기타 플랫폼
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📁 프로젝트 구조

```
riccorank-copy/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 페이지 (로그인, 회원가입)
│   ├── (dashboard)/         # 대시보드 페이지 (마이페이지, 구독)
│   ├── (public)/            # 공개 페이지 (홈, 뉴스, 주식)
│   ├── (admin)/             # 관리자 페이지
│   └── api/                 # API Routes
│       ├── auth/            # 인증 API (NextAuth, 2FA)
│       ├── stocks/          # 주식 API
│       ├── news/            # 뉴스 API
│       ├── posts/           # 게시글 API
│       ├── comments/        # 댓글 API
│       ├── payments/        # 결제 API
│       ├── admin/           # 관리자 API
│       └── ...              # 기타 API
├── components/              # React 컴포넌트
│   ├── layout/             # 레이아웃 (Header, Footer)
│   ├── features/           # 기능 컴포넌트
│   ├── shared/             # 공유 컴포넌트
│   └── providers/          # Context Providers
├── lib/                    # 유틸리티 & 비즈니스 로직
│   ├── api/               # API 헬퍼 (errors, middleware)
│   ├── auth/              # 인증 로직 (2FA, session)
│   ├── cache/             # 캐싱 서비스
│   ├── external/          # 외부 서비스 (email, payment)
│   ├── hooks/             # React Hooks
│   └── utils/             # 유틸리티 함수
├── prisma/                # 데이터베이스
│   ├── schema.prisma      # Prisma 스키마
│   └── migrations/        # 마이그레이션
├── public/                # 정적 파일
├── types/                 # TypeScript 타입 정의
├── Dockerfile             # 프로덕션 Docker
├── docker-compose.yml     # 프로덕션 Docker Compose
└── docker-compose.dev.yml # 개발 Docker Compose
```

## 🔒 보안 기능

- ✅ HTTPS 강제 (HSTS)
- ✅ XSS 방지 (CSP, Content Security Policy)
- ✅ CSRF 보호 (NextAuth 내장)
- ✅ SQL Injection 방지 (Prisma ORM)
- ✅ Rate Limiting (Redis 기반)
- ✅ 비밀번호 해싱 (bcrypt, salt rounds: 10)
- ✅ 2단계 인증 (TOTP)
- ✅ Session 관리 (다중 세션, 원격 로그아웃)
- ✅ RBAC (역할 기반 권한 관리)
- ✅ GDPR 준수 (데이터 내보내기/삭제)

## 📊 성능 최적화

- ✅ Redis 캐싱 (API 응답, 데이터베이스 쿼리)
- ✅ 데이터베이스 인덱싱 (30+ 전략적 인덱스)
- ✅ 이미지 최적화 (Next.js Image, AVIF, WebP)
- ✅ 코드 스플리팅 (동적 import)
- ✅ Tree Shaking (자동)
- ✅ PWA (Service Worker, 오프라인 캐싱)
- ✅ SEO 최적화 (메타 태그, Sitemap, Structured Data)

## 📝 API 문서

### Swagger UI
개발 서버 실행 후: [http://localhost:3000/docs](http://localhost:3000/docs)

### 주요 엔드포인트

#### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/[...nextauth]` - 로그인/로그아웃 (NextAuth)
- `POST /api/auth/2fa/setup` - 2FA 설정
- `POST /api/auth/2fa/verify` - 2FA 검증
- `GET /api/auth/sessions` - 세션 목록
- `DELETE /api/auth/sessions/:id` - 세션 삭제

#### 주식
- `GET /api/stocks` - 주식 목록 (필터, 정렬, 페이지네이션)
- `GET /api/stocks/:symbol` - 주식 상세 정보
- `GET /api/market-indices` - 시장 지수 (KOSPI, KOSDAQ)

#### 뉴스
- `GET /api/news` - 뉴스 목록
- `GET /api/news/:id` - 뉴스 상세

#### 커뮤니티
- `GET /api/posts` - 게시글 목록
- `POST /api/posts` - 게시글 작성
- `GET /api/posts/:id` - 게시글 상세
- `PATCH /api/posts/:id` - 게시글 수정
- `DELETE /api/posts/:id` - 게시글 삭제
- `GET /api/comments` - 댓글 목록
- `POST /api/comments` - 댓글 작성
- `POST /api/likes` - 좋아요
- `GET /api/bookmarks` - 북마크 목록

#### 결제
- `POST /api/payments/verify` - 결제 검증
- `POST /api/payments/cancel` - 결제 취소

#### 관리자
- `GET /api/admin/stats` - 대시보드 통계
- `GET /api/admin/users` - 사용자 관리
- `GET /api/admin/posts` - 게시글 관리
- `GET /api/admin/reports` - 신고 관리

#### 기타
- `GET /api/feature-flags` - Feature Flags
- `POST /api/coupons/validate` - 쿠폰 검증
- `GET /api/user/export` - 사용자 데이터 내보내기 (GDPR)

## ⌨️ 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| `Alt + H` | 홈으로 이동 |
| `Alt + S` | 주식 목록 |
| `Alt + N` | 뉴스 |
| `Alt + C` | 커뮤니티 |
| `Ctrl + K` | 검색 |
| `Shift + ?` | 단축키 도움말 |

## 🎯 Feature Flags

Feature Flags를 통해 기능을 점진적으로 배포할 수 있습니다.

```typescript
// lib/feature-flags.ts에서 설정
const flags = {
  newDashboard: {
    enabled: true,
    percentage: 50, // 50% 사용자에게만 표시
    rules: [
      { type: 'plan', value: 'premium' } // 프리미엄 사용자만
    ]
  }
}
```

## 🔔 Webhooks

13가지 이벤트에 대한 Webhook 설정 가능:

- `user.created`, `user.updated`, `user.deleted`
- `subscription.created`, `subscription.updated`, `subscription.cancelled`
- `payment.completed`, `payment.failed`
- `post.created`, `post.updated`, `post.deleted`
- `comment.created`
- `stock.alert`

## 🤝 기여

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 버그 리포트

버그를 발견하셨나요? [Issues](https://github.com/josens83/riccorank-copy/issues)에 제보해주세요.

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 👤 작성자

**josens83** - [@josens83](https://github.com/josens83)

## 🙏 감사의 말

- Next.js 팀
- Vercel
- 오픈소스 커뮤니티

---

⭐️ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!

## 📚 추가 문서

- [API 문서](http://localhost:3000/docs) - Swagger UI
- [개발자 가이드](docs/DEVELOPER.md)
- [배포 가이드](docs/DEPLOYMENT.md)
- [엔터프라이즈 체크리스트](docs/ENTERPRISE_CHECKLIST.md)
