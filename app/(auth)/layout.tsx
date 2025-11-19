import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | RANKUP 인증',
    default: '인증',
  },
};

/**
 * Auth Route Group Layout
 *
 * Shared layout for all authentication pages
 * - Login, Signup, Password Reset, Email Verification
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
