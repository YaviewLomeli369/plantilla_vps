import React from "react";

interface LoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ message = "Cargando...", size = "md", className = "" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
}

export function PageLoader({ message = "Cargando contenido..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader message={message} size="lg" />
    </div>
  );
}