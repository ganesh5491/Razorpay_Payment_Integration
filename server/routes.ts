import dotenv from "dotenv";
dotenv.config();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createPaymentOrderSchema } from "@shared/schema";
import { z } from "zod";
import Razorpay from "razorpay";
import crypto from "crypto";

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
console.log("RAZORPAY_KEY_ID:", RAZORPAY_KEY_ID);

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Create Razorpay order using the official SDK
async function createRazorpayOrder(amount: number, currency: string = "INR") {
  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paisa
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create payment order
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const validatedData = createPaymentOrderSchema.parse(req.body);

      const { paymentMethod, billingAddress, items, subtotal, tax } = validatedData;

      const codFee = paymentMethod === "cod" ? 20 : 0;
      const total = subtotal + tax + codFee;

      const order = await storage.createOrder({
        userId: null,
        status: "pending",
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        codFee: codFee.toString(),
        total: total.toString(),
        billingAddress: JSON.stringify(billingAddress),
      });

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

      let razorpayOrder = null;
      if (paymentMethod === "upi" || paymentMethod === "card") {
        razorpayOrder = await createRazorpayOrder(total);

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

  // Verify payment
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { orderId, razorpayPaymentId, razorpaySignature, razorpayOrderId } = req.body;

      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }

      try {
        const payment = await razorpay.payments.fetch(razorpayPaymentId);

        if (payment.status !== 'captured' && payment.status !== 'authorized') {
          return res.status(400).json({
            success: false,
            message: "Payment not successful",
          });
        }
      } catch (paymentError) {
        console.error("Error fetching payment details:", paymentError);
        return res.status(500).json({
          success: false,
          message: "Could not verify payment with Razorpay",
        });
      }

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

  // Confirm COD
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

  // Get order
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
