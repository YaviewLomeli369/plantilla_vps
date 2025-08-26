import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  Save, 
  X, 
  RotateCcw, 
  Eye,
  Settings,
  Palette,
  Type,
  Image as ImageIcon,
  Move,
  Maximize
} from "lucide-react";

interface EditingToolbarProps {
  isEditMode: boolean;
  isLoading: boolean;
  onToggleEditMode: () => void;
  onSave: () => void;
  onReset: () => void;
  editableElementsCount: number;
}

export function EditingToolbar({
  isEditMode,
  isLoading,
  onToggleEditMode,
  onSave,
  onReset,
  editableElementsCount
}: EditingToolbarProps) {
  if (!isEditMode) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggleEditMode}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg h-12 px-6 rounded-full"
          size="lg"
        >
          <Edit3 className="w-5 h-5 mr-2" />
          Modo Edición
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="shadow-2xl border-2 border-primary/20 min-w-[300px]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Eye className="w-3 h-3 mr-1" />
                Modo Edición Activo
              </Badge>
              <Badge variant="outline">
                {editableElementsCount} elementos
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleEditMode}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-3">
              Haz clic en cualquier elemento editable para modificarlo
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Type className="w-3 h-3" />
                <span>Texto</span>
              </div>
              <div className="flex items-center space-x-1">
                <ImageIcon className="w-3 h-3" />
                <span>Imágenes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Colores</span>
              </div>
              <div className="flex items-center space-x-1">
                <Maximize className="w-3 h-3" />
                <span>Tamaños</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-3 border-t">
              <Button
                onClick={onSave}
                disabled={isLoading}
                className="flex-1"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
              
              <Button
                variant="outline"
                onClick={onReset}
                disabled={isLoading}
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}