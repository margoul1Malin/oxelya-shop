'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    logout,
    updateSession: update
  };
} 