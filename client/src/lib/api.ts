import { PlanType } from './stripe';

// Import types from shared schema
interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  apiCredits: number;
  totalCalls: number;
  licenseKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiUsage {
  id: number;
  userId: number;
  endpoint: string;
  creditsUsed: number;
  createdAt: Date;
}

interface Subscription {
  id: number;
  userId: number;
  plan: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  // Authentication methods
  async signup(credentials: SignupCredentials): Promise<User> {
    const response = await this.request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Signup failed');
    }

    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed');
    }

    return response.data;
  }

  async logout(): Promise<void> {
    const response = await this.request<void>('/auth/logout', {
      method: 'POST',
    });

    if (!response.success) {
      throw new Error(response.error || 'Logout failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await this.request<User | null>('/auth/me');

    if (!response.success) {
      console.error('Error getting current user:', response.error);
      return null;
    }

    return response.data || null;
  }

  // Payment methods
  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<{ sessionId: string }> {
    const response = await this.request<{ sessionId: string }>('/payment/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create checkout session');
    }

    return response.data;
  }

  async createPortalSession(): Promise<{ url: string }> {
    const response = await this.request<{ url: string }>('/payment/create-portal-session', {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create portal session');
    }

    return response.data;
  }

  // User management
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update user profile');
    }

    return response.data;
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    // Mock subscription for demo - can be implemented later
    return null;
  }

  // API usage tracking
  async trackApiUsage(userId: string, endpoint: string, creditsUsed: number): Promise<void> {
    const response = await this.request<void>(`/users/${userId}/usage`, {
      method: 'POST',
      body: JSON.stringify({ endpoint, creditsUsed }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to track API usage');
    }
  }

  async getApiUsageHistory(userId: string, limit = 50): Promise<ApiUsage[]> {
    const response = await this.request<ApiUsage[]>(`/users/${userId}/usage?limit=${limit}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get API usage history');
    }

    return response.data || [];
  }

  // License key generation
  async generateLicenseKey(userId: string): Promise<{ licenseKey: string }> {
    const response = await this.request<{ licenseKey: string }>(`/users/${userId}/license`, {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate license key');
    }

    return response.data;
  }

  // Dashboard analytics
  async getDashboardStats(userId: string): Promise<{
    totalCalls: number;
    remainingCredits: number;
    plan: string;
    recentUsage: ApiUsage[];
  }> {
    const response = await this.request<{
      totalCalls: number;
      remainingCredits: number;
      plan: string;
      recentUsage: ApiUsage[];
    }>(`/users/${userId}/stats`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get dashboard stats');
    }

    return response.data;
  }
}

export const apiService = new ApiService(); 