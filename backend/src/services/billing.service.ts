interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

// Predefined credit packages (prices in cents)
const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 10,
    price: 999, // $9.99
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    credits: 50,
    price: 3999, // $39.99
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 100,
    price: 6999, // $69.99
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 500,
    price: 29999, // $299.99
  },
];

export class BillingService {
  getPackages(): CreditPackage[] {
    return CREDIT_PACKAGES;
  }

  getPackageById(packageId: string): CreditPackage | undefined {
    return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
  }
}

export const billingService = new BillingService();