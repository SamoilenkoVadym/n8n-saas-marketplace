'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, CreditCard, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user || !mounted) {
    return null;
  }

  const firstName = user.name?.split(' ')[0] || user.email.split('@')[0];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready to supercharge your automation workflows with AI?
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Credits Card */}
        <Card className="card-premium p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-aimpress flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <Link href="/dashboard/credits">
              <Button size="sm" variant="ghost" className="group">
                Top up
                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
            <p className="text-3xl font-bold text-gradient-aimpress">{user.credits}</p>
          </div>
        </Card>

        {/* Templates Owned */}
        <Card className="card-premium p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Templates Owned</p>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Start browsing the marketplace</p>
          </div>
        </Card>

        {/* Activity */}
        <Card className="card-premium p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Recent Purchases</p>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Purchase history</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Browse Marketplace */}
        <Card className="card-premium group cursor-pointer" onClick={() => router.push('/marketplace')}>
          <div className="p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-aimpress flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Explore Marketplace</h3>
            <p className="text-muted-foreground mb-6">
              Browse premium AI-powered automation templates built by Aimpress experts.
              From data processing to customer engagement.
            </p>
            <Button className="btn-gradient group">
              Browse Templates
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>

        {/* Buy Credits */}
        <Card className="card-premium group cursor-pointer" onClick={() => router.push('/dashboard/credits')}>
          <div className="p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-aimpress-reverse flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Get More Credits</h3>
            <p className="text-muted-foreground mb-6">
              Purchase credits to unlock templates. Simple pay-as-you-go pricing with no subscriptions.
              Starting from just $9.99.
            </p>
            <Button variant="outline" className="group border-2 hover:border-primary">
              View Packages
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="card-premium p-8 bg-gradient-to-r from-muted/30 to-muted/10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Need help getting started?</h3>
            <p className="text-muted-foreground">
              Contact Aimpress support for personalized assistance with your automation projects.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="https://docs.n8n.io" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                Documentation
              </Button>
            </a>
            <a href="mailto:support@ai-impress.com">
              <Button className="btn-gradient">
                Contact Support
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Account Info Footer */}
      <div className="pt-8 border-t border-border/40 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="font-medium text-foreground">Account:</span> {user.email}
          </div>
          <div>
            <span className="font-medium text-foreground">Role:</span> {user.role}
          </div>
          <div>
            <span className="font-medium text-foreground">Powered by:</span>{' '}
            <a href="https://ai-impress.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Aimpress LTD
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
