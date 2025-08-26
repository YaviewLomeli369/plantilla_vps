import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Shield, UserPlus, Crown, Settings } from "lucide-react";

const createAdminSchema = insertUserSchema.extend({
  role: z.enum(['superuser', 'admin', 'staff']),
  securityCode: z.string().min(1, "Código de seguridad requerido"),
});

type CreateAdminForm = z.infer<typeof createAdminSchema>;

export default function CreateAdmin() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "admin",
      securityCode: "",
      isActive: true,
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: (userData: CreateAdminForm) =>
      apiRequest("/api/auth/create-admin", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    onSuccess: (data) => {
      setIsSuccess(true);
      form.reset();
      toast({
        title: "Éxito",
        description: `Cuenta de ${data.user.role} creada correctamente para ${data.user.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al crear la cuenta",
      });
    },
  });

  const requestCodeMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/auth/request-admin-code", {
        method: "POST",
        body: JSON.stringify({ email: "yaview.lomeli@gmail.com" }),
      }),
    onSuccess: () => {
      setCodeRequested(true);
      toast({
        title: "Código generado",
        description: "Revisa la consola del servidor para ver tu código de seguridad",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al generar código",
      });
    },
  });

  const onSubmit = (data: CreateAdminForm) => {
    createAdminMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superuser':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'staff':
        return <Settings className="h-5 w-5 text-green-600" />;
      default:
        return <UserPlus className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'superuser':
        return "Acceso completo al sistema, puede gestionar todo incluyendo otros administradores";
      case 'admin':
        return "Acceso administrativo completo, puede gestionar contenido y usuarios clientes";
      case 'staff':
        return "Acceso limitado de staff, puede gestionar contenido básico";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Crear Cuenta Administrativa</CardTitle>
            <CardDescription>
              Crear cuentas de superusuario, administrador o staff
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSuccess && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Cuenta administrativa creada exitosamente. Ya puedes usar las credenciales para iniciar sesión.
                </AlertDescription>
              </Alert>
            )}

            {!codeRequested && (
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="space-y-3">
                    <p><strong>Paso 1:</strong> Solicita un código de seguridad</p>
                    <p className="text-sm">Se generará un código único que aparecerá en la consola del servidor.</p>
                    <Button 
                      onClick={() => requestCodeMutation.mutate()}
                      disabled={requestCodeMutation.isPending}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {requestCodeMutation.isPending ? "Generando..." : "Generar Código de Seguridad"}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {codeRequested && (
              <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                <Shield className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="space-y-2">
                    <p><strong>Paso 2:</strong> Revisa la consola del servidor</p>
                    <p className="text-sm">El código de seguridad se ha generado y aparece en los logs del servidor. Cópialo e ingrésalo abajo.</p>
                    <p className="text-xs text-yellow-700">El código expira en 10 minutos por seguridad.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cuenta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de cuenta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="superuser">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-purple-600" />
                              Superusuario
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-600" />
                              Administrador
                            </div>
                          </SelectItem>
                          <SelectItem value="staff">
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-green-600" />
                              Staff
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {field.value && (
                        <div className="flex items-start gap-2 mt-2 p-3 bg-gray-50 rounded-md">
                          {getRoleIcon(field.value)}
                          <p className="text-sm text-gray-600">{getRoleDescription(field.value)}</p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="securityCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Seguridad</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Código de la consola del servidor" 
                          {...field} 
                          disabled={!codeRequested}
                          className="font-mono"
                        />
                      </FormControl>
                      {!codeRequested && (
                        <p className="text-sm text-gray-500">
                          Primero solicita un código de seguridad arriba
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createAdminMutation.isPending || !codeRequested}
                >
                  {createAdminMutation.isPending ? (
                    "Creando cuenta..."
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Crear Cuenta Administrativa
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                Esta página es para crear cuentas administrativas del sistema.
                <br />
                Para cuentas de cliente, usa el registro normal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}