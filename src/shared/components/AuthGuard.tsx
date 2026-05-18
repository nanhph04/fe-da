'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from "@/i18n/routing";
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'STUDIO' | 'ADMIN';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check role requirements
      if (requiredRole && user.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, requiredRole, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-600"></div>
          <p className="mt-4 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or role doesn't match, return null (will redirect)
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}