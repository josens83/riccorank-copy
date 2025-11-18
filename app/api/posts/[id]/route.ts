import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api-utils';
import { updatePostSchema } from '@/lib/validations';
import { mockPosts } from '@/lib/data';

// In-memory storage (same reference as in posts/route.ts)
let posts = [...mockPosts];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const post = posts.find((p) => p.id === id);

    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Increment views
    post.views += 1;

    return successResponse(post);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const data = updatePostSchema.parse(body);

    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      throw new ApiError(404, 'Post not found');
    }

    // In real app, check if user owns the post
    // const userId = await getUserFromSession();
    // if (posts[postIndex].userId !== userId) throw new ApiError(403, 'Forbidden');

    posts[postIndex] = {
      ...posts[postIndex],
      ...data,
      updatedAt: new Date(),
    };

    return successResponse(posts[postIndex]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      throw new ApiError(404, 'Post not found');
    }

    // In real app, check if user owns the post or is admin
    // const userId = await getUserFromSession();
    // if (posts[postIndex].userId !== userId) throw new ApiError(403, 'Forbidden');

    posts.splice(postIndex, 1);

    return successResponse({ message: 'Post deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
