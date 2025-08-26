import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ModuleCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  stats?: Record<string, string | number>;
  onToggle: (active: boolean) => void;
  onManage?: () => void;
  isRequired?: boolean;
}

export function ModuleCard({
  name,
  description,
  icon: Icon,
  isActive,
  stats = {},
  onToggle,
  onManage,
  isRequired = false,
}: ModuleCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!isActive ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isActive ? "bg-success/10" : "bg-gray-100"
          }`}>
            <Icon className={`${isActive ? "text-success" : "text-gray-400"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {isRequired ? (
          <span className="px-2 py-1 text-xs bg-success/10 text-success rounded-full font-medium">
            Obligatorio
          </span>
        ) : (
          <Switch checked={isActive} onCheckedChange={onToggle} />
        )}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span>{key}:</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span>Estado:</span>
          <span className={`font-medium ${isActive ? "text-success" : "text-gray-400"}`}>
            {isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>
      
      {onManage && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onManage}
          >
            {isActive ? `Gestionar ${name}` : `Activar ${name}`}
          </Button>
        </div>
      )}
    </div>
  );
}
