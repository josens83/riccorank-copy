import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

// Export formats
export type ExportFormat = 'json' | 'csv';

// User data export (GDPR compliant)
export interface UserDataExport {
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    updatedAt: string;
  };
  posts: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    postId: string;
    createdAt: string;
  }>;
  likes: Array<{
    postId: string;
    createdAt: string;
  }>;
  bookmarks: Array<{
    stockId: string;
    createdAt: string;
  }>;
  sessions: Array<{
    id: string;
    deviceInfo: string | null;
    lastActive: string;
    createdAt: string;
  }>;
  auditLogs: Array<{
    action: string;
    createdAt: string;
  }>;
  exportedAt: string;
}

/**
 * Export all user data (GDPR Data Portability)
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  log.info('Exporting user data', { userId });

  const [user, posts, comments, likes, bookmarks, sessions, auditLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.post.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.comment.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        postId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.like.findMany({
      where: { userId },
      select: {
        postId: true,
        createdAt: true,
      },
    }),
    prisma.bookmark.findMany({
      where: { userId },
      select: {
        stockId: true,
        createdAt: true,
      },
    }),
    prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        deviceInfo: true,
        lastActive: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      where: { userId },
      select: {
        action: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Last 100 audit logs
    }),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  const exportData: UserDataExport = {
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    posts: posts.map((p: any) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    comments: comments.map((c: any) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    likes: likes.map((l: any) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    bookmarks: bookmarks.map((b: any) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
    })),
    sessions: sessions.map((s: any) => ({
      ...s,
      lastActive: s.lastActive.toISOString(),
      createdAt: s.createdAt.toISOString(),
    })),
    auditLogs: auditLogs.map((a: any) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
    exportedAt: new Date().toISOString(),
  };

  log.info('User data exported', {
    userId,
    posts: posts.length,
    comments: comments.length,
  });

  return exportData;
}

/**
 * Convert data to CSV format
 */
export function toCSV(data: Record<string, unknown>[], headers?: string[]): string {
  if (data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(',');

  const csvRows = data.map(row => {
    return keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Delete all user data (GDPR Right to Erasure)
 */
export async function deleteUserData(userId: string): Promise<void> {
  log.info('Deleting user data', { userId });

  // Delete in order due to foreign key constraints
  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.bookmark.deleteMany({ where: { userId } }),
    prisma.like.deleteMany({ where: { userId } }),
    prisma.comment.deleteMany({ where: { userId } }),
    prisma.post.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  log.info('User data deleted', { userId });
}

/**
 * Anonymize user data (alternative to deletion)
 */
export async function anonymizeUserData(userId: string): Promise<void> {
  log.info('Anonymizing user data', { userId });

  const anonymizedEmail = `deleted_${Date.now()}@anonymized.local`;

  await prisma.user.update({
    where: { id: userId },
    data: {
      email: anonymizedEmail,
      name: 'Deleted User',
      password: null,
      image: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
    },
  });

  // Clear sessions
  await prisma.session.deleteMany({ where: { userId } });

  log.info('User data anonymized', { userId });
}
