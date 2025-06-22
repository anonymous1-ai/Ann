import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema, licenseValidationSchema } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Razorpay from "razorpay";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Pricing plans
const PRICING_PLANS = {
  free: { price: 0, apiCalls: 0, duration: 0 },
  'pro-monthly': { price: 800, apiCalls: 100, duration: 30 },
  'pro-yearly': { price: 9500, apiCalls: 1200, duration: 365 },
  'advanced-monthly': { price: 2000, apiCalls: 300, duration: 30 },
  'advanced-yearly': { price: 20000, apiCalls: 3600, duration: 365 }
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

  // Create payment order (backend-only, no Razorpay UI)
  app.post("/api/create-order", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { plan } = req.body;
      
      if (!PRICING_PLANS[plan as keyof typeof PRICING_PLANS]) {
        return res.status(400).json({ success: false, error: "Invalid plan" });
      }

      const planDetails = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
      
      // Create Razorpay order (backend only)
      const options = {
        amount: planDetails.price * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          plan: plan,
          userId: req.user.userId
        }
      };

      const order = await razorpay.orders.create(options);
      
      // Return payment link for seamless redirect with return URL
      const returnUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/payment-return`;
      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          plan,
          paymentUrl: `https://checkout.razorpay.com/v1/checkout.js?order_id=${order.id}&key_id=${process.env.VITE_RAZORPAY_KEY_ID}&callback_url=${encodeURIComponent(returnUrl)}`
        }
      });
    } catch (error: any) {
      console.error('Order creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to create payment order" 
      });
    }
  });

  // Create Razorpay order for API call top-up (₹9 per call)
  app.post("/api/create-topup-order", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { apiCalls } = req.body;
      const userId = req.user.userId;

      if (!apiCalls || apiCalls < 1 || apiCalls > 1000) {
        return res.status(400).json({ success: false, error: "Invalid API call count (1-1000)" });
      }

      const pricePerCall = 9; // ₹9 per API call
      const totalAmount = apiCalls * pricePerCall;

      const options = {
        amount: totalAmount * 100, // Convert to paise
        currency: "INR",
        receipt: `topup_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          type: 'topup',
          apiCalls: apiCalls.toString()
        }
      };

      const order = await razorpay.orders.create(options);
      
      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          apiCalls,
          pricePerCall,
          totalAmount
        }
      });
    } catch (error: any) {
      console.error('Create topup order error:', error);
      res.status(500).json({ success: false, error: "Failed to create topup payment order" });
    }
  });

  // Webhook handler for seamless payment verification
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

      // Handle subscription payments
      const planDetails = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
      if (!planDetails) {
        return res.status(400).json({ success: false, error: "Invalid plan" });
      }

      const expiryDate = new Date(Date.now() + planDetails.duration * 24 * 60 * 60 * 1000);

      // Generate UUID license key
      const licenseKey = uuidv4();

      // Update user plan and create subscription
      await storage.updateUserPlan(req.user.userId, plan, planDetails.apiCalls, expiryDate);
      await storage.createSubscription(req.user.userId, plan, paymentId, planDetails.price);
      
      // Store license key in user record (never expose to frontend)
      await storage.updateUser(req.user.userId, { licenseKey });

      // Return success without exposing license key
      res.json({
        success: true,
        data: {
          plan,
          apiCallsLeft: planDetails.apiCalls,
          expiryDate,
          message: "Subscription activated successfully"
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

  // Verify top-up payment
  app.post("/api/verify-topup-payment", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { orderId, paymentId, signature, apiCalls } = req.body;
      
      if (!orderId || !paymentId || !signature || !apiCalls) {
        return res.status(400).json({ success: false, error: "Missing payment details" });
      }

      // Verify payment signature
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, error: "Invalid payment signature" });
      }

      // Get current user
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      // Add API calls to user's account
      const newBalance = user.apiCallsLeft + parseInt(apiCalls);
      await storage.updateUser(req.user.userId, { apiCallsLeft: newBalance });

      // Track the top-up transaction
      await storage.trackApiUsage(req.user.userId, `topup-${apiCalls}`, -parseInt(apiCalls));

      res.json({ 
        success: true, 
        message: "Top-up successful",
        data: {
          addedCalls: parseInt(apiCalls),
          newBalance,
          totalPaid: parseInt(apiCalls) * 9
        }
      });
    } catch (error: any) {
      console.error('Top-up verification error:', error);
      res.status(500).json({ success: false, error: "Top-up verification failed" });
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

  // Check payment status for UPI payments
  app.post("/api/check-payment-status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ success: false, error: "Order ID required" });
      }

      // Check Razorpay order status
      const order = await razorpay.orders.fetch(orderId);
      
      res.json({
        success: true,
        status: order.status, // 'created', 'attempted', 'paid'
        orderId: order.id,
        amount: order.amount
      });
    } catch (error: any) {
      console.error('Payment status check error:', error);
      res.status(500).json({ success: false, error: "Failed to check payment status" });
    }
  });

  // Manual payment verification for UPI payments
  app.post("/api/manual-payment-verification", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { orderId, amount } = req.body;
      
      if (!orderId || !amount) {
        return res.status(400).json({ success: false, error: "Order ID and amount required" });
      }

      // Check if order exists and get plan details from order notes
      const order = await razorpay.orders.fetch(orderId);
      
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      // For manual verification, we'll mark as pending and notify admin
      // In production, you'd implement proper manual verification workflow
      res.json({
        success: true,
        message: "Payment verification request submitted. You'll be notified once verified.",
        status: 'pending_verification'
      });
    } catch (error: any) {
      console.error('Manual verification error:', error);
      res.status(500).json({ success: false, error: "Manual verification failed" });
    }
  });

  // Initiate bank transfer
  app.post("/api/initiate-bank-transfer", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { orderId, accountDetails, amount } = req.body;
      
      if (!orderId || !accountDetails || !amount) {
        return res.status(400).json({ success: false, error: "Missing required details" });
      }

      // Validate account details
      const { accountNumber, ifsc, accountHolder } = accountDetails;
      if (!accountNumber || !ifsc || !accountHolder) {
        return res.status(400).json({ success: false, error: "Complete bank details required" });
      }

      // Store bank transfer request in database (you'd need a new table for this)
      // For now, we'll just log it and return success
      console.log('Bank transfer request:', {
        orderId,
        userId: req.user.userId,
        accountDetails,
        amount,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: "Bank transfer request submitted successfully",
        transferId: `BT${Date.now()}`,
        status: 'pending'
      });
    } catch (error: any) {
      console.error('Bank transfer initiation error:', error);
      res.status(500).json({ success: false, error: "Failed to initiate bank transfer" });
    }
  });

  // Payment success return URL handler
  app.get("/api/payment-return", async (req, res) => {
    try {
      const { order_id, payment_id, signature } = req.query;
      
      if (!order_id || !payment_id || !signature) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/pricing?error=invalid_params`);
      }

      // Verify payment signature
      const body = order_id + "|" + payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/pricing?error=verification_failed`);
      }

      // Get order details to find user and plan
      const order = await razorpay.orders.fetch(order_id as string);
      const userId = order.notes?.userId;
      const plan = order.notes?.plan;

      if (!userId || !plan) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/pricing?error=missing_data`);
      }

      // Process subscription
      const planDetails = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
      if (!planDetails) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/pricing?error=invalid_plan`);
      }

      const expiryDate = new Date(Date.now() + planDetails.duration * 24 * 60 * 60 * 1000);
      const licenseKey = uuidv4();

      // Update user plan and create subscription
      const userIdNum = parseInt(userId as string);
      await storage.updateUserPlan(userIdNum, plan as string, planDetails.apiCalls, expiryDate);
      await storage.createSubscription(userIdNum, plan as string, payment_id as string, planDetails.price);
      await storage.updateUser(userIdNum, { licenseKey });

      // Redirect to success page
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/payment-success`);
    } catch (error: any) {
      console.error('Payment return handler error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/pricing?error=processing_failed`);
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "SaaS backend is running" });
  });

  const httpServer = createServer(app);
  return httpServer;
}