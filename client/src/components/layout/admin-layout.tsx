import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { AdminTopbar } from "@/components/admin/topbar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "superuser"))) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "superuser")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopbar />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 ml-0 p-4 lg:p-8 min-w-0 overflow-x-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
