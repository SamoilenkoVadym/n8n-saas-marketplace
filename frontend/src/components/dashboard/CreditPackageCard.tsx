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
    <Card className={`relative card-premium p-6 flex flex-col gap-4 ${pkg.popular ? 'border-2 border-primary ring-2 ring-primary/20' : ''}`}>
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-aimpress text-white px-4 py-1 shadow-lg">
            ⭐ Popular
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-3 mt-2">
        <div className={`p-3 rounded-xl ${pkg.popular ? 'bg-gradient-aimpress' : 'bg-primary/10'}`}>
          <Coins className={`h-6 w-6 ${pkg.popular ? 'text-white' : 'text-primary'}`} />
        </div>
        <div>
          <h3 className="font-bold text-lg">{pkg.name}</h3>
          <p className="text-sm font-medium text-muted-foreground">{pkg.credits} credits</p>
        </div>
      </div>

      <div className="flex-1 py-2">
        <div className={`text-4xl font-bold ${pkg.popular ? 'text-gradient-aimpress' : ''}`}>
          ${(pkg.price / 100).toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          ${pricePerCredit} per credit
        </p>
      </div>

      <Button
        onClick={() => onPurchase(pkg.id)}
        disabled={loading}
        className={`w-full ${pkg.popular ? 'btn-gradient' : ''}`}
      >
        {loading ? 'Processing...' : 'Purchase'}
      </Button>
    </Card>
  );
}