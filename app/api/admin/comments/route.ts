import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { mockComments, mockUsers, mockPosts } from '@/lib/mockData';
import { z } from 'zod';

const deleteCommentSchema = z.object({
  commentId: z.string(),
  reason: z.string().optional(),
});

/**
 * GET /api/admin/comments
 * Get all comments for moderation (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, mostReported

    // Filter comments
    let filteredComments = [...mockComments];

    if (search) {
      filteredComments = filteredComments.filter(c =>
        c.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Add author and post details
    const commentsWithDetails = filteredComments.map(comment => {
      const author = mockUsers.find(u => u.id === comment.authorId);
      const post = mockPosts.find(p => p.id === comment.postId);

      return {
        ...comment,
        author: author ? { id: author.id, name: author.name, email: author.email } : null,
        post: post ? { id: post.id, title: post.title } : null,
        reportCount: Math.floor(Math.random() * 3), // Mock report count
      };
    });

    // Sort
    switch (sortBy) {
      case 'oldest':
        commentsWithDetails.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'mostReported':
        commentsWithDetails.sort((a, b) => b.reportCount - a.reportCount);
        break;
      case 'newest':
      default:
        commentsWithDetails.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = commentsWithDetails.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedComments,
      pagination: {
        page,
        limit,
        total: commentsWithDetails.length,
        totalPages: Math.ceil(commentsWithDetails.length / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/comments
 * Delete a comment (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { commentId, reason } = deleteCommentSchema.parse(body);

    // Find and delete comment
    const commentIndex = mockComments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const deletedComment = mockComments[commentIndex];
    mockComments.splice(commentIndex, 1);

    // Also delete child comments (replies)
    const childComments = mockComments.filter(c => c.parentId === commentId);
    childComments.forEach(child => {
      const childIndex = mockComments.findIndex(c => c.id === child.id);
      if (childIndex > -1) {
        mockComments.splice(childIndex, 1);
      }
    });

    // In real implementation, log the deletion with reason
    console.log(`Admin ${session.user.email} deleted comment ${commentId}`, { reason });

    return NextResponse.json({
      message: 'Comment deleted successfully',
      data: {
        deletedComment,
        deletedRepliesCount: childComments.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to delete comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
