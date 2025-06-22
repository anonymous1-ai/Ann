import { PlanType } from './stripe';

// Define types to match our PostgreSQL schema
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
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
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

  async signup(credentials: SignupCredentials): Promise<User> {
    const response = await this.request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Signup failed');
    }

    // Store the token for authenticated requests
    localStorage.setItem('token', response.data.token);
    
    return response.data.user;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed');
    }

    // Store the token for authenticated requests
    localStorage.setItem('token', response.data.token);
    
    return response.data.user;
  }

  async logout(): Promise<void> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    // Clear the token regardless of response
    localStorage.removeItem('token');

    if (!response.success) {
      throw new Error(response.error || 'Logout failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<User>('/auth/me');
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<{ sessionId: string }> {
    const response = await this.request<{ sessionId: string }>('/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create checkout session');
    }

    return response.data;
  }

  async createPortalSession(): Promise<{ url: string }> {
    const response = await this.request<{ url: string }>('/stripe/create-portal-session', {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create portal session');
    }

    return response.data;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await this.request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update profile');
    }

    return response.data;
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const response = await this.request<Subscription>(`/users/${userId}/subscription`);
    return response.success && response.data ? response.data : null;
  }

  async trackApiUsage(userId: string, endpoint: string, creditsUsed: number): Promise<void> {
    await this.request('/api-usage', {
      method: 'POST',
      body: JSON.stringify({ userId, endpoint, creditsUsed }),
    });
  }

  async getApiUsageHistory(userId: string, limit = 50): Promise<ApiUsage[]> {
    const response = await this.request<ApiUsage[]>(`/users/${userId}/api-usage?limit=${limit}`);
    return response.success && response.data ? response.data : [];
  }

  async generateLicenseKey(userId: string): Promise<{ licenseKey: string }> {
    const response = await this.request<{ licenseKey: string }>(`/users/${userId}/license`, {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate license key');
    }

    return response.data;
  }

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
    }>(`/users/${userId}/dashboard-stats`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get dashboard stats');
    }

    return response.data;
  }
}

export const apiService = new ApiService();
export type { User, ApiUsage, Subscription };