import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | RANKUP',
    default: '대시보드',
  },
};

/**
 * Dashboard Route Group Layout
 *
 * Shared layout for all authenticated user pages
 * - MyPage, Subscription settings
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
