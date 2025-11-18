import { z } from 'zod';

// Stock validations
export const getStocksSchema = z.object({
  market: z.enum(['KOSPI', 'KOSDAQ']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['rank', 'name', 'currentPrice', 'changePercent', 'marketCap', 'per', 'pbr']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const stockSymbolSchema = z.object({
  symbol: z.string().min(1),
});

// News validations
export const getNewsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  isHot: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

// Post validations
export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.enum(['all', 'popular', 'stock', 'free', 'notice']),
  tags: z.string().optional(),
  stockId: z.string().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(['all', 'popular', 'stock', 'free', 'notice']).optional(),
  tags: z.string().optional(),
});

export const getPostsSchema = z.object({
  category: z.enum(['all', 'popular', 'stock', 'free', 'notice']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'views', 'likes']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

// Comment validations
export const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
  postId: z.string(),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

// Like/Bookmark validations
export const likeSchema = z.object({
  postId: z.string(),
});

export const bookmarkSchema = z.object({
  stockId: z.string(),
});

// User validations
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  image: z.string().url().optional(),
});
