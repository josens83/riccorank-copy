'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiStar } from 'react-icons/fi';
import { subscriptionPlans, requestPayment, generateMerchantUid } from '@/lib/external/payment';
import { useToast } from '@/components/shared/Toast';

export default function SubscribePage() {
  const { isDarkMode } = useThemeStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/subscribe');
    }
  }, [status, router]);

  const handleSubscribe = async (planId: string, amount: number, planName: string) => {
    if (!session) {
      showToast('로그인이 필요합니다.', 'error');
      router.push('/login?callbackUrl=/subscribe');
      return;
    }

    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      const merchantUid = generateMerchantUid();

      // In production, load Iamport script
      // <script src="https://cdn.iamport.kr/v1/iamport.js"></script>

      // Request payment
      // This is example code - actual implementation requires Iamport script
      console.log('='.repeat(80));
      console.log('PAYMENT REQUEST (Development Mode)');
      console.log('='.repeat(80));
      console.log(`Plan: ${planName}`);
      console.log(`Amount: ${amount.toLocaleString()}원`);
      console.log(`User: ${session.user.email}`);
      console.log(`Merchant UID: ${merchantUid}`);
      console.log('='.repeat(80));
      console.log('\nProduction Setup:');
      console.log('1. Add Iamport script to app/layout.tsx:');
      console.log('   <script src="https://cdn.iamport.kr/v1/iamport.js"></script>');
      console.log('2. Configure environment variables in .env:');
      console.log('   NEXT_PUBLIC_IAMPORT_IMP_CODE=your_imp_code');
      console.log('   IAMPORT_API_KEY=your_api_key');
      console.log('   IAMPORT_API_SECRET=your_api_secret');
      console.log('3. Uncomment the requestPayment call below');
      console.log('='.repeat(80));

      // Uncomment this in production
      /*
      const paymentData = {
        pg: 'html5_inicis', // or 'kakaopay', 'tosspay', etc.
        pay_method: 'card' as const,
        merchant_uid: merchantUid,
        name: `RANKUP ${planName} 구독`,
        amount,
        buyer_email: session.user.email || '',
        buyer_name: session.user.name || '',
        buyer_tel: '010-0000-0000', // Get from user profile
        m_redirect_url: `${window.location.origin}/payments/result`,
      };

      const response = await requestPayment(paymentData);

      // Verify payment on server
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

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok) {
        showToast('구독이 완료되었습니다!', 'success');
        setTimeout(() => router.push('/mypage'), 2000);
      } else {
        throw new Error(verifyData.error || '결제 검증 실패');
      }
      */

      // Development mode: simulate success
      showToast('개발 모드: 결제가 시뮬레이션되었습니다.', 'info');
      setTimeout(() => {
        showToast('프로덕션에서는 실제 결제가 진행됩니다.', 'info');
      }, 2000);

    } catch (error: any) {
      console.error('Payment error:', error);
      showToast(error.message || '결제 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (status === 'loading') {
    return (
      <main className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>로딩 중...</div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            요금제 선택
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            프리미엄 기능을 이용하고 투자 인사이트를 얻으세요
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border-2 p-6 relative ${
                plan.popular
                  ? 'border-blue-600 shadow-lg scale-105'
                  : isDarkMode
                  ? 'border-gray-700'
                  : 'border-gray-200'
              } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold flex items-center">
                  <FiStar className="w-4 h-4 mr-1" />
                  인기
                </div>
              )}

              {/* Plan name */}
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.price.toLocaleString()}원
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  /{plan.period === 'monthly' ? '월' : '년'}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className={`w-5 h-5 mr-2 flex-shrink-0 ${
                      plan.popular ? 'text-blue-600' : 'text-green-600'
                    }`} />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Subscribe button */}
              <button
                onClick={() => handleSubscribe(plan.id, plan.price, plan.name)}
                disabled={isProcessing && selectedPlan === plan.id}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessing && selectedPlan === plan.id ? '처리 중...' : '구독하기'}
              </button>
            </div>
          ))}
        </div>

        {/* Information */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            결제 안내
          </h3>
          <div className={`space-y-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <p>✓ 모든 요금제는 VAT 포함 가격입니다.</p>
            <p>✓ 구독은 언제든지 취소 가능하며, 해지 시점까지 서비스가 제공됩니다.</p>
            <p>✓ 결제는 안전하게 암호화되어 처리됩니다.</p>
            <p>✓ 카드, 계좌이체, 간편결제 (카카오페이, 네이버페이 등) 지원</p>
            <p>✓ 7일 환불 보장: 서비스가 만족스럽지 않으면 전액 환불해드립니다.</p>
          </div>
        </div>

        {/* Development Notice */}
        <div className={`mt-6 rounded-lg border-2 border-yellow-600 p-6 ${
          isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            isDarkMode ? 'text-yellow-400' : 'text-yellow-800'
          }`}>
            개발자 안내
          </h4>
          <div className={`text-sm space-y-1 ${
            isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
          }`}>
            <p>이 페이지는 개발 모드입니다. 프로덕션 배포 시 다음을 수행하세요:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2 ml-4">
              <li>Iamport (포트원) 가입: https://portone.io</li>
              <li>상점 등록 및 PG사 연동</li>
              <li>.env 파일에 Iamport 인증 정보 추가</li>
              <li>app/layout.tsx에 Iamport 스크립트 추가</li>
              <li>lib/payment.ts의 requestPayment 함수 활성화</li>
              <li>webhook URL 설정 (POST /api/webhooks/iamport)</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
