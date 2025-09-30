'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/protected-route';
import CreditBalance from '@/components/dashboard/CreditBalance';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="text-xl font-bold">
                  n8n Marketplace
                </Link>
                <nav className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/marketplace"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/dashboard/credits"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Buy Credits
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <CreditBalance />
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}