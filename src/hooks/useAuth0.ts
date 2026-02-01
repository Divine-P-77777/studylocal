'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

export function useAuth0() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  const loginWithRedirect = async (options?: { appState?: { returnTo?: string } }) => {
    // Construct the login URL. 
    // If a returnTo path is provided, append it request query.
    const returnTo = options?.appState?.returnTo || window.location.pathname;
    const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
    
    // In strict Next.js App Router, we usually use router.push or window.location
    // For external Auth0 redirect, window.location is safer/standard
    window.location.assign(loginUrl);
  };

  const logout = async (options?: { logoutParams?: { returnTo?: string } }) => {
    const returnTo = options?.logoutParams?.returnTo || window.location.origin;
    const logoutUrl = `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.assign(logoutUrl);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithRedirect,
    logout,
    error,
  };
}
