'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { verifySession } from '@/lib/api/billing';
import { useAuthStore } from '@/lib/store';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateCredits } = useAuthStore();
  const [verified, setVerified] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      toast.error('No session ID found');
      router.push('/dashboard/credits');
      return;
    }

    const verify = async () => {
      try {
        const response = await verifySession(sessionId);

        if (!response.success) {
          // Payment still pending, poll again
          setIsPending(true);
          setTimeout(() => verify(), 2000); // Retry after 2 seconds
          return;
        }

        setVerified(true);
        setCredits(response.credits);
        // Update Zustand store with new credits
        updateCredits(response.credits);
        toast.success('Credits added successfully!');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to verify payment');
        router.push('/dashboard/credits');
      }
    };

    verify();
  }, [searchParams, router, updateCredits]);

  if (!verified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isPending ? 'Processing payment...' : 'Verifying payment...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your credits have been added to your account.
        </p>

        <div className="bg-primary/10 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Your new balance:</p>
          <p className="text-3xl font-bold">{credits} credits</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push('/dashboard/marketplace')}
            className="w-full"
          >
            Go to Marketplace
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}