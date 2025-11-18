// Type Definitions for RANKUP Platform

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: 'KOSPI' | 'KOSDAQ';
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sales?: number;
  operatingIncome?: number;
  netIncome?: number;
  per?: number;
  pbr?: number;
  score?: number;
  rank?: number;
  updatedAt: Date;
}

export interface MarketIndex {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  country: string;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  source?: string;
  url?: string;
  imageUrl?: string;
  isHot: boolean;
  category?: string;
  tags?: string;
  views: number;
  publishedAt: Date;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string;
  views: number;
  isPopular: boolean;
  isPinned: boolean;
  userId: string;
  author?: User;
  authorId?: string; // Same as userId, for consistency
  user?: User; // Backward compatibility
  stockId?: string;
  stock?: Stock;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
  likes?: Like[];
  _count?: {
    comments: number;
    likes: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  postId: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  provider?: string;
  role: 'user' | 'admin';
  suspended: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  type: 'post' | 'comment';
  targetId: string;
  reporterId: string;
  reporter?: User;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeStock {
  id: string;
  name: string;
  description?: string;
  stockSymbols: string;
  changePercent: number;
  isHot: boolean;
  updatedAt: Date;
}

export interface PopularSearch {
  rank: number;
  symbol: string;
  name: string;
  code: string;
  change: number;
  changePercent: number;
}

export interface StockSentiment {
  symbol: string;
  name: string;
  code: string;
  upCount: number;
  upPercent: number;
  downCount: number;
  downPercent: number;
  neutralCount: number;
  neutralPercent: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'like' | 'reply' | 'mention' | 'system' | 'subscription' | 'report';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  data?: {
    postId?: string;
    commentId?: string;
    replyId?: string;
    actorName?: string;
    actorImage?: string;
  };
}

/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
    timestamp?: string;
    path?: string;
  };
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
}

/**
 * Form Data Types
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface PostFormData {
  title: string;
  content: string;
  category: string;
  tags?: string;
  stockId?: string;
}

export interface CommentFormData {
  content: string;
  parentId?: string;
}

export interface ReportFormData {
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
  description?: string;
}

/**
 * Filter and Sort Types
 */

export type SortOrder = 'asc' | 'desc';

export interface StockFilters {
  market?: 'KOSPI' | 'KOSDAQ';
  search?: string;
  sortBy?: keyof Stock;
  sortOrder?: SortOrder;
}

export interface NewsFilters {
  category?: string;
  search?: string;
  isHot?: boolean;
}

export interface PostFilters {
  category?: string;
  search?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'views' | 'likes';
  sortOrder?: SortOrder;
}
