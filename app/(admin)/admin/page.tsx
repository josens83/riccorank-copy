'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FiUsers,
  FiFileText,
  FiMessageCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiEye,
  FiTrash2,
  FiCheck,
  FiX,
  FiShield,
  FiUserX,
  FiUserCheck
} from 'react-icons/fi';
import Link from 'next/link';
import { useToast } from '@/components/shared/Toast';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalReports: number;
  activeUsers: number;
  postsToday: number;
  userGrowth: number;
  postGrowth: number;
  commentGrowth: number;
  reportChange: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  suspended: boolean;
  postsCount: number;
  commentsCount: number;
  createdAt: string;
  lastActive: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  author: { id: string; name: string; email: string } | null;
  commentsCount: number;
  reportCount: number;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string; email: string } | null;
  post: { id: string; title: string } | null;
  reportCount: number;
  createdAt: string;
}

interface Report {
  id: string;
  type: 'post' | 'comment';
  targetId: string;
  reporter: { id: string; name: string; email: string } | null;
  reason: string;
  description?: string;
  status: string;
  target: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const { isDarkMode } = useThemeStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'comments' | 'reports'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('pending');

  // Redirect if not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchStats();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.role === 'admin' && activeTab !== 'overview') {
      fetchTabData();
    }
  }, [activeTab, session]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      showError('통계를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          const usersRes = await fetch(`/api/admin/users?search=${searchQuery}&limit=50`);
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(usersData.data);
          }
          break;
        case 'posts':
          const postsRes = await fetch(`/api/admin/posts?search=${searchQuery}&limit=50`);
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(postsData.data);
          }
          break;
        case 'comments':
          const commentsRes = await fetch(`/api/admin/comments?search=${searchQuery}&limit=50`);
          if (commentsRes.ok) {
            const commentsData = await commentsRes.json();
            setComments(commentsData.data);
          }
          break;
        case 'reports':
          const reportsRes = await fetch(`/api/admin/reports?status=${reportStatusFilter}&limit=50`);
          if (reportsRes.ok) {
            const reportsData = await reportsRes.json();
            setReports(reportsData.data);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to fetch tab data:', error);
      showError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete' | 'makeAdmin' | 'removeAdmin') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      if (response.ok) {
        showSuccess('사용자 상태가 업데이트되었습니다.');
        fetchTabData();
      } else {
        const error = await response.json();
        showError(error.error || '작업 실패');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      showError('사용자 업데이트 실패');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까? 관련된 모든 댓글도 함께 삭제됩니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reason: '관리자 삭제' }),
      });

      if (response.ok) {
        showSuccess('게시글이 삭제되었습니다.');
        fetchTabData();
      } else {
        const error = await response.json();
        showError(error.error || '삭제 실패');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      showError('게시글 삭제 실패');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까? 관련된 모든 대댓글도 함께 삭제됩니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, reason: '관리자 삭제' }),
      });

      if (response.ok) {
        showSuccess('댓글이 삭제되었습니다.');
        fetchTabData();
      } else {
        const error = await response.json();
        showError(error.error || '삭제 실패');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      showError('댓글 삭제 실패');
    }
  };

  const handleReportAction = async (reportId: string, action: 'review' | 'resolve' | 'dismiss') => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });

      if (response.ok) {
        showSuccess('신고 상태가 업데이트되었습니다.');
        fetchTabData();
      } else {
        const error = await response.json();
        showError(error.error || '작업 실패');
      }
    } catch (error) {
      console.error('Failed to update report:', error);
      showError('신고 업데이트 실패');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>로딩 중...</div>
      </main>
    );
  }

  if (session?.user?.role !== 'admin') {
    return null;
  }

  const statCards = [
    { icon: FiUsers, label: '총 사용자', value: stats?.totalUsers || 0, color: 'blue', trend: `+${stats?.userGrowth || 0}%` },
    { icon: FiFileText, label: '총 게시글', value: stats?.totalPosts || 0, color: 'green', trend: `+${stats?.postGrowth || 0}%` },
    { icon: FiMessageCircle, label: '총 댓글', value: stats?.totalComments || 0, color: 'purple', trend: `+${stats?.commentGrowth || 0}%` },
    { icon: FiAlertTriangle, label: '미처리 신고', value: stats?.totalReports || 0, color: 'red', trend: `${stats?.reportChange || 0}개` },
  ];

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            관리자 대시보드
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            서비스 관리 및 모니터링
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border p-6 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <span className={`text-sm font-semibold ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.value.toLocaleString()}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-300 dark:border-gray-700">
            {[
              { key: 'overview', label: '개요' },
              { key: 'users', label: '사용자 관리' },
              { key: 'posts', label: '게시글 관리' },
              { key: 'comments', label: '댓글 관리' },
              { key: 'reports', label: '신고 관리' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6`}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  최근 활동
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        활성 사용자 (오늘)
                      </span>
                      <FiTrendingUp className="text-green-600" />
                    </div>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats?.activeUsers || 0}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        게시글 (오늘)
                      </span>
                      <FiFileText className="text-blue-600" />
                    </div>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats?.postsToday || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  빠른 작업
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-left"
                  >
                    <FiUsers className="w-6 h-6 mb-2" />
                    <p className="font-semibold">사용자 관리</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="p-4 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors text-left"
                  >
                    <FiAlertTriangle className="w-6 h-6 mb-2" />
                    <p className="font-semibold">신고 처리</p>
                  </button>
                  <Link
                    href="/stockboard"
                    className="p-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-left block"
                  >
                    <FiEye className="w-6 h-6 mb-2" />
                    <p className="font-semibold">사이트 보기</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  사용자 목록
                </h2>
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchTabData()}
                  className={`px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>이름</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>이메일</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>역할</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>상태</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>활동</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>가입일</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.suspended ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {user.suspended ? '정지' : '활성'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          게시글 {user.postsCount} / 댓글 {user.commentsCount}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            {user.suspended ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                title="활성화"
                              >
                                <FiUserCheck className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="p-1 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded"
                                title="정지"
                              >
                                <FiUserX className="w-5 h-5" />
                              </button>
                            )}
                            {user.role === 'user' ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'makeAdmin')}
                                className="p-1 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded"
                                title="관리자로 승급"
                              >
                                <FiShield className="w-5 h-5" />
                              </button>
                            ) : user.id !== session.user.id && (
                              <button
                                onClick={() => handleUserAction(user.id, 'removeAdmin')}
                                className={`p-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
                                title="관리자 권한 제거"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            )}
                            {user.id !== session.user.id && (
                              <button
                                onClick={() => handleUserAction(user.id, 'delete')}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                title="삭제"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  게시글 목록
                </h2>
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchTabData()}
                  className={`px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>제목</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작성자</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>카테고리</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>조회수</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>댓글</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>신고</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작성일</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Link href={`/stockboard/${post.id}`} className="text-blue-600 hover:underline">
                            {post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
                          </Link>
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{post.author?.name || '알 수 없음'}</td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{post.category}</td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{post.views}</td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{post.commentsCount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            post.reportCount > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {post.reportCount}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            title="삭제"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  댓글 목록
                </h2>
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchTabData()}
                  className={`px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>내용</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작성자</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>게시글</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>신고</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작성일</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((comment) => (
                      <tr key={comment.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {comment.content.length > 100 ? comment.content.substring(0, 100) + '...' : comment.content}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{comment.author?.name || '알 수 없음'}</td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {comment.post ? (
                            <Link href={`/stockboard/${comment.post.id}`} className="text-blue-600 hover:underline">
                              {comment.post.title.length > 30 ? comment.post.title.substring(0, 30) + '...' : comment.post.title}
                            </Link>
                          ) : (
                            '삭제된 게시글'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            comment.reportCount > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {comment.reportCount}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            title="삭제"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  신고 관리
                </h2>
                <select
                  value={reportStatusFilter}
                  onChange={(e) => {
                    setReportStatusFilter(e.target.value);
                    fetchTabData();
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">전체</option>
                  <option value="pending">미처리</option>
                  <option value="reviewed">검토됨</option>
                  <option value="resolved">해결됨</option>
                  <option value="dismissed">기각됨</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>유형</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>신고 대상</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>신고자</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>사유</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>상태</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>신고일</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={`px-4 py-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          신고 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              report.type === 'post' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}>
                              {report.type === 'post' ? '게시글' : '댓글'}
                            </span>
                          </td>
                          <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {report.target ? (
                              <div>
                                {report.type === 'post' ? (
                                  <Link href={`/stockboard/${report.target.id}`} className="text-blue-600 hover:underline">
                                    {report.target.title?.substring(0, 50) || 'Untitled'}
                                  </Link>
                                ) : (
                                  <div>
                                    <p className="text-sm">{report.target.content?.substring(0, 50) || 'No content'}</p>
                                    {report.target.post && (
                                      <Link href={`/stockboard/${report.target.post.id}`} className="text-xs text-blue-600 hover:underline">
                                        → {report.target.post.title?.substring(0, 30)}
                                      </Link>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">삭제된 콘텐츠</span>
                            )}
                          </td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {report.reporter?.name || '알 수 없음'}
                          </td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div>
                              <p>{
                                report.reason === 'spam' ? '스팸' :
                                report.reason === 'harassment' ? '괴롭힘' :
                                report.reason === 'inappropriate' ? '부적절' :
                                report.reason === 'misinformation' ? '허위정보' : '기타'
                              }</p>
                              {report.description && (
                                <p className="text-xs text-gray-500 mt-1">{report.description.substring(0, 50)}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              report.status === 'reviewed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {
                                report.status === 'pending' ? '미처리' :
                                report.status === 'reviewed' ? '검토됨' :
                                report.status === 'resolved' ? '해결됨' : '기각됨'
                              }
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              {report.status === 'pending' && (
                                <button
                                  onClick={() => handleReportAction(report.id, 'review')}
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                  title="검토"
                                >
                                  검토
                                </button>
                              )}
                              {(report.status === 'pending' || report.status === 'reviewed') && (
                                <>
                                  <button
                                    onClick={() => handleReportAction(report.id, 'resolve')}
                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                    title="해결"
                                  >
                                    해결
                                  </button>
                                  <button
                                    onClick={() => handleReportAction(report.id, 'dismiss')}
                                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                    title="기각"
                                  >
                                    기각
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
