# SaaS Pricing Structure Summary

## Updated Pricing Plans

### Free Plan
- **Price:** ₹0
- **API Calls:** 0
- **Billing:** One-time
- **Features:** Download access only, tool remains inactive

### Pro Plans

#### Pro Monthly
- **Price:** ₹800/month
- **API Calls:** 100 per month
- **Billing:** Monthly recurring
- **Plan ID:** `pro-monthly`

#### Pro Annual
- **Price:** ₹9,500/year
- **API Calls:** 1,200 per year (100/month)
- **Billing:** Annual
- **Savings:** ₹1,100 (11% discount vs monthly)
- **Plan ID:** `pro-annual`

### Advanced Plans

#### Advanced Monthly
- **Price:** ₹2,000/month
- **API Calls:** 300 per month
- **Billing:** Monthly recurring
- **Plan ID:** `advanced-monthly`

#### Advanced Annual
- **Price:** ₹20,000/year
- **API Calls:** 3,600 per year (300/month)
- **Billing:** Annual
- **Savings:** ₹4,000 (17% discount vs monthly)
- **Plan ID:** `advanced-annual`

## Value Comparison

### Monthly vs Annual Savings

#### Pro Plans
- Monthly: ₹800 × 12 = ₹9,600/year
- Annual: ₹9,500/year
- **Savings: ₹1,100 (11.5% discount)**

#### Advanced Plans
- Monthly: ₹2,000 × 12 = ₹24,000/year
- Annual: ₹20,000/year
- **Savings: ₹4,000 (16.7% discount)**

## API Call Economics

### Cost per API Call

#### Pro Plans
- Pro Monthly: ₹8.00 per API call
- Pro Annual: ₹7.92 per API call

#### Advanced Plans
- Advanced Monthly: ₹6.67 per API call
- Advanced Annual: ₹5.56 per API call

### Best Value
- **Most API calls per rupee:** Advanced Annual (₹5.56 per call)
- **Best monthly option:** Advanced Monthly (₹6.67 per call)
- **Entry-level annual:** Pro Annual (₹7.92 per call)

## Implementation Details

### Backend Configuration
All pricing plans are configured in `server/routes.ts`:

```javascript
const PRICING_PLANS = {
  free: { price: 0, apiCalls: 0, duration: 0 },
  'pro-monthly': { price: 800, apiCalls: 100, duration: 30 },
  'pro-annual': { price: 9500, apiCalls: 1200, duration: 365 },
  'advanced-monthly': { price: 2000, apiCalls: 300, duration: 30 },
  'advanced-annual': { price: 20000, apiCalls: 3600, duration: 365 }
};
```

### Frontend Display
The pricing page displays all 5 options with:
- Clear monthly vs annual differentiation
- Savings badges for annual plans
- "Most Popular" highlighting for Pro Annual
- Feature comparisons and limitations

### Database Storage
User plans are stored with the exact plan ID:
- `free`
- `pro-monthly`
- `pro-annual`
- `advanced-monthly`
- `advanced-annual`

## License Validation Logic

### Plan Recognition
The license validation system recognizes all plan types and provides appropriate API call limits based on the specific plan subscribed.

### API Call Tracking
- Monthly plans: Reset on monthly anniversary
- Annual plans: Distributed across 12 months or available as pool
- Free plans: Always 0 API calls available

## Razorpay Integration

### Order Creation
Each plan creates orders with correct amounts in paise:
- Pro Monthly: 80,000 paise (₹800)
- Pro Annual: 950,000 paise (₹9,500)
- Advanced Monthly: 200,000 paise (₹2,000)
- Advanced Annual: 2,000,000 paise (₹20,000)

### Payment Verification
Upon successful payment, users receive:
1. Plan activation
2. API call allocation
3. License key generation (for paid plans)
4. Expiry date setting

## Customer Benefits

### Annual Plan Advantages
1. **Significant cost savings** (11-17% discount)
2. **Simplified billing** (once per year)
3. **Guaranteed pricing** (protected from price increases)
4. **Full year allocation** (no monthly usage pressure)

### Plan Upgrade Path
1. Start with Pro Monthly to test
2. Upgrade to Pro Annual for savings
3. Scale to Advanced plans for higher usage
4. Choose annual for maximum value

## Competitive Positioning

### Market Strategy
- **Free tier:** Attracts users to try the tool
- **Pro plans:** Targets individual developers and small teams
- **Advanced plans:** Serves businesses and power users
- **Annual discounts:** Encourages long-term commitment
- **Clear pricing:** No hidden fees or complex calculations