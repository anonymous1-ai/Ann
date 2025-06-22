-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'advanced')),
    api_credits INTEGER DEFAULT 5,
    total_calls INTEGER DEFAULT 0,
    stripe_customer_id TEXT,
    license_key TEXT UNIQUE,
    CONSTRAINT valid_credits CHECK (api_credits >= 0),
    CONSTRAINT valid_calls CHECK (total_calls >= 0)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    plan TEXT NOT NULL CHECK (plan IN ('pro', 'advanced')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    endpoint TEXT NOT NULL,
    credits_used INTEGER NOT NULL CHECK (credits_used > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions table policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- API usage table policies
CREATE POLICY "Users can view own API usage" ON api_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API usage" ON api_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment/decrement values
CREATE OR REPLACE FUNCTION increment(row_id UUID, x INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN x;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement(row_id UUID, x INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN x;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to validate license key format
CREATE OR REPLACE FUNCTION validate_license_key()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if license key follows the format: SL-{timestamp}-{random}-{hash}
    IF NEW.license_key IS NOT NULL AND NEW.license_key !~ '^SL-[a-zA-Z0-9]+-[a-fA-F0-9]{16}-[a-fA-F0-9]{8}$' THEN
        RAISE EXCEPTION 'Invalid license key format';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for license key validation
CREATE TRIGGER validate_license_key_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION validate_license_key();

-- Create function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_calls BIGINT,
    remaining_credits INTEGER,
    plan TEXT,
    subscription_status TEXT,
    usage_this_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.total_calls,
        u.api_credits,
        u.plan,
        s.status,
        COALESCE(SUM(au.credits_used), 0)
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
    LEFT JOIN api_usage au ON u.id = au.user_id 
        AND au.created_at >= date_trunc('month', CURRENT_DATE)
    WHERE u.id = user_uuid
    GROUP BY u.total_calls, u.api_credits, u.plan, s.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 