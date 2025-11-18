'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiCamera, FiLock, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { useToast } from '@/components/Toast';

export default function EditProfilePage() {
  const { isDarkMode } = useThemeStore();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/mypage/edit');
    } else if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setImage(session.user.image || '');
    }
  }, [status, session, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, image }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');

        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.data.name,
            email: data.data.email,
            image: data.data.image,
          },
        });

        setTimeout(() => router.push('/mypage'), 1000);
      } else {
        showToast(data.error || '프로필 업데이트에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      } else {
        showToast(data.error || '비밀번호 변경에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
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

  const isOAuthUser = session?.user?.provider === 'google';

  return (
    <main className={`min-h-screen py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Back button */}
        <Link
          href="/mypage"
          className={`inline-flex items-center mb-6 text-sm ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <FiArrowLeft className="mr-2" />
          마이페이지로 돌아가기
        </Link>

        <div className={`rounded-lg shadow-lg p-8 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <h1 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            프로필 수정
          </h1>

          {/* Profile Image */}
          <div className="mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <FiUser className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    const url = prompt('프로필 이미지 URL을 입력하세요:', image);
                    if (url !== null) setImage(url);
                  }}
                >
                  <FiCamera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  프로필 사진을 변경하려면 카메라 아이콘을 클릭하세요.
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  권장 크기: 400x400px
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className={`block mb-2 text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                이름
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <FiUser className={`absolute left-3 top-3.5 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`block mb-2 text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                이메일
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isOAuthUser}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isOAuthUser ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <FiMail className={`absolute left-3 top-3.5 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              {isOAuthUser && (
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  OAuth 계정의 이메일은 변경할 수 없습니다.
                </p>
              )}
            </div>

            {/* Provider info */}
            {session?.user?.provider && (
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>연결된 계정:</strong>{' '}
                  {session.user.provider === 'google' ? 'Google' : '이메일'}
                </p>
              </div>
            )}

            {/* Save button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '저장 중...' : '프로필 저장'}
            </button>
          </form>

          {/* Password Change Section */}
          {!isOAuthUser && (
            <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700">
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className={`flex items-center space-x-2 text-sm font-medium ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                } transition-colors`}
              >
                <FiLock />
                <span>비밀번호 변경하기</span>
              </button>

              {showPasswordSection && (
                <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      현재 비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <FiLock className={`absolute left-3 top-3.5 w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className={`absolute right-3 top-3.5 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      새 비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <FiLock className={`absolute left-3 top-3.5 w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={`absolute right-3 top-3.5 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      새 비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <FiLock className={`absolute left-3 top-3.5 w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-3 top-3.5 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '변경 중...' : '비밀번호 변경'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
