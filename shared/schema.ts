import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  plan: text("plan").notNull().default("free"), // free, pro, advanced
  apiCallsLeft: integer("api_calls_left").notNull().default(0),
  totalCalls: integer("total_calls").notNull().default(0),
  licenseKey: text("license_key").unique(),
  expiryDate: timestamp("expiry_date"),
  razorpayCustomerId: text("razorpay_customer_id"),
  hardwareHash: text("hardware_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plan: text("plan").notNull(), // pro, advanced
  status: text("status").notNull().default("active"), // active, cancelled, expired
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  creditsUsed: integer("credits_used").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// License validation logs
export const licenseValidations = pgTable("license_validations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  licenseKey: text("license_key").notNull(),
  hardwareHash: text("hardware_hash").notNull(),
  success: boolean("success").notNull(),
  apiCallsLeft: integer("api_calls_left"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  password: true,
});

export const loginUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const licenseValidationSchema = z.object({
  licenseKey: z.string().min(1, "License key is required"),
  hardwareHash: z.string().min(1, "Hardware hash is required"),
});

export const razorpayWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        amount: z.number(),
        currency: z.string(),
        status: z.string(),
        notes: z.object({
          userId: z.string(),
          plan: z.string(),
        }),
      }),
    }),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type LicenseValidation = z.infer<typeof licenseValidationSchema>;
export type User = typeof users.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type LicenseValidationLog = typeof licenseValidations.$inferSelect;
