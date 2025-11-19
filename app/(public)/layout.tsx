import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | RANKUP',
    default: 'RANKUP - 스마트 주식 분석 플랫폼',
  },
};

/**
 * Public Route Group Layout
 *
 * Shared layout for all public pages
 * - News, Stock Lists, Community, Search, Legal pages
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
