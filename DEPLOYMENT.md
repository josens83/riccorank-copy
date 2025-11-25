# RANKUP 배포 가이드

> 프로덕션 환경에 RANKUP을 안전하고 효율적으로 배포하는 완전한 가이드

## 📋 목차

- [배포 전 체크리스트](#배포-전-체크리스트)
- [Vercel 배포 (권장)](#vercel-배포-권장)
- [Docker 배포](#docker-배포)
- [일반 서버 배포](#일반-서버-배포)
- [환경 변수 설정](#환경-변수-설정)
- [데이터베이스 설정](#데이터베이스-설정)
- [모니터링 & 로깅](#모니터링--로깅)
- [백업 전략](#백업-전략)
- [트러블슈팅](#트러블슈팅)

---

## 배포 전 체크리스트

### ✅ 필수 확인 사항

- [ ] **코드 검증**
  - [ ] `npm run lint` 통과
  - [ ] `npm test` 전체 통과 (119/119)
  - [ ] `npx tsc --noEmit` 타입 체크 통과
  - [ ] `npm audit` 보안 확인

- [ ] **환경 설정**
  - [ ] 프로덕션 환경 변수 준비
  - [ ] PostgreSQL 데이터베이스 준비
  - [ ] Redis (Upstash) 설정 (선택사항)
  - [ ] 도메인 및 SSL 인증서

- [ ] **외부 서비스**
  - [ ] Google OAuth 설정 (선택사항)
  - [ ] 결제 게이트웨이 (PortOne) 설정 (선택사항)
  - [ ] SendGrid 이메일 설정 (선택사항)
  - [ ] Sentry 에러 추적 설정 (선택사항)

- [ ] **보안**
  - [ ] `NEXTAUTH_SECRET` 생성 (최소 32자)
  - [ ] 데이터베이스 비밀번호 강화
  - [ ] API 키 보안 확인
  - [ ] CORS 설정 확인

---

## Vercel 배포 (권장)

Vercel은 Next.js 프로젝트를 위한 최적의 배포 플랫폼입니다.

### 1️⃣ Vercel CLI 설치

```bash
npm install -g vercel
```

### 2️⃣ 프로젝트 연결

```bash
# 프로젝트 디렉토리에서 실행
vercel login
vercel link
```

### 3️⃣ 환경 변수 설정

```bash
# Vercel 대시보드에서 설정하거나 CLI로 추가
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# 또는 .env.production 파일 사용
vercel env pull .env.production
```

### 4️⃣ 배포

```bash
# 프리뷰 배포 (테스트용)
vercel

# 프로덕션 배포
vercel --prod
```

### 5️⃣ 도메인 설정

```bash
# 커스텀 도메인 추가
vercel domains add yourdomain.com
```

### Vercel 환경 변수 설정 예시

Vercel Dashboard → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/rankup

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-32-char-secret-here

# Redis (선택사항)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# OAuth (선택사항)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# 기타 (선택사항)
SENDGRID_API_KEY=your-key
SENTRY_DSN=your-dsn
NEXT_PUBLIC_MIXPANEL_TOKEN=your-token
```

---

## Docker 배포

Docker를 사용한 컨테이너 기반 배포.

### 1️⃣ Docker 이미지 빌드

```bash
# 프로덕션 이미지 빌드
docker build -t rankup:latest .

# 특정 플랫폼용 빌드 (예: ARM64)
docker build --platform linux/amd64 -t rankup:latest .
```

### 2️⃣ 환경 변수 파일 생성

`.env.production` 파일 생성:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/rankup
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here

# 기타 환경 변수...
```

### 3️⃣ 컨테이너 실행

```bash
# 단일 컨테이너 실행
docker run -d \
  --name rankup \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  rankup:latest

# 헬스 체크 확인
curl http://localhost:3000/api/health
```

### 4️⃣ Docker Compose 사용 (권장)

`docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    image: rankup:latest
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: rankup
      POSTGRES_USER: rankup
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rankup"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

실행:

```bash
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f app

# 중지
docker-compose -f docker-compose.prod.yml down
```

### 5️⃣ Nginx 리버스 프록시 설정

`nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream rankup {
        server app:3000;
    }

    # HTTP -> HTTPS 리다이렉트
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gzip
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        location / {
            proxy_pass http://rankup;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /_next/static {
            proxy_pass http://rankup;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## 일반 서버 배포

VPS나 전용 서버에 직접 배포하는 방법.

### 1️⃣ 서버 준비

```bash
# Ubuntu 20.04/22.04 기준

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 20 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 설치 (프로세스 관리자)
sudo npm install -g pm2

# PostgreSQL 설치
sudo apt install -y postgresql postgresql-contrib

# Nginx 설치
sudo apt install -y nginx
```

### 2️⃣ 애플리케이션 배포

```bash
# 프로젝트 클론
cd /var/www
sudo git clone https://github.com/josens83/riccorank-copy.git rankup
cd rankup

# 의존성 설치
sudo npm ci --only=production

# 환경 변수 설정
sudo nano .env.production

# Prisma 생성
sudo npx prisma generate

# 데이터베이스 마이그레이션
sudo npx prisma migrate deploy

# 빌드
sudo npm run build
```

### 3️⃣ PM2로 프로세스 관리

```bash
# PM2 ecosystem 파일 생성
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rankup',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# PM2 시작
pm2 start ecosystem.config.js

# 시스템 부팅 시 자동 시작
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs rankup
```

### 4️⃣ Nginx 설정

```bash
sudo nano /etc/nginx/sites-available/rankup

# 위의 nginx.conf 내용 입력

# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/rankup /etc/nginx/sites-enabled/

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 5️⃣ SSL 인증서 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

---

## 환경 변수 설정

### 필수 환경 변수

```env
# Node 환경
NODE_ENV=production

# Database (필수)
DATABASE_URL=postgresql://user:password@host:5432/rankup

# NextAuth (필수)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# 앱 설정
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=RANKUP
```

### 선택적 환경 변수

```env
# Redis Cache (성능 향상)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# 결제
NEXT_PUBLIC_IAMPORT_CODE=your-code
IAMPORT_API_KEY=your-key
IAMPORT_API_SECRET=your-secret

# 이메일
SENDGRID_API_KEY=your-key
EMAIL_FROM=noreply@yourdomain.com

# 분석 & 모니터링
NEXT_PUBLIC_MIXPANEL_TOKEN=your-token
SENTRY_DSN=your-dsn
SENTRY_AUTH_TOKEN=your-token

# 고객 지원
NEXT_PUBLIC_INTERCOM_APP_ID=your-id
```

### NEXTAUTH_SECRET 생성

```bash
# OpenSSL로 생성
openssl rand -base64 32

# Node.js로 생성
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 데이터베이스 설정

### PostgreSQL 설정

```bash
# PostgreSQL 접속
sudo -u postgres psql

# 데이터베이스 및 사용자 생성
CREATE DATABASE rankup;
CREATE USER rankup WITH ENCRYPTED PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE rankup TO rankup;
\q

# 외부 접속 허용 (필요한 경우)
sudo nano /etc/postgresql/15/main/postgresql.conf
# listen_addresses = '*'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# host    all    all    0.0.0.0/0    md5

sudo systemctl restart postgresql
```

### Prisma 마이그레이션

```bash
# 프로덕션 마이그레이션
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate

# 데이터베이스 상태 확인
npx prisma db push
```

### 데이터베이스 백업

```bash
# 백업
pg_dump -U rankup -h localhost rankup > backup_$(date +%Y%m%d_%H%M%S).sql

# 복원
psql -U rankup -h localhost rankup < backup_20250125_120000.sql

# 자동 백업 스크립트 (cron)
0 2 * * * /usr/bin/pg_dump -U rankup rankup | gzip > /backups/rankup_$(date +\%Y\%m\%d).sql.gz
```

---

## 모니터링 & 로깅

### Sentry 에러 추적

1. [Sentry](https://sentry.io) 계정 생성
2. 프로젝트 생성 및 DSN 받기
3. 환경 변수 설정:
```env
SENTRY_DSN=your-dsn
SENTRY_AUTH_TOKEN=your-token
```

### Mixpanel 분석

1. [Mixpanel](https://mixpanel.com) 계정 생성
2. 프로젝트 생성 및 Token 받기
3. 환경 변수 설정:
```env
NEXT_PUBLIC_MIXPANEL_TOKEN=your-token
```

### 로그 관리

```bash
# PM2 로그
pm2 logs rankup
pm2 logs rankup --lines 100

# Docker 로그
docker logs -f rankup
docker logs --tail 100 rankup

# 로그 파일 위치
/var/log/nginx/access.log
/var/log/nginx/error.log
./logs/app.log
```

### Health Check 모니터링

```bash
# Health check 엔드포인트
curl https://yourdomain.com/api/health

# 자동 모니터링 (cron)
*/5 * * * * curl -f https://yourdomain.com/api/health || echo "Health check failed" | mail -s "RANKUP Down" admin@yourdomain.com
```

---

## 백업 전략

### 1. 데이터베이스 백업

```bash
# 일일 백업 스크립트
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U rankup rankup | gzip > $BACKUP_DIR/rankup_$TIMESTAMP.sql.gz

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "rankup_*.sql.gz" -mtime +7 -delete

# Cron 설정 (매일 새벽 2시)
0 2 * * * /path/to/backup-script.sh
```

### 2. 코드 백업

```bash
# Git 저장소에 정기적으로 푸시
git push origin main

# 전체 프로젝트 아카이브
tar -czf rankup_$(date +%Y%m%d).tar.gz /var/www/rankup
```

### 3. 클라우드 백업

```bash
# AWS S3에 백업 업로드
aws s3 cp backup.sql.gz s3://your-bucket/backups/

# rsync로 원격 서버 백업
rsync -avz /var/www/rankup/ backup-server:/backups/rankup/
```

---

## 트러블슈팅

### 빌드 실패

**문제**: `npm run build` 실패
```bash
# 해결책
rm -rf node_modules .next
npm install
npm run build
```

### Prisma 오류

**문제**: `@prisma/client did not initialize`
```bash
# 해결책
npx prisma generate
npm run build
```

### 메모리 부족

**문제**: Node.js 메모리 초과
```bash
# 해결책: Node.js 메모리 증가
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# PM2 ecosystem.config.js에 추가
node_args: '--max-old-space-size=4096'
```

### 포트 충돌

**문제**: 포트 3000 이미 사용 중
```bash
# 사용 중인 프로세스 확인
lsof -i :3000

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
PORT=3001 npm start
```

### SSL 인증서 오류

**문제**: SSL 인증서 만료
```bash
# 수동 갱신
sudo certbot renew

# 강제 갱신
sudo certbot renew --force-renewal
```

---

## 성능 최적화

### 1. CDN 설정

Vercel 사용 시 자동으로 Vercel Edge Network 사용.

### 2. 캐싱 전략

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### 3. 데이터베이스 최적화

```sql
-- 인덱스 확인
SELECT * FROM pg_indexes WHERE tablename = 'Post';

-- 느린 쿼리 분석
EXPLAIN ANALYZE SELECT * FROM "Post" WHERE userId = 'xxx';
```

---

## 보안 체크리스트

- [ ] HTTPS 강제 적용
- [ ] 환경 변수 보안 (절대 커밋하지 말 것)
- [ ] 데이터베이스 비밀번호 강화
- [ ] Rate Limiting 활성화
- [ ] CORS 설정 확인
- [ ] CSP 헤더 설정
- [ ] 정기적인 보안 업데이트 (`npm audit`)
- [ ] 방화벽 설정 (필요한 포트만 오픈)
- [ ] 백업 암호화

---

## 유지보수

### 정기 업데이트

```bash
# 의존성 업데이트 확인
npm outdated

# 마이너/패치 업데이트
npm update

# 메이저 업데이트 (주의 필요)
npx npm-check-updates -u
npm install

# 테스트 실행
npm test
npm run build
```

### 모니터링 대시보드

- **Vercel Analytics**: 자동 활성화
- **Sentry Dashboard**: 에러 추적
- **Mixpanel Dashboard**: 사용자 분석
- **Upstash Dashboard**: Redis 모니터링

---

## 지원

문제가 발생하면:

1. [GitHub Issues](https://github.com/josens83/riccorank-copy/issues)
2. [문서](./docs/)
3. [보안 감사 보고서](./SECURITY-AUDIT.md)

---

**작성일**: 2025-11-25
**버전**: 1.0.0
**상태**: Production Ready ✅
