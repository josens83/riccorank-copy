import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate a new 2FA secret for a user
 */
export async function generate2FASecret(userId: string, email: string): Promise<{
  secret: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `RANKUP (${email})`,
    issuer: 'RANKUP',
    length: 32,
  });

  if (!secret.otpauth_url || !secret.base32) {
    throw new Error('Failed to generate 2FA secret');
  }

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  return {
    secret: secret.base32,
    qrCodeDataUrl,
    backupCodes,
  };
}

/**
 * Verify a TOTP token
 */
export function verify2FAToken(
  secret: string,
  token: string,
  window: number = 2
): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window, // Allow 2 steps before/after (60 seconds tolerance)
  });
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = generateSecureCode(8);
    codes.push(code);
  }

  return codes;
}

/**
 * Generate a secure random code
 */
function generateSecureCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
  let code = '';

  // Use crypto.randomInt for secure random generation
  if (typeof crypto !== 'undefined' && crypto.randomInt) {
    for (let i = 0; i < length; i++) {
      code += chars[crypto.randomInt(0, chars.length)];
    }
  } else {
    // Fallback for environments without crypto.randomInt
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return code;
}

/**
 * Hash a backup code for storage
 */
export async function hashBackupCode(code: string): Promise<string> {
  // Use bcrypt for hashing backup codes
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(code, 10);
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(
  code: string,
  hashedCode: string
): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(code, hashedCode);
}

/**
 * Format backup codes for display (XXXX-XXXX)
 */
export function formatBackupCode(code: string): string {
  if (code.length === 8) {
    return `${code.substring(0, 4)}-${code.substring(4)}`;
  }
  return code;
}

/**
 * Check if 2FA should be enforced for a user
 * (can be customized based on user role or subscription)
 */
export function should2FABeEnforced(userRole: string): boolean {
  // Enforce 2FA for admin users
  return userRole === 'admin';
}

/**
 * Generate a recovery email template
 */
export function get2FARecoveryEmailTemplate(backupCodes: string[]): {
  subject: string;
  html: string;
  text: string;
} {
  const formattedCodes = backupCodes.map(formatBackupCode).join('\n');

  return {
    subject: 'RANKUP - 2단계 인증 복구 코드',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>2단계 인증 복구 코드</h2>
        <p>안녕하세요,</p>
        <p>2단계 인증을 활성화하셨습니다. 아래는 복구 코드입니다. 각 코드는 한 번만 사용할 수 있습니다.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <pre style="margin: 0; font-family: monospace;">${formattedCodes}</pre>
        </div>
        <p><strong>중요:</strong></p>
        <ul>
          <li>이 코드들을 안전한 곳에 보관하세요</li>
          <li>각 코드는 한 번만 사용할 수 있습니다</li>
          <li>인증 앱에 접근할 수 없을 때 사용하세요</li>
        </ul>
        <p>감사합니다,<br>RANKUP 팀</p>
      </div>
    `,
    text: `
2단계 인증 복구 코드

안녕하세요,

2단계 인증을 활성화하셨습니다. 아래는 복구 코드입니다. 각 코드는 한 번만 사용할 수 있습니다.

${formattedCodes}

중요:
- 이 코드들을 안전한 곳에 보관하세요
- 각 코드는 한 번만 사용할 수 있습니다
- 인증 앱에 접근할 수 없을 때 사용하세요

감사합니다,
RANKUP 팀
    `,
  };
}
