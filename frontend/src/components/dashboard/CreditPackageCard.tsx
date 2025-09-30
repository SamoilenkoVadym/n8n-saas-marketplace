'use client';

import { CreditPackage } from '@/types/billing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';

interface CreditPackageCardProps {
  package: CreditPackage;
  onPurchase: (id: string) => void;
  loading?: boolean;
}

export default function CreditPackageCard({ package: pkg, onPurchase, loading }: CreditPackageCardProps) {
  const pricePerCredit = (pkg.price / pkg.credits / 100).toFixed(2);

  return (
    <Card className="relative p-6 flex flex-col gap-4">
      {pkg.popular && (
        <Badge className="absolute top-4 right-4 bg-primary">
          Popular
        </Badge>
      )}

      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Coins className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{pkg.name}</h3>
          <p className="text-sm text-muted-foreground">{pkg.credits} credits</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="text-3xl font-bold">${(pkg.price / 100).toFixed(2)}</div>
        <p className="text-sm text-muted-foreground mt-1">
          ${pricePerCredit} per credit
        </p>
      </div>

      <Button
        onClick={() => onPurchase(pkg.id)}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Processing...' : 'Purchase'}
      </Button>
    </Card>
  );
}