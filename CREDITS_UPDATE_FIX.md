# Credits Update Fix - Payment Success Flow

## Problem
After successful Stripe payment, the credit balance shown in the header (CreditBalance component) was not updating. The success page showed the correct new balance, but navigating to other pages showed the old balance.

## Root Cause
The success page was calling the `/api/billing/verify-session` endpoint and receiving the updated credits, but only storing them in local component state. The Zustand store (which CreditBalance reads from) was never updated.

## Solution

### 1. Added `updateCredits` Method to Zustand Store
**File:** `frontend/src/lib/store.ts`

Added a new method to update credits in the global state:

```typescript
updateCredits: (credits: number) => {
  set((state) => ({
    user: state.user ? { ...state.user, credits } : null,
  }));
}
```

### 2. Updated Success Page to Update Store
**File:** `frontend/src/app/dashboard/credits/success/page.tsx`

- Import `useAuthStore` and get `updateCredits` function
- After successful verification, call `updateCredits(response.credits)`
- Added polling mechanism for pending payments (retries every 2 seconds)
- Shows different loading states: "Verifying payment..." → "Processing payment..."

### 3. Payment Flow

```
User completes Stripe payment
         ↓
Stripe redirects: /dashboard/credits/success?session_id=XXX
         ↓
Success page calls: GET /api/billing/verify-session?session_id=XXX
         ↓
Backend checks payment status in database
         ↓
If pending: Frontend polls every 2 seconds
         ↓
When completed: Backend returns { success: true, credits: 50 }
         ↓
Frontend updates Zustand store: updateCredits(50)
         ↓
CreditBalance component (header) shows new balance: 50 credits ✓
```

## Backend Verify-Session Endpoint

**File:** `backend/src/routes/billing.routes.ts`

The endpoint returns:

```typescript
{
  success: boolean,        // true if payment.status === 'completed'
  credits: number,         // Current user credits from database
  transaction: {
    id: string,
    userId: string,
    credits: number,       // Credits from this transaction
    amount: number,        // Amount paid (in cents)
    stripeSessionId: string,
    status: 'pending' | 'completed' | 'failed',
    createdAt: string
  }
}
```

## Testing Instructions

### Test Scenario 1: Normal Flow (Webhook Completes Before Verification)

1. Start backend and frontend:
   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev
   ```

2. Login and check initial balance (e.g., 40 credits)

3. Go to `/dashboard/credits`

4. Click "Purchase" on Starter Pack (10 credits, $9.99)

5. Complete Stripe test payment:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

6. **Expected Results:**
   - Redirected to `/dashboard/credits/success?session_id=cs_test_...`
   - Shows: "Verifying payment..." (brief)
   - Shows: "Payment Successful!"
   - Shows: "Your new balance: 50 credits"
   - Header balance updates: 50 credits ✓

7. Navigate to Dashboard or Marketplace
   - **Expected:** Header still shows 50 credits ✓

### Test Scenario 2: Delayed Webhook (Webhook Fires After Redirect)

1. Follow steps 1-5 above

2. If webhook is slow:
   - Shows: "Verifying payment..."
   - Shows: "Processing payment..." (polling)
   - After webhook completes (max ~4-6 seconds):
   - Shows: "Payment Successful!"
   - Credits updated correctly

3. **Expected:** Same final result as Scenario 1

### Backend Console Logs

You should see:

```
Package details: { packageId: 'starter', credits: 10, price: 999 }
Creating Stripe session: { credits: 10, amountInCents: 999, amountInDollars: '9.99' }
Payment completed: User <user-id> received 10 credits
```

### Database Verification

Check payment record:

```sql
SELECT * FROM "Payment" WHERE "stripeSessionId" = 'cs_test_...';
```

Expected:
- `status`: 'completed'
- `credits`: 10
- `amount`: 999

Check user credits:

```sql
SELECT id, email, credits FROM "User" WHERE id = '<user-id>';
```

Expected: `credits` increased by 10

## Edge Cases Handled

1. **No session_id in URL** → Redirects to `/dashboard/credits` with error toast
2. **Invalid session_id** → Shows error and redirects
3. **Payment not found** → Shows error and redirects
4. **Payment pending** → Polls every 2 seconds until completed
5. **Webhook slow** → Gracefully waits and shows "Processing payment..."
6. **Network error** → Shows error toast and redirects

## Files Modified

1. `frontend/src/lib/store.ts` - Added `updateCredits` method
2. `frontend/src/app/dashboard/credits/success/page.tsx` - Integrated store update + polling
3. `backend/src/services/billing.service.ts` - Fixed prices (cents)
4. `backend/src/services/payment.service.ts` - Fixed unit_amount calculation + debug logs
5. `backend/src/routes/payment.routes.ts` - Added debug logs

## TypeScript Compilation

All files compile without errors:
- ✓ Backend: `cd backend && npx tsc --noEmit`
- ✓ Frontend: `cd frontend && npx tsc --noEmit`
