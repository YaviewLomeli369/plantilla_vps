import { Spinner } from "@/components/ui/spinner";

export function LoadingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" className="text-primary" />
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Cargando...</h2>
          <p className="text-sm text-muted-foreground">
            Por favor espere mientras cargamos la página.
          </p>
        </div>
      </div>
    </div>
  );
}