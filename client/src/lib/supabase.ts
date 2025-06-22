import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
          plan: 'free' | 'pro' | 'advanced';
          api_credits: number;
          total_calls: number;
          stripe_customer_id?: string;
          license_key?: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          plan?: 'free' | 'pro' | 'advanced';
          api_credits?: number;
          total_calls?: number;
          stripe_customer_id?: string;
          license_key?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          plan?: 'free' | 'pro' | 'advanced';
          api_credits?: number;
          total_calls?: number;
          stripe_customer_id?: string;
          license_key?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          status: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan: 'pro' | 'advanced';
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan: 'pro' | 'advanced';
          current_period_start: string;
          current_period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan?: 'pro' | 'advanced';
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_usage: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          credits_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          credits_used: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          credits_used?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type ApiUsage = Database['public']['Tables']['api_usage']['Row']; 