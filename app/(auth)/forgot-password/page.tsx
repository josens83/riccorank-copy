'use client';

import { useState } from 'react';
import { useThemeStore } from '@/lib/store';
import Link from 'next/link';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useToast } from '@/components/shared/Toast';

export default function ForgotPasswordPage() {
  const { isDarkMode } = useThemeStore();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        showToast(data.message, 'success');
      } else {
        showToast(data.error || '요청에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`min-h-screen flex items-center justify-center px-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-md">
        {/* Back to login */}
        <Link
          href="/login"
          className={`inline-flex items-center mb-8 text-sm ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <FiArrowLeft className="mr-2" />
          로그인으로 돌아가기
        </Link>

        <div className={`rounded-lg shadow-lg p-8 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <FiMail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              비밀번호 재설정
            </h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isSuccess
                ? '이메일을 확인해주세요'
                : '가입하신 이메일 주소를 입력해주세요'}
            </p>
          </div>

          {isSuccess ? (
            /* Success message */
            <div className={`p-6 rounded-lg ${
              isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="text-center">
                <div className={`mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  이메일을 전송했습니다
                </h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>{email}</strong>로 비밀번호 재설정 링크를 전송했습니다.
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
                  <br />
                  링크는 1시간 동안 유효합니다.
                </p>
              </div>

              <div className={`mt-6 pt-6 border-t ${
                isDarkMode ? 'border-green-800' : 'border-green-200'
              }`}>
                <p className={`text-sm text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  이메일을 받지 못하셨나요?
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="w-full mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  다시 시도하기
                </button>
              </div>
            </div>
          ) : (
            /* Request form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className={`block mb-2 text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  이메일 주소
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '전송 중...' : '재설정 링크 전송'}
              </button>

              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  💡 <strong>참고:</strong> 보안을 위해 등록된 이메일 주소로만 재설정 링크가 전송됩니다.
                  이메일이 도착하지 않으면 스팸 메일함을 확인해주세요.
                </p>
              </div>
            </form>
          )}

          {/* Footer links */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              계정이 없으신가요?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
