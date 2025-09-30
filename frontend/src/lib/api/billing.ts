import { CreditPackage, CheckoutSession, VerifySessionResponse } from '@/types/billing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getPackages = async (): Promise<CreditPackage[]> => {
  const response = await fetch(`${API_BASE_URL}/api/billing/packages`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch packages' }));
    throw new Error(error.error || 'Failed to fetch packages');
  }

  return response.json();
};

export const createCheckout = async (packageId: string): Promise<CheckoutSession> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/create-checkout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ packageId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
};

export const verifySession = async (sessionId: string): Promise<VerifySessionResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/billing/verify-session?session_id=${sessionId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to verify session' }));
    throw new Error(error.error || 'Failed to verify session');
  }

  return response.json();
};