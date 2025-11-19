/**
 * Admin Component Types
 */

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalReports: number;
  activeUsers: number;
  postsToday: number;
  userGrowth: number;
  postGrowth: number;
  commentGrowth: number;
  reportChange: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  suspended: boolean;
  postsCount: number;
  commentsCount: number;
  createdAt: string;
  lastActive: string;
}

export interface AdminPost {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  author: { id: string; name: string; email: string } | null;
  commentsCount: number;
  reportCount: number;
  createdAt: string;
}

export interface AdminComment {
  id: string;
  content: string;
  author: { id: string; name: string; email: string } | null;
  post: { id: string; title: string } | null;
  reportCount: number;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  type: 'post' | 'comment';
  targetId: string;
  reporter: { id: string; name: string; email: string } | null;
  reason: string;
  description?: string;
  status: string;
  target: any;
  createdAt: string;
}
