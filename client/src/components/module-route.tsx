import { useQuery } from "@tanstack/react-query";
import { Route } from "wouter";
import type { SiteConfig } from "@shared/schema";
import NotFound from "@/pages/not-found";
import { LoadingPage } from "./loading-page";

interface ModuleRouteProps {
  path: string;
  component: any;
  moduleKey: string;
}

export function ModuleRoute({ path, component: Component, moduleKey }: ModuleRouteProps) {
  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000, // 5 minutes - same as Router
  });

  const configData = config?.config as any;
  const modules = configData?.frontpage?.modulos || {};
  const isModuleActive = modules[moduleKey]?.activo;

  // Show loading while config is being fetched
  if (isLoading) {
    return <Route path={path} component={LoadingPage} />;
  }

  return (
    <Route 
      path={path} 
      component={isModuleActive ? Component : NotFound}
    />
  );
}