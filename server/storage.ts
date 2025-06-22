import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, subscriptions, apiUsage, type User, type InsertUser, type LoginUser, type Subscription, type ApiUsage } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

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
  initDatabase(): Promise<void>;
}

export class PostgresStorage implements IStorage {
  async initDatabase(): Promise<void> {
    // Create tables if they don't exist
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        plan TEXT NOT NULL DEFAULT 'free',
        api_credits INTEGER NOT NULL DEFAULT 5,
        total_calls INTEGER NOT NULL DEFAULT 0,
        license_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS api_usage (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        credits_used INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await client`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users
    `;

    await client`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `;

    await client`
      DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions
    `;

    await client`
      CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `;
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      plan: "free",
      apiCredits: 5,
      totalCalls: 0,
    }).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
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
    // Insert usage record
    await db.insert(apiUsage).values({
      userId,
      endpoint,
      creditsUsed,
    });

    // Update user's total calls and remaining credits
    await db.update(users)
      .set({
        totalCalls: sql`total_calls + 1`,
        apiCredits: sql`GREATEST(0, api_credits - ${creditsUsed})`,
      })
      .where(eq(users.id, userId));
  }

  async getApiUsageHistory(userId: number, limit = 50): Promise<ApiUsage[]> {
    const result = await db.select()
      .from(apiUsage)
      .where(eq(apiUsage.userId, userId))
      .orderBy(desc(apiUsage.createdAt))
      .limit(limit);
    return result;
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

export const storage = new PostgresStorage();
