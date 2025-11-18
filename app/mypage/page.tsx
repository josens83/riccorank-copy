'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiEdit,
  FiMessageCircle,
  FiThumbsUp,
  FiBookmark,
  FiFileText,
  FiEye,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import Link from 'next/link';
import { Post, Comment } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function MyPage() {
  const { isDarkMode } = useThemeStore();
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'bookmarks'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
  });
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true); // Will be fetched from user data

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/mypage');
    return null;
  }

  useEffect(() => {
    if (session?.user) {
      setEditFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      });
      fetchUserData();
    }
  }, [session, activeTab]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'posts') {
        const response = await fetch(`/api/posts?authorId=${session?.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserPosts(data.data || []);
        }
      } else if (activeTab === 'comments') {
        const response = await fetch(`/api/comments?userId=${session?.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserComments(data || []);
        }
      } else if (activeTab === 'bookmarks') {
        const response = await fetch('/api/bookmarks');
        if (response.ok) {
          const data = await response.json();
          setBookmarkedPosts(data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('게시글 삭제에 실패했습니다');

      alert('게시글이 삭제되었습니다');
      fetchUserData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('댓글 삭제에 실패했습니다');

      alert('댓글이 삭제되었습니다');
      fetchUserData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveBookmark = async (postId: string) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) throw new Error('북마크 삭제에 실패했습니다');

      fetchUserData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API
    alert('프로필 업데이트 기능은 곧 구현됩니다');
    setIsEditing(false);
  };

  const handleResendVerificationEmail = async () => {
    setIsResendingEmail(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
      } else {
        showToast(data.error || '이메일 전송에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000 / 60 / 60);

    if (diff < 1) {
      return '방금 전';
    } else if (diff < 24) {
      return `${diff}시간 전`;
    } else {
      return `${Math.floor(diff / 24)}일 전`;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      free: '자유토론',
      stock: '종목토론',
      notice: '공지사항',
    };
    return labels[category] || category;
  };

  if (status === 'loading') {
    return (
      <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            로딩 중...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          마이페이지
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6`}>
              {!isEditing ? (
                <>
                  {/* Profile Info */}
                  <div className="text-center mb-6">
                    <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold ${
                      isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {session?.user.name?.[0] || session?.user.email?.[0] || '?'}
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {session?.user.name || '이름 없음'}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session?.user.email}
                    </p>
                  </div>

                  {/* Email Verification Banner */}
                  {!emailVerified && session?.user.provider === 'credentials' && (
                    <div
                      className={`mb-6 p-4 rounded-lg border ${
                        isDarkMode
                          ? 'bg-yellow-900/20 border-yellow-800'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <FiAlertCircle
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                          }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium mb-1 ${
                              isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                            }`}
                          >
                            이메일 인증이 필요합니다
                          </p>
                          <p
                            className={`text-xs mb-3 ${
                              isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                            }`}
                          >
                            계정의 모든 기능을 사용하려면 이메일을 인증해주세요.
                          </p>
                          <button
                            onClick={handleResendVerificationEmail}
                            disabled={isResendingEmail}
                            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                              isDarkMode
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isResendingEmail ? '전송 중...' : '인증 이메일 재전송'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {emailVerified && (
                    <div
                      className={`mb-6 p-3 rounded-lg border flex items-center space-x-2 ${
                        isDarkMode
                          ? 'bg-green-900/20 border-green-800'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <FiCheckCircle
                        className={`w-4 h-4 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          isDarkMode ? 'text-green-300' : 'text-green-700'
                        }`}
                      >
                        이메일 인증 완료
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className={`grid grid-cols-3 gap-4 py-4 border-y ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {userPosts.length}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        게시글
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {userComments.length}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        댓글
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                        {bookmarkedPosts.length}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        북마크
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center space-x-3">
                      <FiMail className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {session?.user.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiCalendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        가입일: {new Date().toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Link
                    href="/mypage/edit"
                    className={`w-full mt-6 flex items-center justify-center space-x-2 px-4 py-2 rounded-md ${
                      isDarkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-colors`}
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>프로필 수정</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Edit Form */}
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        이름
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className={`w-full px-4 py-2 rounded-md border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        이메일
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        disabled
                        className={`w-full px-4 py-2 rounded-md border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-400'
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                        } cursor-not-allowed`}
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        이메일은 변경할 수 없습니다
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className={`flex-1 px-4 py-2 rounded-md ${
                          isDarkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } transition-colors`}
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className="lg:col-span-2">
            <div className={`rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6`}>
              {/* Tabs */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'posts'
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiFileText className="w-4 h-4" />
                  <span>내 게시글</span>
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'comments'
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span>내 댓글</span>
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'bookmarks'
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiBookmark className="w-4 h-4" />
                  <span>북마크</span>
                </button>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  로딩 중...
                </div>
              ) : (
                <>
                  {/* Posts Tab */}
                  {activeTab === 'posts' && (
                    <div className="space-y-4">
                      {userPosts.length === 0 ? (
                        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          작성한 게시글이 없습니다
                        </div>
                      ) : (
                        userPosts.map((post) => (
                          <div
                            key={post.id}
                            className={`p-4 rounded-lg border ${
                              isDarkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {getCategoryLabel(post.category)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/stockboard/${post.id}`}
                                  className={`p-1 rounded-md ${
                                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  <FiEye className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className={`p-1 rounded-md ${
                                    isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                  }`}
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <Link href={`/stockboard/${post.id}`}>
                              <h3 className={`text-lg font-semibold mb-2 hover:text-blue-600 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {post.title}
                              </h3>
                            </Link>
                            <p className={`text-sm mb-3 line-clamp-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {post.content}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                                {getTimeAgo(post.createdAt)}
                              </span>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1 text-gray-400">
                                  <FiEye className="w-4 h-4" />
                                  <span>{post.views || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-400">
                                  <FiThumbsUp className="w-4 h-4" />
                                  <span>{post.likeCount || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-400">
                                  <FiMessageCircle className="w-4 h-4" />
                                  <span>{post.commentCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Comments Tab */}
                  {activeTab === 'comments' && (
                    <div className="space-y-4">
                      {userComments.length === 0 ? (
                        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          작성한 댓글이 없습니다
                        </div>
                      ) : (
                        userComments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`p-4 rounded-lg border ${
                              isDarkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Link
                                href={`/stockboard/${comment.postId}`}
                                className={`text-sm font-medium hover:text-blue-600 ${
                                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                }`}
                              >
                                게시글로 이동 →
                              </Link>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className={`p-1 rounded-md ${
                                  isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                }`}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {comment.content}
                            </p>
                            <div className="mt-2">
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {getTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Bookmarks Tab */}
                  {activeTab === 'bookmarks' && (
                    <div className="space-y-4">
                      {bookmarkedPosts.length === 0 ? (
                        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          북마크한 게시글이 없습니다
                        </div>
                      ) : (
                        bookmarkedPosts.map((post) => (
                          <div
                            key={post.id}
                            className={`p-4 rounded-lg border ${
                              isDarkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {getCategoryLabel(post.category)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveBookmark(post.id)}
                                className={`p-1 rounded-md ${
                                  isDarkMode ? 'hover:bg-gray-700 text-orange-400' : 'hover:bg-gray-100 text-orange-600'
                                }`}
                              >
                                <FiBookmark className="w-4 h-4 fill-current" />
                              </button>
                            </div>
                            <Link href={`/stockboard/${post.id}`}>
                              <h3 className={`text-lg font-semibold mb-2 hover:text-blue-600 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {post.title}
                              </h3>
                            </Link>
                            <p className={`text-sm mb-3 line-clamp-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {post.content}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                                {post.author?.name || post.author?.email || '익명'}
                              </span>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1 text-gray-400">
                                  <FiEye className="w-4 h-4" />
                                  <span>{post.views || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-400">
                                  <FiThumbsUp className="w-4 h-4" />
                                  <span>{post.likeCount || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-400">
                                  <FiMessageCircle className="w-4 h-4" />
                                  <span>{post.commentCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
