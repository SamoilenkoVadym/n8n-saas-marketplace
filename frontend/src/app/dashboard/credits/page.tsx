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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Purchase Credits</h1>
        <p className="text-muted-foreground">
          Choose a credit package to buy workflow automations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
}