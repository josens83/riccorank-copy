/**
 * Email Service Library
 * Supports SendGrid and AWS SES
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@rankup.com';
const FROM_NAME = process.env.FROM_NAME || 'RANKUP';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️  SendGrid API key not configured. Email not sent.');
      console.log('📧 Email (DEV MODE):', {
        to: data.to,
        subject: data.subject,
        preview: data.html.substring(0, 100) + '...',
      });
      return true; // Return true in dev mode
    }

    await sgMail.send({
      to: data.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: data.subject,
      html: data.html,
      text: data.text,
    });

    console.log(`✅ Email sent to ${data.to}: ${data.subject}`);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return false;
  }
}

/**
 * Email Templates
 */

// Email verification template
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>이메일 인증</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">RANKUP</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">안녕하세요, ${name}님!</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                RANKUP 가입을 환영합니다. 아래 버튼을 클릭하여 이메일 주소를 인증해주세요.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}"
                       style="display: inline-block; padding: 16px 32px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      이메일 인증하기
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
              </p>

              <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ⏱️ 이 링크는 <strong>24시간</strong> 동안 유효합니다.<br>
                  본인이 요청하지 않았다면 이 이메일을 무시하세요.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                © 2024 RANKUP. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                본 메일은 발신 전용입니다. 문의사항은 웹사이트를 이용해주세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
안녕하세요, ${name}님!

RANKUP 가입을 환영합니다. 아래 링크를 클릭하여 이메일 주소를 인증해주세요.

${verificationUrl}

이 링크는 24시간 동안 유효합니다.
본인이 요청하지 않았다면 이 이메일을 무시하세요.

© 2024 RANKUP. All rights reserved.
  `.trim();

  return sendEmail({
    to,
    subject: '[RANKUP] 이메일 인증을 완료해주세요',
    html,
    text,
  });
}

// Password reset email template
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>비밀번호 재설정</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">🔒 RANKUP</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">안녕하세요, ${name}님</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                비밀번호 재설정 요청을 받았습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정하세요.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display: inline-block; padding: 16px 32px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      비밀번호 재설정
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                <a href="${resetUrl}" style="color: #ef4444; word-break: break-all;">${resetUrl}</a>
              </p>

              <div style="margin-top: 30px; padding: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ⚠️ <strong>보안 알림:</strong><br>
                  • 이 링크는 <strong>1시간</strong> 동안만 유효합니다.<br>
                  • 본인이 요청하지 않았다면 이 이메일을 무시하고 즉시 고객센터로 연락주세요.<br>
                  • 비밀번호는 절대 타인과 공유하지 마세요.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                © 2024 RANKUP. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                본 메일은 발신 전용입니다. 문의사항은 웹사이트를 이용해주세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
안녕하세요, ${name}님

비밀번호 재설정 요청을 받았습니다. 아래 링크를 클릭하여 새로운 비밀번호를 설정하세요.

${resetUrl}

⚠️ 보안 알림:
• 이 링크는 1시간 동안만 유효합니다.
• 본인이 요청하지 않았다면 이 이메일을 무시하고 즉시 고객센터로 연락주세요.
• 비밀번호는 절대 타인과 공유하지 마세요.

© 2024 RANKUP. All rights reserved.
  `.trim();

  return sendEmail({
    to,
    subject: '[RANKUP] 비밀번호 재설정 요청',
    html,
    text,
  });
}

// Payment confirmation email template
export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  data: {
    planName: string;
    amount: number;
    payMethod: string;
    paidAt: Date;
    subscriptionEndDate: Date;
  }
): Promise<boolean> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>결제 완료</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">✅ 결제 완료</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">안녕하세요, ${name}님!</h2>
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong>${data.planName}</strong> 플랜 구독 결제가 성공적으로 완료되었습니다. 감사합니다!
              </p>

              <!-- Payment Details -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">결제 정보</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">구독 플랜</td>
                    <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.planName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">결제 금액</td>
                    <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${formatCurrency(data.amount)}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">결제 수단</td>
                    <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.payMethod}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">결제 일시</td>
                    <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${formatDate(data.paidAt)}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">구독 만료일</td>
                    <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${formatDate(data.subscriptionEndDate)}</td>
                  </tr>
                </table>
              </div>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://rankup.com'}/mypage"
                       style="display: inline-block; padding: 16px 32px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      마이페이지에서 확인하기
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  💡 <strong>안내:</strong><br>
                  • 구독은 자동 갱신되지 않습니다.<br>
                  • 환불 정책은 이용약관을 참고하세요.<br>
                  • 문의사항은 고객센터로 연락주세요.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                © 2024 RANKUP. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                본 메일은 발신 전용입니다. 문의사항은 웹사이트를 이용해주세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
안녕하세요, ${name}님!

${data.planName} 플랜 구독 결제가 성공적으로 완료되었습니다. 감사합니다!

[결제 정보]
구독 플랜: ${data.planName}
결제 금액: ${formatCurrency(data.amount)}
결제 수단: ${data.payMethod}
결제 일시: ${formatDate(data.paidAt)}
구독 만료일: ${formatDate(data.subscriptionEndDate)}

마이페이지에서 확인하기: ${process.env.NEXT_PUBLIC_APP_URL || 'https://rankup.com'}/mypage

💡 안내:
• 구독은 자동 갱신되지 않습니다.
• 환불 정책은 이용약관을 참고하세요.
• 문의사항은 고객센터로 연락주세요.

© 2024 RANKUP. All rights reserved.
  `.trim();

  return sendEmail({
    to,
    subject: '[RANKUP] 결제가 완료되었습니다',
    html,
    text,
  });
}

// Welcome email template
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>환영합니다!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold;">🎉 환영합니다!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">안녕하세요, ${name}님!</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong>RANKUP</strong>에 가입해주셔서 감사합니다. 이메일 인증이 완료되었습니다!
              </p>
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                이제 모든 기능을 사용하실 수 있습니다.
              </p>

              <!-- Features -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">주요 기능</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                  <li>📊 실시간 주가 정보 및 차트</li>
                  <li>📰 최신 금융 뉴스 무제한 열람</li>
                  <li>💬 커뮤니티에서 투자 정보 공유</li>
                  <li>🎯 AI 기반 종목 추천 (프리미엄)</li>
                  <li>📈 상세 기업 분석 리포트</li>
                </ul>
              </div>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://rankup.com'}"
                       style="display: inline-block; padding: 16px 32px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      지금 시작하기
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  💡 <strong>팁:</strong><br>
                  프로필을 완성하고 관심 종목을 등록하여 더욱 정확한 맞춤 정보를 받아보세요!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                © 2024 RANKUP. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                본 메일은 발신 전용입니다. 문의사항은 웹사이트를 이용해주세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
안녕하세요, ${name}님!

RANKUP에 가입해주셔서 감사합니다. 이메일 인증이 완료되었습니다!

이제 모든 기능을 사용하실 수 있습니다.

[주요 기능]
• 실시간 주가 정보 및 차트
• 최신 금융 뉴스 무제한 열람
• 커뮤니티에서 투자 정보 공유
• AI 기반 종목 추천 (프리미엄)
• 상세 기업 분석 리포트

지금 시작하기: ${process.env.NEXT_PUBLIC_APP_URL || 'https://rankup.com'}

💡 팁:
프로필을 완성하고 관심 종목을 등록하여 더욱 정확한 맞춤 정보를 받아보세요!

© 2024 RANKUP. All rights reserved.
  `.trim();

  return sendEmail({
    to,
    subject: '[RANKUP] 가입을 환영합니다! 🎉',
    html,
    text,
  });
}
