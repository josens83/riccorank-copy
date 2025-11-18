import { NextRequest } from 'next/server';
import { handleApiError, successResponse, paginateArray, ApiError } from '@/lib/api/errors';
import { getPostsSchema, createPostSchema } from '@/lib/utils/validations';
import { mockPosts } from '@/lib/data';

// In-memory storage for new posts (in real app, use database)
let posts = [...mockPosts];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params = getPostsSchema.parse({
      category: searchParams.get('category'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    let filteredPosts = [...posts];

    // Filter by category
    if (params.category && params.category !== 'all') {
      filteredPosts = filteredPosts.filter((post) => post.category === params.category);
    }

    // Search in title or content
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filteredPosts.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (params.sortBy === 'createdAt') {
        aVal = a.createdAt.getTime();
        bVal = b.createdAt.getTime();
      } else if (params.sortBy === 'views') {
        aVal = a.views;
        bVal = b.views;
      } else if (params.sortBy === 'likes') {
        aVal = a._count?.likes || 0;
        bVal = b._count?.likes || 0;
      }

      if (params.sortOrder === 'desc') {
        return aVal > bVal ? -1 : 1;
      }
      return aVal > bVal ? 1 : -1;
    });

    // Paginate
    const result = paginateArray(filteredPosts, params.page, params.limit);

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPostSchema.parse(body);

    // In real app, get user from session
    const userId = '1'; // Mock user ID

    const newPost = {
      id: String(posts.length + 1),
      ...data,
      views: 0,
      isPopular: false,
      isPinned: false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: {
        comments: 0,
        likes: 0,
      },
    };

    posts.push(newPost);

    return successResponse(newPost, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
