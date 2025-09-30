'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            n8n SaaS Marketplace
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Build, deploy, and share powerful automation workflows with AI assistance
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">Workflow Marketplace</h3>
            <p className="text-gray-600">
              Browse and purchase pre-built n8n workflows for your business needs
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Builder</h3>
            <p className="text-gray-600">
              Generate custom workflows using AI by describing what you need
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Deployment</h3>
            <p className="text-gray-600">
              Deploy workflows to your n8n instance with a single click
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}