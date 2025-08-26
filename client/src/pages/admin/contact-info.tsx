import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/layout/admin-layout";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Linkedin, Youtube, Video } from "lucide-react";

const contactInfoSchema = z.object({
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido"),
  address: z.string().min(1, "La dirección es requerida"),
  businessHours: z.string().min(1, "Los horarios son requeridos"),
  mapsUrl: z.string().url("URL de Google Maps inválida").optional().or(z.literal("")),
  facebook: z.string().url("URL de Facebook inválida").optional().or(z.literal("")),
  instagram: z.string().url("URL de Instagram inválida").optional().or(z.literal("")),
  twitter: z.string().url("URL de Twitter inválida").optional().or(z.literal("")),
  linkedin: z.string().url("URL de LinkedIn inválida").optional().or(z.literal("")),
  youtube: z.string().url("URL de YouTube inválida").optional().or(z.literal("")),
  tiktok: z.string().url("URL de TikTok inválida").optional().or(z.literal("")),
});

type ContactInfoFormData = z.infer<typeof contactInfoSchema>;

export default function AdminContactInfo() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: contactInfo } = useQuery({
    queryKey: ["/api/contact/info"],
  });

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      phone: "",
      email: "",
      address: "",
      businessHours: "",
      mapsUrl: "",
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      tiktok: "",
    },
  });

  // Actualizar formulario cuando cambian los datos - usando useEffect para evitar bucle infinito
  React.useEffect(() => {
    if (contactInfo && !form.formState.isDirty) {
      // Extract data from the correct format
      const socialLinks = (contactInfo as any)?.socialLinks || {};
      form.reset({
        phone: (contactInfo as any)?.phone || "",
        email: (contactInfo as any)?.email || "",
        address: (contactInfo as any)?.address || "",
        businessHours: (contactInfo as any)?.hours || "",
        mapsUrl: (contactInfo as any)?.mapsUrl || "",
        facebook: socialLinks.facebook || "",
        instagram: socialLinks.instagram || "",
        twitter: socialLinks.twitter || "",
        linkedin: socialLinks.linkedin || "",
        youtube: socialLinks.youtube || "",
        tiktok: socialLinks.tiktok || "",
      });
    }
  }, [contactInfo, form]);

  const updateContactInfo = useMutation({
    mutationFn: async (transformedData: any) => {
      return apiRequest("/api/contact/info", {
        method: "PUT",
        body: JSON.stringify(transformedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/info"] });
      toast({
        title: "Información actualizada",
        description: "La información de contacto ha sido actualizada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la información de contacto.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = React.useCallback(async (data: ContactInfoFormData) => {
    setIsLoading(true);
    try {
      // Transform data to match API format
      const transformedData = {
        phone: data.phone,
        email: data.email,
        address: data.address,
        hours: data.businessHours, // API uses 'hours' not 'businessHours'
        mapsUrl: data.mapsUrl,
        socialLinks: {
          facebook: data.facebook,
          instagram: data.instagram,
          twitter: data.twitter,
          linkedin: data.linkedin,
          youtube: data.youtube,
          tiktok: data.tiktok,
        }
      };
      
      await updateContactInfo.mutateAsync(transformedData);
    } finally {
      setIsLoading(false);
    }
  }, [updateContactInfo]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Información de Contacto</h1>
          <p className="text-muted-foreground">
            Configura la información de contacto que se muestra en el sitio web.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Configuración de Contacto
            </CardTitle>
            <CardDescription>
              Administra toda la información de contacto de tu empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Información Básica</TabsTrigger>
                    <TabsTrigger value="social">Redes Sociales</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Teléfono
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+52 555 123 4567" {...field} />
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
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contacto@empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Dirección
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Calle Principal #123, Colonia Centro, Ciudad, Estado, CP 12345"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Horarios de Atención
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Lunes a Viernes: 9:00 AM - 6:00 PM&#10;Sábado: 9:00 AM - 2:00 PM&#10;Domingo: Cerrado"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Especifica los horarios de atención al cliente.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mapsUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Google Maps</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://maps.google.com/..."
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            URL del mapa de Google Maps para mostrar tu ubicación.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Facebook className="h-4 w-4" />
                              Facebook
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://facebook.com/tupagina" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Instagram className="h-4 w-4" />
                              Instagram
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://instagram.com/tuusuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Twitter className="h-4 w-4" />
                              Twitter
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://twitter.com/tuusuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/company/tuempresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Youtube className="h-4 w-4" />
                              YouTube
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://youtube.com/@tucanal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tiktok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              TikTok
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://tiktok.com/@tuusuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || updateContactInfo.isPending}
                  >
                    {(isLoading || updateContactInfo.isPending) ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}