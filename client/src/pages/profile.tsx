import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Save,
  Edit,
  Check
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update profile data when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Redirect if not logged in
  if (!isLoading && !user) {
    setLocation("/login");
    return null;
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return await apiRequest(`/api/users/${user?.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      return await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cambiar la contraseña. Verifica tu contraseña actual.",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    updatePasswordMutation.mutate(passwordData);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "superuser":
        return { label: "Super Administrador", color: "destructive" as const, icon: Shield };
      case "admin":
        return { label: "Administrador", color: "default" as const, icon: Shield };
      case "staff":
        return { label: "Staff", color: "secondary" as const, icon: User };
      default:
        return { label: "Cliente", color: "outline" as const, icon: User };
    }
  };

  const roleInfo = user ? getRoleInfo(user.role) : getRoleInfo("cliente");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{user?.username}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <Badge variant={roleInfo.color} className="mt-2">
                    <roleInfo.icon className="h-3 w-3 mr-1" />
                    {roleInfo.label}
                  </Badge>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado de cuenta:</span>
                    <Badge variant={user?.isActive ? "default" : "secondary"}>
                      {user?.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Información Personal</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Información Personal
                      </CardTitle>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(true);
                            setProfileData({
                              username: user?.username || "",
                              email: user?.email || "",
                            });
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Nombre de Usuario</Label>
                          <Input
                            id="username"
                            value={profileData.username}
                            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="flex items-center space-x-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-600">Nombre de Usuario</Label>
                            <p className="font-medium">{user?.username}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-600">Email</Label>
                            <p className="font-medium">{user?.email}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-600">Rol</Label>
                            <div>
                              <Badge variant={roleInfo.color}>
                                <roleInfo.icon className="h-3 w-3 mr-1" />
                                {roleInfo.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-600">Estado</Label>
                            <div>
                              <Badge variant={user?.isActive ? "default" : "secondary"}>
                                <Check className="h-3 w-3 mr-1" />
                                {user?.isActive ? "Cuenta Activa" : "Cuenta Inactiva"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Cambiar Contraseña
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                          minLength={6}
                        />
                        <p className="text-sm text-gray-500">Mínimo 6 caracteres</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                          minLength={6}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          disabled={updatePasswordMutation.isPending}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          {updatePasswordMutation.isPending ? "Actualizando..." : "Cambiar Contraseña"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}