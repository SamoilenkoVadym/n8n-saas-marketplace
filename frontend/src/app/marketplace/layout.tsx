'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/protected-route';
import CreditBalance from '@/components/dashboard/CreditBalance';
import { useAuthStore } from '@/lib/store';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-[#1A2332]">
        {/* Sticky Navigation - Aimpress Figma Design */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#1E3A5F] border-b border-[#FF6B35]/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-16">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-8">
                {/* Logo - White Text, No Gradient */}
                <Link href="/dashboard" className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    Aimpress
                  </span>
                  <span className="hidden sm:inline text-xs font-medium text-[#94A3B8]">
                    by ai-impress.com
                  </span>
                </Link>

                {/* Navigation Links - Horizontal */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link href="/marketplace" className="nav-link-active">
                    Marketplace
                  </Link>
                  <Link href="/dashboard/ai-builder" className="nav-link">
                    AI Builder
                  </Link>
                  <Link href="/dashboard/credits" className="nav-link">
                    Buy Credits
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <CreditBalance />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#FF6B35] transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Add top padding for fixed header */}
        <main className="pt-24">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
