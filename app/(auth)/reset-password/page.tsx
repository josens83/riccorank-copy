'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '@/components/shared/Toast';

export default function ResetPasswordPage() {
  const { isDarkMode } = useThemeStore();
  const { success: showSuccess, error: showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      showError('유효하지 않은 링크입니다.');
      router.push('/forgot-password');
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/forgot-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsValidToken(true);
          setEmail(data.email);
        } else {
          showError(data.error || '유효하지 않은 토큰입니다.');
          setTimeout(() => router.push('/forgot-password'), 2000);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        showError('오류가 발생했습니다.');
        setTimeout(() => router.push('/forgot-password'), 2000);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, router, showError]);

  const validatePassword = () => {
    if (password.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다.';
    }
    if (!/[A-Z]/.test(password)) {
      return '비밀번호는 최소 1개의 대문자를 포함해야 합니다.';
    }
    if (!/[a-z]/.test(password)) {
      return '비밀번호는 최소 1개의 소문자를 포함해야 합니다.';
    }
    if (!/[0-9]/.test(password)) {
      return '비밀번호는 최소 1개의 숫자를 포함해야 합니다.';
    }
    if (password !== confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validatePassword();
    if (error) {
      showError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(data.message);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        showError(data.error || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            토큰 검증 중...
          </p>
        </div>
      </main>
    );
  }

  if (!isValidToken) {
    return null;
  }

  const passwordError = password ? validatePassword() : null;

  return (
    <main className={`min-h-screen flex items-center justify-center px-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-md">
        <div className={`rounded-lg shadow-lg p-8 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <FiLock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              새 비밀번호 설정
            </h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className={`block mb-2 text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                새 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className={`block mb-2 text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                비밀번호 요구사항:
              </p>
              <ul className={`text-sm space-y-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li className={password.length >= 8 ? 'text-green-600' : ''}>
                  ✓ 최소 8자 이상
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                  ✓ 대문자 1개 이상
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                  ✓ 소문자 1개 이상
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                  ✓ 숫자 1개 이상
                </li>
              </ul>
            </div>

            {/* Error message */}
            {passwordError && confirmPassword && (
              <div className={`flex items-start p-4 rounded-lg ${
                isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
              }`}>
                <FiAlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {passwordError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !!passwordError}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '재설정 중...' : '비밀번호 재설정'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className={`text-sm ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
