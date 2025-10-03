'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  CreditCard,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Package,
  Zap,
  Users,
  FileText,
  Tag
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Update main content margin when collapsed state changes
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.style.marginLeft = collapsed ? '4rem' : '16rem';
    }
  }, [collapsed]);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isAdminPage = pathname?.startsWith('/admin');

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'AI Builder', href: '/dashboard/ai-builder', icon: Sparkles },
    { name: 'My AI Templates', href: '/dashboard/ai-templates', icon: Zap },
    { name: 'My Purchases', href: '/dashboard/purchases', icon: Package },
    { name: 'Buy Credits', href: '/dashboard/credits', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Templates', href: '/admin/templates', icon: FileText },
    { name: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#1E3A5F] border-r border-[#FF6B35]/10 transition-all duration-300 z-40 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-[#FF6B35]/10">
            {!collapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">Aimpress</span>
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {/* Show admin menu if on admin page, otherwise show regular menu */}
            {isAdminPage && user?.role === 'admin' ? (
              <>
                {/* Admin Navigation */}
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        active
                          ? 'bg-gradient-aimpress text-white shadow-lg'
                          : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.name : ''}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.name}</span>}
                    </Link>
                  );
                })}

                {/* Back to Dashboard */}
                <div className="pt-2 mt-2 border-t border-[#FF6B35]/10">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">Back to Dashboard</span>}
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Regular Navigation */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        active
                          ? 'bg-gradient-aimpress text-white shadow-lg'
                          : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.name : ''}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.name}</span>}
                    </Link>
                  );
                })}

                {/* Admin Panel Link */}
                {user?.role === 'admin' && (
                  <div className="pt-2 mt-2 border-t border-[#FF6B35]/10">
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all"
                    >
                      <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">Admin Panel</span>}
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="p-3 border-t border-[#FF6B35]/10">
            {!collapsed ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-[#94A3B8]">Logged in as</div>
                  <div className="text-sm font-medium text-white truncate">
                    {user?.email}
                  </div>
                  <div className="text-xs text-[#FF6B35] mt-1">
                    {user?.credits} credits
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-[#94A3B8] hover:bg-white/5 hover:text-white rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full p-2.5 text-[#94A3B8] hover:bg-white/5 hover:text-white rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
