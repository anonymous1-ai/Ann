import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ success: false, error: "User already exists" });
      }

      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "Invalid input data" });
      }
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.verifyPassword(validatedData.email, validatedData.password);
      if (!user) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "Invalid input data" });
      }
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    // For demo purposes, return first user if exists
    const users = Array.from((storage as any).users.values());
    if (users.length > 0) {
      const user = users[0] as any;
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, data: userWithoutPassword });
    } else {
      res.json({ success: true, data: null });
    }
  });

  // User management routes
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // License generation
  app.post("/api/users/:id/license", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const licenseKey = await storage.generateLicenseKey(userId);
      
      res.json({ success: true, data: { licenseKey } });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const stats = await storage.getDashboardStats(userId);
      
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // API usage tracking
  app.post("/api/users/:id/usage", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { endpoint, creditsUsed } = req.body;
      
      await storage.trackApiUsage(userId, endpoint, creditsUsed);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // API usage history
  app.get("/api/users/:id/usage", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const usage = await storage.getApiUsageHistory(userId, limit);
      res.json({ success: true, data: usage });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Payment routes (simplified for demo)
  app.post("/api/payment/create-checkout-session", async (req, res) => {
    // Mock payment session creation
    res.json({ 
      success: true, 
      data: { sessionId: "mock_session_" + Date.now() } 
    });
  });

  app.post("/api/payment/create-portal-session", async (req, res) => {
    // Mock portal session creation
    res.json({ 
      success: true, 
      data: { url: "/dashboard" } 
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
