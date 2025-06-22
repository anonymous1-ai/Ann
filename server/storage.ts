import { users, type User, type InsertUser, type LoginUser, type Subscription, type ApiUsage } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  verifyPassword(email: string, password: string): Promise<User | undefined>;
  generateLicenseKey(userId: number): Promise<string>;
  updateCredits(userId: number, credits: number): Promise<void>;
  trackApiUsage(userId: number, endpoint: string, creditsUsed: number): Promise<void>;
  getApiUsageHistory(userId: number, limit?: number): Promise<ApiUsage[]>;
  getDashboardStats(userId: number): Promise<{
    totalCalls: number;
    remainingCredits: number;
    plan: string;
    recentUsage: ApiUsage[];
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiUsageLog: Map<number, ApiUsage[]>;
  currentId: number;
  currentUsageId: number;

  constructor() {
    this.users = new Map();
    this.apiUsageLog = new Map();
    this.currentId = 1;
    this.currentUsageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      plan: "free",
      apiCredits: 5,
      totalCalls: 0,
      licenseKey: null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    this.apiUsageLog.set(id, []);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async verifyPassword(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  }

  async generateLicenseKey(userId: number): Promise<string> {
    const licenseKey = `LIC-${nanoid(16).toUpperCase()}`;
    await this.updateUser(userId, { licenseKey });
    return licenseKey;
  }

  async updateCredits(userId: number, credits: number): Promise<void> {
    await this.updateUser(userId, { apiCredits: credits });
  }

  async trackApiUsage(userId: number, endpoint: string, creditsUsed: number): Promise<void> {
    const usage: ApiUsage = {
      id: this.currentUsageId++,
      userId,
      endpoint,
      creditsUsed,
      createdAt: new Date()
    };

    const userUsage = this.apiUsageLog.get(userId) || [];
    userUsage.push(usage);
    this.apiUsageLog.set(userId, userUsage);

    // Update user's total calls and remaining credits
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUser(userId, {
        totalCalls: user.totalCalls + 1,
        apiCredits: Math.max(0, user.apiCredits - creditsUsed)
      });
    }
  }

  async getApiUsageHistory(userId: number, limit = 50): Promise<ApiUsage[]> {
    const userUsage = this.apiUsageLog.get(userId) || [];
    return userUsage.slice(-limit).reverse();
  }

  async getDashboardStats(userId: number): Promise<{
    totalCalls: number;
    remainingCredits: number;
    plan: string;
    recentUsage: ApiUsage[];
  }> {
    const user = await this.getUser(userId);
    const recentUsage = await this.getApiUsageHistory(userId, 5);
    
    return {
      totalCalls: user?.totalCalls || 0,
      remainingCredits: user?.apiCredits || 0,
      plan: user?.plan || "free",
      recentUsage
    };
  }
}

export const storage = new MemStorage();
