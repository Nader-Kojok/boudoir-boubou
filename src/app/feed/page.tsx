'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeedRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }

    // Redirect based on user role
    const userRole = session.user?.role;
    
    switch (userRole) {
      case 'BUYER':
        router.push('/buyer/feed');
        break;
      case 'SELLER':
        router.push('/seller');
        break;
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'MODERATOR':
        router.push('/moderator');
        break;
      default:
        // Default to buyer feed for any other case
        router.push('/buyer/feed');
        break;
    }
  }, [session, status, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600">Redirection en cours...</p>
        
        {/* Loading skeleton for feed */}
        <div className="max-w-md mx-auto space-y-4 mt-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}