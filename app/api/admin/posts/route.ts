import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { mockPosts, mockUsers, mockComments } from '@/lib/mockData';
import { z } from 'zod';

const deletePostSchema = z.object({
  postId: z.string(),
  reason: z.string().optional(),
});

/**
 * GET /api/admin/posts
 * Get all posts for moderation (admin only)
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
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, mostReported

    // Filter posts
    let filteredPosts = [...mockPosts];

    if (search) {
      filteredPosts = filteredPosts.filter(
        p =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== 'all') {
      filteredPosts = filteredPosts.filter(p => p.category === category);
    }

    // Add author and comment count
    const postsWithDetails = filteredPosts.map(post => {
      const author = mockUsers.find(u => u.id === post.authorId);
      const commentsCount = mockComments.filter(c => c.postId === post.id).length;

      return {
        ...post,
        author: author ? { id: author.id, name: author.name, email: author.email } : null,
        commentsCount,
        reportCount: Math.floor(Math.random() * 5), // Mock report count
      };
    });

    // Sort
    switch (sortBy) {
      case 'oldest':
        postsWithDetails.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'mostReported':
        postsWithDetails.sort((a, b) => b.reportCount - a.reportCount);
        break;
      case 'newest':
      default:
        postsWithDetails.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = postsWithDetails.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedPosts,
      pagination: {
        page,
        limit,
        total: postsWithDetails.length,
        totalPages: Math.ceil(postsWithDetails.length / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts
 * Delete a post (admin only)
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
    const { postId, reason } = deletePostSchema.parse(body);

    // Find and delete post
    const postIndex = mockPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const deletedPost = mockPosts[postIndex];
    mockPosts.splice(postIndex, 1);

    // Also delete associated comments
    const deletedComments = mockComments.filter(c => c.postId === postId);
    deletedComments.forEach(comment => {
      const commentIndex = mockComments.findIndex(c => c.id === comment.id);
      if (commentIndex > -1) {
        mockComments.splice(commentIndex, 1);
      }
    });

    // In real implementation, log the deletion with reason
    console.log(`Admin ${session.user.email} deleted post ${postId}`, { reason });

    return NextResponse.json({
      message: 'Post deleted successfully',
      data: {
        deletedPost,
        deletedCommentsCount: deletedComments.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
