'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, DollarSign, FileText, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  totalTemplates: number;
  aiGenerationsThisMonth: number;
  recentUsers: number;
  activeTemplates: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] mb-8">Admin Dashboard</h1>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#007AFF]" />
                </div>
              </div>
              <h3 className="text-sm text-[#86868B] mb-1">Total Users</h3>
              <p className="text-3xl font-semibold text-[#1D1D1F]">{stats.totalUsers}</p>
              <p className="text-xs text-[#34C759] mt-2">+{stats.recentUsers} this month</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#34C759]" />
                </div>
              </div>
              <h3 className="text-sm text-[#86868B] mb-1">Total Revenue</h3>
              <p className="text-3xl font-semibold text-[#1D1D1F]">${(stats.totalRevenue / 100).toFixed(2)}</p>
              <p className="text-xs text-[#86868B] mt-2">All time</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#FF6B35]" />
                </div>
              </div>
              <h3 className="text-sm text-[#86868B] mb-1">Templates</h3>
              <p className="text-3xl font-semibold text-[#1D1D1F]">{stats.totalTemplates}</p>
              <p className="text-xs text-[#86868B] mt-2">{stats.activeTemplates} published</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#0D9488]" />
                </div>
              </div>
              <h3 className="text-sm text-[#86868B] mb-1">AI Generations</h3>
              <p className="text-3xl font-semibold text-[#1D1D1F]">{stats.aiGenerationsThisMonth}</p>
              <p className="text-xs text-[#86868B] mt-2">This month</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
