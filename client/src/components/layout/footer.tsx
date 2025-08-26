import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { ContactInfo, SiteConfig } from "@shared/schema";

export function Footer() {
  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact/info"],
  });

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const configData = config?.config as any;
  const appearance = configData?.appearance || {};

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{appearance.brandName || "Sistema Modular"}</h3>
            <p className="text-gray-300 text-sm">
              {appearance.tagline || "Plantilla web modular y reutilizable para crear sitios completos configurables por JSON."}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2 text-sm text-gray-300">
              {contactInfo?.email && (
                <p>Email: {contactInfo.email}</p>
              )}
              {contactInfo?.phone && (
                <p>Teléfono: {contactInfo.phone}</p>
              )}
              {contactInfo?.address && (
                <p>Dirección: {contactInfo.address}</p>
              )}
              {contactInfo?.hours && (
                <p>Horarios: {contactInfo.hours}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
            <div className="flex space-x-4">
              {contactInfo?.socialLinks && (contactInfo.socialLinks as any)?.facebook && (
                <a
                  href={(contactInfo.socialLinks as any).facebook}
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              )}
              {contactInfo?.socialLinks && (contactInfo.socialLinks as any)?.instagram && (
                <a
                  href={(contactInfo.socialLinks as any).instagram}
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-300">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <p>&copy; 2024 {appearance.brandName || "Sistema Modular"}. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link
                href="/aviso-privacidad"
                className="text-gray-300 hover:text-white transition-colors underline"
              >
                Aviso de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
