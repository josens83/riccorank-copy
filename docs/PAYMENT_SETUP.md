# 결제 시스템 설정 가이드

## 개요

이 프로젝트는 **Iamport (포트원)** 결제 시스템을 지원합니다. 한국의 모든 주요 PG사를 통합 지원하는 가장 인기있는 결제 솔루션입니다.

## 1. Iamport 가입 및 설정

### 1.1 회원가입

1. [포트원 웹사이트](https://portone.io) 방문
2. 회원가입 (사업자 정보 필요)
3. 관리자 콘솔 로그인

### 1.2 상점 정보 등록

1. 콘솔에서 "시스템 설정" > "내 식별코드·API Keys" 메뉴
2. **가맹점 식별코드 (IMP 코드)** 확인
3. **REST API 키** 및 **REST API secret** 생성

### 1.3 PG사 연동

지원하는 주요 PG사:
- 이니시스 (KG이니시스/HTML5이니시스)
- 나이스페이
- KCP
- 토스페이먼츠
- 카카오페이
- 네이버페이
- 페이코

1. 콘솔에서 "시스템 설정" > "PG설정(일반결제 및 정기결제)"
2. 원하는 PG사 선택 및 연동
3. 테스트 모드로 먼저 테스트

## 2. 환경 변수 설정

`.env` 파일에 다음 변수 추가:

```env
# Iamport (포트원) 설정
NEXT_PUBLIC_IAMPORT_IMP_CODE=imp12345678
IAMPORT_API_KEY=your_api_key_here
IAMPORT_API_SECRET=your_api_secret_here
```

## 3. Iamport 스크립트 추가

`app/layout.tsx`에 Iamport 스크립트 추가:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Iamport 결제 모듈 */}
        <script src="https://cdn.iamport.kr/v1/iamport.js"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

## 4. 결제 flow 활성화

`app/subscribe/page.tsx`에서 주석 처리된 결제 코드 활성화:

```typescript
// 이 부분의 주석 제거
const response = await requestPayment(paymentData);

const verifyResponse = await fetch('/api/payments/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imp_uid: response.imp_uid,
    merchant_uid: merchantUid,
    amount,
    planId,
  }),
});
```

## 5. Webhook 설정 (중요!)

결제 완료 시 서버에 알림을 받기 위한 Webhook 설정:

### 5.1 Webhook URL 생성

`app/api/webhooks/iamport/route.ts` 파일 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imp_uid, merchant_uid, status } = body;

    if (status === 'paid') {
      // 결제 검증
      const paymentData = await verifyPayment(imp_uid);

      // DB 업데이트
      // - 구독 활성화
      // - 결제 내역 저장
      // - 사용자에게 이메일 발송

      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### 5.2 Iamport 콘솔에서 Webhook URL 등록

1. Iamport 콘솔 로그인
2. "시스템 설정" > "내 식별코드·API Keys"
3. "Webhook URL" 항목에 등록:
   ```
   https://your-domain.com/api/webhooks/iamport
   ```

## 6. 데이터베이스 스키마

Prisma 스키마에 다음 모델 추가:

```prisma
model Subscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  planId    String   // 'basic', 'pro', 'premium'
  status    String   // 'active', 'cancelled', 'expired'
  startDate DateTime
  endDate   DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  payments Payment[]

  @@index([userId])
  @@index([status])
}

model Payment {
  id             String       @id @default(cuid())
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  subscriptionId String?
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  impUid         String       @unique // Iamport 결제 고유 번호
  merchantUid    String       @unique // 가맹점 주문 번호
  amount         Int
  status         String       // 'paid', 'cancelled', 'failed'
  payMethod      String       // 'card', 'trans', 'vbank', etc.
  paidAt         DateTime?
  cancelledAt    DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([userId])
  @@index([status])
}
```

## 7. 테스트

### 7.1 테스트 모드

1. Iamport 콘솔에서 테스트 모드 활성화
2. 테스트 카드 번호 사용:
   - 카드번호: 1234-1234-1234-1234
   - 유효기간: 임의
   - CVC: 123
   - 비밀번호: 00

### 7.2 실제 결제 테스트

1. 소액 (100원) 결제 테스트
2. 결제 검증 확인
3. 환불 프로세스 테스트

## 8. 보안 주의사항

⚠️ **중요**: 다음 보안 사항을 반드시 준수하세요:

1. **API 키 보안**
   - `.env` 파일을 절대 Git에 커밋하지 마세요
   - 클라이언트에 API Secret을 노출하지 마세요
   - 환경변수는 서버 사이드에서만 사용

2. **결제 검증**
   - 클라이언트의 결제 성공 응답만 믿지 마세요
   - 반드시 서버에서 Iamport API로 재검증
   - 금액 변조 방지를 위해 서버에서 금액 재확인

3. **Webhook 보안**
   - Webhook IP 화이트리스트 설정
   - 중복 처리 방지 (merchant_uid 체크)

## 9. 프로덕션 체크리스트

배포 전 확인사항:

- [ ] Iamport 가입 완료
- [ ] PG사 연동 완료 (실제 계약)
- [ ] 환경 변수 설정 (.env.production)
- [ ] Webhook URL 등록
- [ ] 데이터베이스 스키마 마이그레이션
- [ ] 테스트 모드에서 실제 모드로 전환
- [ ] 결제/환불 프로세스 테스트
- [ ] 에러 로깅 설정
- [ ] 고객 지원 프로세스 준비

## 10. 참고 자료

- [Iamport 공식 문서](https://docs.portone.io)
- [결제 연동 가이드](https://docs.portone.io/docs/ko/readme)
- [API 레퍼런스](https://api.iamport.kr)
- [FAQ](https://docs.portone.io/docs/ko/support/faq)

## 문의

기술 지원: https://portone.io/korea/ko/support
