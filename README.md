# SilentlyAI - Code Whisper Stealth

A comprehensive AI-powered code generation platform with authentication, payment integration, and license management.

## Features

- 🔐 **Supabase Authentication** - Secure user registration and login
- 💳 **Stripe Payment Integration** - Subscription management with Pro and Advanced plans
- 📊 **Dashboard Analytics** - Real-time usage tracking and statistics
- 🔑 **License Key Generation** - Automatic license key generation for paid subscribers
- 📈 **API Usage Tracking** - Monitor API calls and credit consumption
- 🎨 **Modern UI** - Built with React, TypeScript, and Tailwind CSS
- 🚀 **Backend API** - Express.js server with comprehensive endpoints

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- React Router for navigation
- React Query for data fetching
- Sonner for notifications

### Backend
- Express.js with TypeScript
- Supabase for database and authentication
- Stripe for payment processing
- Winston for logging
- Helmet for security
- Rate limiting and CORS

### Database
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Real-time subscriptions

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd code-whisper-stealth
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Run the database schema:

```sql
-- Copy and paste the contents of database/schema.sql into your Supabase SQL editor
```

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create two products with recurring pricing:
   - Pro Plan: $29/month
   - Advanced Plan: $99/month
3. Note down the price IDs for each plan

### 4. Environment Configuration

#### Frontend (.env)
```bash
cp env.example .env
```

Fill in your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRO_PRICE_ID=price_your_pro_plan_id
VITE_STRIPE_ADVANCED_PRICE_ID=price_your_advanced_plan_id
VITE_API_BASE_URL=http://localhost:3001
```

#### Backend (server/.env)
```bash
cd server
cp env.example .env
```

Fill in your environment variables:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=price_your_pro_plan_id
STRIPE_ADVANCED_PRICE_ID=price_your_advanced_plan_id
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

### 5. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd server
npm install
```

### 6. Set Up Stripe Webhooks

1. In your Stripe dashboard, go to Developers > Webhooks
2. Add endpoint: `http://localhost:3001/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to your backend `.env`

### 7. Start Development Servers

#### Backend (Terminal 1)
```bash
cd server
npm run dev
```

#### Frontend (Terminal 2)
```bash
npm run dev
```

Visit `http://localhost:5173` to see your application!

## Project Structure

```
code-whisper-stealth/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard and analytics
│   │   ├── payment/        # Payment and subscription components
│   │   └── ui/            # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries and configurations
│   ├── pages/             # Page components
│   └── main.tsx          # Application entry point
├── server/                # Backend Express server
│   ├── index.js          # Main server file
│   └── package.json      # Backend dependencies
├── database/
│   └── schema.sql        # Database schema
└── public/               # Static assets
```

## API Endpoints

### Authentication
- `POST /api/health` - Health check
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/create-portal-session` - Create customer portal session
- `POST /api/generate-license` - Generate license key
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Database Schema

### Users Table
- `id` - UUID (references auth.users)
- `email` - User email
- `name` - User display name
- `plan` - Subscription plan (free/pro/advanced)
- `api_credits` - Available API credits
- `total_calls` - Total API calls made
- `stripe_customer_id` - Stripe customer ID
- `license_key` - Generated license key

### Subscriptions Table
- `id` - UUID
- `user_id` - User ID
- `stripe_subscription_id` - Stripe subscription ID
- `status` - Subscription status
- `plan` - Plan type
- `current_period_start/end` - Billing period

### API Usage Table
- `id` - UUID
- `user_id` - User ID
- `endpoint` - API endpoint called
- `credits_used` - Credits consumed
- `created_at` - Timestamp

## Features in Detail

### Authentication Flow
1. User signs up with email/password
2. Supabase creates auth user and triggers profile creation
3. User profile is created in the `users` table
4. JWT tokens are used for API authentication

### Payment Integration
1. User selects a plan on the frontend
2. Frontend calls backend to create Stripe checkout session
3. User is redirected to Stripe checkout
4. On successful payment, Stripe webhook updates user plan
5. User gets access to paid features and license key generation

### License Key Generation
- Only available for paid subscribers
- Keys follow format: `SL-{timestamp}-{random}-{hash}`
- Automatically generated when user subscribes
- Can be downloaded and used with your .exe application

### Usage Tracking
- All API calls are logged with endpoint and credit usage
- Real-time dashboard shows usage statistics
- Monthly usage tracking for billing periods
- Credit consumption monitoring

## Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in your hosting platform

### Backend (Railway/Render)
1. Deploy the `server` folder
2. Set environment variables
3. Configure Stripe webhook URL to your production domain

### Database (Supabase)
- Supabase handles hosting and scaling
- Enable Row Level Security for production
- Set up proper backup strategies

## Security Considerations

- All API endpoints are protected with JWT authentication
- Row Level Security (RLS) ensures users can only access their data
- Rate limiting prevents abuse
- CORS is configured for security
- Environment variables are used for sensitive data
- Stripe webhooks are verified with signatures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## Roadmap

- [ ] Email notifications for subscription events
- [ ] Advanced analytics and reporting
- [ ] Team management features
- [ ] API rate limiting per user
- [ ] Integration with more payment providers
- [ ] Mobile app development
