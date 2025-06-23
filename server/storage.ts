import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  subscriptions,
  apiUsage,
  licenseValidations,
  type User,
  type InsertUser,
  type LoginUser,
  type Subscription,
  type ApiUsage,
  type LicenseValidationLog,
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByLicenseKey(licenseKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  verifyPassword(email: string, password: string): Promise<User | undefined>;

  // License management
  generateLicenseKey(userId: number): Promise<string>;
  validateLicense(
    licenseKey: string,
    hardwareHash: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    valid: boolean;
    apiCallsLeft?: number;
    daysRemaining?: number;
    message?: string;
  }>;

  // Subscription management
  createSubscription(
    userId: number,
    plan: string,
    razorpayPaymentId: string,
    amount: number,
  ): Promise<void>;
  updateUserPlan(
    userId: number,
    plan: string,
    apiCallsLeft: number,
    expiryDate: Date,
  ): Promise<void>;

  // API usage tracking
  decrementApiCalls(userId: number): Promise<void>;
  trackApiUsage(
    userId: number,
    endpoint: string,
    creditsUsed: number,
  ): Promise<void>;
  getApiUsageHistory(userId: number, limit?: number): Promise<ApiUsage[]>;
  logLicenseValidation(
    userId: number,
    licenseKey: string,
    hardwareHash: string,
    success: boolean,
    apiCallsLeft?: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void>;

  // Dashboard data
  getDashboardStats(userId: number): Promise<{
    totalCalls: number;
    apiCallsLeft: number;
    plan: string;
    expiryDate: Date | null;
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
        api_calls_left INTEGER NOT NULL DEFAULT 0,
        total_calls INTEGER NOT NULL DEFAULT 0,
        license_key TEXT UNIQUE,
        expiry_date TIMESTAMP,
        razorpay_customer_id TEXT,
        hardware_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        plan TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        razorpay_subscription_id TEXT,
        razorpay_payment_id TEXT,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS api_usage (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        endpoint TEXT NOT NULL,
        credits_used INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS license_validations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        license_key TEXT NOT NULL,
        hardware_hash TEXT NOT NULL,
        success BOOLEAN NOT NULL,
        api_calls_left INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async getUserByLicenseKey(licenseKey: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.licenseKey, licenseKey))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

    const result = await db
      .insert(users)
      .values({
        email: insertUser.email,
        name: insertUser.name,
        password: hashedPassword,
      })
      .returning();

    return result[0];
  }

  async updateUser(
    id: number,
    updates: Partial<User>,
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return result[0];
  }

  async verifyPassword(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : undefined;
  }

  async generateLicenseKey(userId: number): Promise<string> {
    const licenseKey = `LIC-${nanoid(16).toUpperCase()}`;

    await db
      .update(users)
      .set({ licenseKey, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return licenseKey;
  }

  async validateLicense(
    licenseKey: string,
    hardwareHash: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    valid: boolean;
    apiCallsLeft?: number;
    daysRemaining?: number;
    message?: string;
  }> {
    const user = await this.getUserByLicenseKey(licenseKey);

    if (!user) {
      await this.logLicenseValidation(
        0,
        licenseKey,
        hardwareHash,
        false,
        undefined,
        ipAddress,
        userAgent,
      );
      return { valid: false, message: "Invalid license key" };
    }

    // Check if license has expired
    if (user.expiryDate && new Date() > user.expiryDate) {
      await this.logLicenseValidation(
        user.id,
        licenseKey,
        hardwareHash,
        false,
        user.apiCallsLeft,
        ipAddress,
        userAgent,
      );
      return { valid: false, message: "License expired" };
    }

    // Check if user has API calls left
    if (user.apiCallsLeft <= 0) {
      await this.logLicenseValidation(
        user.id,
        licenseKey,
        hardwareHash,
        false,
        user.apiCallsLeft,
        ipAddress,
        userAgent,
      );
      return { valid: false, message: "No API calls remaining" };
    }

    // Update hardware hash if different
    if (user.hardwareHash !== hardwareHash) {
      await this.updateUser(user.id, { hardwareHash });
    }

    // Decrement API calls
    await this.decrementApiCalls(user.id);

    const daysRemaining = user.expiryDate
      ? Math.max(
          0,
          Math.ceil(
            (user.expiryDate.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : null;

    await this.logLicenseValidation(
      user.id,
      licenseKey,
      hardwareHash,
      true,
      user.apiCallsLeft - 1,
      ipAddress,
      userAgent,
    );

    return {
      valid: true,
      apiCallsLeft: user.apiCallsLeft - 1,
      daysRemaining: daysRemaining || undefined,
    };
  }

  async createSubscription(
    userId: number,
    plan: string,
    razorpayPaymentId: string,
    amount: number,
  ): Promise<void> {
    const endDate =
      plan === "advanced"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month

    await db.insert(subscriptions).values({
      userId,
      plan,
      razorpayPaymentId,
      amount,
      endDate,
    });
  }

  async updateUserPlan(
    userId: number,
    plan: string,
    apiCallsLeft: number,
    expiryDate: Date,
  ): Promise<void> {
    await db
      .update(users)
      .set({
        plan,
        apiCallsLeft,
        expiryDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async decrementApiCalls(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        apiCallsLeft: sql`${users.apiCallsLeft} - 1`,
        totalCalls: sql`${users.totalCalls} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async trackApiUsage(
    userId: number,
    endpoint: string,
    creditsUsed: number,
  ): Promise<void> {
    await db.insert(apiUsage).values({
      userId,
      endpoint,
      creditsUsed,
    });
  }

  async getApiUsageHistory(userId: number, limit = 50): Promise<ApiUsage[]> {
    return await db
      .select()
      .from(apiUsage)
      .where(eq(apiUsage.userId, userId))
      .orderBy(desc(apiUsage.createdAt))
      .limit(limit);
  }

  async logLicenseValidation(
    userId: number,
    licenseKey: string,
    hardwareHash: string,
    success: boolean,
    apiCallsLeft?: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await db.insert(licenseValidations).values({
      userId,
      licenseKey,
      hardwareHash,
      success,
      apiCallsLeft,
      ipAddress,
      userAgent,
    });
  }

  async getDashboardStats(userId: number): Promise<{
    totalCalls: number;
    apiCallsLeft: number;
    plan: string;
    expiryDate: Date | null;
    recentUsage: ApiUsage[];
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const recentUsage = await this.getApiUsageHistory(userId, 10);

    return {
      totalCalls: user.totalCalls,
      apiCallsLeft: user.apiCallsLeft,
      plan: user.plan,
      expiryDate: user.expiryDate,
      recentUsage,
    };
  }
}

export const storage = new PostgresStorage();