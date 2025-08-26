import { storage } from "./storage";

export async function initializeSiteConfig() {
  try {
    // Check if site config already exists
    const existingConfig = await storage.getSiteConfig();
    if (existingConfig) {
      console.log("Site configuration already initialized");
      return;
    }

    // Create default site configuration
    const defaultConfig = {
      modules: {
        testimonials: {
          enabled: true,
          showOnHomepage: true,
          requireApproval: true,
          allowRatings: true,
          maxRating: 5
        },
        faqs: {
          enabled: true,
          showCategories: true,
          allowVoting: true,
          requireApproval: false
        },
        contact: {
          enabled: true,
          requireAuth: false,
          autoReply: false,
          notificationEmail: "admin@example.com"
        },
        blog: {
          enabled: true,
          postsPerPage: 10,
          allowComments: false,
          requireApproval: true,
          showAuthor: true,
          showCategories: true
        },
        store: {
          enabled: true,
          currency: "USD",
          taxRate: 0.0825, // 8.25%
          shippingEnabled: true,
          inventoryTracking: true,
          guestCheckout: true,
          requireRegistration: false
        },
        reservations: {
          enabled: true,
          requireAuth: false,
          autoConfirm: false,
          timeSlots: [
            "9:00 AM", "10:00 AM", "11:00 AM", 
            "12:00 PM", "1:00 PM", "2:00 PM", 
            "3:00 PM", "4:00 PM", "5:00 PM"
          ],
          maxAdvanceDays: 30
        },
        sections: {
          enabled: true,
          allowDynamicContent: true,
          showInNavigation: true
        }
      },
      appearance: {
        siteName: "Mi Sitio Web",
        tagline: "Bienvenido a nuestro sitio",
        logo: "",
        favicon: "",
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af",
        fontFamily: "Inter, sans-serif",
        darkMode: false
      },
      seo: {
        metaTitle: "Mi Sitio Web - Página Principal",
        metaDescription: "Descripción de mi sitio web con todos los servicios disponibles",
        keywords: ["sitio web", "servicios", "empresa"],
        ogImage: "",
        googleAnalytics: "",
        googleTagManager: ""
      },
      social: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        youtube: "",
        whatsapp: ""
      },
      business: {
        name: "Mi Empresa",
        description: "Descripción de mi empresa",
        phone: "",
        email: "",
        address: "",
        hours: "Lunes a Viernes: 9:00 AM - 6:00 PM",
        timezone: "America/Mexico_City"
      }
    };

    // Create the site configuration
    const config = await storage.createSiteConfig({
      config: defaultConfig,
      version: "1.0.0"
    });

    console.log("Site configuration initialized successfully");
    return config;
  } catch (error) {
    console.error("Error initializing site configuration:", error);
    throw error;
  }
}