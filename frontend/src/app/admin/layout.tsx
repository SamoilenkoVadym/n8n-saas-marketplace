'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        try {
          await fetchMe();
        } catch {
          router.push('/login');
          return;
        }
      }

      if (user && user.role !== 'admin') {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [user, fetchMe, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A2332] flex">
      <Toaster position="top-right" />
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300 p-8">
        {children}
      </main>
    </div>
  );
}
