import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api/errors';
import { bookmarkSchema } from '@/lib/utils/validations';
import { mockStocks } from '@/lib/data';

// In-memory storage for bookmarks
const bookmarks: Array<{ id: string; userId: string; stockId: string; createdAt: Date }> = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // In real app, get user from session
    const currentUserId = userId || '1';

    const userBookmarks = bookmarks.filter((b) => b.userId === currentUserId);

    // Get full stock details
    const bookmarkedStocks = userBookmarks.map((bookmark) => {
      const stock = mockStocks.find((s) => s.id === bookmark.stockId);
      return {
        ...bookmark,
        stock,
      };
    });

    return successResponse({
      data: bookmarkedStocks,
      count: bookmarkedStocks.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookmarkSchema.parse(body);

    // In real app, get user from session
    const userId = '1'; // Mock user ID

    // Check if already bookmarked
    const existingBookmark = bookmarks.find(
      (b) => b.userId === userId && b.stockId === data.stockId
    );

    if (existingBookmark) {
      throw new ApiError(400, 'Already bookmarked this stock');
    }

    // Verify stock exists
    const stock = mockStocks.find((s) => s.id === data.stockId);
    if (!stock) {
      throw new ApiError(404, 'Stock not found');
    }

    const newBookmark = {
      id: String(bookmarks.length + 1),
      userId,
      stockId: data.stockId,
      createdAt: new Date(),
    };

    bookmarks.push(newBookmark);

    return successResponse(newBookmark, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stockId = searchParams.get('stockId');

    if (!stockId) {
      throw new ApiError(400, 'stockId is required');
    }

    // In real app, get user from session
    const userId = '1'; // Mock user ID

    const bookmarkIndex = bookmarks.findIndex(
      (b) => b.userId === userId && b.stockId === stockId
    );

    if (bookmarkIndex === -1) {
      throw new ApiError(404, 'Bookmark not found');
    }

    bookmarks.splice(bookmarkIndex, 1);

    return successResponse({ message: 'Bookmark removed successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
