# 🔑 Keys Reference Card

Quick reference for all the keys you need to collect.

## 📋 Keys Checklist

### Supabase Keys
- [ ] **Project URL**: `https://your-project-id.supabase.co`
- [ ] **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Stripe Keys
- [ ] **Publishable Key**: `pk_test_...`
- [ ] **Secret Key**: `sk_test_...`
- [ ] **Pro Plan Price ID**: `price_...` ($10/month)
- [ ] **Advanced Plan Price ID**: `price_...` ($25/month)
- [ ] **Webhook Secret**: `whsec_...`

---

## 🎯 Where to Find Each Key

### Supabase Dashboard
**Location**: Settings → API
```
Project URL: https://your-project-id.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stripe Dashboard
**Location**: Developers → API Keys
```
Publishable Key: pk_test_...
Secret Key: sk_test_...
```

**Location**: Products → [Product Name] → Pricing
```
Pro Plan Price ID: price_... ($10/month)
Advanced Plan Price ID: price_... ($25/month)
```

**Location**: Developers → Webhooks → [Endpoint] → Signing Secret
```
Webhook Secret: whsec_...
```

---

## 💰 Pricing Structure

### Free Plan
- **Price**: $0/month
- **Credits**: 5 API calls
- **Features**: Basic analytics, Community support

### Pro Plan
- **Price**: $10/month
- **Credits**: 100 API calls
- **Features**: Advanced analytics, Priority support, License key generation

### Advanced Plan
- **Price**: $25/month
- **Credits**: 300 API calls
- **Features**: All Pro features + Custom integrations, Dedicated support, All features

---

## ⚙️ Environment Files

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRO_PRICE_ID=price_...
VITE_STRIPE_ADVANCED_PRICE_ID=price_...
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (server/.env)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ADVANCED_PRICE_ID=price_...
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

---

## 🚀 Quick Start Commands

```bash
# 1. Copy environment files
cp env.example .env
cd server && cp env.example .env

# 2. Install dependencies
npm install
cd server && npm install

# 3. Start servers
# Terminal 1 (Backend):
cd server && npm run dev

# Terminal 2 (Frontend):
npm run dev
```

---

## 🔍 Test Your Setup

1. **Visit**: `http://localhost:5173`
2. **Sign up** with test email
3. **Go to**: `/pricing`
4. **Test subscription** flow
5. **Check dashboard** analytics

---

## ⚠️ Important Notes

- **Never commit** `.env` files to git
- **Keep keys secure** and don't share them
- **Use test keys** for development
- **Switch to live keys** for production
- **Restart servers** after changing environment variables
- **Set currency to USD** in Stripe products
- **Verify webhook endpoint** is accessible

---

## 📞 Need Help?

- Check the **SETUP_GUIDE.md** for detailed instructions
- Review the **README.md** for project overview
- Check console for error messages
- Verify all keys are copied correctly 