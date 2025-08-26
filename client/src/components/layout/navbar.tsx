import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import type { SiteConfig } from "@shared/schema";

// Logo en imgs
import logoSvg from "/imgs/nova_logos_v_1.svg";
import logoSvg2 from "/imgs/nova_logos_v_2.svg";



import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingCart, User, LogOut, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const configData = config?.config as any;
  const modules = configData?.frontpage?.modulos || {};
  const appearance = configData?.appearance || {};

  const navItems = [
    { href: "/", label: "Inicio", always: true },
    { href: "/testimonials", label: "Testimonios", moduleKey: "testimonios" },
    { href: "/faqs", label: "FAQs", moduleKey: "faqs" },
    { href: "/contact", label: "Contacto", moduleKey: "contacto" },
    { href: "/store", label: "Tienda", moduleKey: "tienda" },
    { href: "/blog", label: "Blog", moduleKey: "blog" },
    { href: "/reservations", label: "Reservas", moduleKey: "reservas" },
  ].filter(item => item.always || (item.moduleKey && modules[item.moduleKey]?.activo));

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" 
      //{/* style={{
        //backgroundColor: '#9bfcff',
      //}} */}
        
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              {/* <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">Fssitle
                {appearance.logoUrl ? (
                  <img src={appearance.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {appearance.brandName?.charAt(0) || "S"}
                  </span>
                )}
              </div> */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                {appearance.logoUrl ? (
                  <img src={logoSvg} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {appearance.brandName?.charAt(0) || "S"}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-xl font-semibold text-gray-900">{appearance.brandName || "Sistema Modular"}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === item.href
                      ? "text-primary"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Shopping Cart - Only show if store module is active */}
            {modules.tienda?.activo && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/store">
                  <ShoppingCart className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {/* Desktop Auth */}
            <div className="hidden sm:flex items-center space-x-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.username}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" || user?.role === "superuser" ? (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Administración</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Registrarse</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Navegación</SheetTitle>
                  <SheetDescription className="text-left">
                    {appearance.brandName || "Sistema Modular"}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Navigation Links */}
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium transition-colors hover:text-primary p-2 rounded-md ${
                        location === item.href
                          ? "text-primary bg-primary/10"
                          : "text-gray-700"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-gray-50 rounded-md">
                          <p className="font-medium">{user?.username}</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 text-gray-700 hover:text-primary p-2 rounded-md"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                        {user?.role === "admin" || user?.role === "superuser" ? (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary p-2 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Administración</span>
                          </Link>
                        ) : null}
                        <button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700 p-2 rounded-md w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/login"
                          className="block w-full text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Iniciar Sesión
                        </Link>
                        <Link
                          href="/register"
                          className="block w-full text-center py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Registrarse
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
