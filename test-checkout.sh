#!/bin/bash

# Test Stripe Checkout Pricing
# This script tests the create-checkout endpoint to verify correct pricing

echo "Testing Stripe Checkout pricing..."
echo ""

# First, login to get a token (replace with your test credentials)
echo "1. Login to get auth token:"
echo "   curl -X POST http://localhost:4000/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'"
echo ""
echo "2. Copy the token from the response"
echo ""
echo "3. Test checkout with Starter Pack (should show \$9.99):"
echo "   curl -X POST http://localhost:4000/api/payments/create-checkout \\"
echo "     -H 'Authorization: Bearer YOUR_TOKEN_HERE' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"packageId\":\"starter\"}'"
echo ""
echo "4. Check backend console logs for:"
echo "   - Package details: { packageId: 'starter', credits: 10, price: 999 }"
echo "   - Creating Stripe session: { credits: 10, amountInCents: 999, amountInDollars: '9.99' }"
echo ""
echo "Expected Results:"
echo "  ✓ Frontend displays: \$9.99 (999 cents / 100)"
echo "  ✓ Stripe Checkout shows: \$9.99 (999 cents)"
echo "  ✓ Database stores: 999 (cents)"
echo ""
