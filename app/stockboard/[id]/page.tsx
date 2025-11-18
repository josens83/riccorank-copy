'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiArrowLeft, FiHeart, FiMessageCircle, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { Post, Comment } from '@/lib/constants/types';

function CommentItem({ comment, onReply, onDelete, userId }: {
  comment: Comment;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  userId?: string;
}) {
  const { isDarkMode } = useThemeStore();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`border-l-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pl-4 py-3`}>
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
        }`}>
          {comment.author?.name?.[0] || comment.author?.email?.[0] || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {comment.author?.name || comment.author?.email || '익명'}
            </span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {new Date(comment.createdAt).toLocaleString('ko-KR')}
            </span>
          </div>
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {comment.content}
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onReply(comment.id)}
              className={`text-xs ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              답글
            </button>
            {userId === comment.authorId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            )}
            {comment.children && comment.children.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {isExpanded ? '답글 숨기기' : `답글 ${comment.children.length}개 보기`}
              </button>
            )}
          </div>
        </div>
      </div>
      {isExpanded && comment.children && comment.children.length > 0 && (
        <div className="ml-8 mt-2 space-y-2">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              onReply={onReply}
              onDelete={onDelete}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentContent, setCommentContent] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
    if (session?.user) {
      checkIfLiked();
    }
  }, [params.id, session]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      if (!response.ok) throw new Error('게시글을 불러올 수 없습니다');
      const data = await response.json();
      setPost(data);
      setLikeCount(data.likeCount || 0);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${params.id}`);
      if (!response.ok) throw new Error('댓글을 불러올 수 없습니다');
      const data = await response.json();
      setComments(data);
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const checkIfLiked = async () => {
    try {
      const response = await fetch(`/api/likes?postId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked || false);
      }
    } catch (err) {
      console.error('Failed to check like status:', err);
    }
  };

  const handleLike = async () => {
    if (!session?.user) {
      router.push('/login?callbackUrl=/stockboard/' + params.id);
      return;
    }

    try {
      if (isLiked) {
        const response = await fetch('/api/likes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: params.id }),
        });
        if (response.ok) {
          setIsLiked(false);
          setLikeCount(prev => prev - 1);
        }
      } else {
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: params.id }),
        });
        if (response.ok) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push('/login?callbackUrl=/stockboard/' + params.id);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: params.id,
          content: commentContent,
          parentId: replyToId,
        }),
      });

      if (!response.ok) throw new Error('댓글 작성에 실패했습니다');

      setCommentContent('');
      setReplyToId(null);
      fetchComments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('댓글 삭제에 실패했습니다');

      fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePostDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('게시글 삭제에 실패했습니다');

      alert('게시글이 삭제되었습니다');
      router.push('/stockboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            로딩 중...
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            {error || '게시글을 찾을 수 없습니다'}
          </div>
        </div>
      </main>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      free: '자유토론',
      stock: '종목토론',
      notice: '공지사항',
    };
    return labels[category] || category;
  };

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/stockboard"
          className={`inline-flex items-center space-x-2 mb-4 ${
            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>목록으로</span>
        </Link>

        {/* Post Content */}
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6 mb-4`}>
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                post.category === 'notice'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {getCategoryLabel(post.category)}
              </span>
              {post.tags && post.tags.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
            <h1 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {post.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  {post.author?.name?.[0] || post.author?.email?.[0] || '?'}
                </div>
                <div>
                  <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {post.author?.name || post.author?.email || '익명'}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(post.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>
              {session?.user?.id === post.authorId && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/stockboard/${post.id}/edit`}
                    className={`p-2 rounded-md ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <FiEdit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handlePostDelete}
                    className={`p-2 rounded-md ${
                      isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                    }`}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={`py-6 border-y ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {post.content}
            </p>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-1 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <FiEye className="w-4 h-4" />
                <span>{post.views || 0}</span>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <FiMessageCircle className="w-4 h-4" />
                <span>{post.commentCount || 0}</span>
              </div>
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6`}>
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            댓글 {comments.length}개
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            {replyToId && (
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  답글 작성 중
                </span>
                <button
                  type="button"
                  onClick={() => setReplyToId(null)}
                  className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  취소
                </button>
              </div>
            )}
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={session?.user ? '댓글을 입력하세요' : '로그인 후 댓글을 작성할 수 있습니다'}
              disabled={!session?.user}
              rows={3}
              className={`w-full px-4 py-3 rounded-md border mb-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50`}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!session?.user || !commentContent.trim() || isSubmitting}
                className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '작성 중...' : replyToId ? '답글 작성' : '댓글 작성'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              첫 댓글을 작성해보세요
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={setReplyToId}
                  onDelete={handleCommentDelete}
                  userId={session?.user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
