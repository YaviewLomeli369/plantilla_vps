
import { db } from "../server/db";
import * as schema from "../shared/schema";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Seed site configuration
    const existingSiteConfig = await db.select().from(schema.siteConfig).limit(1);
    if (existingSiteConfig.length === 0) {
      await db.insert(schema.siteConfig).values({
        config: {
          siteName: "Nova Web Template",
          siteDescription: "Template profesional para sitios web",
          primaryColor: "#3b82f6",
          modules: {
            testimonials: { enabled: true },
            faq: { enabled: true },
            contact: { enabled: true },
            store: { enabled: true },
            blog: { enabled: true },
            reservations: { enabled: true }
          }
        },
        version: "1.0.0"
      });
      console.log("✅ Site configuration seeded");
    }

    // Seed contact info
    const existingContactInfo = await db.select().from(schema.contactInfo).limit(1);
    if (existingContactInfo.length === 0) {
      await db.insert(schema.contactInfo).values({
        phone: "+52 555 123 4567",
        email: "contacto@novaweb.com",
        address: "Ciudad de México, México",
        hours: "Lun-Vie 9:00-18:00",
        socialLinks: {
          facebook: "https://facebook.com/novaweb",
          instagram: "https://instagram.com/novaweb",
          twitter: "https://twitter.com/novaweb"
        }
      });
      console.log("✅ Contact info seeded");
    }

    // Seed sample testimonials
    const existingTestimonials = await db.select().from(schema.testimonials).limit(1);
    if (existingTestimonials.length === 0) {
      await db.insert(schema.testimonials).values([
        {
          name: "María González",
          email: "maria@example.com",
          content: "Excelente servicio, muy profesional y rápido. Altamente recomendado.",
          rating: 5,
          isApproved: true,
          isFeatured: true
        },
        {
          name: "Carlos López",
          email: "carlos@example.com", 
          content: "Muy satisfecho con los resultados. El equipo fue muy atento y profesional.",
          rating: 5,
          isApproved: true,
          isFeatured: true
        }
      ]);
      console.log("✅ Sample testimonials seeded");
    }

    // Seed FAQ categories
    const existingFaqCategories = await db.select().from(schema.faqCategories).limit(1);
    if (existingFaqCategories.length === 0) {
      const faqCategory = await db.insert(schema.faqCategories).values({
        name: "General",
        description: "Preguntas frecuentes generales",
        order: 0
      }).returning();

      // Seed sample FAQs
      await db.insert(schema.faqs).values([
        {
          question: "¿Cómo puedo contactarlos?",
          answer: "Puedes contactarnos a través del formulario de contacto, por teléfono o email.",
          categoryId: faqCategory[0].id,
          isPublished: true,
          order: 0
        },
        {
          question: "¿Cuáles son sus horarios de atención?",
          answer: "Nuestros horarios son de Lunes a Viernes de 9:00 AM a 6:00 PM.",
          categoryId: faqCategory[0].id,
          isPublished: true,
          order: 1
        }
      ]);
      console.log("✅ Sample FAQs seeded");
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
