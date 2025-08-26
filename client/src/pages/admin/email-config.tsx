import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Mail, Send, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";

interface EmailConfig {
  id?: string;
  fromEmail: string;
  replyToEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  isActive: boolean;
  lastTested?: string;
  testStatus?: 'success' | 'failed' | 'pending';
}

export default function AdminEmailConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testingConnection, setTestingConnection] = useState(false);

  const { data: emailConfig, isLoading } = useQuery({
    queryKey: ["/api/email/config"],
    retry: false,
  });

  const [config, setConfig] = useState<EmailConfig>({
    fromEmail: "",
    replyToEmail: "",
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPass: "",
    isActive: false,
  });

  // Update form when data loads
  useEffect(() => {
    if (emailConfig && typeof emailConfig === 'object') {
      setConfig({
        fromEmail: (emailConfig as any).fromEmail || "",
        replyToEmail: (emailConfig as any).replyToEmail || "",
        smtpHost: (emailConfig as any).smtpHost || "",
        smtpPort: (emailConfig as any).smtpPort || 587,
        smtpSecure: (emailConfig as any).smtpSecure || false,
        smtpUser: (emailConfig as any).smtpUser || "",
        smtpPass: (emailConfig as any).smtpPass || "",
        isActive: (emailConfig as any).isActive || false,
      });
    }
  }, [emailConfig]);

  const saveConfigMutation = useMutation({
    mutationFn: async (data: EmailConfig) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/email/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Error al guardar la configuración");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración de email se guardó correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/config"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la configuración",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/email/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error("Error al probar la conexión");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Conexión exitosa",
        description: "La conexión SMTP funciona correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/config"] });
    },
    onError: (error) => {
      toast({
        title: "Error de conexión",
        description: error instanceof Error ? error.message : "No se pudo conectar al servidor SMTP",
        variant: "destructive",
      });
    },
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/email/send-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          to: config.replyToEmail,
          subject: "Email de prueba - Sistema de contacto",
          content: "Este es un email de prueba para verificar que la configuración funciona correctamente."
        }),
      });
      if (!response.ok) {
        throw new Error("Error al enviar email de prueba");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: `Email de prueba enviado a ${config.replyToEmail}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al enviar",
        description: error instanceof Error ? error.message : "No se pudo enviar el email de prueba",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    testConnectionMutation.mutate();
    setTimeout(() => setTestingConnection(false), 3000);
  };

  const handleSendTestEmail = () => {
    sendTestEmailMutation.mutate();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  const getStatusBadge = () => {
    if (!emailConfig || !(emailConfig as any).lastTested) {
      return <Badge variant="secondary">No probado</Badge>;
    }
    
    if ((emailConfig as any).testStatus === 'success') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Funcionando</Badge>;
    }
    
    return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Con errores</Badge>;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configuración de Email</h1>
            <p className="text-gray-600">Configura el servidor SMTP para envío de emails</p>
          </div>
          {getStatusBadge()}
        </div>

        <Alert className="mb-6">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>¿Cómo obtener credenciales SMTP?</strong><br />
            • <strong>Gmail:</strong> Usa "Contraseñas de aplicación" en tu cuenta de Google<br />
            • <strong>Outlook:</strong> Configura SMTP con tu contraseña normal<br />
            • <strong>Proveedores profesionales:</strong> SendGrid, Mailgun, Amazon SES, etc.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          {/* Configuración Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Básica</CardTitle>
              <CardDescription>
                Dirección de email que aparecerá como remitente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email remitente *</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    placeholder="noreply@tuempresa.com"
                    value={config.fromEmail}
                    onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyToEmail">Email de respuesta *</Label>
                  <Input
                    id="replyToEmail"
                    type="email"
                    placeholder="contacto@tuempresa.com"
                    value={config.replyToEmail}
                    onChange={(e) => setConfig({ ...config, replyToEmail: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración SMTP */}
          <Card>
            <CardHeader>
              <CardTitle>Servidor SMTP</CardTitle>
              <CardDescription>
                Configuración del servidor de email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="smtpHost">Servidor SMTP *</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={config.smtpHost}
                    onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Puerto</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    placeholder="587"
                    value={config.smtpPort}
                    onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) || 587 })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={config.smtpSecure}
                  onCheckedChange={(checked) => setConfig({ ...config, smtpSecure: checked })}
                />
                <Label htmlFor="smtpSecure">Conexión segura (SSL/TLS)</Label>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Usuario SMTP *</Label>
                  <Input
                    id="smtpUser"
                    type="email"
                    placeholder="tu-email@gmail.com"
                    value={config.smtpUser}
                    onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPass">Contraseña SMTP *</Label>
                  <Input
                    id="smtpPass"
                    type="password"
                    placeholder="Contraseña o token de aplicación"
                    value={config.smtpPass}
                    onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado y Pruebas */}
          <Card>
            <CardHeader>
              <CardTitle>Estado y Pruebas</CardTitle>
              <CardDescription>
                Verifica que la configuración funcione correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={config.isActive}
                  onCheckedChange={(checked) => setConfig({ ...config, isActive: checked })}
                />
                <Label htmlFor="isActive">Activar envío de emails</Label>
              </div>

              <Separator />

              <div className="flex gap-3">
                {/* <Button
                  onClick={handleTestConnection}
                  variant="outline"
                  disabled={testingConnection || testConnectionMutation.isPending}
                >
                  {testingConnection ? "Probando..." : "Probar Conexión"}
                </Button> */}
                
                <Button
                  onClick={handleSendTestEmail}
                  variant="outline"
                  disabled={sendTestEmailMutation.isPending || !config.replyToEmail}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendTestEmailMutation.isPending ? "Enviando..." : "Enviar Email de Prueba"}
                </Button>
              </div>

              {emailConfig && (emailConfig as any).lastTested && (
                <div className="text-sm text-gray-500">
                  Última prueba: {new Date((emailConfig as any).lastTested).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSave}
              disabled={saveConfigMutation.isPending}
              className="min-w-32"
            >
              {saveConfigMutation.isPending ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}