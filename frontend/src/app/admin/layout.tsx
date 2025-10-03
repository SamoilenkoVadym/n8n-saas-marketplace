'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, CreditCard } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Templates', href: '/admin/templates', icon: FileText },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="border-b border-[#E5E5E7] bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center space-x-8 h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#007AFF] text-white'
                      : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
