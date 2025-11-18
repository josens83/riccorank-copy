import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api-utils';
import { likeSchema } from '@/lib/utils/validations';

// In-memory storage for likes
let likes: Array<{ id: string; userId: string; postId: string; createdAt: Date }> = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');

    let filteredLikes = [...likes];

    if (postId) {
      filteredLikes = filteredLikes.filter((l) => l.postId === postId);
    }

    if (userId) {
      filteredLikes = filteredLikes.filter((l) => l.userId === userId);
    }

    return successResponse({
      data: filteredLikes,
      count: filteredLikes.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = likeSchema.parse(body);

    // In real app, get user from session
    const userId = '1'; // Mock user ID

    // Check if already liked
    const existingLike = likes.find(
      (l) => l.userId === userId && l.postId === data.postId
    );

    if (existingLike) {
      throw new ApiError(400, 'Already liked this post');
    }

    const newLike = {
      id: String(likes.length + 1),
      userId,
      postId: data.postId,
      createdAt: new Date(),
    };

    likes.push(newLike);

    return successResponse(newLike, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');

    if (!postId) {
      throw new ApiError(400, 'postId is required');
    }

    // In real app, get user from session
    const userId = '1'; // Mock user ID

    const likeIndex = likes.findIndex(
      (l) => l.userId === userId && l.postId === postId
    );

    if (likeIndex === -1) {
      throw new ApiError(404, 'Like not found');
    }

    likes.splice(likeIndex, 1);

    return successResponse({ message: 'Like removed successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
