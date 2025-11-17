# 프로덕션 배포 체크리스트

## 배포 전 필수 확인 사항

### 1. 환경 변수 설정 ✅

```env
# 프로덕션 환경 변수
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# 데이터베이스
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<생성된-강력한-시크릿-키>

# Google OAuth (선택)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Analytics (선택)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# API Keys (필요시)
ALPHA_VANTAGE_API_KEY=your-api-key
NEWS_API_KEY=your-api-key
```

**시크릿 키 생성:**
```bash
openssl rand -base64 32
```

---

### 2. 데이터베이스 설정 ✅

#### PostgreSQL (권장)

**Vercel Postgres:**
```bash
# Vercel 대시보드에서 Postgres 추가
# 자동으로 DATABASE_URL 환경 변수 설정됨
```

**Supabase:**
```bash
# 1. Supabase 프로젝트 생성
# 2. Database > Connection String 복사
# 3. DATABASE_URL에 설정
```

**Railway:**
```bash
# 1. Railway에서 PostgreSQL 추가
# 2. Connection String 복사
# 3. DATABASE_URL에 설정
```

#### 마이그레이션 실행

```bash
# 프로덕션 데이터베이스에 스키마 적용
npx prisma migrate deploy

# 또는 처음 설정 시
npx prisma db push
```

---

### 3. 보안 체크 ✅

- [ ] NEXTAUTH_SECRET 강력한 값으로 설정
- [ ] DATABASE_URL에 강력한 비밀번호 사용
- [ ] API 키들이 `.env`에만 있고 Git에 커밋되지 않았는지 확인
- [ ] `.env.example`에는 실제 값이 없는지 확인
- [ ] CORS 설정 확인
- [ ] Rate Limiting 활성화 확인
- [ ] CSP 헤더 설정 확인

---

### 4. 성능 최적화 ✅

- [ ] 이미지 최적화 설정 확인 (next.config.ts)
- [ ] 번들 크기 확인
  ```bash
  npm run build
  # 번들 크기 확인
  ```
- [ ] Lighthouse 점수 확인 (90+ 목표)
- [ ] 페이지 로드 시간 테스트
- [ ] API 응답 시간 확인

---

### 5. SEO 최적화 ✅

- [ ] `NEXT_PUBLIC_BASE_URL` 프로덕션 URL로 설정
- [ ] `robots.txt` 설정 확인
- [ ] `sitemap.ts` URL 확인
- [ ] Meta tags 확인 (모든 페이지)
- [ ] Open Graph 이미지 추가
- [ ] Twitter Card 설정 확인
- [ ] Google Search Console 등록
- [ ] Google Analytics 설정

---

### 6. 법적 페이지 ✅

- [ ] 이용약관 검토 및 수정 (/terms)
- [ ] 개인정보처리방침 검토 및 수정 (/privacy)
- [ ] 회사 정보 업데이트
- [ ] 개인정보보호책임자 정보 업데이트
- [ ] Footer에 법적 페이지 링크 추가

---

### 7. 에러 처리 ✅

- [ ] 404 페이지 테스트
- [ ] 500 에러 페이지 테스트
- [ ] ErrorBoundary 작동 확인
- [ ] API 에러 응답 확인
- [ ] Toast 알림 작동 확인

---

### 8. 기능 테스트 ✅

#### 인증
- [ ] 이메일/비밀번호 로그인
- [ ] Google OAuth 로그인
- [ ] 회원가입
- [ ] 로그아웃
- [ ] 비밀번호 재설정 (구현 시)

#### 주요 기능
- [ ] 게시글 작성/수정/삭제
- [ ] 댓글 작성/삭제
- [ ] 대댓글 작성
- [ ] 좋아요/좋아요 취소
- [ ] 북마크 추가/제거
- [ ] 검색 기능
- [ ] 검색 자동완성

#### 페이지
- [ ] 홈페이지 로딩
- [ ] 주식 목록
- [ ] 뉴스 페이지
- [ ] 커뮤니티
- [ ] 마이페이지
- [ ] 모든 페이지 반응형 확인

---

### 9. 모바일 테스트 ✅

- [ ] iOS Safari 테스트
- [ ] Android Chrome 테스트
- [ ] 햄버거 메뉴 작동
- [ ] 터치 인터랙션
- [ ] 키보드 표시 시 레이아웃
- [ ] PWA 설치 테스트

---

### 10. 브라우저 호환성 ✅

- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (최신)
- [ ] Edge (최신)
- [ ] 모바일 브라우저

---

## Vercel 배포 단계

### 1. GitHub 연결

```bash
# 1. GitHub에 push
git push origin main

# 2. Vercel 대시보드에서
# - New Project 클릭
# - GitHub 저장소 선택
# - Import
```

### 2. 환경 변수 설정

Vercel 대시보드 > Settings > Environment Variables에서 모든 환경 변수 추가

### 3. 데이터베이스 연결

```bash
# Vercel Postgres 추가
# 또는 외부 DB CONNECTION_STRING 설정
```

### 4. 빌드 설정

```bash
# Build Command (기본값)
npm run build

# Output Directory (기본값)
.next

# Install Command (기본값)
npm install
```

### 5. 배포

```bash
# 자동 배포 (main 브랜치 push 시)
# 또는
# Deploy 버튼 클릭
```

---

## 배포 후 확인 사항

### 1. 즉시 확인

- [ ] 사이트가 로드되는지
- [ ] HTTPS가 작동하는지
- [ ] 로그인/회원가입 작동
- [ ] 데이터베이스 연결 확인
- [ ] API 응답 확인

### 2. 24시간 내

- [ ] Google Search Console에서 크롤링 확인
- [ ] Google Analytics 데이터 수집 확인
- [ ] 에러 로그 확인
- [ ] 성능 모니터링

### 3. 1주일 내

- [ ] SEO 순위 확인
- [ ] 사용자 피드백 수집
- [ ] 버그 리포트 확인
- [ ] 성능 최적화 필요 여부

---

## 모니터링 설정

### Vercel Analytics

```bash
# Vercel 대시보드에서
# Analytics 탭 활성화
```

### Sentry (에러 모니터링)

```bash
npm install @sentry/nextjs

# sentry.client.config.ts
# sentry.server.config.ts 생성
```

### Google Analytics

```typescript
// lib/analytics.ts에 이미 구현됨
// NEXT_PUBLIC_GA_ID 설정만 하면 됨
```

---

## 백업 전략

### 1. 데이터베이스 백업

```bash
# PostgreSQL 백업 (매일 자동)
# Vercel Postgres는 자동 백업 제공

# 수동 백업
pg_dump $DATABASE_URL > backup.sql
```

### 2. 코드 백업

```bash
# GitHub가 자동으로 코드 백업
# 추가로 다른 리포지토리에도 미러링 고려
```

---

## 롤백 계획

### Vercel 롤백

```bash
# Vercel 대시보드에서
# Deployments 탭
# 이전 배포 선택
# "Promote to Production" 클릭
```

### 데이터베이스 롤백

```bash
# 백업에서 복원
psql $DATABASE_URL < backup.sql
```

---

## 성능 목표

- **Lighthouse Score**: 90+ (모든 카테고리)
- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.8s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

---

## 지원 및 유지보수

### 1. 문서화

- [ ] README.md 업데이트
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성

### 2. 이슈 트래킹

- [ ] GitHub Issues 활성화
- [ ] 버그 리포트 템플릿 작성
- [ ] Feature Request 템플릿 작성

### 3. 정기 업데이트

- [ ] 의존성 업데이트 (월 1회)
- [ ] 보안 패치 즉시 적용
- [ ] 기능 개선 계획

---

## 긴급 연락처

**개발팀:**
- 이메일: dev@rankup.com
- 슬랙: #rankup-dev

**인프라팀:**
- 이메일: infra@rankup.com
- 온콜: +82-10-xxxx-xxxx

**DBA:**
- 이메일: dba@rankup.com
- 온콜: +82-10-xxxx-xxxx

---

## 참고 자료

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Production](https://www.prisma.io/docs/guides/deployment/deployment)
- [Next.js Best Practices](https://nextjs.org/docs/going-to-production)

---

**최종 체크:** 모든 항목을 확인한 후 배포하세요! ✅
