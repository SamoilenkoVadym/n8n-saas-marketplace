'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, fetchMe, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        await fetchMe();
        setIsChecking(false);
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [token, router, fetchMe]);

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}