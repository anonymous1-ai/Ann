import { supabase } from './supabase';
import { User, ApiUsage, Subscription } from './supabase';
import { PlanType } from './stripe';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface CreateCheckoutSessionRequest {
  plan: PlanType;
  successUrl: string;
  cancelUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  // Authentication methods
  async signup(credentials: SignupCredentials): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registration failed');

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: credentials.email,
          name: credentials.name,
          plan: 'free',
          api_credits: 5,
          total_calls: 0,
        })
        .select()
        .single();

      if (profileError) throw profileError;
      return profile;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup failed');
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;
      return profile;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Logout failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return null;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      return profile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Payment methods (using mock for demo)
  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<{ sessionId: string }> {
    // Mock payment session for demo
    return { sessionId: `mock_session_${Date.now()}` };
  }

  async createPortalSession(): Promise<{ url: string }> {
    // Mock portal session for demo
    return { url: '/dashboard' };
  }

  // User management
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  // API usage tracking
  async trackApiUsage(userId: string, endpoint: string, creditsUsed: number): Promise<void> {
    const { error } = await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        endpoint,
        credits_used: creditsUsed,
      });

    if (error) throw new Error(error.message);

    // Update user's total calls and credits
    const { error: updateError } = await supabase
      .from('users')
      .update({
        total_calls: supabase.rpc('increment', { row_id: userId, x: 1 }),
        api_credits: supabase.rpc('decrement', { row_id: userId, x: creditsUsed }),
      })
      .eq('id', userId);

    if (updateError) throw new Error(updateError.message);
  }

  async getApiUsageHistory(userId: string, limit = 50): Promise<ApiUsage[]> {
    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }

  // License key generation
  async generateLicenseKey(userId: string): Promise<{ licenseKey: string }> {
    const licenseKey = `LIC-${Math.random().toString(36).substring(2, 18).toUpperCase()}`;
    
    const { error } = await supabase
      .from('users')
      .update({ license_key: licenseKey })
      .eq('id', userId);

    if (error) throw new Error(error.message);
    return { licenseKey };
  }

  // Dashboard analytics
  async getDashboardStats(userId: string): Promise<{
    totalCalls: number;
    remainingCredits: number;
    plan: string;
    subscriptionStatus?: string;
    usageThisMonth: number;
  }> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('total_calls, api_credits, plan')
      .eq('id', userId)
      .single();

    if (userError) throw new Error(userError.message);

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    // Get usage for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyUsage, error: usageError } = await supabase
      .from('api_usage')
      .select('credits_used')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (usageError) throw new Error(usageError.message);

    const usageThisMonth = monthlyUsage?.reduce((sum: number, usage: any) => sum + usage.credits_used, 0) || 0;

    return {
      totalCalls: user.total_calls,
      remainingCredits: user.api_credits,
      plan: user.plan,
      subscriptionStatus: subscription?.status,
      usageThisMonth,
    };
  }
}

export const apiService = new ApiService(); 