import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | RANKUP 관리자',
    default: '관리자',
  },
};

/**
 * Admin Route Group Layout
 *
 * Shared layout for all admin pages
 * - Admin dashboard and controls
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
