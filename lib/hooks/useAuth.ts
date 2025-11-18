/**
 * Authentication Hook
 *
 * Centralized hook for auth state management
 */

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session;
  const user = session?.user;
  const isAdmin = user?.role === 'admin';

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    status,
  };
}
