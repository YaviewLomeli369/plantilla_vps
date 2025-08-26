import { storage } from "./storage";

export async function initializeStoreData() {
  try {
    // Check if categories already exist
    const existingCategories = await storage.getAllProductCategories();
    if (existingCategories.length > 0) {
      console.log("Store data already initialized");
      return;
    }

    // Create product categories
    const categories = [
      {
        name: "Electrónicos",
        description: "Productos electrónicos y tecnología",
        isActive: true
      },
      {
        name: "Ropa",
        description: "Ropa y accesorios de moda",
        isActive: true
      },
      {
        name: "Hogar",
        description: "Artículos para el hogar y decoración",
        isActive: true
      },
      {
        name: "Deportes",
        description: "Equipos y ropa deportiva",
        isActive: true
      }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await storage.createProductCategory(category);
      createdCategories.push(created);
    }

    // Create sample products
    const products = [
      {
        name: "iPhone 15 Pro",
        description: "El último modelo de iPhone con cámara profesional y chip A17 Pro",
        shortDescription: "Smartphone Apple de última generación",
        price: 99900, // $999.00 in cents
        comparePrice: 109900, // $1099.00 in cents
        categoryId: createdCategories[0].id, // Electronics
        stock: 50,
        lowStockThreshold: 10,
        sku: "APL-IP15P-128",
        weight: 187,
        dimensions: { length: 146.6, width: 70.6, height: 8.25 },
        isActive: true,
        isFeatured: true,
        images: [
          "/api/placeholder/400/400",
          "/api/placeholder/400/400",
          "/api/placeholder/400/400"
        ],
        variants: [],
        tags: ["smartphone", "apple", "5g", "pro"],
        seoTitle: "iPhone 15 Pro - Comprar Online",
        seoDescription: "Compra el nuevo iPhone 15 Pro con envío gratis. El mejor precio garantizado."
      },
      {
        name: "Samsung Galaxy S24",
        description: "Smartphone Samsung Galaxy S24 con cámara AI y pantalla Dynamic AMOLED",
        shortDescription: "Smartphone Samsung de gama alta",
        price: 79900, // $799.00 in cents
        comparePrice: 89900,
        categoryId: createdCategories[0].id,
        stock: 30,
        lowStockThreshold: 5,
        sku: "SAM-GS24-256",
        weight: 167,
        dimensions: { length: 147, width: 70.6, height: 7.6 },
        isActive: true,
        isFeatured: true,
        images: ["/api/placeholder/400/400"],
        variants: [],
        tags: ["smartphone", "samsung", "android", "ai"],
        seoTitle: "Samsung Galaxy S24 - Comprar Online",
        seoDescription: "Nuevo Samsung Galaxy S24 con AI integrada y cámara profesional."
      },
      {
        name: "Camiseta Nike Dri-FIT",
        description: "Camiseta deportiva Nike con tecnología Dri-FIT para mantenerte seco",
        shortDescription: "Camiseta deportiva transpirable",
        price: 2999, // $29.99 in cents
        comparePrice: 3999,
        categoryId: createdCategories[3].id, // Sports
        stock: 100,
        lowStockThreshold: 20,
        sku: "NIKE-DFIT-001",
        weight: 150,
        dimensions: { length: 70, width: 50, height: 2 },
        isActive: true,
        isFeatured: false,
        images: ["/api/placeholder/400/400"],
        variants: [],
        tags: ["nike", "deportiva", "dri-fit", "camiseta"],
        seoTitle: "Camiseta Nike Dri-FIT - Ropa Deportiva",
        seoDescription: "Camiseta Nike Dri-FIT original. Perfecta para entrenar y hacer deporte."
      },
      {
        name: "Sofá Seccional Moderno",
        description: "Sofá seccional de 3 plazas con tela premium y diseño moderno",
        shortDescription: "Sofá cómodo y elegante para sala",
        price: 89900, // $899.00 in cents
        comparePrice: 109900,
        categoryId: createdCategories[2].id, // Home
        stock: 8,
        lowStockThreshold: 2,
        sku: "SOFA-SEC-GRY",
        weight: 45000, // 45kg
        dimensions: { length: 220, width: 90, height: 85 },
        isActive: true,
        isFeatured: true,
        images: ["/api/placeholder/400/400"],
        variants: [],
        tags: ["sofá", "moderno", "sala", "mueble"],
        seoTitle: "Sofá Seccional Moderno - Muebles de Sala",
        seoDescription: "Sofá seccional moderno de alta calidad. Perfecto para tu sala de estar."
      },
      {
        name: "Jeans Levi's 501",
        description: "Jeans clásicos Levi's 501 de corte recto, 100% algodón",
        shortDescription: "Jeans clásicos de alta calidad",
        price: 6999, // $69.99 in cents
        comparePrice: 7999,
        categoryId: createdCategories[1].id, // Clothing
        stock: 45,
        lowStockThreshold: 10,
        sku: "LEVI-501-IND",
        weight: 600,
        dimensions: { length: 110, width: 80, height: 3 },
        isActive: true,
        isFeatured: false,
        images: ["/api/placeholder/400/400"],
        variants: [],
        tags: ["jeans", "levis", "501", "clásico"],
        seoTitle: "Jeans Levi's 501 Original - Ropa Casual",
        seoDescription: "Jeans Levi's 501 originales. El clásico que nunca pasa de moda."
      }
    ];

    for (const product of products) {
      await storage.createProduct(product);
    }

    // Create some sample orders
    const sampleOrders = [
      {
        userId: null,
        guestEmail: "cliente@ejemplo.com",
        items: [
          {
            productId: "phone1", 
            productName: "iPhone 15 Pro",
            quantity: 1,
            unitPrice: 99900,
            totalPrice: 99900
          }
        ],
        subtotal: 99900,
        tax: 7992, // 8% tax
        shipping: 0,
        discount: 0,
        total: 107892,
        currency: "USD",
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "credit_card",
        shippingAddress: {
          firstName: "Juan",
          lastName: "Pérez",
          address1: "123 Calle Principal",
          city: "Ciudad de México",
          state: "CDMX",
          zipCode: "12345",
          country: "MX"
        }
      },
      {
        userId: null,
        guestEmail: "maria@ejemplo.com", 
        items: [
          {
            productId: "sofa1",
            productName: "Sofá Seccional Moderno",
            quantity: 1,
            unitPrice: 89900,
            totalPrice: 89900
          }
        ],
        subtotal: 89900,
        tax: 7192,
        shipping: 5000,
        discount: 0,
        total: 102092,
        currency: "USD",
        status: "processing",
        paymentStatus: "paid",
        paymentMethod: "credit_card",
        shippingAddress: {
          firstName: "María",
          lastName: "García",
          address1: "456 Avenida Central",
          city: "Guadalajara",
          state: "Jalisco",
          zipCode: "44100",
          country: "MX"
        }
      }
    ];

    for (const order of sampleOrders) {
      await storage.createOrder({
        ...order,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
    }

    console.log("Store data initialized successfully");
  } catch (error) {
    console.error("Error initializing store data:", error);
  }
}