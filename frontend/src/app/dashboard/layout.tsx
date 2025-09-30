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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gradient-aimpress">
                    Aimpress
                  </span>
                  <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
                    by ai-impress.com
                  </span>
                </Link>
                <nav className="hidden md:flex items-center gap-4 ml-4">
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
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}