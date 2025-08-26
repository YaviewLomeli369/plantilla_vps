# Overview

This is a modular web application system built with React and Express.js that provides a configurable platform for creating complete websites. The system features a modern tech stack with TypeScript, Tailwind CSS, and shadcn/ui components on the frontend, paired with an Express.js backend using in-memory storage for development. The application supports multiple user roles (superuser, admin, staff, cliente) and includes modules for testimonials, FAQs, contact management, blog, e-commerce store functionality, and reservations. The system is designed to be highly configurable through JSON-based site configuration, allowing administrators to enable/disable modules and customize content dynamically.

## Recent Changes (August 18, 2025)
- **AUTHENTICATION SECURITY ENHANCEMENTS**: Comprehensive password validation and flexible login system
  - Password security validation: minimum 8 characters, uppercase, lowercase, number, and special symbols (@$!%*?&)
  - Real-time password strength indicator in registration forms with visual feedback
  - Backend validation using Zod schemas preventing weak passwords from being stored
  - Login system enhanced to accept both username and email authentication
  - Privacy policy email configuration fixed to display contact email from database
  - Improved loading states for public pages to prevent 404 flashes during configuration load
- **DATABASE COMPLETELY RESET AND PRICE SYSTEM CORRECTED**: Fresh start with realistic pricing structure
  - All database tables dropped and recreated with proper schema
  - Price conversion issue resolved: all prices now correctly display in pesos (divided by 100 from stored centavos)
  - Stripe minimum payment requirements properly handled with automatic adjustment
  - New sample products with realistic pricing: iPhones ($999), Jeans ($69.99), etc.
  - Complete e-commerce flow now functioning correctly from store to checkout
- **ALTERNATING SECTION COMPONENT FULLY INTEGRATED**: Complete dynamic content system implementation
  - AlternatingSection component connected with database sections configuration
  - Dynamic color and icon mapping based on section index with intelligent fallbacks
  - Automatic alternation (left/right) based on section order with force override support
  - Advanced configuration through sections.config JSONB field for complete customization
  - Inline editing capabilities for superusers directly in AlternatingSection components
  - Staggered animations with progressive delays for enhanced visual flow
  - Professional icon mapping system (rocket, users, target, star) with extensible architecture
- **ADMIN CONTACT INFO MODULE COMPLETED**: Missing sidebar item and administration panel fully implemented
  - "Información de Contacto" tab added to admin sidebar with proper MapPin icon
  - Complete administration interface with tabbed design (Basic Info / Social Media)
  - Full form validation using Zod schemas for all contact fields
  - Support for phone, email, address, business hours, and Google Maps URL
  - Comprehensive social media integration: Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok
  - Real-time data loading and saving with proper error handling and toast notifications
  - Resolved infinite render loop issue with proper useEffect implementation for form reset
- **COMPLETE ANIMATION SYSTEM IMPLEMENTATION**: Modern scroll-reveal animations across entire site
  - AnimatedSection component implemented on ALL pages (home, testimonials, store, FAQs, contact, blog, reservations, login)
  - Smooth Framer Motion animations with staggered delays for enhanced user experience
  - Professional scroll-reveal effects that activate when sections come into view
  - Consistent animation timing and easing across all components
  - Performance optimized with viewport detection and once-only animations
- **WHATSAPP WIDGET ENHANCEMENT**: Updated from emoji to professional SVG icon
  - Replaced emoji with proper WhatsApp SVG logo for professional appearance
  - Maintained configurable WHATSAPP_NUMBER and WHATSAPP_MESSAGE constants
  - Fixed z-index positioning and hover effects for better user interaction

## Previous Changes (August 17, 2025)
- **ADVANCED INVENTORY MANAGEMENT SYSTEM COMPLETED**: Comprehensive stock control and tracking
  - Complete inventory movements module with full CRUD operations
  - Automatic stock validation during checkout to prevent overselling
  - Real-time inventory movement tracking for all stock changes (in, out, adjustment)
  - Low stock threshold monitoring and alerts
  - Automatic inventory movements created during sales
  - Admin inventory panel with product stock overview and movement history
  - Stock adjustment capabilities with reason tracking and user attribution
  - Integrated with e-commerce checkout for seamless stock updates

## Previous Changes (August 16, 2025)
- **EMAIL CONFIGURATION SYSTEM FULLY IMPLEMENTED**: Complete SMTP configuration management
  - Database-driven email configuration with admin interface
  - Support for Gmail, Outlook, SendGrid and any SMTP provider
  - Real email sending capabilities replacing test-only Ethereal service
  - Configuration panel accessible from admin sidebar ("Config. Email")
  - Email transporter automatically resets when configuration changes
  - Secure password handling with proper database storage
  - Test connection and send test email functionality

## Previous Changes (August 15, 2025)
- **E-COMMERCE PLATFORM FULLY FUNCTIONAL**: Complete Stripe integration and automated synchronization
  - Automatic Stripe product creation when products are added in admin panel
  - Real-time synchronization of product data with Stripe using registered API keys
  - Functional checkout system with direct redirection from store cart
  - Complete payment processing with Stripe integration and customer forms
  - Object storage properly configured for product image uploads
  - Payment configuration panel for managing Stripe API keys
  - Database schema updated with stripeProductId and stripePriceId fields
  - Dynamic Stripe client instantiation using stored credentials
- **CONTACT MANAGEMENT SYSTEM COMPLETELY ENHANCED**: Comprehensive contact administration
  - Mark as read functionality working correctly with real-time UI updates
  - Reply system with email simulation and response storage in database
  - Archive messages functionality with proper status tracking
  - Delete messages with confirmation and database cleanup
  - Enhanced statistics dashboard with 5 metrics including "replied" counter
  - Visual indicators (badges) for message status: new, read, replied, archived
  - Improved responsive design with better action buttons and dialogs
  - Complete message history display in reply dialogs
- **BLOG SYSTEM COMPLETED**: Fixed all admin blog functionality issues
  - Status saving now works correctly (published/draft based on user selection)
  - Edit functionality fully implemented with complete dialog interface
  - View functionality opens posts in new tab for preview
  - Fixed tags input to allow comma-separated entries
  - Improved error handling and data validation
- Dashboard updated with real data instead of mock statistics
- Blog module added to admin navigation and full CRUD interface
- Contact form functionality fully implemented and working
- Authentication system working correctly with token-based sessions
- All admin modules now use real data from the backend storage
- Module statistics in dashboard reflect actual database content

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built as a Single Page Application (SPA) using React with TypeScript and wouter for client-side routing. The UI layer leverages shadcn/ui components built on top of Radix UI primitives, styled with Tailwind CSS for consistent design. State management is handled through TanStack Query for server state and React hooks for local state. The application follows a component-based architecture with clear separation between public pages, admin pages, and reusable UI components.

## Backend Architecture
The backend follows a RESTful API design using Express.js with TypeScript. The server implements a modular routing system with authentication middleware and role-based access control. Session management is handled through a simple in-memory store for demo purposes, with plans for more robust solutions in production. The API layer includes comprehensive CRUD operations for all data entities and follows consistent error handling patterns.

## Database Design
The system uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema is designed with modularity in mind, featuring separate tables for users, site configuration, testimonials, FAQs, contact information, products, orders, and reservations. The site configuration uses JSONB storage for flexible, schema-less configuration data, allowing dynamic module settings without database migrations.

## Authentication & Authorization
Authentication is implemented using bearer token-based sessions with role-based access control. The system supports four user roles: superuser (full access), admin (management access), staff (limited admin), and cliente (customer access). Authorization is enforced at both the API route level and frontend component level, with protected routes redirecting unauthenticated users to the login page.

## Module System
The application implements a modular architecture where different business features (testimonials, FAQs, store, reservations, contact) can be enabled or disabled through configuration. Each module is self-contained with its own database schema, API endpoints, frontend components, and admin interface. This allows for easy customization and deployment of only required features.

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI Framework
- **React**: Core frontend framework with hooks and functional components
- **Radix UI**: Headless UI components for accessibility and behavior
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling and production builds
- **TanStack Query**: Server state management and caching
- **wouter**: Lightweight client-side routing library

## Validation & Forms
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Form state management and validation
- **@hookform/resolvers**: Zod integration for form validation

## Backend Services
- **Express.js**: Web application framework
- **nanoid**: Unique ID generation for sessions and entities
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional CSS class management