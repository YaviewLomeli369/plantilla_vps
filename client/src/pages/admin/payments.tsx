import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Settings, Shield, Eye, EyeOff } from "lucide-react";

export default function AdminPayments() {
  return (
    <AdminLayout>
      <AdminPaymentsContent />
    </AdminLayout>
  );
}

function AdminPaymentsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Fetch payment configuration
  const { data: paymentConfig, isLoading } = useQuery({
    queryKey: ["/api/payment-config"],
    queryFn: () => apiRequest("/api/payment-config", { method: "GET" }),
  });

  // Update payment configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("/api/payment-config", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-config"] });
      toast({ title: "Configuración de pagos actualizada exitosamente" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Error al actualizar configuración",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const configData = {
      stripePublicKey: formData.get("stripePublicKey"),
      stripeSecretKey: formData.get("stripeSecretKey"),
      isActive: formData.get("isActive") === "on",
    };

    updateConfigMutation.mutate(configData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Configuración de Pagos</h1>
          <p className="text-muted-foreground">Configura las claves de Stripe para procesar pagos</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Claves de Stripe</CardTitle>
            </div>
            <CardDescription>
              Configura tus claves de API de Stripe. Puedes obtenerlas en{" "}
              <a 
                href="https://dashboard.stripe.com/apikeys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                dashboard.stripe.com/apikeys
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripePublicKey">Clave Pública (Publishable Key)</Label>
                <Input
                  id="stripePublicKey"
                  name="stripePublicKey"
                  placeholder="pk_test_..."
                  defaultValue={paymentConfig?.stripePublicKey || ""}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Comienza con pk_test_ o pk_live_. Esta clave es segura para usar en el frontend.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stripeSecretKey">Clave Secreta (Secret Key)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showSecretKey ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
                <Input
                  id="stripeSecretKey"
                  name="stripeSecretKey"
                  type={showSecretKey ? "text" : "password"}
                  placeholder="sk_test_..."
                  defaultValue={paymentConfig?.stripeSecretKey || ""}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Comienza con sk_test_ o sk_live_. Esta clave debe mantenerse secreta.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch 
                  id="isActive" 
                  name="isActive"
                  defaultChecked={paymentConfig?.isActive || false}
                />
                <Label htmlFor="isActive">Activar procesamiento de pagos</Label>
              </div>

              <div className="flex gap-2 pt-6">
                <Button 
                  type="submit" 
                  disabled={updateConfigMutation.isPending}
                  className="flex-1"
                >
                  {updateConfigMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado Actual</CardTitle>
            <CardDescription>Resumen de la configuración de pagos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  paymentConfig?.isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {paymentConfig?.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Clave Pública:</span>
                <span className="text-xs text-muted-foreground">
                  {paymentConfig?.stripePublicKey ? "Configurada" : "No configurada"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Clave Secreta:</span>
                <span className="text-xs text-muted-foreground">
                  {paymentConfig?.stripeSecretKey ? "Configurada" : "No configurada"}
                </span>
              </div>
              {paymentConfig?.updatedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Última actualización:</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(paymentConfig.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}