import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig, InsertReservation, ReservationSettings } from "@shared/schema";
import { Calendar, Clock, Users, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

export default function Reservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"]
  });

  const configData = config?.config as any;
  const appearance = configData?.appearance || {};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    timeSlot: "",
    notes: "",
  });

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const { data: reservationSettings } = useQuery<ReservationSettings>({
    queryKey: ["/api/reservation-settings"],
  });

  const { data: slotsData } = useQuery({
    queryKey: ["/api/reservations/available-slots", selectedDate],
    enabled: !!selectedDate,
    queryFn: async () => {
      if (!selectedDate) return null;
      const response = await fetch(`/api/reservations/available-slots/${selectedDate}`);
      return response.json();
    }
  });

  useEffect(() => {
    if (slotsData?.availableSlots) {
      setAvailableSlots(slotsData.availableSlots);
    }
  }, [slotsData]);

  const createReservationMutation = useMutation({
    mutationFn: async (data: InsertReservation) => {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create reservation");
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Reserva creada exitosamente",
        description: "Su reserva ha sido procesada correctamente"
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        date: "",
        timeSlot: "",
        notes: "",
      });
      setSelectedDate("");
      setAvailableSlots([]);
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive",
        title: "Error al crear la reserva",
        description: error?.message || "No se pudo procesar su solicitud"
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.date || !formData.timeSlot) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios"
      });
      return;
    }

    const reservationData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      service: formData.service || null,
      timeSlot: formData.timeSlot,
      notes: formData.notes || null,
      date: formData.date,
      status: "pending",
    };

    createReservationMutation.mutate(reservationData);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, date, timeSlot: "" }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background" style={{ 
      backgroundColor: appearance.backgroundColor || 'inherit',
      color: appearance.textColor || 'inherit',
      fontFamily: appearance.fontFamily || 'inherit'
    }}>
      <SEOHead 
        title={`Reservas - ${appearance.brandName || "Sistema Modular"}`}
        description="Haga su reserva con nosotros de manera fácil y rápida"
      />
      <Navbar />
      
      {/* Hero Section */}
      <AnimatedSection>
        <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: appearance.fontFamily || 'inherit' }}>
            Sistema de Reservas
          </h1>
          <p className="text-xl text-blue-100" style={{ fontFamily: appearance.fontFamily || 'inherit' }}>
            Reserve su cita de manera fácil y rápida con nuestro sistema automatizado
          </p>
        </div>
        </section>
      </AnimatedSection>

      {/* Reservation Form */}
      <AnimatedSection delay={0.2}>
        <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Clock className="w-6 h-6" />
                Nueva Reserva
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!reservationSettings?.isActive ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    El sistema de reservas no está disponible en este momento. Por favor, contacte directamente para solicitar una cita.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nombre completo *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Su nombre completo"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Correo electrónico *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="su@email.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 234 567 8900"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="service">Tipo de servicio</Label>
                      <Select value={formData.service} onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {(reservationSettings?.allowedServices as string[] || []).map((service: string) => (
                            <SelectItem key={service} value={service}>{service}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Fecha *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        max={(() => {
                          const maxDays = reservationSettings?.maxAdvanceDays || 30;
                          const maxDate = new Date();
                          maxDate.setDate(maxDate.getDate() + maxDays);
                          return maxDate.toISOString().split('T')[0];
                        })()}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeSlot">Hora disponible *</Label>
                      <Select 
                        value={formData.timeSlot} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, timeSlot: value }))}
                        disabled={!selectedDate}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedDate ? "Seleccione una hora" : "Primero seleccione una fecha"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {slot}
                                </div>
                              </SelectItem>
                            ))
                          ) : selectedDate ? (
                            <SelectItem value="no-slots" disabled>No hay horarios disponibles</SelectItem>
                          ) : null}
                        </SelectContent>
                      </Select>
                      {selectedDate && availableSlots.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          No hay horarios disponibles para esta fecha. Intente con otra fecha.
                        </p>
                      )}
                      {selectedDate && availableSlots.length > 0 && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {availableSlots.length} horarios disponibles
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Cualquier información adicional sobre su cita..."
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createReservationMutation.isPending || !formData.timeSlot}
                  >
                    {createReservationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Solicitar Reserva
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Business Hours Info */}
          {reservationSettings?.isActive && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Información de Horarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Duración de citas:</h4>
                    <Badge variant="secondary">{reservationSettings.defaultDuration} minutos</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tiempo de separación:</h4>
                    <Badge variant="secondary">{reservationSettings.bufferTime} minutos</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Reservas con anticipación:</h4>
                    <Badge variant="secondary">Hasta {reservationSettings.maxAdvanceDays} días</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Servicios disponibles:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(reservationSettings.allowedServices as string[] || []).map((service: string) => (
                        <Badge key={service} variant="outline">{service}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}