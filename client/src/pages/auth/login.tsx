import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Home } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoginLoading, loginError } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password }, {
      onSuccess: (data) => {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        });
        
        // Redirect based on role
        if (data.user.role === "admin" || data.user.role === "superuser") {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Credenciales incorrectas",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Iniciar Sesión - Sistema Modular" />
      <Navbar />
      
      <AnimatedSection>
        <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-md space-y-6">
          {/* Back to Home Button */}
          <div className="text-center">
            <Link href="/">
              <Button variant="outline" className="inline-flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
          
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario o Email</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Ingresa tu usuario o email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {loginError.message || "Error al iniciar sesión"}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              Volver al inicio
            </Link>
          </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </AnimatedSection>
      
      <Footer />
    </div>
  );
}
