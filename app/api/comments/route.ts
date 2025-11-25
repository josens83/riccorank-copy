import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api/errors';
import { createCommentSchema } from '@/lib/utils/validations';

// In-memory storage for comments
const comments: any[] = [
  {
    id: '1',
    content: '좋은 분석 감사합니다!',
    userId: '2',
    postId: '1',
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    content: '동의합니다. 추가 상승 여력이 있어 보입니다.',
    userId: '1',
    postId: '1',
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    content: '저도 그렇게 생각합니다.',
    userId: '2',
    postId: '1',
    parentId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');

    if (!postId) {
      throw new ApiError(400, 'postId is required');
    }

    // Filter comments by postId
    const postComments = comments.filter((c) => c.postId === postId);

    // Organize into tree structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map
    postComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree
    postComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return successResponse({
      data: rootComments,
      total: postComments.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCommentSchema.parse(body);

    // In real app, get user from session
    const userId = '1'; // Mock user ID

    const newComment = {
      id: String(comments.length + 1),
      ...data,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    comments.push(newComment);

    return successResponse(newComment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
