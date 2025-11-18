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
  user?: User;
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
  userId?: string; // Deprecated: use authorId
  author?: User;
  user?: User; // Deprecated: use author
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
