# 이메일 서비스 설정 가이드

## 개요

프로덕션 서비스에는 이메일 전송 기능이 필수입니다. 이 가이드는 **SendGrid**와 **AWS SES** 두 가지 주요 이메일 서비스 설정 방법을 안내합니다.

## 필요한 이메일 기능

1. **회원가입 이메일 인증**
2. **비밀번호 재설정**
3. **결제 완료 알림**
4. **구독 갱신 알림**
5. **중요 공지사항**
6. **마케팅 이메일** (선택)

---

## 옵션 1: SendGrid 사용 (추천)

### 장점
- 한달 100통 무료
- 설정이 간단함
- SMTP와 API 모두 지원
- 훌륭한 한국어 지원
- 이메일 템플릿 에디터 제공

### 1.1 SendGrid 가입

1. [SendGrid 웹사이트](https://sendgrid.com) 방문
2. 무료 계정 생성
3. 이메일 인증 완료

### 1.2 API 키 생성

1. Settings > API Keys
2. "Create API Key" 클릭
3. "Full Access" 권한 선택
4. API 키 복사 (한 번만 표시됨!)

### 1.3 발신자 인증

1. Settings > Sender Authentication
2. "Verify a Single Sender" 클릭
3. 발신자 이메일 주소 입력 (예: noreply@yourdomain.com)
4. 인증 이메일 확인

또는 도메인 인증 (권장):
1. "Authenticate Your Domain" 선택
2. DNS 레코드 추가
3. 인증 완료

### 1.4 환경 변수 설정

`.env` 파일에 추가:

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=RANKUP
```

### 1.5 패키지 설치

```bash
npm install @sendgrid/mail
```

### 1.6 이메일 전송 유틸리티 생성

`lib/email-sendgrid.ts` 파일 생성:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: any;
}

export async function sendEmail(options: EmailOptions) {
  const msg = {
    to: options.to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || '',
      name: process.env.SENDGRID_FROM_NAME || 'RANKUP',
    },
    subject: options.subject,
    text: options.text,
    html: options.html,
    templateId: options.templateId,
    dynamicTemplateData: options.dynamicTemplateData,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${options.to}`);
    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, error };
  }
}

// 비밀번호 재설정 이메일
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: '[RANKUP] 비밀번호 재설정 요청',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>비밀번호 재설정</h2>
        <p>비밀번호 재설정을 요청하셨습니다.</p>
        <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          비밀번호 재설정
        </a>
        <p style="color: #666; font-size: 14px;">
          이 링크는 1시간 동안 유효합니다.
        </p>
        <p style="color: #666; font-size: 14px;">
          요청하지 않으셨다면 이 이메일을 무시하세요.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2025 RANKUP. All rights reserved.
        </p>
      </div>
    `,
  });
}

// 이메일 인증
export async function sendVerificationEmail(to: string, verifyUrl: string) {
  return sendEmail({
    to,
    subject: '[RANKUP] 이메일 인증',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>RANKUP 이메일 인증</h2>
        <p>회원가입을 환영합니다!</p>
        <p>아래 버튼을 클릭하여 이메일 인증을 완료하세요:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          이메일 인증하기
        </a>
        <p style="color: #666; font-size: 14px;">
          이 링크는 24시간 동안 유효합니다.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2025 RANKUP. All rights reserved.
        </p>
      </div>
    `,
  });
}

// 결제 완료 이메일
export async function sendPaymentConfirmation(to: string, data: {
  planName: string;
  amount: number;
  startDate: string;
  endDate: string;
}) {
  return sendEmail({
    to,
    subject: '[RANKUP] 결제가 완료되었습니다',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>결제 완료</h2>
        <p>RANKUP ${data.planName} 구독이 시작되었습니다.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0;">구독 정보</h3>
          <p style="margin: 5px 0;"><strong>플랜:</strong> ${data.planName}</p>
          <p style="margin: 5px 0;"><strong>금액:</strong> ${data.amount.toLocaleString()}원</p>
          <p style="margin: 5px 0;"><strong>시작일:</strong> ${data.startDate}</p>
          <p style="margin: 5px 0;"><strong>종료일:</strong> ${data.endDate}</p>
        </div>
        <p>프리미엄 기능을 마음껏 이용하세요!</p>
        <a href="${process.env.NEXTAUTH_URL}/mypage" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          마이페이지 가기
        </a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2025 RANKUP. All rights reserved.
        </p>
      </div>
    `,
  });
}
```

---

## 옵션 2: AWS SES 사용

### 장점
- 매우 저렴 (62,000통/월 무료)
- AWS 인프라와 통합
- 높은 전송률
- 안정성

### 단점
- 초기 설정이 복잡
- 샌드박스 모드 해제 필요

### 2.1 AWS SES 설정

1. AWS 콘솔 로그인
2. SES 서비스 선택
3. 리전 선택 (서울: ap-northeast-2)

### 2.2 발신자 이메일 인증

1. Verified identities > Create identity
2. Email address 선택
3. 이메일 입력 및 인증

### 2.3 샌드박스 모드 해제 (중요!)

기본적으로 SES는 샌드박스 모드로 시작됩니다.

1. Account dashboard > Request production access
2. 사용 목적 설명
3. 승인 대기 (1-2일)

### 2.4 SMTP 자격 증명 생성

1. SMTP Settings
2. Create SMTP credentials
3. IAM 사용자 생성
4. SMTP 사용자 이름과 비밀번호 저장

### 2.5 환경 변수 설정

```env
AWS_SES_REGION=ap-northeast-2
AWS_SES_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXX
AWS_SES_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

### 2.6 패키지 설치

```bash
npm install @aws-sdk/client-ses
```

### 2.7 이메일 전송 유틸리티

`lib/email-ses.ts` 파일 생성:

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions) {
  const command = new SendEmailCommand({
    Source: process.env.AWS_SES_FROM_EMAIL,
    Destination: {
      ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
    },
    Message: {
      Subject: {
        Data: options.subject,
        Charset: 'UTF-8',
      },
      Body: {
        ...(options.text && {
          Text: {
            Data: options.text,
            Charset: 'UTF-8',
          },
        }),
        ...(options.html && {
          Html: {
            Data: options.html,
            Charset: 'UTF-8',
          },
        }),
      },
    },
  });

  try {
    const response = await sesClient.send(command);
    console.log(`Email sent to ${options.to}: ${response.MessageId}`);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
```

---

## API 라우트 업데이트

기존 비밀번호 재설정 API 업데이트:

`app/api/auth/forgot-password/route.ts`:

```typescript
import { sendPasswordResetEmail } from '@/lib/email-sendgrid';
// 또는
// import { sendEmail } from '@/lib/email-ses';

// 토큰 생성 후
const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

// SendGrid 사용
await sendPasswordResetEmail(normalizedEmail, resetUrl);

// 또는 AWS SES 사용
// await sendEmail({
//   to: normalizedEmail,
//   subject: '[RANKUP] 비밀번호 재설정',
//   html: `...`,
// });
```

## 이메일 템플릿 관리

### SendGrid Dynamic Templates 사용 (권장)

1. Email API > Dynamic Templates
2. Create Dynamic Template
3. Add Version
4. 드래그 앤 드롭 에디터로 템플릿 디자인
5. Template ID 복사

템플릿 사용:

```typescript
sendEmail({
  to: 'user@example.com',
  templateId: 'd-xxxxxxxxxxxxx',
  dynamicTemplateData: {
    name: '홍길동',
    resetUrl: 'https://...',
  },
});
```

## 테스트

### SendGrid

```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@yourdomain.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test email"}]}'
```

### AWS SES

AWS CLI 사용:

```bash
aws ses send-email \
  --from noreply@yourdomain.com \
  --destination ToAddresses=test@example.com \
  --message Subject={Data="Test",Charset=UTF-8},Body={Text={Data="Test email",Charset=UTF-8}}
```

## 모범 사례

1. **비동기 처리**: 이메일 전송은 백그라운드에서
2. **재시도 로직**: 실패 시 재시도
3. **로깅**: 모든 이메일 전송 기록
4. **템플릿 버전 관리**: Git에서 관리
5. **테스트 환경**: 실제 이메일 대신 로그 출력
6. **스팸 방지**: SPF, DKIM, DMARC 설정
7. **수신 거부**: Unsubscribe 링크 필수

## 비용 비교

### SendGrid
- 무료: 100통/일
- Essentials: $19.95/월 (50,000통)
- Pro: $89.95/월 (100,000통)

### AWS SES
- $0.10 per 1,000 emails
- 첫 62,000통 무료 (EC2에서 발송 시)

## 문제 해결

### 이메일이 스팸함으로 가는 경우
1. SPF 레코드 설정
2. DKIM 서명 활성화
3. DMARC 정책 설정
4. 발신 평판 관리

### 전송 실패
1. API 키 확인
2. 발신자 인증 확인
3. 일일 할당량 확인
4. 수신자 이메일 유효성 확인

## 참고 자료

- [SendGrid 문서](https://docs.sendgrid.com/)
- [AWS SES 문서](https://docs.aws.amazon.com/ses/)
- [이메일 마케팅 모범 사례](https://sendgrid.com/resource/email-marketing-best-practices/)
