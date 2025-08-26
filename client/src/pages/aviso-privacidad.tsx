import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedSection from "@/components/AnimatedSection";
import type { ContactInfo } from "@shared/schema";

export default function AvisoPrivacidad() {
  const { data: config } = useQuery({
    queryKey: ["/api/config"],
  });

  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact/info"],
  });

  const configData = config?.config as any;
  const appearance = configData?.appearance || {};
  const companyName = appearance?.brandName || "La Empresa";
  const contactEmail = contactInfo?.email || "contacto@empresa.com";
  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-primary mb-4">
                  Aviso de Privacidad
                </CardTitle>
                <p className="text-muted-foreground text-lg">
                  Protección de Datos Personales
                </p>
              </CardHeader>
              
              <CardContent className="prose prose-lg max-w-none space-y-6">
                <div className="space-y-4 text-foreground">
                  <p>
                    En <strong>{companyName}</strong> respetamos y protegemos los datos personales de nuestros usuarios conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
                  </p>

                  <p>
                    Los datos recabados en este sitio web serán utilizados únicamente para los fines establecidos, tales como contacto, envío de información, prestación de servicios y/o atención al cliente.
                  </p>

                  <p>
                    Nos comprometemos a no compartir sus datos personales con terceros sin su consentimiento expreso, salvo en los casos que lo permita la ley.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                    <h3 className="font-semibold text-lg mb-2">Derechos ARCO</h3>
                    <p>
                      El titular de los datos puede en cualquier momento ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) enviando una solicitud al correo electrónico: <strong>{contactEmail}</strong>
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Tipos de Datos Recolectados</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Datos de identificación (nombre, apellidos)</li>
                      <li>Datos de contacto (correo electrónico, teléfono)</li>
                      <li>Datos de navegación (cookies, direcciones IP)</li>
                      <li>Datos comerciales (historial de compras, preferencias)</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Finalidades del Tratamiento</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Brindar atención al cliente y soporte técnico</li>
                      <li>Procesar pedidos y transacciones comerciales</li>
                      <li>Enviar información promocional y newsletters</li>
                      <li>Mejorar nuestros servicios y experiencia del usuario</li>
                      <li>Cumplir con obligaciones legales y regulatorias</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Transferencias de Datos</h3>
                    <p>
                      Sus datos personales podrán ser compartidos con:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Proveedores de servicios de pago (Stripe, PayPal)</li>
                      <li>Servicios de mensajería y logística</li>
                      <li>Proveedores de servicios en la nube</li>
                      <li>Autoridades competentes cuando sea requerido por ley</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Medidas de Seguridad</h3>
                    <p>
                      Implementamos medidas de seguridad técnicas, físicas y administrativas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado.
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground border-t pt-4">
                    <strong>Modificaciones:</strong> Cualquier modificación a este aviso de privacidad será publicada en este mismo sitio web.
                  </p>

                  <p className="text-sm text-muted-foreground">
                    <strong>Última actualización:</strong> {currentDate}
                  </p>

                  <div className="text-center pt-6">
                    <p className="text-sm text-muted-foreground">
                      Para cualquier duda o consulta sobre este Aviso de Privacidad, contáctanos en:{" "}
                      <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
                        {contactEmail}
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}