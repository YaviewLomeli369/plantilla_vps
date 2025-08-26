import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Settings, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ReservationSettings, InsertReservationSettings } from "@shared/schema";

interface BusinessDay {
  enabled: boolean;
  open: string;
  close: string;
}

interface BusinessHours {
  monday: BusinessDay;
  tuesday: BusinessDay;
  wednesday: BusinessDay;
  thursday: BusinessDay;
  friday: BusinessDay;
  saturday: BusinessDay;
  sunday: BusinessDay;
}

export default function AdminReservationSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [settings, setSettings] = useState<InsertReservationSettings>({
    businessHours: {
      monday: { enabled: true, open: "09:00", close: "18:00" },
      tuesday: { enabled: true, open: "09:00", close: "18:00" },
      wednesday: { enabled: true, open: "09:00", close: "18:00" },
      thursday: { enabled: true, open: "09:00", close: "18:00" },
      friday: { enabled: true, open: "09:00", close: "18:00" },
      saturday: { enabled: false, open: "09:00", close: "18:00" },
      sunday: { enabled: false, open: "09:00", close: "18:00" }
    },
    defaultDuration: 60,
    bufferTime: 15,
    maxAdvanceDays: 30,
    allowedServices: ["Consulta general", "Cita especializada", "Reunión"],
    isActive: true
  });

  const [services, setServices] = useState<string>("");

  const { data: currentSettings, isLoading } = useQuery<ReservationSettings>({
    queryKey: ["/api/reservation-settings"],
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        businessHours: currentSettings.businessHours as BusinessHours,
        defaultDuration: currentSettings.defaultDuration || 60,
        bufferTime: currentSettings.bufferTime || 15,
        maxAdvanceDays: currentSettings.maxAdvanceDays || 30,
        allowedServices: currentSettings.allowedServices as string[],
        isActive: currentSettings.isActive || true
      });
      setServices((currentSettings.allowedServices as string[]).join(", "));
    }
  }, [currentSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: InsertReservationSettings) => {
      const response = await fetch("/api/reservation-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error("Failed to update settings");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "Las configuraciones de reservas se han actualizado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reservation-settings"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración."
      });
    },
  });

  const handleBusinessHourChange = (day: keyof BusinessHours, field: keyof BusinessDay, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours as BusinessHours,
        [day]: {
          ...(prev.businessHours as BusinessHours)[day],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    const serviceList = services.split(",").map(s => s.trim()).filter(s => s.length > 0);
    
    const updatedSettings = {
      ...settings,
      allowedServices: serviceList
    };

    updateSettingsMutation.mutate(updatedSettings);
  };

  const dayLabels = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo"
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Configuración de Reservas</h1>
            <p className="text-muted-foreground mt-2">
              Configure horarios de atención, duración de citas y servicios disponibles
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateSettingsMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Horarios de Atención
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(dayLabels).map(([day, label]) => {
                const daySettings = (settings.businessHours as BusinessHours)[day as keyof BusinessHours];
                return (
                  <div key={day} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex items-center space-x-2 min-w-[100px]">
                      <Switch
                        checked={daySettings.enabled}
                        onCheckedChange={(checked) => 
                          handleBusinessHourChange(day as keyof BusinessHours, 'enabled', checked)
                        }
                      />
                      <Label className="font-medium">{label}</Label>
                    </div>
                    
                    {daySettings.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={daySettings.open}
                          onChange={(e) => 
                            handleBusinessHourChange(day as keyof BusinessHours, 'open', e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">a</span>
                        <Input
                          type="time"
                          value={daySettings.close}
                          onChange={(e) => 
                            handleBusinessHourChange(day as keyof BusinessHours, 'close', e.target.value)
                          }
                          className="w-32"
                        />
                        <Badge variant="secondary">Abierto</Badge>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <Badge variant="outline">Cerrado</Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* General Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Configuración de Tiempo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultDuration">Duración por Defecto (minutos)</Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={settings.defaultDuration?.toString() || "60"}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      defaultDuration: parseInt(e.target.value) || 60
                    }))}
                    min="15"
                    max="480"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Tiempo predeterminado para cada cita
                  </p>
                </div>

                <div>
                  <Label htmlFor="bufferTime">Tiempo de Separación (minutos)</Label>
                  <Input
                    id="bufferTime"
                    type="number"
                    value={settings.bufferTime?.toString() || "15"}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      bufferTime: parseInt(e.target.value) || 15
                    }))}
                    min="0"
                    max="60"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Tiempo entre citas para preparación
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxAdvanceDays">Días Máximos de Anticipación</Label>
                  <Input
                    id="maxAdvanceDays"
                    type="number"
                    value={settings.maxAdvanceDays?.toString() || "30"}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maxAdvanceDays: parseInt(e.target.value) || 30
                    }))}
                    min="1"
                    max="365"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Qué tan adelante pueden reservar los usuarios
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Servicios Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="services">Servicios (separados por comas)</Label>
                  <Input
                    id="services"
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="Consulta general, Cita especializada, Reunión"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Lista de servicios que los usuarios pueden seleccionar
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.isActive || false}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      isActive: checked
                    }))}
                  />
                  <Label>Sistema de reservas activo</Label>
                </div>
                
                {!settings.isActive && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg mt-3">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      El sistema de reservas está desactivado. Los usuarios no podrán crear nuevas reservas.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}