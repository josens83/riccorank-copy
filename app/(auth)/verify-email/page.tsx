'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useThemeStore } from '@/lib/store';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiLoader, FiMail } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('유효하지 않은 인증 링크입니다.');
      return;
    }

    // Verify email with token
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          // Redirect to home after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || '이메일 인증에 실패했습니다.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('오류가 발생했습니다. 다시 시도해주세요.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <main
      className={`min-h-screen flex items-center justify-center px-4 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="w-full max-w-md">
        <div
          className={`rounded-lg shadow-lg p-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}
              >
                <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1
                className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                이메일 인증 중...
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                잠시만 기다려주세요.
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                }`}
              >
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1
                className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                인증 완료!
              </h1>
              <p
                className={`text-sm mb-6 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {message}
              </p>

              <div
                className={`p-6 rounded-lg mb-6 ${
                  isDarkMode
                    ? 'bg-green-900/20 border border-green-800'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="text-center">
                  <div className={`mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    <FiMail className="w-12 h-12 mx-auto" />
                  </div>
                  <p
                    className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    환영 이메일을 확인해보세요!
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    3초 후 자동으로 홈페이지로 이동합니다...
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                홈으로 이동
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                }`}
              >
                <FiXCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1
                className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                인증 실패
              </h1>
              <p
                className={`text-sm mb-6 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {message}
              </p>

              <div
                className={`p-6 rounded-lg mb-6 ${
                  isDarkMode
                    ? 'bg-red-900/20 border border-red-800'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  💡 <strong>다음을 시도해보세요:</strong>
                  <br />
                  • 인증 링크를 다시 확인해주세요
                  <br />
                  • 링크가 만료되었다면 새로운 인증 이메일을 요청하세요
                  <br />• 문제가 계속되면 고객센터로 문의해주세요
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/mypage"
                  className="block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  마이페이지에서 재전송
                </Link>
                <Link
                  href="/"
                  className={`block w-full py-3 rounded-lg font-medium transition-colors text-center ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  홈으로 이동
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
