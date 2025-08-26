import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Puzzle, 
  Palette, 
  Users, 
  Layout, 
  Quote, 
  HelpCircle, 
  ShoppingCart, 
  Calendar, 
  Mail,
  MessageSquare,
  FileText,
  Settings,
  Menu,
  X,
  CreditCard,
  Package,
  LogOut,
  Home,
  Warehouse,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  superuserOnly?: boolean;
  moduleRequired?: string;
}

const getAllSidebarItems = (): SidebarItem[] => [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/modules", label: "Módulos", icon: Puzzle, section: "Configuración", superuserOnly: true },
  { href: "/admin/appearance", label: "Apariencia", icon: Palette, section: "Configuración" },
  { href: "/admin/users", label: "Usuarios", icon: Users, section: "Configuración" },
  { href: "/admin/sections", label: "Secciones", icon: Layout, section: "Contenido", superuserOnly: true },
  { href: "/admin/testimonials", label: "Testimonios", icon: Quote, section: "Contenido", moduleRequired: "testimonios" },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle, section: "Contenido", moduleRequired: "faqs" },
  { href: "/admin/blog", label: "Blog", icon: FileText, section: "Contenido", moduleRequired: "blog" },
  { href: "/admin/store", label: "Tienda", icon: ShoppingCart, section: "Módulos de Negocio", moduleRequired: "tienda" },
  { href: "/admin/inventory", label: "Inventario", icon: Warehouse, section: "Módulos de Negocio", moduleRequired: "tienda" },
  { href: "/admin/orders", label: "Pedidos", icon: Package, section: "Módulos de Negocio", moduleRequired: "tienda" },
  { href: "/admin/payments", label: "Pagos", icon: CreditCard, section: "Módulos de Negocio", moduleRequired: "tienda" },
  { href: "/admin/reservations", label: "Reservas", icon: Calendar, section: "Módulos de Negocio", moduleRequired: "reservas" },
  { href: "/admin/reservation-settings", label: "Config. Reservas", icon: Settings, section: "Módulos de Negocio", moduleRequired: "reservas" },
  { href: "/admin/contact", label: "Contacto", icon: MessageSquare, section: "Módulos de Negocio", moduleRequired: "contacto" },
  
  { href: "/admin/contact-info", label: "Información de Contacto", icon: MapPin, section: "Módulos de Negocio", moduleRequired: "contacto" },
  
  { href: "/admin/email-config", label: "Config. Email", icon: Mail, section: "Módulos de Negocio" },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();
  
  // Get current user info to check role
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Get config to check active modules
  const { data: config } = useQuery({
    queryKey: ["/api/config"],
  });

  // Filter items based on user role and active modules
  const isSuperuser = (currentUser as any)?.role === 'superuser';
  const modules = (config as any)?.config?.frontpage?.modulos || {};
  
  const sidebarItems = getAllSidebarItems().filter(item => {
    // Superuser sees everything
    if (isSuperuser) {
      return true;
    }
    
    // Hide superuser-only items from admin
    if (item.superuserOnly) {
      return false;
    }
    
    // For admin users, check if module is active
    if (item.moduleRequired) {
      return modules[item.moduleRequired]?.activo || false;
    }
    
    return true;
  });

  const groupedItems = sidebarItems.reduce((acc, item) => {
    const section = item.section || "main";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  const SidebarContent = () => (
      <nav className="p-4 space-y-2">
        {/* Main items (no section) */}
        {groupedItems.main?.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                location === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Grouped sections */}
        {Object.entries(groupedItems).map(([section, items]) => {
          if (section === "main") return null;
          
          return (
            <div key={section} className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section}
              </h3>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      location === item.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.label === "Tienda" && (
                      <span className="ml-auto w-2 h-2 bg-success rounded-full"></span>
                    )}
                    {item.label === "Reservas" && (
                      <span className="ml-auto w-2 h-2 bg-gray-300 rounded-full"></span>
                    )}
                    {item.label === "Contacto" && (
                      <span className="ml-auto w-2 h-2 bg-success rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
        
        {/* Logout Section */}
        <div className="pt-4 border-t border-gray-200">
          <Link href="/" className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 mb-2">
            <Home className="w-5 h-5" />
            <span>Ir al Inicio</span>
          </Link>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto z-30 hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`w-64 bg-white shadow-sm border-r border-gray-200 fixed left-0 top-0 bottom-0 overflow-y-auto z-50 transform transition-transform duration-300 lg:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="pt-16">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
