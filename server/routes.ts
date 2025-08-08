import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createPaymentOrderSchema } from "@shared/schema";
import { z } from "zod";

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST_KEY_ID || "rzp_test_1234567890";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_KEY_SECRET || "test_secret_key";

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

// Mock Razorpay API for development
async function createRazorpayOrder(amount: number, currency: string = "INR"): Promise<RazorpayOrder> {
  // In production, use actual Razorpay SDK:
  // const Razorpay = require('razorpay');
  // const rzp = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  // return await rzp.orders.create({ amount: amount * 100, currency, receipt: `receipt_${Date.now()}` });
  
  // For development, return mock order
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100, // Razorpay expects amount in paisa
    currency,
    status: "created"
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create payment order
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const validatedData = createPaymentOrderSchema.parse(req.body);
      
      const { paymentMethod, billingAddress, items, subtotal, tax } = validatedData;
      
      // Calculate COD fee if applicable
      const codFee = paymentMethod === "cod" ? 20 : 0;
      const total = subtotal + tax + codFee;
      
      // Create order in storage
      const order = await storage.createOrder({
        userId: null, // In a real app, get from session
        status: "pending",
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        codFee: codFee.toString(),
        total: total.toString(),
        billingAddress: JSON.stringify(billingAddress),
      });

      // Create order items
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          name: item.name,
          variant: item.variant || null,
          quantity: item.quantity,
          price: item.price.toString(),
          imageUrl: item.imageUrl || null,
        });
      }

      // If payment method is UPI or Card, create Razorpay order
      let razorpayOrder = null;
      if (paymentMethod === "upi" || paymentMethod === "card") {
        razorpayOrder = await createRazorpayOrder(total);
        
        // Update order with Razorpay order ID
        await storage.updateOrder(order.id, {
          razorpayOrderId: razorpayOrder.id,
        });
      }

      res.json({
        success: true,
        orderId: order.id,
        total,
        paymentMethod,
        razorpayOrder: razorpayOrder ? {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: RAZORPAY_KEY_ID,
        } : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      } else {
        console.error("Payment order creation error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create payment order",
        });
      }
    }
  });

  // Verify payment (for UPI/Card payments)
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { orderId, razorpayPaymentId, razorpaySignature } = req.body;
      
      // In production, verify the signature using Razorpay SDK
      // const crypto = require('crypto');
      // const expectedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      //   .update(razorpayOrderId + '|' + razorpayPaymentId)
      //   .digest('hex');
      // if (expectedSignature !== razorpaySignature) {
      //   throw new Error('Invalid signature');
      // }
      
      // For development, assume payment is successful
      const order = await storage.updateOrder(orderId, {
        paymentStatus: "completed",
        status: "completed",
        razorpayPaymentId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  });

  // Confirm COD order
  app.post("/api/payment/confirm-cod", async (req, res) => {
    try {
      const { orderId } = req.body;
      
      const order = await storage.updateOrder(orderId, {
        paymentStatus: "pending",
        status: "confirmed",
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "COD order confirmed successfully",
        order,
      });
    } catch (error) {
      console.error("COD confirmation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to confirm COD order",
      });
    }
  });

  // Get order details
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const items = await storage.getOrderItems(id);

      res.json({
        success: true,
        order: {
          ...order,
          billingAddress: JSON.parse(order.billingAddress),
          items,
        },
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
