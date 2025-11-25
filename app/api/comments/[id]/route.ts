import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api/errors';
import { updateCommentSchema } from '@/lib/utils/validations';

// Mock comments (should match comments/route.ts)
const comments: any[] = [];

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const data = updateCommentSchema.parse(body);

    const commentIndex = comments.findIndex((c) => c.id === id);

    if (commentIndex === -1) {
      throw new ApiError(404, 'Comment not found');
    }

    // In real app, check if user owns the comment
    comments[commentIndex] = {
      ...comments[commentIndex],
      ...data,
      updatedAt: new Date(),
    };

    return successResponse(comments[commentIndex]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const commentIndex = comments.findIndex((c) => c.id === id);

    if (commentIndex === -1) {
      throw new ApiError(404, 'Comment not found');
    }

    // In real app, check if user owns the comment or is admin
    // Also delete all child comments
    const deleteCommentAndReplies = (commentId: string) => {
      const index = comments.findIndex((c) => c.id === commentId);
      if (index !== -1) {
        const comment = comments[index];
        comments.splice(index, 1);

        // Delete replies recursively
        const replies = comments.filter((c) => c.parentId === commentId);
        replies.forEach((reply) => deleteCommentAndReplies(reply.id));
      }
    };

    deleteCommentAndReplies(id);

    return successResponse({ message: 'Comment deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
