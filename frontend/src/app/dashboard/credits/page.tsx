'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreditPackage } from '@/types/billing';
import { getPackages, createCheckout } from '@/lib/api/billing';
import CreditPackageCard from '@/components/dashboard/CreditPackageCard';

export default function CreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await getPackages();
        setPackages(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load packages');
      }
    };

    loadPackages();
  }, []);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);
    try {
      const { url } = await createCheckout(packageId);
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create checkout session');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Power Your <span className="text-gradient-aimpress">Automation Journey</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Purchase credits to unlock premium AI-powered templates. Managed by <span className="font-semibold text-foreground">Aimpress LTD</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {packages.map((pkg) => (
          <CreditPackageCard
            key={pkg.id}
            package={pkg}
            onPurchase={handlePurchase}
            loading={loading === pkg.id}
          />
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No credit packages available at the moment.
        </div>
      )}

      {/* Info Section */}
      <div className="card-premium p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h3 className="text-2xl font-bold">Why Credits?</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our credit system gives you maximum flexibility. No recurring subscriptions, no surprise bills.
            Purchase only what you need, when you need it. Each template clearly shows its credit cost,
            and credits never expire.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Every template</span> includes AI-powered capabilities,
            expert documentation, and ongoing support from the Aimpress team.
          </p>
        </div>
      </div>
    </div>
  );
}