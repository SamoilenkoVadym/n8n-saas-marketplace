'use client';

import { useState } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';

export default function AdminPromoCodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Promo Codes</h1>
          <p className="text-muted-foreground">Create and manage discount promo codes</p>
        </div>
        <button className="btn-gradient flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Promo Code
        </button>
      </div>

      <div className="card-premium p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No promo codes yet</h3>
        <p className="text-muted-foreground mb-6">Create promo codes to offer discounts on credit purchases</p>
        <button className="btn-gradient">Create First Promo Code</button>
      </div>
    </div>
  );
}
