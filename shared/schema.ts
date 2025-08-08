import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, completed, failed, cancelled
  paymentMethod: text("payment_method").notNull(), // upi, qr, card, cod
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  codFee: decimal("cod_fee", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  billingAddress: text("billing_address").notNull(), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  name: text("name").notNull(),
  variant: text("variant"),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  razorpayOrderId: true,
  razorpayPaymentId: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const billingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(6, "Valid PIN code is required").max(6),
});

export const createPaymentOrderSchema = z.object({
  paymentMethod: z.enum(["upi", "qr", "card", "cod"]),
  billingAddress: billingAddressSchema,
  items: z.array(z.object({
    name: z.string(),
    variant: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    imageUrl: z.string().optional(),
  })),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type BillingAddress = z.infer<typeof billingAddressSchema>;
export type CreatePaymentOrder = z.infer<typeof createPaymentOrderSchema>;
