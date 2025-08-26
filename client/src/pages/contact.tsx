import { useState } from "react";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  Facebook,
  Instagram,
  MessageSquare
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ContactInfo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  const { data: contactInfo, isLoading, error } = useQuery<ContactInfo>({
    queryKey: ["/api/contact/info"],
    queryFn: async () => {
      const res = await fetch("/api/contact/info");
      if (!res.ok) {
        throw new Error("Failed to fetch contact info");
      }
      return await res.json();
    },
    retry: false,
  });

  // Debug logging
  React.useEffect(() => {
    if (error) {
      console.error("Contact Info Query Error:", error);
    }
    if (contactInfo) {
      console.log("Contact Info Data:", contactInfo);
    }
  }, [error, contactInfo]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/contact/messages", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast({
        title: "¡Mensaje enviado!",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <AnimatedSection>
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              ¿Tienes alguna pregunta? Nos encantaría ayudarte
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <AnimatedSection delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Envíanos un Mensaje
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange("subject")}
                    placeholder="¿De qué quieres hablarnos?"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange("message")}
                    required
                    rows={6}
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Contact Information */}
            <AnimatedSection delay={0.4}>
              <div className="space-y-6">
                <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : (
                  <>
                    {contactInfo?.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Teléfono</h3>
                          <p className="text-gray-600">{contactInfo.phone}</p>
                        </div>
                      </div>
                    )}

                    {contactInfo?.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Email</h3>
                          <p className="text-gray-600">{contactInfo.email}</p>
                        </div>
                      </div>
                    )}

                    {contactInfo?.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Dirección</h3>
                          <p className="text-gray-600">{contactInfo.address}</p>
                        </div>
                      </div>
                    )}

                    {contactInfo?.hours && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Horarios</h3>
                          <p className="text-gray-600 whitespace-pre-line">{contactInfo.hours}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            {contactInfo?.socialLinks && 
             typeof contactInfo.socialLinks === 'object' && 
             Object.values(contactInfo.socialLinks).some(link => link && link !== '') && (
              <Card>
                <CardHeader>
                  <CardTitle>Síguenos en Redes Sociales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {(contactInfo.socialLinks as any).facebook && (contactInfo.socialLinks as any).facebook !== '' && (
                      <a
                        href={(contactInfo.socialLinks as any).facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                    )}
                    {(contactInfo.socialLinks as any).instagram && (contactInfo.socialLinks as any).instagram !== '' && (
                      <a
                        href={(contactInfo.socialLinks as any).instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    )}
                    {(contactInfo.socialLinks as any).twitter && (contactInfo.socialLinks as any).twitter !== '' && (
                      <a
                        href={(contactInfo.socialLinks as any).twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                    {(contactInfo.socialLinks as any).linkedin && (contactInfo.socialLinks as any).linkedin !== '' && (
                      <a
                        href={(contactInfo.socialLinks as any).linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {(contactInfo.socialLinks as any).youtube && (contactInfo.socialLinks as any).youtube !== '' && (
                      <a
                        href={(contactInfo.socialLinks as any).youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        YouTube
                      </a>
                    )}
                    {(contactInfo.socialLinks as any).tiktok && (contactInfo.socialLinks as any).tiktok !== '' && (
                      <a
                        href={(contactInfo.socialLinks as any).tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        TikTok
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Response Time Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Tiempo de Respuesta
                </h3>
                <p className="text-blue-700 text-sm">
                  Normalmente respondemos dentro de las 24 horas. Para consultas urgentes, 
                  puedes contactarnos directamente por teléfono.
                </p>
              </CardContent>
              </Card>
              </div>
            </AnimatedSection>
          </div>

          {/* Map Section */}
          {contactInfo?.address && (
            <AnimatedSection delay={0.6}>
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Nuestra Ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"> */}
                    {contactInfo.mapsUrl ? (
                      <iframe
                        src={contactInfo.mapsUrl}
                        title="Ubicación"
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    ) : (
                      <div className="text-center text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-medium">{contactInfo.address}</p>
                        <p className="text-sm mt-2">Mapa interactivo disponible próximamente</p>
                      </div>
                    )}
                  {/* </div> */}
                </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
}
