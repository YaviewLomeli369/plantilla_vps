import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "positive", 
  icon: Icon, 
  iconColor = "text-primary" 
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center`}>
          <Icon className={`${iconColor}`} />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium ${changeType === "positive" ? "text-success" : "text-error"}`}>
            {change}
          </span>
          <span className="text-gray-600 ml-1">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
