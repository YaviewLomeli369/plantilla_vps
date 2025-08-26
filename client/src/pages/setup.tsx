import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Shield, Crown, Settings, Users, ArrowRight } from "lucide-react";

export default function Setup() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Configura las cuentas administrativas del sistema modular.
            Crea superusuarios, administradores y staff según tus necesidades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle className="text-purple-900">Crear Superusuario</CardTitle>
                  <CardDescription>
                    Acceso total al sistema, puede gestionar todo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Gestión completa de usuarios</li>
                <li>• Control total de módulos</li>
                <li>• Configuración del sistema</li>
                <li>• Acceso a todas las funciones</li>
              </ul>
              <Button 
                onClick={() => setLocation('/create-admin')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Crear Superusuario
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-blue-900">Crear Administrador</CardTitle>
                  <CardDescription>
                    Gestión administrativa del contenido
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Gestión de contenido</li>
                <li>• Administración de usuarios clientes</li>
                <li>• Control de módulos activos</li>
                <li>• Reportes y estadísticas</li>
              </ul>
              <Button 
                onClick={() => setLocation('/create-admin')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Crear Administrador
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-green-900">Crear Staff</CardTitle>
                  <CardDescription>
                    Acceso limitado para colaboradores
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Gestión básica de contenido</li>
                <li>• Edición de testimonios y FAQs</li>
                <li>• Manejo de mensajes de contacto</li>
                <li>• Sin acceso a configuración</li>
              </ul>
              <Button 
                onClick={() => setLocation('/create-admin')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Crear Staff
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-gray-600" />
                <div>
                  <CardTitle className="text-gray-900">Registro de Clientes</CardTitle>
                  <CardDescription>
                    Acceso público para usuarios finales
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Registro público disponible</li>
                <li>• Acceso a funciones de cliente</li>
                <li>• Compras y reservaciones</li>
                <li>• Perfil básico de usuario</li>
              </ul>
              <Button 
                onClick={() => setLocation('/register')}
                variant="outline"
                className="w-full"
              >
                Ir al Registro de Clientes
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-3">Pasos para configurar el sistema:</h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">1</span>
              <span>Crea al menos un <strong>superusuario</strong> para tener acceso completo al sistema</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">2</span>
              <span>Opcionalmente crea <strong>administradores</strong> para delegar la gestión de contenido</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">3</span>
              <span>Inicia sesión con una cuenta administrativa para acceder al panel de control</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">4</span>
              <span>Configura los módulos y el contenido desde el <strong>panel de administración</strong></span>
            </li>
          </ol>
        </div>

        <div className="text-center mt-6">
          <Button 
            onClick={() => setLocation('/')}
            variant="ghost"
          >
            ← Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}