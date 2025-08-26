import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertSiteConfigSchema,
  insertTestimonialSchema,
  insertFaqCategorySchema,
  insertFaqSchema,
  insertContactMessageSchema,
  insertContactInfoSchema,
  insertProductCategorySchema,
  insertProductSchema,
  insertProductVariantSchema,
  insertInventoryMovementSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertCustomerSchema,
  insertCustomerAddressSchema,
  insertPaymentSchema,
  insertShipmentSchema,
  insertReservationSchema,
  insertReservationSettingsSchema,
  insertSectionSchema
} from "@shared/schema";
import Stripe from "stripe";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

// Simple session management for demo
const sessions = new Map<string, string>(); // sessionId -> userId

// Security codes for admin creation (stored in memory)
const adminCreationCodes = new Map<string, { email: string; expiresAt: number; used: boolean }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateSecurityCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: "Authentication required" });
  }
  (req as any).userId = sessions.get(sessionId);
  next();
}

function requireRole(roles: string[]) {
  return async (req: any, res: any, next: any) => {
    const user = await storage.getUser((req as any).userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    req.user = user;
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Docker
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Try to find user by username first, then by email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username); // username field can also be email
      }

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const sessionId = generateSessionId();
      sessions.set(sessionId, user.id);

      res.json({
        token: sessionId,
        user: { ...user, password: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Generate security code for admin creation
  app.post("/api/auth/request-admin-code", async (req, res) => {
    try {
      const { email } = req.body;

      // Only allow specific email
      if (email !== "yaview.lomeli@gmail.com") {
        return res.status(403).json({ message: "Email no autorizado para crear cuentas administrativas" });
      }

      const code = generateSecurityCode();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      adminCreationCodes.set(code, {
        email,
        expiresAt,
        used: false
      });

      // Log the code to server console for security
      console.log(`\n🔐 CÓDIGO DE SEGURIDAD PARA CREAR ADMIN 🔐`);
      console.log(`Email: ${email}`);
      console.log(`Código: ${code}`);
      console.log(`Expira en 10 minutos`);
      console.log(`===============================\n`);

      res.json({
        message: "Código de seguridad generado. Revisa la consola del servidor.",
        codeGenerated: true
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al generar código" });
    }
  });

  // Special endpoint for creating superusers and admins with security code
  app.post("/api/auth/create-admin", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const { securityCode } = req.body;

      // Verify security code
      if (!securityCode) {
        return res.status(400).json({ message: "Código de seguridad requerido" });
      }

      const codeData = adminCreationCodes.get(securityCode);
      if (!codeData || codeData.used || Date.now() > codeData.expiresAt) {
        return res.status(400).json({ message: "Código de seguridad inválido o expirado" });
      }

      // Only allow creation of superuser, admin, and staff roles
      if (!['superuser', 'admin', 'staff'].includes(userData.role || '')) {
        return res.status(400).json({ message: "Invalid role. Only superuser, admin, and staff are allowed." });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Mark code as used
      codeData.used = true;

      const user = await storage.createUser(userData);

      console.log(`✅ Nueva cuenta administrativa creada:`);
      console.log(`Rol: ${user.role}`);
      console.log(`Usuario: ${user.username}`);
      console.log(`Email: ${user.email}\n`);

      res.json({
        message: `${userData.role} account created successfully`,
        user: { ...user, password: undefined }
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUser((req as any).userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ ...user, password: undefined });
  });

  // Change password endpoint
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      // Get current user to verify current password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password
      const updatedUser = await storage.updateUser(userId, { password: newPassword });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Visual customizations endpoints
  app.get('/api/visual-customizations/:pageId', async (req, res) => {
    try {
      const { pageId } = req.params;
      const customizations = await storage.getVisualCustomizations(pageId);
      res.json(customizations);
    } catch (error) {
      console.error('Error fetching customizations:', error);
      res.status(500).json({ message: 'Failed to fetch customizations' });
    }
  });

  app.post('/api/visual-customizations', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);

      if (!user || (user.role !== 'superuser' && user.role !== 'admin')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const customizationData = {
        ...req.body,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const customization = await storage.createVisualCustomization(customizationData);
      res.json(customization);
    } catch (error) {
      console.error('Error saving customization:', error);
      res.status(500).json({ message: 'Failed to save customization' });
    }
  });

  // Site config routes
  app.get("/api/config", async (req, res) => {
    const config = await storage.getSiteConfig();
    res.json(config);
  });

  app.put("/api/config", requireAuth, requireRole(['superuser', 'admin']), async (req, res) => {
    try {
      const config = await storage.getSiteConfig();
      if (!config) {
        return res.status(404).json({ message: "Config not found" });
      }

      const updatedConfig = await storage.updateSiteConfig(config.id, {
        config: req.body.config,
        updatedBy: (req as any).userId,
      });

      res.json(updatedConfig);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Users routes - temporarily remove auth for development
  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(user => ({ ...user, password: undefined })));
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = (req as any).userId;
      const currentUser = await storage.getUser(currentUserId);

      // Only allow users to update their own profile or admins/superusers to update any profile
      if (currentUserId !== id && !['admin', 'superuser'].includes(currentUser?.role || '')) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      // Don't allow regular users to update sensitive fields
      const updates = { ...req.body };
      if (currentUser?.role !== 'superuser' && currentUser?.role !== 'admin') {
        delete updates.role;
        delete updates.isActive;
      }

      // Don't allow password updates through this endpoint
      delete updates.password;

      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Testimonials routes
  app.get("/api/testimonials", async (req, res) => {
    const testimonials = await storage.getAllTestimonials();
    res.json(testimonials);
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.json(testimonial);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/testimonials/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTestimonial = await storage.updateTestimonial(id, req.body);
      if (!updatedTestimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(updatedTestimonial);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/testimonials/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteTestimonial(id);
    if (!deleted) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json({ message: "Testimonial deleted successfully" });
  });

  // FAQ Categories routes
  app.get("/api/faq-categories", async (req, res) => {
    const categories = await storage.getAllFaqCategories();
    res.json(categories);
  });

  app.post("/api/faq-categories", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const categoryData = insertFaqCategorySchema.parse(req.body);
      const category = await storage.createFaqCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/faq-categories/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCategory = await storage.updateFaqCategory(id, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/faq-categories/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteFaqCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  });

  // FAQs routes
  app.get("/api/faqs", async (req, res) => {
    const { categoryId } = req.query;
    let faqs;

    if (categoryId) {
      faqs = await storage.getFaqsByCategory(categoryId as string);
    } else {
      faqs = await storage.getAllFaqs();
    }

    res.json(faqs);
  });

  app.post("/api/faqs", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const faqData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(faqData);
      res.json(faq);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/faqs/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedFaq = await storage.updateFaq(id, req.body);
      if (!updatedFaq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(updatedFaq);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/faqs/:id/increment-views", async (req, res) => {
    try {
      const { id } = req.params;
      const faq = await storage.getFaq(id);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }

      const updatedFaq = await storage.updateFaq(id, {
        views: (faq.views || 0) + 1
      });

      res.json(updatedFaq);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/faqs/:id/vote-helpful", async (req, res) => {
    try {
      const { id } = req.params;
      const faq = await storage.getFaq(id);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }

      const updatedFaq = await storage.updateFaq(id, {
        helpfulVotes: (faq.helpfulVotes || 0) + 1
      });

      res.json(updatedFaq);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/faqs/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteFaq(id);
    if (!deleted) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json({ message: "FAQ deleted successfully" });
  });

  // Contact messages routes
  app.get("/api/contact/messages", async (req, res) => {
    const messages = await storage.getAllContactMessages();
    res.json(messages);
  });

  app.post("/api/contact/messages", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/contact/messages/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, req.body);
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/contact/messages/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteContactMessage(id);
    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  });

  // Mark message as read
  app.put("/api/contact/messages/:id/read", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, { isRead: true });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Mark message as unread
  app.put("/api/contact/messages/:id/unread", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, { isRead: false });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Archive message
  app.put("/api/contact/messages/:id/archive", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, { isArchived: true });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Unarchive message
  app.put("/api/contact/messages/:id/unarchive", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMessage = await storage.updateContactMessage(id, { isArchived: false });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Reply to message
  app.post("/api/contact/messages/:id/reply", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      if (!reply) {
        return res.status(400).json({ message: "Reply content is required" });
      }

      // Get the original message
      const originalMessage = await storage.getContactMessage(id);
      if (!originalMessage) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Update message with reply
      const updatedMessage = await storage.updateContactMessage(id, {
        reply: reply,
        isReplied: true,
        isRead: true,
        repliedAt: new Date(),
        repliedBy: (req as any).userId,
      });

      // Send email with reply
      try {
        const { sendContactReply } = await import('./email');
        const emailSent = await sendContactReply(
          originalMessage.email,
          originalMessage.subject || 'Respuesta a tu consulta',
          reply
        );

        if (emailSent) {
          console.log(`Email reply sent successfully to ${originalMessage.email}`);
        } else {
          console.log(`Failed to send email reply to ${originalMessage.email}`);
        }
      } catch (emailError) {
        console.error('Error sending email reply:', emailError);
      }

      res.json(updatedMessage);
    } catch (error) {
      console.error("Error replying to message:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Contact info routes
  app.get("/api/contact/info", async (req, res) => {
    const info = await storage.getContactInfo();
    res.json(info);
  });

  app.put("/api/contact/info", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const infoData = insertContactInfoSchema.parse(req.body);

      const info = await storage.getContactInfo();
      let updatedInfo;

      if (info) {
        updatedInfo = await storage.updateContactInfo(info.id, infoData);
      } else {
        updatedInfo = await storage.createContactInfo(infoData);
      }

      res.json(updatedInfo);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Sections routes
  app.get("/api/sections", async (req, res) => {
    const sections = await storage.getAllSections();
    res.json(sections);
  });

  app.post("/api/sections", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(sectionData);
      res.json(section);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/sections/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedSection = await storage.updateSection(id, req.body);
      if (!updatedSection) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(updatedSection);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/sections/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteSection(id);
    if (!deleted) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json({ message: "Section deleted successfully" });
  });

  // Reservations routes
  app.get("/api/reservations", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    const reservations = await storage.getAllReservations();
    res.json(reservations);
  });

  // Public endpoint for creating reservations with availability checking
  app.post("/api/reservations", async (req, res) => {
    try {
      console.log("Received reservation data:", JSON.stringify(req.body, null, 2));

      const reservationData = insertReservationSchema.parse(req.body);

      // Validate that the requested time slot is available
      const settings = await storage.getReservationSettings();
      if (!settings) {
        return res.status(400).json({ message: "Reservation system not configured" });
      }

      // Check if the date/time is within business hours
      const requestDate = new Date(reservationData.date);
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = dayNames[requestDate.getDay()];
      const businessHours = settings.businessHours as any;

      if (!businessHours[dayOfWeek]?.enabled) {
        return res.status(400).json({ message: "Service not available on this day" });
      }

      // Check for conflicts with existing reservations
      const dateStr = requestDate.toISOString().split('T')[0];
      const existingReservations = await storage.getReservationsForDate(dateStr);

      const timeSlot = reservationData.timeSlot;
      const isConflict = existingReservations.some(existing =>
        existing.timeSlot === timeSlot
      );

      if (isConflict) {
        return res.status(400).json({ message: "Time slot not available" });
      }

      const reservation = await storage.createReservation(reservationData);
      res.json(reservation);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Get available time slots for a specific date
  app.get("/api/reservations/available-slots/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const settings = await storage.getReservationSettings();

      if (!settings) {
        return res.status(400).json({ message: "Reservation system not configured" });
      }

      const requestDate = new Date(date);
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[requestDate.getDay()];
      const businessHours = settings.businessHours as any;

      console.log(`Checking availability for ${date}, day: ${dayName}, enabled: ${businessHours[dayName]?.enabled}`);

      if (!businessHours[dayName]?.enabled) {
        return res.json({ availableSlots: [], businessHours: null });
      }

      const dayHours = businessHours[dayName];
      const startTime = dayHours.open;
      const endTime = dayHours.close;

      // Generate time slots
      const slots = [];
      const start = new Date(`2000-01-01T${startTime}:00`);
      const end = new Date(`2000-01-01T${endTime}:00`);
      const duration = settings.defaultDuration;
      const buffer = settings.bufferTime;

      while (start < end) {
        const timeSlot = start.toTimeString().substring(0, 5);
        slots.push(timeSlot);
        start.setMinutes(start.getMinutes() + (duration || 60) + (buffer || 15));
      }

      // Remove booked slots
      const existingReservations = await storage.getReservationsForDate(date);
      const bookedSlots = existingReservations.map(r => r.timeSlot);
      const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

      res.json({ availableSlots, businessHours: dayHours });
    } catch (error) {
      res.status(500).json({ message: "Error fetching available slots" });
    }
  });

  app.put("/api/reservations/:id", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Updating reservation:', id, 'with data:', JSON.stringify(req.body, null, 2));

      // Clean the update data - remove read-only fields
      const { id: bodyId, createdAt, updatedAt, userId, ...cleanData } = req.body;

      // Ensure date is properly formatted
      if (cleanData.date && typeof cleanData.date === 'string') {
        cleanData.date = new Date(cleanData.date);
      }

      console.log('Clean data for update:', JSON.stringify(cleanData, null, 2));

      const updatedReservation = await storage.updateReservation(id, cleanData);
      if (!updatedReservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      res.json(updatedReservation);
    } catch (error) {
      console.error('Error updating reservation:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/reservations/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteReservation(id);
    if (!deleted) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({ message: "Reservation deleted successfully" });
  });

  // Reservation Settings API
  app.get("/api/reservation-settings", async (req, res) => {
    try {
      const settings = await storage.getReservationSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reservation settings" });
    }
  });

  app.put("/api/reservation-settings", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const settingsData = insertReservationSettingsSchema.parse(req.body);
      const settings = await storage.updateReservationSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    const posts = await storage.getAllBlogPosts();
    res.json(posts);
  });

  app.post("/api/blog", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      // Clean and prepare post data
      const cleanData = { ...req.body };

      // Handle publishedAt field properly
      if (cleanData.publishedAt !== undefined) {
        if (cleanData.publishedAt === null || cleanData.publishedAt === "") {
          cleanData.publishedAt = null;
        } else if (typeof cleanData.publishedAt === 'string') {
          cleanData.publishedAt = new Date(cleanData.publishedAt);
        }
      }

      // Set publishedAt based on isPublished status if not already set
      if (cleanData.isPublished && !cleanData.publishedAt) {
        cleanData.publishedAt = new Date();
      }

      const postData = {
        ...cleanData,
        authorId: (req as any).userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/blog/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      // Clean the data and ensure proper types - remove timestamp fields and other computed fields
      const { updatedAt, createdAt, authorName, views, id: bodyId, ...cleanData } = req.body;

      // Handle publishedAt field properly
      if (cleanData.publishedAt !== undefined) {
        if (cleanData.publishedAt === null || cleanData.publishedAt === "") {
          cleanData.publishedAt = null;
        } else if (typeof cleanData.publishedAt === 'string') {
          cleanData.publishedAt = new Date(cleanData.publishedAt);
        }
      }

      const postData = {
        ...cleanData,
        updatedBy: (req as any).userId,
      };
      const updatedPost = await storage.updateBlogPost(id, postData);
      if (!updatedPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/blog/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteBlogPost(id);
    if (!deleted) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json({ message: "Blog post deleted successfully" });
  });

  // Get blog post by slug
  app.get("/api/blog/slug/:slug", async (req, res) => {
    const { slug } = req.params;
    const post = await storage.getBlogPostBySlug(slug);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json(post);
  });

  // Increment blog post views
  app.put("/api/blog/:id/view", async (req, res) => {
    const { id } = req.params;
    const updated = await storage.incrementBlogPostViews(id);
    if (!updated) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json({ message: "Views incremented" });
  });

  // =================== STORE API ROUTES ===================

  // Product Categories
  app.get("/api/store/categories", async (req, res) => {
    const categories = await storage.getAllProductCategories();
    res.json(categories);
  });

  app.post("/api/store/categories", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const categoryData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/store/categories/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCategory = await storage.updateProductCategory(id, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/store/categories/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteProductCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  });

  // Products
  app.get("/api/store/products", async (req, res) => {
    const { category, featured, active } = req.query;

    let products;
    if (category) {
      products = await storage.getProductsByCategory(category as string);
    } else if (featured === 'true') {
      products = await storage.getFeaturedProducts();
    } else if (active === 'true') {
      products = await storage.getActiveProducts();
    } else {
      products = await storage.getAllProducts();
    }

    // Normalize image URLs for all products
    const normalizedProducts = products.map(product => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images.map(url => {
          if (typeof url === 'string' && url.startsWith('https://storage.googleapis.com/')) {
            try {
              const objectService = new ObjectStorageService();
              return objectService.normalizeObjectEntityPath(url);
            } catch {
              return url;
            }
          }
          return url;
        })
        : product.images
    }));

    res.json(normalizedProducts);
  });

  app.get("/api/store/products/:id", async (req, res) => {
    const { id } = req.params;
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Normalize image URLs to use local object serving route
    const normalizedProduct = {
      ...product,
      images: Array.isArray(product.images)
        ? product.images.map(url => {
          if (typeof url === 'string' && url.startsWith('https://storage.googleapis.com/')) {
            try {
              const objectService = new ObjectStorageService();
              return objectService.normalizeObjectEntityPath(url);
            } catch {
              return url;
            }
          }
          return url;
        })
        : product.images
    };

    res.json(normalizedProduct);
  });

  app.post("/api/store/products", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);

      // Auto-sync with Stripe if payment config is active
      try {
        const paymentConfig = await storage.getPaymentConfig();
        if (paymentConfig?.isActive && paymentConfig.stripeSecretKey) {
          const stripeClient = new Stripe(paymentConfig.stripeSecretKey, {
            apiVersion: "2025-07-30.basil",
          });

          // Convert relative image paths to absolute URLs for Stripe
          const imageUrls = Array.isArray(product.images)
            ? product.images.map(img => {
              if (img.startsWith('/objects/')) {
                return `${req.protocol}://${req.get('host')}${img}`;
              }
              return img;
            })
            : [];

          // Create product in Stripe
          const stripeProduct = await stripeClient.products.create({
            name: product.name,
            description: product.description ?? undefined,
            metadata: {
              localProductId: product.id,
            },
            images: imageUrls,
          });

          // Create price in Stripe
          const stripePrice = await stripeClient.prices.create({
            product: stripeProduct.id,
            unit_amount: product.price, // Price is already in cents
            currency: (product.currency || 'MXN').toLowerCase(),
          });

          // Update product with Stripe IDs
          const updatedProduct = await storage.updateProduct(product.id, {
            ...product,
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
          });

          console.log(`Product ${product.name} synced with Stripe:`, {
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
          });

          res.json(updatedProduct);
        } else {
          res.json(product);
        }
      } catch (stripeError: any) {
        console.error("Error syncing with Stripe:", stripeError);
        // Return the created product even if Stripe sync fails
        res.json({
          ...product,
          stripeError: "Failed to sync with Stripe: " + stripeError.message
        });
      }
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/store/products/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProduct = await storage.updateProduct(id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Sync with Stripe if product has Stripe IDs and payment config is active
      try {
        const paymentConfig = await storage.getPaymentConfig();
        if (paymentConfig?.isActive && paymentConfig.stripeSecretKey && updatedProduct.stripeProductId) {
          const stripeClient = new Stripe(paymentConfig.stripeSecretKey, {
            apiVersion: "2025-07-30.basil",
          });

          // Convert relative image paths to absolute URLs for Stripe
          const imageUrls = Array.isArray(updatedProduct.images)
            ? updatedProduct.images.map(img => {
              if (img.startsWith('/objects/')) {
                return `${req.protocol}://${req.get('host')}${img}`;
              }
              return img;
            })
            : [];

          // Update product in Stripe
          await stripeClient.products.update(updatedProduct.stripeProductId, {
            name: updatedProduct.name,
            description: updatedProduct.description ?? undefined,
            images: imageUrls,
          });

          // If price changed, create new price (Stripe prices are immutable)
          if (updatedProduct.price !== undefined && updatedProduct.stripePriceId) {
            // Get the original product to compare prices
            const originalProduct = await storage.getProduct(id);

            if (originalProduct && (originalProduct.price !== updatedProduct.price || (originalProduct.currency || 'MXN') !== (updatedProduct.currency || 'MXN'))) {
              // Deactivate old price
              try {
                await stripeClient.prices.update(originalProduct.stripePriceId!, {
                  active: false
                });
                console.log(`Deactivated old price: ${originalProduct.stripePriceId}`);
              } catch (error) {
                console.warn(`Could not deactivate old price ${originalProduct.stripePriceId}:`, error);
              }
            }

            const stripePrice = await stripeClient.prices.create({
              product: updatedProduct.stripeProductId,
              unit_amount: updatedProduct.price,
              currency: (updatedProduct.currency || 'MXN').toLowerCase(),
            });

            // Update with new price ID
            const finalProduct = await storage.updateProduct(id, {
              ...updatedProduct,
              stripePriceId: stripePrice.id,
            });

            console.log(`Product ${updatedProduct.name} updated in Stripe with new price:`, stripePrice.id);
            res.json(finalProduct);
          } else {
            console.log(`Product ${updatedProduct.name} updated in Stripe`);
            res.json(updatedProduct);
          }
        } else {
          res.json(updatedProduct);
        }
      } catch (stripeError: any) {
        console.error("Error syncing with Stripe:", stripeError);
        res.json({
          ...updatedProduct,
          stripeError: "Failed to sync with Stripe: " + stripeError.message
        });
      }
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/store/products/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;

      // Get product before deletion to access Stripe IDs
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete from local storage first
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete from Stripe if it has Stripe IDs and payment config is active
      try {
        const paymentConfig = await storage.getPaymentConfig();
        if (paymentConfig?.isActive && paymentConfig.stripeSecretKey && product.stripeProductId) {
          const stripeClient = new Stripe(paymentConfig.stripeSecretKey, {
            apiVersion: "2025-07-30.basil",
          });

          // Archive the product in Stripe (can't delete products with prices)
          await stripeClient.products.update(product.stripeProductId, {
            active: false
          });

          // Deactivate the price if it exists
          if (product.stripePriceId) {
            try {
              await stripeClient.prices.update(product.stripePriceId, {
                active: false
              });
            } catch (priceError) {
              console.warn(`Could not deactivate price ${product.stripePriceId}:`, priceError);
            }
          }

          console.log(`Product ${product.name} archived in Stripe: ${product.stripeProductId}`);
        }
      } catch (stripeError: any) {
        console.error("Error archiving product in Stripe:", stripeError);
        // Don't fail the deletion if Stripe operations fail
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete product" });
    }
  });

  // Product Variants
  app.get("/api/store/products/:productId/variants", async (req, res) => {
    const { productId } = req.params;
    const variants = await storage.getProductVariants(productId);
    res.json(variants);
  });

  app.post("/api/store/products/:productId/variants", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { productId } = req.params;
      const variantData = insertProductVariantSchema.parse({ ...req.body, productId });
      const variant = await storage.createProductVariant(variantData);
      res.json(variant);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/store/variants/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedVariant = await storage.updateProductVariant(id, req.body);
      if (!updatedVariant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      res.json(updatedVariant);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/store/variants/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteProductVariant(id);
    if (!deleted) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.json({ message: "Variant deleted successfully" });
  });

  // Inventory
  app.get("/api/store/inventory", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    const { productId } = req.query;
    const movements = await storage.getInventoryMovements(productId as string);
    res.json(movements);
  });

  app.post("/api/store/inventory", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const movementData = insertInventoryMovementSchema.parse({
        ...req.body,
        createdBy: (req as any).userId
      });
      const movement = await storage.createInventoryMovement(movementData);

      // Update product stock if it's a stock adjustment
      if (req.body.type === 'adjustment' && req.body.productId) {
        const product = await storage.getProduct(req.body.productId);
        if (product) {
          const newStock = product.stock + req.body.quantity;
          await storage.updateProductStock(req.body.productId, Math.max(0, newStock));
        }
      }

      res.json(movement);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/store/inventory/low-stock", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    const products = await storage.getLowStockProducts();
    res.json(products);
  });

  // Inventory movements - unified endpoints for admin panel
  app.get("/api/inventory/movements", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    const { productId } = req.query;
    const movements = await storage.getInventoryMovements(productId as string);
    res.json(movements);
  });

  app.post("/api/inventory/movements", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const movementData = insertInventoryMovementSchema.parse({
        ...req.body,
        createdBy: (req as any).userId
      });
      const movement = await storage.createInventoryMovement(movementData);

      // Update product stock based on movement type
      if (req.body.productId) {
        const product = await storage.getProduct(req.body.productId);
        if (product) {
          let newStock = product.stock;

          if (req.body.type === 'in') {
            newStock += req.body.quantity;
          } else if (req.body.type === 'out') {
            newStock = Math.max(0, newStock - req.body.quantity);
          } else if (req.body.type === 'adjustment') {
            newStock = Math.max(0, req.body.quantity); // Set absolute value for adjustments
          }

          await storage.updateProductStock(req.body.productId, newStock);
        }
      }

      res.json(movement);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Shopping Cart
  app.get("/api/store/cart", async (req, res) => {
    const { userId, sessionId } = req.query;
    const items = await storage.getCartItems(userId as string, sessionId as string);
    res.json(items);
  });

  app.post("/api/store/cart", async (req, res) => {
    try {
      const cartData = insertCartItemSchema.parse(req.body);
      const item = await storage.addToCart(cartData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/store/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const updatedItem = await storage.updateCartItem(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/store/cart/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.removeFromCart(id);
    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json({ message: "Item removed from cart" });
  });

  app.delete("/api/store/cart", async (req, res) => {
    const { userId, sessionId } = req.query;
    const cleared = await storage.clearCart(userId as string, sessionId as string);
    if (!cleared) {
      return res.status(400).json({ message: "Failed to clear cart" });
    }
    res.json({ message: "Cart cleared successfully" });
  });

  // Orders
  app.get("/api/store/orders", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  app.get("/api/store/orders/user/:userId", requireAuth, async (req, res) => {
    const { userId } = req.params;

    // Users can only access their own orders, admins can access any
    const currentUser = await storage.getUser((req as any).userId);
    if (currentUser?.role === 'cliente' && userId !== (req as any).userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await storage.getUserOrders(userId);
    res.json(orders);
  });

  app.get("/api/store/orders/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only access their own orders
    const currentUser = await storage.getUser((req as any).userId);
    if (currentUser?.role === 'cliente' && order.userId !== (req as any).userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  });

  app.post("/api/store/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);

      // Create order items if provided
      if (req.body.orderItems && Array.isArray(req.body.orderItems)) {
        for (const itemData of req.body.orderItems) {
          await storage.createOrderItem({
            ...itemData,
            orderId: order.id
          });
        }
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/store/orders/:id", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedOrder = await storage.updateOrder(id, req.body);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/store/orders/:id/status", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Track order (public route with order number)
  app.get("/api/store/orders/track", async (req, res) => {
    try {
      const { orderNumber, email } = req.query;

      if (!orderNumber) {
        return res.status(400).json({ message: "Order number is required" });
      }

      const orders = await storage.getAllOrders();
      const order = orders.find(o => o.orderNumber === orderNumber);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // If email is provided, validate it matches (for additional security)
      if (email && order.shippingAddress) {
        let shippingEmail = null;
        try {
          if (typeof order.shippingAddress === 'string') {
            // If stored as string, we can't validate email
            shippingEmail = null;
          } else {
            // If stored as object, check if it has email
            shippingEmail = order.shippingAddress.email;
          }
        } catch (e) {
          // Ignore parsing errors
        }

        // For now, we'll allow tracking without email validation since
        // shipping address might not contain email
      }

      // Get order items
      const orderItems = await storage.getOrderItems(order.id);

      // Return limited information for public tracking
      res.json({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        currency: order.currency || 'MXN',
        createdAt: order.createdAt,
        trackingNumber: order.trackingNumber,
        shippingAddress: order.shippingAddress,
        items: orderItems.map(item => ({
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      });
    } catch (error) {
      console.error("Error tracking order:", error);
      res.status(500).json({ message: "Error tracking order" });
    }
  });

  // Order Items
  app.get("/api/store/orders/:orderId/items", requireAuth, async (req, res) => {
    const { orderId } = req.params;

    // Verify user has access to this order
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentUser = await storage.getUser((req as any).userId);
    if (currentUser?.role === 'cliente' && order.userId !== (req as any).userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const items = await storage.getOrderItems(orderId);
    res.json(items);
  });

  // Customers
  app.get("/api/store/customers", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    const customers = await storage.getAllCustomers();
    res.json(customers);
  });

  app.get("/api/store/customers/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const customer = await storage.getCustomer(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Users can only access their own customer data
    const currentUser = await storage.getUser((req as any).userId);
    if (currentUser?.role === 'cliente' && customer.userId !== (req as any).userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(customer);
  });

  app.post("/api/store/customers", requireAuth, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        userId: (req as any).userId
      });
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/store/customers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Users can only update their own customer data
      const currentUser = await storage.getUser((req as any).userId);
      if (currentUser?.role === 'cliente' && customer.userId !== (req as any).userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedCustomer = await storage.updateCustomer(id, req.body);
      res.json(updatedCustomer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Customer Addresses
  app.get("/api/store/customers/:customerId/addresses", requireAuth, async (req, res) => {
    const { customerId } = req.params;

    // Verify user has access to this customer
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const currentUser = await storage.getUser((req as any).userId);
    if (currentUser?.role === 'cliente' && customer.userId !== (req as any).userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.post("/api/store/customers/:customerId/addresses", requireAuth, async (req, res) => {
    try {
      const { customerId } = req.params;

      // Verify user has access to this customer
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const currentUser = await storage.getUser((req as any).userId);
      if (currentUser?.role === 'cliente' && customer.userId !== (req as any).userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const addressData = insertCustomerAddressSchema.parse({
        ...req.body,
        customerId
      });
      const address = await storage.createCustomerAddress(addressData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Payments
  app.get("/api/store/orders/:orderId/payments", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    const { orderId } = req.params;
    const payments = await storage.getOrderPayments(orderId);
    res.json(payments);
  });

  app.post("/api/store/payments", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Shipments
  app.get("/api/store/orders/:orderId/shipments", requireAuth, async (req, res) => {
    const { orderId } = req.params;

    // Verify user has access to this order
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentUser = await storage.getUser((req as any).userId);
    if (currentUser?.role === 'cliente' && order.userId !== (req as any).userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const shipments = await storage.getOrderShipments(orderId);
    res.json(shipments);
  });

  app.post("/api/store/shipments", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const shipmentData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(shipmentData);
      res.json(shipment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/store/shipments/:id", requireAuth, requireRole(['admin', 'superuser', 'staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedShipment = await storage.updateShipment(id, req.body);
      if (!updatedShipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      res.json(updatedShipment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Store Analytics and Stats (Admin only)
  app.get("/api/store/stats", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const [
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalCustomers,
        lowStockProducts
      ] = await Promise.all([
        storage.getAllProducts(),
        storage.getActiveProducts(),
        storage.getAllOrders(),
        storage.getAllOrders().then(orders => orders.filter(o => o.status === 'pending')),
        storage.getAllCustomers(),
        storage.getLowStockProducts()
      ]);

      const stats = {
        totalProducts: totalProducts.length,
        activeProducts: activeProducts.length,
        totalOrders: totalOrders.length,
        pendingOrders: pendingOrders.length,
        totalCustomers: totalCustomers.length,
        lowStockProducts: lowStockProducts.length,
        totalRevenue: totalOrders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: totalOrders.length > 0 ?
          totalOrders.reduce((sum, order) => sum + order.total, 0) / totalOrders.length : 0
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch store statistics" });
    }
  });

  // Page Customizations API
  app.get("/api/customizations/:pageId", requireAuth, async (req, res) => {
    try {
      const { pageId } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const customization = await storage.getPageCustomization(pageId, userId);
      res.json(customization || { pageId, elements: {}, styles: {} });
    } catch (error) {
      console.error("Error fetching page customization:", error);
      res.status(500).json({ message: "Error fetching page customization" });
    }
  });

  app.put("/api/customizations/:pageId", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { pageId } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { elements, styles } = req.body;

      // Check if customization exists
      const existing = await storage.getPageCustomization(pageId, userId);

      let customization;
      if (existing) {
        customization = await storage.updatePageCustomization(pageId, userId, {
          elements,
          styles
        });
      } else {
        customization = await storage.createPageCustomization({
          pageId,
          userId,
          elements,
          styles
        });
      }

      res.json(customization);
    } catch (error) {
      console.error("Error saving page customization:", error);
      res.status(500).json({ message: "Error saving page customization" });
    }
  });

  app.delete("/api/customizations/:pageId", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { pageId } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const success = await storage.deletePageCustomization(pageId, userId);

      if (success) {
        res.json({ message: "Page customization deleted successfully" });
      } else {
        res.status(404).json({ message: "Page customization not found" });
      }
    } catch (error) {
      console.error("Error deleting page customization:", error);
      res.status(500).json({ message: "Error deleting page customization" });
    }
  });

  // Visual customization routes for inline editor
  app.get("/api/visual-customizations/:pageId", async (req, res) => {
    try {
      const customizations = await storage.getVisualCustomizations(req.params.pageId);
      res.json(customizations);
    } catch (error) {
      console.error("Error fetching visual customizations:", error);
      res.status(500).json({ message: "Error fetching visual customizations" });
    }
  });

  app.post("/api/visual-customizations", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const customizationData = {
        ...req.body,
        updatedBy: userId
      };

      const customization = await storage.saveVisualCustomization(customizationData);
      res.json(customization);
    } catch (error) {
      console.error("Error saving visual customization:", error);
      res.status(500).json({ message: "Error saving visual customization" });
    }
  });

  app.put("/api/visual-customizations/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const updates = {
        ...req.body,
        updatedBy: userId
      };

      const customization = await storage.updateVisualCustomization(req.params.id, updates);
      if (!customization) {
        return res.status(404).json({ message: "Visual customization not found" });
      }
      res.json(customization);
    } catch (error) {
      console.error("Error updating visual customization:", error);
      res.status(500).json({ message: "Error updating visual customization" });
    }
  });

  app.delete("/api/visual-customizations/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteVisualCustomization(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Visual customization not found" });
      }
      res.json({ message: "Visual customization deleted successfully" });
    } catch (error) {
      console.error("Error deleting visual customization:", error);
      res.status(500).json({ message: "Error deleting visual customization" });
    }
  });

  // =================== OBJECT STORAGE API ROUTES ===================

  // Serve public objects
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve private objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for objects
  app.post("/api/objects/upload", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update product with image URL after upload
  app.put("/api/store/products/:id/image", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const { imageURL } = req.body;

      if (!imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(imageURL);

      const updatedProduct = await storage.updateProduct(id, { images: [normalizedPath] });
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({
        message: "Product image updated successfully",
        product: updatedProduct,
        imagePath: normalizedPath
      });
    } catch (error) {
      console.error("Error updating product image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update product image
  app.put("/api/products/:id/image", async (req, res) => {
    try {
      const { imageURL } = req.body;
      const productId = req.params.id;

      if (!imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      // Get existing product
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Normalize the object URL to internal path
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(imageURL);

      // Update product with new image
      const updatedProduct = await storage.updateProduct(productId, {
        ...product,
        images: [normalizedPath]
      });

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =================== OBJECT STORAGE ROUTES ===================

  // Object storage upload endpoint
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve private objects (with basic access)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error downloading object:", error);
      if (error.constructor.name === 'ObjectNotFoundError') {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // =================== STRIPE PAYMENT API ROUTES ===================

  // Payment Configuration Routes
  app.get("/api/payment-config", requireAuth, requireRole(["superuser", "admin"]), async (req, res) => {
    try {
      const config = await storage.getPaymentConfig();
      // Don't expose secret key in response unless it's just to check if it exists
      if (config && config.stripeSecretKey) {
        const sanitizedConfig = {
          ...config,
          stripeSecretKey: config.stripeSecretKey ? "***" : ""
        };
        res.json(sanitizedConfig);
      } else {
        res.json(config);
      }
    } catch (error) {
      console.error("Error fetching payment config:", error);
      res.status(500).json({ message: "Failed to fetch payment configuration" });
    }
  });

  app.put("/api/payment-config", requireAuth, requireRole(["superuser", "admin"]), async (req, res) => {
    try {
      const { stripePublicKey, stripeSecretKey, isActive } = req.body;

      const configData = {
        stripePublicKey,
        stripeSecretKey,
        isActive: Boolean(isActive),
        updatedBy: (req as any).userId
      };

      const updatedConfig = await storage.updatePaymentConfig(configData);

      // Return sanitized config
      const sanitizedConfig = {
        ...updatedConfig,
        stripeSecretKey: updatedConfig.stripeSecretKey ? "***" : ""
      };

      res.json(sanitizedConfig);
    } catch (error) {
      console.error("Error updating payment config:", error);
      res.status(500).json({ message: "Failed to update payment configuration" });
    }
  });

  // Get public payment configuration (for checkout)
  app.get("/api/payment-config/public", async (req, res) => {
    try {
      const config = await storage.getPaymentConfig();
      // Only return public key and status
      res.json({
        stripePublicKey: config?.stripePublicKey || null,
        isActive: config?.isActive || false
      });
    } catch (error) {
      console.error("Error fetching public payment config:", error);
      res.status(500).json({ message: "Failed to fetch payment configuration" });
    }
  });

  // Create payment intent for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    console.log("Received payment intent request:", req.body);
    try {
      const { amount, currency = "mxn", metadata = {}, cartItems = [] } = req.body;

      // Validate cart items if provided
      if (cartItems.length > 0) {
        let calculatedAmount = 0;
        for (const item of cartItems) {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            return res.status(400).json({
              error: `Producto no encontrado: ${item.productId}`
            });
          }
          if (!product.isActive) {
            return res.status(400).json({
              error: `Producto "${product.name}" no está disponible`
            });
          }
          if (product.stock !== null && product.stock < item.quantity) {
            return res.status(400).json({
              error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`
            });
          }
          calculatedAmount += (product.price / 100) * item.quantity;
        }
        // Override amount with calculated amount if cart items provided
        if (calculatedAmount > 0) {
          req.body.amount = calculatedAmount;
        }
      }

      if (!req.body.amount || req.body.amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      // Minimum amount validation based on currency
      const minimumAmounts = {
        'usd': 0.50,
        'mxn': 10.00,
        'eur': 0.50,
        'cad': 0.50
      };

      const minAmount = minimumAmounts[currency.toLowerCase()] || 0.50;
      if (amount < minAmount) {
        return res.status(400).json({
          error: `Minimum amount is ${minAmount.toLocaleString('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
          })}`
        });
      }

      // Get payment config to use the correct Stripe instance
      const paymentConfig = await storage.getPaymentConfig();
      if (!paymentConfig?.isActive || !paymentConfig.stripeSecretKey) {
        return res.status(400).json({ error: "Payment processing not configured" });
      }

      const stripeClient = new Stripe(paymentConfig.stripeSecretKey, {
        apiVersion: "2025-07-30.basil",
      });

      // Ensure amount meets Stripe minimum requirements
      let finalAmount = req.body.amount;
      if (currency.toLowerCase() === 'mxn' && finalAmount < 10.00) {
        finalAmount = 10.00;
      }

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency,
        metadata: {
          ...metadata,
          originalAmount: req.body.amount.toString(),
          adjustedAmount: finalAmount.toString(),
          cartItems: JSON.stringify(cartItems)
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        error: "Error creating payment intent: " + error.message
      });
    }
  });

  // Confirm payment and create order
  app.post("/api/store/checkout", async (req, res) => {
    console.log("Received checkout request:", req.body);
    try {
      const { paymentIntentId, customerInfo, orderItems, shippingAddress } = req.body;

      // Get payment config to use the correct Stripe instance
      const paymentConfig = await storage.getPaymentConfig();
      if (!paymentConfig?.isActive || !paymentConfig.stripeSecretKey) {
        return res.status(400).json({ error: "Payment processing not configured" });
      }

      const stripeClient = new Stripe(paymentConfig.stripeSecretKey, {
        apiVersion: "2025-07-30.basil",
      });

      // Verify payment intent was successful
      const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // Validate stock availability and calculate total
      let total = 0;
      if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ error: "Order items are required" });
      }

      for (const item of orderItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({
            error: `Product not found: ${item.productId}`
          });
        }

        // Check if product is active
        if (!product.isActive) {
          return res.status(400).json({
            error: `Product "${product.name}" is not available`
          });
        }

        // Check stock availability
        if (product.stock !== null && product.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          });
        }

        total += product.price * item.quantity;
      }

      // Create customer if needed
      let customer = null;
      if (customerInfo && (customerInfo.email || customerInfo.firstName)) {
        try {
          const existingCustomers = await storage.getAllCustomers();
          customer = existingCustomers.find(c =>
            c.firstName === customerInfo.firstName &&
            c.lastName === customerInfo.lastName
          );

          if (!customer) {
            customer = await storage.createCustomer({
              firstName: customerInfo.firstName || '',
              lastName: customerInfo.lastName || '',
              phone: customerInfo.phone || '',
              userId: null // Anonymous customer
            });
          }
        } catch (customerError) {
          console.error("Error creating customer:", customerError);
          // Continue without customer - order can still be created
        }
      }

      // Create order
      const order = await storage.createOrder({
        userId: customer?.userId || null,
        status: 'confirmed',
        total,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        orderNumber: `ORD-${Date.now()}`,
        subtotal: total,
        items: orderItems
      });

      // Create order items
      for (const item of orderItems) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: product.price * item.quantity,
            productName: product.name
          });

          // Update product stock and create inventory movement
          if (product.stock !== null) {
            const newStock = Math.max(0, product.stock - item.quantity);
            await storage.updateProductStock(item.productId, newStock);

            // Create inventory movement for the sale
            await storage.createInventoryMovement({
              productId: item.productId,
              type: 'out',
              quantity: item.quantity,
              reason: 'sale',
              notes: `Sale - Order ${order.orderNumber}`,
              createdBy: null // System generated
            });
          }
        }
      }

      res.json({
        success: true,
        order,
        message: "Order created successfully"
      });
    } catch (error: any) {
      console.error("Error processing checkout:", error);
      res.status(500).json({
        error: "Error processing checkout: " + error.message
      });
    }
  });

  // Orders management endpoints
  app.get("/api/store/orders", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/store/orders/:id/items", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const orderItems = await storage.getOrderItems(id);
      res.json(orderItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order items" });
    }
  });

  // Update order endpoint
  app.put("/api/store/orders/:id", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedOrder = await storage.updateOrder(id, updateData);
      res.json(updatedOrder);
    } catch (error: any) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Error updating order: " + error.message });
    }
  });

  // Get customers endpoint
  app.get("/api/store/customers", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customers" });
    }
  });

  // Get Stripe public key
  app.get("/api/stripe/public-key", (req, res) => {
    res.json({
      publicKey: process.env.VITE_STRIPE_PUBLIC_KEY
    });
  });

  // Add route to serve private objects (for product images)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Email Configuration endpoints
  app.get("/api/email/config", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const config = await storage.getEmailConfig();
      if (!config) {
        return res.json({});
      }

      // Don't send the password back to frontend
      const { smtpPass, ...safeConfig } = config;
      res.json(safeConfig);
    } catch (error) {
      console.error('Error getting email config:', error);
      res.status(500).json({ message: "Error getting email configuration" });
    }
  });

  app.put("/api/email/config", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { fromEmail, replyToEmail, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, isActive } = req.body;

      const configData = {
        fromEmail,
        replyToEmail,
        smtpHost,
        smtpPort: smtpPort || 587,
        smtpSecure: smtpSecure || false,
        smtpUser,
        smtpPass,
        isActive: isActive || false
      };

      const updatedConfig = await storage.updateEmailConfig(configData);

      // Reset transporter to use new config
      const { resetTransporter } = await import('./email');
      resetTransporter();

      // Don't send the password back to frontend
      const { smtpPass: _, ...safeConfig } = updatedConfig;
      res.json(safeConfig);
    } catch (error) {
      console.error('Error updating email config:', error);
      res.status(500).json({ message: "Error updating email configuration" });
    }
  });

  app.post("/api/email/test-connection", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      // Get current email config from database
      const configData = await storage.getEmailConfig();

      if (!configData || !configData.isActive) {
        return res.status(400).json({
          success: false,
          message: "No active email configuration found"
        });
      }

      // Create test transporter with current database config
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        host: configData.smtpHost,
        port: configData.smtpPort || 587,
        secure: configData.smtpSecure || false,
        auth: {
          user: configData.smtpUser,
          pass: configData.smtpPass,
        },
      });

      // Test connection
      await transporter.verify();

      // Update test status in database
      await storage.updateEmailTestStatus('success');

      res.json({ success: true, message: "Connection successful" });
    } catch (error) {
      console.error('Email connection test failed:', error);

      // Update test status in database
      await storage.updateEmailTestStatus('failed');

      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed"
      });
    }
  });

  app.post("/api/email/send-test", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { to, subject, content } = req.body;

      const { sendEmail } = await import('./email');
      const success = await sendEmail({
        to,
        subject,
        text: content,
        html: `<p>${content}</p>`
      });

      if (success) {
        res.json({ success: true, message: "Test email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send test email" });
      }
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send test email"
      });
    }
  });

  // Object Storage URL normalization
  app.post("/api/objects/normalize-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedUrl = objectStorageService.normalizeObjectEntityPath(url);

      res.json({ normalizedUrl });
    } catch (error) {
      console.error("Error normalizing URL:", error);
      res.status(500).json({ error: "Failed to normalize URL" });
    }
  });

  // Inventory Management Routes
  app.get("/api/inventory/movements", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { productId } = req.query;
      const movements = await storage.getInventoryMovements(productId as string);
      res.json(movements);
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      res.status(500).json({ message: "Error fetching inventory movements" });
    }
  });

  app.post("/api/inventory/movements", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const { type, productId, quantity, reason, notes } = req.body;
      const userId = (req.user as any).id;

      // Validate the movement data
      const validTypes = ['in', 'out', 'adjustment'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid movement type" });
      }

      if (!productId || quantity === undefined || quantity === 0) {
        return res.status(400).json({ message: "Product ID and quantity are required" });
      }

      // Get current product to check stock for 'out' movements
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // For 'out' movements, check if there's enough stock
      if (type === 'out' && product.stock! < Math.abs(quantity)) {
        return res.status(400).json({
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${Math.abs(quantity)}`
        });
      }

      // Calculate new stock based on movement type
      let newStock = product.stock!;
      if (type === 'in') {
        newStock += Math.abs(quantity);
      } else if (type === 'out') {
        newStock -= Math.abs(quantity);
      } else if (type === 'adjustment') {
        newStock = Math.abs(quantity); // For adjustments, quantity is the new total
      }

      // Ensure stock doesn't go negative
      if (newStock < 0) {
        return res.status(400).json({ message: "Stock cannot be negative" });
      }

      // Create the inventory movement
      const movementData = {
        productId,
        type,
        quantity: Math.abs(quantity),
        reason: reason || (type === 'in' ? 'restock' : type === 'out' ? 'sale' : 'adjustment'),
        notes: notes || null,
        createdBy: userId
      };

      const movement = await storage.createInventoryMovement(movementData);

      // Update product stock
      await storage.updateProductStock(productId, newStock);

      res.status(201).json(movement);
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      res.status(500).json({ message: "Error creating inventory movement" });
    }
  });

  app.get("/api/inventory/low-stock", requireAuth, requireRole(['admin', 'superuser']), async (req, res) => {
    try {
      const lowStockProducts = await storage.getLowStockProducts();
      res.json(lowStockProducts);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({ message: "Error fetching low stock products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}