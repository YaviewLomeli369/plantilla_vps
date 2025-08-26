import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Type, 
  Image, 
  Smartphone,
  Monitor,
  Tablet,
  Save
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminAppearance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const [appearance, setAppearance] = useState({
    // Colores
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981", 
    accentColor: "#F59E0B",
    backgroundColor: "#FFFFFF",
    textColor: "#111827",
    linkColor: "#3B82F6",
    
    // Tipografía
    fontFamily: "Inter",
    fontSize: "16",
    lineHeight: "1.6",
    headingFont: "Inter",
    
    // Layout
    containerWidth: "1200",
    headerHeight: "80",
    footerStyle: "standard",
    
    // Logo y branding
    logoUrl: "",
    faviconUrl: "",
    brandName: "Mi Sitio Web",
    tagline: "Tu eslogan aquí",
    
    // SEO
    metaTitle: "Mi Sitio Web",
    metaDescription: "Descripción de mi sitio web",
    ogImage: "",
    
    // Responsive
    mobileBreakpoint: "768",
    tabletBreakpoint: "1024"
  });

  // Cargar configuración existente
  useEffect(() => {
    if (config?.config && typeof config.config === 'object') {
      const configData = config.config as any;
      if (configData.appearance) {
        setAppearance(prev => ({
          ...prev,
          primaryColor: configData.appearance.primaryColor || prev.primaryColor,
          secondaryColor: configData.appearance.secondaryColor || prev.secondaryColor,
          accentColor: configData.appearance.accentColor || prev.accentColor,
          backgroundColor: configData.appearance.backgroundColor || prev.backgroundColor,
          textColor: configData.appearance.textColor || prev.textColor,
          linkColor: configData.appearance.linkColor || prev.linkColor,
          fontFamily: configData.appearance.fontFamily || prev.fontFamily,
          fontSize: configData.appearance.fontSize || prev.fontSize,
          lineHeight: configData.appearance.lineHeight || prev.lineHeight,
          headingFont: configData.appearance.headingFont || prev.headingFont,
          containerWidth: configData.appearance.containerWidth || prev.containerWidth,
          headerHeight: configData.appearance.headerHeight || prev.headerHeight,
          footerStyle: configData.appearance.footerStyle || prev.footerStyle,
          logoUrl: configData.appearance.logoUrl || prev.logoUrl,
          faviconUrl: configData.appearance.faviconUrl || prev.faviconUrl,
          brandName: configData.appearance.brandName || prev.brandName,
          tagline: configData.appearance.tagline || prev.tagline,
          metaTitle: configData.appearance.metaTitle || prev.metaTitle,
          metaDescription: configData.appearance.metaDescription || prev.metaDescription,
          ogImage: configData.appearance.ogImage || prev.ogImage,
          mobileBreakpoint: configData.appearance.mobileBreakpoint || prev.mobileBreakpoint,
          tabletBreakpoint: configData.appearance.tabletBreakpoint || prev.tabletBreakpoint,
        }));
      }
    }
  }, [config]);

  const saveAppearanceMutation = useMutation({
    mutationFn: async (appearanceData: typeof appearance) => {
      const currentConfig = config?.config || {};
      
      const updatedConfig = {
        ...currentConfig,
        appearance: appearanceData
      };

      return await apiRequest("/api/config", {
        method: "PUT",
        body: JSON.stringify({ config: updatedConfig }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Apariencia actualizada correctamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo actualizar la apariencia"
      });
    },
  });

  const handleSave = () => {
    saveAppearanceMutation.mutate(appearance);
  };

  const handleReset = () => {
    setAppearance({
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981", 
      accentColor: "#F59E0B",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
      linkColor: "#3B82F6",
      fontFamily: "Inter",
      fontSize: "16",
      lineHeight: "1.6",
      headingFont: "Inter",
      containerWidth: "1200",
      headerHeight: "80",
      footerStyle: "standard",
      logoUrl: "",
      faviconUrl: "",
      brandName: "Mi Sitio Web",
      tagline: "Tu eslogan aquí",
      metaTitle: "Mi Sitio Web",
      metaDescription: "Descripción de mi sitio web",
      ogImage: "",
      mobileBreakpoint: "768",
      tabletBreakpoint: "1024"
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Apariencia</h1>
            <p className="text-gray-600 mt-1">Personaliza el diseño y estilo del sitio web</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleReset}>
              Restablecer
            </Button>
            <Button onClick={handleSave} disabled={saveAppearanceMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveAppearanceMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* Appearance Tabs */}
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colores
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Tipografía
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Marca
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Esquema de Colores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color Primario</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={appearance.secondaryColor}
                        onChange={(e) => setAppearance({...appearance, secondaryColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.secondaryColor}
                        onChange={(e) => setAppearance({...appearance, secondaryColor: e.target.value})}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Color de Acento</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="accentColor"
                        type="color"
                        value={appearance.accentColor}
                        onChange={(e) => setAppearance({...appearance, accentColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.accentColor}
                        onChange={(e) => setAppearance({...appearance, accentColor: e.target.value})}
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Color de Fondo</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={appearance.backgroundColor}
                        onChange={(e) => setAppearance({...appearance, backgroundColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.backgroundColor}
                        onChange={(e) => setAppearance({...appearance, backgroundColor: e.target.value})}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textColor">Color de Texto</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="textColor"
                        type="color"
                        value={appearance.textColor}
                        onChange={(e) => setAppearance({...appearance, textColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.textColor}
                        onChange={(e) => setAppearance({...appearance, textColor: e.target.value})}
                        placeholder="#111827"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkColor">Color de Enlaces</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="linkColor"
                        type="color"
                        value={appearance.linkColor}
                        onChange={(e) => setAppearance({...appearance, linkColor: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearance.linkColor}
                        onChange={(e) => setAppearance({...appearance, linkColor: e.target.value})}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
                  <div 
                    className="p-6 rounded-lg border-2"
                    style={{
                      backgroundColor: appearance.backgroundColor,
                      color: appearance.textColor,
                      borderColor: appearance.primaryColor
                    }}
                  >
                    <h4 
                      className="text-xl font-bold mb-2"
                      style={{ color: appearance.primaryColor }}
                    >
                      Título Principal
                    </h4>
                    <p className="mb-3">
                      Este es un párrafo de ejemplo para mostrar cómo se ve el texto normal.
                    </p>
                    <a 
                      href="#" 
                      className="underline"
                      style={{ color: appearance.linkColor }}
                    >
                      Este es un enlace de ejemplo
                    </a>
                    <div className="mt-4 flex space-x-2">
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: appearance.primaryColor }}
                        title="Primario"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: appearance.secondaryColor }}
                        title="Secundario"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: appearance.accentColor }}
                        title="Acento"
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Tipografía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Fuente Principal</Label>
                    <select
                      id="fontFamily"
                      value={appearance.fontFamily}
                      onChange={(e) => setAppearance({...appearance, fontFamily: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headingFont">Fuente de Títulos</Label>
                    <select
                      id="headingFont"
                      value={appearance.headingFont}
                      onChange={(e) => setAppearance({...appearance, headingFont: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Tamaño de Fuente Base (px)</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={appearance.fontSize}
                      onChange={(e) => setAppearance({...appearance, fontSize: e.target.value})}
                      min="12"
                      max="24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lineHeight">Altura de Línea</Label>
                    <Input
                      id="lineHeight"
                      value={appearance.lineHeight}
                      onChange={(e) => setAppearance({...appearance, lineHeight: e.target.value})}
                      placeholder="1.6"
                    />
                  </div>
                </div>

                {/* Typography Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa Tipográfica</h3>
                  <div 
                    style={{
                      fontFamily: appearance.fontFamily,
                      fontSize: `${appearance.fontSize}px`,
                      lineHeight: appearance.lineHeight
                    }}
                  >
                    <h1 
                      className="text-4xl font-bold mb-3"
                      style={{ fontFamily: appearance.headingFont }}
                    >
                      Título Principal H1
                    </h1>
                    <h2 
                      className="text-2xl font-semibold mb-3"
                      style={{ fontFamily: appearance.headingFont }}
                    >
                      Subtítulo H2
                    </h2>
                    <p className="mb-3">
                      Este es un párrafo de ejemplo que muestra cómo se verá el texto normal 
                      con la fuente, tamaño y espaciado seleccionados. Lorem ipsum dolor sit amet, 
                      consectetur adipiscing elit.
                    </p>
                    <p className="text-sm text-gray-600">
                      Texto pequeño para notas y descripciones adicionales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Layout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="containerWidth">Ancho del Contenedor (px)</Label>
                    <Input
                      id="containerWidth"
                      type="number"
                      value={appearance.containerWidth}
                      onChange={(e) => setAppearance({...appearance, containerWidth: e.target.value})}
                      min="800"
                      max="1600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headerHeight">Altura del Header (px)</Label>
                    <Input
                      id="headerHeight"
                      type="number"
                      value={appearance.headerHeight}
                      onChange={(e) => setAppearance({...appearance, headerHeight: e.target.value})}
                      min="60"
                      max="120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footerStyle">Estilo del Footer</Label>
                    <select
                      id="footerStyle"
                      value={appearance.footerStyle}
                      onChange={(e) => setAppearance({...appearance, footerStyle: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="standard">Estándar</option>
                      <option value="minimal">Minimalista</option>
                      <option value="extended">Extendido</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileBreakpoint">Breakpoint Móvil (px)</Label>
                    <Input
                      id="mobileBreakpoint"
                      type="number"
                      value={appearance.mobileBreakpoint}
                      onChange={(e) => setAppearance({...appearance, mobileBreakpoint: e.target.value})}
                      placeholder="768"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tabletBreakpoint">Breakpoint Tablet (px)</Label>
                    <Input
                      id="tabletBreakpoint"
                      type="number"
                      value={appearance.tabletBreakpoint}
                      onChange={(e) => setAppearance({...appearance, tabletBreakpoint: e.target.value})}
                      placeholder="1024"
                    />
                  </div>
                </div>

                {/* Responsive Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa Responsive</h3>
                  <div className="flex space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">Móvil: {appearance.mobileBreakpoint}px</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tablet className="h-4 w-4" />
                      <span className="text-sm">Tablet: {appearance.tabletBreakpoint}px</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm">Desktop: {appearance.containerWidth}px</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded p-4">
                    <div 
                      className="bg-white border rounded mx-auto"
                      style={{ 
                        maxWidth: `${appearance.containerWidth}px`,
                        height: `${appearance.headerHeight}px`
                      }}
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="text-sm text-gray-500">Header Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de Marca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Nombre de la Marca</Label>
                    <Input
                      id="brandName"
                      value={appearance.brandName}
                      onChange={(e) => setAppearance({...appearance, brandName: e.target.value})}
                      placeholder="Mi Sitio Web"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Eslogan</Label>
                    <Input
                      id="tagline"
                      value={appearance.tagline}
                      onChange={(e) => setAppearance({...appearance, tagline: e.target.value})}
                      placeholder="Tu eslogan aquí"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">URL del Logo</Label>
                    <Input
                      id="logoUrl"
                      value={appearance.logoUrl}
                      onChange={(e) => setAppearance({...appearance, logoUrl: e.target.value})}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">URL del Favicon</Label>
                    <Input
                      id="faviconUrl"
                      value={appearance.faviconUrl}
                      onChange={(e) => setAppearance({...appearance, faviconUrl: e.target.value})}
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Título Meta</Label>
                    <Input
                      id="metaTitle"
                      value={appearance.metaTitle}
                      onChange={(e) => setAppearance({...appearance, metaTitle: e.target.value})}
                      placeholder="Mi Sitio Web"
                      maxLength={60}
                    />
                    <p className="text-sm text-gray-500">
                      {appearance.metaTitle.length}/60 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Descripción</Label>
                    <Textarea
                      id="metaDescription"
                      value={appearance.metaDescription}
                      onChange={(e) => setAppearance({...appearance, metaDescription: e.target.value})}
                      placeholder="Descripción de mi sitio web"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-gray-500">
                      {appearance.metaDescription.length}/160 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogImage">Imagen Open Graph</Label>
                    <Input
                      id="ogImage"
                      value={appearance.ogImage}
                      onChange={(e) => setAppearance({...appearance, ogImage: e.target.value})}
                      placeholder="https://example.com/og-image.jpg"
                    />
                    <p className="text-sm text-gray-500">
                      Imagen que aparece cuando compartes el sitio en redes sociales (1200x630px recomendado)
                    </p>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa en Buscadores</h3>
                  <div className="bg-white border rounded p-4">
                    <h4 className="text-lg text-blue-600 hover:underline cursor-pointer">
                      {appearance.metaTitle || "Mi Sitio Web"}
                    </h4>
                    <p className="text-green-600 text-sm">
                      https://mi-sitio.com
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {appearance.metaDescription || "Descripción de mi sitio web"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}