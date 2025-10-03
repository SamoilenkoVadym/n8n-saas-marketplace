'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/api/admin/payments');
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payment History</h1>
        <p className="text-muted-foreground">View all transactions and payments</p>
      </div>

      {payments.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
          <p className="text-muted-foreground">Payment history will appear here</p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <table className="w-full">
            <thead className="bg-accent/50">
              <tr className="text-left text-sm">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment: any) => (
                <tr key={payment.id} className="border-t border-border/40">
                  <td className="p-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{payment.user?.email}</td>
                  <td className="p-4">${(payment.amount / 100).toFixed(2)}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">{payment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
