'use client';

import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/protected-route';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-[#1A2332] flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content - Add left padding for sidebar */}
        <main className="flex-1 ml-64 transition-all duration-300 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
