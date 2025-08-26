import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ModuleCard } from "@/components/admin/module-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart,
  Quote,
  HelpCircle,
  Layout,
  Calendar,
  Mail,
  Puzzle,
  Download,
  Upload
} from "lucide-react";
import type { SiteConfig } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminModules() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const modules = config?.config?.frontpage?.modulos || {};

  const handleModuleToggle = async (moduleKey: string, active: boolean) => {
    if (!config) return;

    try {
      const updatedConfig = {
        ...config.config,
        frontpage: {
          ...config.config.frontpage,
          modulos: {
            ...modules,
            [moduleKey]: {
              ...modules[moduleKey],
              activo: active,
            },
          },
        },
      };

      await fetch("/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ config: updatedConfig }),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      
      toast({
        title: "Módulo actualizado",
        description: `El módulo ha sido ${active ? "activado" : "desactivado"} correctamente`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el módulo",
      });
    }
  };

  const exportConfig = () => {
    if (!config) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config.config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "site-config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Módulos</h1>
            <p className="text-gray-600 mt-1">Activa o desactiva módulos según las necesidades de tu negocio</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={exportConfig}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Configuración
            </Button>
            <Button variant="outline" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                
                try {
                  const text = await file.text();
                  const importedConfig = JSON.parse(text);
                  
                  await fetch("/api/config", {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    body: JSON.stringify({ config: importedConfig }),
                  });
                  
                  queryClient.invalidateQueries({ queryKey: ["/api/config"] });
                  toast({
                    title: "Configuración importada",
                    description: "La configuración se ha importado correctamente",
                  });
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo importar la configuración",
                  });
                }
              };
              input.click();
            }}>
              <Upload className="mr-2 h-4 w-4" />
              Importar Configuración
            </Button>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <ModuleCard
            name="Página Principal"
            description="Secciones dinámicas del homepage"
            icon={Layout}
            isActive={modules.landing?.activo !== false}
            stats={{
              "Secciones activas": "8",
              "Hero": "Configurado",
            }}
            onToggle={(active) => handleModuleToggle("landing", active)}
            isRequired={true}
          />

          <ModuleCard
            name="Tienda"
            description="E-commerce completo con productos y órdenes"
            icon={ShoppingCart}
            isActive={modules.tienda?.activo || false}
            stats={{
              "Productos": "127",
              "Órdenes del mes": "89",
              "Categorías": "12",
            }}
            onToggle={(active) => handleModuleToggle("tienda", active)}
          />

          <ModuleCard
            name="Testimonios"
            description="Reseñas y comentarios de clientes"
            icon={Quote}
            isActive={modules.testimonios?.activo || false}
            stats={{
              "Pendientes": "7",
              "Publicados": "45",
              "Destacados": "3",
            }}
            onToggle={(active) => handleModuleToggle("testimonios", active)}
          />

          <ModuleCard
            name="FAQs"
            description="Preguntas frecuentes organizadas"
            icon={HelpCircle}
            isActive={modules.faqs?.activo || false}
            stats={{
              "Preguntas": "23",
              "Categorías": "5",
              "Vistas totales": "1,230",
            }}
            onToggle={(active) => handleModuleToggle("faqs", active)}
          />

          <ModuleCard
            name="Contacto"
            description="Formulario y gestión de mensajes"
            icon={Mail}
            isActive={modules.contacto?.activo || false}
            stats={{
              "Nuevos mensajes": "3",
              "Total mensajes": "127",
              "Sin leer": "5",
            }}
            onToggle={(active) => handleModuleToggle("contacto", active)}
          />

          <ModuleCard
            name="Reservas"
            description="Sistema de citas y horarios"
            icon={Calendar}
            isActive={modules.reservas?.activo || false}
            stats={{
              "Reservas pendientes": "12",
              "Horarios disponibles": "48",
            }}
            onToggle={(active) => handleModuleToggle("reservas", active)}
          />

          <ModuleCard
            name="Blog"
            description="Sistema de publicación de artículos"
            icon={Layout}
            isActive={modules.blog?.activo || false}
            stats={{
              "Artículos": "0",
              "Categorías": "0",
            }}
            onToggle={(active) => handleModuleToggle("blog", active)}
          />
        </div>

        {/* Configuration Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5" />
              Configuración Detallada de Módulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(modules).map(([key, module]: [string, any]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 capitalize">{key.replace('_', ' ')}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      module.activo ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {module.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <pre className="text-sm text-gray-600 overflow-x-auto">
                      {JSON.stringify(module, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Dependencies */}
        <Card>
          <CardHeader>
            <CardTitle>Dependencias y Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Módulos Básicos (Recomendados)</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Layout className="h-4 w-4 text-primary" />
                    Página Principal - Siempre activo
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-success" />
                    Contacto - Recomendado para comunicación
                  </li>
                  <li className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    FAQs - Reduce consultas de soporte
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Módulos de Negocio</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-warning" />
                    Tienda - Para e-commerce
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-secondary" />
                    Reservas - Para servicios con citas
                  </li>
                  <li className="flex items-center gap-2">
                    <Quote className="h-4 w-4 text-primary" />
                    Testimonios - Aumenta credibilidad
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
