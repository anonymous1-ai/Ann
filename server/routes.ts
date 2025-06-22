import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema, licenseValidationSchema } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Razorpay from "razorpay";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Pricing plans
const PRICING_PLANS = {
  free: { price: 0, apiCalls: 0, duration: 0 },
  'pro-monthly': { price: 800, apiCalls: 100, duration: 30 }, // ₹800/month, 100 API calls
  'pro-annual': { price: 9500, apiCalls: 1200, duration: 365 }, // ₹9500/year, 1200 API calls
  'advanced-monthly': { price: 2000, apiCalls: 300, duration: 30 }, // ₹2000/month, 300 API calls
  'advanced-annual': { price: 20000, apiCalls: 3600, duration: 365 } // ₹20000/year, 3600 API calls
};

// Rate limiting for license validation
const licenseValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: "Too many license validation attempts, try again later" }
});

// JWT middleware
interface AuthRequest extends Request {
  user?: any;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database
  await storage.initDatabase();

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: "An account with this email already exists. Please try signing in instead." 
        });
      }

      const user = await storage.createUser(validatedData);
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true, 
        data: { user: userWithoutPassword, token }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return res.status(400).json({ 
          success: false, 
          error: `Please check your input: ${fieldErrors}` 
        });
      }
      console.error('Signup error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Unable to create account. Please try again later." 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.verifyPassword(validatedData.email, validatedData.password);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid email or password. Please check your credentials and try again." 
        });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true, 
        data: { user: userWithoutPassword, token }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "Invalid input data" });
      }
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const { password, licenseKey, ...userWithoutSensitiveData } = user;
      res.json({ success: true, data: userWithoutSensitiveData });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // License validation API (used by .exe file)
  app.post("/api/validate-license", licenseValidationLimiter, async (req, res) => {
    try {
      const validatedData = licenseValidationSchema.parse(req.body);
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await storage.validateLicense(
        validatedData.licenseKey,
        validatedData.hardwareHash,
        ipAddress,
        userAgent
      );

      if (result.valid) {
        res.json({
          valid: true,
          apiCallsLeft: result.apiCallsLeft,
          daysRemaining: result.daysRemaining
        });
      } else {
        res.status(400).json({
          valid: false,
          message: result.message
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ valid: false, message: "Invalid request format" });
      }
      res.status(500).json({ valid: false, message: "Internal server error" });
    }
  });

  // Dashboard data API (JWT-protected)
  app.get("/api/user-dashboard", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Generate license key (JWT-protected)
  app.post("/api/generate-license", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      // Only generate license if user has a paid plan
      if (user.plan === 'free') {
        return res.status(400).json({ success: false, error: "License key requires a paid plan" });
      }

      const licenseKey = await storage.generateLicenseKey(req.user.userId);
      res.json({ success: true, data: { licenseKey } });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // API Top-up routes
  app.post("/api/create-topup-order", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { topupType, calls, price } = req.body;
      
      if (!topupType || !calls || !price) {
        return res.status(400).json({ success: false, error: "Invalid top-up parameters" });
      }

      // Mock Razorpay order creation for top-up
      const orderId = `topup_${Date.now()}`;
      
      res.json({
        success: true,
        data: {
          orderId,
          amount: price * 100, // Amount in paise
          currency: "INR",
          topupType,
          calls
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.post("/api/verify-topup-payment", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { orderId, paymentId, signature, topupType, calls } = req.body;
      
      // Mock payment verification (replace with actual Razorpay verification)
      const isPaymentValid = true;
      
      if (!isPaymentValid) {
        return res.status(400).json({ success: false, error: "Payment verification failed" });
      }

      // Get current user
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      // Add API calls to user's account
      const newBalance = user.apiCallsLeft + calls;
      await storage.updateUser(req.user.userId, { apiCallsLeft: newBalance });

      // Track the top-up as a transaction
      await storage.trackApiUsage(req.user.userId, `topup-${calls}`, -calls); // Negative to indicate credit

      res.json({
        success: true,
        data: {
          newBalance,
          addedCalls: calls,
          message: `Successfully added ${calls} API calls to your account`
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Razorpay payment routes
  app.post("/api/create-order", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { plan, amount, paymentMethod } = req.body;
      
      let orderAmount: number;
      let orderDescription: string;

      if (plan === 'custom-payment' || plan === 'topup-9') {
        // Handle ₹9 per call top-up
        orderAmount = amount || 900; // Default ₹9 in paise
        orderDescription = "API Credits - ₹9 per call";
      } else if (PRICING_PLANS[plan as keyof typeof PRICING_PLANS]) {
        // Handle subscription plans
        const planDetails = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
        orderAmount = planDetails.price * 100; // Convert to paise
        orderDescription = `${plan} subscription plan`;
      } else {
        return res.status(400).json({ success: false, error: "Invalid plan" });
      }

      // Create Razorpay order
      const options = {
        amount: orderAmount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          plan: plan,
          userId: req.user.userId,
          paymentMethod: paymentMethod || 'card'
        }
      };

      const order = await razorpay.orders.create(options);
      
      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          plan
        }
      });
    } catch (error: any) {
      console.error('Razorpay order creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to create payment order" 
      });
    }
  });

  app.post("/api/verify-payment", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { orderId, paymentId, signature, plan } = req.body;
      
      // Verify Razorpay payment signature
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

      const isPaymentValid = expectedSignature === signature;
      
      if (!isPaymentValid) {
        return res.status(400).json({ success: false, error: "Payment verification failed" });
      }

      // Handle top-up payments
      if (plan === 'custom-payment' || plan === 'topup-9') {
        // Get payment details from Razorpay to determine amount
        const payment = await razorpay.payments.fetch(paymentId);
        const paymentAmount = payment.amount as number;
        const amountInRupees = paymentAmount / 100;
        const creditsToAdd = Math.floor(amountInRupees / 9); // ₹9 per credit

        // Get current user
        const user = await storage.getUser(req.user.userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "User not found" });
        }

        // Add API calls to user's account
        const newBalance = user.apiCallsLeft + creditsToAdd;
        await storage.updateUser(req.user.userId, { apiCallsLeft: newBalance });

        // Track the top-up transaction
        await storage.trackApiUsage(req.user.userId, `topup-${creditsToAdd}`, -creditsToAdd);

        return res.json({
          success: true,
          data: {
            newBalance,
            addedCalls: creditsToAdd,
            amountPaid: amountInRupees,
            message: `Successfully added ${creditsToAdd} API calls to your account`
          }
        });
      }

      // Handle subscription payments
      const planDetails = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
      if (!planDetails) {
        return res.status(400).json({ success: false, error: "Invalid plan" });
      }

      const expiryDate = new Date(Date.now() + planDetails.duration * 24 * 60 * 60 * 1000);

      // Update user plan and create subscription
      await storage.updateUserPlan(req.user.userId, plan, planDetails.apiCalls, expiryDate);
      await storage.createSubscription(req.user.userId, plan, paymentId, planDetails.price);

      // Generate license key for paid plans
      let licenseKey = null;
      if (plan !== 'free') {
        licenseKey = await storage.generateLicenseKey(req.user.userId);
      }

      res.json({
        success: true,
        data: {
          plan,
          apiCallsLeft: planDetails.apiCalls,
          expiryDate,
          licenseKey
        }
      });
    } catch (error: any) {
      console.error('Payment verification error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Payment verification failed" 
      });
    }
  });

  // Download route (public)
  app.get("/api/download", (req, res) => {
    // In a real implementation, this would serve the actual .exe file
    res.json({
      success: true,
      message: "Download link would be provided here",
      downloadUrl: "/downloads/ai-tool.exe" // Mock download URL
    });
  });

  // API usage tracking (for internal use)
  app.post("/api/track-usage", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { endpoint, creditsUsed } = req.body;
      await storage.trackApiUsage(req.user.userId, endpoint, creditsUsed);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Get user's API usage history
  app.get("/api/usage-history", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const usage = await storage.getApiUsageHistory(req.user.userId, limit);
      res.json({ success: true, data: usage });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "SaaS backend is running" });
  });

  const httpServer = createServer(app);
  return httpServer;
}