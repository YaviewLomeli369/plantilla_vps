import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  Palette, 
  Move, 
  Maximize, 
  Image as ImageIcon,
  X,
  Check
} from "lucide-react";
import type { EditableElement } from "@/hooks/use-inline-editor";

interface ElementEditorProps {
  element: EditableElement;
  isVisible: boolean;
  onUpdate: (elementId: string, value: string, property?: string) => void;
  onClose: () => void;
}

export function ElementEditor({ element, isVisible, onUpdate, onClose }: ElementEditorProps) {
  const [textValue, setTextValue] = useState(element.currentValue);
  const [colorValue, setColorValue] = useState('#000000');
  const [bgColorValue, setBgColorValue] = useState('#ffffff');
  const [fontSize, setFontSize] = useState([16]);
  const [margin, setMargin] = useState([0]);
  const [padding, setPadding] = useState([0]);
  const [imageUrl, setImageUrl] = useState(element.currentValue);

  useEffect(() => {
    setTextValue(element.currentValue);
    setImageUrl(element.currentValue);
  }, [element.currentValue]);

  if (!isVisible) return null;

  const handleTextChange = () => {
    onUpdate(element.id, textValue);
  };

  const handleColorChange = (color: string, property: 'color' | 'background') => {
    onUpdate(element.id, color, property);
  };

  const handleSizeChange = (size: number[]) => {
    onUpdate(element.id, `${size[0]}px`, 'fontSize');
  };

  const handleSpacingChange = (value: number[], property: 'margin' | 'padding') => {
    onUpdate(element.id, `${value[0]}px`, property);
  };

  const handleImageChange = () => {
    onUpdate(element.id, imageUrl);
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="shadow-2xl border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              {element.type === 'text' && <Type className="w-5 h-5" />}
              {element.type === 'image' && <ImageIcon className="w-5 h-5" />}
              {element.type === 'color' && <Palette className="w-5 h-5" />}
              {element.type === 'size' && <Maximize className="w-5 h-5" />}
              {element.type === 'spacing' && <Move className="w-5 h-5" />}
              <span>Editar {element.label}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit">
            {element.type}
          </Badge>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="style">Estilo</TabsTrigger>
              <TabsTrigger value="spacing">Espaciado</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {element.type === 'text' && (
                <div className="space-y-3">
                  <Label htmlFor="text-content">Texto</Label>
                  <Textarea
                    id="text-content"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Ingresa el texto..."
                    rows={4}
                  />
                  <Button onClick={handleTextChange} className="w-full">
                    <Check className="w-4 h-4 mr-2" />
                    Aplicar Texto
                  </Button>
                </div>
              )}

              {element.type === 'image' && (
                <div className="space-y-3">
                  <Label htmlFor="image-url">URL de la Imagen</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <Button onClick={handleImageChange} className="w-full">
                    <Check className="w-4 h-4 mr-2" />
                    Aplicar Imagen
                  </Button>
                  
                  {imageUrl && (
                    <div className="mt-3">
                      <Label>Vista Previa</Label>
                      <div className="mt-2 p-2 border rounded-lg">
                        <img 
                          src={imageUrl} 
                          alt="Vista previa" 
                          className="max-w-full h-32 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-color">Color del Texto</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={colorValue}
                      onChange={(e) => setColorValue(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleColorChange(colorValue, 'color')}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bg-color">Color de Fondo</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColorValue}
                      onChange={(e) => setBgColorValue(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleColorChange(bgColorValue, 'background')}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Tamaño de Fuente: {fontSize[0]}px</Label>
                  <Slider
                    value={fontSize}
                    onValueChange={(value) => {
                      setFontSize(value);
                      handleSizeChange(value);
                    }}
                    max={72}
                    min={8}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Margen Exterior: {margin[0]}px</Label>
                  <Slider
                    value={margin}
                    onValueChange={(value) => {
                      setMargin(value);
                      handleSpacingChange(value, 'margin');
                    }}
                    max={100}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Espaciado Interno: {padding[0]}px</Label>
                  <Slider
                    value={padding}
                    onValueChange={(value) => {
                      setPadding(value);
                      handleSpacingChange(value, 'padding');
                    }}
                    max={100}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}