'use client';

import { useEffect } from 'react';
import { Coins } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function CreditBalance() {
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
      <Coins className="h-5 w-5 text-primary" />
      <span className="font-medium">{user?.credits ?? 0} credits</span>
    </div>
  );
}