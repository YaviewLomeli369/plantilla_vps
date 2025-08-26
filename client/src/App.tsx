import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { ModuleRoute } from "@/components/module-route";
import { LoadingPage } from "@/components/loading-page";
import type { SiteConfig } from "@shared/schema";

// Public pages
import Home from "@/pages/home";
import Testimonials from "@/pages/testimonials";
import Faqs from "@/pages/faqs";
import Contact from "@/pages/contact";
import Store from "@/pages/store";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Reservations from "@/pages/reservations";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import CreateAdmin from "@/pages/auth/create-admin";
import Setup from "@/pages/setup";
import Profile from "@/pages/profile";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/checkout-success";
import ShippingInfo from "@/pages/shipping-info";
import OrderTracking from "@/pages/order-tracking";
import AvisoPrivacidad from "@/pages/aviso-privacidad";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminModules from "@/pages/admin/modules";
import AdminTestimonials from "@/pages/admin/testimonials";
import AdminFaqs from "@/pages/admin/faqs";
import AdminContact from "@/pages/admin/contact";
import AdminStore from "@/pages/admin/store";
import AdminUsers from "@/pages/admin/users";
import AdminSections from "@/pages/admin/sections";
import AdminAppearance from "@/pages/admin/appearance";
import AdminReservations from "@/pages/admin/reservations";
import AdminReservationSettings from "@/pages/admin/reservation-settings";
import AdminPayments from "@/pages/admin/payments";
import AdminBlog from "@/pages/admin/blog";
import AdminOrders from "@/pages/admin/orders";
import AdminEmailConfig from "@/pages/admin/email-config";
import AdminInventory from "@/pages/admin/inventory";
import AdminContactInfo from "@/pages/admin/contact-info";
import WhatsAppWidget from "@/components/WhatsAppWidget";

import NotFound from "@/pages/not-found";

function Router() {
  // Apply theme dynamically
  useTheme();
  
  // Load the site configuration first to prevent 404 flashes
  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show loading while the main configuration loads
  if (isLoading) {
    return <LoadingPage />;
  }
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <ModuleRoute path="/testimonials" component={Testimonials} moduleKey="testimonios" />
      <ModuleRoute path="/faqs" component={Faqs} moduleKey="faqs" />
      <ModuleRoute path="/contact" component={Contact} moduleKey="contacto" />
      <ModuleRoute path="/store" component={Store} moduleKey="tienda" />
      <ModuleRoute path="/blog" component={Blog} moduleKey="blog" />
      <Route path="/blog/:slug" component={BlogPost} />
      <ModuleRoute path="/reservations" component={Reservations} moduleKey="reservas" />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/create-admin" component={CreateAdmin} />
      <Route path="/setup" component={Setup} />
      <Route path="/profile" component={Profile} />
      <Route path="/shipping-info" component={ShippingInfo} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/track-order" component={OrderTracking} />
      <Route path="/aviso-privacidad" component={AvisoPrivacidad} />
      
      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/modules" component={AdminModules} />
      <Route path="/admin/testimonials" component={AdminTestimonials} />
      <Route path="/admin/faqs" component={AdminFaqs} />
      <Route path="/admin/contact" component={AdminContact} />
      <Route path="/admin/store" component={AdminStore} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/sections" component={AdminSections} />
      <Route path="/admin/appearance" component={AdminAppearance} />
      <Route path="/admin/reservations" component={AdminReservations} />
      <Route path="/admin/reservation-settings" component={AdminReservationSettings} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/blog" component={AdminBlog} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/email-config" component={AdminEmailConfig} />
      <Route path="/admin/contact-info" component={AdminContactInfo} />
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <InlineEditor 
          value=""
          onSave={async () => {}}
        />
        <WhatsAppWidget />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
