import React, { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { InlineTextarea } from "@/components/inline-editor/InlineTextarea";
import AnimatedSection from "@/components/AnimatedSection";
import AlternatingSection from "@/components/AlternatingSection";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Rocket, Users, Target, Star, Check } from "lucide-react";
import type { SiteConfig, Section, Testimonial } from "@shared/schema";

const plans = [
  {
    name: "Esencial",
    price: "2,900 MXN",
    description: "Presencia básica para iniciar en internet.",
    features: [
      "Página de inicio",
      "Blog y FAQs",
      "Módulo de contacto",
      "Reservas básicas",
      "Optimización móvil",
      "Contenido de ejemplo cargado",
    ],
    highlight: false,
  },
  {
    name: "Profesional",
    price: "4,900 MXN",
    description: "El plan más popular para negocios en crecimiento.",
    features: [
      "Todo lo del plan Esencial",
      "Tienda online (hasta 20 productos)",
      "Personalización de colores y logo",
      "Formularios conectados a correo/WhatsApp",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    price: "7,900 MXN",
    description: "Para negocios que buscan escalar y automatizar.",
    features: [
      "Todo lo del plan Profesional",
      "Reservas avanzadas con calendario",
      "Pagos en línea (Stripe, PayPal, MercadoPago)",
      "SEO básico en blog",
      "Secciones personalizadas (galería, testimonios)",
    ],
    highlight: false,
  },
];


const PlanCard = ({ plan }: { plan: typeof plans[0] }) => {
  const WHATSAPP_NUMBER = "525525114175"; // tu número
  const message = encodeURIComponent(
    `Hola, estoy interesado en el plan "${plan.name}" (${plan.price}). Me gustaría recibir más información y detalles para poder tomar una decisión. ¡Gracias!`
  );
  const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}&app_absent=0`;

  // Precio anterior (10-15% más alto) tachado para efecto de marketing
  const priceValue = parseInt(plan.price.replace(/\D/g, "")); // elimina letras y símbolos
  const oldPrice = priceValue ? `${(priceValue * 1.15).toLocaleString()} MXN` : null;

  return (
    <div
      className={`relative rounded-2xl shadow-xl p-8 flex flex-col transform transition duration-300 hover:scale-105 ${
        plan.highlight
          ? "bg-white border-2 border-blue-600 shadow-blue-100"
          : "bg-white border border-gray-200"
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
            <Star className="h-4 w-4" /> Más vendido
          </span>
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2 text-gray-800 text-center">{plan.name}</h3>
      <p className="text-gray-500 mb-4 text-center">{plan.description}</p>

      <div className="text-center mb-6">
        {oldPrice && (
          <span className="text-gray-400 line-through mr-2 text-lg">{oldPrice}</span>
        )}
        <span className="text-4xl font-extrabold text-blue-600">{plan.price}</span>
      </div>

      <ul className="space-y-3 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Mensaje de marketing profesional opcional */}
      <p className="mt-4 text-sm text-gray-500 text-center">
        Todos nuestros planes incluyen soporte prioritario y actualizaciones continuas.
      </p>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-center transition duration-300 ${
          plan.highlight
            ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
      >
        Solicitar más información
      </a>
    </div>
  );
};



function Home() {
  const { data: config, isLoading: configLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperuser = useMemo(() => user?.role === "superuser", [user?.role]);

  const updateSectionMutation = useMutation({
    mutationFn: useCallback(async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/sections/${id}`, { method: "PUT", body: JSON.stringify(data) });
    }, []),
    onSuccess: useCallback(() => queryClient.invalidateQueries({ queryKey: ["/api/sections"] }), [queryClient]),
  });

  const featuredTestimonials = useMemo(
    () => testimonials?.filter(t => t.isFeatured && t.isApproved).slice(0, 3) || [],
    [testimonials]
  );

  const { appearance, frontpage, modules } = useMemo(() => {
    const configData = config?.config as any;
    return {
      appearance: configData?.appearance || {},
      frontpage: configData?.frontpage || {},
      modules: configData?.frontpage?.modulos || {},
    };
  }, [config]);

  const getIconComponent = useCallback((iconType: string = "rocket") => {
    const iconMap: { [key: string]: JSX.Element } = {
      rocket: <Rocket />,
      users: <Users />,
      target: <Target />,
      star: <Star />,
    };
    return iconMap[iconType] || <Rocket />;
  }, []);

  const fallbackColors = useMemo(() => ["#2563EB", "#25D366", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"], []);

  if (configLoading || sectionsLoading || testimonialsLoading) {
    return <PageLoader message="Cargando contenido del sitio..." />;
  }



  return (
    <div
      className="min-h-screen bg-background overflow-x-hidden"
      style={{
        backgroundColor: appearance.backgroundColor || "inherit",
        color: appearance.textColor || "inherit",
        fontFamily: appearance.fontFamily || "inherit",
      }}
    >
      <SEOHead
        title={appearance.metaTitle || appearance.brandName}
        description={appearance.metaDescription}
        image={appearance.ogImage}
      />
      <Navbar />

      {/* Hero Section */}
      <AnimatedSection>
        <section
          className="relative py-20 text-white"
          style={{
            backgroundImage: `url("https://plus.unsplash.com/premium_vector-1697729495822-c971c4a69f03?q=80&w=881&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            fontFamily: appearance.fontFamily || "inherit",
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              {frontpage?.contenidos?.titulo || appearance.brandName || "Bienvenido a Nuestro Sistema"}
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              {frontpage?.contenidos?.subtitulo || appearance.tagline || "Calidad y Servicio a tu Alcance"}
            </p>
            <div className="space-x-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">Contáctanos</Link>
              </Button>
              {modules.tienda?.activo && (
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-primary transition-all duration-300 shadow-md"
                  asChild
                >
                  <Link href="/store">Ver Tienda</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Plans Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">Planes diseñados para tu negocio</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Elige el plan que mejor se ajuste a tus objetivos. Todos incluyen soporte y actualizaciones básicas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {plans.map((plan, index) => (
              <PlanCard key={index} plan={plan} />
            ))}
          </div>
        </div>
      </section>


      

      {/* Dynamic Sections */}
      {sections?.filter(s => s.isActive).map((section, index) => {
        const sectionConfig = (section as any).config || {};
        const alternatingConfig = sectionConfig.alternating || {};
        return (
          <AlternatingSection
            key={section.id}
            reverse={alternatingConfig.forceReverse !== undefined ? alternatingConfig.forceReverse : index % 2 === 1}
            icon={alternatingConfig.showDecorative !== false ? getIconComponent(alternatingConfig.iconType) : undefined}
            background={alternatingConfig.backgroundColor || fallbackColors[index % fallbackColors.length]}
            image={alternatingConfig.backgroundImage}
            hideOnMobile={alternatingConfig.hideOnMobile || false}
            delay={0.8 + index * 0.2}
          >
            {isSuperuser ? (
              <>
                <InlineEditor
                  value={section.name || ""}
                  onSave={async newValue => {
                    await updateSectionMutation.mutateAsync({ id: section.id, data: { name: newValue } });
                  }}
                  placeholder="Nombre de la sección..."
                  className="text-3xl font-bold mb-4 block"
                  tag="h2"
                />
                <InlineTextarea
                  value={section.content || ""}
                  onSave={async newValue => {
                    await updateSectionMutation.mutateAsync({ id: section.id, data: { content: newValue } });
                  }}
                  placeholder="Contenido de la sección..."
                  className="text-lg mb-6 opacity-80"
                  rows={4}
                />
              </>
            ) : (
              <>
                {section.name && (
                  <h2 className="text-3xl font-bold mb-4" style={{ color: appearance.textColor, fontFamily: appearance.fontFamily }}>
                    {section.name}
                  </h2>
                )}
                {section.content && (
                  <p className="text-lg mb-6 opacity-80" style={{ color: appearance.textColor, fontFamily: appearance.fontFamily }}>
                    {section.content}
                  </p>
                )}
              </>
            )}
          </AlternatingSection>
        );
      })}


      

      {/* Featured Testimonials */}
      {/* Testimonials Section */}
      <AnimatedSection delay={0.2}>
        <section
          className="py-16"
          style={{
            backgroundColor: appearance.backgroundColor
              ? `${appearance.backgroundColor}20` // transparencia 20%
              : "var(--muted)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold mb-4"
                style={{
                  color: appearance.textColor || "#111",
                  fontFamily: appearance.fontFamily || "sans-serif",
                }}
              >
                Lo que Dicen Nuestros Clientes
              </h2>
              <p
                className="text-lg opacity-80"
                style={{
                  color: appearance.textColor || "#444",
                  fontFamily: appearance.fontFamily || "sans-serif",
                }}
              >
                Testimonios reales de clientes satisfechos
              </p>
            </div>

            {/* Grid de testimonios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials && testimonials.length > 0 ? (
                testimonials
                  .filter(t => t.isApproved)
                  .map((testimonial) => (
                    <Card
                      key={testimonial.id}
                      className="h-full border rounded-xl shadow-sm"
                      style={{
                        backgroundColor: appearance.backgroundColor
                          ? `${appearance.backgroundColor}10`
                          : "#fff",
                        borderColor: appearance.primaryColor
                          ? `${appearance.primaryColor}30`
                          : "#e2e8f0",
                      }}
                    >
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Rating */}
                        <div className="flex items-center mb-4">
                          {[...Array(testimonial.rating ?? 5)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-xl">★</span>
                          ))}
                          {[...Array(5 - (testimonial.rating ?? 5))].map((_, i) => (
                            <span key={i} className="text-gray-300 text-xl">★</span>
                          ))}
                        </div>

                        {/* Testimonial content */}
                        <blockquote
                          className="mb-4 flex-grow opacity-90"
                          style={{
                            color: appearance.textColor || "#111",
                            fontFamily: appearance.fontFamily || "sans-serif",
                          }}
                        >
                          "{testimonial.content}"
                        </blockquote>

                        {/* Author */}
                        <div
                          className="text-sm font-semibold mt-auto"
                          style={{
                            color: appearance.textColor || "#111",
                            fontFamily: appearance.fontFamily || "sans-serif",
                          }}
                        >
                          {testimonial.name}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                // Fallback si no hay testimonios
                <Card className="col-span-1 md:col-span-3 text-center py-16">
                  <CardContent>
                    <p className="text-gray-600 text-lg">Aún no hay testimonios. ¡Sé el primero en compartir tu experiencia!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}

export default React.memo(Home);
