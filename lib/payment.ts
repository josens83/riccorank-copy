/**
 * Payment Integration Library
 * Supports Iamport (포트원) - Korea's popular payment gateway
 *
 * Setup:
 * 1. Sign up at https://portone.io
 * 2. Get your Merchant ID and API Key
 * 3. Add to .env:
 *    NEXT_PUBLIC_IAMPORT_IMP_CODE=your_imp_code
 *    IAMPORT_API_KEY=your_api_key
 *    IAMPORT_API_SECRET=your_api_secret
 */

export interface IamportPaymentData {
  pg: string; // 'html5_inicis', 'kakaopay', 'tosspay', etc.
  pay_method: 'card' | 'trans' | 'vbank' | 'phone';
  merchant_uid: string; // Unique order ID
  name: string; // Product name
  amount: number; // Payment amount
  buyer_email: string;
  buyer_name: string;
  buyer_tel: string;
  buyer_addr?: string;
  buyer_postcode?: string;
  m_redirect_url?: string; // Mobile redirect URL
  notice_url?: string; // Webhook URL
  custom_data?: any; // Additional data
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: '베이직',
    price: 9900,
    period: 'monthly',
    features: [
      '실시간 주가 정보',
      '뉴스 무제한 열람',
      '커뮤니티 참여',
      '일간 종목 추천 3개',
    ],
  },
  {
    id: 'pro',
    name: '프로',
    price: 29900,
    period: 'monthly',
    popular: true,
    features: [
      '베이직 플랜 모든 기능',
      '일간 종목 추천 무제한',
      'AI 투자 분석',
      '프리미엄 리포트',
      '실시간 알림',
      '광고 제거',
    ],
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: 99900,
    period: 'monthly',
    features: [
      '프로 플랜 모든 기능',
      '1:1 투자 상담',
      '포트폴리오 관리',
      '백테스팅 도구',
      '전문가 Pick 종목',
      'API 접근 권한',
    ],
  },
  {
    id: 'yearly_pro',
    name: '프로 연간',
    price: 299000,
    period: 'yearly',
    features: [
      '프로 플랜 모든 기능 (12개월)',
      '2개월 무료',
      '연간 할인 17% 적용',
    ],
  },
];

/**
 * Initialize Iamport payment
 * Call this function when user clicks payment button
 */
export function requestPayment(data: IamportPaymentData): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if Iamport is loaded
    if (typeof window === 'undefined' || !(window as any).IMP) {
      reject(new Error('Iamport not loaded'));
      return;
    }

    const IMP = (window as any).IMP;
    const impCode = process.env.NEXT_PUBLIC_IAMPORT_IMP_CODE;

    if (!impCode) {
      reject(new Error('Iamport IMP code not configured'));
      return;
    }

    // Initialize Iamport
    IMP.init(impCode);

    // Request payment
    IMP.request_pay(data, (response: any) => {
      if (response.success) {
        // Payment successful
        // Verify payment on server
        resolve(response);
      } else {
        // Payment failed
        reject(new Error(response.error_msg || 'Payment failed'));
      }
    });
  });
}

/**
 * Verify payment on server
 * This should be called from API route
 */
export async function verifyPayment(impUid: string): Promise<any> {
  const apiKey = process.env.IAMPORT_API_KEY;
  const apiSecret = process.env.IAMPORT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Iamport API credentials not configured');
  }

  // Get access token
  const tokenResponse = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imp_key: apiKey, imp_secret: apiSecret }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.response) {
    throw new Error('Failed to get Iamport access token');
  }

  const accessToken = tokenData.response.access_token;

  // Get payment info
  const paymentResponse = await fetch(
    `https://api.iamport.kr/payments/${impUid}`,
    {
      headers: { Authorization: accessToken },
    }
  );

  const paymentData = await paymentResponse.json();

  if (!paymentData.response) {
    throw new Error('Failed to get payment information');
  }

  return paymentData.response;
}

/**
 * Cancel/Refund payment
 */
export async function cancelPayment(
  impUid: string,
  reason: string,
  amount?: number
): Promise<any> {
  const apiKey = process.env.IAMPORT_API_KEY;
  const apiSecret = process.env.IAMPORT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Iamport API credentials not configured');
  }

  // Get access token
  const tokenResponse = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imp_key: apiKey, imp_secret: apiSecret }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.response) {
    throw new Error('Failed to get Iamport access token');
  }

  const accessToken = tokenData.response.access_token;

  // Cancel payment
  const cancelResponse = await fetch('https://api.iamport.kr/payments/cancel', {
    method: 'POST',
    headers: {
      Authorization: accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imp_uid: impUid,
      reason,
      amount, // Optional: partial refund
    }),
  });

  const cancelData = await cancelResponse.json();

  if (!cancelData.response) {
    throw new Error(cancelData.message || 'Failed to cancel payment');
  }

  return cancelData.response;
}

/**
 * Generate unique merchant order ID
 */
export function generateMerchantUid(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `ORDER_${timestamp}_${random}`;
}
