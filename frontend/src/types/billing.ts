export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  credits: number;
  amount: number;
  stripeSessionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface VerifySessionResponse {
  success: boolean;
  credits: number;
  transaction?: Transaction;
}