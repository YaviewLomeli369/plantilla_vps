import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("cliente"), // superuser, admin, staff, cliente
  isActive: boolean("is_active").notNull().default(true),
});

// Site configuration (JSON-based modular config)
export const siteConfig = pgTable("site_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  config: jsonb("config").notNull(),
  version: text("version").notNull().default("1.0.0"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  isApproved: boolean("is_approved").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// FAQ Categories
export const faqCategories = pgTable("faq_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").default(0),
});

// FAQs
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  categoryId: varchar("category_id").references(() => faqCategories.id),
  isPublished: boolean("is_published").default(false),
  views: integer("views").default(0),
  helpfulVotes: integer("helpful_votes").default(0),
  order: integer("order").default(0),
});

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  isArchived: boolean("is_archived").default(false),
  isReplied: boolean("is_replied").default(false),
  reply: text("reply"),
  repliedAt: timestamp("replied_at"),
  repliedBy: varchar("replied_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payment Configuration (Stripe keys, etc)
export const paymentConfig = pgTable("payment_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripePublicKey: text("stripe_public_key"),
  stripeSecretKey: text("stripe_secret_key"),
  isActive: boolean("is_active").default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

// Contact Information
export const contactInfo = pgTable("contact_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  hours: text("hours"),
  socialLinks: jsonb("social_links"),
  mapsUrl: text("maps_url"),
});

// Product Categories
export const productCategories = pgTable("product_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  price: integer("price").notNull(), // in cents
  currency: text("currency").default("MXN"), // Currency for the product
  comparePrice: integer("compare_price"), // original price for discounts
  categoryId: varchar("category_id").references(() => productCategories.id),
  stock: integer("stock").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  sku: text("sku").unique(),
  weight: integer("weight"), // in grams
  dimensions: jsonb("dimensions"), // {length, width, height}
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  images: jsonb("images"),
  variants: jsonb("variants"), // {size, color, etc.}
  tags: jsonb("tags"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Product Variants
export const productVariants = pgTable("product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  name: text("name").notNull(), // e.g., "Size", "Color"
  value: text("value").notNull(), // e.g., "Large", "Red"
  price: integer("price"), // additional price
  sku: text("sku"),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
});

// Inventory Movements
export const inventoryMovements = pgTable("inventory_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  type: text("type").notNull(), // "in", "out", "adjustment"
  quantity: integer("quantity").notNull(),
  reason: text("reason"), // "sale", "restock", "damage", "adjustment"
  notes: text("notes"),
  orderId: varchar("order_id"), // if related to an order
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Shopping Cart
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"), // for anonymous users
  productId: varchar("product_id").references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  guestEmail: text("guest_email"), // for guest checkouts
  items: jsonb("items").notNull(),
  subtotal: integer("subtotal").notNull(), // in cents
  tax: integer("tax").default(0), // in cents
  shipping: integer("shipping").default(0), // in cents
  discount: integer("discount").default(0), // in cents
  total: integer("total").notNull(), // in cents
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled, refunded
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed, refunded
  paymentMethod: text("payment_method"),
  paymentId: text("payment_id"), // from payment processor
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  shippingMethod: text("shipping_method"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  productId: varchar("product_id").references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  productName: text("product_name").notNull(), // snapshot at time of order
  variantName: text("variant_name"),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // in cents
  totalPrice: integer("total_price").notNull(), // in cents
});

// Customers (extends users for e-commerce specific data)
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  defaultShippingAddress: jsonb("default_shipping_address"),
  defaultBillingAddress: jsonb("default_billing_address"),
  totalOrders: integer("total_orders").default(0),
  totalSpent: integer("total_spent").default(0), // in cents
  averageOrderValue: integer("average_order_value").default(0),
  lastOrderDate: timestamp("last_order_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Customer Addresses
export const customerAddresses = pgTable("customer_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  type: text("type").notNull(), // "shipping", "billing"
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  address1: text("address_1").notNull(),
  address2: text("address_2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("US"),
  phone: text("phone"),
  isDefault: boolean("is_default").default(false),
});

// Payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, completed, failed, refunded
  method: text("method").notNull(), // credit_card, paypal, stripe, etc.
  transactionId: text("transaction_id"),
  gatewayResponse: jsonb("gateway_response"),
  refundedAmount: integer("refunded_amount").default(0),
  refundReason: text("refund_reason"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Shipping
export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"), // UPS, FedEx, USPS, etc.
  service: text("service"), // Ground, Express, etc.
  status: text("status").default("pending"), // pending, shipped, in_transit, delivered, exception
  shippedAt: timestamp("shipped_at"),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  shippingCost: integer("shipping_cost"), // in cents
  weight: integer("weight"), // in grams
  dimensions: jsonb("dimensions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Reservations/Appointments
export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  date: timestamp("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  service: text("service"),
  notes: text("notes"),
  status: text("status").default("pending"), // pending, confirmed, cancelled, completed
  duration: integer("duration").default(60), // Duration in minutes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reservation Settings for business hours and availability
export const reservationSettings = pgTable("reservation_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessHours: jsonb("business_hours").notNull().default({
    monday: { enabled: true, open: "09:00", close: "18:00" },
    tuesday: { enabled: true, open: "09:00", close: "18:00" },
    wednesday: { enabled: true, open: "09:00", close: "18:00" },
    thursday: { enabled: true, open: "09:00", close: "18:00" },
    friday: { enabled: true, open: "09:00", close: "18:00" },
    saturday: { enabled: false, open: "09:00", close: "18:00" },
    sunday: { enabled: false, open: "09:00", close: "18:00" }
  }),
  defaultDuration: integer("default_duration").default(60), // Default duration in minutes
  bufferTime: integer("buffer_time").default(15), // Buffer between appointments in minutes
  maxAdvanceDays: integer("max_advance_days").default(30), // How far in advance bookings can be made
  allowedServices: jsonb("allowed_services").notNull().default([
    "Consulta general",
    "Cita especializada",
    "Reunión"
  ]),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  authorId: varchar("author_id").references(() => users.id),
  categoryId: varchar("category_id"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  views: integer("views").default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blog Categories
export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sections (dynamic page sections)
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title"),
  content: text("content"),
  type: text("type").notNull(), // hero, services, about, gallery, etc.
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  config: jsonb("config"), // additional configuration for the section
});

// Email Configuration
export const emailConfig = pgTable("email_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromEmail: text("from_email").notNull(),
  replyToEmail: text("reply_to_email").notNull(),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").default(587),
  smtpSecure: boolean("smtp_secure").default(false),
  smtpUser: text("smtp_user").notNull(),
  smtpPass: text("smtp_pass").notNull(),
  isActive: boolean("is_active").default(false),
  lastTested: timestamp("last_tested"),
  testStatus: text("test_status"), // 'success', 'failed', 'pending'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
}).extend({
  securityCode: z.string().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (@$!%*?&)")
});

export const insertSiteConfigSchema = createInsertSchema(siteConfig).omit({
  id: true,
  lastUpdated: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export const insertFaqCategorySchema = createInsertSchema(faqCategories).omit({
  id: true,
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export const insertContactInfoSchema = createInsertSchema(contactInfo).omit({
  id: true,
});

export const insertProductCategorySchema = createInsertSchema(productCategories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(["in", "out", "adjustment"]),
  reason: z.enum(["sale", "restock", "damage", "adjustment", "return"]).optional(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerAddressSchema = createInsertSchema(customerAddresses).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.coerce.date(), // Allow string to date conversion
});

export const insertReservationSettingsSchema = createInsertSchema(reservationSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertEmailConfigSchema = createInsertSchema(emailConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastTested: true,
  testStatus: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
});

export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
});



// Types
export type User = typeof users.$inferSelect;

// Page customizations schema
export const pageCustomizations = pgTable("page_customizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull(), // URL path or page identifier
  userId: varchar("user_id").notNull().references(() => users.id),
  elements: jsonb("elements").notNull().default({}), // Customized element values
  styles: jsonb("styles").notNull().default({}), // Custom CSS styles
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PageCustomization = typeof pageCustomizations.$inferSelect;
export type InsertPageCustomization = typeof pageCustomizations.$inferInsert;

// Visual Customizations - stores all visual changes made through inline editor
export const visualCustomizations = pgTable("visual_customizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull(), // home, contact, blog, etc.
  elementSelector: varchar("element_selector").notNull(), // CSS selector or unique identifier
  elementType: varchar("element_type").notNull(), // text, color, size, spacing, image, section
  property: varchar("property").notNull(), // content, backgroundColor, fontSize, margin, etc.
  value: text("value").notNull(), // the actual value
  label: varchar("label").notNull(), // user-friendly label
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type VisualCustomization = typeof visualCustomizations.$inferSelect;
export type InsertVisualCustomization = typeof visualCustomizations.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type FaqCategory = typeof faqCategories.$inferSelect;
export type InsertFaqCategory = z.infer<typeof insertFaqCategorySchema>;
export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactInfo = typeof contactInfo.$inferSelect;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;
export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type CustomerAddress = typeof customerAddresses.$inferSelect;
export type InsertCustomerAddress = z.infer<typeof insertCustomerAddressSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type ReservationSettings = typeof reservationSettings.$inferSelect;
export type InsertReservationSettings = z.infer<typeof insertReservationSettingsSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type PaymentConfig = typeof paymentConfig.$inferSelect;
export type InsertPaymentConfig = typeof paymentConfig.$inferInsert;
export type EmailConfig = typeof emailConfig.$inferSelect;
export type InsertEmailConfig = z.infer<typeof insertEmailConfigSchema>;
