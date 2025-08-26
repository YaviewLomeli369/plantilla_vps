// EJEMPLO DE USO DEL COMPONENTE AlternatingSection
// Este archivo es solo para documentación - no se usa en la aplicación

import React from "react";
import { Rocket, Users, CheckCircle } from "lucide-react";
import AlternatingSection from "@/components/AlternatingSection";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ExampleAlternatingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Ejemplo AlternatingSection - Sistema Modular"
        description="Ejemplo de uso del componente AlternatingSection"
      />
      <Navbar />

      {/* Primera sección con icono y cuadro a la izquierda */}
      <AlternatingSection 
        icon={<Rocket />} 
        background="#2563EB"
        delay={0}
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Impulsa tu negocio al siguiente nivel
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Esta es la primera sección de ejemplo con el cuadro decorativo a la izquierda.
          El icono de cohete representa innovación y crecimiento.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Comenzar ahora
        </button>
      </AlternatingSection>

      {/* Segunda sección con imagen y cuadro a la derecha */}
      <AlternatingSection 
        reverse={true}
        image="/public-objects/banner-example.jpg"
        delay={0.2}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Diseño profesional que impacta
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Aquí el cuadro aparece al lado contrario (derecha) con una imagen de fondo.
          El contenido se adapta automáticamente al nuevo layout.
        </p>
        <div className="flex gap-4">
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg">
            Ver galería
          </button>
          <button className="border border-green-600 text-green-600 px-6 py-2 rounded-lg">
            Más información
          </button>
        </div>
      </AlternatingSection>

      {/* Tercera sección con color sólido y cuadro a la izquierda */}
      <AlternatingSection 
        background="#25D366"
        icon={<Users />}
        delay={0.4}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Se adapta a tu equipo
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          El cuadro puede ser color sólido, ícono o imagen de fondo.
          Perfecto para mostrar características clave de tu negocio.
        </p>
        <ul className="text-gray-600 space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completamente configurable
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Responsive en todos los dispositivos
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Animaciones suaves incluidas
          </li>
        </ul>
      </AlternatingSection>

      {/* Cuarta sección ocultando el cuadro en móviles */}
      <AlternatingSection 
        reverse={true}
        background="#f59e0b"
        hideOnMobile={true}
        delay={0.6}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Optimizado para móviles
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Esta sección oculta el cuadro decorativo en pantallas pequeñas para
          mantener el contenido principal visible y legible.
        </p>
        <p className="text-sm text-gray-500">
          Usa la prop <code className="bg-gray-100 px-2 py-1 rounded">hideOnMobile=true</code> 
          cuando el contenido sea más importante que la decoración.
        </p>
      </AlternatingSection>

      <Footer />
    </div>
  );
}