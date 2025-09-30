'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Name:</span> {user.name || 'Not set'}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-semibold">Role:</span> {user.role}
            </div>
          </CardContent>
        </Card>

        {/* Credits Card */}
        <Card>
          <CardHeader>
            <CardTitle>Credits Balance</CardTitle>
            <CardDescription>Your available workflow execution credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-blue-600">{user.credits}</div>
            <p className="text-sm text-gray-500 mt-2">credits remaining</p>
          </CardContent>
        </Card>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/marketplace')}>
            <CardHeader>
              <CardTitle>Marketplace</CardTitle>
              <CardDescription>Browse n8n workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Explore Templates
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <CardTitle>AI Builder</CardTitle>
              <CardDescription>Generate workflows with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}