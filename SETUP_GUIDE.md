# 🚀 SilentlyAI Setup Guide

Complete step-by-step guide to get all required keys and set up your project.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- A web browser
- Credit card (for Stripe verification)

---

## 🔑 Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. **Visit [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign in/Sign up** with GitHub or Google
4. **Create New Project**:
   - **Organization**: Select or create one
   - **Name**: `silentlyai` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient to start

### 1.2 Get Your Supabase Keys

1. **In your Supabase dashboard**, go to **Settings** → **API**
2. **Copy these values**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Click "New Query"**
3. **Copy the entire content** from `database/schema.sql`
4. **Paste and click "Run"**
5. **Verify tables created** by going to **Table Editor**

---

## 💳 Step 2: Stripe Setup

### 2.1 Create Stripe Account

1. **Visit [stripe.com](https://stripe.com)**
2. **Click "Start now"**
3. **Sign up** with your email
4. **Complete business verification** (required for payments)

### 2.2 Get Stripe API Keys

1. **In Stripe Dashboard**, go to **Developers** → **API Keys**
2. **Copy these values**:
   - **Publishable Key**: `pk_test_...` (starts with pk_test_)
   - **Secret Key**: `sk_test_...` (starts with sk_test_)

### 2.3 Create Products & Prices

#### Create Pro Plan:
1. **Go to Products** → **Add Product**
2. **Product Name**: `Pro Plan`
3. **Pricing**:
   - **Price**: `$10.00`
   - **Currency**: `USD (US Dollar)`
   - **Billing**: `Recurring`
   - **Billing period**: `Monthly`
4. **Click "Save product"**
5. **Copy the Price ID**: `price_...` (starts with price_)

#### Create Advanced Plan:
1. **Go to Products** → **Add Product**
2. **Product Name**: `Advanced Plan`
3. **Pricing**:
   - **Price**: `$25.00`
   - **Currency**: `USD (US Dollar)`
   - **Billing**: `Recurring`
   - **Billing period**: `Monthly`
4. **Click "Save product"**
5. **Copy the Price ID**: `price_...` (starts with price_)

### 2.4 Set Up Webhooks

1. **Go to Developers** → **Webhooks**
2. **Click "Add endpoint"**
3. **Endpoint URL**: `http://localhost:3001/api/webhooks/stripe`
4. **Events to send** (select these):
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. **Click "Add endpoint"**
6. **Copy the Webhook Signing Secret**: `whsec_...` (starts with whsec_)

---

## ⚙️ Step 3: Environment Configuration

### 3.1 Frontend Environment

1. **In your project root**, copy the example file:
   ```bash
   cp env.example .env
   ```

2. **Edit `.env`** and fill in your values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   VITE_STRIPE_PRO_PRICE_ID=price_...
   VITE_STRIPE_ADVANCED_PRICE_ID=price_...
   VITE_API_BASE_URL=http://localhost:3001
   ```

### 3.2 Backend Environment

1. **Navigate to server folder**:
   ```bash
   cd server
   ```

2. **Copy the example file**:
   ```bash
   cp env.example .env
   ```

3. **Edit `server/.env`** and fill in your values:
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

## 🚀 Step 4: Start Development

### 4.1 Install Dependencies

**Frontend** (in project root):
```bash
npm install
```

**Backend** (in server folder):
```bash
cd server
npm install
```

### 4.2 Start Servers

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```

### 4.3 Test Your Setup

1. **Visit**: `http://localhost:5173`
2. **Sign up** with a test email
3. **Go to pricing page** and test subscription flow
4. **Check dashboard** for analytics

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

## 🔍 Troubleshooting

### Common Issues:

#### "Missing Supabase environment variables"
- ✅ Check your `.env` file exists
- ✅ Verify all Supabase keys are copied correctly
- ✅ Restart your development server

#### "Stripe checkout not working"
- ✅ Verify Stripe keys are correct
- ✅ Check webhook endpoint is accessible
- ✅ Ensure price IDs match your Stripe products
- ✅ Verify currency is set to USD

#### "Database connection failed"
- ✅ Verify Supabase URL is correct
- ✅ Check if database schema was applied
- ✅ Ensure service role key has proper permissions

#### "Webhook signature verification failed"
- ✅ Verify webhook secret is correct
- ✅ Check webhook endpoint URL
- ✅ Ensure webhook events are selected

---

## 📱 Production Deployment

### Frontend (Vercel/Netlify):
1. **Build**: `npm run build`
2. **Deploy** the `dist` folder
3. **Set environment variables** in your hosting platform

### Backend (Railway/Render):
1. **Deploy** the `server` folder
2. **Set environment variables**
3. **Update webhook URL** to your production domain

### Database (Supabase):
- ✅ Supabase handles hosting automatically
- ✅ Enable Row Level Security for production
- ✅ Set up proper backup strategies

---

## 🔐 Security Checklist

- ✅ Environment variables are set
- ✅ API keys are kept secret
- ✅ Webhook signatures are verified
- ✅ Row Level Security is enabled
- ✅ Rate limiting is configured
- ✅ CORS is properly set up

---

## 📞 Need Help?

If you encounter issues:

1. **Check the console** for error messages
2. **Verify all keys** are copied correctly
3. **Restart servers** after environment changes
4. **Check network connectivity**
5. **Review the README.md** for additional details

---

## 🎉 You're Ready!

Your SilentlyAI project is now configured with:
- ✅ Supabase authentication
- ✅ Stripe payment processing (USD)
- ✅ License key generation
- ✅ Usage tracking
- ✅ Dashboard analytics
- ✅ USD pricing structure

Start building your amazing AI-powered application! 🚀 