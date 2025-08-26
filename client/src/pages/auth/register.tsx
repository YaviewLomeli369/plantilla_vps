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

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, isRegisterLoading, registerError } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[@$!%*?&]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSymbol
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Contraseña insegura",
        description: "La contraseña no cumple con los requisitos de seguridad",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    register({ username, email, password, role: "cliente" }, {
      onSuccess: () => {
        toast({
          title: "¡Registro exitoso!",
          description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
        });
        setLocation("/login");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "No se pudo crear la cuenta",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Crear Cuenta - Sistema Modular" />
      <Navbar />
      
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
              <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
              <CardDescription className="text-center">
                Regístrate para acceder a todas las funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Elige un nombre de usuario"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
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
                placeholder="Crea una contraseña segura"
              />
              {password && (
                <div className="text-xs space-y-1 p-2 bg-muted rounded-md">
                  <p className="font-medium text-muted-foreground">Requisitos de contraseña:</p>
                  <div className="grid grid-cols-1 gap-1">
                    <div className={`flex items-center gap-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`}>
                      <span>{passwordValidation.minLength ? '✓' : '✗'}</span>
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-red-500'}`}>
                      <span>{passwordValidation.hasUpper ? '✓' : '✗'}</span>
                      <span>Una mayúscula (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasLower ? 'text-green-600' : 'text-red-500'}`}>
                      <span>{passwordValidation.hasLower ? '✓' : '✗'}</span>
                      <span>Una minúscula (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                      <span>{passwordValidation.hasNumber ? '✓' : '✗'}</span>
                      <span>Un número (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasSymbol ? 'text-green-600' : 'text-red-500'}`}>
                      <span>{passwordValidation.hasSymbol ? '✓' : '✗'}</span>
                      <span>Un símbolo (@$!%*?&)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repite tu contraseña"
              />
            </div>

            {registerError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {registerError.message || "Error al crear la cuenta"}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isRegisterLoading}
            >
              {isRegisterLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión aquí
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
      
      <Footer />
    </div>
  );
}
