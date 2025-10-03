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
  const { user, fetchMe } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch user if not already loaded
      if (!user) {
        try {
          await fetchMe();
        } catch (error) {
          router.push('/login');
          return;
        }
      }
      setAuthChecked(true);
    };

    initAuth();
  }, [router, user, fetchMe]);

  // Check admin role and fetch stats
  useEffect(() => {
    if (!authChecked) return;

    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user, authChecked, router]);

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
      <div className="space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 h-40"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketplace performance</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="card-premium p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Users</h3>
            <p className="text-3xl font-bold mb-2">{stats.totalUsers}</p>
            <p className="text-xs text-green-600 dark:text-green-400">+{stats.recentUsers} this month</p>
          </div>

          {/* Total Revenue */}
          <div className="card-premium p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold mb-2">${(stats.totalRevenue / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>

          {/* Templates */}
          <div className="card-premium p-6 bg-gradient-to-br from-orange-500/10 to-red-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Templates</h3>
            <p className="text-3xl font-bold mb-2">{stats.totalTemplates}</p>
            <p className="text-xs text-muted-foreground">{stats.activeTemplates} published</p>
          </div>

          {/* AI Generations */}
          <div className="card-premium p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">AI Generations</h3>
            <p className="text-3xl font-bold mb-2">{stats.aiGenerationsThisMonth}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>
      )}
    </div>
  );
}
