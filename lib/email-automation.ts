import { sendEmail } from '@/lib/external/email';
import { log } from '@/lib/logger';

// Email templates
export type EmailTemplate =
  | 'welcome'
  | 'verify_email'
  | 'password_reset'
  | 'subscription_created'
  | 'subscription_renewed'
  | 'subscription_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'trial_ending'
  | 'inactive_reminder'
  | 'weekly_digest';

interface EmailTemplateData {
  [key: string]: string | number | boolean | undefined;
}

// Template configurations
const TEMPLATES: Record<EmailTemplate, {
  subject: string;
  getContent: (data: EmailTemplateData) => string;
}> = {
  welcome: {
    subject: 'RANKUP에 오신 것을 환영합니다!',
    getContent: (data) => `
      <h1>환영합니다, ${data.name || '회원'}님!</h1>
      <p>RANKUP에 가입해 주셔서 감사합니다.</p>
      <p>실시간 주식 정보, 뉴스, 커뮤니티를 한 곳에서 만나보세요.</p>
      <a href="${data.appUrl}/stocklist" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
        시작하기
      </a>
    `,
  },

  verify_email: {
    subject: 'RANKUP 이메일 인증',
    getContent: (data) => `
      <h1>이메일 인증</h1>
      <p>아래 버튼을 클릭하여 이메일을 인증해 주세요.</p>
      <a href="${data.verifyUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
        이메일 인증하기
      </a>
      <p>이 링크는 24시간 동안 유효합니다.</p>
    `,
  },

  password_reset: {
    subject: 'RANKUP 비밀번호 재설정',
    getContent: (data) => `
      <h1>비밀번호 재설정</h1>
      <p>비밀번호 재설정을 요청하셨습니다.</p>
      <a href="${data.resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
        비밀번호 재설정
      </a>
      <p>이 링크는 1시간 동안 유효합니다.</p>
      <p>요청하지 않으셨다면 이 이메일을 무시하세요.</p>
    `,
  },

  subscription_created: {
    subject: 'RANKUP 구독이 시작되었습니다',
    getContent: (data) => `
      <h1>${data.planName} 구독 시작</h1>
      <p>${data.name}님, ${data.planName} 플랜 구독이 시작되었습니다.</p>
      <ul>
        <li>시작일: ${data.startDate}</li>
        <li>다음 결제일: ${data.nextBillingDate}</li>
        <li>금액: ${data.amount}원</li>
      </ul>
      <a href="${data.appUrl}/mypage" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
        구독 관리
      </a>
    `,
  },

  subscription_renewed: {
    subject: 'RANKUP 구독이 갱신되었습니다',
    getContent: (data) => `
      <h1>구독 자동 갱신 완료</h1>
      <p>${data.name}님의 ${data.planName} 구독이 자동 갱신되었습니다.</p>
      <ul>
        <li>결제 금액: ${data.amount}원</li>
        <li>다음 결제일: ${data.nextBillingDate}</li>
      </ul>
    `,
  },

  subscription_cancelled: {
    subject: 'RANKUP 구독이 취소되었습니다',
    getContent: (data) => `
      <h1>구독 취소 완료</h1>
      <p>${data.name}님의 구독이 취소되었습니다.</p>
      <p>서비스는 ${data.endDate}까지 이용 가능합니다.</p>
      <p>언제든 다시 구독하실 수 있습니다.</p>
      <a href="${data.appUrl}/subscribe" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
        다시 구독하기
      </a>
    `,
  },

  payment_success: {
    subject: 'RANKUP 결제가 완료되었습니다',
    getContent: (data) => `
      <h1>결제 완료</h1>
      <p>결제가 성공적으로 처리되었습니다.</p>
      <ul>
        <li>주문 번호: ${data.orderId}</li>
        <li>금액: ${data.amount}원</li>
        <li>결제일: ${data.paymentDate}</li>
      </ul>
    `,
  },

  payment_failed: {
    subject: 'RANKUP 결제가 실패했습니다',
    getContent: (data) => `
      <h1>결제 실패</h1>
      <p>결제 처리 중 문제가 발생했습니다.</p>
      <p>오류: ${data.error}</p>
      <p>결제 수단을 확인하고 다시 시도해 주세요.</p>
      <a href="${data.appUrl}/subscribe" style="background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
        다시 시도
      </a>
    `,
  },

  trial_ending: {
    subject: 'RANKUP 무료 체험이 곧 종료됩니다',
    getContent: (data) => `
      <h1>무료 체험 종료 안내</h1>
      <p>${data.name}님의 무료 체험이 ${data.daysLeft}일 후 종료됩니다.</p>
      <p>계속해서 프리미엄 기능을 이용하시려면 구독을 시작하세요.</p>
      <a href="${data.appUrl}/subscribe" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
        구독 시작하기
      </a>
    `,
  },

  inactive_reminder: {
    subject: 'RANKUP에서 기다리고 있어요',
    getContent: (data) => `
      <h1>${data.name}님, 오랜만이에요!</h1>
      <p>마지막 방문 후 ${data.daysSinceLastVisit}일이 지났습니다.</p>
      <p>새로운 기능과 업데이트가 기다리고 있어요.</p>
      <a href="${data.appUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
        다시 방문하기
      </a>
    `,
  },

  weekly_digest: {
    subject: 'RANKUP 주간 리포트',
    getContent: (data) => `
      <h1>주간 리포트</h1>
      <p>${data.name}님의 이번 주 활동을 정리했습니다.</p>
      <ul>
        <li>작성한 게시글: ${data.postsCount}개</li>
        <li>받은 좋아요: ${data.likesReceived}개</li>
        <li>새 댓글: ${data.commentsReceived}개</li>
      </ul>
      <h2>이번 주 인기 종목</h2>
      <p>${data.topStocks}</p>
    `,
  },
};

/**
 * Send automated email
 */
export async function sendAutomatedEmail(
  template: EmailTemplate,
  to: string,
  data: EmailTemplateData
): Promise<boolean> {
  try {
    const templateConfig = TEMPLATES[template];

    if (!templateConfig) {
      log.error('Email template not found', null, { template });
      return false;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const content = templateConfig.getContent({ ...data, appUrl });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${content}
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="font-size: 12px; color: #666;">
            RANKUP - 종합 금융 정보 플랫폼<br>
            <a href="${appUrl}" style="color: #3b82f6;">rankup.com</a>
          </p>
        </body>
      </html>
    `;

    await sendEmail({
      to,
      subject: templateConfig.subject,
      html,
    });

    log.info('Automated email sent', { template, to });
    return true;
  } catch (error) {
    log.error('Failed to send automated email', error as Error, { template, to });
    return false;
  }
}

/**
 * Schedule trial ending emails (to be called by cron job)
 */
export async function scheduleTrialEndingEmails(): Promise<void> {
  // In production, query database for users with trials ending in 3 days
  // For each user, call sendAutomatedEmail('trial_ending', ...)
  log.info('Trial ending emails scheduled');
}

/**
 * Schedule inactive user reminders (to be called by cron job)
 */
export async function scheduleInactiveReminders(): Promise<void> {
  // In production, query database for users inactive for 7+ days
  // For each user, call sendAutomatedEmail('inactive_reminder', ...)
  log.info('Inactive reminder emails scheduled');
}

/**
 * Send weekly digest (to be called by cron job)
 */
export async function sendWeeklyDigests(): Promise<void> {
  // In production, query database for user activities
  // For each user, call sendAutomatedEmail('weekly_digest', ...)
  log.info('Weekly digest emails sent');
}
